import { User } from "@repo/schema/types";
import Phaser from "phaser";

export const MetaverseScene = (users: User[], 
    currentUser: User, 
    handleMove: (newX: number, newY: number) => void) => {
        
    class GameScene extends Phaser.Scene {
        private players: Phaser.GameObjects.Sprite[] = [];
    
        constructor() {
            super({ key: 'GameScene' });
        }
    
        preload() {
        }
    
        create(data: { users: User[]; currentUser: User }) {
            //const { users, currentUser } = data;
    
            users.forEach(user => {
                if(user.userId !== currentUser.userId) {
                    const sprite = this.add.sprite(user.x || 0, user.y || 0, `avatar-${user.userId}`);
                    this.players.push(sprite);
                }
            });
    
            const currentPlayer = this.add.sprite(currentUser.x || 0, currentUser.y || 0, `avatar-${currentUser.userId}`);
            this.players.push(currentPlayer);
            this.cameras.main.startFollow(currentPlayer);

            const cursors = this.input.keyboard?.createCursorKeys();
            this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
                const x = currentUser.x!;
                const y = currentUser.y!;
                if(cursors?.left.isDown) handleMove(x - 1, y);
                if(cursors?.right.isDown) handleMove(x + 1, y);
                if(cursors?.up.isDown) handleMove(x, y - 1);
                if(cursors?.down.isDown) handleMove(x, y + 1);
            });
        }

        update() {
            // Update player positions
            this.players.forEach((player, index) => {
              const user = this.players[index];
              player.setPosition(user.x, user.y);
            });
        }
    
        // updateUserPosition(userId: string, x: number, y: number) {
        //     if(userId === this.player.name) {
        //         this.player.setPosition(x, y);
        //     } else {
        //         const userSprite = this.users.get(userId);
        //         if(userSprite) {
        //             userSprite.setPosition(x, y);
        //         }
        //     }
        // }
    
        // addUser(user: User) {
        //     const sprite = this.add.sprite(user.x || 0, user.y || 0, 'user');
        //     this.users.set(user.userId!, sprite);
        // }
    
        // removeUser(userId: string) {
        //     const sprite = this.users.get(userId);
        //     if(sprite) {
        //         sprite.destroy();
        //         this.users.delete(userId);
        //     }
        // }
    }

    return GameScene;
}