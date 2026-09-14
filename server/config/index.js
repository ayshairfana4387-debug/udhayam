import 'dotenv/config';

export const config = {
  port: process.env.PORT || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri: process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/udyam-sahayak',
  aiApiKey: process.env.AI_API_KEY || ''
};
