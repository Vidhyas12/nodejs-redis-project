const express = require('express');
const router = express.Router();
const redis = require('ioredis');

const client = redis.createClient();

router.use(express.json());

router.post('/api', (req, res) => {
    const { OperationType, TenantId, OMSId, OrderType, Token, OrderPrice, OrderQty, ClientId, ClientName, Remark } = req.body;
    
    switch(OperationType) {
        case 100:
            addOrder(req.body, res);
            break;
        case 101:
            updateOrder(req.body, res);
            break;
        case 102:
            removeOrder(req.body.Token, res);
            break;
        case 103:
            getOrder(req.body, res); 
            break;
        case 104:
            getAllOrders(res);
            break;
        default:
            res.status(400).json({ error: 'Invalid OperationType' });
    }
});

function addOrder(orderData, res) {
    if (!validateOrderData(orderData)) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    const key = constructOrderKey(orderData);
    client.hmset(key, orderData, (err, reply) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'Order added successfully' });
    });
}

function updateOrder(orderData, res) {
    if (!validateOrderData(orderData)) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    const key = constructOrderKey(orderData);
    client.exists(key, (err, exists) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!exists) {
            return res.status(404).json({ error: 'Order not found for update' });
        }
        
        client.hmset(key, orderData, (err, reply) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Order updated successfully' });
        });
    });
}

function removeOrder(token, res) {
    const key = `OrderInfo:${token}`;
    client.del(key, (err, deletedCount) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (deletedCount === 1) {
            res.json({ message: 'Order deleted successfully' });
        } else {
            res.status(404).json({ error: 'Order not found for deletion' });
        }
    });
}

function getOrder(orderData, res) {
    if (!validateOrderData(orderData)) {
        return res.status(400).json({ error: 'Invalid order data' });
    }

    const key = constructOrderKey(orderData);
    console.log("Attempting to retrieve order with key:", key);
    client.hgetall(key, (err, retrievedData) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!retrievedData) {
            return res.status(404).json({ error: 'Order not found' });
        }
        console.log("Retrieved order data:", retrievedData);
        res.json(retrievedData);
    });
}


function getAllOrders(res) {
    client.keys('OrderInfo:*', (err, keys) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (keys.length === 0) {
            return res.json([]);
        }
        const multi = client.multi();
        keys.forEach(key => multi.hgetall(key));
        multi.exec((err, orders) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(orders);
        });
    });
}

function validateOrderData(orderData) {
    if (typeof orderData !== 'object' || orderData === null) {
        return false;
    }

    if (
        typeof orderData.TenantId !== 'number' ||
        typeof orderData.OMSId !== 'number' ||
        typeof orderData.OrderType !== 'number' || 
        orderData.OrderType < 0 || 
        typeof orderData.Token !== 'number' || 
        orderData.Token <= 0 || 
        typeof orderData.OrderPrice !== 'number' ||
        typeof orderData.OrderQty !== 'number' ||
        typeof orderData.ClientId !== 'number' ||
        typeof orderData.ClientName !== 'string' ||
        orderData.ClientName.trim() === '' ||
        typeof orderData.Remark !== 'string'
    ) {
        return false;
    }

    return true;
}

function constructOrderKey(orderData) {
    return `OrderInfo:${orderData.TenantId}_${orderData.OMSId}_${orderData.ClientId}_${orderData.Token}`;
}

module.exports = router;
