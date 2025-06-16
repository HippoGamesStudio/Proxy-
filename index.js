const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

const models = [
    "meta-llama/llama-3-8b-instruct:free",
    "nousresearch/nous-capybara-7b:free",
    "openchat/openchat-3.5:free",
    "mistralai/mistral-7b-instruct:free"
];

async function tryModel(userMessage, promptOnly = false){
    for(const model of models){
        try{
            const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
                
                model: "meta-llama/llama-3-8b-instruct:free",
                messages: [
                    {role: "user", content: userMessage}
                ]
            }, {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
               }
            });

            return {model, response: response.data};
        } catch(err){
            console.warn(`❌ ${promptOnly ? "Emotion" : "Reply"}: модель ${model} недоступна - ${err.response?.data?.error?.message || err.message}`);
            continue;
        }
    }
    throw new Error("❗ Нет доступных");
}

app.post('/chat', async (req, res) => {
    try{
        const userMessage = req.body.message;

        const {response: replyData, model: replyModel} = await tryModel(userMessage);
        const aiReply = replyData.choices[0].message.content;

        const emotionPrompt = `Ответ: "${aiReply}". Какая в нём эмоция? И пожалуйста не добавляй ничего на конце! Ответь одним словом: радость, грусть, злость, удивление, нейтрально.`;

        const {response: emotionData, model: emotionModel} = await tryModel(emotionPrompt, true);
        const emotionRaw = emotionData.choices[0].message.content.trim().toLowerCase();

        res.json({
            reply: aiReply,
            emotion: emotionRaw,
            used_models:{
                replyModel,
                emotionModel
            }
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
