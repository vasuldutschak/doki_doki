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


const getStatsForMonth=async (req, res) => {
    try {
        const { date } = req.params; // отримуємо дату з параметрів запиту
        const targetDate = new Date(date); // перетворюємо її в об'єкт Date

        if (isNaN(targetDate)) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        // Отримуємо початок і кінець місяця
        const startOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth(), 1);
        const endOfMonth = new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0);

        // Знаходимо всі записи, що належать до цього місяця
        const schedulesForMonth = await Schedule.find({
            date: {
                $gte: startOfMonth,
                $lte: endOfMonth,
            },
        }).populate("schedules.user", "name surname hourlyRate").lean();

        // Створюємо мапу для підрахунку годин і заробітків для кожного користувача
        const userStats = {};

        schedulesForMonth.forEach(schedule => {
            schedule.schedules.forEach(item => {
                const userId = item.user._id.toString();

                if (!userStats[userId]) {
                    userStats[userId] = {
                        userId,
                        name: item.user.name,
                        surname: item.user.surname,
                        totalHours: 0,
                        totalEarnings: 0,
                    };
                }

                // Додаємо дані до користувача
                const hoursWorked = item.totalMinutes / 60; // Перетворюємо хвилини в години
                const earnings = item.totalEarnings;

                userStats[userId].totalHours += hoursWorked;
                userStats[userId].totalEarnings += earnings;
            });
        });

        // Перетворюємо мапу в масив
        const statsArray = Object.values(userStats);

        res.status(200).json(statsArray);
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "An error occurred while fetching stats" });
    }
}


const getStatsForYear = async (req, res) => {
    try {
        const { date } = req.params; // отримуємо дату з параметрів запиту
        const targetDate = new Date(date); // перетворюємо її в об'єкт Date

        if (isNaN(targetDate)) {
            return res.status(400).json({ message: "Invalid date format" });
        }

        // Визначаємо початок і кінець року
        const startOfYear = new Date(targetDate.getFullYear(), 0, 1);
        const endOfYear = new Date(targetDate.getFullYear(), 11, 31);

        // Масив назв місяців
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // Знаходимо всі записи за рік
        const schedulesForYear = await Schedule.find({
            date: {
                $gte: startOfYear,
                $lte: endOfYear,
            },
        }).populate("schedules.user", "name surname hourlyRate").lean();

        // Створюємо мапу для підрахунку даних по місяцях
        const userStats = {};

        schedulesForYear.forEach(schedule => {
            const month = new Date(schedule.date).getMonth(); // отримуємо номер місяця (0 - січень)

            schedule.schedules.forEach(item => {
                const userId = item.user._id.toString();

                if (!userStats[userId]) {
                    userStats[userId] = {
                        userId,
                        name: item.user.name,
                        surname: item.user.surname,
                        months: Array.from({ length: 12 }, (_, index) => ({
                            totalHours: 0,
                            totalEarnings: 0,
                            date: new Date(targetDate.getFullYear(), index, 1), // Початок місяця
                            month: monthNames[index] // Назва місяця
                        })),
                    };
                }

                // Додаємо дані до відповідного місяця
                const hoursWorked = item.totalMinutes / 60; // Перетворюємо хвилини в години
                const earnings = item.totalEarnings;

                userStats[userId].months[month].totalHours += hoursWorked;
                userStats[userId].months[month].totalEarnings += earnings;
            });
        });

        // Перетворюємо мапу в масив
        const statsArray = Object.values(userStats);

        res.status(200).json(statsArray);
    } catch (error) {
        console.error("Error fetching stats:", error);
        res.status(500).json({ message: "An error occurred while fetching stats" });
    }
};

module.exports={
    getStatsForMonth:ctrlWrapper(getStatsForMonth),
    getStatsForYear:ctrlWrapper(getStatsForYear)
}