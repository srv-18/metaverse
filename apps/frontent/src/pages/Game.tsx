import { memo, useEffect, useRef, useState } from "react";
import { GameComponent } from "../components/GameComponent";
import { User, WebSocketMessage } from "@repo/schema/types";

export const Game = memo(() => {
    const wsRef = useRef<WebSocket>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [currentUser, setCurrentUser] = useState<User>({});

    useEffect(() => {
        // const urlParams = new URLSearchParams(window.location.search);
        // const token = urlParams.get('token') || '';
        // const spaceId = urlParams.get('spaceId') || '';
        const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjbTc2OTU1OXYwMDAwY2k5bzMwaXVhMHlpIiwicm9sZSI6IkFkbWluIiwiaWF0IjoxNzQwMDUxODkyfQ.Idsu1QLUSGu2EZvsZQqBcAHB6HjWQvwbxBKaY9TQ64A";
        const spaceId = "cm79ak9950001civexcwppm1j";

        wsRef.current = new WebSocket("ws://localhost:3001");

        wsRef.current.onopen = () => {
            wsRef.current?.send(JSON.stringify({
                type: 'join',
                payload: {
                  spaceId,
                  token
                }
            }));
        };

        wsRef.current.onmessage = (event) => {
            const message = JSON.parse(event.data);
            handleWebSocketMessage(message);
        };

        return () => {
            if(wsRef.current) {
                wsRef.current.close();
            }
        };
    }, []);

    const handleWebSocketMessage = (message: WebSocketMessage) => {
        switch(message.type) {
            case "space-joined":
                setCurrentUser({
                    x: message.payload.spawn.x,
                    y: message.payload.spawn.y
                });

                message.payload.users.forEach((user: User) => {
                    users.push(user);
                });
                setUsers(users);
                break;
            
            case "movement-rejected":
                setCurrentUser({
                    x: message.payload.x,
                    y: message.payload.y
                })
                break;

            case "movement":
                const movedUsers = users.map(u => {
                    if(u.userId === message.payload.userId) {
                        const user = {
                            userId: u.userId,
                            x: message.payload.x,
                            y: message.payload.y
                        }
                        return user;
                    }
                    return u;
                })
                setUsers(movedUsers);
                break;

            case "user-left":
                const userLeft = users.filter(u => { u.userId !== message.payload.userId });
                setUsers(userLeft);
                break;

            case "user-join":
                setUsers([...users, {
                    userId: message.payload.userId,
                    x: message.payload.x,
                    y: message.payload.y
                }]);
                break;
        }
    }

    const handleMove = (newX: number, newY: number) => {
        if (!currentUser) return;
        
        wsRef.current?.send(JSON.stringify({
            type: "move",
            payload: {
                x: newX,
                y: newY
            }
        }));
    };

    return <div>
        game
        <GameComponent 
            handleMove={handleMove}
            users={users}
            currentUser={currentUser}
        />
    </div>
})
