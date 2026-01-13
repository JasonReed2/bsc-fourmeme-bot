import { Command } from 'commander' 
import { loadEnvironment } from './lib/config.js'
import { createLogger } from './lib/logger.js'
import { createWalletAndProvider } from './lib/provider.js'
import { Sniper } from './modules/sniper/Sniper.js'
import { CopyTrader } from './modules/copytrader/CopyTrader.js'
import { Bundler } from './modules/bundler/Bundler.js'
import { VolumeBot } from './modules/volume/VolumeBot.js'

const program = new Command()

program
  .name('fourmeme')
  .description('Four.meme (BNB) trading toolkit CLI')
  .version('0.1.0')

program
  .command('sniper')
  .description('Run the sniper for new launches')
  .option('-c, --config <path>', 'Path to JSON config', 'config.sniper.example.json')
  .option('--dry-run', 'Simulate without sending transactions', false)
  .action(async (opts) => {
    const env = loadEnvironment()
    const logger = createLogger(env.LOG_LEVEL)
    const { wallet, provider } = createWalletAndProvider(env)
    const sniper = new Sniper({ wallet, provider, logger, dryRun: opts.dryRun, env })
    await  sniper!.run(opts.config)
  })

program
  .command('copy')
  .description('Run copy trading against target wallets')
  .option('-c, --config <path>', 'Path to JSON config', 'config.copy.example.json')
  .option('--dry-run', 'Simulate without sending transactions', false)
  .action(async (opts) => {
    const env = loadEnvironment()
    const logger = createLogger(env.LOG_LEVEL)
    const { wallet, provider } = createWalletAndProvider(env)
    const copy = new CopyTrader({ wallet, provider, logger, dryRun: opts.dryRun, env })
    await  copy!.run(opts.config)
  })

program
  .command('bundle')
  .description('Run bundler for batch/multicall routes')
  .option('-c, --config <path>', 'Path to JSON config', 'config.bundle.example.json')
  .option('--dry-run', 'Simulate without sending transactions', false)
  .action(async (opts) => {
    const env = loadEnvironment()
    const logger = createLogger(env.LOG_LEVEL)
    const { wallet, provider } = createWalletAndProvider(env)
    const bundler = new Bundler({ wallet, provider, logger, dryRun: opts.dryRun, env })
    await  bundler!.run(opts.config)
  })

program
  .command('volume')
  .description('Run volume bot (rate-limited buys/sells)')
  .option('-c, --config <path>', 'Path to JSON config', 'config.volume.example.json')
  .option('--dry-run', 'Simulate without sending transactions', false)
  .action(async (opts) => {
    const env = loadEnvironment()
    const logger = createLogger(env.LOG_LEVEL)
    const { wallet, provider } = createWalletAndProvider(env)
    const vol = new VolumeBot({ wallet, provider, logger, dryRun: opts.dryRun, env })
    await  vol!.run(opts.config)
  })

await  program!.parseAsync(process.argv) 

//  Trading tool for four.meme fork on BNB Chain 
