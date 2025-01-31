import { Hono } from "hono";
import {
  getAllPetitions,
  addPetition,
  getPetitionById,
  getlatestpetition,
  updatePetition,
  searchPetitionsByPhoneNumber,
  getPetitionFilesByPetitionId,
  openFile,
  getAllPetitionsSubcommittee,deletePetition
} from "../controllers/petitionController";
import { authMiddleware } from "../middleware/authMiddleware";


const petitionRoutes = new Hono();

petitionRoutes.get("/all", getAllPetitions);

petitionRoutes.get("/latest", getlatestpetition);

petitionRoutes.get("/", getPetitionById);

petitionRoutes.post("/", addPetition);

petitionRoutes.put("/", updatePetition);

petitionRoutes.delete("/", deletePetition);

petitionRoutes.get("/search", searchPetitionsByPhoneNumber);

petitionRoutes.get("/files", getPetitionFilesByPetitionId);

petitionRoutes.get("/file/:filename", openFile);

petitionRoutes.get("/subcommittee", authMiddleware, getAllPetitionsSubcommittee);

export default petitionRoutes;
