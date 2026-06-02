import companyModel from "../models/company.model.js";
import groupModel from "../models/group.model.js";
import stationModel from "../models/station.model.js";
import ticketModel from "../models/ticket.model.js";
import usageModel from "../models/usage.model.js";
import generateUniqueId from "../utils/utils.js";
import { paginate } from "../utils/paginate.js";
import { success, error as sendError } from "../utils/response.js";

const companySortFieldMap = {
  companyId: "companyId",
  name: "name",
  members: "memberCount",
};

const parseCompanySort = (sort) => {
  if (!sort) return { name: 1 };
  const [field, direction] = sort.split(":");
  const sortField = companySortFieldMap[field] || "name";
  return { [sortField]: direction === "asc" ? 1 : -1 };
};

export const getCompanies = async (req, res, next) => {
  try {
    const { companyIds, view, search, sort } = req.query;

    if (companyIds) {
      const idArray = companyIds.split(",");
      const companies = await companyModel
        .find({
          companyId: { $in: idArray },
        })
        .lean();
      return success(res, { data: companies });
    }

    if (view === "dashboard") {
      const [total, companies] = await Promise.all([
        companyModel.countDocuments(),
        companyModel.aggregate([
          {
            $lookup: {
              from: "users",
              localField: "companyId",
              foreignField: "companyId",
              as: "members",
            },
          },
          {
            $lookup: {
              from: "stations",
              localField: "groups",
              foreignField: "groupId",
              as: "stationList",
            },
          },
          {
            $addFields: {
              userCount: { $size: "$members" },
              stationCount: { $size: "$stationList" },
            },
          },
          { $sort: { name: 1 } },
          { $limit: 6 },
          {
            $project: {
              _id: 0,
              companyId: 1,
              name: 1,
              userCount: 1,
              stationCount: 1,
            },
          },
        ]),
      ]);

      return success(res, { data: { total, companies } });
    }

    if (view === "admin") {
      const pageNum = Math.max(1, parseInt(req.query.page) || 1);
      const limitNum = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit) || 20),
      );
      const skip = (pageNum - 1) * limitNum;

      const pipeline = [
        ...(search
          ? [
              {
                $match: {
                  $or: [
                    { name: { $regex: search, $options: "i" } },
                    { companyId: { $regex: search, $options: "i" } },
                  ],
                },
              },
            ]
          : []),
        {
          $lookup: {
            from: "users",
            localField: "companyId",
            foreignField: "companyId",
            as: "members",
          },
        },
        {
          $addFields: {
            memberCount: { $size: "$members" },
          },
        },
        {
          $project: {
            _id: 0,
            companyId: 1,
            name: 1,
            memberCount: 1,
          },
        },
        { $sort: parseCompanySort(sort) },
      ];

      const [countResult, data] = await Promise.all([
        companyModel.aggregate([...pipeline, { $count: "total" }]),
        companyModel.aggregate([
          ...pipeline,
          { $skip: skip },
          { $limit: limitNum },
        ]),
      ]);

      const total = countResult[0]?.total || 0;

      return success(res, { data: { data, page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
    }

    const result = await paginate(
      companyModel,
      {},
      { page: req.query.page, limit: req.query.limit },
    );
    success(res, { data: result });
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req, res, next) => {
  try {
    const { name, workingArea } = req.body;
    const newCompany = new companyModel({
      companyId: generateUniqueId(),
      name,
      workingArea,
    });
    await newCompany.save();
    success(res, { data: { companyId: newCompany.companyId }, statusCode: 201 });
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (req, res, next) => {
  try {
    const deletedCompany = await companyModel.findOneAndDelete({
      companyId: req.params.id,
    });
    if (!deletedCompany) {
      const err = new Error("Company not found");
      err.status = 404;
      return next(err);
    }
    success(res, { message: "Company deleted successfully" });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (req, res, next) => {
  try {
    const updatedCompany = await companyModel.findOneAndUpdate(
      { companyId: req.params.id },
      req.body,
      { new: true },
    );
    if (!updatedCompany) {
      const err = new Error("Company not found");
      err.status = 404;
      return next(err);
    }
    success(res, { data: updatedCompany });
  } catch (error) {
    next(error);
  }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const company = await companyModel.findOne({ companyId: req.params.id });
    if (!company) {
      const err = new Error("Company not found");
      err.status = 404;
      return next(err);
    }
    success(res, { data: company });
  } catch (error) {
    next(error);
  }
};

export const getCompanyGroups = async (req, res, next) => {
  try {
    const company = await companyModel.findOne({ companyId: req.params.id });
    if (!company) {
      const err = new Error("Company not found");
      err.status = 404;
      return next(err);
    }
    console.log("company.groups:", company.groups);

    const assigned = await groupModel.find({
      groupId: { $in: company.groups },
    });

    console.log("assigned:", assigned);

    const companies = await companyModel.find({}, "groups");
    const assignedIds = companies.flatMap((c) => c.groups);
    console.log("all assignedIds:", assignedIds);

    const unassigned = await groupModel.find({
      groupId: { $nin: assignedIds },
    });
    console.log("unassigned:", unassigned);

    return success(res, { data: { assigned, unassigned } });
  } catch (err) {
    next(err);
  }
};

export const assignGroup = async (req, res, next) => {
  try {
    const { groupId } = req.body;

    const group = await groupModel.findOne({ groupId });
    if (!group) {
      const err = new Error("Group not found");
      err.status = 404;
      return next(err);
    }

    const companies = await companyModel.find({}, "groups");
    const assignedIds = companies.flatMap((c) => c.groups);
    if (assignedIds.includes(groupId)) {
      const err = new Error("Group is already assigned to a company");
      err.status = 400;
      return next(err);
    }

    await companyModel.updateOne(
      { companyId: req.params.id },
      { $push: { groups: groupId } },
    );

    return success(res, { message: "Group assigned successfully." });
  } catch (err) {
    next(err);
  }
};

export const unassignGroup = async (req, res, next) => {
  try {
    const { groupId } = req.params;

    await companyModel.updateOne(
      { companyId: req.params.id },
      { $pull: { groups: groupId } },
    );

    return success(res, { message: "Group unassigned successfully." });
  } catch (err) {
    next(err);
  }
};

export const getDashboard = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    // 1. get company groups
    const company = await companyModel.findOne({ companyId });
    if (!company) return next({ status: 404, message: "Company not found" });

    const groupIds = company.groups;

    // 2. get all stations in those groups
    const stations = await stationModel.find({ groupId: { $in: groupIds } });
    const stationIds = stations.map((s) => s.stationId);

    // 3. station status counts
    const stationStats = {
      available: stations.filter((s) => s.state === "available").length,
      unavailable: stations.filter((s) => s.state === "unavailable").length,
      maintenance: stations.filter((s) => s.state === "maintenance").length,
    };

    // 4. current week range
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setHours(0, 0, 0, 0);
    const day = weekStart.getDay();
    weekStart.setDate(weekStart.getDate() - day + (day === 0 ? -6 : 1));
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // 5. inactive stations — zero completed usages this week
    const activeStationIds = await usageModel.distinct("stationId", {
      stationId: { $in: stationIds },
      state: "completed",
      createdAt: { $gte: weekStart, $lt: weekEnd },
    });

    const inactive = stations
      .filter((s) => !activeStationIds.includes(s.stationId))
      .map((s) => ({ stationId: s.stationId, name: s.title }));

    // 6. ticket counts
    const ticketAgg = await ticketModel.aggregate([
      { $match: { companyId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const ticketStats = { open: 0, closed: 0, resolved: 0, unresolved: 0 };
    ticketAgg.forEach(({ _id, count }) => {
      if (_id in ticketStats) ticketStats[_id] = count;
    });

    // 7. usage this week vs last week
    const lastWeekStart = new Date(weekStart);
    lastWeekStart.setDate(weekStart.getDate() - 7);
    const lastWeekEnd = new Date(weekStart);

    const [thisWeekCount, lastWeekCount] = await Promise.all([
      usageModel.countDocuments({
        stationId: { $in: stationIds },
        state: "completed",
        createdAt: { $gte: weekStart, $lt: weekEnd },
      }),
      usageModel.countDocuments({
        stationId: { $in: stationIds },
        state: "completed",
        createdAt: { $gte: lastWeekStart, $lt: lastWeekEnd },
      }),
    ]);

    const percentageDelta =
      lastWeekCount === 0
        ? 100
        : Math.round(((thisWeekCount - lastWeekCount) / lastWeekCount) * 100);

    // 8. weekly totals
    const allUsages = await usageModel.find(
      { stationId: { $in: stationIds }, state: "completed" },
      "createdAt",
    );

    const weeklyMap = {};
    allUsages.forEach(({ createdAt }) => {
      const d = new Date(createdAt);
      const dow = d.getDay();
      d.setDate(d.getDate() - dow + (dow === 0 ? -6 : 1));
      d.setHours(0, 0, 0, 0);
      const ws = d.toISOString().split("T")[0];
      weeklyMap[ws] = (weeklyMap[ws] || 0) + 1;
    });

    const weeklyTotals = Object.entries(weeklyMap)
      .map(([weekStart, total]) => ({ weekStart, total }))
      .sort((a, b) => new Date(a.weekStart) - new Date(b.weekStart));

    // 9. latest 5 tickets with group name
    const latestTickets = await ticketModel
      .find({ companyId })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    const enrichedTickets = await Promise.all(
      latestTickets.map(async (ticket) => {
        let groupName = "—";
        if (ticket.stationId) {
          const station = await stationModel.findOne({
            stationId: ticket.stationId,
          });
          if (station) {
            const group = await groupModel.findOne({
              groupId: station.groupId,
            });
            if (group) groupName = group.name;
          }
        }
        return {
          ticketId: ticket.ticketId,
          title: ticket.title,
          status: ticket.status,
          groupName,
          createdAt: ticket.createdAt,
        };
      }),
    );

    return success(res, {
      data: {
        stations: { ...stationStats, inactive },
        tickets: ticketStats,
        usage: {
          thisWeek: thisWeekCount,
          lastWeek: lastWeekCount,
          percentageDelta,
        },
        weeklyTotals,
        latestTickets: enrichedTickets,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getDashboardWeek = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { start } = req.query;

    if (!start)
      return next({ status: 400, message: "start query param required" });

    const weekStart = new Date(start);
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    const company = await companyModel.findOne({ companyId });
    const groupIds = company.groups;
    const stations = await stationModel.find({ groupId: { $in: groupIds } });
    const stationIds = stations.map((s) => s.stationId);

    const usages = await usageModel.find(
      {
        stationId: { $in: stationIds },
        state: "completed",
        createdAt: { $gte: weekStart, $lt: weekEnd },
      },
      "stationId createdAt",
    );

    // build day → group → count map
    const dayMap = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      dayMap[d.toISOString().split("T")[0]] = {};
    }

    for (const usage of usages) {
      const date = usage.createdAt.toISOString().split("T")[0];
      const station = stations.find((s) => s.stationId === usage.stationId);
      if (!station) continue;
      const groupId = station.groupId;
      if (!dayMap[date]) continue;
      dayMap[date][groupId] = (dayMap[date][groupId] || 0) + 1;
    }

    // resolve group names
    const groups = await groupModel.find({ groupId: { $in: groupIds } });
    const groupNameMap = {};
    groups.forEach((g) => (groupNameMap[g.groupId] = g.name));

    const days = Object.entries(dayMap).map(([date, groupCounts]) => ({
      date,
      groups: Object.entries(groupCounts).map(([groupId, uses]) => ({
        groupId,
        name: groupNameMap[groupId] ?? groupId,
        uses,
      })),
    }));

    return success(res, { data: { days } });
  } catch (err) {
    next(err);
  }
};
