import Sessions from "../models/UserSessions.js";

export const getSessions = async (req, res, next) => {
  try {
    const sessions = await Sessions.find();
    console.log(`Found ${sessions.length} sessions in the database.`);
    res.json(sessions);
  } catch (error) {
    next(error);
  }
};

export const createSession = async (req, res, next) => {
  try {
    const { userId, token, expiresAt } = req.body;
    const newSession = new Sessions({
      userId,
      token,
      expiresAt,
    });
    await newSession.save();
    res.status(201).json(newSession);
  } catch (error) {
    next(error);
  }
};

export const deleteSession = async (req, res, next) => {
  try {
    const deletedSession = await Sessions.findOneAndDelete({
      _id: req.params.id,
    });
    if (!deletedSession) {
      const err = new Error("Session not found");
      err.status = 404;
      return next(err);
    }
    res.json({ message: "Session deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateSession = async (req, res, next) => {
  try {
    const updatedSession = await Sessions.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true },
    );
    if (!updatedSession) {
      const err = new Error("Session not found");
      err.status = 404;
      return next(err);
    }
    res.json(updatedSession);
  } catch (error) {
    next(error);
  }
};
