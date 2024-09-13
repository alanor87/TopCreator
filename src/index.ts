import express from "express";
import { initServer } from "./server.js";
import { mongoDBconnection } from "./db.js";

const app = express();
const PORT = 3100;

mongoDBconnection
  .then(() => {
    app.listen(PORT, () => {
      initServer();
      console.log(
        `Server is running on port ${PORT}, data generation has started.`
      );
    });
  })
  .catch((error: any) => console.log("DB connection error : ", error));
