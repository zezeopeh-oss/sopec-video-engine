// api/brain.js
export default async function handler(req, res) {
    // التأكد أن المفتاح موجود في البيئة (للأمان)
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: "المفتاح GROQ_API_KEY غير موجود في إعدادات فيرسل" });
    }

    // هنا سنضع بقية الكود الذي يرسل البيانات لجروك (Groq)
    res.status(200).json({ message: "النظام جاهز والمفتاح متصل بنجاح" });
}
