import jwt from "jsonwebtoken";
import config from "../config.js";

function userMiddleware(req, res, next) {
  console.log("User Middleware triggered");

  // Check if the JWT secret is configured
  if (!config.JWT_USER_PASSWORD) {
    console.error("JWT_USER_PASSWORD is not configured");
    return res.status(500).json({ errors: "Server misconfiguration" });
  }

  // Extract Authorization header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ errors: "Token must be in 'Bearer <token>' format" });
  }
  const token = authHeader.split(" ")[1];

  try {
    // Verify token and decode user ID
    const decoded = jwt.verify(token, config.JWT_USER_PASSWORD);
    req.userId = decoded.id;
    console.log("Token verified successfully:", decoded);

    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ errors: "Token expired" });
    } else if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ errors: "Invalid token" });
    } else {
      console.error("Unexpected error in user middleware:", error);
      return res.status(500).json({ errors: "Internal server error" });
    }
  }
}

export default userMiddleware;
