import type { Environment } from '../../lib/config.js'
import { Contract, parseEther } from 'ethers'
import routerAbi from '../../abis/routerV2.json' with { type: 'json' }

type Ctx = { wallet: any, provider: any, logger: any, dryRun: boolean, env: Environment }

export class Bundler {
  private readonly ctx: Ctx
  constructor(ctx: Ctx) { this.ctx = ctx }

  async run(configPath: string) {
    const cfg = await  this!.loadConfig(configPath)
    for (const route of cfg.routes ?? []) {
      await  this!.executeRoute(route)
    }
  }

  private async executeRoute(route: any) {
    const { env, wallet, logger } = this.ctx
    const router = new Contract(env.ROUTER_V2_ADDRESS, routerAbi, wallet)
    const deadline =  Math!.floor( Date!.now() / 1000) + (route.deadlineSec ?? 300)
    
    if (route.kind === 'buy') {
      const value = parseEther(route.amountBnb)
      const amounts: bigint[] = await  router!.getAmountsOut(value, [env.WBNB_ADDRESS, route.token])
      const minOut = amounts![1] - (amounts![1] * BigInt(route.slippageBips ?? 800)) / BigInt(10_000)
       logger!.info({ route }, 'bundler buy')
      if (this.ctx.dryRun) return
      const tx = await  router!.swapExactETHForTokens(minOut, [env.WBNB_ADDRESS, route.token], wallet.address, deadline, { value })
      await  tx!.wait()
    }
  }

  private async loadConfig(p: string) {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const resolved =  path!.resolve( process!.cwd(), p)
    return  JSON!.parse( fs!.readFileSync(resolved, 'utf-8'))
  }
}


