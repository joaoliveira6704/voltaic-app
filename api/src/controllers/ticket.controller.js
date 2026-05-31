import ticketModel from "../models/ticket.model.js";
import stationModel from "../models/station.model.js";
import companyModel from "../models/company.model.js";
import logModel from "../models/log.model.js";
import generateUniqueId from "../utils/utils.js";
import { success, error as sendError } from "../utils/response.js";

const sortFieldMap = {
  ticketId: "ticketId",
  createdBy: "createdByUser.username",
  title: "title",
  description: "description",
  remarks: "remarks",
  status: "status",
};

const parseSort = (sort) => {
  if (!sort) return { createdAt: -1 };
  const [field, direction] = sort.split(":");
  const sortField = sortFieldMap[field] || "createdAt";
  return { [sortField]: direction === "asc" ? 1 : -1 };
};

const paginate = async (
  Model,
  filter,
  page = 1,
  limit = 20,
  sort = { createdAt: -1 },
  search = "",
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
    ...(search
      ? [
          {
            $match: {
              $or: [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
                { remarks: { $regex: search, $options: "i" } },
                { ticketId: { $regex: search, $options: "i" } },
                { "createdByUser.username": { $regex: search, $options: "i" } },
                { "createdByUser.firstName": { $regex: search, $options: "i" } },
                { "createdByUser.lastName": { $regex: search, $options: "i" } },
                { "createdByUser.email": { $regex: search, $options: "i" } },
              ],
            },
          },
        ]
      : []),
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
  const data = result?.data || [];

  return { data, page, limit, total, pages: Math.ceil(total / limit) };
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

    success(res, { data: { ticketId: newTicket.ticketId }, statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

export const getTickets = async (req, res, next) => {
  try {
    const { page, limit, stationless, view, search, sort, status } = req.query;

    if (view === "dashboard") {
      const [counts, recent] = await Promise.all([
        ticketModel.aggregate([
          { $group: { _id: "$status", count: { $sum: 1 } } },
        ]),
        ticketModel.aggregate([
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "users",
              let: { createdBy: "$createdBy" },
              pipeline: [
                { $match: { $expr: { $eq: ["$userId", "$$createdBy"] } } },
                { $project: { _id: 0, firstName: 1, lastName: 1 } },
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
        ]),
      ]);

      const stats = {
        total: 0,
        open: 0,
        closed: 0,
        resolved: 0,
        unresolved: 0,
      };
      for (const c of counts) {
        stats.total += c.count;
        stats[c._id] = c.count;
      }

      return success(res, { data: { ...stats, recent } });
    }

    const filter = {};
    if (stationless === "true") filter.stationId = null;
    if (status) filter.status = status;

    const sortObj = parseSort(sort);
    const result = await paginate(ticketModel, filter, page, limit, sortObj, search);
    success(res, { data: result });
  } catch (error) {
    next(error);
  }
};

export const getMyTickets = async (req, res, next) => {
  try {
    const { page, limit, search, sort, status } = req.query;
    const filter = { createdBy: req.user.userId };
    if (status) filter.status = status;
    const sortObj = parseSort(sort);
    const result = await paginate(ticketModel, filter, page, limit, sortObj, search);
    success(res, { data: result });
  } catch (error) {
    next(error);
  }
};

export const getCompanyTickets = async (req, res, next) => {
  try {
    const { page, limit, search, sort, status } = req.query;
    const filter = { companyId: req.user.companyId };
    if (status) filter.status = status;
    const sortObj = parseSort(sort);
    const result = await paginate(ticketModel, filter, page, limit, sortObj, search);
    success(res, { data: result });
  } catch (error) {
    next(error);
  }
};

export const getStationTickets = async (req, res, next) => {
  try {
    const { stationId } = req.params;
    const { page, limit, search, sort, status } = req.query;

    const station = await stationModel.findOne({ stationId });
    if (!station) {
      const err = new Error("Station not found");
      err.status = 404;
      return next(err);
    }

    const filter = { stationId };
    if (status) filter.status = status;
    const sortObj = parseSort(sort);
    const result = await paginate(ticketModel, filter, page, limit, sortObj, search);
    success(res, { data: result });
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

    success(res, { data: updatedTicket });
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

    success(res, { message: "Ticket deleted successfully" });
  } catch (error) {
    next(error);
  }
};
