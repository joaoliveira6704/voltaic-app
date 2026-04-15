const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;

  const messages = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
  };

  res
    .status(status)
    .json({
      error: err.message || messages[status] || "Internal Server Error",
    });
};

export default errorHandler;
