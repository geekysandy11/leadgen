import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: Request) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || ""; 
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-3.6-flash" });

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

      Return the result as a strict JSON object with EXACTLY these keys: "Name", "Email", "Mobile", "Age", "Gender", "Address", "Company".
      If a field is missing, return an empty string "" for that field. Do not include markdown formatting or backticks, just the raw JSON.    `;

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
    const extractedData = JSON.parse(cleanedJsonString);

    return NextResponse.json({
      result: {
        name: extractedData.Name || '',
        mobile: extractedData.Mobile || '',
        email: extractedData.Email || '',
        age: extractedData.Age || '',
        gender: extractedData.Gender || '',
        address: extractedData.Address || '',
        company: extractedData.Company || '',
        face_detected: true,
      }
    });

  } catch (error) {
    console.error("Gemini API Error:", error);
    return NextResponse.json({ error: 'Failed to process card image' }, { status: 500 });
  }
}





