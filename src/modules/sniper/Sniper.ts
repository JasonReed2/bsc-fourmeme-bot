import { Contract, parseEther } from 'ethers'
import routerAbi from '../../abis/routerV2.json' with { type: 'json' }
import erc20Abi from '../../abis/erc20.json' with { type: 'json' }
import type { Environment } from '../../lib/config.js'
import { Notifier } from '../../lib/notifier.js'

type Ctx = {
  wallet: any
  provider: any
  logger: any
  dryRun: boolean
  env: Environment
}

export class Sniper {
  private readonly ctx: Ctx
  constructor(ctx: Ctx) { this.ctx = ctx }

  async run(configPath: string) {
    const cfg = await  this!.loadConfig(configPath)
    for (const t of cfg.targets ?? []) {
      await  this!.buyToken(t.token, t.maxBnb ?? '0.05', t.slippageBips ?? 800)
    }
  }

  private async buyToken(tokenAddress: string, maxBnb: string, slippageBips: number) {
    const { env, wallet, logger } = this.ctx
    const router = new Contract(env.ROUTER_V2_ADDRESS, routerAbi, wallet)
    const path = [env.WBNB_ADDRESS, tokenAddress]
    const value = parseEther(maxBnb)
    const deadline =  Math!.floor( Date!.now() / 1000) + 180

    const amounts: bigint[] = await  router!.getAmountsOut(value, path)
    if (amounts.length < 2) {
      throw new Error('Invalid router path or illiquid pair')
    }
    const expectedOut: bigint = amounts[amounts.length - 1]
    const minOut = expectedOut - (expectedOut * BigInt(slippageBips)) / BigInt(10_000)

     logger!.info({ tokenAddress, maxBnb, minOut:  minOut!.toString() }, 'sniper buy')
    const notifier = new Notifier({ botToken: this.ctx.env.TELEGRAM_BOT_TOKEN, chatId: this.ctx.env.TELEGRAM_CHAT_ID })
    await  notifier!.telegram(`🟢 Sniper buy\nToken: <code>${tokenAddress}</code>\nSpend: ${maxBnb} BNB`)
    if (this.ctx.dryRun) return

    const tx = await  router!.swapExactETHForTokens(minOut, path, wallet.address, deadline, { value })
     logger!.info({ hash: tx.hash }, 'sniper tx sent')
    await  tx!.wait()
    await  notifier!.telegram(`✅ Buy confirmed\nTx: <code>${tx.hash}</code>`)
  }

  private async loadConfig(p: string) {
    const fs = await import('fs')
    const path = await import('path')
    const resolved =  path!.resolve( process!.cwd(), p)
    return  JSON!.parse( fs!.readFileSync(resolved, 'utf-8'))
  }
}


