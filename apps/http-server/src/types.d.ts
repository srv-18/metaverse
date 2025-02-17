export {};

type role = "admin" | "User";

declare global {
    namespace Express {
        export interface Request {
            userId?: string,
            role?: role
        }
    }
}