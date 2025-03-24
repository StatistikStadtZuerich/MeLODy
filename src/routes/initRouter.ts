import {Router} from "express";
import path from "node:path";
import incomeRoute from "./incomeRoute";
import demographicRoute from "./demographicRoute";
import mietpreisRoute from "./mietpreisRoute";
import apartmentRoute from "./apartmentRoute";
import employmentRoute from "./employmentRoute";
import populationRoutes from "./populationRoutes";

/**
 * @swagger
 * components:
 *   schemas:
 *     DataResponse:
 *       type: object
 *       description: Response format data queries
 *       properties:
 *         result:
 *           type: object
 *           additionalProperties:
 *             type: object
 *           description: The grouped data
 *         keys:
 *           type: array
 *           items:
 *             type: string
 *           description: The keys used for grouping the data
 *         total:
 *           type: integer
 *           description: The total number of records found
 *         source:
 *           type: string
 *           description: The source of the data
 */

const router = Router();

router.get('/swagger.yaml', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "swagger.yaml"));
});

router.get('/privacy-policy', (req, res) => {
    res.json({
        policy: "We do not share any information with third parties. Usage data is only used for monitoring issues. No personal data is stored."
    });
});

router.use("/population", populationRoutes);
router.use("/income", incomeRoute);
router.use("/demographics", demographicRoute);
router.use("/mietpreise", mietpreisRoute);
router.use("/apartments", apartmentRoute);
router.use("/employment", employmentRoute);

export default router;
