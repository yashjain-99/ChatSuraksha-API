import Users from "../models/users.js";

export const users = async (req, res) => {
  try {
    const users = await Users.find();
    res.status(200).json({ users });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const search = async (req, res) => {
  const { searchTerm } = req.params;
  try {
    const users = await Users.find({
      email: { $regex: searchTerm, $options: "i" },
    });
    const usersToSend = users.map((user) => {
      return {
        email: user.email,
        fullName: user.fullName,
        id: user._id,
        profilePicture: user.profilePicture,
      };
    });
    res.status(200).json({ users: usersToSend });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
