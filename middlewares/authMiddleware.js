const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.log("Authorization header is missing");
    return res
      .status(401)
      .json({ message: "No token provided or token format is invalid" });
  }

  const token = authHeader.split(" ")[1];
  console.log("Token:", token);
  if (!token) {
    console.log("No token provided or token format is invalid");
    return res
      .status(401)
      .json({ message: "No token provided or token format is invalid" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err.message);
      return res.status(403).json({ message: "Token is invalid" });
    }

    req.user = user;
    console.log("req.user>>>>>>>>>>>>>>>>>>>", req.user);
    next();
  });
};
