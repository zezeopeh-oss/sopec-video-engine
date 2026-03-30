export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productName, productPrice, category, productImage } = req.body;

    try {
      // 1. تنظيف الرابط (الحل التقني السابق)
      const cleanImageUrl = encodeURI(productImage.trim());

      // 2. المخرج (Groq) يكتب السيناريو بناءً على القواعد الملزمة
      const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ 
            role: "user", 
            content: `أنت مخرج إعلانات مصري محترف. المنتج: ${productName}، السعر: ${productPrice}ج، القسم: ${category}.
            اكتب "جملة إعلانية واحدة" فقط، بلهجة مصرية مودرن، تخاطب البنات، وتبرز شياكة القطعة كأنها سر جمالها اليومي. 
            (ممنوع الهاشتاجات، ممنوع المقدمات، اكتب الجملة فقط).` 
          }]
        })
      });

      const groqData = await groqResponse.json();
      const caption = groqData.choices[0]?.message?.content || "شياكتك كملت بالقطعة دي";

      // 3. المصنع (Shotstack) ينفذ السيناريو الإخراجي (حركة + نص + إضاءة)
      const shotstackResponse = await fetch('https://api.shotstack.io/stage/render', {
        method: 'POST',
        headers: { 'x-api-key': process.env.SHOTSTACK_STAGE_KEY, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          timeline: {
            background: "#000000",
            tracks: [
              {
                // طبقة النصوص: تظهر بتأثير ناعم
                clips: [
                  {
                    asset: { 
                      type: "text", 
                      text: caption, 
                      font: { family: "Montserrat", size: 34, color: "#FFFFFF" },
                      alignment: { horizontal: "center", vertical: "bottom" }
                    },
                    start: 1, length: 5,
                    transition: { in: "fade", out: "fade" },
                    offset: { y: 0.1 } // لرفع النص عن الحافة السفلية قليلاً
                  }
                ]
              },
              {
                // طبقة الصورة: حركة زووم سينمائية بطيئة
                clips: [
                  {
                    asset: { type: "image", src: cleanImageUrl },
                    start: 0, length: 7,
                    effect: "zoomIn", // تقريب سينمائي للمنتج
                    transition: { in: "fade" }
                  }
                ]
              }
            ]
          },
          output: { format: "mp4", resolution: "hd720" } // جودة عالية للنشر
        })
      });

      const shotstackData = await shotstackResponse.json();

      if (!shotstackData.response || !shotstackData.response.id) {
        return res.status(500).json({ error: "Shotstack Error", details: shotstackData.message });
      }

      res.status(200).json({ 
        renderId: shotstackData.response.id, 
        scriptUsed: caption 
      });

    } catch (error) {
      res.status(500).json({ error: "System Error", details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
