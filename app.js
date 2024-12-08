const express=require('express')
const cors=require('cors')
const path=require('path')
const {handleNotFoundRequest, handleInternalErrors} = require("./helpers");
require('dotenv').config()

const authRouter=require('./routes/api/auth')
const usersRouter=require('./routes/api/users')

const app=express()

app.use(cors())
app.use(express.json())
app.use("/api/v1/auth",authRouter)
app.use("/api/v1/users",usersRouter)
app.use(handleNotFoundRequest)
app.use(handleInternalErrors)

module.exports=app