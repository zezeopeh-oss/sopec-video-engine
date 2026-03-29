export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productName, productPrice, category, productImage } = req.body;

    try {
      // 1. طلب النص من Groq
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: `جملة بيع مصرية للبنات: ${productName} بـ ${productPrice}ج` }]
        })
      });
      const groqData = await groqResponse.json();
      const caption = groqData.choices[0]?.message?.content || "شياكة ليكي";

      // 2. إرسال لـ Shotstack مع فحص دقيق للرد
      const shotstackResponse = await fetch('https://api.shotstack.io/stage/render', {
        method: 'POST',
        headers: { 'x-api-key': process.env.SHOTSTACK_STAGE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeline: {
            tracks: [{
              clips: [
                { asset: { type: "text", text: caption, font: { family: "Montserrat", size: 30 } }, start: 0, length: 5 },
                { asset: { type: "image", src: productImage }, start: 0, length: 5 }
              ]
            }]
          },
          output: { format: "mp4", resolution: "sd" }
        })
      });

      const shotstackData = await shotstackResponse.json();

      // --- هنا التعديل الجوهري للفحص ---
      if (!shotstackData.response || !shotstackData.response.id) {
        return res.status(500).json({ 
          error: "Shotstack Rejected Request", 
          reason: shotstackData.message || "Unknown Reason",
          sentImage: productImage // لنرى الرابط الذي وصل فعلياً
        });
      }

      res.status(200).json({ renderId: shotstackData.response.id });

    } catch (error) {
      res.status(500).json({ error: "System Crash", details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
