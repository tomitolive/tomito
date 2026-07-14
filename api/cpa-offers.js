import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const AFFILIATE_ID = '2541994';
const API_KEY = '874bb25988a5ec8bdfb76d6d854d8449';

app.get('/api/cpa-offers', async (req, res) => {
  try {
    const { country = '', limit = 10 } = req.query;
    
    const url = `https://www.cpagrip.com/common/offer_feed.php?user_id=${AFFILIATE_ID}&key=${API_KEY}&country=${country}&limit=${limit}&format=json`;
    
    console.log('Fetching from CPAGrip:', url);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`CPAGrip API error: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('CPAGrip response:', data);
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching CPA offers:', error);
    res.status(500).json({ error: 'Failed to fetch offers', offers: [] });
  }
});

app.listen(PORT, () => {
  console.log(`CPA Proxy Server running on port ${PORT}`);
});
