export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productName, productPrice, category, productImage } = req.body;

    if (!productImage) return res.status(400).json({ error: "رابط الصورة مفقود" });

    try {
      // تحديد "شخصية" الإعلان بناءً على القسم
      let promptTask = `اكتب جملة تسويقية مصرية قصيرة لمنتج: ${productName} في قسم ${category}.`;
      
      if (category.includes("إكسسوارات") || category.includes("Accessories")) {
        promptTask += " ركز على الشياكة، البنات، واللمعة (اللهجة المصرية الشيك).";
      } else if (category.includes("Home") || category.includes("منزل")) {
        promptTask += " ركز على الراحة، جمال البيت، والدفء (اللهجة المصرية الدافئة).";
      }

      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: promptTask }]
        })
      });

      const groqData = await groqResponse.json();
      const caption = groqData.choices[0]?.message?.content || "قطعة مميزة ليكي";

      // إرسال الطلب لـ Shotstack
      const shotstackResponse = await fetch('https://api.shotstack.io/stage/render', {
        method: 'POST',
        headers: { 'x-api-key': process.env.SHOTSTACK_STAGE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeline: {
            tracks: [{
              clips: [
                { asset: { type: "text", text: caption, font: { family: "Montserrat", size: 32 } }, start: 0, length: 5 },
                { asset: { type: "image", src: productImage }, start: 0, length: 5, effect: "zoomIn" }
              ]
            }]
          },
          output: { format: "mp4", resolution: "sd" }
        })
      });

      const shotstackData = await shotstackResponse.json();
      res.status(200).json({ renderId: shotstackData.response.id, caption: caption });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
