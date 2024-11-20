require('dotenv').config();
const { Telegraf } = require('telegraf');
const botToken = process.env.BOT_TOKEN;

if (!botToken) {
    throw new Error('BOT_TOKEN is not defined');
}

// 使用 telegraf 初始化 bot
const bot = new Telegraf(botToken);

bot.start((ctx) => {
    ctx.reply('Welcome! Use the menu to open the Mini App.');
});

bot.command('menu', (ctx) => {
    ctx.reply('Choose an option:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Open Mini App', web_app: { url: 'https://tgapp-eba5.vercel.app' } }]
            ]
        }
    });
});

bot.on('text', (ctx) => {
    const message = ctx.message.text;
    console.log("Received text message:", message);
    ctx.reply(`You said: ${message}`);
});

bot.launch();