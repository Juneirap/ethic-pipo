import {Hono} from "hono";
import {getAllPrename} from "../controllers/prenameController";

const prenameRoutes = new Hono();

prenameRoutes.get("/all", getAllPrename);

export default prenameRoutes;