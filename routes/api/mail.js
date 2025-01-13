const sgMail = require('@sendgrid/mail');
require('dotenv').config();
const {SENDGRID_API_KEY,EMAIL_SENDER} = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const email={
    to:"code.genius.web.dev@gmail.com",
    from:EMAIL_SENDER,
    subject:"TEST EMAIL",
    html:`<h1>THIS IS TEST MAIL</h1>`,
}

sgMail.send(email)
.then(()=>{
    console.log('mail was sent')
})
.catch((err)=>{
    console.log(err)}
)