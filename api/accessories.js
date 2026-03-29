export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productName, productPrice, productDescription, productLink, productImage } = req.body;

    try {
      // 1. استدعاء المخرج (Groq) لكتابة سكريبت إخراجي مصري دقيق
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
            content: `أنت مخرج إعلانات محترف. اكتب جملة إعلانية واحدة جذابة جداً باللهجة المصرية لمنتج: ${productName} بسعر ${productPrice} جنيه. 
            واجعل الجملة تصف "شياكة البنت المصرية" بالقطعة دي. (بدون مقدمات)` 
          }]
        })
      });

      const groqData = await groqResponse.json();
      const caption = groqData.choices[0].message.content;

      // 2. إرسال التصميم لـ Shotstack مع مراعاة الحركة والجمالية
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
                // طبقة النصوص (العنوان والجملة التسويقية)
                clips: [
                  {
                    asset: { 
                      type: "text", 
                      text: caption, 
                      font: { family: "Montserrat", size: 36, color: "#ffffff" },
                      alignment: { horizontal: "center", vertical: "center" }
                    },
                    start: 1, length: 5,
                    transition: { in: "fade", out: "fade" },
                    offset: { y: -0.2 } // لرفع النص قليلاً عن المنتصف
                  }
                ]
              },
              {
                // طبقة الصورة مع حركة (Zoom In) لجعلها سينمائية
                clips: [
                  {
                    asset: { type: "image", src: productImage },
                    start: 0, length: 7,
                    effect: "zoomIn" // حركة سينمائية للصورة
                  }
                ]
              }
            ]
          },
          output: { format: "mp4", resolution: "hd720" }
        })
      });

      const shotstackData = await shotstackResponse.json();

      res.status(200).json({ 
        renderId: shotstackData.response.id, 
        caption: caption,
        status: "Action Started"
      });

    } catch (error) {
      res.status(500).json({ error: "خطأ في النظام", details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
