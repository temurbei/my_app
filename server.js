import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("."));

app.get("/", (req, res) => {
  res.sendFile(process.cwd() + "/index.html");
});

app.post("/api/chat", async (req, res) => {
  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        messages: req.body.messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    const data = await r.json();

    if (!r.ok) {
      return res.status(r.status).json({
        error: {
          message: data?.error?.message || "OpenAI API xatosi"
        }
      });
    }

    return res.json(data);
  } catch (e) {
    return res.status(500).json({
      error: { message: e.message || "Server xatosi" }
    });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});