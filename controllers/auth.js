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

    // Generate JWT
    const payload = {
      userId: user._id,
      email: user.email,
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || "secret",
      { expiresIn: "1d" },
      async (err, token) => {
        if (err) {
          throw new AppError(500, "Something went wrong!");
        }

        // Update user token
        await Users.updateOne({ _id: user._id }, { $set: { token } });

        // Send response
        res.status(200).json({ ...payload, fullName: user.fullName, token });
      }
    );
  } catch (error) {
    // Handle errors here and pass them to the error handling middleware
    next(error);
  }
};

export const signup = async (req, res, next) => {
  const { email, password, fullName, profilePicture } = req.body;
  if (!email || !password || !fullName)
    next(new AppError(400, "All fields are required"));
  const alreadyExists = await Users.findOne({ email });
  if (alreadyExists) next(new AppError(400, "User already exists"));
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
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    next(new AppError(500, "Something went wrong!"));
  }
};
