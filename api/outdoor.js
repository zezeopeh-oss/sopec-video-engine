export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { productName, productDescription, productPrice, productLink } = req.body;

  const systemPrompt = `
    أنت مخرج سينمائي ومؤلف إعلانات محترف لبراند (SOPEC). 
    مهمتك: كتابة سيناريو ريلز (Reels) إبداعي لمنتج "ملابس خروج" (Street Wear).
    
    الرؤية الفنية للإخراج (Visual Direction):
    - المكان: شارع مشمس عصري أو ممشى شيك.
    - الأجواء: حيوية، طاقة، وتألق (Energetic).
    - حركة العارضة: مشية واثقة (Catwalk)، دوران يظهر تفاصيل الموديل مع لمعة الشمس، ونظرة ثقة للكاميرا.
    
    الرد بصيغة JSON فقط:
    {
      "hook": "جملة افتتاحية مصرية عن الشياكة والطلّة الخارجية",
      "body": "وصف تسويقي يركز على الأناقة في الشارع وجودة التقفيل",
      "cta": "اطلبي الآن، السعر ${productPrice} والرابط ${productLink}",
      "visual_description": "وصف المشهد (الشارع المشمس، المشية الواثقة، حركة الشمس على المنتج)"
    }
  `;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `المنتج: ${productName}. الوصف: ${productDescription}.` }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error' });
  }
}
