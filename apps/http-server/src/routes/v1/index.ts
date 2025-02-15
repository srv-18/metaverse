import { Router } from "express";
import { userRouter } from "./userRoutes";
import { adminRouter } from "./adminRoutes";
import { spaceRouter } from "./spaceRoutes";

export const router = Router();

router.post("/signup", (req, res) => {
    res.json({
        "message": "signup"
    })
})

router.post("/signin", (req, res) => {
    res.json({
        "message": "signup"
    })
})

router.get("/avatars", (req, res) => {

})

router.get("/elements", (req, res) => {
    
})

router.use("/user", userRouter);
router.use("/admin", adminRouter);
router.use("/space", spaceRouter);