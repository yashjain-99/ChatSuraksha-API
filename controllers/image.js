import { v2 as cloudinary } from "cloudinary";
import Users from "../models/users.js";

const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.CLOUDNAME,
  api_key: process.env.CLOUDAPIKEY,
  api_secret: process.env.CLOUDINARYSECRET,
  secure: true,
});

export const getSignature = (req, res) => {
  try {
    const timestamp = Math.round(new Date().getTime() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp: timestamp,
      },
      cloudinaryConfig.api_secret
    );
    res.status(200).json({ timestamp, signature });
  } catch (error) {
    res.status(400).json({ message: "Something went wrong" });
  }
};

export const update = async (req, res) => {
  try {
    const expectedSignature = cloudinary.utils.api_sign_request(
      { public_id: req.body.public_id, version: req.body.version },
      cloudinaryConfig.api_secret
    );

    // We can trust the visitor's data if their signature is what we'd expect it to be...
    // Because without the SECRET key there's no way for someone to know what the signature should be...
    if (expectedSignature === req.body.signature) {
      // Do whatever you need to do with the public_id for the photo
      // Store it in a database or pass it to another service etc...
      await Users.updateOne(
        { _id: req.body.userId },
        {
          $set: {
            profilePicture: `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload/w_100,h_100,c_fill,q_90/${req.body.public_id}.jpg`,
          },
        }
      );
      return res.status(200).json({
        message: "Success",
        updatedProfilePicture: `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload/w_100,h_100,c_fill,q_90/${req.body.public_id}.jpg`,
      });
    }
    return res.status(400).json({
      message: "Failed to verify",
    });
  } catch (error) {
    console.log(error);
    res.status(400).json({
      message: "Something went wrong",
    });
  }
};
