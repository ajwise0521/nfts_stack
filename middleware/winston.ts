import {
    createLogger,
    format,
    transports,
} from 'winston'
import {ConsoleTransportInstance} from "winston/lib/winston/transports";

// const isLocal = process.env.NODE_ENV === 'local'

const createTransports = (): ConsoleTransportInstance[] => {
    const consoleTransport = new transports.Console()
    // Future state is to enable other loggers for AWS/Cloud system if necessary
    // if (isLocal) {
    //     return [ consoleTransport ]
    // }

    return [ consoleTransport ]
}

// Format for console logging.
const myFormat = format.printf(info => `[${info.level}]:${info.timestamp} => ${info.message}`)

// Configure the info console logger.
const infoLogger = createLogger({
    level: 'info',
    // label: 'Global',
    transports: createTransports(),
    format: format.combine(format.timestamp(), myFormat),
    exitOnError: true,
})

export { infoLogger as logger }
