import express from "express";
import initRouter from "./routes/initRouter";
import {swaggerInit, swaggerUiInit} from "./swagger/initSwagger";

if (process.env.DEBUG_MODE === 'true') {
    require('dotenv').config({path: '.env.local-dev'});
} else {
    require('dotenv').config();
}

const getEnvVar = (name: string, defaultValue: string|undefined = undefined): string => {
    if(process.env[name]) {
        return process.env[name]
    } else {
        if(!defaultValue) {
            console.error(`Environment variable not set. Please set the "${name}"`)
            process.exit(1)
        } else {
            return defaultValue
        }
    }
}

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const port = getEnvVar("PORT", "3001");
const baseURI = getEnvVar("BASE_URI", "http://localhost");
const basePath = getEnvVar("BASE_PATH", "/api/v2")

const exposedURI = `${baseURI}${basePath}`

const router = initRouter;

router.use("/swagger", swaggerInit, swaggerUiInit(exposedURI));

app.use(basePath, router)

app.get('/', (req, res) => {
    res.send('Express + TypeScript Server. Hello World');
});

app.listen(port, () => {
    const swaggerUri = `http://localhost:${port}${basePath}/swagger`
    console.log(`[server]: Server is running on port ${port}`);
    console.log(`[server]: Swagger UI is running at ${swaggerUri}`);
    console.log(`[server]: Swagger YAML is running at ${swaggerUri}.yaml`);
    console.log(`[server]: Server can be exposed at ${exposedURI}`)
});
