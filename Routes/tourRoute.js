const express = require("express");
const tourController = require("../controller/tourController");
const authController = require("../controller/authController");
const router = express.Router();

router.use(authController.protect);

router.route("/").post(tourController.creatTour).get(tourController.getAllTour);

router.route("/tour-stats").get(tourController.getTourStats);
// router.route("/monthly-plan/:year").get(tourController.getMonthlyPlan);
router.route("/monthly-plan/:year").get((req, res, next) => {
  const year = Number(req.params.year);
  if (isNaN(year) || year < 1900 || year > new Date().getFullYear() + 10) {
    return res.status(400).json({ message: "Invalid year format" });
  }
  next();
}, tourController.getMonthlyPlan);

router.use(authController.restrictTo("admin"));
router
  .route("/:id")
  .get(tourController.getTour)
  .patch(tourController.updateTour)
  .delete(tourController.deleteTour);

module.exports = router;
