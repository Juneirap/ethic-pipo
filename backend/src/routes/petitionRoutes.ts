import { Hono } from "hono";
import { getAllPetitions, addPetition, getPetitionById,getlatestpetition,updatePetition,searchPetitionsByPhoneNumber,getPetitionFilesByPetitionId, openFile } from "../controllers/petitionController";

const petitionRoutes = new Hono();

petitionRoutes.get("/all", getAllPetitions);

petitionRoutes.get("/latest", getlatestpetition);

petitionRoutes.get("/", getPetitionById);

petitionRoutes.post("/", addPetition);

petitionRoutes.put("/", updatePetition);

petitionRoutes.get("/search", searchPetitionsByPhoneNumber);

petitionRoutes.get("/files", getPetitionFilesByPetitionId);

petitionRoutes.get("/file/:filename", openFile);

export default petitionRoutes;