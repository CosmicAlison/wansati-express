import postgres from "postgres";
import { MatchService } from "./matchService";

const sql = postgres(process.env.DATABASE_URL!);

export class SwipeService {
  // Create a swipe from current user to target user
  static async createSwipe(swiperId: number, targetId: number) {
    if (swiperId === targetId) {
      throw new Error("Cannot swipe on yourself");
    }

    // Check if target has already swiped on current user
    const targetUser = await sql`
      SELECT swiped_users
      FROM users
      WHERE id = ${targetId}
    `;

    if (!targetUser || targetUser.length === 0) {
      throw new Error("Target user not found");
    }

    const swipedByTarget: number[] = targetUser[0].swiped_users || [];

    if (swipedByTarget.includes(swiperId)) {
      // Both users swiped → create a match
      const match = await MatchService.createMatch(swiperId, targetId);

      // Remove swiperId from target's swiped_users array
      await sql`
        UPDATE users
        SET swiped_users = array_remove(swiped_users, ${swiperId})
        WHERE id = ${targetId}
      `;

      return { matched: true, match };
    }

    // Otherwise, add targetId to current user's swiped_users array
    await sql`
      UPDATE users
      SET swiped_users = array_append(COALESCE(swiped_users, '{}'), ${targetId})
      WHERE id = ${swiperId}
    `;

    return { matched: false };
  }
}
