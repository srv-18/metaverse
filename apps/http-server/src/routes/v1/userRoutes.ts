import { getUserIdsSchema, updateMetadataSchema } from "@repo/schema/zodSchema";
import { Router } from "express";
import { userMiddleware } from "../../middleware/user";
import client from "@repo/db/client"

export const userRouter = Router();

userRouter.post("/metadata", userMiddleware, async (req, res) => {
    const parsedData = updateMetadataSchema.safeParse(req.body);
    if(!parsedData.success) {
        res.status(400).json({ message: "Invalid Input" });
        return
    }
    try {
        await client.user.update({
        where: {
            id: req.userId
        }, 
        data: {
            avatarId: parsedData.data.avatarId
        }
        })
        res.status(200).json({ message: "Updated the Avatar" });
    } catch(e) {
        res.status(500).json({ error: e })
    }
});

userRouter.get("/metadata/bulk", userMiddleware, async (req, res) => {
    const parsedData = getUserIdsSchema.safeParse(req.query.ids);
    if(!parsedData.success) {
        res.status(400).json({ message: "Invalid Input" });
        return
    }

    try {
        const userIdsString = parsedData.data ?? "[]"
        const userIds = userIdsString.slice(1, userIdsString.length - 2 ).split(",");

        const metadata = await client.user.findMany({
            where: {
                id: {
                    in: userIds
                }
            }, select: {
                id: true,
                avatar: true
            }
        })

        res.status(200).json({
            avatars: metadata.map(m => ({
                userId: m.id,
                imageUrl: m.avatar?.imageUrl
            }))
        })
    } catch(e) {
        res.status(500).json({ error: e })
    }
});
