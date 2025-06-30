import { Request, Response } from 'express';
import { constants } from 'http2';
import { InternalFailure } from '../services/apiResponseDefs';
import { BaseHealthCheckerService } from '../services/baseHealthChecker';
import { CMSHealthCheckerService } from '../services/cmsHealthChecker';
import * as genConsts from "../_generic/constants/genericConstants";
import { HealthStatus, HealthCheckType } from '../services/apiResponseDefs';
import { Logger } from '../_generic/loggingManager/loggingManager';

const logger = new Logger(__filename.slice(__dirname.length + 1, -3));

/**
 * Route Controller for serving Health API requests
 */
export class HealthCheckController {

    constructor () {

    }

    /**
     * Evaluation of Health Check to be run on all Services
     * 
     * @param {Request} request 
     * @param {Response} response 
     */
    evaluateAllServicesHealth: (request: Request, response: Response) => any = async (request, response) => {

        let httpStatus;

        try {
            logger.debug(`Request recevied for Health Check of Services from IP: ${request.ip}`)

            // Evaluate CMS Service Health
            const cmsService: BaseHealthCheckerService = new CMSHealthCheckerService();
            const cmsResults = await cmsService.callHealth();

            if ((await cmsResults).intStatus === genConsts.INT_STATUS_API_SUCCESS) {
                logger.debug(`[HealthCheckController] CMS Service Health Check API call processed SUCCESSFULLY.`);
                httpStatus = constants.HTTP_STATUS_OK;
            }
            else if ((await cmsResults).intStatus === genConsts.INT_STATUS_API_FAILED) {
                logger.debug(`[HealthCheckController] CMS Service Health Check API call FAILED.`);
                httpStatus = constants.HTTP_STATUS_SERVICE_UNAVAILABLE;
            }
            else {
                logger.debug(`[HealthCheckController] Some internal error occured (within Health Checker app) during API Call.`);
                httpStatus = constants.HTTP_STATUS_SERVICE_UNAVAILABLE;
            }

            // logger.debug('Evaluation Results: ', {custom: await cmsResults});

            // Render response
            response.status(httpStatus);
            response.render("home.ejs", {data: cmsResults, genConsts: genConsts, healthStatus: HealthStatus, healthCheckType: HealthCheckType});

        } catch (error) {
            logger.error(`[HealthCheckController] Error occured in 'HealthCheckController' : ${error}`)
            const intResponse: InternalFailure = {
                error: `${error}`,
                message: "An error occured in HealthCheckController (within Health Checker app)",
            };
            response.status(constants.HTTP_STATUS_SERVICE_UNAVAILABLE);
            response.send(intResponse);
        }

    }

}
