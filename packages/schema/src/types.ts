
export interface User {
    userId?: string;
    username?: string;
    avatarId?: string;
    x?: number;
    y?: number;
}

export interface Avatar {
    id: string;
    imageUrl: string;
    name: string;
}

export interface Element {
    id: string;
    elementId: string;
    x: number;
    y: number;
    imageUrl: string;
    width: number;
    height: number;
    static: boolean;
}

export interface Space {
    id: string;
    name: string;
    dimensions: string;
    elements: Element[];
    users: User[];
}

export interface WebSocketMessage {
    type: string;
    payload: any;
}

export interface GameComponentProps {
    users: User[];
    currentUser: User;
    handleMove: (newX: number, newY: number) => void;
}