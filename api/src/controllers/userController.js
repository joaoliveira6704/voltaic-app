import Users from "../models/Users.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await Users.find();
    console.log(`Found ${users.length} users in the database.`);
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { userId, username, email, firstName, lastName, password, role } =
      req.body;
    const newUser = new Users({
      userId,
      username,
      email,
      firstName,
      lastName,
      password,
      role,
    });
    await newUser.save();
    res.status(201).json(newUser);
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const deletedUser = await Users.findOneAndDelete({ userId: req.params.id });
    if (!deletedUser) {
      const err = new Error("User not found");
      err.status = 404;
      return next(err);
    }
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    next(error);
  }
};
