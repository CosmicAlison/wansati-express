
import postgres from "postgres";

const sql = postgres(process.env.DATABASE_URL!);

export class MatchService {
  // Get all matches for a given user
  static async getUserMatches(req: any, res: any) {
    const userId = req.user.id;
    try {
      const matches = await sql`
        SELECT *
        FROM user_matches
        WHERE user_id = ${userId} OR matched_user_id = ${userId}
      `;
      return matches;
    } catch (err) {
      console.error("Error fetching user matches:", err);
      throw new Error("Failed to fetch matches");
    }
  }

  // Create a confirmed match between two users
  static async createMatch(userId: number, matchedUserId: number) {
    if (userId === matchedUserId) {
      throw new Error("Cannot match a user with themselves");
    }

    // Ensure user_id < matched_user_id
    const [lowId, highId] = userId < matchedUserId
      ? [userId, matchedUserId]
      : [matchedUserId, userId];

    // Check if match already exists
    const existing = await sql`
      SELECT * FROM user_matches
      WHERE user_id = ${lowId} AND matched_user_id = ${highId}
    `;

    if (existing.length > 0) {
      throw new Error("Match already exists");
    }

    // Insert match
    const match = await sql`
      INSERT INTO user_matches (user_id, matched_user_id, status, created_at)
      VALUES (${lowId}, ${highId}, 'confirmed', now())
      RETURNING *
    `;
    return match[0];
  }

  // Delete a match
  static async deleteMatch(userId: number, matchedUserId: number) {
    try {
      await sql`
        DELETE FROM user_matches
        WHERE (user_id = ${userId} AND matched_user_id = ${matchedUserId})
           OR (user_id = ${matchedUserId} AND matched_user_id = ${userId})
      `;
    } catch (err) {
      console.error("Error deleting match:", err);
      throw new Error("Failed to delete match");
    }
  }

static async getPotentialMatches(userId: number) {
  try {
    const potentialMatches = await sql`
      SELECT u.*
      FROM users u
      WHERE u.id != ${userId}
      AND NOT EXISTS (
        SELECT 1
        FROM user_matches m
        WHERE (m.user_id = ${userId} AND m.matched_user_id = u.id)
           OR (m.user_id = u.id AND m.matched_user_id = ${userId})
      )
    `;
    console.log(potentialMatches);
  } catch (err) {
    console.error("Error fetching potential matches:", err);
    throw new Error("Failed to fetch potential matches");
  }
}

}
