import { Hono } from "hono";
import { getCommitteeById, getAllCommitteesWithPrenameCommitteePosition, addCommittee, deleteCommittee } from "../controllers/committeeController";

import { authMiddleware } from "../middleware/authMiddleware";

const committeeRoutes = new Hono();

committeeRoutes.get("/", authMiddleware, getCommitteeById);
committeeRoutes.get("/all", authMiddleware, getAllCommitteesWithPrenameCommitteePosition);

committeeRoutes.post("/", authMiddleware, addCommittee);

committeeRoutes.delete("/", authMiddleware, deleteCommittee);

export default committeeRoutes;