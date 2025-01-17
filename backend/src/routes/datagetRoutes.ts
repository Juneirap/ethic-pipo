import { Hono } from "hono";
import { getallDocumentType,getallType,getallGrant,getallObjectiveType,getallResearchType,getIdGrant,getIdObjectiveType,getIdResearchType,getIdType,getDocumentTypeById } from "../controllers/datagetController";

const datagetRoutes = new Hono();

datagetRoutes.get("/documenttype", getallDocumentType);
datagetRoutes.get("/type", getallType);
datagetRoutes.get("/grant", getallGrant);
datagetRoutes.get("/objective", getallObjectiveType);
datagetRoutes.get("/research", getallResearchType);

datagetRoutes.get("/idgrant", getIdGrant);
datagetRoutes.get("/idobjective", getIdObjectiveType);
datagetRoutes.get("/idresearch", getIdResearchType);
datagetRoutes.get("/idtype", getIdType);
datagetRoutes.get("/documenttype1_11", getDocumentTypeById);

export default datagetRoutes;