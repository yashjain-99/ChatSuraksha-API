import Conversations from "../models/conversations.js";
import Users from "../models/users.js";

export const getInbox = async (req, res) => {
  const { userId } = req.params;
  try {
    const conversationsWithLastMessage = await Conversations.aggregate([
      // Match conversations where the current user is either sender or recipient
      {
        $match: {
          $or: [{ senderId: userId }, { reciepientId: userId }],
        },
      },
      // Project a field to indicate the other user's ID
      {
        $project: {
          otherUserId: {
            $cond: [
              { $eq: ["$senderId", userId] },
              "$reciepientId",
              "$senderId",
            ],
          },
          text: 1,
          date: 1,
        },
      },
      // Sort messages within each group by date in descending order
      { $sort: { date: -1 } },
      // Group by the other user ID and get the last message
      {
        $group: {
          _id: "$otherUserId",
          lastMessage: {
            $first: {
              text: "$text",
              date: "$date",
            },
          },
        },
      },
      // Sort by the date of the last message
      { $sort: { "lastMessage.date": -1 } },
    ]);
    const inbox = await Promise.all(
      conversationsWithLastMessage.map(async (conversation) => {
        const user = await Users.findById(conversation._id);
        return {
          otherUserId: conversation._id,
          lastMessage: conversation.lastMessage.text,
          lastMessageDate: conversation.lastMessage.date,
          otherUserName: user.fullName,
          otherUserProfilePicture: user.profilePicture,
        };
      })
    );
    res.status(200).json({ inbox });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
