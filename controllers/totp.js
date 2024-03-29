import jwt from "jsonwebtoken";
import { AppError } from "../middlewares/errorHandler.js";
import Users from "../models/users.js";
import speakeasy from "speakeasy";

const TEMP_SECRETS = {};

export const registerTotp = async (req, res, next) => {
  try {
    const { userId } = req.body;
    if (!userId) return res.sendStatus(401);
    const foundUser = await Users.findById(userId);
    if (!foundUser) return res.sendStatus(401);
    const temp_secret = speakeasy.generateSecret();
    const qrCodeUrl = speakeasy.otpauthURL({
      secret: temp_secret.base32,
      label: "Chat-Suraksha",
      encoding: "base32",
    });
    TEMP_SECRETS[userId] = temp_secret;
    res.status(200).json({
      base32Secret: temp_secret.base32,
      qrCodeUrl,
    });
    res.end();
  } catch (error) {
    next(new AppError(500, "Failed to register totp"));
  }
};

export const verifyTotp = async (req, res, next) => {
  try {
    const { userId, token } = req.body;
    if (!userId) return res.sendStatus(401);
    if (!token) return res.sendStatus(401);
    if (!(userId in TEMP_SECRETS)) return res.sendStatus(401);
    const { base32: secret } = TEMP_SECRETS[userId];
    const verified = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
    });
    if (verified) {
      // Update user data
      await Users.updateOne(
        { _id: userId },
        { $set: { totpSecret: TEMP_SECRETS.userId } }
      );
      delete TEMP_SECRETS[userId];
      res.status(200).json({ verified: true });
    } else {
      res.status(401).json({ verified: false });
    }
    res.end();
  } catch (error) {
    next(new AppError(500, "Failed to verify totp"));
  }
};

export const validateTotp = async (req, res, next) => {
  try {
    const { userId, token } = req.body;
    // Retrieve user from database
    const foundUser = await Users.findById(userId);
    if (!foundUser) return res.sendStatus(401);
    const { base32: secret } = foundUser.totpSecret;
    // Returns true if the token matches
    const tokenValidates = speakeasy.totp.verify({
      secret,
      encoding: "base32",
      token,
      window: 1,
    });
    if (tokenValidates) {
      const payload = {
        userId: foundUser._id,
        email: foundUser.email,
      };

      const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 60 * 2,
      });

      const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "1d",
      });

      // Saving refreshToken with current user
      await Users.updateOne(
        { _id: foundUser._id },
        { $set: { token: refreshToken } }
      );

      // Creates Secure Cookie with refresh token
      res.cookie("jwt", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });

      // Send authorization roles and access token to user
      res.status(200).json({
        ...payload,
        fullName: foundUser.fullName,
        profilePicture: foundUser.profilePicture,
        token: accessToken,
      });
    } else {
      res.sendStatus(401);
    }
  } catch (error) {
    next(new AppError(500, "Failed to validate session"));
  }
};
