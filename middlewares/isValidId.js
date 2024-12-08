const {isValidObjectId}=require('mongoose')
const {HttpError}=require('../helpers')
/**
 * Перевіряє, чи є `id` в параметрах запиту дійсним MongoDB ObjectId.
 * Якщо `id` не є дійсним, генерує помилку 404 з відповідним повідомленням.
 * Цей мідлвар слід використовувати у маршрутах, де необхідна валідація `id`.
 *
 * @param {Object} req - Об'єкт запиту Express, який містить параметри запиту.
 * @param {Object} res - Об'єкт відповіді Express, використовується для передачі відповіді.
 * @param {Function} next - Callback-функція для передачі управління наступному мідлвару.
 */
const isValidId=(req,res,next)=>{
    const {id}=req.params
    if(!isValidObjectId(id)) {
        next(HttpError(404,`Invalid id ${id}`))
    }
    next()
}

module.exports=isValidId