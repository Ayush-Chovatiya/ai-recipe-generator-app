import crypto from "crypto";

import db from "../config/db.js";

const RESET_TOKEN_TTL_MINUTES = 30;

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const createPasswordResetToken = async (userId) => {
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);

  await db.query(
    `UPDATE password_reset_tokens
     SET used_at = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND used_at IS NULL`,
    [userId],
  );

  const result = await db.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP + ($3 || ' minutes')::interval)
     RETURNING id, user_id, expires_at`,
    [userId, tokenHash, RESET_TOKEN_TTL_MINUTES],
  );

  return {
    ...result.rows[0],
    token,
  };
};

const findValidPasswordResetToken = async (token) => {
  const tokenHash = hashToken(token);

  const result = await db.query(
    `SELECT id, user_id, expires_at
     FROM password_reset_tokens
     WHERE token_hash = $1
       AND used_at IS NULL
       AND expires_at > CURRENT_TIMESTAMP`,
    [tokenHash],
  );

  return result.rows[0];
};

const markPasswordResetTokenUsed = async (id) => {
  await db.query(
    `UPDATE password_reset_tokens
     SET used_at = CURRENT_TIMESTAMP
     WHERE id = $1`,
    [id],
  );
};

export {
  createPasswordResetToken,
  findValidPasswordResetToken,
  markPasswordResetTokenUsed,
};
