import companyModel from "../models/company.model.js";
import groupModel from "../models/group.model.js";
import generateUniqueId from "../utils/utils.js";
import { paginate } from "../utils/paginate.js";

export const getCompanies = async (req, res, next) => {
  try {
    const { companyIds, view } = req.query;

    if (companyIds) {
      const idArray = companyIds.split(",");
      const companies = await companyModel
        .find({
          companyId: { $in: idArray },
        })
        .lean();
      return res.json(companies);
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

      return res.json({ total, companies });
    }

    if (view === "admin") {
      const pageNum = Math.max(1, parseInt(req.query.page) || 1);
      const limitNum = Math.min(
        100,
        Math.max(1, parseInt(req.query.limit) || 20),
      );
      const skip = (pageNum - 1) * limitNum;

      const pipeline = [
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
        { $sort: { name: 1 } },
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

      return res.json({
        data,
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      });
    }

    const result = await paginate(
      companyModel,
      {},
      { page: req.query.page, limit: req.query.limit },
    );
    res.json(result);
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
    res.status(201).json({ companyId: newCompany.companyId });
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
    res.json({ message: "Company deleted successfully" });
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
    res.json(updatedCompany);
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
    res.json(company);
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

    return res.status(200).json({ assigned, unassigned });
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

    return res.status(200).json({ message: "Group assigned successfully." });
  } catch (err) {
    next(err);
  }
};

export const unassignGroup = async (req, res, next) => {
  try {
    const { groupId } = req.body;

    await companyModel.updateOne(
      { companyId: req.params.id },
      { $pull: { groups: groupId } },
    );

    return res.status(200).json({ message: "Group unassigned successfully." });
  } catch (err) {
    next(err);
  }
};
