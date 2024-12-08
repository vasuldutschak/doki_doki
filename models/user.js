const {Schema, model} = require('mongoose')
const {handleMongooseError} = require('./../helpers')
const Joi = require('joi')

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
const PASSWORD_MIN_LENGTH = 6
const PASSWORD_MAX_LENGTH = 10
const USER_ROLES = ["ADMIN", "USER"]


const userSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    surname: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: EMAIL_REGEX
    },
    password: {
        type: String,
        required: true,
        min: PASSWORD_MIN_LENGTH,
    },
    token: {
        type: String,
        default: ""
    },
    isVerified: {
        type: Boolean,
    },
    userRole: {
        type: String,
        enum: USER_ROLES,
        required: true,
        default: "USER"
    },
    schedules: [
        {
            type: Schema.Types.ObjectId,
            ref: 'schedule',
            required: true
        }
    ]
}, {versionKey: false, timestamps: true})

userSchema.post("save", handleMongooseError)

const registerSchema = Joi.object({
    name: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Name is required.',
        }),
    surname: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Surname is required.',
        }),
    email: Joi.string()
        .pattern(EMAIL_REGEX)
        .required()
        .messages({
            'string.empty': 'Email is required.',
            'string.pattern.base': 'Email must be a valid format.',
        }),
    password: Joi.string()
        .min(PASSWORD_MIN_LENGTH)
        .required()
        .messages({
            'string.empty': 'Password is required.',
            'string.min': `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
        })
});

const loginSchema = Joi.object({
    email: Joi.string().pattern(EMAIL_REGEX).required(),
    password: Joi.string().min(PASSWORD_MIN_LENGTH).required(),
})

const verifySchema = Joi.object({
    isVerified: Joi.boolean().required(),
})

const updateSchema = Joi.object({
    name: Joi.string().trim(),
    surname: Joi.string().trim(),
    email: Joi.string().pattern(EMAIL_REGEX)
})

const createSchema = Joi.object({
    name: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Name is required.',
        }),
    surname: Joi.string()
        .trim()
        .required()
        .messages({
            'string.empty': 'Surname is required.',
        }),
    email: Joi.string()
        .pattern(EMAIL_REGEX)
        .required()
        .messages({
            'string.empty': 'Email is required.',
            'string.pattern.base': 'Email must be a valid format.',
        }),
    password: Joi.string()
        .min(PASSWORD_MIN_LENGTH)
        .required()
        .messages({
            'string.empty': 'Password is required.',
            'string.min': `Password must be at least ${PASSWORD_MIN_LENGTH} characters long.`,
        }),
    isVerified: Joi.boolean().required(),
    userRole:Joi.string().valid(...USER_ROLES).required(),
});
const schemas = {
    registerSchema, loginSchema, verifySchema, updateSchema, createSchema
}
const User = model('user', userSchema)

module.exports = {User, schemas}