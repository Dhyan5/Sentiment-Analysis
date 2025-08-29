const express = require('express');
const cors = require('cors');
const path = require('path');
const { SentimentAnalyzer, PorterStemmer } = require('natural');

const app = express();
const port = 3000;

const analyzer = new SentimentAnalyzer('English', PorterStemmer, 'afinn');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

app.post('/analyze', (req, res) => {
    const { text } = req.body;

    if (!text) {
        return res.status(400).json({ error: 'No text provided' });
    }

    const tokenizedText = text.toLowerCase().split(/\s+/);
    const sentimentScore = analyzer.getSentiment(tokenizedText);

    let dominantEmotion = 'neutral';
    if (sentimentScore > 0.1) {
        dominantEmotion = 'joy';
    } else if (sentimentScore < -0.1) {
        dominantEmotion = 'anger';
    }
    
    const scores = {};
    scores[dominantEmotion] = sentimentScore.toFixed(2);

    res.json({
        emotion: dominantEmotion,
        scores: scores
    });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
