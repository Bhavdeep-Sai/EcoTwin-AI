import { getDb } from './src/lib/db/localStore';
import Groq from 'groq-sdk';
import 'dotenv/config';

async function testGroq() {
  console.log("Testing Groq...");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [{ role: "user", content: "Say hello!" }],
      model: "llama3-8b-8192",
      temperature: 0.7,
      max_tokens: 100,
    });
    console.log("Groq response:", chatCompletion.choices[0]?.message?.content);
  } catch (err) {
    console.error("Groq error:", err);
  }
}

testGroq();
