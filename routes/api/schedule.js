const {validateBody,authenticateWithUserRole, isValidId, validateParams} = require("../../middlewares");
const {schemas} = require("../../models/schedule");
const {createSchedule_v_2,
    findScheduleById,
    findScheduleByDate,
    getAllSchedules,
    findBetweenDates,
    getUserByScheduleIdAndUserId,
    updateUserByScheduleIdAndUserId,
    updateScheduleById,
    removeUserFromSchedule}=require("../../controllers/scheduleController");

const router=require('express').Router();

router.post("/", authenticateWithUserRole(["ADMIN"]),validateBody(schemas.createSchema),createSchedule_v_2)

router.get("/",authenticateWithUserRole(),getAllSchedules)

router.get("/:id",authenticateWithUserRole(),isValidId,findScheduleById)

router.get("/find/:date",authenticateWithUserRole(),validateParams(schemas.findByDateSchema),findScheduleByDate)

router.get("/find/:from/:to",authenticateWithUserRole(),validateParams(schemas.findFromAndToSchemas),findBetweenDates)

router.get("/find/user/:scheduleId/:userId",authenticateWithUserRole(["ADMIN"]),validateParams(schemas.getUpdateByIdSchemas),getUserByScheduleIdAndUserId)

router.put("/find/user/:scheduleId/:userId",authenticateWithUserRole(["ADMIN"]),validateParams(schemas.getUpdateByIdSchemas),updateUserByScheduleIdAndUserId)

router.put("/find/schedule/:scheduleId",authenticateWithUserRole(["ADMIN"]),updateScheduleById)

router.delete("/:scheduleId/:userId",authenticateWithUserRole(["ADMIN"]),removeUserFromSchedule)

module.exports=router;