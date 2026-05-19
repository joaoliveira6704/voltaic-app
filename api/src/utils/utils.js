import tokenModel from "../models/resetToken.model.js";
import crypto from "crypto";

const generateUniqueId = () => {
  return crypto.randomUUID();
};

export async function generateUniqueToken() {
  let token;
  let exists;

  do {
    token = crypto.randomInt(100000, 999999).toString();
    exists = !!(await tokenModel.findOne({ token }));
  } while (exists);

  return token;
}

export default generateUniqueId;
