import config from './config';

const logger = {
  info: (message: string, ...args: unknown[]) => {
    if (config.nodeEnv !== 'test') {
      console.log(message, ...args);
    }
  },
  error: (message: string, ...args: unknown[]) => {
    if (config.nodeEnv !== 'test') {
      console.error(message, ...args);
    }
  },
};

export default logger;
