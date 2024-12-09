import {Router} from "express";
import path from "node:path";
import populationRoutes from "./populationRoutes";
import incomeRoute from "./incomeRoute";
import demographicRoute from "./demographicRoute";
import mietpreisRoute from "./mietpreisRoute";
import apartmentRoute from "./apartmentRoute";
import employmentRoute from "./employmentRoute";


const router = Router();

router.get('/swagger.yaml', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "swagger.yaml"));
});

router.get('/privacy-policy', (req, res) => {
    res.json({
        policy: "Wo do not share any information with third parties. Usage data is only used for monitoring issues. No personal data is stored."
    });
});

router.use("/population", populationRoutes);
router.use("/income", incomeRoute);
router.use("/demographics", demographicRoute);
router.use("/mietpreise", mietpreisRoute);
router.use("/apartments", apartmentRoute);
router.use("/employment", employmentRoute);

export default router;
