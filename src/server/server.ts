import express from 'express';
import { Request, Response } from 'express';
import * as path from 'path';
import { Utility } from '../_generic/common/utils';
import { ConfigManager } from '../_generic/configManager/configManager';
import * as genConsts from "../_generic/constants/genericConstants";

// Set Environment Type [Default set to 'local'] - This env type supports various envs like: dev, local, prod
const env: string = Utility.safeTrim(process.env.APP_ENV) !== genConsts.STRING_EMPTY ? String(process.env.APP_ENV) : genConsts.ENV_LOCAL;
// Load Config Manager Component
new ConfigManager(env);

import { envMapper } from '../_generic/configManager/envMapper';
import { HealthCheckController } from '../controllers/healthCheckController';
import { Logger } from '../_generic/loggingManager/loggingManager';

const logger = new Logger(__filename.slice(__dirname.length + 1, -3));

logger.info('\n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n');
logger.info(`Env set to: '${env}'\n`);

logger.info('APPLICATION BOOTSTRAPPING STARTED...\n');


const healthApp = express();

healthApp.set('views', path.join(__dirname, '../views'));
healthApp.set('view engine', 'ejs');

healthApp.use(genConsts.BASE_PATH, express.static(path.join(__dirname, "../../public")));

healthApp.get('/', (req: Request, res: Response) => {
    res.status(200);
    res.send('<p>Welcome to Health Checker Application !!</p>')
});

healthApp.get(genConsts.HEALTHCHECK_TG_PATH, (req: Request, res: Response) => {
    const uptime = Math.round( (process.uptime() / 60 / 60) * 1000) / 1000;
    const data = {
        status: 'Healthy',
        uptime: `${uptime} hrs.`,
    }
    res.status(200);
    res.json(data);
});

healthApp.get(genConsts.HEALTHCHECK_API_URI, (req: Request, res: Response) => {
    new HealthCheckController().evaluateAllServicesHealth(req, res);
});


healthApp.listen(envMapper.server.port, envMapper.server.host, () => {
    
});

logger.info(
    `\n\n==> Application server started on http://${envMapper.server.host}:${envMapper.server.port}\n
    \nAPPLICATION STARTED SUCCESSFULLY.
    \n~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~\n`,
);
