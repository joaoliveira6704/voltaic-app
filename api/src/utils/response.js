export const success = (res, { data, message, statusCode = 200 }) => {
  const body = { status: "success" };
  if (data !== undefined) body.data = data;
  if (message) body.message = message;
  return res.status(statusCode).json(body);
};

export const error = (res, { message, statusCode = 500, details }) => {
  const body = { status: "error", message };
  if (details) body.details = details;
  return res.status(statusCode).json(body);
};
