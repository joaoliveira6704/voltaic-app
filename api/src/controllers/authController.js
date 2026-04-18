import User from "../models/Users.js";
import jwt from "jsonwebtoken";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const login = async (req, res) => {
  console.log("Request Login");

  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return res.status(401).json({ message: "Incorrect email or password" });
  }

  const token = signToken(user._id);

  user.password = undefined;

  res.status(200).json({
    status: "success",
    token,
    data: { user },
  });
};

export const register = async (req, res, next) => {
  try {
    const { username, email, firstName, lastName, password, role } = req.body;

    const newUser = new User({
      username,
      email,
      firstName,
      lastName,
      password,
      role,
    });

    await newUser.save();

    res.status(201).json({
      userId: newUser._id,
      message: "User created successfully",
    });
  } catch (error) {
    if (error.code === 11000) {
      error.status = 400;
      error.message = "Email or username already exists";
    }
    next(error);
  }
};
