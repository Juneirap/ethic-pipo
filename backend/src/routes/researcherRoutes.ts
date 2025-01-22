// import { Hono } from "hono";
// import { getResearcherById, getAllResearchersWithPrenameDepartmentFaculty, addResearcher, getResearchersByName,getlatestResearcher  } from "../controllers/researcherController";

// const researcherRoutes = new Hono();

// researcherRoutes.get("/", getResearcherById);
// researcherRoutes.get("/all", getAllResearchersWithPrenameDepartmentFaculty);
// researcherRoutes.get("/name", getResearchersByName);
// researcherRoutes.get("/latest", getlatestResearcher);

// researcherRoutes.post("/", addResearcher);

// export default researcherRoutes;

import { Hono } from "hono";
import { 
    getResearcherById, 
    getAllResearchersWithPrenameDepartmentFaculty, 
    addResearcher, 
    getResearchersByName, 
    getlatestResearcher, 
    verifyResearcherByPhone,
  } from "../controllers/researcherController";
  

const researcherRoutes = new Hono();

researcherRoutes.get("/", getResearcherById);
researcherRoutes.get("/all", getAllResearchersWithPrenameDepartmentFaculty);
researcherRoutes.get("/name", getResearchersByName);
researcherRoutes.get("/latest", getlatestResearcher);
researcherRoutes.get("/verify", verifyResearcherByPhone);
researcherRoutes.post("/", addResearcher);

export default researcherRoutes;
