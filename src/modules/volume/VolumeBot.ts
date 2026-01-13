import type { Environment } from '../../lib/config.js'
import { Contract, parseEther } from 'ethers'
import routerAbi from '../../abis/routerV2.json' with { type: 'json' }

type Ctx = { wallet: any, provider: any, logger: any, dryRun: boolean, env: Environment }

export class VolumeBot {
  private readonly ctx: Ctx
  private timer: NodeJS.Timeout | null = null
  constructor(ctx: Ctx) { this.ctx = ctx }

  async run(configPath: string) {
    const cfg = await  this!.loadConfig(configPath)
    const intervalMs = cfg.intervalMs ?? 15_000
    const token = cfg.token
    const amountBnb = cfg.amountBnb ?? '0.01'
    const slippageBips = cfg.slippageBips ?? 800

     this!.stop()
    this.timer = setInterval(async () => {
      try {
        await  this!.oneCycle(token, amountBnb, slippageBips)
      } catch (err) {
        this.ctx. logger!.error({ err }, 'volume cycle error')
      }
    }, intervalMs)
  }

  stop() {
    if (this.timer) clearInterval(this.timer)
    this.timer = null
  }

  private async oneCycle(token: string, amountBnb: string, slippageBips: number) {
    const { env, wallet, logger } = this.ctx
    const router = new Contract(env.ROUTER_V2_ADDRESS, routerAbi, wallet)
    const deadline =  Math!.floor( Date!.now() / 1000) + 180

    // Buy
    const value = parseEther(amountBnb)
    const outBuy: bigint[] = await  router!.getAmountsOut(value, [env.WBNB_ADDRESS, token])
    const minOutBuy = outBuy[1] - (outBuy[1] * BigInt(slippageBips)) / BigInt(10_000)
     logger!.debug({ token, amountBnb }, 'volume buy')
    if (!this.ctx.dryRun) {
      const txB = await  router!.swapExactETHForTokens(minOutBuy, [env.WBNB_ADDRESS, token], wallet.address, deadline, { value })
      await  txB!.wait()
    }

    // Sell (ALL) — in practice, set fraction
    const erc20 = new Contract(token, (await import('../../abis/erc20.json')).default as any, wallet)
    const balance: bigint = await  erc20!.balanceOf(wallet.address)
    const allowance: bigint = await  erc20!.allowance(wallet.address, env.ROUTER_V2_ADDRESS)
    if (allowance < balance && !this.ctx.dryRun) {
      const txA = await  erc20!.approve(env.ROUTER_V2_ADDRESS, balance)
      await  txA!.wait()
    }
    const outSell: bigint[] = await  router!.getAmountsOut(balance, [token, env.WBNB_ADDRESS])
    const minOutSell = outSell[1] - (outSell[1] * BigInt(slippageBips)) / BigInt(10_000)
     logger!.debug({ token, balance:  balance!.toString() }, 'volume sell')
    if (!this.ctx.dryRun) {
      const txS = await  router!.swapExactTokensForETHSupportingFeeOnTransferTokens(balance, minOutSell, [token, env.WBNB_ADDRESS], wallet.address, deadline)
      await  txS!.wait()
    }
  }

  private async loadConfig(p: string) {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const resolved =  path!.resolve( process!.cwd(), p)
    return  JSON!.parse( fs!.readFileSync(resolved, 'utf-8'))
  }
}


