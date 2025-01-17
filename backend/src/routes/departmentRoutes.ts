import { Hono } from "hono";
import { getAllDepartmentsWithFaculty, getDepartmentById, getidallDepartmentsforfacultyidshowfaculty, getIdfaculty, getdepartmentbyname } from "../controllers/departmentController";

const departmentRoutes = new Hono();

departmentRoutes.get("/all", getAllDepartmentsWithFaculty);
departmentRoutes.get("/", getDepartmentById);
departmentRoutes.get("/Byfaculty", getidallDepartmentsforfacultyidshowfaculty);
departmentRoutes.get("/faculty", getIdfaculty);
departmentRoutes.get("/name", getdepartmentbyname);

export default departmentRoutes;