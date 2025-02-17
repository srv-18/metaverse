import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../config";
import { NextFunction, Request, Response } from "express";

export const adminMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.jwt;

    if(!token) {
        res.status(401).json({ message: "No authentication token" });
        return
    }

    try {
        const decoded = jwt.verify(token, JWT_PASSWORD) as { role: string, userId: string};
        if(decoded.role !== "Admin") {
            res.status(401).json({ message: "Unauthorized" });
            return
        }
        req.userId = decoded.userId;
        next();
    } catch(e) {
        res.status(401).json({ message: "Unauthorized" });
    }
}