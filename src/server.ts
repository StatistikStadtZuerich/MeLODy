import express from "express";
import initRouter from "./routes/initRouter";
import {swaggerInit, swaggerUiInit} from "./swagger/initSwagger";
import path from "node:path";
import os from "node:os";
import {randomUUID} from "node:crypto";
import {readynessRouter} from "./routes/dynamicRoutes";
import logger, {stream} from "./utils/logger";
import morgan from "morgan";
import fs from "fs";

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

app.use(morgan((tokens, req, res) => {
    return JSON.stringify({
        requestId: tokens['request-id'](req, res),
        remoteAddr: tokens['remote-addr'](req, res),
        remoteUser: tokens['remote-user'](req, res),
        date: tokens['date'](req, res, 'clf'),
        method: tokens['method'](req, res),
        url: tokens['url'](req, res),
        httpVersion: tokens['http-version'](req, res),
        status: parseInt(tokens['status'](req, res) || '0', 10),
        contentLength: tokens['res'](req, res, 'content-length'),
        referrer: tokens['referrer'](req, res),
        userAgent: tokens['user-agent'](req, res),
        responseTime: parseFloat(tokens['response-time'](req, res) || '0'),
        query: req.body?.query,
    });
}, {stream}));

export const DATA_SOURCE_BASE_URL = process.env.DATA_SOURCE_BASE_URL || "https://ld.integ.stzh.ch/statistics/view/";
export const SPARQL_ENDPOINT = process.env.SPARQL_ENDPOINT || "https://ld.test.stzh.ch/query";

logger.info(`Server configuration`, {
    dataSourceBaseUrl: DATA_SOURCE_BASE_URL,
    sparqlEndpoint: SPARQL_ENDPOINT,
    environment: process.env.NODE_ENV || 'development',
    debugMode: process.env.DEBUG_MODE === 'true'
});

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
    const logContext = {
        operation: 'validateEnvironment',
        success: false,
        missingVariables: {
            PORT: !port,
            BASE_URI: !baseURI,
            BASE_PATH: !basePath
        },
        environment: process.env.NODE_ENV || 'development'
    };

    logger.error(
        'Environment variables not set. Please set the following environment variables: PORT, BASE_URI, BASE_PATH',
        logContext
    );
    process.exit(1);
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
    const logContext = {
        requestId: req.requestId,
        method: req.method,
        url: req.url,
        tag: req.params.tag,
        remoteAddr: req.ip,
        userAgent: req.get('user-agent')
    };

    logger.debug(`Health check received`, logContext);
    res.status(200).send();
});


app.listen(port, () => {
    const startupTime = Date.now() - serverStartTime;

    const logContext = {
        startupTimeMs: startupTime,
        baseDestination,
        port,
        basePath,
        swaggerUI: `${fullPublicPath}/swagger`,
        swaggerYAML: `${fullPath}/swagger.yaml`,
        sparqlEndpoint: SPARQL_ENDPOINT,
        dataSourceBaseUrl: DATA_SOURCE_BASE_URL,
        publicURI: publicURI || 'not set',
        environment: process.env.NODE_ENV || 'development',
        dataDir: DATA_DIR
    };

    logger.info(`Server started`, logContext);
});
