// controllers/shoppingList.controller.js

import {
  generateShoppingListFromMealPlan,
  createShoppingItem,
  getShoppingListByUserId,
  getShoppingListGrouped,
  updateShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  clearCheckedItems,
  clearAllShoppingItems,
  addCheckedItemsToPantry,
} from "../models/shoppingList.model.js";

/**
 * Generate shopping list from meal plan
 */
export const generateFromMealPlan = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Please provide startDate and endDate",
      });
    }

    // validate dates
    const parsedStart = new Date(startDate);

    const parsedEnd = new Date(endDate);

    if (
      Number.isNaN(parsedStart.getTime()) ||
      Number.isNaN(parsedEnd.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid date format",
      });
    }

    const items = await generateShoppingListFromMealPlan(
      req.user.id,
      startDate,
      endDate,
    );

    res.json({
      success: true,
      message: "Shopping list generated from meal plan",
      data: { items },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get shopping list
 */
export const getShoppingList = async (req, res, next) => {
  try {
    const grouped = req.query.grouped === "true";

    const items = grouped
      ? await getShoppingListGrouped(req.user.id)
      : await getShoppingListByUserId(req.user.id);

    res.json({
      success: true,
      data: { items },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add shopping item
 */
export const addItem = async (req, res, next) => {
  try {
    const item = await createShoppingItem(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Item added to shopping list",
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update shopping item
 */
export const updateItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await updateShoppingItem(id, req.user.id, req.body);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shopping list item not found",
      });
    }

    res.json({
      success: true,
      message: "Item updated",
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle checked status
 */
export const toggleChecked = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await toggleShoppingItem(id, req.user.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shopping list item not found",
      });
    }

    res.json({
      success: true,
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete shopping item
 */
export const deleteItem = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await deleteShoppingItem(id, req.user.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Shopping list item not found",
      });
    }

    res.json({
      success: true,
      message: "Item deleted",
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear checked items
 */
export const clearChecked = async (req, res, next) => {
  try {
    const items = await clearCheckedItems(req.user.id);

    res.json({
      success: true,
      message: "Checked items cleared",
      data: { items },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Clear all items
 */
export const clearAll = async (req, res, next) => {
  try {
    const items = await clearAllShoppingItems(req.user.id);

    res.json({
      success: true,
      message: "Shopping list cleared",
      data: { items },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add checked items to pantry
 */
export const addCheckedToPantry = async (req, res, next) => {
  try {
    const items = await addCheckedItemsToPantry(req.user.id);

    res.json({
      success: true,
      message: "Checked items added to pantry",
      data: { items },
    });
  } catch (error) {
    next(error);
  }
};
