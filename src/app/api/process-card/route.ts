import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY || ""; 
    const groqApiKey = process.env.GROQ_API_KEY || "";
    
    const prompt = `
      You are an elite AI extraction assistant designed to process business cards and IDs with 100% pixel-perfect accuracy.
      Analyze this image carefully. You MUST transcribe text character-by-character. Do NOT guess or hallucinate. 
      If a letter is C, do not write L. If a letter is N, do not write O.

      Extraction Rules:
      1. **Name**: Identify the person's name EXACTLY as printed. 
      2. **Company**: Identify the company/store/brand name EXACTLY as printed. Look closely at logos.
      3. **Mobile**: Extract ALL phone numbers. Preserve exact formatting including parentheses, dashes, plus signs, and country codes (e.g., (656)-8686-869, (44)- 6565-1423).
      4. **Email**: Extract any email addresses containing '@'. Spelling must be flawless.
      5. **Address**: Look for physical addresses. Preserve spacing, punctuation, and pin codes perfectly.
      6. **Age & Gender**: Usually only present on IDs, leave blank if it's a standard business card.
      7. **face_detected**: Set to true if you can see a human face/passport photo/headshot in the image. Set to false if the card has no face photo.

      Return the result as a strict JSON object with EXACTLY these keys: "Name", "Email", "Mobile", "Age", "Gender", "Address", "Company", "face_detected".
      If a field is missing, return an empty string "" for that field. face_detected must be a boolean (true or false). Do not include markdown formatting or backticks, just the raw JSON.
    `;

    let extractedData;

    try {
      // 1st Attempt: Gemini 3.6 Flash
      const genAI = new GoogleGenerativeAI(geminiApiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });
      const base64Data = image.replace(/^data:image\/(png|jpeg|jpg);base64,/, "");

      const imageParts = [
        {
          inlineData: {
            data: base64Data,
            mimeType: "image/jpeg"
          },
        },
      ];

      const result = await model.generateContent([prompt, ...imageParts]);
      const responseText = result.response.text();
      const cleanedJsonString = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      extractedData = JSON.parse(cleanedJsonString);

    } catch (geminiError) {
      console.warn("Gemini API failed, falling back to Groq Llama 3.2 90B Vision:", geminiError);

      // 2nd Attempt: Groq Fallback
      const groq = new Groq({ apiKey: groqApiKey });
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: prompt },
              {
                type: "image_url",
                image_url: { url: image },
              },
            ],
          },
        ],
        model: "llama-3.2-90b-vision-preview",
        temperature: 0.1,
        response_format: { type: "json_object" },
      });

      const responseText = chatCompletion.choices[0]?.message?.content || "{}";
      extractedData = JSON.parse(responseText);
    }

    return NextResponse.json({
      result: {
        name: extractedData.Name || '',
        mobile: extractedData.Mobile || '',
        email: extractedData.Email || '',
        age: extractedData.Age || '',
        gender: extractedData.Gender || '',
        address: extractedData.Address || '',
        company: extractedData.Company || '',
        face_detected: extractedData.face_detected === true,
      }
    });

  } catch (error) {
    console.error("API Error (All Models Failed):", error);
    return NextResponse.json({ error: 'Failed to process card image via both APIs' }, { status: 500 });
  }
}
