import { WebSocket } from "ws";
import { OutgoingMessage } from "./types";
import client from "@repo/db/client"
import { RoomManager } from "./RoomManager";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config";

function getRandomString(length: number) {
    const characters = "QWERTYUIOPASDFGHJKLZXCVBNMqwertyuiopasdfghjklzxcvbnm1234567890";
    let result = "";
    for(let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

export class User {
    public id: string;           //random generated Id
    public userId?: string       //db userId
    private spaceId?: string;
    private x: number;
    private y: number;
    private ws: WebSocket;

    constructor(ws: WebSocket) {
        this.id = getRandomString(10);
        this.x = 0;
        this.y = 0;
        this.ws = ws;
        this.initHandlers();
    }

    initHandlers() {
        this.ws.on("message", async (data) => {
            const parsedData = JSON.parse(data.toString());
            switch (parsedData.type) {
                case "join":
                    const spaceId = parsedData.payload.spaceId;
                    const token = parsedData.payload.token;
                    const decoded = jwt.verify(token, JWT_PASSWORD) as { role: string, userId: string};
                    const userId = decoded.userId;
                    if(!userId) {
                        this.ws.close();
                        return;
                    }
                    this.userId = userId;
                    const space = await client.space.findFirst({
                        where: {
                            id: spaceId
                        }
                    })
                    if(!space) {
                        this.ws.send("No such space exist")
                        this.ws.close()
                        return
                    }
                    this.spaceId = spaceId;
                    this.x = Math.floor(Math.random() * space.width);
                    this.y = Math.floor(Math.random() * space.height);
                    RoomManager.getInstance().addUser(spaceId, this);
                    this.send({
                        type: "space-joined",
                        payload: {
                            spawn: {
                                x: this.x,
                                y: this.y
                            },
                            users: RoomManager.getInstance().rooms.get(spaceId)?.filter(u => u.id !== this.id)?.map(u => ({
                                userId: u.userId,
                                x: u.x,
                                y: u.y
                            })) ?? []
                        }
                    });

                    RoomManager.getInstance().broadcast({
                        type: "user-join",
                        payload: {
                            userId: this.userId,
                            x: this.x,
                            y: this.y
                        }
                    }, this, this.spaceId!);
                    break;

                case "move":
                    const moveX = parsedData.payload.x;
                    const moveY = parsedData.payload.y;
                    const xDisplacemnet = Math.abs(this.x - moveX);
                    const yDisplacement = Math.abs(this.y - moveY);
                    if(xDisplacemnet == 1 && yDisplacement == 0 || xDisplacemnet == 0 && yDisplacement == 1) {
                        this.x = moveX;
                        this.y = moveY;
                        RoomManager.getInstance().broadcast({
                            type: "movement",
                            payload: {
                                x: this.x,
                                y: this.y,
                                userId: this.userId
                            }
                        }, this, this.spaceId!);
                        return
                    }

                    this.send({
                        type: "movement-rejected",
                        payload: {
                            x: this.x,
                            y: this.y
                        }
                    });
                    break;
            }
        })
    }

    destroy() {
        RoomManager.getInstance().broadcast({
            type: "user-left",
            payload: {
                userId: this.userId
            }
        }, this, this.spaceId!);
        RoomManager.getInstance().removeUser(this, this.spaceId!);
    }

    send(payload: OutgoingMessage) {
        this.ws.send(JSON.stringify(payload));
    }
}