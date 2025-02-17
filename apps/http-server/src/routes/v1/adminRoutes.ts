import { createAvatarSchema, createElementSchema, createMapSchema, updateElementSchema } from "@repo/schema/zodSchema";
import { Router } from "express";
import { adminMiddleware } from "../../middleware/admin";
import client from "@repo/db/client"

export const adminRouter = Router();

adminRouter.post("/element", adminMiddleware, async (req, res) => {
    const parsedData = createElementSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({ message: "Invalid Input" })
        return
    }
    try {
        const element = await client.element.create({
            data: {
                width: parsedData.data.width,
                height: parsedData.data.height,
                static: parsedData.data.static,
                imageUrl: parsedData.data.imageUrl
            }
        })
    
        res.status(200).json({ id: element.id })
    } catch(e) {
        res.status(500).json({ error: e })
    }
});

adminRouter.put("/element/:elementId", adminMiddleware, async (req, res) => {
    const parsedData = updateElementSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({ message: "Invalid Input" })
        return
    }
    try {
        await client.element.update({
            where: {
                id: req.params.elementId
            },
            data: {
                imageUrl: parsedData.data.imageUrl
            }
        })

        res.status(200).json({ message: "Element updated" })
    } catch(e) {
        res.status(403).json({ message: "Incorrect element id" })
    }
});

adminRouter.post("/avatar", adminMiddleware, async (req, res) => {
    const parsedData = createAvatarSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({ message: "Invalid Input" })
        return
    }
    try {
        const avatar = await client.avatar.create({
            data: {
                imageUrl: parsedData.data.imageUrl,
                name: parsedData.data.name
            }
        })
    
        res.status(200).json({ avatarId: avatar.id })
    } catch(e) {
        res.status(500).json({ error: e })
    }
});

adminRouter.post("/map", adminMiddleware, async (req, res) => {
    const parsedData = createMapSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({ message: "Invalid Input" })
        return
    }
    try {
        const map = await client.map.create({
            data: {
                name: parsedData.data.name,
                width: parseInt(parsedData.data.dimensions.split("x")[0] as string),
                height: parseInt(parsedData.data.dimensions.split("x")[1] as string),
                thumbnail: parsedData.data.thumbnail,
                mapElements: {
                    create: parsedData.data.defaultElements.map(e => ({
                        elementId: e.elementId,
                        x: e.x,
                        y: e.y
                    }))
                }
            }
        })

        res.status(200).json({ id: map.id })
    } catch(e) {
        res.status(500).json({ error: e })
    }
});