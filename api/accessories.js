export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productName, productPrice, category, productImage } = req.body;

    try {
      // 1. تنظيف الرابط
      const cleanImageUrl = encodeURI(productImage.trim());

      // 2. إرسال طلب مبسط جداً لـ Shotstack لاختبار الاتصال
      const shotstackResponse = await fetch('https://api.shotstack.io/stage/render', {
        method: 'POST',
        headers: { 
          'x-api-key': process.env.SHOTSTACK_STAGE_KEY, 
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          timeline: {
            tracks: [{
              clips: [{
                asset: { type: "image", src: cleanImageUrl },
                start: 0, length: 5
              }]
            }]
          },
          output: { format: "mp4", resolution: "sd" }
        })
      });

      const shotstackData = await shotstackResponse.json();

      // فحص الرد وتمرير رسالة الخطأ الأصلية من شوتستك لميك
      if (shotstackResponse.status !== 201 && shotstackResponse.status !== 200) {
        return res.status(500).json({ 
          error: "Shotstack API Refused", 
          statusCode: shotstackResponse.status,
          message: shotstackData.message || "خطأ غير معروف في حساب شوتستك",
          debug_info: shotstackData
        });
      }

      res.status(200).json({ renderId: shotstackData.response.id });

    } catch (error) {
      res.status(500).json({ error: "Vercel Server Crash", details: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
