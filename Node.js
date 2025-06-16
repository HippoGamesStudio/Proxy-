const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const GROQ_API_KEY = process.env.GROQ_API_KEY;

app.post('/chat', async (req, res) => {
    try{
        const userMessage = req.body.message;

        const response = await axios.post('https://api.groq.com/openai/v1/chat/completions', {
            model: "mixtral-8x7b-32768",
            messages: [
                {role: "user", content: userMessage}
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        res.json(response.data);
    }   catch (err){
        console.error(err.response?.data || err.message);
        res.status(500).json({error: 'Someothing went wrong'});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`proxy server running on port ${PORT}`);
})