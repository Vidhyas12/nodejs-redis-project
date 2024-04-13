const express = require('express');
const bodyParser = require('body-parser');
const clientAPI = require('./clientAPI');
const orderAPI = require('./orderAPI');

const app = express();

app.use(bodyParser.json());

app.post('/api', (req, res) => {
    const { MsgType } = req.body;
    
    if (MsgType === 1121) {
        clientAPI(req, res);
    } else if (MsgType === 1120) {
        orderAPI(req, res);
    } else {
        res.status(400).json({ message: 'Invalid MsgType' });
    }
});

const PORT = process.env.PORT || 9000;
app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
});
