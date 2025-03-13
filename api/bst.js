import { Configuration, OpenAIApi } from 'openai';

export default async function handler(req, res) {
  try {
    const { base64Image } = JSON.parse(req.body);

    const configuration = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
    const openai = new OpenAIApi(configuration);

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

    res.status(200).json({ result: response.data.choices[0].message.content });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Something went wrong' });
  }
}
