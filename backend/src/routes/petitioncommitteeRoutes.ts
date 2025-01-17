import { Hono } from "hono";
import { 
    petitionCommitteeWithCommittee,
    addPetitionCommittee,
    deletePetitionCommittee,
    getPetitionCommitteeById

 } from "../controllers/petitioncommitteeController";

const petitioncommitteeRoutes = new Hono();

petitioncommitteeRoutes.get("/all", petitionCommitteeWithCommittee);
petitioncommitteeRoutes.post("/", addPetitionCommittee);
petitioncommitteeRoutes.delete("/", deletePetitionCommittee);
petitioncommitteeRoutes.get("/", getPetitionCommitteeById);

export default petitioncommitteeRoutes;