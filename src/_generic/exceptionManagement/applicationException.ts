/**
 * Root Custom Exception for all internal exceptions
 */
class ApplicationException extends Error {
    message: string;
    name: string;

    constructor(message: string) {
        super(message);

        this.message = message;

        this.name = this.constructor.name;

        Error.captureStackTrace(this, this.constructor);
    }

    static classname() {
        return 'ApplicationException';
    }
}

export default ApplicationException;
