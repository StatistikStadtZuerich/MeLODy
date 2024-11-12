"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const initRouter_1 = __importDefault(require("./routes/initRouter"));
const initSwagger_1 = require("./swagger/initSwagger");
if (process.env.DEBUG_MODE === 'true') {
    require('dotenv').config({ path: '.env.local-dev' });
}
else {
    require('dotenv').config();
}
const app = (0, express_1.default)();
app.use(express_1.default.urlencoded({ extended: true }));
app.use(express_1.default.json());
const port = process.env.PORT;
const baseURI = process.env.BASE_URI;
const basePath = process.env.BASE_PATH;
if (!port || !baseURI || !basePath) {
    console.error('Environment variables not set. Please set the following environment variables: PORT, BASE_URI, BASE_PATH');
    process.exit(1);
}
const baseDestination = `${baseURI}`;
const fullPath = `${baseDestination}${basePath}`;
const router = initRouter_1.default;
router.use("/swagger", initSwagger_1.swaggerInit, (0, initSwagger_1.swaggerUiInit)(fullPath));
app.use(basePath, router);
app.get('/', (req, res) => {
    res.send('Express + TypeScript Server. Hello World');
});
app.listen(port, () => {
    console.log(`[server]: Server is running at ${baseDestination}`);
    console.log(`[server]: Swagger UI is running at ${baseDestination}/api-docs`);
    console.log(`[server]: Swagger YAML is running at ${fullPath}/swagger.yaml`);
});
