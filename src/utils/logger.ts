import winston, {format} from 'winston';

const {combine, timestamp} = format;

const levels = {
    error: 0,
    warn: 1,
    http: 2,
    info: 3,
    debug: 4,
};

const level = () => {
    const debugMode = process.env.DEBUG_MODE === 'true';

    return debugMode ? 'debug' : 'info';
};

const jsonFormatter = format((info) => {
    const {timestamp, level, message, ...rest} = info;
    return {
        timestamp,
        level,
        message,
        ...rest
    };
});

const jsonSerializer = format(info => {
    const {timestamp, level, message, ...rest} = info;

    const output = {
        instant: timestamp,
        level,
        message,
        ...rest
    };

    info[Symbol.for('message')] = JSON.stringify(output);

    return info;

})

const logger = winston.createLogger({
    level: level(),
    levels,
    format: combine(
        timestamp(),
        jsonFormatter(),
        jsonSerializer()
    ),
    transports: [
        new winston.transports.Console({
            format: combine(
                timestamp(),
                jsonFormatter(),
                jsonSerializer()
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
