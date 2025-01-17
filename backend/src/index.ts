import { Hono } from "hono";

import { cors } from "hono/cors";
import { logger } from "hono/logger";

import staffRoutes from "./routes/staffRoutes";
import researcherRoutes from "./routes/researcherRoutes";
import petitionRoutes from "./routes/petitionRoutes";
import committeeRoutes from "./routes/committeeRoutes";
import petitioncommitteeRoutes from "./routes/petitioncommitteeRoutes";
import departmentRoutes from "./routes/departmentRoutes";
import loginRoutes from "./routes/loginRoutes";
import fileRoutes from "./routes/fileRoutes";
import datagetRoutes from "./routes/datagetRoutes";
import uploadRoutes from "./routes/uploadRoutes";
import prenameRoutes from "./routes/prenameRoutes";

const app = new Hono();

// Middleware
app.use("*", logger());

app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.get("/", (c) => c.json({ msg: "Hello Hono!" }));

app.route("/staff", staffRoutes);
app.route("/researchers", researcherRoutes);
app.route("/petitions", petitionRoutes);
app.route("/committees", committeeRoutes);
app.route("/petitioncommittees", petitioncommitteeRoutes);
app.route("/departments", departmentRoutes);
app.route("/auth", loginRoutes);
app.route("/files", fileRoutes);
app.route("/dataget", datagetRoutes);
app.route("/upload", uploadRoutes);
app.route("/prename", prenameRoutes);

export default {
  host: "0.0.0.0",
  port: 8000,
  fetch: app.fetch,
};
