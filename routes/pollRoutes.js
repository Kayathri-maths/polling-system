const express = require("express");
const {
  createPoll,
  votePoll,
  addComment,
  getPolls,
} = require("../controllers/pollController");

const router = express.Router();

module.exports = (io) => {
  router.post("/", createPoll);
  router.post("/:pollId/vote", (req, res, next) =>
    votePoll(req, res, next, io)
  );
  router.post("/:pollId/comment", addComment);
  router.get("/", getPolls);

  return router;
};
