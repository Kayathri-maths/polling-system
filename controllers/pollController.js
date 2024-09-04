const Poll = require("../models/Poll");
const mongoose = require("mongoose");
const Comment = require("../models/Comment");
const User = require("../models/User");

exports.createPoll = async (req, res, next) => {
  try {
    const { question, options } = req.body;

    if (
      !question ||
      !Array.isArray(options) ||
      options.some((option) => typeof option !== "object" || !option.text)
    ) {
      return res.status(400).json({ message: "Invalid input" });
    }

    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const poll = new Poll({
      question,
      options,
      createdBy: req.user.userId,
    });

    await poll.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $push: { createdPolls: poll._id },
    });

    res.status(201).json(poll);
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.votePoll = async (req, res, next) => {
  const io = req.app.get("io");

  try {
    const { optionId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(optionId)) {
      return res.status(400).json({ message: "Invalid option ID format" });
    }

    const poll = await Poll.findById(req.params.pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found" });
    }

    const option = poll.options.id(optionId);

    if (!option) {
      return res.status(404).json({ message: "Option not found" });
    }

    if (!poll.votedBy) {
      poll.votedBy = [];
    }

    if (poll.votedBy.includes(req.user.userId)) {
      const votedOption = poll.options.find(
        (option) => option.votes > 0 && poll.votedBy.includes(userId)
      );
      return res.status(400).json({
        message: "You have already voted on this poll",
        votedOption: votedOption ? votedOption.text : "Unknown",
      });
    }

    option.votes += 1;
    poll.votedBy.push(req.user.userId);
    await poll.save();

    await User.findByIdAndUpdate(req.user.userId, {
      $push: { votedPolls: poll._id },
    });

    res.status(200).json(poll);

    if (io) {
      io.emit("voteUpdate", { pollId: req.params.pollId, optionId });
    }
  } catch (error) {
    console.error("Error voting on poll:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addComment = async (req, res, next) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const comment = new Comment({
      pollId: req.params.pollId,
      text,
      createdBy: req.user.userId,
    });

    await comment.save();
    res.status(201).json(comment);
  } catch (error) {
    console.error("Error adding comment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPolls = async (req, res, next) => {
  try {
    const polls = await Poll.find().populate("comments").populate("createdBy");

    const userPolls = polls.filter(
      (poll) => poll.createdBy._id.toString() === req.user.userId
    );

    const othersPolls = polls.filter(
      (poll) => poll.createdBy._id.toString() !== req.user.userId
    );

    userPolls.forEach((poll) => {
      poll.options.forEach((option) => {
        option.votes = option.votes;
      });
    });

    res.status(200).json({
      userPolls,
      othersPolls,
    });
  } catch (error) {
    console.error("Error fetching polls:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
