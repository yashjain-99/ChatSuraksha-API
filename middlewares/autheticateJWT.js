//middleware to authenticate JWT
import jwt from "jsonwebtoken";
const authenticateJWT = (req, res, next) => {
  const accessToken = req.headers["authorization"];
  if (!accessToken) return res.status(401).json({ error: "Unauthorized" });
  jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
};

export default authenticateJWT;
