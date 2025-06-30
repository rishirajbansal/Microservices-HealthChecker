import { BaseHealthCheckerService } from "./baseHealthChecker";
import { envMapper } from '../_generic/configManager/envMapper';
import { HealthCheckResults, InternalFailure } from "./apiResponseDefs";
import * as genConsts from "../_generic/constants/genericConstants";
import { Logger } from '../_generic/loggingManager/loggingManager';

const logger = new Logger(__filename.slice(__dirname.length + 1, -3));


/**
 * Health Checker Service to get Health Details for 'CMS2' Service
 */
export class CMSHealthCheckerService extends BaseHealthCheckerService {

    callHealth: () => Promise<any> = async () => {

        let apiResponse : Promise<HealthCheckResults> | undefined;
        let apiHttpStatus: string | undefined;
        let intResponse: InternalFailure | undefined;
        let intStatus: string;
        
        try {
            const payload = {};
            const data = JSON.stringify(payload);

            // 1. Set API Connection parameters
            this.setApiConnectionParams(envMapper.healthCheckerEndpoints.cms.endpoint, envMapper.healthCheckerEndpoints.cms.endpoint_port, envMapper.healthCheckerEndpoints.cms.endpoint_uri);

            // 2. Call Services Health API Operations
            const response = await this.handleAPIRequest(data);
            apiResponse = response.apiResponse;
            apiHttpStatus = response.statusCode;

            logger.debug(`[CMSHealthCheckerService] HTTP Status of CMS API Health API call: ${apiHttpStatus}`);

            if (apiResponse != null && apiResponse != undefined) {
                intStatus = genConsts.INT_STATUS_API_SUCCESS;
                // logger.debug(`[CMSHealthCheckerService] API Response: ${JSON.stringify(apiResponse)}`);
            }
            else {
                intStatus = genConsts.INT_STATUS_API_FAILED;
                logger.debug(`[CMSHealthCheckerService] API Response found empty`);
                intResponse = {
                    error: 'API Response Empty',
                    message: "Failed to process API request, recevied emtpy response from downstream service, please check connection parameters",
                };
            }

        } catch (error) {
            intStatus = genConsts.INT_STATUS_FAILED;
            logger.error(`[CMSHealthCheckerService] An error occured in CMSHealthCheckerService while calling services Health API: ${error}`);
            intResponse = {
                error: `${error}`,
                message: "An error occured in CMSHealthCheckerService while calling services Health API ",
            };
        }

        return {
            apiResponse,
            apiHttpStatus,
            intResponse,
            intStatus,
        };
    }
}
