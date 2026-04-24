import jwt from "jsonwebtoken";

const authMiddleware = async (req, resizeBy, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No authentication token, access denied!",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error", err);
    res.status(401).json({
      success: false,
      message: "Token is invalid",
    });
  }
};

export default authMiddleware;
