import {Router} from "express";
import path from "node:path";
import dynamicRoutes from "./dynamicRoutes";

/**
 // * @swagger
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

export interface DataResponse {
    result: Record<string, unknown>;
    keys: string[];
    total: number;
    source: string;
}


const router = Router();

router.get('/swagger.yaml', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "swagger.yaml"));
});

router.get('/privacy-policy', (req, res) => {
    res.json({
        policy: "Our privacy pol" +
            "icy is simple: we do not share your information with third parties without your consent. However, please note that this application uses OpenAI's services, such as ChatGPT, which may collect and use some data. For more details, refer to OpenAI's privacy policy at https://openai.com/privacy/"
    });
});

// router.use("/population", populationRoutes);
// router.use("/income", incomeRoute);
// router.use("/demographics", demographicRoute);
// router.use("/mietpreise", mietpreisRoute);
// router.use("/apartments", apartmentRoute);
// router.use("/employment", employmentRoute);
router.use("/sparql", dynamicRoutes)

export default router;