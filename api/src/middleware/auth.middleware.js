import jwt from "jsonwebtoken";
import userModel from "../models/user.model.js";

export const protect = async (req, res, next) => {
  let token;
  console.log("Protect middleware called");
  //Extract the token string
  if (req.headers.authorization?.startsWith("Bearer")) {
    // Access the index to get the actual JWT string
    token = req.headers.authorization.split(" ");
  }

  if (!token) {
    return res.status(401).json({ message: "You are not logged in." });
  }
  console.log("Token:", token[1]);
  try {
    // Verify token
    const decoded = jwt.verify(token[1], process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await userModel.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({ message: "User no longer exists." });
    }

    // Grant access
    req.user = currentUser;
    console.log("Current user is valid: ", currentUser);
    console.log("Current user is valid: ", currentUser.userId);

    next();
  } catch (error) {
    error.status = 401;
    error.message = "Invalid token.";
    next(error);
  }
};
