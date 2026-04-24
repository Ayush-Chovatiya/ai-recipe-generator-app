import {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  updatePassword,
  verifyPassword,
  deleteUser,
} from "../models/user.model.js";

import {
  upsertUserPreferences,
  getUserPreferencesByUserId,
  deleteUserPreferences,
} from "../models/userPreferences.model.js";

export const getProfile = async (req, res, next) => {
  try {
    const user = await findUserById(req.user.id);
    const preferences = await getUserPreferencesByUserId(req.user.id);

    res.json({
      success: true,
      data: {
        user,
        preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await updateUser(req.user.id, { name, email });
    res.json({
      success: true,
      message: "profile updated succesully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updatePreferences = async (req, res, next) => {
  try {
    const pref = await upsertUserPreferences(req.user.id, req.body);
    res.json({
      success: true,
      message: "preferences updated succesully",
      data: {
        preferences,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currPass, newPass } = req.body;
    if (!currPass || !newPass) {
      return res.status(400).json({
        success: false,
        message: "Provide both passwords",
      });
    }

    const user = await findUserByEmail(req.user.email);
    const isValid = await verifyPassword(currPass, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    await updatePassword(req.user.id, newPass);

    res.json({
      success: true,
      message: "password updated successfully",
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    await deleteUser(req.user.id);
    res.json({
      success: true,
      message: "Account deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
