import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY || '';

// 🤖 DETEKSI JALUR OTOMATIS:
// Jika kunci diawali 'sk-evomap', aplikasi otomatis lewat Evomap.
// Jika selain itu (format AQ / AIza), otomatis lewat Google Asli!
const isEvomap = apiKey.startsWith('sk-evomap');

let generateContentFn: (prompt: string) => Promise<string>;

if (isEvomap) {
  const openai = new OpenAI({
    apiKey: apiKey,
    baseURL: '[https://api.evomap.ai/v1](https://api.evomap.ai/v1)',
  });

  generateContentFn = async (prompt) => {
    const response = await openai.chat.completions.create({
      model: 'evomap-gemini-3.1-pro-preview',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    });
    return response.choices[0]?.message?.content || '[]';
  };
} else {
  const ai = new GoogleGenAI({ apiKey: apiKey });
  
  generateContentFn = async (prompt) => {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text?.trim() || '[]';
  };
}

export async function POST(request: Request) {
  try {
    const { material } = await request.json();

    if (!material) {
      return NextResponse.json({ error: 'Materi tidak boleh kosong' }, { status: 400 });
    }

    const prompt = `
      Kamu adalah seorang guru stand-up comedy yang sangat gaul dan lucu. Tugasmu adalah membuat 10 soal pilihan ganda berdasarkan materi berikut:
      "${material}"

      ATURAN PENTING:
      1. Gaya bahasa pada pertanyaan dan pilihan jawaban harus super kocak, santai, ada sedikit sarkasme lucu, atau menggunakan analogi absurd tapi secara materi tetap akurat mendidik.
      2. Berikan penjelasan yang tidak kalah lucu tapi informatif di kolom "explanation".
      3. Kembalikan respon WAJIB dalam format JSON object mentah. Jangan gunakan markdown (tanpa \`\`\`json ... \`\`\`).

      Format harus mengikuti struktur JSON ini:
      [
        {
          "question": "Pertanyaan kocak tentang materi",
          "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
          "answer": "Jawaban yang benar (harus persis sama dengan salah satu string di options)",
          "explanation": "Penjelasan kocak bin cerdas kenapa jawaban ini yang benar."
        }
      ]
    `;

    const responseText = await generateContentFn(prompt);
    
    // Pembersihan jika ada markdown yang tidak sengaja terikut dari AI
    let cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    // Mengubah string menjadi JSON Object resmi
    let quizData = JSON.parse(cleanText);
    
    // Jika Evomap membungkus kodenya dalam key { "quiz": [...] } atau { "questions": [...] }
    if (!Array.isArray(quizData)) {
      if (quizData.quiz) {
        quizData = quizData.quiz;
      } else if (quizData.questions) {
        quizData = quizData.questions;
      } else if (Object.keys(quizData).length === 1) {
        // Jika dibungkus key acak lainnya
        const firstKey = Object.keys(quizData)[0];
        if (Array.isArray(quizData[firstKey])) {
          quizData = quizData[firstKey];
        }
      }
    }

    return NextResponse.json({ quiz: quizData });
  } catch (error) {
    console.error('Error di backend:', error);
    return NextResponse.json({ error: 'Gagal membuat kuis' }, { status: 500 });
  }
}