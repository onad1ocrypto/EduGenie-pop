import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Mengaktifkan AI menggunakan kunci rahasia yang tersimpan di Environment Variables Vercel
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(request: Request) {
  try {
    // Mengambil data material dan tipe bahasa yang dikirim oleh user dari frontend
    const { material, language } = await request.json();

    // Validasi singkat: jika user belum mengetik materi, langsung stop dan beri peringatan
    if (!material) {
      return NextResponse.json({ error: 'Materi tidak boleh kosong' }, { status: 400 });
    }

    // Menentukan instruksi gaya bahasa berdasarkan pilihan dari frontend
    let languageInstruction = '';

    if (language === 'en') {
      languageInstruction = 'Jawab SEPENUHNYA dalam Bahasa Inggris (English). Pertanyaan, pilihan jawaban, dan penjelasan harus menggunakan bahasa Inggris gaul, lucu, dan santai.';
    } else if (language === 'zh') {
      languageInstruction = 'Jawab SEPENUHNYA dalam Bahasa Mandarin/Cina (简体中文). Pertanyaan, pilihan jawaban, dan penjelasan harus menggunakan bahasa Mandarin yang santai dan tetap memiliki unsur humor.';
    } else {
      languageInstruction = 'Jawab SEPENUHNYA dalam Bahasa Indonesia. Gaya bahasa harus super kocak, santai, ada sedikit sarkasme lucu, atau menggunakan analogi absurd.';
    }

    const prompt = `
      Kamu adalah seorang guru stand-up comedy yang sangat gaul dan lucu. Tugasmu adalah membuat 10 soal pilihan ganda berdasarkan materi berikut:
      "${material}"

      ATURAN PENTING:
      1. ${languageInstruction}
      2. Secara materi kuis harus tetap akurat mendidik.
      3. Berikan penjelasan yang tidak kalah lucu tapi informatif di kolom "explanation".
      4. Kembalikan respon HANYA dalam format JSON mentah tanpa markdown (jangan gunakan \`\`\`json ... \`\`\`).

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

    // Mengirim perintah ke model Gemini 3.1 Flash Lite yang kuotanya aman (500/hari)
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });

    // Mengubah teks dari AI menjadi format data JSON yang bisa dibaca sistem
    const responseText = response.text?.trim() || '[]';
    const quizData = JSON.parse(responseText);

    // Kirim hasil kuis akhir ke frontend
    return NextResponse.json({ quiz: quizData });

  } catch (error) {
    console.error('Error di backend:', error);
    return NextResponse.json({ error: 'Gagal membuat kuis' }, { status: 500 });
  }
}