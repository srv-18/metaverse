import z from "zod";

export const signupSchema = z.object({
    username: z.string().email(),
    password: z.string().min(8),
    type: z.enum(["admin", "user"]),
});

export const signinSchema = z.object({
    username: z.string().email(),
    password: z.string().min(8),
});

export const updateMetadataSchema = z.object({
    avatarId: z.string()
});

export const createSpaceSchema = z.object({
    name: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    mapId: z.string().optional()
});

export const addElementSchema = z.object({
    elementId: z.string(),
    spaceId: z.string(),
    x: z.number(),
    y: z.number()
});

export const createElementSchema = z.object({
    imageUrl: z.string(),
    width: z.number(),
    height: z.number(),
    static: z.boolean()
});

export const deleteElementSchema = z.object({
    id: z.string()
})

export const updateElementSchema = z.object({
    imageUrl: z.string()
});

export const createAvatarSchema = z.object({
    imageUrl: z.string(),
    name: z.string()
});

export const createMapSchema = z.object({
    thumbnail: z.string(),
    dimensions: z.string().regex(/^[0-9]{1,4}x[0-9]{1,4}$/),
    name: z.string(),
    defaultElements: z.array(z.object({
        elementId: z.string(),
        x: z.number(),
        y: z.number()
    }))
});

export const getUserIdsSchema = z.string().regex(/\b[a-z0-9]+\b/g);