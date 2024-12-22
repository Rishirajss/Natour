const mongoose = require("mongoose");

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    require: [true, "A Tour must have a name"],
    unique: true,
    tirm: true,
  },
  duration: {
    type: Number,
    require: ["true", "A Tour must have a duration"],
  },
  maxGroupSize: {
    type: Number,
    require: ["true", "A Tour must have a Max Group Size"],
  },
  difficulty: {
    type: String,
    require: ["true", "A Tour must have a difficulty"],
  },
  ratingsAverage: {
    type: Number,
    default: 4.5,
  },
  ratingsQuantity: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    require: [true, "A Tour must have a price"],
  },
  priceDiscount: Number,
  summary: {
    type: String,
    trim: true,
    require: [true, "A Tour must have a price"],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    require: [true, "A Tour must have a Cover image"],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  startDates: [Date],
});

const Tour = mongoose.model("Tour", tourSchema);

module.exports = Tour;
