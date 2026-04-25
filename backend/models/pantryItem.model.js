import db from "../config/db.js";

// create a new pantry item
export const createPantryItem = async (userId, itemData) => {
  const {
    name,
    quantity,
    unit,
    category,
    expiry_date,
    is_running_low = false,
  } = itemData;

  const result = await db.query(
    `INSERT INTO pantry_items
    (user_id, name, quantity, unit, category, expiry_date, is_running_low)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [userId, name, quantity, unit, category, expiry_date, is_running_low],
  );

  return result.rows[0];
};

// get all pantry items for a user
export const findItemByUserId = async (userId, filters = {}) => {
  let query = "SELECT * FROM pantry_items WHERE user_id = $1";
  const params = [userId];
  let paramCnt = 1;

  if (filters.category) {
    paramCnt++;
    query += ` AND category = $${paramCnt}`;
    params.push(filters.category);
  }

  if (filters.is_running_low !== undefined) {
    paramCnt++;
    query += ` AND is_running_low = $${paramCnt}`;
    params.push(filters.is_running_low);
  }

  if (filters.search) {
    paramCnt++;
    query += ` AND name ILIKE $${paramCnt}`;
    params.push(`%${filters.search}%`);
  }

  query += " ORDER BY created_at DESC";

  const result = await db.query(query, params);

  return result.rows;
};

// get items expiring within 7 days
export const getItemsExpiringSoon = async (userId, days = 7) => {
  const result = await db.query(
    `SELECT * FROM pantry_items
     WHERE user_id = $1
     AND expiry_date IS NOT NULL
     AND expiry_date BETWEEN CURRENT_DATE 
     AND CURRENT_DATE + ($2 * INTERVAL '1 day')
     ORDER BY expiry_date ASC`,
    [userId, days],
  );

  return result.rows;
};

// get a pantry item by id
export const getPantryById = async (id, userId) => {
  const result = await db.query(
    "SELECT * FROM pantry_items WHERE id = $1 AND user_id = $2",
    [id, userId],
  );

  return result.rows[0];
};

// update a pantry item
export const updatePantryItem = async (id, userId, updates) => {
  const {
    name,
    quantity,
    unit,
    category,
    expiry_date,
    is_running_low = false,
  } = updates;

  const result = await db.query(
    `UPDATE pantry_items
    SET name = COALESCE($1, name),
    quantity = COALESCE($2, quantity),
    unit = COALESCE($3, unit),
    category = COALESCE($4, category),
    expiry_date = COALESCE($5, expiry_date),
    is_running_low = COALESCE($6, is_running_low)
    WHERE id = $7 AND user_id = $8
    RETURNING *`,
    [name, quantity, unit, category, expiry_date, is_running_low, id, userId],
  );

  return result.rows[0];
};

// delete pantry item
export const deletePantryItem = async (id, userId) => {
  const result = await db.query(
    "DELETE FROM pantry_items WHERE id = $1 AND user_id = $2 RETURNING *",
    [id, userId],
  );
  return result.rows[0];
};

// get pantry stats
export const getPantryStats = async (userId) => {
  const result = await db.query(
    `SELECT 
        COUNT(*) as total_items,
        COUNT(DISTINCT category) as total_categories,
        COUNT(*) FILTER (WHERE is_running_low = true) as running_low_count,
        COUNT(*) FILTER (WHERE expiry_date <= CURRNT_DATE + INTERVAL '7 days' 
        AND expiry_date >= CURRENT_DATE) as expiring_soon_count
        FROM pantry_items
        WHERE user_id = $1`,
    [userId],
  );

  return result.rows[0];
};
