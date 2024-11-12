import {Router} from "express";
import path from "node:path";
import populationRoutes from "./populationRoutes";
import incomeRoute from "./incomeRoute";
import demographicRoute from "./demographicRoute";


const router = Router();

router.get('/swagger.yaml', (req, res) => {
    res.sendFile(path.join(__dirname, "..", "..", "swagger.yaml"));
});

router.get('/privacy-policy', (req, res) => {
    res.json({
        policy: "Our privacy policy is simple: we do not share your information with third parties without your consent. However, please note that this application uses OpenAI's services, such as ChatGPT, which may collect and use some data. For more details, refer to OpenAI's privacy policy at https://openai.com/privacy/"
    });
});

router.use("/population", populationRoutes);
router.use("/income", incomeRoute);
router.use("/demographics", demographicRoute);
export default router;