const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000; // 使用Heroku提供的端口

app.use(bodyParser.json());

app.post('/webhook', (req, res) => {
    const data = req.body;
    console.log('Received data:', data);
    res.sendStatus(200);
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});