import React, { memo, useEffect, useRef } from "react";
import Phaser from "phaser";
import { GameComponentProps } from "@repo/schema/types";
import { MetaverseScene } from "../game/scenes/MetaverseScene";

export const GameComponent: React.FC<GameComponentProps> = memo(({
    users,
    currentUser,
    handleMove
}) => {
    const gameContainerRef = useRef<HTMLDivElement>(null);
    const gameRef = useRef<Phaser.Game | null>(null);

    useEffect(() => {
        const config: Phaser.Types.Core.GameConfig = {
            type: Phaser.AUTO,
            width: 800,
            height: 600,
            parent: gameContainerRef.current,
            physics: {
                default: 'arcade',
                arcade: {
                    gravity: { y:0 , x:0 },
                    debug: true
                }
            },
            scene: [MetaverseScene(users, currentUser, handleMove)],
            // scale: {
            //     mode: Phaser.Scale.FIT,
            //     autoCenter: Phaser.Scale.CENTER_BOTH
            // }
        }

        gameRef.current = new Phaser.Game(config);

        return () => {
            gameRef.current?.destroy(true);
            gameRef.current = null;
        }
    }, [users, currentUser]);

    // useEffect(() => {
    //     gameRef.current?.scene.start("MetaverseScene", {
    //         users: users,
    //         currentUser: currentUser,
    //     });

    //     const scene = gameRef.current?.scene.getScene("MetaverseScene") as MetaverseScene;

    //     const cursors = scene.input.keyboard?.createCursorKeys();
    //     scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
    //         const { x, y } = scene.player;
    //         if(cursors?.left.isDown) handleMove(x - 1, y);
    //         if(cursors?.right.isDown) handleMove(x + 1, y);
    //         if(cursors?.up.isDown) handleMove(x, y - 1);
    //         if(cursors?.down.isDown) handleMove(x, y + 1);
    //     });

    //     // scene.updateUserPosition = onUserMoved;
    //     // scene.addUser = onUserJoined;
    //     // scene.removeUser = onUserLeft;

    // }, [users, currentUser]);

    return <div ref={gameContainerRef}/>
})