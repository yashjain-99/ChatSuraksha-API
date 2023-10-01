import Conversations from "../models/conversations.js";
import Users from "../models/users.js";

export const getConversations = async (req, res) => {
  const { userId } = req.params;
  try {
    const conversations = await Conversations.find({
      $or: [{ reciepientId: userId }, { senderId: userId }],
    });
    //get user details for each conversation and add to the conversation object
    const conversationsWithUserDetails = await Promise.all(
      conversations.map(async (conversation) => {
        if (conversation.reciepientId === userId) {
          const user = await Users.findOne({ _id: conversation.senderId });
          return {
            ...conversation._doc,
            otherUserId: user._id,
            otherUserName: user.fullName,
            otherUserProfilePicture: user.profilePicture,
          };
        } else {
          const user = await Users.findOne({ _id: conversation.reciepientId });
          return {
            ...conversation._doc,
            otherUserId: user._id,
            otherUserName: user.fullName,
            otherUserProfilePicture: user.profilePicture,
          };
        }
      })
    );
    res.status(200).json({ conversationsWithUserDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createConversation = async (req, res) => {
  const { reciepientId, senderId, text } = req.body;
  if (!reciepientId || !senderId || !text)
    return res.status(400).json({ error: "All fields are required" });
  try {
    const conversation = await Conversations.create({
      reciepientId,
      senderId,
      text,
    });
    conversation.save();
    res.status(201).json({ message: "Conversation created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
