import db from "../config/db.js";

// create recipe
export const createRecipe = async (userId, recipeData) => {
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    const {
      name,
      description,
      cuisine_type,
      difficulty,
      prep_time,
      cook_time,
      servings,
      instructions,
      dietary_tags = [],
      user_notes,
      image_url,
      ingredients = [],
      nutrition = {},
    } = recipeData;

    // insert recipe
    const recipeResult = await client.query(
      `INSERT INTO recipes
      (user_id, name, description, cuisine_type, difficulty, prep_time, cook_time, servings, instructions, dietary_tags, user_notes, image_url)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      RETURNING *`,
      [
        userId,
        name,
        description,
        cuisine_type,
        difficulty,
        prep_time,
        cook_time,
        servings,
        JSON.stringify(instructions),
        dietary_tags,
        user_notes,
        image_url,
      ],
    );

    const recipe = recipeResult.rows[0];

    // insert ingredients
    if (ingredients.length > 0) {
      const values = ingredients
        .map((_, i) => `($1,$${i * 3 + 2},$${i * 3 + 3},$${i * 3 + 4})`)
        .join(",");

      const params = [recipe.id];
      ingredients.forEach((ing) => {
        params.push(ing.name, ing.quantity, ing.unit);
      });

      await client.query(
        `INSERT INTO recipe_ingredients (recipe_id, ingredient_name, quantity, unit)
         VALUES ${values}`,
        params,
      );
    }

    // insert nutrition
    if (nutrition && Object.keys(nutrition).length > 0) {
      await client.query(
        `INSERT INTO recipe_nutrition (recipe_id, calories, protein, carbs, fats, fiber)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [
          recipe.id,
          nutrition.calories,
          nutrition.protein,
          nutrition.carbs,
          nutrition.fats,
          nutrition.fiber,
        ],
      );
    }

    await client.query("COMMIT");

    return await getRecipeById(recipe.id, userId);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

export const getRecipeById = async (id, userId) => {
  const recipeRes = await db.query(
    "SELECT * FROM recipes WHERE id=$1 AND user_id=$2",
    [id, userId],
  );

  if (recipeRes.rows.length === 0) return null;

  const ingredientsRes = await db.query(
    `SELECT ingredient_name as name, quantity, unit
     FROM recipe_ingredients WHERE recipe_id=$1`,
    [id],
  );

  const nutritionRes = await db.query(
    `SELECT calories, protein, carbs, fats, fiber
     FROM recipe_nutrition WHERE recipe_id=$1`,
    [id],
  );

  return {
    ...recipeRes.rows[0],
    ingredients: ingredientsRes.rows,
    nutrition: nutritionRes.rows[0] || null,
  };
};

export const findRecipesByUserId = async (userId, filters = {}) => {
  let query = `SELECT r.*, rn.calories
               FROM recipes r
               LEFT JOIN recipe_nutrition rn ON r.id = rn.recipe_id
               WHERE r.user_id = $1`;

  const params = [userId];
  let count = 1;

  if (filters.search) {
    count++;
    query += ` AND (r.name ILIKE $${count} OR r.description ILIKE $${count})`;
    params.push(`%${filters.search}%`);
  }

  if (filters.cuisine_type) {
    count++;
    query += ` AND r.cuisine_type = $${count}`;
    params.push(filters.cuisine_type);
  }

  if (filters.difficulty) {
    count++;
    query += ` AND r.difficulty = $${count}`;
    params.push(filters.difficulty);
  }

  if (filters.dietary_tag) {
    count++;
    query += ` AND $${count} = ANY(r.dietary_tags)`;
    params.push(filters.dietary_tag);
  }

  if (filters.max_cook_time) {
    count++;
    query += ` AND r.cook_time <= $${count}`;
    params.push(filters.max_cook_time);
  }

  const sortBy = filters.sort_by || "created_at";
  const sortOrder = filters.sort_order === "asc" ? "ASC" : "DESC";

  query += ` ORDER BY r.${sortBy} ${sortOrder}`;

  const limit = filters.limit || 20;
  const offset = filters.offset || 0;

  count++;
  query += ` LIMIT $${count}`;
  params.push(limit);

  count++;
  query += ` OFFSET $${count}`;
  params.push(offset);

  const result = await db.query(query, params);
  return result.rows;
};

export const getRecentRecipes = async (userId, limit = 5) => {
  const result = await db.query(
    `SELECT r.*, rn.calories
     FROM recipes r
     LEFT JOIN recipe_nutrition rn ON r.id = rn.recipe_id
     WHERE r.user_id = $1
     ORDER BY r.created_at DESC
     LIMIT $2`,
    [userId, limit],
  );

  return result.rows;
};

export const updateRecipe = async (id, userId, updates) => {
  const {
    name,
    description,
    cuisine_type,
    difficulty,
    prep_time,
    cook_time,
    servings,
    instructions,
    dietary_tags,
    user_notes,
    image_url,
  } = updates;

  const result = await db.query(
    `UPDATE recipes SET
     name = COALESCE($1, name),
     description = COALESCE($2, description),
     cuisine_type = COALESCE($3, cuisine_type),
     difficulty = COALESCE($4, difficulty),
     prep_time = COALESCE($5, prep_time),
     cook_time = COALESCE($6, cook_time),
     servings = COALESCE($7, servings),
     instructions = COALESCE($8, instructions),
     dietary_tags = COALESCE($9, dietary_tags),
     user_notes = COALESCE($10, user_notes),
     image_url = COALESCE($11, image_url)
     WHERE id = $12 AND user_id = $13
     RETURNING *`,
    [
      name,
      description,
      cuisine_type,
      difficulty,
      prep_time,
      cook_time,
      servings,
      instructions ? JSON.stringify(instructions) : null,
      dietary_tags,
      user_notes,
      image_url,
      id,
      userId,
    ],
  );

  return result.rows[0];
};

export const deleteRecipe = async (id, userId) => {
  const result = await db.query(
    "DELETE FROM recipes WHERE id=$1 AND user_id=$2 RETURNING *",
    [id, userId],
  );

  return result.rows[0];
};

export const getRecipeStats = async (userId) => {
  const result = await db.query(
    `SELECT
     COUNT(*) as total_recipes,
     COUNT(DISTINCT cuisine_type) as cuisine_types_count,
     AVG(cook_time) as avg_cook_time
     FROM recipes
     WHERE user_id = $1`,
    [userId],
  );

  return result.rows[0];
};
