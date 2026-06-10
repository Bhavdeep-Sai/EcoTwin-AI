import Groq from "groq-sdk"

// Make sure to only use this client in Server Actions or Server Components
// to prevent leaking the API key to the browser.
export const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})
