import { Hono } from "hono";
import { 
    getResearcherById, 
    getAllResearchersWithPrenameDepartmentFaculty, 
    addResearcher, 
    getResearchersByName, 
    getlatestResearcher, 
    verifyResearcherByPhoneAndPetition,
  } from "../controllers/researcherController";
  

const researcherRoutes = new Hono();

researcherRoutes.get("/", getResearcherById);
researcherRoutes.get("/all", getAllResearchersWithPrenameDepartmentFaculty);
researcherRoutes.get("/name", getResearchersByName);
researcherRoutes.get("/latest", getlatestResearcher);
researcherRoutes.get("/verify", verifyResearcherByPhoneAndPetition);
researcherRoutes.post("/", addResearcher);

export default researcherRoutes;
