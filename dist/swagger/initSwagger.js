"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.swaggerUiInit = exports.swaggerInit = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const fs_1 = __importDefault(require("fs"));
const node_path_1 = __importDefault(require("node:path"));
const swaggerOptions = (url) => ({
    definition: {
        openapi: "3.1.0",
        info: {
            title: "SSZ ChatGPT Prototype",
            version: "1.0.0",
            description: "API description",
        },
        servers: [
            {
                url,
                description: "Local server",
            }
        ],
    },
    apis: ["./src/routes/**/*.ts", "./src/models/**/*.ts"],
});
const swaggerDocs = (url) => {
    const swagger = (0, swagger_jsdoc_1.default)(swaggerOptions(url));
    generateSwaggerFile(swagger);
    return swagger;
};
const generateSwaggerFile = (swaggerObject) => {
    const swaggerYaml = yamljs_1.default.stringify(swaggerObject, 4);
    fs_1.default.writeFileSync(node_path_1.default.join(__dirname, "..", "..", "swagger.yaml"), swaggerYaml, 'utf-8');
};
exports.swaggerInit = swagger_ui_express_1.default.serve;
const swaggerUiInit = (url) => {
    return swagger_ui_express_1.default.setup(swaggerDocs(url), { swaggerUrl: url + '/swagger.yaml' }, undefined, undefined, undefined, url + '/swagger.yaml');
};
exports.swaggerUiInit = swaggerUiInit;
