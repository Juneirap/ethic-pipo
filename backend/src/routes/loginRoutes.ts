import { Hono } from "hono";
import { getAuth, login, logout } from "../controllers/loginController";
const loginRoutes = new Hono();

loginRoutes.get("/check", getAuth);
loginRoutes.post("/login", login);
loginRoutes.post("/logout", logout);

export default loginRoutes;
