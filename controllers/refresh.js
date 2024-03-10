import jwt from "jsonwebtoken";
import { AppError } from "../middlewares/errorHandler.js";
import Users from "../models/users.js";

const refresh = async (req, res, next) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401);

    const { userId } = req.query;
    if (!userId) return res.sendStatus(401);

    const foundUser = await Users.findById(userId);
    if (!foundUser) return res.sendStatus(401);
    if (!foundUser.token) return res.sendStatus(401);

    const refreshToken = cookies.jwt;
    if (foundUser.token !== refreshToken) {
      return res.sendStatus(401);
    }
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET,
      (err, decoded) => {
        if (err || foundUser.username !== decoded.username) {
          return res.sendStatus(401);
        }

        const payload = {
          userId: decoded.userId,
          email: decoded.email,
        };
        const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
          expiresIn: 60 * 2,
        });

        res.status(200).json({
          accessToken,
        });
        res.end();
      }
    );
  } catch (error) {
    next(new AppError(401, "Failed to generate new access token"));
  }
};

export default refresh;
