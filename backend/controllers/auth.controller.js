import {
  createUser,
  findUserByEmail,
  findUserById,
  verifyPassword,
} from "../models/user.model.js";

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

    res.json({
      success: true,
      message: "If an account exists with this email, a reset has been sent",
    });
  } catch (error) {
    next(error);
  }
};
