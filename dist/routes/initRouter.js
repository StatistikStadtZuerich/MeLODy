"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const node_path_1 = __importDefault(require("node:path"));
const populationRoutes_1 = __importDefault(require("./populationRoutes"));
const incomeRoute_1 = __importDefault(require("./incomeRoute"));
const demographicRoute_1 = __importDefault(require("./demographicRoute"));
const router = (0, express_1.Router)();
router.get('/swagger.yaml', (req, res) => {
    res.sendFile(node_path_1.default.join(__dirname, "..", "..", "swagger.yaml"));
});
router.get('/privacy-policy', (req, res) => {
    res.json({
        policy: "Our privacy policy is simple: we do not share your information with third parties without your consent. However, please note that this application uses OpenAI's services, such as ChatGPT, which may collect and use some data. For more details, refer to OpenAI's privacy policy at https://openai.com/privacy/"
    });
});
router.use("/population", populationRoutes_1.default);
router.use("/income", incomeRoute_1.default);
router.use("/demographics", demographicRoute_1.default);
exports.default = router;
