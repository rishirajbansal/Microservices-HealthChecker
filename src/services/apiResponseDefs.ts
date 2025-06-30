
export enum HealthStatus {
    HEALTHY = 'Healthy',
    UNHEALTHY = 'UnHealthy',
    PARTIAL_HEALTHY = 'Partially Healthy',
    UNDETERMINED = 'Undetermined'
}

export enum HealthCheckType {
    SERVER = "Server",
    DATABASE = "Database",
    MEMORY = "Memory",
    DISK = "Disk",
    DOCUSIGN = "Docusign",
    NOTIFICATION = "Notfication",
}

export type HealthCheckInfo = {
    service: string,
    status: HealthStatus,
    message?: string,
    error?: {
        error: string,
        message: string,
    },
    info?: any,
}

export type HealthCheckResults = {
    overallStatus: string,
    timestamp: string,
    error?: string,
    results?: HealthCheckInfo[],
}

export type InternalFailure = {
    error: string, 
    message: string,
}
