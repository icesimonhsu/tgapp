const TelegramBot = require('node-telegram-bot-api');
const token = '7554980476:AAH8_Im7TndxeFKLcwv01LpD1PChm0fD5hA';
const bot = new TelegramBot(token, { polling: true });

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Hello! This is a simple Telegram Mini app.');
});