const {Schedule} = require('../models/schedule')
const {User} = require('../models/user')
const {
    ctrlWrapper,
    DAY_NAMES,
    HttpError,
    WORKING_DAY_TYPES,
    calculateTotalMinutes,
    calculateTotalEarnings
} = require("../helpers");
const mongoose = require('mongoose')

const getAllSchedules = async (req, res) => {
    const schedules = await Schedule.find({}).populate("schedules.user", "hourlyRate name surname avatar");

    // Якщо немає розкладів, повертаємо відповідь з повідомленням
    if (schedules.length === 0) {
        return res.status(404).json({message: "No schedules found"});
    }

    // Якщо розклади знайдені, повертаємо їх
    res.status(200).json(schedules);
}
const getAllSchedules_ = async (req, res) => {
    try {
        // Отримуємо всі розклади з бази даних
        const schedules = await Schedule.find({}).populate(
            "schedules.user",
            "hourlyRate name surname"
        );

        // Якщо немає розкладів, повертаємо повідомлення
        if (schedules.length === 0) {
            return res.status(404).json({ message: "No schedules found" });
        }

        // Групуємо розклади за тижнями
        const weeks = schedules.reduce((acc, schedule) => {
            // Знаходимо початок і кінець тижня
            const scheduleDate = new Date(schedule.date); // Перетворюємо на дату
            const startOfWeek = new Date(scheduleDate);
            startOfWeek.setDate(scheduleDate.getDate() - scheduleDate.getDay()); // Початок тижня (неділя)
            startOfWeek.setHours(0, 0, 0, 0); // Скидаємо час

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6); // Кінець тижня (субота)
            endOfWeek.setHours(23, 59, 59, 999); // Останній момент суботи

            // Створюємо ключ для групування
            const weekKey = `${startOfWeek.toISOString()}_${endOfWeek.toISOString()}`;

            // Якщо такого тижня ще немає, додаємо його
            if (!acc[weekKey]) {
                acc[weekKey] = {
                    dateFrom: startOfWeek,
                    dateTo: endOfWeek,
                };
            }

            return acc;
        }, {});

        // Перетворюємо об'єкт груп у масив
        const result = Object.values(weeks);

        // Повертаємо результат
        res.status(200).json(result);
    } catch (error) {
        // Обробка помилок
        res.status(500).json({ message: "Server error", error: error.message });
    }
};


const createSchedule = async (req, res, next) => {
    const {date, surchargePerHour, dayType} = req.body;
    const dayName = DAY_NAMES[new Date(date).getDay()];
    const session = await mongoose.startSession(); // Створюємо сесію
    try {
        session.startTransaction();
        // Отримуємо всіх користувачів
        const users = await User.find({}, '-isVerified -password ', {session});

        // Створюємо масив користувачів з розширеними даними
        const enrichedUsers = users.map(item => ({
            user: item._id,
            isWorking: false,
            workStartTime: "00:00",
            workEndTime: "00:00",
            hourlyRate: surchargePerHour + item.hourlyRate,
            totalMinutes: 0,
            totalEarnings: 0,
            personalSurchargePerHour: 0,
        }));

        // Створюємо новий розклад
        const schedule = await Schedule.create([{
            dayName,
            date,
            surchargePerHour,
            dayType,
            schedules: enrichedUsers
        }], {session});


        await Promise.all(
            users.map((user) =>
                User.updateOne(
                    {_id: user._id},
                    {$push: {schedules: schedule[0]._id}},
                    {session}
                )
            )
        );

        // Фіксуємо транзакцію
        await session.commitTransaction();

        // Завершуємо сесію
        session.endSession();
        const populatedSchedule = await Schedule.findById(schedule[0]._id)
            .populate({
                path: "schedules.user",
                select: "_id avatar name surname", // Тільки потрібні поля
            })
            .exec();

        // Відправляємо відповідь
        res.status(201).json(populatedSchedule);

    } catch (error) {
        // Якщо помилка - скасовуємо транзакцію
        await session.abortTransaction();
        session.endSession(); // Завершуємо сесію

        // Відправляємо помилку
        console.error("Error in transaction:", error);
        throw HttpError(500, error.message);
    }
};

const createSchedule_v_2 = async (req, res) => {
    const { date, surchargePerHour, dayType, schedules } = req.body;
    const dayName = DAY_NAMES[new Date(date).getDay()];
    const session = await mongoose.startSession();

    try {
        session.startTransaction();

        // Обчислення totalMinutes та totalEarnings для кожного запису в schedules
        const updatedSchedules = schedules.map((item) => {
            if (item.isWorking) {
                const start = item.workStartTime.split(':');
                const end = item.workEndTime.split(':');

                // Розрахунок хвилин
                const startMinutes = parseInt(start[0], 10) * 60 + parseInt(start[1], 10);
                const endMinutes = parseInt(end[0], 10) * 60 + parseInt(end[1], 10);
                const totalMinutes = endMinutes - startMinutes;

                // Розрахунок заробітку
                const totalEarnings = (totalMinutes / 60) * item.hourlyRate;

                return {
                    ...item,
                    totalMinutes: Math.max(totalMinutes, 0), // Уникаємо від'ємного часу
                    totalEarnings: Math.max(totalEarnings, 0), // Уникаємо від'ємного заробітку
                };
            }

            // Якщо isWorking = false, залишаємо початкові значення
            return {
                ...item,
                totalMinutes: 0,
                totalEarnings: 0,
            };
        });

        // Створення розкладу
        const [schedule] = await Schedule.create(
            [
                {
                    dayName,
                    date,
                    surchargePerHour,
                    dayType,
                    schedules: updatedSchedules,
                },
            ],
            { session }
        );

        // Попереднє завантаження користувачів у schedules
        const populatedScheduleWithUsers = await Schedule.findById(schedule._id)
            .populate("schedules.user", "name surname avatar email") // Завантажуємо дані користувачів
            .session(session);

        // Оновлення користувачів, додаємо schedule._id
        const usersId = populatedScheduleWithUsers.schedules.map((item) => item.user._id);
        await Promise.all(
            usersId.map((userId) =>
                User.updateOne(
                    { _id: userId },
                    { $push: { schedules: schedule._id } },
                    { session }
                )
            )
        );

        // Завершення транзакції
        await session.commitTransaction();
        session.endSession();

        // Повертаємо результат
        res.status(201).json(populatedScheduleWithUsers);
    } catch (error) {
        // Відкат транзакції у разі помилки
        await session.abortTransaction();
        session.endSession();

        // Відправляємо помилку
        console.error("Error in transaction:", error);
        res.status(500).json({ message: error.message });
    }
};


const updateSchedule = async (req, res) => {

}


const deleteSchedule = async (req, res) => {

}

const findScheduleByDate = async (req, res) => {
    const {date} = req.params;

    // Перевірка, чи дата є валідною
    if (!date || isNaN(Date.parse(date))) {
        return res.status(400).json({error: "Invalid or missing date parameter"});
    }

    const parsedDate = new Date(date).toISOString().split("T")[0];

    // Знаходимо розклад за датою
    const schedule = await Schedule.find({date: parsedDate}).populate("schedules.user", "hourlyRate name surname");

    if (!schedule.length) {
        return res.status(404).json({message: "No schedule found for the specified date"});
    }

    res.status(200).json(schedule[0]);
}

const findBetweenDates = async (req, res) => {
    const {from, to} = req.params
    const fromDate = new Date(from);
    const toDate = new Date(to);

    if (!from || !to) {
        return res.status(400).json({error: 'Both from and to dates are required'});
    }

    if (isNaN(fromDate) || isNaN(toDate)) {
        return res.status(400).json({error: 'Invalid date format'});
    }

    const schedule = await Schedule.find({
        date: {$gte: fromDate, $lte: toDate} // Знаходимо записи між цими датами
    }).populate("schedules.user", "hourlyRate name surname");

    if (!schedule) {
        return res.status(404).json({error: 'No schedules found for the given date range'});
    }

    res.json(schedule)
}

const getUserByScheduleIdAndUserId = async (req, res) => {
    const {scheduleId, userId} = req.params
    const schedule = await Schedule.findById(scheduleId)
        .populate("schedules.user", "hourlyRate name surname") // Заповнюємо дані користувача
        .lean()
    // Перевірка, чи є розклад з таким ID
    if (!schedule) {
        return res.status(404).json({error: 'Schedule not found'});
    }
    // Шукаємо користувача в масиві users
    const user = schedule.schedules.find(item => item.user._id.toString() === userId);

    // Якщо користувача не знайдено, повертаємо помилку
    if (!user) {
        return res.status(404).json({error: 'User not found in this schedule'});
    }

    // Повертаємо знайденого користувача
    return res.json(user);


}

const updateUserByScheduleIdAndUserId = async (req, res) => {
    const {scheduleId, userId} = req.params;
    const {isWorking, workStartTime = "00:00", workEndTime = "00:00", personalSurchargePerHour = 0} = req.body;

    const session = await mongoose.startSession(); // Створюємо сесію
    session.startTransaction();

    try {
        // Знайдемо користувача
        const user = await User.findById(userId).session(session);
        if (!user) {
            throw HttpError(404, `User with id ${userId} does not exist`);
        }

        // Знайдемо розклад
        const schedule = await Schedule.findById(scheduleId).session(session);
        if (!schedule) {
            throw HttpError(404, `Schedule with id ${scheduleId} does not exist`);
        }

        const scheduleSurchargePerHour = schedule.surchargePerHour;
        const personalHourRate = user.hourlyRate;

        // Оновлення розкладу
        let index = 0
        const updatedSchedules = schedule.schedules.map((item, idx) => {
            if (item.user.toString() === userId) {
                const updatedItem = {...item};
                index = idx

                if (!isWorking) {
                    // Якщо не працює, обнуляємо значення
                    updatedItem.isWorking = isWorking;
                    updatedItem.workStartTime = "00:00";
                    updatedItem.workEndTime = "00:00";
                    updatedItem.totalMinutes = 0;
                    updatedItem.totalEarnings = 0;
                    updatedItem.personalSurchargePerHour = 0;
                } else {
                    // Якщо працює, оновлюємо робочий час та розрахунки
                    updatedItem.isWorking = isWorking;
                    updatedItem.workStartTime = workStartTime;
                    updatedItem.workEndTime = workEndTime;

                    const totalMinutes = calculateTotalMinutes(workStartTime, workEndTime);
                    updatedItem.totalMinutes = isNaN(totalMinutes) ? 0 : totalMinutes; // Перевірка на NaN

                    const totalEarnings = calculateTotalEarnings(updatedItem.totalMinutes, item.hourlyRate, personalSurchargePerHour, scheduleSurchargePerHour);
                    updatedItem.totalEarnings = isNaN(totalEarnings) ? 0 : totalEarnings;
                    updatedItem.personalSurchargePerHour = personalSurchargePerHour;
                }

                return updatedItem; // Повертаємо оновлений елемент
            }
            return item; // Якщо користувач не збігається, залишаємо без змін
        });

        schedule.schedules = updatedSchedules;

        // Зберігаємо зміни в базі
        await schedule.save({session});
        await session.commitTransaction(); // Завершуємо транзакцію

        res.json({user: schedule.schedules[index]}); // Повертаємо оновлені дані

    } catch (error) {
        await session.abortTransaction(); // Скасовуємо транзакцію в разі помилки
        throw HttpError(error.statusCode, error.message);
    } finally {
        session.endSession(); // Завершуємо сесію в будь-якому випадку
    }
};

const findScheduleById = async (req, res) => {
    const {id} = req.params;
    const schedule = await Schedule.findById(id).populate("schedules.user", "hourlyRate name surname")
    res.status(200).json(schedule);
}

const updateScheduleById = async (req, res) => {
    const {scheduleId} = req.params;
    const {surchargePerHour} = req.body; // нова надбавка за годину

    const session = await mongoose.startSession(); // Створюємо сесію


    try {

        session.startTransaction();
        const schedule = await Schedule.findById(scheduleId).session(session);

        if (!schedule) {
            throw HttpError(404, `Schedule with id ${scheduleId} does not exist`);
        }

        schedule.surchargePerHour = surchargePerHour;

        const updatedSchedules = schedule.schedules.map(item => {
            item.totalEarnings = calculateTotalEarnings(
                item.totalMinutes,
                item.hourlyRate,
                item.personalSurchargePerHour,
                surchargePerHour
            );
            return item;
        });

        // Оновлюємо масив schedules з новими значеннями
        schedule.schedules = updatedSchedules;

        // Зберігаємо зміни в базі
        await schedule.save({session});
        await session.commitTransaction(); // Завершуємо транзакцію

        res.json(schedule); // Відправляємо оновлений розклад у відповідь
    } catch (error) {
        await session.abortTransaction(); // Скасовуємо транзакцію в разі помилки
        res.status(error.statusCode || 500).json({message: error.message});
    } finally {
        session.endSession(); // Завершуємо сесію
    }
}

module.exports = {
    getAllSchedules: ctrlWrapper(getAllSchedules),
    createSchedule: ctrlWrapper(createSchedule),
    updateSchedule: ctrlWrapper(updateSchedule),
    deleteSchedule: ctrlWrapper(deleteSchedule),
    findScheduleByDate: ctrlWrapper(findScheduleByDate),
    findScheduleById: ctrlWrapper(findScheduleById),
    findBetweenDates: ctrlWrapper(findBetweenDates),
    getUserByScheduleIdAndUserId: ctrlWrapper(getUserByScheduleIdAndUserId),
    updateUserByScheduleIdAndUserId: ctrlWrapper(updateUserByScheduleIdAndUserId),
    updateScheduleById: ctrlWrapper(updateScheduleById),
    getAllSchedules_:ctrlWrapper(getAllSchedules_),
    createSchedule_v_2:ctrlWrapper(createSchedule_v_2)
}