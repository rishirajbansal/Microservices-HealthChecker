/**
 * Custom Exceptions inherited from root custom class for each component
 */
 import ApplicationException from './applicationException';

export class ConfigManagerException extends ApplicationException {
    message: string;

    constructor(message: string) {
        super(message);
        this.message = message;
    }

    static classname() {
        return 'ConfigManagerException';
    }
}

export class LoggerManagerException extends ApplicationException {
    message: string;

    constructor(message: string) {
        super(message);
        this.message = message;
    }

    static classname() {
        return 'LoggerManagerException';
    }
}
 