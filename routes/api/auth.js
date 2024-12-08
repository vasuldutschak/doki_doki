const {validateBody,authenticateWithUserRole} = require("../../middlewares");
const {schemas} = require("../../models/user");
const {register, login, logout,getCurrent} = require("../../controllers/authController");
const router=require('express').Router();

router.post('/login',validateBody(schemas.loginSchema),login)

router.post('/register',validateBody(schemas.registerSchema),register)

router.post('/logout',authenticateWithUserRole(),logout)

router.get("/current",authenticateWithUserRole(),getCurrent)


module.exports=router;