import express from "express";
import { router } from "./routes/v1";
import client from "@repo/db/client";

const app = express();

app.use("/api/v1", router);

app.get("/", (req, res) => {
    res.json({
        "message": "Hello, World!"
    })
})

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`http server listening on port ${port}`);
});