const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

app.post('/chat', async (req, res) => {
    try{
        const userMessage = req.body.message;

        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "meta-llama/llama-3-8b-instruct",
            messages: [
                {role: "user", content: userMessage}
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const aiReply = response.data.choices[0].message.content;

        const emotionPrompt = `Ответ: "${aiReply}". Какая в нём эмоция? И пожалуйста не добавляй ничего на конце! Ответь одним словом: радость, грусть, злость, удивление, нейтрально.`;

        const emotionResponse = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "meta-llama/llama-3-8b-instruct",
            messages: [
                {role: "user", content: emotionPrompt}
            ]
        }, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const emotionRaw = emotionResponse.data.choices[0].message.content.trim().toLowerCase();

        res.json({
            reply: aiReply,
            emotion: emotionRaw
        });
        
    }   catch (err){
        console.error(err.response?.data || err.message);
        res.status(500).json({error: 'Someothing went wrong'});
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🟢 Proxy server running on port ${PORT}`);
})
