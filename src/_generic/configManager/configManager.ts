import * as dotenv from 'dotenv';
import * as path from 'path';
import { EnvKeys } from './envKeys.interface';
import { ConfigManagerException } from '../exceptionManagement/businessExceptions';

/**
 * Configuration Manager to manage all environmental properties.
 * Extract env vars form env files and consolidate them in a collection object
 */
export class ConfigManager {
    static envKeys: EnvKeys;

    constructor(env: string) {
        const envFile = `.env.${env}`;
        const envFilePath = path.resolve(process.cwd(), 'envs', envFile);
        const result = dotenv.config({
            path: envFilePath,
        });

        if (result.error) {
            throw new ConfigManagerException('An error occured while parsing Environment Settings file: ' + result.error);
        }

        ConfigManager.envKeys = result.parsed!;
    }

    static getEnv(key: string): string {
        try {
            // Also handling env properties that are set by aws, like: Database and other secret params
            const value = ConfigManager.envKeys[key] || String(process.env[`${key}`]);
            return value;
        } catch (exceptionObj: any) {
            throw new ConfigManagerException(`Environment Variable '${key}' Not found. Please configure this variable in .env files`);
        }
    }
}
