import db from "../config/db.js";
// Create or Update User Preferences
async function upsertUserPreferences(userId, preferences) {
  const {
    dietary_restrictions = [],
    allergies = [],
    preferred_cuisines = [],
    default_servings = 4,
    measurement_unit = "metric",
  } = preferences;

  const result = await db.query(
    `INSERT INTO user_preferences
        (user_id, dietary_restrictions, allergies, preferred_cuisines, default_servings, measurement_unit)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT(user_id)
        DO UPDATE SET
            dietary_restrictions = $2,
            allergies = $3,
            preferred_cuisines = $4,
            default_servings = $5,
            measurement_unit = $6
        RETURNING *`,
    [
      userId,
      dietary_restrictions,
      allergies,
      preferred_cuisines,
      default_servings,
      measurement_unit,
    ],
  );

  return result.rows[0];
}

// Get preferences by user ID
async function getUserPreferencesByUserId(userId) {
  const result = await db.query(
    `SELECT * FROM user_preferences WHERE user_id = $1`,
    [userId],
  );

  return result.rows[0] || null;
}

// Delete user preferences
async function deleteUserPreferences(userId) {
  await db.query(`DELETE FROM user_preferences WHERE user_id = $1`, [userId]);
}

// Export at the end
export {
  upsertUserPreferences,
  getUserPreferencesByUserId,
  deleteUserPreferences,
};
