import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.warn("No GROQ_API_KEY provided. Using mock data.");
      return NextResponse.json({
        result: {
          name: 'Jane Doe',
          mobile: '555-1234',
          email: 'jane@example.com',
          age: '28',
          gender: 'Female',
          address: '123 Tech Lane',
          company: 'Tech Corp',
          face_detected: true,
        },
      });
    }

    const groq = new Groq({ apiKey });

    // Groq requires base64 URL directly
    const matches = image.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
    const base64Data = matches?.[2] || '';

    const response = await groq.chat.completions.create({
      model: "qwen/qwen3.6-27b",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are an expert OCR AI. Analyze this visiting/ID card and extract these exact fields: Name, Mobile, Email, Age, Gender, Company, Address. \nCRITICAL RULES for Data Cleaning: \n- Name: Correct OCR pixelation errors to logical human names. \n- Mobile: Format mobile/phone numbers cleanly. It should be numerical. If there are 2 or more numbers on the card, extract ONLY the first one. \n- Age: Must be purely numerical. \n- Address: Look closely for address separators like commas (,), numeric pincodes/zip codes, and house/building numbers to ensure the full continuous address is captured. \n- Email: Valid lowercase email, correct obvious domain typos. \n- Missing fields: return an empty string (""). \n- Visually analyze the card: if a photograph of a human face/portrait is printed on it, return face_detected: true. If it contains only text/logos without a human face, return face_detected: false. \nReturn ONLY a valid JSON object matching this schema exactly: {"name":"","mobile":"","email":"","age":"","gender":"","company":"","address":"","face_detected":false}`
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Data}`,
              },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.1, // Low temperature for factual extraction
    });

    const content = response.choices[0]?.message?.content || "{}";
    let parsedResult = {};
    try {
      parsedResult = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse Groq response:", content);
      throw new Error("Failed to parse AI response into JSON");
    }

    // NOTE: We do NOT upload to Drive here anymore. We only return the parsed data.
    return NextResponse.json({
      result: parsedResult,
    });

  } catch (error: unknown) {
    console.error("Process card error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
