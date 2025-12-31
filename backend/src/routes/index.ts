import { Router } from "express";
import articleRoutes from "./articleRoutes";

const router = Router();

router.use("/articles", articleRoutes);

export default router;
