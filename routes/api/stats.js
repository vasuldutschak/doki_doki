const {validateBody,authenticateWithUserRole} = require("../../middlewares");
const router=require('express').Router();
const {getStatsForMonth,getStatsForYear}=require('../../controllers/statisticsController')


router.get("/:date",authenticateWithUserRole(["ADMIN"]),getStatsForMonth)
router.get("/full/:date",authenticateWithUserRole(["ADMIN"]),getStatsForYear)

module.exports=router;