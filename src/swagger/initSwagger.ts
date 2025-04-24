import swaggerJsdoc, {Options} from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import YAML from "yamljs";
import fs from "fs";
import path from "node:path";
import {DATA_DIR} from "../server";

const swaggerOptions = (url: string): Options => ({
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
                description: "API server",
            }
        ],
    },
    apis: ["./src/routes/**/*.ts", "./src/models/**/*.ts"],
})

const swaggerDocs = (url: string) => {
    const swagger = swaggerJsdoc(swaggerOptions(url));
    generateSwaggerFile(swagger);
    return swagger;
}

const generateSwaggerFile = (swaggerObject: unknown) => {
    const swaggerYaml = YAML.stringify(swaggerObject, 4);
    fs.writeFileSync(path.join(DATA_DIR, "swagger.yaml"), swaggerYaml, 'utf-8')
}

export const swaggerInit = swaggerUi.serve;
export const swaggerUiInit = (url: string) => {
    return swaggerUi.setup(swaggerDocs(url), {swaggerUrl: url + '/swagger.yaml'}, undefined, undefined, undefined, url + '/swagger.yaml');
};
