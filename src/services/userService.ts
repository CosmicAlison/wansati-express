
import postgres from 'postgres';

const sql = postgres({}); // e.g., postgres://user:pass@host:port/db

export class UserService {
  static async createUser(userData: { name: string; email: string; password: string }) {
    const existingUser = await sql`SELECT * FROM users WHERE email = ${userData.email}`;

    if (existingUser.length > 0) {
      const error = new Error('User with this email already exists') as Error & { code: string };
      error.code = 'USER_EXISTS';
      throw error;
    }

    const [user] = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${userData.name}, ${userData.email}, ${userData.password})
      RETURNING *
    `;

    return user;
  }

  static async getUsers(page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const users = await sql`
      SELECT * FROM users
      ORDER BY id
      LIMIT ${limit} OFFSET ${offset}
    `;

    const [{ count }] = await sql`SELECT COUNT(*)::int AS count FROM users`;

    return { users, total: count };
  }

  static async getUserById(id: number) {
    const [user] = await sql`SELECT * FROM users WHERE id = ${id}`;
    return user || null;
  }

  static async getUserByEmail(email: string) {
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
    return user || null;
  }
}
