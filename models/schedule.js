const {Schema,model}=require('mongoose')
const {handleMongooseError} = require("../utils");
const Joi = require("joi")
const DAYS_OF_WEAK = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
const DAYS_TYPE=["holiday","weekend","regularDay","dayOff"]

const scheduleSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    dayName: {
        type: String,
        enum: DAYS_OF_WEAK,
        required: true
    },
    workStartTime:{
        type: String,
        required: true,
        default: "00:00",
    },
    workEndTime:{
        type: String,
        required: true,
        default:"00:00",
    },
    date:{
        type: Date,
        required: true,
    },
    totalMinutes:{
        type: Number,
    },
    totalEarnings:{
        type: Number,
        required: true,
        default: 0
    },
    hourlyRate:{
        type: Number,
    },
    dayType:{
        type:String,
        enum: DAYS_TYPE,
    }
},{versionKey: false,timestamps:true})

const createSchema=Joi.object({
    user: Joi.string().required(), // MongoDB ObjectId as a string
    dayName: Joi.string().valid(...DAYS_OF_WEAK).required(),
    workStartTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/) // HH:mm format
        .required()
        .default("00:00"),
    workEndTime: Joi.string()
        .pattern(/^([01]\d|2[0-3]):([0-5]\d)$/) // HH:mm format
        .required()
        .default("00:00"),
    date: Joi.date().iso().required(), // ISO date format
    totalMinutes: Joi.number().integer().min(0), // Optional and must be non-negative if provided
    totalEarnings: Joi.number().min(0).required().default(0), // Must be non-negative
    hourlyRate: Joi.number().positive().precision(2), // Optional, must be positive with up to 2 decimal places
    dayType: Joi.string().valid(...DAYS_TYPE) // Must be one of the specified day types
});

scheduleSchema.post("save", handleMongooseError)

const schemas={
    createSchema,
}

const Schedule = model('schedule', scheduleSchema)

module.exports= {Schedule,schemas}