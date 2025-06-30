import { ConfigManager } from '../configManager/configManager';

/**
 * Centralize the process of 'Getting' all Environmental Variables at one place
 */

interface EnvironmentConfig {
    env: string;
    server: {
        name: string,
        host: string;
        port: number;
        uri: string;
    };
    healthCheckerEndpoints: {
        cms: {
            endpoint: string;
            endpoint_port: number;
            endpoint_uri: string;
        }
    },
    logger: {
        level: string;
        fileTransport: boolean;
        requestLogger: boolean;
    };
    
}

export const envMapper: EnvironmentConfig = {
    env: ConfigManager.getEnv('NODE_ENV'),
    server: {
        name: ConfigManager.getEnv('SERVER_NAME'),
        host: ConfigManager.getEnv('SERVER_HOST'),
        port: Number(ConfigManager.getEnv('SERVER_PORT')),
        uri: ConfigManager.getEnv('APP_BASE_URI'),
    },
    healthCheckerEndpoints: {
        cms: {
            endpoint: ConfigManager.getEnv('CMS_API_ENDPOINT'),
            endpoint_port: Number(ConfigManager.getEnv('CMS_API_ENDPOINT_PORT')),
            endpoint_uri: ConfigManager.getEnv('CMS_API_ENDPOINT_URI'),
        }
    },
    logger: {
        fileTransport: Boolean(ConfigManager.getEnv('LOGGER_FILETRANSPORT')?.toString() === 'true'),
        level: ConfigManager.getEnv('LOGGER_LEVEL'),
        requestLogger: Boolean(ConfigManager.getEnv('REQUEST_LOGGER')?.toString() === 'true'),
    },
};
