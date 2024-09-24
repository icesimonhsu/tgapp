const TelegramBot = require('node-telegram-bot-api');
const token = process.env.TELEGRAM_BOT_API_TOKEN;

if (!token) {
    throw new Error('TELEGRAM_BOT_API_TOKEN is not defined');
}

const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hello! This is a simple Telegram Mini app.');
});