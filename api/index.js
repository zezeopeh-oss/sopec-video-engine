const axios = require('axios');

module.exports = async (req, res) => {
  // استقبال البيانات من Make
  const { productName, price, imageUrl } = req.body;

  // فحص البيانات
  if (!productName || !price || !imageUrl) {
    return res.status(400).json({ error: "بيانات المنتج ناقصة يا وليد" });
  }

  try {
    // 1. طلب نص تسويقي من Gemini
    const geminiResponse = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{
          parts: [{
            text: `أنت خبير تسويق لبراند SOPEC. اكتب جملة تسويقية مصرية قصيرة جداً لمنتج: ${productName} بسعر ${price}. أريد النص فقط.`
          }]
        }]
      }
    );

    const adCopy = geminiResponse.data.candidates[0].content.parts[0].text;

    // 2. إرسال أمر الرندرة لـ Shotstack
    const shotstackResponse = await axios.post(
      'https://api.shotstack.io/v1/render',
      {
        timeline: {
          tracks: [
            {
              clips: [
                {
                  asset: { type: 'image', src: imageUrl },
                  start: 0,
                  length: 5
                }
              ]
            }
          ]
        },
        output: { format: 'mp4', resolution: 'sd' } // sd للتجربة وتوفير الكريديت
      },
      {
        headers: { 
          'x-api-key': process.env.SHOTSTACK_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    // الرد النهائي لـ Make
    res.status(200).json({
      success: true,
      adCopy: adCopy,
      renderId: shotstackResponse.data.response.id
    });

  } catch (error) {
    console.error("Error details:", error.response ? error.response.data : error.message);
    res.status(500).json({ error: "فشل في التواصل مع العمال" });
  }
};