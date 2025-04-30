import express from "express";
import initRouter from "./routes/initRouter";
import {swaggerInit, swaggerUiInit} from "./swagger/initSwagger";
import path from "node:path";
import os from "node:os";
import {randomUUID} from "node:crypto";
import fs from "fs";
import {readynessRouter} from "./routes/dynamicRoutes";

// Record the start time when server.ts begins execution
const serverStartTime = Date.now();

if (process.env.DEBUG_MODE === 'true') {
    require('dotenv').config({path: '.env.local-dev'});
} else {
    require('dotenv').config();
}

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());

export const DATA_SOURCE_BASE_URL = process.env.DATA_SOURCE_BASE_URL || "https://ld.integ.stzh.ch/statistics/view/";
export const SPARQL_ENDPOINT = process.env.SPARQL_ENDPOINT || "https://ld.test.stzh.ch/query";

const getDataDir = () => {
    const dataDir = process.env.DATA_DIR || path.join(os.tmpdir(), 'melody-data-' + randomUUID());

    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }
    } catch (err) {
        console.error(err);
    }
    return dataDir;
}

export const DATA_DIR = getDataDir();

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

app.use("", readynessRouter);

app.get('/', (req, res) => {
    res.send('Express + TypeScript Server. Hello World');
});

app.get('/_/health/:tag?', (req, res) => {
    console.info(`[server]: Health check received; Tag = ${req.params.tag}`);
    res.status(200).send();
});


app.listen(port, () => {
    const startupTime = Date.now() - serverStartTime;
    console.log(`[server]: Server started in ${startupTime}ms`);
    console.log(`[server]: Server is running at ${baseDestination}`);
    console.log(`[server]: Swagger UI is running at ${fullPublicPath}/swagger`);
    console.log(`[server]: Swagger YAML is running at ${fullPath}/swagger.yaml`);
    if (publicURI) {
        console.log(`[server]: Server exposed at ${publicURI}`)
    }
});