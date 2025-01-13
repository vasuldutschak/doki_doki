const {Schema,model}=require('mongoose')
const {handleMongooseError,DAY_NAMES,WORKING_DAY_TYPES} = require("../helpers");
const Joi = require("joi")
const TIME_PATTERN = /^([0-1][0-9]|2[0-3]):([0-5][0-9])$/;
const OBJECT_ID_PATTERN=/^[0-9a-fA-F]{24}$/

const scheduleSchema = new Schema({
    date: { type: Date, required: true },
    dayName: { type: String, required: true ,enum:DAY_NAMES.getDays()},
    dayType: { type: String, enum: WORKING_DAY_TYPES.getDayTypes(), required: true },
    surchargePerHour: { type: Number, required: true},
    schedules: [
        {
            user: {
                type: Schema.Types.ObjectId,
                ref: 'user',
                required: true
            },
            isWorking: { type: Boolean, required: true },
            workStartTime: {
                type: String,
                required: true,
                match: TIME_PATTERN, // Формат HH:mm
                message: 'workStartTime must be in the format HH:mm'
            }, // Format: HH:mm
            workEndTime: {
                type: String,
                required: true,
                match: TIME_PATTERN, // Формат HH:mm
                message: 'workStartTime must be in the format HH:mm'
            }, // Format: HH:mm
            hourlyRate: { type: Number, required: true },
            totalMinutes: { type: Number, required: true },
            totalEarnings: { type: Number, required: true },
            personalSurchargePerHour: { type: Number, required: true }
        }
    ]
},{ versionKey: false, timestamps: true })

const updateSchema = Joi.object({
    date: Joi.date().required(),
    dayName: Joi.string().valid(...DAY_NAMES.getDays()).required(),
    dayType: Joi.string().valid(...WORKING_DAY_TYPES.getDayTypes()).required(),
    surchargePerHour: Joi.number().required(),
    schedules: Joi.array().items(Joi.object({
        user: Joi.string().pattern(OBJECT_ID_PATTERN).required(),  // Перевірка для ObjectId
        isWorking: Joi.boolean().required(),
        workStartTime: Joi.string().pattern(TIME_PATTERN).required(),  // Перевірка формату HH:mm
        workEndTime: Joi.string().pattern(TIME_PATTERN).required(),  // Перевірка формату HH:mm
        hourlyRate: Joi.number().required(),
        totalMinutes: Joi.number().required(),
        totalEarnings: Joi.number().required(),
        personalSurchargePerHour: Joi.number().required()
    })).required()
})

const createSchema=Joi.object({
    date: Joi.date().required(),
    dayType: Joi.string().valid(...WORKING_DAY_TYPES.getDayTypes()).required(),
    surchargePerHour: Joi.number().required(),
})

scheduleSchema.post("save", handleMongooseError)

const schemas={
    updateSchema,createSchema
}

const Schedule = model('schedule', scheduleSchema)

module.exports= {Schedule,schemas}