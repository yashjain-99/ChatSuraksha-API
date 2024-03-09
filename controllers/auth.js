import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Users from "../models/users.js";
import { AppError } from "../middlewares/errorHandler.js";

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new AppError(400, "All fields are required");
    }

    // Find user
    const user = await Users.findOne({ email });

    if (!user) {
      throw new AppError(400, "Invalid credentials");
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new AppError(400, "Invalid credentials");
    }

    const payload = {
      userId: user._id,
      email: user.email,
    };

    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1h",
    });

    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1d",
    });

    // Saving refreshToken with current user
    await Users.updateOne({ _id: user._id }, { $set: { token: refreshToken } });

    // Creates Secure Cookie with refresh token
    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });

    // Send authorization roles and access token to user
    res
      .status(200)
      .json({
        ...payload,
        fullName: user.fullName,
        profilePicture: user.profilePicture,
        token: accessToken,
      });
  } catch (error) {
    next(error);
  }
};

export const signup = async (req, res, next) => {
  const { email, password, fullName, profilePicture } = req.body;

  if (!email || !password || !fullName) {
    next(new AppError(400, "All fields are required"));
    return; // Return to prevent further execution
  }

  const alreadyExists = await Users.findOne({ email });

  if (alreadyExists) {
    next(new AppError(400, "User already exists"));
    return; // Return to prevent further execution
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const user = await Users.create({
      email,
      fullName,
      password: hashedPassword,
      profilePicture,
    });
    user.save();
    res.status(200).json({ message: "User registered successfully" });
  } catch (error) {
    next(new AppError(500, "Something went wrong!"));
  }
};

export const logout = async (req, res, next) => {
  try {
    const { userId } = req.body;

    // Validate input
    if (!userId) {
      return res.status(204);
    }

    // Find user
    const user = await Users.findById(userId);

    if (!user) {
      return res.status(204);
    }

    // Saving refreshToken with current user
    await Users.updateOne({ _id: user._id }, { $unset: { token: "" } });
    res.clearCookie("jwt");
    res.status(200);
    res.end();
  } catch (error) {
    next(error);
  }
};
