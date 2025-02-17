import express from "express";
import { router } from "./routes/v1";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());
app.use(cookieParser());

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