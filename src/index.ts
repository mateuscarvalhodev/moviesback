import express from "express";
import cors from "cors";
import { router } from "./app/http/routes/index.js";
import "./app/services/scheduler/release-cron.js";

const app = express();

app.use(express.json());

app.use(cors());

app.use("/", router);

app.listen(3000, () => {
  console.log("O servidor está rodando na porta 3000");
});
