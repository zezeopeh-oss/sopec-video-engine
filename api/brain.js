// api/brain.js

export default async function handler(req, res) {
    // 1. الأمان: السماح فقط بطلبات POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed - Use POST' });
    }

    // 2. التحقق من وجود المفتاح في إعدادات فيرسل
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ 
            error: "Missing API Key: تأكد من إضافة GROQ_API_KEY في إعدادات فيرسل" 
        });
    }

    try {
        // 3. استلام بيانات المنتج من جسم الطلب (Body)
        const { productName, productDescription, productPrice, productLink } = req.body;

        // 4. إرسال البيانات إلى جروك (Groq)
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "أنت خبير تسويق ريلز محترف. وظيفتك كتابة نصوص بيعية بالعامية المصرية بأسلوب خاطف."
                    },
                    {
                        role: "user",
                        content: `صمم سيناريو ريلز لهذا المنتج:
                        الاسم: ${productName || 'غير متوفر'}
                        الوصف: ${productDescription || 'غير متوفر'}
                        السعر: ${productPrice || 'غير متوفر'}
                        الرابط: ${productLink || ''}
                        
                        أريد الرد بتنسيق JSON حصراً يحتوي على:
                        {
                          "hook": "جملة البداية",
                          "body": "شرح المميزات سريعاً",
                          "cta": "جملة دعوة للشراء",
                          "visual_description": "وصف للمشهد البصري"
                        }`
                    }
                ],
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();

        // 5. إرسال النتيجة النهائية
        if (data.choices && data.choices[0]) {
            const aiContent = JSON.parse(data.choices[0].message.content);
            return res.status(200).json({
                success: true,
                data: aiContent
            });
        } else {
            throw new Error("Invalid response from Groq API");
        }

    } catch (error) {
        console.error("Brain Error:", error);
        return res.status(500).json({ 
            success: false, 
            error: "حدث خطأ أثناء معالجة السيناريو" 
        });
    }
}
