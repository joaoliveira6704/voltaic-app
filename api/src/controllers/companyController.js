import Companies from "../models/Companies.js";
import generateUniqueId from "../utils/utils.js";

export const getCompanies = async (req, res, next) => {
  try {
    const companies = await Companies.find();
    console.log(`Found ${companies.length} companies in the database.`);
    res.json(companies);
  } catch (error) {
    next(error);
  }
};

export const createCompany = async (req, res, next) => {
  try {
    const { name, workingArea } = req.body;
    const newCompany = new Companies({
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
    const deletedCompany = await Companies.findOneAndDelete({
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
    const updatedCompany = await Companies.findOneAndUpdate(
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
