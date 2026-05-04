const errorHandler = (err, req, res, next) => {
  console.error("Unhandled error:", err);
  const status = err.status || 500;

  const messages = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
  };

  // Handle validation errors
  if (err.name === "ValidationError") {
    const validationErrors = {};
    for (const field in err.errors) {
      validationErrors[field] = err.errors[field].message;
    }
    return res.status(400).json({
      error: "Validation failed",
      details: validationErrors,
    });
  }

  res.status(status).json({
    error: err.message || messages[status] || "Internal Server Error",
  });
};

export default errorHandler;
