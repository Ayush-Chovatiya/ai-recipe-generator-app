import db from "../config/db.js";
import bcrypt from "bcrypt";

// CREATE USER
const createUser = async ({ email, password, name }) => {
  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await db.query(
    `INSERT INTO users (email, password_hash, name)
     VALUES ($1, $2, $3)
     RETURNING id, email, name, created_at`,
    [email, hashedPassword, name],
  );

  return result.rows[0];
};

// FIND BY EMAIL
const findUserByEmail = async (email) => {
  const result = await db.query(`SELECT * FROM users WHERE email = $1`, [
    email,
  ]);
  return result.rows[0];
};

// FIND BY ID
const findUserById = async (id) => {
  const result = await db.query(
    `SELECT id, email, name, created_at, updated_at FROM users WHERE id = $1`,
    [id],
  );
  return result.rows[0];
};

// UPDATE USER
const updateUser = async (id, updates) => {
  const { name, email } = updates;

  const result = await db.query(
    `UPDATE users
     SET name = COALESCE($1, name),
         email = COALESCE($2, email)
     WHERE id = $3
     RETURNING id, email, name, updated_at`,
    [name, email, id],
  );

  return result.rows[0];
};

// UPDATE PASSWORD
const updatePassword = async (id, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.query(`UPDATE users SET password_hash = $1 WHERE id = $2`, [
    hashedPassword,
    id,
  ]);
};

// VERIFY PASSWORD
const verifyPassword = async (plainPassword, hashedPassword) => {
  return bcrypt.compare(plainPassword, hashedPassword);
};

// DELETE USER
const deleteUser = async (id) => {
  await db.query(`DELETE FROM users WHERE id = $1`, [id]);
};

export {
  createUser,
  findUserByEmail,
  findUserById,
  updateUser,
  updatePassword,
  verifyPassword,
  deleteUser,
};
