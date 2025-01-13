const dayNames = Object.freeze({
    0:"Sunday",
    1:"Monday",
    2:"Tuesday",
    3:"Wednesday",
    4:"Thursday",
    5:"Friday",
    6:"Saturday",
    getDays: () =>
        Object.keys(dayNames)
            .filter(key => !isNaN(key)) // Вибираємо лише числові ключі
            .map(key => dayNames[key]) // Отримуємо значення цих ключів
})

module.exports=dayNames