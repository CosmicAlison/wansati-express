import { Router } from "express";
import  MatchController  from "../controllers/matchController";
import authenticateToken from "../middleware/authenticateToken";

const router = Router();

router.get("/", authenticateToken, MatchController.getUserMatches);
router.post("/", authenticateToken, MatchController.createMatch);
router.delete("/:targetUserId", authenticateToken, MatchController.deleteMatch);
router.get("/potential", authenticateToken, MatchController.getPotentialMatches);

export default router;
