import winston, {format} from 'winston';

const {combine, timestamp, printf, colorize, json} = format;

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const debugMode = env === 'development' || process.env.DEBUG_MODE === 'true';

    return debugMode ? 'debug' : 'info';
};

const consoleFormat = printf(({level, message, timestamp, requestId, ...metadata}) => {
    let metaStr = '';
    if (Object.keys(metadata).length > 0) {
        metaStr = JSON.stringify(metadata);
    }
    const requestIdStr = requestId ? `[${requestId}] ` : '';
    return `[${timestamp}] [${level}]: ${requestIdStr}${message} ${metaStr}`;
});

const timestampFormat = "YYYY-MM-DD HH:mm:ss"

const logger = winston.createLogger({
    level: level(),
    levels,
    format: combine(
        timestamp({format: timestampFormat}),
        json()
    ),
    transports: [
        new winston.transports.Console({
            format: combine(
                colorize(),
                timestamp({format: timestampFormat}),
                consoleFormat
            ),
        })
    ],
});

export const stream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

/**
 * Creates a child logger with request ID context
 * @param requestId - The unique ID for the current request
 * @returns A logger instance with request ID context
 */
export const getRequestLogger = (requestId?: string) =>
    !requestId ? logger : logger.child({requestId});

export default logger;
