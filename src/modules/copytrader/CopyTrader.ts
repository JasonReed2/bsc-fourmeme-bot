import type { Environment } from '../../lib/config.js'
import { Contract, parseEther } from 'ethers'
import routerAbi from '../../abis/routerV2.json' with { type: 'json' }
import { Notifier } from '../../lib/notifier.js'

type Ctx = { wallet: any, provider: any, logger: any, dryRun: boolean, env: Environment }

export class CopyTrader {
  private readonly ctx: Ctx
  constructor(ctx: Ctx) { this.ctx = ctx }

  async run(configPath: string) {
    const cfg = await  this!.loadConfig(configPath)
    this.ctx. logger!.info('Starting copy trader...')

    this.ctx. provider!.on('pending', async (txHash: string) => {
      try {
        const tx = await this.ctx. provider!.getTransaction(txHash)
        if (!tx || !tx.to) return
        if (!cfg.targets?.some((a: string) =>  a!.toLowerCase() === tx.from?.toLowerCase())) return

        // naive: detect router usage and mirror small % trade into same token path
        if (tx. to!.toLowerCase() === this.ctx.env. ROUTER_V2_ADDRESS!.toLowerCase()) {
          const percent = cfg.positionPercent ?? 10
          const spend = (BigInt(parseEther(cfg.maxBnbPerTrade ?? '0.05')) * BigInt(percent)) / BigInt(100)
          await  this!.quickMirrorBuy(cfg.defaultToken, spend)
          const notifier = new Notifier({ botToken: this.ctx.env.TELEGRAM_BOT_TOKEN, chatId: this.ctx.env.TELEGRAM_CHAT_ID })
          await  notifier!.telegram(`📣 Mirrored trade from <code>${tx.from}</code>`) 
        }
      } catch {}
    })
  }

  private async quickMirrorBuy(token: string, amountWei: bigint) {
    const { env, wallet, logger } = this.ctx
    const router = new Contract(env.ROUTER_V2_ADDRESS, routerAbi, wallet)
    const path = [env.WBNB_ADDRESS, token]
    const deadline =  Math!.floor( Date!.now() / 1000) + 180
    const amounts: bigint[] = await  router!.getAmountsOut(amountWei, path)
    const minOut = amounts[amounts.length - 1] - (amounts[amounts.length - 1] * BigInt(700)) / BigInt(10_000)
     logger!.debug({ token, amountWei:  amountWei!.toString() }, 'mirror buy')
    if (this.ctx.dryRun) return
    const tx = await  router!.swapExactETHForTokens(minOut, path, wallet.address, deadline, { value: amountWei })
    await  tx!.wait()
  }

  private async loadConfig(p: string) {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const resolved =  path!.resolve( process!.cwd(), p)
    return  JSON!.parse( fs!.readFileSync(resolved, 'utf-8'))
  }
}


