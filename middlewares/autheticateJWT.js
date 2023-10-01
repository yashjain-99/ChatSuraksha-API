//middleware to authenticate JWT
const jwt = require("jsonwebtoken");
const authenticateJWT = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(token, process.env.JWT_SECRET || "secret", (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

export default authenticateJWT;
