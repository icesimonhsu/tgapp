const { Telegraf } = require('telegraf');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const axios = require('axios').default;

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// 存储消息的数组
let messages = [];
let assets = [];

// Telegram Bot Token
const botToken = process.env.BOT_TOKEN;

if (!botToken) {
    throw new Error('BOT_TOKEN is not defined');
}

const bot = new Telegraf(botToken);

// 更新这些常量
const VERCEL_URL = 'https://tgapp-chi.vercel.app';
const webhookUrl = process.env.WEBHOOK_URL || `${VERCEL_URL}/webhook`;

// 设置 Webhook
bot.telegram.setWebhook(`${webhookUrl}`);

bot.start((ctx) => {
    ctx.reply('Welcome! Use the menu to open the Mini App.');
});

bot.command('menu', (ctx) => {
    ctx.reply('选择操作:', {
        reply_markup: {
            inline_keyboard: [
                [{ text: '打开 Mini App', web_app: { url: VERCEL_URL } }]
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
        const response = await axios.get('https://v3-api.lootex.io/api/v3/explore/assets', {
            params: {
                limit: 30,
                sortBy: '-bestListPrice',
                keywords: keyword,
                isCount: false,
                page: 1
            }
        });
        assets = response.data.items;
        ctx.reply(`Found ${assets.length} assets for keyword: ${keyword}`);
    } catch (error) {
        console.error("Error fetching assets:", error);
        ctx.reply("Error fetching assets. Please try again later.");
    }
});

// API 路由
app.get('/messages', (req, res) => {
    res.json(messages);
});

app.get('/assets', (req, res) => {
    const page = Number(req.query.page || 1);
    const searchKeyword = String(req.query.keyword || '');
    const limit = 20;
    const offset = (page - 1) * limit;

    try {
        const filteredAssets = assets.filter(asset =>
            asset.assetName.toLowerCase().includes(searchKeyword.toLowerCase())
        );
        const paginatedAssets = filteredAssets.slice(offset, offset + limit);
        res.json(paginatedAssets);
    } catch (error) {
        console.error("Error processing assets:", error);
        res.status(500).json({
            error: "Error processing assets",
            details: error.message
        });
    }
});

app.get('/search', async (req, res) => {
    const keyword = String(req.query.keyword || '');
    const page = Number(req.query.page || 1);

    try {
        const apiUrl = 'https://v3-api.lootex.io/api/v3/explore/assets';

        console.log('Received search request:', { keyword, page });

        const response = await axios.get(apiUrl, {
            params: {
                limit: 30,
                sortBy: '-bestListPrice',
                keywords: keyword,
                isCount: false,
                page: page
            }
        });

        console.log('Lootex API response status:', response.status);

        if (response.status !== 200) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        if (!response.data || !response.data.items) {
            console.log('No items in response:', response.data);
            return res.json([]);
        }

        const items = response.data.items.map(item => ({
            assetName: item.assetName || 'Unnamed Asset',
            assetTokenId: item.assetTokenId || 'No ID',
            assetImageUrl: item.assetImageUrl || '',
            collectionName: item.collectionName || 'Unknown Collection',
            collectionChainShortName: item.collectionChainShortName || 'Unknown',
            order: item.order || null
        }));

        // 检查价格和链的提取
        items.forEach(item => {
            if (item.order && item.order.listing) {
                item.price = `${item.order.listing.price} ${item.order.listing.priceSymbol}`;
            } else {
                item.price = 'No Price';
            }

            item.collectionChainShortName = item.collectionChainShortName || 'Unknown Chain';
        });

        console.log(`Found ${items.length} items`);
        res.json(items);

    } catch (error) {
        console.error('Search error:', {
            message: error.message,
            stack: error.stack,
            response: error.response?.data
        });

        res.status(500).json({
            error: "Search failed",
            message: error.message,
            details: error.response?.data || 'No additional details available'
        });
    }
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        error: "Server error",
        message: err.message
    });
});

// 使用 bot webhook
app.use(bot.webhookCallback('/webhook'));

// 导出 express app 以供 Vercel 使用
module.exports = app;