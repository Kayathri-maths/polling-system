const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  pollId: { type: Schema.Types.ObjectId, ref: "Poll", required: true },
  text: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Comment", CommentSchema);
