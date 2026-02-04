import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import usersRoutes from "./routes/user.routes.js";
import leadsRoutes from "./routes/lead.routes.js";
import contactsRoutes from "./routes/contact.routes.js";
import notesRoutes from "./routes/note.routes.js";
import tasksRoutes from "./routes/task.routes.js";
import timelineRoutes from "./routes/timeline.routes.js";



const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRoutes);
app.use("/users", usersRoutes);
app.use("/leads", leadsRoutes);
app.use("/contacts", contactsRoutes);

app.use("/", notesRoutes);
app.use("/", tasksRoutes);
app.use("/", timelineRoutes);




export default app;