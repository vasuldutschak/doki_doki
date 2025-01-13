const calculateTotalMinutes=(workStartTime, workEndTime) =>{
    // Розділити на години та хвилини
    const [startHours, startMinutes] = workStartTime.split(":").map(Number);
    const [endHours, endMinutes] = workEndTime.split(":").map(Number);

    // Обчислити хвилини від початку доби
    const startTotalMinutes = startHours * 60 + startMinutes;
    const endTotalMinutes = endHours * 60 + endMinutes;

    // Обчислити різницю хвилин
    let totalMinutes = endTotalMinutes - startTotalMinutes;

    // Якщо робочий час переходить через північ
    if (totalMinutes < 0) {
        totalMinutes += 24 * 60; // Додаємо хвилини повної доби
    }

    return totalMinutes;
}

module.exports=calculateTotalMinutes;