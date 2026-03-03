const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {

  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ message: "No token found" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.log("JWT Error:", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};