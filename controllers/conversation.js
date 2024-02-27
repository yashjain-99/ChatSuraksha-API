import Conversations from "../models/conversations.js";

export const getConversations = async (req, res) => {
  const { userId, otherUserId } = req.query;
  try {
    const conversations = await Conversations.find({
      $or: [
        { reciepientId: userId, senderId: otherUserId },
        { reciepientId: otherUserId, senderId: userId },
      ],
    });
    //get user details for each conversation and add to the conversation object
    const refactoredConversation = conversations.map((conversation) => {
      return {
        message: conversation.text,
        self: conversation.senderId === userId,
        date: conversation.date,
      };
    });
    res.status(200).json({ conversations: refactoredConversation });
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
