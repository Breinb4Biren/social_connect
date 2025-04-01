export const signupUser = 'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING *;';
export const loginUser = `SELECT id, username, password_hash AS password FROM users WHERE username = $1;`;
export const getMutualFriends = 'SELECT u.username AS mutual_friend FROM users u JOIN connections c1 ON u.id = c1.friend_id JOIN connections c2 ON u.id = c2.friend_id WHERE c1.user_id = $1 AND c2.user_id = $2;';
export const getUserFriends = 'SELECT u.username AS friend FROM users u JOIN connections c ON u.id = c.friend_id WHERE c.user_id = $1;';
export const searchUsersByName = `SELECT * FROM users WHERE username ILIKE $1;`;
