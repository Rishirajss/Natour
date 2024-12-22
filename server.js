//import important packages to use
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const app = express();

//import Routes file here to use
const userRoute = require("./Routes/userRoute");
const tourRoute = require("./Routes/tourRoute");

//express middleware
app.use(express.json());

//user .env file to connect with database and port
dotenv.config({ path: "./config.env" });

//this is for the port number who is persent in .env file
const Port = process.env.PORT;

//This is for the database connection which is present in .env file
const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

//Connect database to the express.js
mongoose.connect(DB).then(() => console.log("DB Connected Successfully"));

//This is the main route are your before the import route form the routes
app.use("/api/user/", userRoute);
app.use("/api/tours/", tourRoute);
app.all("*", (req, res, next) => {
  const err = new Error(`Can't find ${req.originalUrl} on the Server`);
  err.status = "fail";
  err.statusCode = 404;

  next(err);
});

app.use((err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
});

//Use to run express code on the following port number
app.listen(Port, () => {
  console.log(`server is running on Port number ${Port}`);
});

// DATABASE=mongodb+srv://rishiraj2828:<PASSWORD>@cluster0.9vffl.mongodb.net/natours?retryWrites=true
