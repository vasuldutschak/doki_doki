const {validateBody,authenticateWithUserRole, isValidId} = require("../../middlewares");
const {schemas} = require("../../models/user");
const {updateVerify}=require('./../../controllers/userController')
const {getAll, removeById, update, createUserAccount} = require("../../controllers/userController");

const router=require('express').Router();


router.patch("/:id/verify",authenticateWithUserRole(["ADMIN"]),isValidId ,validateBody(schemas.verifySchema),updateVerify)

router.get("/",authenticateWithUserRole(["ADMIN"]),getAll)

router.delete("/:id",authenticateWithUserRole(["ADMIN"]),isValidId,removeById)

router.put("/:id",authenticateWithUserRole(["ADMIN","USER"]),isValidId,validateBody(schemas.updateSchema),update)

router.post("/",authenticateWithUserRole(["ADMIN"]),validateBody(schemas.createSchema),createUserAccount)

module.exports=router;