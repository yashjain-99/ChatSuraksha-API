import jwt from "jsonwebtoken";
import { AppError } from "../middlewares/errorHandler.js";
import Users from "../models/users.js";

const validateSession = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);

    const { userId } = req.body;
    if (!userId) return res.sendStatus(401);

    const foundUser = await Users.findById(userId);
    if (!foundUser) return res.sendStatus(401);

    const refreshToken = foundUser.token;
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || foundUser.username !== decoded.username) {
          return res.sendStatus(403);
        }

        const payload = {
          userId: decoded._id,
          email: decoded.email,
        };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: "1h",
        });

        res.status(200).json({
          ...payload,
          fullName: foundUser.fullName,
          token: accessToken,
        });
      }
    );
  } catch (error) {
    next(new AppError(401, "Failed to validate session"));
  }
};

export default validateSession;
