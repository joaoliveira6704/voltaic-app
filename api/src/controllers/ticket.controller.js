import ticketModel from "../models/ticket.model.js";
import stationModel from "../models/station.model.js";
import companyModel from "../models/company.model.js";
import logModel from "../models/log.model.js";
import generateUniqueId from "../utils/utils.js";

const paginate = async (
  Model,
  filter,
  page = 1,
  limit = 20,
  sort = { createdAt: -1 },
) => {
  page = Math.max(1, parseInt(page) || 1);
  limit = Math.min(100, Math.max(1, parseInt(limit) || 20));
  const skip = (page - 1) * limit;

  const pipeline = [
    { $match: filter },
    {
      $lookup: {
        from: "users",
        let: { createdBy: "$createdBy" },
        pipeline: [
          { $match: { $expr: { $eq: ["$userId", "$$createdBy"] } } },
          {
            $project: {
              _id: 0,
              firstName: 1,
              lastName: 1,
              username: 1,
              email: 1,
            },
          },
        ],
        as: "createdByUser",
      },
    },
    {
      $lookup: {
        from: "stations",
        let: { stationId: "$stationId" },
        pipeline: [
          { $match: { $expr: { $eq: ["$stationId", "$$stationId"] } } },
          { $project: { _id: 0, title: 1 } },
        ],
        as: "station",
      },
    },
    {
      $addFields: {
        createdByUser: { $arrayElemAt: ["$createdByUser", 0] },
        station: { $arrayElemAt: ["$station", 0] },
      },
    },
    { $project: { __v: 0 } },
    { $sort: sort },
    {
      $facet: {
        metadata: [{ $count: "total" }],
        data: [{ $skip: skip }, { $limit: limit }],
      },
    },
  ];

  const [result] = await Model.aggregate(pipeline);
  const total = result?.metadata?.[0]?.total || 0;
  const tickets = result?.data || [];

  return { tickets, page, limit, total, pages: Math.ceil(total / limit) };
};

export const createTicket = async (req, res, next) => {
  try {
    const { stationId, title, description, remarks, status } = req.body;
    const createdBy = req.user.userId;

    let companyId = req.user.companyId;

    if (stationId) {
      const station = await stationModel.findOne({ stationId });
      if (!station) {
        const err = new Error("Station not found");
        err.status = 404;
        return next(err);
      }
      const company = await companyModel.findOne({ groups: station.groupId });
      if (company) {
        companyId = company.companyId;
      }
    }

    const newTicket = new ticketModel({
      ticketId: generateUniqueId(),
      stationId,
      companyId,
      createdBy,
      title,
      description,
      remarks,
      status: status || "open",
    });
    await newTicket.save();

    await logModel.create({
      userId: createdBy,
      stationId,
      type: "info",
      action: "ticket.create",
      details: `Ticket ${newTicket.ticketId} created: ${title}`,
    });

    res.status(201).json({ ticketId: newTicket.ticketId });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await paginate(ticketModel, {}, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getMyTickets = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await paginate(
      ticketModel,
      { createdBy: req.user.userId },
      page,
      limit,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getCompanyTickets = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await paginate(
      ticketModel,
      { companyId: req.user.companyId },
      page,
      limit,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdminTickets = async (req, res, next) => {
  try {
    const { page, limit } = req.query;
    const result = await paginate(
      ticketModel,
      { stationId: null },
      page,
      limit,
    );
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getStationTickets = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { page, limit } = req.query;

    const station = await stationModel.findOne({ stationId });
    if (!station) {
      const err = new Error("Station not found");
      err.status = 404;
      return next(err);
    }

    const result = await paginate(ticketModel, { stationId }, page, limit);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateTicket = async (req, res, next) => {
  try {
    const existing = await ticketModel.findOne({ ticketId: req.params.id });
    if (!existing) {
      const err = new Error("Ticket not found");
      err.status = 404;
      return next(err);
    }

    if (req.user.role === "company-manager") {
      const ownsTicket = existing.companyId === req.user.companyId;
      let ownsStation = false;

      if (existing.stationId) {
        const station = await stationModel.findOne({
          stationId: existing.stationId,
        });
        if (station) {
          const company = await companyModel.findOne({
            companyId: req.user.companyId,
          });
          ownsStation = company?.groups.includes(station.groupId) ?? false;
        }
      }

      if (!ownsTicket && !ownsStation) {
        const err = new Error("Access denied");
        err.status = 403;
        return next(err);
      }
    }

    const update = {};
    const allowed = ["title", "description", "remarks", "status"];
    for (const field of allowed) {
      if (req.body[field] !== undefined) {
        update[field] = req.body[field];
      }
    }
    if (update.status === "closed") {
      update.closedAt = new Date();
    }

    const updatedTicket = await ticketModel.findOneAndUpdate(
      { ticketId: req.params.id },
      update,
      { new: true, runValidators: true },
    );

    await logModel.create({
      userId: req.user.userId,
      stationId: existing.stationId,
      type: "info",
      action: "ticket.update",
      details: `Ticket ${req.params.id} updated: ${JSON.stringify(update)}`,
    });

    res.json(updatedTicket);
  } catch (error) {
    next(error);
  }
};

export const deleteTicket = async (req, res, next) => {
  try {
    const deletedTicket = await ticketModel.findOneAndDelete({
      ticketId: req.params.id,
    });
    if (!deletedTicket) {
      const err = new Error("Ticket not found");
      err.status = 404;
      return next(err);
    }

    await logModel.create({
      userId: req.user.userId,
      stationId: deletedTicket.stationId,
      type: "info",
      action: "ticket.delete",
      details: `Ticket ${req.params.id} deleted: ${deletedTicket.title}`,
    });

    res.json({ message: "Ticket deleted successfully" });
  } catch (error) {
    next(error);
  }
};
