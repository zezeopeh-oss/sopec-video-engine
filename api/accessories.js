export default async function handler(req, res) {
  if (req.method === 'POST') {
    const { productName, productPrice, productDescription, productLink } = req.body;

    const prompt = `
      You are a high-end jewelry and accessory commercial director. 
      Create a video script for a product called: "${productName}".
      Price: ${productPrice}.
      Description: ${productDescription}.
      
      The tone should be elegant, luxurious, and focus on details.
      Script Requirements:
      1. Scene 1: Close-up macro shot showing the texture and shine of the accessory.
      2. Scene 2: Artistic shot with soft lighting and bokeh background.
      3. Scene 3: How it looks when worn or held.
      4. Text Overlay: Focus on "Elegance" and "Perfect Gift".
      5. Music: Soft, sophisticated, and rhythmic.
      
      Link to include at the end: ${productLink}
      Respond in Arabic.
    `;

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "mixtral-8x7b-32768",
          messages: [{ role: "user", content: prompt }]
        })
      });

      const data = await response.json();
      res.status(200).json({ script: data.choices[0].message.content });
    } catch (error) {
      res.status(500).json({ error: 'Error generating script' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
