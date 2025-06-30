import * as http from 'http';
import { constants } from 'http2'
import { API_CONN_SOCKET_TIMEOUT } from '../_generic/constants/genericConstants';
import { Logger } from '../_generic/loggingManager/loggingManager';

const logger = new Logger(__filename.slice(__dirname.length + 1, -3));

/**
 * Abstract Class to implement functions common to all services
 * 
 * Makes Request to each service on certain API endpoint to get the health check results.
 * API Connection parameters are loaded from env files
 * 
 */
export abstract class BaseHealthCheckerService {

    private apiConnectionParams!: http.RequestOptions;
    
    abstract callHealth(): Promise<any>;

    constructor () {

    }

    setApiConnectionParams: (host: string, port: number, endpoint: string) => void = (host, port, endpoint) => {

        this.apiConnectionParams = {
            host: host,
            port: port,
            path: endpoint,
            method: "GET",
            agent: new http.Agent({
                keepAlive: true,
                // maxSockets: 2
            }),
            timeout: API_CONN_SOCKET_TIMEOUT,
        }

    }

    /**
     * Send Request to API server(s) using 'http' module and process the response
     * 
     * @param {string} data 
     * @returns {any}
     */
    handleAPIRequest: (data: string) => any = async (data) => {

        let rawData = "";
        let apiResponse: any = {};
        let statusCode: number | undefined;

        logger.debug("HealthChecker handleAPIRequest Begins...");

        this.apiConnectionParams.headers = {
            'Content-Type': 'application/json; charset=utf-8',
            // 'Content-Length': data.length,
            'Connection': 'keep-alive'
        };

        try {
            const getHandleRequestPromise = (requestData: any): Promise<any> => {

                return new Promise((resolve, reject) => {
                    const handleRequest = http.request(this.apiConnectionParams, async (httpResponse: http.IncomingMessage) => {

                        statusCode = httpResponse.statusCode;
                        logger.debug(`[BaseHealthCheckerService] Status Code: ${statusCode}`);
            
                        if (statusCode !== constants.HTTP_STATUS_OK && 
                            statusCode !== constants.HTTP_STATUS_INTERNAL_SERVER_ERROR && 
                            statusCode !== constants.HTTP_STATUS_SERVICE_UNAVAILABLE) {
                                reject(`[BaseHealthCheckerService] Request Failed in handleRequest due to invalid status code. Status Code: ${statusCode}`);
                        }
                        else {
                            httpResponse.setEncoding('utf8');
            
                            httpResponse.on('data', (chunk: string) => {
                                rawData += chunk;
                            });
            
                            httpResponse.on('end', () => {
                                try {
                                    apiResponse = JSON.parse(rawData);
                                    // logger.debug(`API Response: ${apiResponse}`);
                                    resolve(apiResponse);
                                } catch (error) {
                                    reject(`[BaseHealthCheckerService] An error occured in handleAPIRequest() -> httpResponse.on.end event : ${error}`);
                                }
                            });
            
                            httpResponse.on('error', (err: any) => {
                                reject("[BaseHealthCheckerService] Exception occured in handleRequest -> httpResponse.on.error event : " + err.message);
                            });
                        }
                    });

                    if (handleRequest != null) {
                        handleRequest.on('error', (err: any) => {
                            reject("[BaseHealthCheckerService] Exception occured in handleRequest -> handleRequest.on.error event : " + err.message);
                        });
        
                        handleRequest.end();
                    }
                    else {
                        reject("[BaseHealthCheckerService] handleRequest is null");
                    }
                });

            };

            const handleRequestPromise = getHandleRequestPromise(data);

            apiResponse = await handleRequestPromise;
            
        } catch (error) {
            logger.error(`[BaseHealthCheckerService] An error occured in handleAPIRequest() : ${error}`);
            throw new Error(`An error occured in handleAPIRequest() : ${error}`);
        }

        logger.debug("[BaseHealthCheckerService] HealthChecker handleAPIRequest Ends.");

        return {
            statusCode,
            apiResponse
        };

    }
}
