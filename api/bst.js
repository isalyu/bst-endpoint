import { Configuration, OpenAIApi } = require('openai');

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  res.setHeader('Access-Control-Allow-Origin', '*');
  
  try {
    let rawData = '';
    for await (const chunk of req) {
      rawData += chunk;
    }

    const parsedBody = JSON.parse(rawData);
    const { base64Image } = parsedBody;
    console.log('Received base64Image length:', base64Image?.length);

    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);
    console.log('OpenAI client configured.');

    const response = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are a concise assistant. You will be given an image of a BST and a user request. Return ONLY the requested answer with no additional commentary, explanations, disclaimers, or formatting."
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Return a comma-separated list of the values in the BST in the provided image in a level-order traversal. If the image does not contain a valid BST, return -1."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      temperature: 0
    });

    console.log('OpenAI response received:', response.data);

    res.status(200).json({ result: response.data.choices[0].message.content });
  } catch (error) {
      console.error('Error in the /api/bst handler:', error);

      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      if (error.response) {
        console.error('Error response status:', error.response.status);
        console.error('Error response data:', error.response.data);
      }
      res.status(500).json({ error: 'Something went wrong' });
  }
}
