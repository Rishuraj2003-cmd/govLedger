export function errorHandler(error, _request, response, _next) {
  console.error(error);
  response.status(error.statusCode || 500).json({
    error: error.message || "Unexpected server error",
  });
}
