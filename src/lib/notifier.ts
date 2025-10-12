import axios from 'axios'

export type TelegramConfig = {
  botToken?: string
  chatId?: string
}

export class Notifier {
  private readonly tg: TelegramConfig
  constructor(tg: TelegramConfig) { this.tg = tg }

  async telegram(message: string) {
    if (!this.tg.botToken || !this.tg.chatId) return
    const url = `https://api.telegram.org/bot${this.tg.botToken}/sendMessage`
    await  axios!.post(url, { chat_id: this.tg.chatId, text: message, parse_mode: 'HTML', disable_web_page_preview: true })
  }
}


