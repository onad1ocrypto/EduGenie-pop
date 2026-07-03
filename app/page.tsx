'use client';

import { useState, useEffect } from 'react';

// === Definisi Tipe Data ===
interface Question {
  question: string;
  options: string[];
  answer: string;
  explanation?: string;
}

interface ReportCard {
  quizTitle: string;
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

  // --- STATE GENERATOR KUIS AI ---
  const [material, setMaterial] = useState('');
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);
  const [activeTab, setActiveTab] = useState<'belajar' | 'rapor'>('belajar');

  // Load session dari LocalStorage
  useEffect(() => {
    const session = localStorage.getItem('activeUser');
    if (session) {
      setIsLoggedIn(true);
      setCurrentUser(session);
      const userHistory = localStorage.getItem(`history_${session}`);
      if (userHistory) setHistory(JSON.parse(userHistory));
    }
  }, []);

  // Proses Daftar Akun
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return alert('Isi dulu dong bos nama sama sandinya!');
    const existingUser = localStorage.getItem(`user_${username}`);
    if (existingUser) return alert('Nama user ini sudah diambil orang! Pake nama lain ya.');

    localStorage.setItem(`user_${username}`, password);
    alert('Akun berhasil dibuat! Silakan login di gerbang masuk Akademi Siswa ✨');
    setIsRegistered(false);
    setPassword('');
  };

  // Proses Masuk (Login)
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPassword = localStorage.getItem(`user_${username}`);
    if (savedPassword && savedPassword === password) {
      localStorage.setItem('activeUser', username);
      setIsLoggedIn(true);
      setCurrentUser(username);
      const userHistory = localStorage.getItem(`history_${username}`);
      setHistory(userHistory ? JSON.parse(userHistory) : []);
    } else {
      alert('Nama atau Sandi salah! Coba diingat-ingat lagi petunjuknya 🤔');
    }
  };

  // Proses Keluar (Logout)
  const handleLogout = () => {
    localStorage.removeItem('activeUser');
    setIsLoggedIn(false);
    setCurrentUser('');
    setQuiz([]);
    setMaterial('');
  };

  // Kirim ke Backend API untuk 10 Soal
  const handleGenerateQuiz = async () => {
    setLoading(true);
    setQuiz([]);
    setSelectedAnswers({});
    setShowResults(false);

    try {
      const res = await fetch('/api/generate-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ material }),
      });
      const data = await res.json();
      if (data.quiz) {
        setQuiz(data.quiz);
      } else if (data.error) {
        alert('Eror dari AI: ' + data.error);
      }
    } catch (err) {
      alert('Waduh, koneksi internetmu sepertinya lelah.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qIndex: number, option: string) => {
    if (showResults) return;
    setSelectedAnswers({ ...selectedAnswers, [qIndex]: option });
  };

  const totalCorrect = quiz.reduce((acc, q, idx) => (selectedAnswers[idx] === q.answer ? acc + 1 : acc), 0);
  const totalAnswered = Object.keys(selectedAnswers).length;
  const progressPercent = quiz.length > 0 ? (totalAnswered / quiz.length) * 100 : 0;

  const handleFinishQuiz = () => {
    setShowResults(true);
    const newRecord: ReportCard = {
      quizTitle: material.substring(0, 30) + (material.length > 30 ? '...' : ''),
      score: totalCorrect,
      totalQuestions: quiz.length,
      date: new Date().toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(`history_${currentUser}`, JSON.stringify(updatedHistory));
  };

  const totalKuisDiikuti = history.length;
  const totalBenarSemuaKuis = history.reduce((sum, item) => sum + item.score, 0);
  const totalSoalSemuaKuis = history.reduce((sum, item) => sum + item.totalQuestions, 0);
  const rataRataAkurasi = totalSoalSemuaKuis > 0 ? Math.round((totalBenarSemuaKuis / totalSoalSemuaKuis) * 100) : 0;

  let gelarSiswa = 'Murid Baru Pemalu 🌱';
  if (totalKuisDiikuti > 0) {
    if (rataRataAkurasi > 85) gelarSiswa = '⚡ Sang Profesor Super Jenius';
    else if (rataRataAkurasi > 65) gelarSiswa = '🧠 Otak Kanan Aktif Bergelora';
    else gelarSiswa = '🫣 Butuh Keajaiban & Kopi Hitam';
  }

  // --- RENDERING TAMPILAN BELUM LOGIN ---
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-amber-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        
        {/* GAMBAR ANIMASI BERGERAK LATAR BELAKANG */}
        <div className="absolute top-10 left-10 text-6xl animate-bounce duration-1000 hidden md:block select-none">🚀</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-pulse duration-700 hidden md:block select-none">🧪</div>
        <div className="absolute top-24 right-16 text-6xl animate-spin duration-10000 hidden md:block select-none">🎨</div>
        <div className="absolute bottom-12 right-24 text-5xl animate-bounce duration-500 hidden md:block select-none">👾</div>

        <div className="bg-white p-8 rounded-2xl border-4 border-slate-800 shadow-[8px_8px_0px_0px_rgba(30,41,59,1)] max-w-md w-full z-10 transform -rotate-1">
          <div className="text-center mb-6">
            <span className="text-5xl block animate-bounce">🕹️</span>
            <h1 className="text-3xl font-black text-slate-950 mt-2 bg-yellow-300 inline-block px-4 border-2 border-slate-800 rounded-lg shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]">EduGenie Pop!</h1>
            <p className="text-slate-500 text-xs font-bold mt-2">Pintu Masuk Akademi Siswa</p>
          </div>

          <form onSubmit={isRegistered ? handleRegister : handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">NAMA PANGGILAN SISWA</label>
              <input
                type="text"
                className="w-full p-3 border-2 border-slate-800 rounded-xl focus:outline-none focus:bg-yellow-50 font-bold text-slate-950 shadow-inner"
                placeholder="Contoh: sasam_keren"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-black text-slate-800 mb-1">KATA SANDI RAHASIA</label>
              <input
                type="password"
                className="w-full p-3 border-2 border-slate-800 rounded-xl focus:outline-none focus:bg-yellow-50 font-bold text-slate-950 shadow-inner"
                placeholder="••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full mt-4 bg-gradient-to-r from-cyan-400 to-emerald-300 border-4 border-slate-800 text-slate-950 font-black py-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] transition-all"
            >
              {isRegistered ? 'DAFTAR SEKARANG 🚀' : 'MASUK KE KELAS 🔑'}
            </button>
          </form>

          <div className="text-center mt-6 pt-4 border-t-2 border-dashed border-slate-200">
            <button
              onClick={() => { setIsRegistered(!isRegistered); setUsername(''); setPassword(''); }}
              className="text-xs font-black text-purple-600 hover:underline"
            >
              {isRegistered ? 'Sudah punya kunci masuk? Silakan Masuk' : 'Belum punya akun? Daftar gratis di sini! 🎉'}
            </button>
          </div>
        </div>

        {/* TULISAN COPYRIGHT BY SASAM (Halaman Login) */}
        <footer className="mt-8 text-center z-10">
          <p className="text-xs font-black tracking-widest bg-slate-950 text-white border-2 border-slate-800 px-4 py-2 rounded-xl shadow-[3px_3px_0px_0px_rgba(30,41,59,1)]">
            © 2026 COPYRIGHT BY SASAM
          </p>
        </footer>
      </main>
    );
  }

  // --- TAMPILAN DASHBOARD (SETELAH LOGIN) ---
  return (
    <main className="min-h-screen bg-amber-50 py-12 px-4 sm:px-6 lg:px-8 text-slate-800 font-sans selection:bg-yellow-300 relative overflow-hidden">
      
      {/* ANIMASI BERGERAK DI HALAMAN UTAMA */}
      <div className="absolute top-44 left-6 text-5xl animate-pulse hidden xl:block select-none">📚</div>
      <div className="absolute bottom-40 right-4 text-5xl animate-bounce duration-1000 hidden xl:block select-none">🔮</div>

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Navbar Menu */}
        <div className="flex flex-col sm:flex-row justify-between items-center bg-white border-4 border-slate-800 p-4 rounded-2xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] mb-8 gap-4">
          <div className="flex items-center gap-2 transform -rotate-1">
            <span className="bg-yellow-300 border-2 border-slate-800 px-3 py-1 rounded-xl font-black text-sm text-slate-950 animate-pulse">
              👋 Siswa: {currentUser}
            </span>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <button
              onClick={() => setActiveTab('belajar')}
              className={`px-4 py-2 text-xs font-black border-2 border-slate-800 rounded-xl transition-all ${activeTab === 'belajar' ? 'bg-cyan-300 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]' : 'bg-white'}`}
            >
              🕹️ ASISTEN KUIS
            </button>
            <button
              onClick={() => setActiveTab('rapor')}
              className={`px-4 py-2 text-xs font-black border-2 border-slate-800 rounded-xl transition-all ${activeTab === 'rapor' ? 'bg-pink-300 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]' : 'bg-white'}`}
            >
              📊 RAPOR SAYA
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-xs font-black border-2 border-slate-800 bg-rose-400 rounded-xl hover:bg-rose-300"
            >
              🚪 KELUAR
            </button>
          </div>
        </div>

        {/* TAB 1: AREA BELAJAR */}
        {activeTab === 'belajar' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border-4 border-slate-800 shadow-[8px_8px_0px_0px_rgba(30,41,59,1)]">
              <label className="block text-base font-black text-slate-800 mb-2">📥 Lempar Catatanmu Di Sini:</label>
              <textarea
                className="w-full h-36 p-4 border-4 border-slate-800 bg-white rounded-xl focus:outline-none focus:bg-yellow-50/50 text-slate-800 font-bold placeholder-slate-400 shadow-inner resize-none"
                placeholder="Tempel catatan pelajaranmu di sini agar disulap menjadi 10 kuis gokil!"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
              />
              <button
                onClick={handleGenerateQuiz}
                disabled={loading || !material.trim()}
                className="w-full mt-4 bg-gradient-to-r from-cyan-400 via-emerald-300 to-lime-300 border-4 border-slate-800 text-slate-950 font-black py-4 px-4 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] transition-all"
              >
                {loading ? '🔮 MENYULAP SOAL KOCAK... TUNGGU YA!' : 'Sulap Jadi 10 Kuis Lucu ✨'}
              </button>
            </div>

            {/* Konten Kuis */}
            {quiz.length > 0 && (
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-xl border-4 border-slate-800 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)]">
                  <div className="flex justify-between text-xs font-black text-slate-700 mb-2">
                    <span>🔥 MISI BELAJARMU:</span>
                    <span>{totalAnswered} / {quiz.length} Kelar</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden border-2 border-slate-800">
                    <div className="bg-purple-400 h-full transition-all duration-300" style={{ width: `${progressPercent}%` }} />
                  </div>
                </div>

                {showResults && (
                  <div className="bg-pink-300 p-6 rounded-2xl border-4 border-slate-800 text-center shadow-[6px_6px_0px_0px_rgba(30,41,59,1)]">
                    <span className="text-4xl inline-block animate-bounce">🏆</span>
                    <h3 className="text-2xl font-black text-slate-950 mt-1">Kuis Berhasil Diarsip ke Rapor!</h3>
                    <div className="text-3xl font-black text-slate-950 mt-3 bg-white inline-block px-8 py-3 rounded-xl border-4 border-slate-800 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)]">
                      Skor Akhir: {totalCorrect} / {quiz.length} Benar
                    </div>
                  </div>
                )}

                {/* Grid 2 Kolom Ringkas */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {quiz.map((q, qIndex) => (
                    <div key={qIndex} className="bg-white p-6 rounded-2xl border-4 border-slate-800 shadow-[6px_6px_0px_0px_rgba(30,41,59,1)] flex flex-col justify-between">
                      <div>
                        <div className="mb-2">
                          <span className="bg-lime-300 text-slate-950 text-[10px] px-2 py-0.5 rounded font-black border-2 border-slate-800">
                            SOAL {qIndex + 1}
                          </span>
                        </div>
                        <p className="font-black text-slate-950 text-base mb-4 leading-snug">{q.question}</p>
                        
                        <div className="grid grid-cols-1 gap-2">
                          {q.options.map((option, oIndex) => {
                            const isSelected = selectedAnswers[qIndex] === option;
                            const isCorrect = q.answer === option;
                            
                            let btnStyle = "border-2 border-slate-800 bg-slate-50 text-slate-800 font-bold shadow-[2px_2px_0px_0px_rgba(30,41,59,1)] hover:bg-yellow-100";
                            if (isSelected) btnStyle = "border-4 border-slate-800 bg-purple-300 text-slate-950 font-black shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]";
                            
                            if (showResults) {
                              if (isCorrect) btnStyle = "border-4 border-slate-800 bg-emerald-400 text-slate-950 font-black";
                              else if (isSelected && !isCorrect) btnStyle = "border-4 border-slate-800 bg-rose-400 text-slate-950 font-black";
                            }

                            return (
                              <button
                                key={oIndex}
                                onClick={() => handleSelectOption(qIndex, option)}
                                disabled={showResults}
                                className={`w-full text-left p-3 rounded-xl text-xs sm:text-sm flex items-center ${btnStyle}`}
                              >
                                <span className="inline-block mr-2 bg-slate-200 border border-slate-800 px-1.5 py-0.5 rounded text-[10px] font-black">
                                  {String.fromCharCode(65 + oIndex)}
                                </span>
                                {option}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {showResults && q.explanation && (
                        <div className="mt-4 p-3 bg-orange-100 rounded-xl border-2 border-slate-800 text-xs text-slate-900 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]">
                          <span className="font-black text-orange-600 block mb-0.5">📢 Info Cerdas Guru AI:</span>
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {!showResults && (
                  <button
                    onClick={handleFinishQuiz}
                    disabled={totalAnswered < quiz.length}
                    className="w-full bg-emerald-400 hover:bg-emerald-300 border-4 border-slate-800 text-slate-950 font-black py-4 px-4 rounded-xl shadow-[6px_6px_0px_0px_rgba(30,41,59,1)] disabled:opacity-40 transition-all"
                  >
                    Kelar! Kunci & Periksa Hasil Rapor Saya 🚀
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: BUKU RAPOR SISWA */}
        {activeTab === 'rapor' && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-purple-300 to-pink-300 p-6 rounded-2xl border-4 border-slate-800 shadow-[6px_6px_0px_0px_rgba(30,41,59,1)]">
              <h2 className="text-3xl font-black text-slate-950">📜 Piagam Kompetensi Siswa</h2>
              <p className="text-xs font-bold text-slate-700 mt-1.5">
                Status Gelar: <span className="bg-white border-2 border-slate-800 px-2.5 py-0.5 rounded-full font-black text-purple-700">{gelarSiswa}</span>
              </p>
              
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white p-4 rounded-xl border-2 border-slate-800 shadow-[3px_3px_0px_0px_rgba(30,41,59,1)] text-center">
                  <span className="block text-[10px] font-black text-slate-500">TOTAL KUIS</span>
                  <span className="text-xl font-black text-slate-950">{totalKuisDiikuti} Kali</span>
                </div>
                <div className="bg-white p-4 rounded-xl border-2 border-slate-800 shadow-[3px_3px_0px_0px_rgba(30,41,59,1)] text-center">
                  <span className="block text-[10px] font-black text-slate-500">RATA-RATA AKURASI</span>
                  <span className="text-xl font-black text-slate-950">{rataRataAkurasi}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border-4 border-slate-800 shadow-[6px_6px_0px_0px_rgba(30,41,59,1)]">
              <h3 className="text-xl font-black text-slate-950 mb-4">🗂️ Arsip Penilaian Rapor</h3>
              
              {history.length === 0 ? (
                <div className="text-center text-sm font-bold text-slate-400 py-8 border-4 border-dashed border-slate-100 rounded-xl bg-slate-50">
                  Belum ada nilai terekam. Yuk mainkan kuis pertamamu! 🕹️
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-4 border-2 border-slate-800 rounded-xl bg-slate-50">
                      <div>
                        <span className="block font-black text-slate-950 text-sm sm:text-base">{item.quizTitle}</span>
                        <span className="text-[10px] font-bold text-slate-400">{item.date}</span>
                      </div>
                      <div className="bg-yellow-300 border-2 border-slate-800 font-black text-xs px-3 py-1.5 rounded-lg text-slate-950 shadow-[2px_2px_0px_0px_rgba(30,41,59,1)]">
                        Skor: {item.score} / {item.totalQuestions}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TULISAN COPYRIGHT BY SASAM (Halaman Dashboard Utama) */}
        <footer className="mt-12 text-center">
          <p className="text-xs font-black tracking-widest bg-slate-950 text-white border-2 border-slate-800 px-4 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] inline-block">
            © 2026 COPYRIGHT BY SASAM
          </p>
        </footer>

      </div>
    </main>
  );
}