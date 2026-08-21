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
              text: `You are an expert OCR AI. Analyze this visiting/ID card and extract these exact fields: Name, Mobile, Email, Age, Gender, Company, Address. \nCRITICAL RULES for Data Cleaning: \n- Fix common OCR scanning errors caused by pixelation. Do not duplicate letters unnecessarily (e.g., if a word looks like 'LLAIR', correct it to a logical human name). \n- Format mobile numbers cleanly without stray dashes. \n- If an email address is present, ensure it is a valid, lowercase email string and correct obvious typos in the domain. \n- If a field is missing, return an empty string (""). \n- Visually analyze the card: if a photograph of a human face/portrait is printed on it, return face_detected: true. If it contains only text/logos without a human face, return face_detected: false. \nReturn ONLY a valid JSON object matching this schema exactly: {"name":"","mobile":"","email":"","age":"","gender":"","company":"","address":"","face_detected":false}`
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
