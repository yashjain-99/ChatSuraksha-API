import mongoose from "mongoose";
const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb+srv://ChatSurakshaAdmin:SecurePassword123@cluster0.qmrjj2v.mongodb.net/?retryWrites=true&w=majority",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    console.log("Connected to MongoDB");
  } catch (error) {
    console.log(error);
  }
};
connectDB();
