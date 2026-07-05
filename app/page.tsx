'use client';

import { useState, useEffect } from 'react';

interface QuizItem {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface ReportCard {
  material: string;
  language: string;
  score: number;
  totalQuestions: number;
  date: string;
}

export default function Home() {
  // --- STATE SYSTEM SISWA & LOGIN ---
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [history, setHistory] = useState<ReportCard[]>([]);

  // --- STATE KUIS ---
  const [material, setMaterial] = useState('');
  const [language, setLanguage] = useState('id'); // Default: Indonesia
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  // Load status login dari localStorage saat pertama kali buka web
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const registered = localStorage.getItem('isRegistered');
    if (savedUser) {
      setIsLoggedIn(true);
      setCurrentUser(savedUser);
      const savedHistory = localStorage.getItem(`history_${savedUser}`);
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    }
    if (registered === 'true') {
      setIsRegistered(true);
    }
  }, []);

  // --- FUNGSI AUTENTIKASI ---
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return alert('Username & Sandi harus diisi!');
    
    localStorage.setItem('saved_username', username);
    localStorage.setItem('saved_password', password);
    localStorage.setItem('isRegistered', 'true');
    setIsRegistered(true);
    alert('🎉 Pendaftaran Siswa Berhasil! Silakan Login.');
    setPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedU = localStorage.getItem('saved_username');
    const savedP = localStorage.getItem('saved_password');

    if (username === savedU && password === savedP) {
      setIsLoggedIn(true);
      setCurrentUser(username);
      localStorage.setItem('currentUser', username);
      const savedHistory = localStorage.getItem(`history_${username}`);
      if (savedHistory) setHistory(JSON.parse(savedHistory));
      setError('');
    } else {
      alert('❌ Username atau Sandi salah!');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    setCurrentUser('');
    setQuiz([]);
    setMaterial('');
  };

  // --- FUNGSI GENERATE KUIS ---
  const handleSubmitQuiz = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ material, language }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Gagal membuat kuis');
      }

      setQuiz(data.quiz || []);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem');
      alert(`Eror: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionIndex: number, option: string) => {
    if (showResults) return;
    setUserAnswers({ ...userAnswers, [questionIndex]: option });
  };

  const checkScore = () => {
    setShowResults(true);
    
    // Hitung total nilai benar
    let correctCount = 0;
    quiz.forEach((item, idx) => {
      if (userAnswers[idx] === item.answer) correctCount++;
    });

    const finalScore = Math.round((correctCount / quiz.length) * 100);

    // Simpan ke Rapot Riwayat Siswa
    const newReport: ReportCard = {
      material,
      language: language === 'en' ? '🇺🇸 English' : language === 'zh' ? '🇨🇳 Mandarin' : '🇮🇩 Indonesia',
      score: finalScore,
      totalQuestions: quiz.length,
      date: new Date().toLocaleDateString('id-ID'),
    };

    const updatedHistory = [newReport, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(`history_${currentUser}`, JSON.stringify(updatedHistory));
  };

  // --- TAMPILAN HALAMAN LOGIN / REGISTER ---
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gray-100 py-20 px-4 flex flex-col items-center font-sans text-black">
        <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6">
          <h1 className="text-3xl font-extrabold text-center mb-2 uppercase tracking-wide text-black">
            🧙‍♂️ EduGenie Pop
          </h1>
          <p className="text-center text-xs font-bold text-gray-600 mb-6 uppercase tracking-wider">
            Portal Kuis Komedi Siswa
          </p>

          {!isRegistered ? (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <h2 className="font-black text-lg uppercase text-center bg-blue-200 border-2 border-black py-1 rounded">Daftar Akun Siswa Baru</h2>
              <input
                type="text"
                placeholder="Buat Username Baru"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-3 border-3 border-black font-semibold rounded-lg text-black focus:outline-none"
              />
              <input
                type="password"
                placeholder="Buat Sandi Rahasia"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 border-3 border-black font-semibold rounded-lg text-black focus:outline-none"
              />
              <button type="submit" className="py-3 bg-blue-400 font-extrabold text-black border-3 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer">
                BUAT AKUN
              </button>
              <p className="text-center text-xs font-bold mt-2">
                Sudah punya akun? <span onClick={() => setIsRegistered(true)} className="text-blue-600 underline cursor-pointer">Yuk Login di sini</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <h2 className="font-black text-lg uppercase text-center bg-green-200 border-2 border-black py-1 rounded">Masuk Portal Belajar</h2>
              <input
                type="text"
                placeholder="Masukkan Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-3 border-3 border-black font-semibold rounded-lg text-black focus:outline-none"
              />
              <input
                type="password"
                placeholder="Masukkan Sandi"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 border-3 border-black font-semibold rounded-lg text-black focus:outline-none"
              />
              <button type="submit" className="py-3 bg-green-400 font-extrabold text-black border-3 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer">
                MASUK & MULAI BELAJAR
              </button>
              <p className="text-center text-xs font-bold mt-2">
                Belum terdaftar? <span onClick={() => setIsRegistered(false)} className="text-blue-600 underline cursor-pointer">Bikin akun baru dulu</span>
              </p>
            </form>
          )}
        </div>
      </main>
    );
  }

  // --- TAMPILAN UTAMA APLIKASI (SETELAH LOGIN) ---
  return (
    <main className="min-h-screen bg-gray-100 py-10 px-4 flex flex-col items-center font-sans text-black">
      {/* Header Profile Siswa */}
      <div className="max-w-2xl w-full flex justify-between items-center mb-4 px-2 font-bold text-sm">
        <div>🎒 Siswa: <span className="underline">{currentUser}</span></div>
        <button onClick={handleLogout} className="px-3 py-1 bg-red-400 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer text-xs font-black uppercase">
          Keluar (Logout)
        </button>
      </div>

      <div className="max-w-2xl w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 mb-8">
        <h1 className="text-3xl font-extrabold text-center mb-2 uppercase tracking-wide text-black">
          🧙‍♂️ EduGenie Pop
        </h1>
        <p className="text-center text-sm font-bold text-gray-600 mb-6">
          Sulap Materi Menjadi 10 Soal Kuis Pilihan Ganda Komedi!
        </p>

        <form onSubmit={handleSubmitQuiz} className="flex flex-col gap-4">
          {/* Dropdown Pilihan Bahasa */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm uppercase text-black">Pilih Bahasa Kuis:</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-3 border-3 border-black font-bold rounded-lg bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none cursor-pointer"
            >
              <option value="id" className="text-black">🇮🇩 Bahasa Indonesia (Kocak & Sarkas)</option>
              <option value="en" className="text-black">🇺🇸 English (Funny & Casual)</option>
              <option value="zh" className="text-black">🇨🇳 中文 / Mandarin (Humorous)</option>
            </select>
          </div>

          {/* Input Materi */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm uppercase text-black">Masukkan Materi Belajar:</label>
            <textarea
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder='Contoh: "Belajar hukum Newton atau revolusi industri prancis"'
              rows={4}
              disabled={loading}
              className="p-3 border-3 border-black font-semibold rounded-lg text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none disabled:bg-gray-200"
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
        <div className="max-w-2xl w-full flex flex-col gap-6 mb-8">
          {quiz.map((item, qIdx) => {
            const isCorrect = userAnswers[qIdx] === item.answer;
            return (
              <div key={qIdx} className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-5">
                <h3 className="font-extrabold text-lg mb-4 text-black">
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
                        className={`w-full p-3 border-2 border-black font-bold text-left rounded-lg text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${btnStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {showResults && (
                  <div className="mt-4 p-3 bg-yellow-100 border-2 border-dashed border-black rounded-lg text-sm text-black">
                    <p className="font-extrabold">
                      {isCorrect ? '✅ Betul Banget!' : '❌ Salah Besar!'} Jawaban Benar: {item.answer}
                    </p>
                    <p className="mt-1 font-semibold text-gray-700 italic">
                      💡 {item.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {!showResults && (
            <button
              onClick={checkScore}
              className="w-full py-4 bg-yellow-400 font-black uppercase text-black border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              💯 Cek Skor Kuis Komedimu!
            </button>
          )}
        </div>
      )}

      {/* Rapor Nilai & Riwayat Kuis Siswa */}
      {history.length > 0 && (
        <div className="max-w-2xl w-full bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-5 mb-10">
          <h2 className="font-black text-xl uppercase mb-4 tracking-wide bg-purple-200 border-2 border-black py-1 px-3 rounded inline-block">📋 Rapor Kuis Kamu</h2>
          <div className="flex flex-col gap-3">
            {history.map((card, idx) => (
              <div key={idx} className="p-3 border-2 border-black rounded-lg bg-gray-50 flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <div>
                  <p className="font-extrabold text-sm capitalize">📚 {card.material}</p>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">Bahasa: {card.language} | Tanggal: {card.date}</p>
                </div>
                <div className={`text-xl font-black p-2 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${card.score >= 70 ? 'bg-green-300' : 'bg-red-300'}`}>
                  {card.score}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="text-center font-bold text-xs uppercase tracking-widest text-gray-500 mt-4">
        © 2026 Copyright by Sasam
      </div>
    </main>
  );
}