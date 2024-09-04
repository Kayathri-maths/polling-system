const User = require("../models/User");

exports.getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId)
      .populate("createdPolls")
      .populate("votedPolls");
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};
