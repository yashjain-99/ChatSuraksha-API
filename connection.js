import mongoose from "mongoose";
const connectDB = async () => {
  try {
    await mongoose.connect(
      `mongodb+srv://${process.env.db_username}:${process.env.db_password}@cluster0.qmrjj2v.mongodb.net/?retryWrites=true&w=majority`,
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
