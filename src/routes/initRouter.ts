import {Router} from "express";
import path from "node:path";
import dynamicRoutes from "./dynamicRoutes";


const router = Router();

router.get('/swagger.yaml', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "swagger.yaml"));
});

router.get('/privacy-policy', (req, res) => {
    res.json({
        policy: "We do not share any information with third parties. Usage data is only used for monitoring issues. No personal data is stored."
    });
});

router.use("", dynamicRoutes)

export default router;
