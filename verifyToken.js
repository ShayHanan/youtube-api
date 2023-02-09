import jwt from "jsonwebtoken";
import { createError } from "./error.js";

export const verifyToken = (req, res, next) => {
    const tokenHeader = req.headers.token;

    if (!tokenHeader) return next(createError(401, "not authenticated"));
    const token = tokenHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT, (err, user) => {
        if (err) next(createError(403, "token is invalid"));

        req.user = user;
        next();
    });
};