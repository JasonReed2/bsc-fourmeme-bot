import { JsonRpcProvider, Wallet } from 'ethers'
import type { Environment } from './config.js'

export function createWalletAndProvider(env: Environment) {
  const provider = new JsonRpcProvider(env.RPC_URL, env.CHAIN_ID, { staticNetwork: true })
  const wallet = new Wallet(env.PRIVATE_KEY, provider)
  return { provider, wallet }
}


