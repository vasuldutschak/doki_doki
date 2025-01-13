const workingDayTypes = Object.freeze({
    REGULAR:{
        value: 'regular',
        surchargePerHour:0
    },
    DAY_OFF:{
        value: 'day off',
        surchargePerHour:0
    },
    SATURDAY:{
        value: 'saturday',
        surchargePerHour:1
    },
    SUNDAY:{
        value: 'sunday',
        surchargePerHour:2
    },
    VACATION:{
        value: 'vacation',
        surchargePerHour:4
    },
    getDayTypes:()=>{
        return Object.values(workingDayTypes).filter(item => typeof item === 'object' && item.value).map(item => item.value);
    },
    getSurchargeByValue:(dayType) => {
        // Шукаємо тип дня за його значенням
        const day = Object.values(workingDayTypes).find(item => item.value === dayType);

        // Якщо день знайдений, повертаємо surchargePerHour, інакше повертаємо null або інше значення
        return day ? day.surchargePerHour : 0;
    }
})
module.exports=workingDayTypes