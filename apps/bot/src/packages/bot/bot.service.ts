import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Markup } from 'telegraf';

@Injectable()
export class BotService implements OnModuleInit {
  private bot: Telegraf;

  constructor(private readonly configService: ConfigService) {
    const BOT_TOKEN = this.configService.getOrThrow('TELEGRAM_BOT_TOKEN');
    this.bot = new Telegraf(BOT_TOKEN);
  }

  onModuleInit() {
    this.initializeBot();
  }

  private initializeBot() {
    const WEB_APP_URL = this.configService.getOrThrow('WEB_APP_URL');

    this.bot.start(ctx => {
      ctx.reply(
        'Welcome to the Football Season Bot!',
        Markup.inlineKeyboard([[Markup.button.webApp('Play', WEB_APP_URL)]])
      );
    });

    this.bot.launch();
  }
}
