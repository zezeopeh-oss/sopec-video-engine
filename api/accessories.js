export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productName, productPrice, productDescription, productLink } = req.body;

    try {
      // التأكد من وجود المفتاح
      if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "Missing GROQ_API_KEY in Vercel settings" });
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [{ 
            role: "user", 
            content: `اكتب سيناريو إعلاني احترافي لمنتج: ${productName}. السعر: ${productPrice}. الوصف: ${productDescription}. الرابط: ${productLink}` 
          }]
        })
      });

      const data = await response.json();
      
      // إذا كان هناك خطأ من Groq نفسه
      if (data.error) {
        return res.status(500).json({ error: "Groq API Error", details: data.error });
      }

      res.status(200).json({ script: data.choices[0].message.content });
    } catch (error) {
      res.status(500).json({ error: "Server Exception", message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
