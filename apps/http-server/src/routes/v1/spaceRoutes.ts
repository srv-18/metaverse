import { addElementSchema, createSpaceSchema, deleteElementSchema } from "@repo/schema/zodSchema";
import { Router } from "express";
import client from "@repo/db/client"
import { userMiddleware } from "../../middleware/user";

export const spaceRouter = Router();

spaceRouter.post("/", userMiddleware, async (req, res) => {
    const parsedData = createSpaceSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({ message: "Invalid Input" })
        return
    }

    try {
        if(!parsedData.data.mapId) {
            const space = await client.space.create({
                data: {
                    name: parsedData.data.name,
                    width: parseInt(parsedData.data.dimensions.split("x")[0] as string),
                    height: parseInt(parsedData.data.dimensions.split("x")[1] as string),
                    creatorId: req.userId!
                }
            })
            res.status(200).json({ spaceId: space.id })
            return
        }
        
        const map = await client.map.findUnique({
            where: {
                id: parsedData.data.mapId
            }, select: {
                mapElements: true,
                width: true,
                height: true
            }
        })
        if(!map) {
            res.status(404).json({ message: "Map not found" })
            return
        }
        const space = await client.$transaction(async () => {
            const space = await client.space.create({
                data: {
                    name: parsedData.data.name,
                    width: map.width,
                    height: map.height,
                    creatorId: req.userId!
                }
            });
    
            await client.spaceElements.createMany({
                data: map.mapElements.map(e => ({
                    elementId: e.elementId,
                    spaceId: space.id,
                    x: e.x!,
                    y: e.y!
                }))
            });
    
            return space;
        })
    
        res.status(200).json({ spaceId: space.id })
    } catch(e) {
        res.status(500).json({ error: e })
    }
});

spaceRouter.delete("/element", userMiddleware, async (req, res) => {
    const parsedData = deleteElementSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(403).json({message: "Invalid Input" })
        return
    }
    try {
        const spaceElement = await client.spaceElements.findFirst({
            where: {
                id: parsedData.data.id,
            }, include: {
                space: true
            }
        })

        if(!spaceElement?.space.creatorId || spaceElement.space.creatorId !== req.userId) {
            res.status(403).json({ message: "Unauthorized" })
            return
        }
        await client.spaceElements.delete({
            where: {
                id: parsedData.data.id
            }
        })

        res.status(200).json({ message: "Element deleted" })
    } catch(e) {
        res.status(500).json({ error: e })
    }
});

spaceRouter.delete("/:spaceId", userMiddleware, async (req, res) => {
    try {
        const spaceId = req.params.spaceId;
        const space = await client.space.findUnique({
            where: {
                id: spaceId
            }, select: {
                creatorId: true
            }
        })
        if(!space) {
            res.status(404).json({ message: "Space not found" })
            return
        }

        if(space.creatorId !== req.userId) {
            res.status(403).json({ message: "Unauthorized" })
            return
        }

        await client.space.delete({
            where: {
                id: spaceId
            }
        })

        res.status(200).json({ message: "Space deleted" })
    } catch(e) {
        res.status(500).json({ error: e })
    }
});

spaceRouter.get("/all", userMiddleware, async (req, res) => {
    try {
        const spaces = await client.space.findMany({
            where: {
                creatorId: req.userId
            }
        });
    
        res.status(200).json({
            spaces: spaces.map(s => ({
                id: s.id,
                name: s.name,
                dimensions: `${s.width}x${s.height}`,
                thumbnail: s.thumbnail
            }))
        })
    } catch(e) {
        res.status(500).json({ error: e })
    }
});

spaceRouter.get("/:spaceId", userMiddleware, async (req, res) => {
    const spaceId = req.params.spaceId;
    try {
        const space = await client.space.findUnique({
            where: {
                id: spaceId
            },
            include: {
                elements: {
                    include: {
                        element: true
                    }
                }
            }
        })
        if(!space) {
            res.status(404).json({ message: "Space not found" })
            return
        }
    
        res.status(200).json({
            dimensions: `${space.width}x${space.height}`,
            elements: space.elements.map(e => ({
                id: e.id,
                x: e.x,
                y: e.y,
                element: e.element
            }))
        })
    } catch(e) {
        res.status(500).json({ error: e })
    }
});

spaceRouter.post("/element", userMiddleware, async (req, res) => {
    const parsedData = addElementSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(403).json({ message: "Invalid Input" })
        return
    }
    try {
        const space = await client.space.findUnique({
            where: {
                id: parsedData.data.spaceId,
                creatorId: req.userId
            }, select: {
                width: true,
                height: true
            }
        })

        if(!space) {
            res.status(404).json({ message: "Space not found" })
            return
        }

        if(req.body.x < 0 || req.body.y < 0 || req.body.x > space?.width || req.body.y > space?.height) {
            res.status(400).json({ message: "Point is outside of the boundary" })
            return
        }

        await client.spaceElements.create({
            data: {
                spaceId: parsedData.data.spaceId,
                elementId: parsedData.data.elementId,
                x: parsedData.data.x,
                y: parsedData.data.y
            }
        })
        
        res.status(200).json({ message: "Element added" })
    } catch(e) {
        res.status(500).json({ error: e })
    }
});
