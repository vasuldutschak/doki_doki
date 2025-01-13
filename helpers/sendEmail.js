const sgMail = require('@sendgrid/mail');
require('dotenv').config();
const {SENDGRID_API_KEY,EMAIL_SENDER} = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

/*const email={
    to:"code.genius.web.dev@gmail.com",
    from:EMAIL_SENDER,
    subject:"TEST EMAIL",
    html:`<h1>THIS IS TEST MAIL</h1>`,
}*/


const sendEmail=email=>{
    return sgMail.send({...email,from:EMAIL_SENDER});
}

module.exports=sendEmail