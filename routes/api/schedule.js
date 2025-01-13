const {validateBody,authenticateWithUserRole, isValidId, validateParams} = require("../../middlewares");
const {schemas} = require("../../models/schedule");
const {createSchedule,
    findScheduleById,
    findScheduleByDate,
    getAllSchedules,
    findBetweenDates,
    getUserByScheduleIdAndUserId,
    updateUserByScheduleIdAndUserId,
    updateScheduleById }=require("../../controllers/scheduleController");

const router=require('express').Router();

router.post("/", authenticateWithUserRole(["ADMIN"]),validateBody(schemas.createSchema),createSchedule)

router.get("/",authenticateWithUserRole(),getAllSchedules)

router.get("/:id",authenticateWithUserRole(),isValidId,findScheduleById)

router.get("/find/:date",authenticateWithUserRole(),validateParams(schemas.findByDateSchema),findScheduleByDate)

router.get("/find/:from/:to",authenticateWithUserRole(),validateParams(schemas.findFromAndToSchemas),findBetweenDates)

router.get("/find/user/:scheduleId/:userId",authenticateWithUserRole(["ADMIN"]),validateParams(schemas.getUpdateByIdSchemas),getUserByScheduleIdAndUserId)

router.put("/find/user/:scheduleId/:userId",authenticateWithUserRole(["ADMIN"]),validateParams(schemas.getUpdateByIdSchemas),updateUserByScheduleIdAndUserId)

router.put("/find/schedule/:scheduleId",authenticateWithUserRole(["ADMIN"]),updateScheduleById)

module.exports=router;