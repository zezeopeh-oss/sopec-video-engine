export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productName, productPrice, productDescription, productLink } = req.body;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ 
            role: "user", 
            content: `أنت مخرج إعلانات محترف متخصص في براندات الإكسسوارات النسائية الراقية في مصر. 
            المطلوب: كتابة "ديكوباج" (سكريبت تصويري) لمنتج: ${productName}. 
            السعر: ${productPrice} جنيه. 
            الوصف الأصلي: ${productDescription}.

            القواعد الصارمة:
            1. الجمهور المستهدف: بنات وسيدات مصريات (استخدم لهجة مصرية "شيك" وعصرية).
            2. تقسيم السيناريو: يجب أن تذكر (حركة الكاميرا، نوع الإضاءة، تفاصيل المحيط/الديكور).
            3. الإضاءة: ركز على الـ Cinematic Lighting واللمعان (Sparkle) الخاص بالقطعة.
            4. الموديل: يجب أن تكون "بنت" بإطلالة أنيقة (Outfit) تليق بالقطعة.
            5. النص الصوتي: كلام مصري جذاب (مثال: "القطعة اللي هتكمل شياكتك"، "لمسة رقيقة ليكي").
            6. لا تستخدم مصطلحات صينية أو ترجمة آلية غريبة.
            7. الرابط في النهاية: ${productLink}

            تنسيق المخرج:
            - المشهد (وصف الكادر، الإضاءة، الحركة).
            - النص الصوتي (باللهجة المصرية).` 
          }]
        })
      });

      const data = await response.json();
      res.status(200).json({ script: data.choices[0].message.content });
    } catch (error) {
      res.status(500).json({ error: "Server Exception", message: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
