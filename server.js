const app=require('./app')
const mongoose=require('mongoose')
const {DB_HOST,PORT}=process.env
mongoose.set('strictQuery',true)

mongoose.connect(DB_HOST)
    .then(() => {
        app.listen(parseInt(PORT), (err) => {
            if (err) throw err
            console.log(`SERVER IS RUNNING ON PORT: ${PORT}`)
        })
    })
    .catch(err =>{
        console.log(err.message)
        process.exit(1)
    })
