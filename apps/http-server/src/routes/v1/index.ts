import { json, Router } from "express";
import { userRouter } from "./userRoutes";
import { adminRouter } from "./adminRoutes";
import { spaceRouter } from "./spaceRoutes";
import { signinSchema, signupSchema } from "@repo/schema/zodSchema";
import client from "@repo/db/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "../../config";
import { userMiddleware } from "../../middleware/user";

export const router = Router();

router.post("/signup", async (req, res) => {
    const parsedData = signupSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(403).json({message: "Invalid Input"});
        return
    }

    try {
        const hashedPassword = await bcrypt.hash(parsedData.data.password, 8);

        const user = await client.user.create({
            data: {
                username: parsedData.data.username,
                password: hashedPassword,
                role: parsedData.data.type === "admin" ? "Admin" : "User"
            }
        })

        res.status(200).json({
            userId: user.id
        })
        
    } catch(e) {
        res.status(403).json({ message: "User already exits"});
    }
})

router.post("/signin", async (req, res) => {
    const parsedData = signinSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(403).json({message: "Invalid Input"});
        return
    }
    try {
        const user = await client.user.findUnique({
            where: {
                username: parsedData.data.username
            }
        })
        if(!user) {
            res.status(404).json({message: "User not found"})
            return
        }
        const isValid = await bcrypt.compare(parsedData.data.password, user.password);
        if(!isValid) {
            res.status(403).json({message: "Invalid password"})
            return
        }
        const token = jwt.sign({
            userId: user.id,
            role: user.role
        }, JWT_PASSWORD);

        res.status(200).cookie("jwt", token, {
            maxAge: 10*24*60*60*1000,      //10 day
            httpOnly: true
        }).json({
            message: "Signin successful"
        })

    } catch(e) {
        res.status(500).json({ message: e})
    }
})

router.get("/avatars", userMiddleware, async (req, res) => {
    try {
        const avatars = await client.avatar.findMany({});

        res.status(200).json({
            avatars
        })
    } catch(e) {
        res.status(500).json({ message: e})
    }
})

router.get("/elements", userMiddleware, async (req, res) => {
    try {
        const elements = await client.element.findMany({});

        res.status(200).json({
            elements
        })
    } catch(e) {
        res.status(500).json({ message: e})
    }
})

router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/space", spaceRouter);