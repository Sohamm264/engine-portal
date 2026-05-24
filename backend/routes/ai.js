const express = require("express");
const router = express.Router();
const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

router.post("/ask", async (req, res) => {
  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required" });
  }

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are an AI engine in a backend portal managing users, roles and permissions. Be concise and practical.",
        },
        { role: "user", content: prompt },
      ],
    });

    const reply = chatCompletion.choices[0].message.content;

    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: "AI request failed: " + err.message });
  }
});

module.exports = router;