import express from 'express'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(express.json()) // علشان يقرأ JSON من Postman أو Make

// Home route - HTML
app.get('/', (req, res) => {
  res.type('html').send(`
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8"/>
        <title>Express on Vercel</title>
        <link rel="stylesheet" href="/style.css" />
      </head>
      <body>
        <nav>
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/api-data">API Data</a>
          <a href="/healthz">Health</a>
          <a href="/api-gemini">Gemini</a>
        </nav>
        <h1>Welcome to Express on Vercel 🚀</h1>
        <p>This is a minimal example without a database or forms.</p>
        <img src="/logo.png" alt="Logo" width="120" />
      </body>
    </html>
  `)
})

app.get('/about', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'components', 'about.htm'))
})

// Example API endpoint - JSON
app.get('/api-data', (req, res) => {
  res.json({
    message: 'Here is some sample API data',
    items: ['apple', 'banana', 'cherry'],
  })
})

// Health check
app.get('/healthz', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Gemini API Route
app.post('/api-gemini', async (req, res) => {
  try {
    const { product_title, product_price } = req.body

    const prompt = `اكتب جملة تسويقية قصيرة وجذابة لمنتج "${product_title}" بسعر "${product_price}" لبراند SOPEC.`

    const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.0-flash-preview:generateContent"

    const response = await fetch(`${url}?key=${process.env.GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          { role: "user", parts: [{ text: prompt }] }
        ]
      })
    })

    const data = await response.json()

    const adCopy =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.output ||
      "لم يتم توليد نص"

    res.json({ success: true, adCopy })
  } catch (error) {
    console.error("Error generating ad copy:", error)
    res.status(500).json({ success: false, error: "Server Error" })
  }
})

export default app
