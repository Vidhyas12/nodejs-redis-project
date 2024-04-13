
const express = require('express');
const router = express.Router();
const redis = require('ioredis');

const client = redis.createClient();

router.use(express.json());

router.post('/api', (req, res) => {
    const { OperationType, TenantId, OMSId, ClientId, ClientName } = req.body;
    
    switch(OperationType) {
        case 100:
            addClient(req.body, res);
            break;
        case 101:
            updateClient(req.body, res);
            break;
        case 102:
            removeClient(req.body.ClientId, res);
            break;
        case 103:
            getClient(req.body.ClientId, res); 
            break;
        case 104:
            getAllClients(res);
            break;
        default:
            res.status(400).json({ message: 'Invalid OperationType' });
    }
});

function addClient(clientData, res) {
    
    if (!validateClientData(clientData)) {
        return res.status(400).json({ message: 'Invalid client data' });
    }

    
    const key = `ClientInfo:${clientData.ClientId}`;
    client.hmset(key, clientData, (err, reply) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'Client added successfully' });
    });
}

function updateClient(clientData, res) {
    
    if (!validateClientData(clientData)) {
        return res.status(400).json({ message: 'Invalid client data' });
    }

   
    const key = `ClientInfo:${clientData.ClientId}`;
    client.exists(key, (err, exists) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!exists) {
            return res.status(404).json({ message: 'Client not found' });
        }
        
        
        client.hmset(key, clientData, (err, reply) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json({ message: 'Client updated successfully' });
        });
    });
}

function removeClient(clientId, res) {
  
    const key = `ClientInfo:${clientId}`;
    client.del(key, (err, deletedCount) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (deletedCount === 1) {
            res.json({ message: 'Client deleted successfully' });
        } else {
            res.status(404).json({ message: 'Client not found' });
        }
    });
}

function getClient(clientId, res) {
  
    const key = `ClientInfo:${clientId}`;
    client.hgetall(key, (err, clientData) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (!clientData) {
            return res.status(404).json({ message: 'Client not found' });
        }
        res.json(clientData);
    });
}

function getAllClients(res) {
  
    client.keys('ClientInfo:*', (err, keys) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (keys.length === 0) {
            return res.json([]);
        }
        const multi = client.multi();
        keys.forEach(key => multi.hgetall(key));
        multi.exec((err, clients) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.json(clients);
        });
    });
}


function validateClientData(clientData) {
  
    if (typeof clientData !== 'object' || clientData === null) {
        return false;
    }

    
    if (
        typeof clientData.ClientId !== 'number' ||
        typeof clientData.ClientName !== 'string' ||
        clientData.ClientName.trim() === ''
    ) {
        return false;
    }

    
    return true;
}

module.exports = router;
