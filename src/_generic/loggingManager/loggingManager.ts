import moment from 'moment';
import os from 'os';
import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { LOGGER_CONFIG } from '../common/configs';
import { Utility } from '../common/utils';
import { envMapper } from '../configManager/envMapper';
import { LoggerManagerException } from '../exceptionManagement/businessExceptions';

const { combine, printf } = winston.format;

const logLocation = LOGGER_CONFIG.APP_LOGGER.LOG_LOC;
const timestampFormat = LOGGER_CONFIG.APP_LOGGER.TIMESTAMP_FORMAT;
const logFile = LOGGER_CONFIG.APP_LOGGER.LOG_FILE;
const logFileError = LOGGER_CONFIG.APP_LOGGER.LOG_FILE_ERROR;
const logFileSize = LOGGER_CONFIG.APP_LOGGER.LOG_FILE_SZIE;
const logFileExt = LOGGER_CONFIG.APP_LOGGER.LOG_FILE_EXT;

const loggerLevel = envMapper.logger.level;
const fileTransportEnabled = envMapper.logger.fileTransport;

const date = moment().format('YYYY-MM-DD').trim();
const logFilename = `${logLocation}/${logFile}-${date}`;
const logFilenameError = `${logLocation}/${logFileError}-${date}`;

const COLORS = {
    debug: 'white',
    error: 'red',
    http: 'magenta',
    info: 'green',
    warn: 'yellow',
};

export enum LOG_LEVELS {
    debug = 4,
    http = 3,
    info = 2,
    warn = 1,
    error = 0,
}

export interface LogStruct {
    timestamp?: string;
    level?: LOG_LEVELS;
    ip?: string;
    module?: string;
    sessionId?: string;
    userId?: string;
    action?: string;
    method?: string;
    logmessage?: string;
    query?: string;
    query_duration?: string;
    custom?: any;
}

const transportConsole = new winston.transports.Console({
    level: loggerLevel,
});

const logFormat = printf((details) => {
    return `[${details.timestamp}] ${details.level.toUpperCase()} ${details.label} : ${details.message}`;
});

const getLogger = (moduleName: string) => {
    winston.addColors(COLORS);

    const logger = winston.createLogger({
        exitOnError: false,
        format: combine(winston.format.label({ label: moduleName }), winston.format.timestamp({ format: timestampFormat }), logFormat),
        level: loggerLevel,
        transports: [transportConsole],
    });

    return logger;
};

const getRotatingLogger = (moduleName: string) => {
    winston.addColors(COLORS);

    const logger = winston.createLogger({
        exitOnError: false,
        format: combine(winston.format.label({ label: moduleName }), winston.format.timestamp({ format: timestampFormat }), logFormat),
        level: loggerLevel,
        transports: [
            transportConsole,
            new DailyRotateFile({
                datePattern: 'YYYY-MM-DD',
                extension: logFileExt,
                filename: logFilename,
                level: loggerLevel,
                maxFiles: logFileSize,
                maxSize: logFileSize,
            }),
            new DailyRotateFile({
                datePattern: 'YYYY-MM-DD',
                extension: logFileExt,
                filename: logFilenameError,
                level: 'error',
                maxFiles: logFileSize,
                maxSize: logFileSize,
                // handleExceptions: false,
            }),
        ],
    });

    return logger;
};

export class Logger {
    public readonly moduleName: string;
    public readonly libLogger: winston.Logger;

    constructor(moduleName: string) {
        this.moduleName = moduleName;
        if (fileTransportEnabled) {
            this.libLogger = getRotatingLogger(moduleName);
        } else {
            this.libLogger = getLogger(moduleName);
        }
    }

    log(level: LOG_LEVELS, message: string | any, logObj?: LogStruct): void {
        try {
            if (logObj !== undefined && logObj !== null) {
                logObj.level = level;
                logObj.logmessage = message;
                message = message + JSON.stringify(logObj);
                // if (logObj.custom != undefined && typeof logObj.custom === 'object' && logObj.custom !== null) {
                //     message = logObj;
                // }
            }

            switch (level) {
                case LOG_LEVELS.debug:
                    this.libLogger.debug(message);
                    break;

                case LOG_LEVELS.error:
                    this.libLogger.error(message);
                    break;

                case LOG_LEVELS.warn:
                    this.libLogger.warn(message);
                    break;

                case LOG_LEVELS.info:
                    this.libLogger.info(message);
                    break;

                default:
                    throw new Error('Invalid Logger Level passed.');
            }
        } catch (exceptionObj: any) {
            console.error(`\nLoggerManagerException occured : ${exceptionObj.message}`);
            throw new LoggerManagerException(`LoggerManagerException occured : ${exceptionObj.message}`);
        }
    }

    debug(message: string, logObj?: LogStruct): void {
        this.log(LOG_LEVELS.debug, message, logObj);
    }

    error(message: string, logObj?: LogStruct): void {
        this.log(LOG_LEVELS.error, message, logObj);
    }

    info(message: string, logObj?: LogStruct): void {
        this.log(LOG_LEVELS.info, message, logObj);
    }

    warn(message: string, logObj?: LogStruct): void {
        this.log(LOG_LEVELS.warn, message, logObj);
    }

    close(): void {
        this.libLogger.close();
    }
    
}
