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
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert at extracting structured data from business cards and IDs.
      Analyze this image carefully. Use visual cues like fonts, logos, and layout to differentiate information.

      Extraction Rules:
      1. **Name**: Identify the person's name. If no name is present (only a company name exists), leave it blank. Distinguish carefully between the company owner's name and the company name.
      2. **Company**: Identify the company/store/brand name. Look for logos or prominent text.
      3. **Mobile**: Extract phone numbers. Keep country codes (e.g., +91, +89) if present. Handle dashes or spaces gracefully.
      4. **Email**: Extract any email addresses containing '@'.
      5. **Address**: Look for physical addresses. This includes street names, sector/block numbers, cities, and 6-digit pin codes/zip codes. Ensure you capture the full string.
      6. **Age & Gender**: Usually only present on IDs, leave blank if it's a standard business card.

      Return the result as a strict JSON object with EXACTLY these keys: "Name", "Email", "Mobile", "Age", "Gender", "Address", "Company".
      If a field is missing, return an empty string "" for that field. Do not include markdown formatting or backticks, just the raw JSON.
    `;

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
