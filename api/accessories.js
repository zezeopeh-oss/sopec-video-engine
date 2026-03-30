export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productName, productPrice, category, productImage } = req.body;

    try {
      const cleanImageUrl = encodeURI(productImage.trim());

      // 1. المخرج (Groq) يكتب السيناريو الإعلاني
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ 
            role: "user", 
            content: `اكتب جملة إعلانية مصرية قصيرة جداً للبنات عن ${productName} سعره ${productPrice}ج في قسم ${category}. ركز على الشياكة والدلع.` 
          }]
        })
      });
      const groqData = await groqResponse.json();
      const caption = groqData.choices[0]?.message?.content || "شياكة مالهاش حدود";

      // 2. المصنع (Shotstack) ينفذ الفيديو
      const shotstackResponse = await fetch('https://api.shotstack.io/stage/render', {
        method: 'POST',
        headers: { 
          'x-api-key': process.env.SHOTSTACK_API_KEY, // هنا نستخدم الاسم الموجود في فيرسل عندك
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          timeline: {
            background: "#000000",
            tracks: [
              {
                clips: [{
                  asset: { 
                    type: "text", text: caption, 
                    font: { family: "Montserrat", size: 30, color: "#FFFFFF" },
                    alignment: { horizontal: "center", vertical: "bottom" }
                  },
                  start: 1, length: 5, transition: { in: "fade" }
                }]
              },
              {
                clips: [{
                  asset: { type: "image", src: cleanImageUrl },
                  start: 0, length: 7, effect: "zoomIn"
                }]
              }
            ]
          },
          output: { format: "mp4", resolution: "sd" }
        })
      });

      const shotstackData = await shotstackResponse.json();

      if (shotstackResponse.status !== 201 && shotstackResponse.status !== 200) {
        return res.status(500).json({ 
          error: "Authentication Failed", 
          status: shotstackResponse.status,
          message: shotstackData.message 
        });
      }

      res.status(200).json({ renderId: shotstackData.response.id });

    } catch (error) {
      res.status(500).json({ error: "System Error", details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
