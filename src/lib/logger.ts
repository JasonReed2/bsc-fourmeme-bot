import pino from 'pino' 
import pretty from 'pino-pretty'

export function createLogger(level: 'info' | 'debug' | 'error' = 'info') {
  const stream = process.env.NODE_ENV === 'production'
    ? undefined
    : pretty({
        colorize: true,
        translateTime: 'SYS:standard'
      });

  return pino(
    {
      level
    },
    stream
  );
}
