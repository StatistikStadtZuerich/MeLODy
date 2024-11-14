import express from "express";
import initRouter from "./routes/initRouter";
import {swaggerInit, swaggerUiInit} from "./swagger/initSwagger";

if (process.env.DEBUG_MODE === 'true') {
    require('dotenv').config({path: '.env.local-dev'});
} else {
    require('dotenv').config();
}

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());

const port = process.env.PORT;
const baseURI = process.env.BASE_URI;
const basePath = process.env.BASE_PATH || '/api/v2';
const publicURI = process.env.PUBLIC_URI;

if (!port || !baseURI || !basePath) {
    console.error(
        'Environment variables not set. Please set the following environment variables: PORT, BASE_URI, BASE_PATH'
    )
    process.exit(1)
}

const baseDestination = `${baseURI}:${port}`
const fullPath = `${baseDestination}${basePath}`
const fullPublicPath = publicURI ? `${publicURI}${basePath}` : fullPath;

const router = initRouter;

router.use("/swagger", swaggerInit, swaggerUiInit(fullPublicPath));

app.use(basePath, router)

app.get('/', (req, res) => {
    res.send('Express + TypeScript Server. Hello World');
});

app.listen(port, () => {
    console.log(`[server]: Server is running at ${baseDestination}`);
    console.log(`[server]: Swagger UI is running at ${fullPublicPath}/swagger`);
    console.log(`[server]: Swagger YAML is running at ${fullPath}/swagger.yaml`);
    if (publicURI) {
        console.log(`[server]: Server exposed at ${publicURI}`)
    }
});