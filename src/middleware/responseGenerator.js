import { STATUS } from "../utils/constants.js";

const responseGenerator = (req, res, next) => {
  res.success = (message = "Success", content = null) => {
    return res.status(STATUS.SUCCESS).json({ code: 200, message, content });
  };

  res.created = (message = "Created", content = null) => {
    return res.status(STATUS.CREATED).json({ code: 201, message, content });
  };

  res.badRequest = (message = "Bad request", content = null) => {
    return res.status(STATUS.BAD_REQUEST).json({ code: 400, message, content });
  };

  res.unauthorized = (message = "Unauthorized", content = null) => {
    return res.status(STATUS.UNAUTHORIZED).json({ code: 401, message, content });
  };

  res.forbidden = (message = "Forbidden", content = null) => {
    return res.status(STATUS.FORBIDDEN).json({ code: 403, message, content });
  };

  res.notFound = (message = "Not found", content = null) => {
    return res.status(STATUS.NOT_FOUND).json({ code: 404, message, content });
  };

  res.conflict = (message = "Conflict", content = null) => {
    return res.status(STATUS.CONFLICT).json({ code: 409, message, content });
  };

  res.error = (message = "Internal server error", content = null) => {
    return res.status(STATUS.SERVER_ERROR).json({ code: 500, message, content });
  };

  next();
};

export default responseGenerator;
