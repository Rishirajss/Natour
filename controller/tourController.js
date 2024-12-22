const mongoose = require("mongoose");
const Tour = require("../models/tourModel");

// For the Creating a tour
exports.creatTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: "true",
      message: "Data Inserted Successfully",
      data: {
        _data: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "False",
      message: error.message,
    });
  }
};

// For Get All Tour list
exports.getAllTour = async (req, res) => {
  try {
    // console.log(req.headers);
    const tours = await Tour.find();
    res.status(200).json({
      status: "true",
      result: tours.length,
      data: {
        _data: tours,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "false",
      message: error.message,
    });
  }
};

//For get Tour by it's id
exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: "true",
      data: {
        _data: tour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: "false",
      message: error.message,
    });
  }
};

//For update Tour Data by ID
exports.updateTour = async (req, res) => {
  try {
    const updatedTour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      update: true,
      runValidators: true,
    });

    res.status(200).json({
      status: true,
      data: {
        updatedTour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: false,
      message: err.message,
    });
  }
};

//For Delete the Tour by selected ID
exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: true,
      message: "Data Deleted successfully",
    });
  } catch (err) {
    res.status(404).json({
      status: false,
      message: err,
    });
  }
};

//Get all record status
exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingsAverage: { $gte: 4.5 } },
      },
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$ratingsAverage" },
          avgPrice: { $avg: "$price" },
          minPrice: { $min: "$price" },
          maxPrice: { $max: "$price" },
        },
      },
    ]);

    res.status(200).json({
      status: false,
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err,
    });
  }
};

exports.getMonthlyPlan = async (req, res) => {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: "$startDates",
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-31`),
          },
        },
      },
      {
        $group: {
          _id: { $month: "$startDates" },
          numTourStarts: { $sum: 1 },
          tours: { $push: "$name" },
        },
      },
      {
        $addFields: { month: "$_id" },
      },
      {
        $project: {
          _id: 0,
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
    ]);

    res.status(200).json({
      status: true,
      result: plan.length,
      data: {
        plan,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: false,
      message: err,
    });
  }
};
