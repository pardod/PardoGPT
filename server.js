// server.js
const express = require('express');
const path = require('path'); // Import path module to resolve paths
const Replicate = require('replicate');
const bodyParser = require('body-parser');

require('dotenv').config();

const app = express();
const port = 3000;

// Middleware to serve static files
app.use(express.static('public'));
app.use(bodyParser.json());

const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
});

// Root route to serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/prompt', async (req, res) => {
    try {
        const input = req.body;
        const stream = replicate.stream("meta/meta-llama-3-8b-instruct", { input });
        let output = '';
        for await (const event of stream) {
            output += event.toString();
        }
        res.json({ response: output });
    } catch (error) {
        console.error(error); // Log the error to the server console for debugging
        res.status(500).json({ error: error.message || 'Failed to retrieve response from LLAMA API' });
    }
});


app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
