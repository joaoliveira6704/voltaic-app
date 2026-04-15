import Tickets from "../models/Tickets.js";
import generateUniqueId from "../utils/utils.js";

export const getTickets = async (req, res, next) => {
  try {
    const tickets = await Tickets.find();
    console.log(`Found ${tickets.length} tickets in the database.`);
    res.json(tickets);
  } catch (error) {
    next(error);
  }
};

export const createTicket = async (req, res, next) => {
  try {
    const { createdBy, title, description, remarks, state } = req.body;

    const newTicket = new Tickets({
      ticketId: generateUniqueId(),
      createdBy,
      title,
      description,
      remarks,
      state: state || "open",
    });
    await newTicket.save();
    res.status(201).json({ ticketId: newTicket.ticketId });
  } catch (error) {
    next(error);
  }
};

export const deleteTicket = async (req, res, next) => {
  try {
    const deletedTicket = await Tickets.findOneAndDelete({
      ticketId: req.params.id,
    });
    if (!deletedTicket) {
      const err = new Error("Ticket not found");
      err.status = 404;
      return next(err);
    }
    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const updatedTicket = await Tickets.findOneAndUpdate(
      { ticketId: req.params.id },
      req.body,
      { new: true },
    );
    if (!updatedTicket) {
      const err = new Error("Ticket not found");
      err.status = 404;
      return next(err);
    }
    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
};
