const { promisify } = require("util");
const User = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

exports.signup = async (req, res) => {
  try {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm, // Corrected field name
      role: req.body.role,
    });

    newUser.password = undefined;
    const token = signToken(newUser._id);

    res.status(201).json({
      status: true,
      token,
      message: "User Created successfully",
      data: {
        _data: newUser,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error.message,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    //Check if user exists
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Please provide email and password" });
    }

    //Check If user exists and password is correct
    const user = await User.findOne({ email }).select("+password");
    // console.log(user);

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({ message: "Incorrect email or password" });
    }

    //If everything ok, send the token to the client
    const token = signToken(user._id);
    res.status(200).json({
      status: "success",
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.userinfo = async (req, res) => {
  try {
    const user = await User.find();

    res.status(200).json({
      status: true,
      result: user.length,
      data: {
        _data: user,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: false,
      message: error,
    });
  }
};

exports.protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        message: "You are not logged in! Please log in to get access.",
      });
    }

    // Verify the token
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // Check if the user still exists
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return res.status(401).json({
        message: "The user belonging to this token does no longer exist.",
      });
    }

    // Check if the user changed the password after the token was issued
    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        message: "User recently changed password! Please log in again.",
      });
    }

    // Grant access to the protected route
    req.user = freshUser; // Attach user to the request
    next();
  } catch (err) {
    console.error("Error in protect middleware:", err);
    res.status(500).json({ message: "Server error in protect middleware" });
  }
};

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: "You do not have permission to perform this action",
      });
    }
    next();
  };
};

exports.forgotPassword =async(req, res, next)=> {
  // console.log(req);

  //1. Get User based on posted email
    const user = await User.findOne({email: req.body.email});
    if(!user){
      return res.status(400).json({message: "There is no user with email address."});
    }

  //2. Genrate the random reset token
    const resetToken = user.creatPasswordResetPasswordToken();
    await user.save({validateBeforeSave: false});

  //3. Send it to user's email
   const resetUrl = `${req.protocol}://${req.get('host')}/api/user/forgetPassword/${resetToken}`;

   const message = `Forget your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetUrl}.\n If you didn't forget your password, please ignore this email.`;

   try{
      await sendEmail({
        email: user.email,
        subject: "Your password reset token (valid for 10 min)",
        message
      });
    
      res.status(200).json({
          status: "success",
          message: "Token sent to email",
          })

   }catch(err) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;

      await user.save({validateBeforeSave: false});
      return res.status(500).json({
        status:"fail",
        message: "There was an error sending the email. Try again later!"
      })

   }

}

exports.resetPassword =async(req, res, next)=> {
  // 1) Get user based on token
  const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');

  const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpires: {$gt: Date.now()}
  });

  // 2) If token has not expired, and there is user, set the new password
  if(!user){
    return res.status(400).json({
      message: "Token is invalid or has expired"
    })
  }

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();
  // 3) Update ChangePasswordAt property for the user
  // 4) Log the user in, send JWT
  const token = signToken(user._id);

    res.status(201).json({
      status: "success",
      token,
    });
}
