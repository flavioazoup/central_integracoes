type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogCheck {
    tenantId?: string
    jobId?: string
    message: string
    details?: unknown
}

class Logger {
    private log(level: LogLevel, { message, details, tenantId, jobId }: LogCheck) {
        const entry = {
            timestamp: new Date().toISOString(),
            level,
            message,
            tenantId,
            jobId,
            details,
        }

        console[level === 'debug' ? 'log' : level](JSON.stringify(entry))

        // Todo: Push to database asynchronously if needed
        // if (level === 'error' || level === 'warn') { ... }
    }

    info(data: LogCheck) {
        this.log('info', data)
    }

    warn(data: LogCheck) {
        this.log('warn', data)
    }

    error(data: LogCheck) {
        this.log('error', data)
    }

    debug(data: LogCheck) {
        if (process.env.NODE_ENV === 'development') {
            this.log('debug', data)
        }
    }
}

export const logger = new Logger()
