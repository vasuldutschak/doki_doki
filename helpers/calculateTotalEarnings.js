const calculateTotalEarnings =  (totalMinutes, hourlyRate, personalSurchargePerHour, scheduleSurchargePerHour) => {

    const totalHours = totalMinutes / 60; // Переведення хвилин в години

    const baseEarnings = totalHours * hourlyRate; // Базовий дохід

    // Обчислення особистої надбавки та надбавки за розклад
    const personalSurcharge = totalHours * personalSurchargePerHour;
    const scheduleSurcharge = totalHours * scheduleSurchargePerHour;

    // Перевірка на NaN
    if (isNaN(baseEarnings) || isNaN(personalSurcharge) || isNaN(scheduleSurcharge)) {
        return 0;
    }

    // Загальний дохід
    return baseEarnings + personalSurcharge + scheduleSurcharge;
}

module.exports=calculateTotalEarnings