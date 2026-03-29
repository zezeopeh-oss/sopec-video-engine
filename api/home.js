export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productName, productPrice, productDescription, productLink } = req.body;

    try {
      if (!process.env.GROQ_API_KEY) {
        return res.status(500).json({ error: "Missing GROQ_API_KEY" });
      }

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
            content: `أنت خبير تسويق لمنتجات الملابس المنزلية (Home Wear). اكتب نصاً إعلانياً دافئاً ومريحاً لمنتج: ${productName}. السعر: ${productPrice}. الوصف: ${productDescription}. 
            ركز على شعور الراحة بعد يوم طويل، نعومة القماش، والأجواء الهادئة. اجعل الخاتمة دعوة للشراء عبر هذا الرابط: ${productLink}` 
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
