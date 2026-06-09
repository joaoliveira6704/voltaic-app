import userModel from "../models/user.model.js";
import stationModel from "../models/station.model.js";
import companyModel from "../models/company.model.js";
import usageModel from "../models/usage.model.js";
import { wrap } from "../utils/cache.js";
import { success } from "../utils/response.js";

export const getStats = async (req, res, next) => {
  try {
    const data = await wrap("public:landing:stats", async () => {
      const [totalUsers, totalStations, totalCompanies, totalCompletedUsages] =
        await Promise.all([
          userModel.countDocuments(),
          stationModel.countDocuments(),
          companyModel.countDocuments(),
          usageModel.countDocuments({ state: "completed" }),
        ]);
      return { totalUsers, totalStations, totalCompanies, totalCompletedUsages };
    }, 300);

    res.set("Cache-Control", "public, max-age=300");
    return success(res, { data });
  } catch (e) {
    next(e);
  }
};
