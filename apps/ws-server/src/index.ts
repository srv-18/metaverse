import { WebSocketServer } from "ws";
import { User } from "./User";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", function connection(ws) {
    ws.on("error", console.error);
    const user = new User(ws);

    ws.on("close", function () {
        user.destroy();
    })
})