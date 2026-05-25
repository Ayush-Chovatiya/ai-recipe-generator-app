import {
  createUser,
  findUserByEmail,
  findUserById,
  updatePassword,
  verifyPassword,
} from "../models/user.model.js";
import {
  createPasswordResetToken,
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
} from "../models/passwordResetToken.model.js";
import { sendPasswordResetEmail } from "../utils/email.js";

import { upsertUserPreferences } from "../models/userPreferences.model.js";

import jwt from "jsonwebtoken";

const generateToken = (user) => {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

export const register = async (req, res, next) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        success: false,
        message: "Please provide necessary info.",
      });
    }

    const existingUser = await findUserByEmail(email);

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const user = await createUser({ email, password, name });

    await upsertUserPreferences(user.id, {
      dietary_restrictions: [],
      allergies: [],
      preferred_cuisines: [],
      default_servings: 4,
      measurement_unit: "metric",
    });

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "user registered successfully",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide complete details",
      });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "No such user found",
      });
    }

    const isPassValid = await verifyPassword(password, user.password_hash);

    if (!isPassValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = generateToken(user);
    res.json({
      success: true,
      message: "Login Succesfull",
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User Not Found",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};

export const requestPasswordReset = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please Provide Email",
      });
    }

    const user = await findUserByEmail(email);
    let resetUrl = null;

    if (user) {
      const resetToken = await createPasswordResetToken(user.id);
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
      resetUrl = `${frontendUrl}/reset-password?token=${resetToken.token}`;
      let emailResult;

      try {
        emailResult = await sendPasswordResetEmail({
          to: user.email,
          resetUrl,
        });
      } catch (error) {
        console.error("Password reset email failed:", error.message);

        if (process.env.NODE_ENV !== "production") {
          return res.status(502).json({
            success: false,
            message: error.message || "Password reset email failed",
            data: { resetUrl },
          });
        }

        throw error;
      }

      if (!emailResult.sent) {
        console.log(`Password reset link for ${user.email}: ${resetUrl}`);
      }
    }

    const payload = {
      success: true,
      message: "If an account exists with this email, a reset has been sent",
    };

    if (process.env.NODE_ENV !== "production" && resetUrl) {
      payload.data = { resetUrl };
    }

    res.json(payload);
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide reset token and new password",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const resetToken = await findValidPasswordResetToken(token);

    if (!resetToken) {
      return res.status(400).json({
        success: false,
        message: "Reset link is invalid or has expired",
      });
    }

    await updatePassword(resetToken.user_id, password);
    await markPasswordResetTokenUsed(resetToken.id);

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    next(error);
  }
};
