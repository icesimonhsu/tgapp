const { Telegraf } = require('telegraf');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios');

const app = express();
const port = process.env.PORT || 3000; // 使用 Heroku 提供的端口

app.use(bodyParser.json()); // 解析 JSON 请求
app.use(express.static(path.join(__dirname, 'public'))); // 提供静态文件

// 存储消息的数组
let messages = [];
let assets = [];

// Telegram Bot Token
const botToken = process.env.BOT_TOKEN;

if (!botToken) {
    throw new Error('BOT_TOKEN is not defined');
}

// 使用 Telegraf 初始化 Bot
const bot = new Telegraf(botToken);

// Webhook URL
const webhookUrl = process.env.WEBHOOK_URL || 'https://testtgtg-ad8398e9ed39.herokuapp.com/webhook';

// 设置 Webhook
bot.telegram.setWebhook(`${webhookUrl}`);

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

// 处理文本消息
bot.on('text', async (ctx) => {
    const keyword = ctx.message.text;
    messages.push(keyword);
    ctx.reply(`Searching for: ${keyword}`);

    try {
        const response = await axios.get(`https://v3-api.lootex.io/api/v3/explore/assets?limit=20&sortBy=bestListPrice&keywords=${keyword}&isCount=false&page=1`);
        assets = response.data.items;
        ctx.reply(`Found ${assets.length} assets for keyword: ${keyword}`);
    } catch (error) {
        console.error("Error fetching assets:", error);
        ctx.reply("Error fetching assets. Please try again later.");
    }
});

// 设置 webhook 处理路径
app.use(bot.webhookCallback('/webhook'));

app.post('/webhook', (req, res) => {
    try {
        const { message } = req.body;
        console.log("Received message:", JSON.stringify(message, null, 2));
        res.sendStatus(200);  // 返回 200 OK 表示成功
    } catch (error) {
        console.error("Error processing webhook:", error);
        res.sendStatus(500);  // 返回 500 错误表示内部处理失败
    }
});

// 提供消息的 API
app.get('/messages', (req, res) => {
    res.json(messages);
});

// 提供资产的 API
app.get('/assets', (req, res) => {
    res.json(assets);
});

// 搜索资产的 API
app.get('/search', async (req, res) => {
    const keyword = req.query.keyword;
    try {
        const response = await axios.get(`https://v3-api.lootex.io/api/v3/explore/assets?limit=20&sortBy=bestListPrice&keywords=${keyword}&isCount=false&page=1`);
        res.json(response.data.items);
    } catch (error) {
        console.error("Error fetching assets:", error);
        res.status(500).send("Error fetching assets. Please try again later.");
    }
});

// 确保其他路径可以返回正确的响应
app.get('/', (req, res) => {
    res.send('Hello, this is your bot server');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});