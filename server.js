const { Telegraf } = require('telegraf');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000; // 使用 Heroku 提供的端口

app.use(bodyParser.json()); // 解析 JSON 请求
app.use(express.static(path.join(__dirname, 'public'))); // 提供静态文件

// Telegram Bot Token
const botToken = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN';

if (!botToken) {
    throw new Error('BOT_TOKEN is not defined');
}

// 使用 Telegraf 初始化 Bot
const bot = new Telegraf(botToken);

// Webhook URL
// const webhookUrl = process.env.WEBHOOK_URL || 'https://testtgtg-ad8398e9ed39.herokuapp.com/webhook';

// // 设置 Webhook
// bot.telegram.setWebhook(`${webhookUrl}`);

// 处理 /start 命令
bot.start((ctx) => {
    ctx.reply('Welcome! Use the menu to open the Mini App.');
});

// 处理 /menu 命令，展示 Mini App 按钮
bot.command('menu', (ctx) => {
    ctx.reply('Choose an option:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Open Mini App', web_app: { url: 'https://testtgtg-ad8398e9ed39.herokuapp.com/' } }]
            ]
        }
    });
});

// 设置 webhook 处理路径
app.use(bot.webhookCallback('/webhook'));

// 确保其他路径可以返回正确的响应
app.get('/', (req, res) => {
    res.send('Hello, this is your bot server');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});