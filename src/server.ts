import express from "express";
import initRouter from "./routes/initRouter";
import {swaggerInit, swaggerUiInit} from "./swagger/initSwagger";
import path from "node:path";
import os from "node:os";
import {randomUUID} from "node:crypto";
import fs from "fs";
import {readynessRouter} from "./routes/dynamicRoutes";
import logger, {stream} from "./utils/logger";
import morgan from "morgan";

declare global {
    namespace Express {
        interface Request {
            requestId: string;
        }
    }
}

const serverStartTime = Date.now();

if (process.env.DEBUG_MODE === 'true') {
    require('dotenv').config({path: '.env.local-dev'});
} else {
    require('dotenv').config();
}

const app = express();
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use((req, _res, next) => {
    req.requestId = randomUUID();
    next();
});

morgan.token('request-id', (req: any) => req.requestId);
app.use(morgan('[:request-id] :remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"', {stream}));

export const DATA_SOURCE_BASE_URL = process.env.DATA_SOURCE_BASE_URL || "https://ld.integ.stzh.ch/statistics/view/";
logger.info(`Using data source base URL: ${DATA_SOURCE_BASE_URL}`);
export const SPARQL_ENDPOINT = process.env.SPARQL_ENDPOINT || "https://ld.test.stzh.ch/query";
logger.info(`Using SPARQL endpoint: ${SPARQL_ENDPOINT}`);
logger.info(`Environment: ${process.env.NODE_ENV}`);

const getDataDir = () => {
    const dataDir = process.env.DATA_DIR || path.join(os.tmpdir(), 'melody-data-' + randomUUID());

    try {
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
            logger.info(`Data directory created at ${dataDir}`);
        }
    } catch (err) {
        logger.error('Error creating data directory', {error: err});
    }
    return dataDir;
}

export const DATA_DIR = getDataDir();

const port = process.env.PORT;
const baseURI = process.env.BASE_URI;
const basePath = process.env.BASE_PATH || '/api/v2';
const publicURI = process.env.PUBLIC_URI;

if (!port || !baseURI || !basePath) {
    logger.error(
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

app.get('/', (_req, res) => {
    res.send('Express + TypeScript Server. Hello World');
});

app.get('/_/health/:tag?', (req, res) => {
    logger.info(`Health check received`, {tag: req.params.tag});
    res.status(200).send();
});


app.listen(port, () => {
    const startupTime = Date.now() - serverStartTime;
    logger.info(`Server started`, {
        startupTimeMs: startupTime,
        baseDestination,
        swaggerUI: `${fullPublicPath}/swagger`,
        swaggerYAML: `${fullPath}/swagger.yaml`,
        sparqlEndpoint: SPARQL_ENDPOINT,
        publicURI: publicURI || 'not set'
    });
});
