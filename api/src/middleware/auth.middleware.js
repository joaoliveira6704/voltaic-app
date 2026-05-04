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

export const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return res.status(403).json({ message: "Forbidden" });
    next();
  };

export const checkOwnership =
  (Model, resourceCompanyField = "companyId") =>
  async (req, res, next) => {
    if (req.user.role === "admin") return next();

    const resource = await Model.findById(req.params.id);

    if (!resource) {
      const error = new Error("Resource not found");
      error.status = 404;
      return next(error);
    }

    if (
      resource[resourceCompanyField].toString() !==
      req.user.companyId.toString()
    ) {
      const error = new Error("Access denied.");
      error.status = 403;
      return next(error);
    }

    next();
  };
