'use client';

import { useState } from 'react';

interface QuizItem {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

export default function Home() {
  const [material, setMaterial] = useState('');
  const [language, setLanguage] = useState('id'); // Default: Bahasa Indonesia
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material.trim()) return;

    setLoading(true);
    setError('');
    setQuiz([]);
    setUserAnswers({});
    setShowResults(false);

    try {
      const response = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ material, language }), // 🚀 Kirim materi & pilihan bahasa ke backend
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat kuis');
      }

      setQuiz(data.quiz || []);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
      alert(`Eror dari AI: ${err.message || 'Gagal membuat kuis'}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex: number, option: string) => {
    if (showResults) return; // Kunci jawaban jika sudah dinilai
    setUserAnswers({ ...userAnswers, [questionIndex]: option });
  };

  const checkScore = () => {
    setShowResults(true);
  };

  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col items-center font-sans">
      <div className="max-w-2xl w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 mb-8">
        <h1 className="text-3xl font-extrabold text-center mb-2 uppercase tracking-wide">
          🧙‍♂️ EduGenie Pop
        </h1>
        <p className="text-center text-sm font-bold text-gray-600 mb-6">
          Sulap Materi Menjadi 10 Soal Kuis Pilihan Ganda Komedi!
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Dropdown Pilihan Bahasa */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm uppercase">Pilih Bahasa Kuis:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-3 border-3 border-black font-bold rounded-lg bg-yellow-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none cursor-pointer"
            >
              <option value="id">🇮🇩 Bahasa Indonesia (Kocak & Sarkas)</option>
              <option value="en">🇺🇸 English (Funny & Casual)</option>
              <option value="zh">🇨🇳 中文 / Mandarin (Humorous)</option>
            </select>
          </div>

          {/* Input Materi */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm uppercase">Masukkan Materi Belajar:</label>
            <textarea
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder='Contoh: "Belajar asam basa kimia kelas 11 dan indikator lakmus"'
              rows={4}
              disabled={loading}
              className="p-3 border-3 border-black font-semibold rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none disabled:bg-gray-200"
            />
          </div>

          {/* Tombol Aksi */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-green-400 disabled:bg-gray-400 font-extrabold uppercase tracking-wider text-black border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            {loading ? '🔮 MENYULAP SOAL KOCAK... TUNGGU YA!' : '✨ SULAP JADI SOAL KUIS'}
          </button>
        </form>
      </div>

      {/* Tampilan Soal Kuis */}
      {quiz.length > 0 && (
        <div className="max-w-2xl w-full flex flex-col gap-6 mb-10">
          {quiz.map((item, qIdx) => {
            const isCorrect = userAnswers[qIdx] === item.answer;
            return (
              <div
                key={qIdx}
                className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-5"
              >
                <h3 className="font-extrabold text-lg mb-4">
                  {qIdx + 1}. {item.question}
                </h3>
                <div className="flex flex-col gap-2">
                  {item.options.map((option, oIdx) => {
                    const isSelected = userAnswers[qIdx] === option;
                    let btnStyle = 'bg-white';

                    if (isSelected) btnStyle = 'bg-blue-300';
                    if (showResults) {
                      if (option === item.answer) btnStyle = 'bg-green-300';
                      else if (isSelected && !isCorrect) btnStyle = 'bg-red-300';
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleSelectOption(qIdx, option)}
                        disabled={showResults}
                        className={`w-full p-3 border-2 border-black font-bold text-left rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${btnStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {/* Penjelasan Kocak */}
                {showResults && (
                  <div className="mt-4 p-3 bg-yellow-100 border-2 border-dashed border-black rounded-lg text-sm">
                    <p className="font-extrabold">
                      {isCorrect ? '✅ Betul Benget!' : '❌ Salah Besar!'} Jawaban: {item.answer}
                    </p>
                    <p className="mt-1 font-semibold text-gray-700 italic">
                      💡 {item.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Tombol Cek Nilai */}
          {!showResults && (
            <button
              onClick={checkScore}
              className="w-full py-4 bg-yellow-400 font-black uppercase text-black border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              💯 Cek Skor Kuis Komedimu!
            </button>
          )}

          {/* Hak Cipta */}
          <div className="text-center font-bold text-xs uppercase tracking-widest text-gray-500 mt-4">
            © 2026 Copyright by Sasam
          </div>
        </div>
      )}
    </main>
  );
}