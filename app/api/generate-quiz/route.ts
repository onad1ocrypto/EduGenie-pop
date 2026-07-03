import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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
      3. Kembalikan respon HANYA dalam format JSON mentah tanpa markdown (jangan gunakan \`\`\`json ... \`\`\`).

      Format harus mengikuti struktur ini:
      [
        {
          "question": "Pertanyaan kocak tentang materi",
          "options": ["Opsi A", "Opsi B", "Opsi C", "Opsi D"],
          "answer": "Jawaban yang benar (harus persis sama dengan salah satu string di options)",
          "explanation": "Penjelasan kocak bin cerdas kenapa jawaban ini yang benar."
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const responseText = response.text?.trim() || '[]';
    const quizData = JSON.parse(responseText);

    return NextResponse.json({ quiz: quizData });
  } catch (error) {
    console.error('Error di backend:', error);
    return NextResponse.json({ error: 'Gagal membuat kuis' }, { status: 500 });
  }
}