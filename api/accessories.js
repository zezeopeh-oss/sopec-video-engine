export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productName, productPrice, productDescription, productLink, productImage } = req.body;

    // صمام أمان للتأكد من وصول الصورة
    if (!productImage) {
      return res.status(400).json({ error: "خطأ: رابط الصورة لم يصل من ميك (Make)" });
    }

    try {
      // 1. طلب النص من Groq
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ 
            role: "user", 
            content: `اكتب جملة تسويقية مصرية قصيرة جداً للبنات لمنتج: ${productName} بسعر ${productPrice} جنيه.` 
          }]
        })
      });

      const groqData = await groqResponse.json();
      const caption = groqData.choices[0]?.message?.content || "شياكة تجنن!";

      // 2. إرسال لـ Shotstack
      const shotstackResponse = await fetch('https://api.shotstack.io/stage/render', {
        method: 'POST',
        headers: {
          'x-api-key': process.env.SHOTSTACK_STAGE_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          timeline: {
            tracks: [
              {
                clips: [
                  {
                    asset: { type: "text", text: caption, font: { family: "Montserrat", size: 30 } },
                    start: 0, length: 5
                  },
                  {
                    asset: { type: "image", src: productImage },
                    start: 0, length: 5
                  }
                ]
              }
            ]
          },
          output: { format: "mp4", resolution: "sd" }
        })
      });

      const shotstackData = await shotstackResponse.json();

      if (shotstackData.success === false) {
        return res.status(500).json({ error: "Shotstack API Error", message: shotstackData.message });
      }

      res.status(200).json({ renderId: shotstackData.response.id, caption: caption });

    } catch (error) {
      res.status(500).json({ error: "Server Exception", details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
