import {Router} from "express";
import path from "node:path";
import dynamicRoutes from "./dynamicRoutes";
import {DATA_DIR} from "../server";


const router = Router();

router.get('/swagger.yaml', (_req, res) => {
    res.sendFile(path.join(DATA_DIR, "swagger.yaml"));
});

router.get('/privacy-policy', (_req, res) => {
    res.json({
        policy: "We do not share any information with third parties. Usage data is only used for monitoring issues. No personal data is stored."
    });
});

router.use("", dynamicRoutes)

export default router;
