import { Hono } from "hono";
import { getAllFilesWithPetitionandDocumentType, getFileById } from "../controllers/fileController";

const fileRoutes = new Hono();

fileRoutes.get("/all", getAllFilesWithPetitionandDocumentType);
fileRoutes.get("/", getFileById);

export default fileRoutes;