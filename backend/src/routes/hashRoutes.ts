import { Hono } from "hono";
import { md5 } from "../controllers/hashController";

const app = new Hono();

app.get("/md5/:inputTxt", md5);

export default app;
