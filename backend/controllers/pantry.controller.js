import {
  createPantryItem,
  findItemByUserId,
  getItemsExpiringSoon,
  updatePantryItem,
  deletePantryItem,
  getPantryStats,
} from "../models/pantryItem.model.js";

/**
 * Get all pantry items
 */
export const getPantryItems = async (req, res, next) => {
  try {
    const { category, is_running_low, search } = req.query;

    const items = await findItemByUserId(req.user.id, {
      category,
      is_running_low:
        is_running_low === "true"
          ? true
          : is_running_low === "false"
            ? false
            : undefined,
      search,
    });

    res.json({
      success: true,
      data: { items },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pantry stats
 */
export const getPantryStatsController = async (req, res, next) => {
  try {
    const stats = await getPantryStats(req.user.id);

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get items expiring soon
 */
export const getExpiringSoon = async (req, res, next) => {
  try {
    const days = Math.max(1, parseInt(req.query.days) || 7);

    const items = await getItemsExpiringSoon(req.user.id, days);

    res.json({
      success: true,
      data: { items },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add pantry item
 */
export const addPantryItem = async (req, res, next) => {
  try {
    const item = await createPantryItem(req.user.id, req.body);

    res.status(201).json({
      success: true,
      message: "Item added to pantry",
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update pantry item
 */
export const updatePantryItemController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await updatePantryItem(id, req.user.id, req.body);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Pantry item not found",
      });
    }

    res.json({
      success: true,
      message: "Pantry item updated",
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete pantry item
 */
export const deletePantryItemController = async (req, res, next) => {
  try {
    const { id } = req.params;

    const item = await deletePantryItem(id, req.user.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Pantry item not found",
      });
    }

    res.json({
      success: true,
      message: "Pantry item deleted",
      data: { item },
    });
  } catch (error) {
    next(error);
  }
};
