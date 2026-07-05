'use client';

import { useState, useEffect } from 'react';

interface QuizItem {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
}

interface DetailHistoryItem {
  question: string;
  selected: string;
  correct: string;
  isCorrect: boolean;
}

interface ReportCard {
  id: string;
  material: string;
  language: string;
  score: number;
  totalQuestions: number;
  date: string;
  details: DetailHistoryItem[];
}

export default function Home() {
  // --- STATE SYSTEM SISWA & LOGIN ---
  const [isRegistered, setIsRegistered] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const [history, setHistory] = useState<ReportCard[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportCard | null>(null);
  const [showRaporPanel, setShowRaporPanel] = useState(false);

  // --- STATE KUIS ---
  const [material, setMaterial] = useState('');
  const [language, setLanguage] = useState('id'); 
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  // --- KAMUS TRANSLASI ---
  const t: { [key: string]: { [key: string]: string } } = {
    id: {
      subtitle: 'Portal Kuis Komedi Siswa 🐾',
      selectLang: 'Pilih Bahasa Tampilan & Kuis:',
      regTitle: 'Daftar Akun Siswa Baru 📝',
      regUserPlace: 'Buat Username Baru',
      regPassPlace: 'Buat Sandi Rahasia',
      regBtn: 'BUAT AKUN 🚀',
      regLink: 'Yuk Login di sini',
      haveAcc: 'Sudah punya akun?',
      loginTitle: 'Masuk Portal Belajar 🔑',
      loginUserPlace: 'Masukkan Username',
      loginPassPlace: 'Masukkan Sandi',
      loginBtn: 'MASUK & MULAI BELAJAR 🎒',
      noAcc: 'Belum terdaftar?',
      noAccLink: 'Bikin akun baru dulu',
      alertRegSuccess: '🎉 Pendaftaran Siswa Berhasil! Silakan Login.',
      alertFill: 'Username & Sandi harus diisi!',
      alertWrong: '❌ Username atau Sandi salah!',
      student: '🎒 Siswa',
      logout: 'KELUAR (LOGOUT) 🚪',
      raporMenuBtn: '📋 LIHAT RAPOR',
      mainSubtitle: 'Sulap Materi Menjadi 10 Soal Kuis Pilihan Ganda Komedi! 🔮',
      inputLabel: 'Masukkan Materi Belajar:',
      inputPlace: 'Contoh: "Belajar hukum Newton atau revolusi industri prancis"',
      submitBtn: '✨ SULAP JADI SOAL KUIS',
      loadingBtn: '🔮 MENYULAP SOAL KOCAK... TUNGGU YA!',
      scoreBtn: '💯 CEK SKOR KUIS KOMEDIMU!',
      raporTitle: '📋 Rapor Kuis Kamu',
      correct: '🎉 Betul Banget!',
      wrong: '💥 Salah Besar!',
      ansKey: 'Jawaban Benar:',
      detailTitle: '🔍 Detail Laporan Jawaban:',
      yourAns: 'Jawaban Kamu:',
      closeDetail: 'Tutup Detail Rapor'
    },
    en: {
      subtitle: 'Student Comedy Quiz Portal 🐾',
      selectLang: 'Select Interface & Quiz Language:',
      regTitle: 'Register New Student Account 📝',
      regUserPlace: 'Create New Username',
      regPassPlace: 'Create Secret Password',
      regBtn: 'CREATE ACCOUNT 🚀',
      regLink: 'Login here',
      haveAcc: 'Already have an account?',
      loginTitle: 'Enter Learning Portal 🔑',
      loginUserPlace: 'Enter Username',
      loginPassPlace: 'Enter Password',
      loginBtn: 'LOGIN & START LEARNING 🎒',
      noAcc: 'Not registered yet?',
      noAccLink: 'Create a new account first',
      alertRegSuccess: '🎉 Registration Successful! Please Login.',
      alertFill: 'Username & Password are required!',
      alertWrong: '❌ Incorrect Username or Password!',
      student: '🎒 Student',
      logout: 'LOGOUT 🚪',
      raporMenuBtn: '📋 VIEW REPORT',
      mainSubtitle: 'Transform Study Materials Into 10 Hilarious Multiple-Choice Questions! 🔮',
      inputLabel: 'Enter Study Material:',
      inputPlace: 'Example: "Newton laws of motion or French industrial revolution"',
      submitBtn: '✨ MAGIC INTO QUIZ QUESTIONS',
      loadingBtn: '🔮 CONJURING FUNNY QUESTIONS... WAIT UP!',
      scoreBtn: '💯 CHECK YOUR COMEDY QUIZ SCORE!',
      raporTitle: '📋 Your Report Card',
      correct: '🎉 Spot On!',
      wrong: '💥 Way Off!',
      ansKey: 'Correct Answer:',
      detailTitle: '🔍 Detailed Answer Report:',
      yourAns: 'Your Answer:',
      closeDetail: 'Close Report Details'
    },
    zh: {
      subtitle: '学生喜剧测试门户 🐾',
      selectLang: '选择界面与测试语言:',
      regTitle: '注册新学生账户 📝',
      regUserPlace: '创建新用户名',
      regPassPlace: '创建登录密码',
      regBtn: '注册账户 🚀',
      regLink: '在此登录',
      haveAcc: '已有账户？',
      loginTitle: '进入学习门户 🔑',
      loginUserPlace: '输入用户名',
      loginPassPlace: '输入密码',
      loginBtn: '登录并开始学习 🎒',
      noAcc: '还没有账户？',
      noAccLink: '先创建一个新账户',
      alertRegSuccess: '🎉 学生注册成功！请登录。',
      alertFill: '用户名和密码不能为空！',
      alertWrong: '❌ 用户名或密码错误！',
      student: '🎒 学生',
      logout: '退出登录 🚪',
      raporMenuBtn: '📋 查看成绩单',
      mainSubtitle: '将学习材料神奇地变成10道搞笑的选择题！ 🔮',
      inputLabel: '输入学习材料:',
      inputPlace: '例如：“牛顿运动定律或法国工业 revolution”',
      submitBtn: '✨ 变身成测试题',
      loadingBtn: '🔮 正在编织搞笑题... 请稍候！',
      scoreBtn: '💯 查看你的喜剧测试分数！',
      raporTitle: '📋 你的成绩单',
      correct: '🎉 完全正确！',
      wrong: '💥 大错特错！',
      ansKey: '正确答案:',
      detailTitle: '🔍 详细答案报告:',
      yourAns: '你的答案:',
      closeDetail: '关闭报告详情'
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const registered = localStorage.getItem('isRegistered');
    if (savedUser) {
      setIsLoggedIn(true);
      setCurrentUser(savedUser);
      const savedHistory = localStorage.getItem(`history_${savedUser}`);
      if (savedHistory) setHistory(JSON.parse(savedHistory));
    }
    if (registered === 'true') setIsRegistered(true);
  }, []);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) return alert(t[language].alertFill);
    localStorage.setItem('saved_username', username);
    localStorage.setItem('saved_password', password);
    localStorage.setItem('isRegistered', 'true');
    setIsRegistered(true);
    alert(t[language].alertRegSuccess);
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
    } else {
      alert(t[language].alertWrong);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    setIsLoggedIn(false);
    setCurrentUser('');
    setQuiz([]);
    setMaterial('');
    setSelectedReport(null);
    setShowRaporPanel(false);
  };

  const handleSubmitQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!material.trim()) return;

    setLoading(true);
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
      if (!response.ok) throw new Error(data.error || 'Gagal');
      setQuiz(data.quiz || []);
    } catch (err: any) {
      alert(`Error: ${err.message}`);
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
    
    let correctCount = 0;
    const detailsReport: DetailHistoryItem[] = [];

    quiz.forEach((item, idx) => {
      const selected = userAnswers[idx] || 'Tidak dijawab';
      const isCorrect = selected === item.answer;
      if (isCorrect) correctCount++;

      detailsReport.push({
        question: item.question,
        selected: selected,
        correct: item.answer,
        isCorrect: isCorrect
      });
    });

    const finalScore = Math.round((correctCount / quiz.length) * 100);

    const newReport: ReportCard = {
      id: Math.random().toString(36).substring(2, 9),
      material,
      language: language === 'en' ? '🇺🇸 English' : language === 'zh' ? '🇨🇳 Mandarin' : '🇮🇩 Indonesia',
      score: finalScore,
      totalQuestions: quiz.length,
      date: new Date().toLocaleDateString('id-ID'),
      details: detailsReport 
    };

    const updatedHistory = [newReport, ...history];
    setHistory(updatedHistory);
    localStorage.setItem(`history_${currentUser}`, JSON.stringify(updatedHistory));
  };

  // --- KODE HALAMAN SEBELUM LOGIN (LATAR BELAKANG TURQUOISE PASTEL & HEWAN) ---
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-[#E3FAF4] py-16 px-4 flex flex-col items-center font-sans text-black relative overflow-hidden">
        {/* CSS Animasi Custom Kebon Binatang */}
        <style jsx global>{`
          @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
          @keyframes waggle { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(15deg); } }
          .anim-hewan-1 { animation: bounceSlow 3s ease-in-out infinite; }
          .anim-hewan-2 { animation: bounceSlow 4s ease-in-out infinite 1s; }
          .anim-hewan-3 { animation: waggle 2s ease-in-out infinite; }
        `}</style>

        {/* 🦊 Binatang Hiasan Latar Belakang */}
        <div className="absolute top-10 left-10 text-5xl anim-hewan-1 opacity-80 hidden md:block">🐱</div>
        <div className="absolute bottom-12 left-16 text-5xl anim-hewan-2 opacity-80 hidden md:block">🦊</div>
        <div className="absolute top-20 right-14 text-5xl anim-hewan-3 opacity-80 hidden md:block">🐰</div>
        <div className="absolute bottom-16 right-20 text-5xl anim-hewan-1 opacity-80 hidden md:block">🐼</div>

        <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 relative z-10">
          <h1 className="text-3xl font-extrabold text-center mb-1 uppercase tracking-wide">🧙‍♂️ EduGenie Pop</h1>
          <p className="text-center text-xs font-bold text-gray-600 mb-6 uppercase tracking-wider">{t[language].subtitle}</p>

          <div className="flex flex-col gap-1 mb-6 border-b-2 border-dashed border-black pb-4">
            <label className="font-bold text-xs uppercase text-gray-700">{t[language].selectLang}</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="p-2 border-2 border-black font-bold rounded-lg bg-yellow-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm focus:outline-none cursor-pointer">
              <option value="id">🇮🇩 Bahasa Indonesia</option>
              <option value="en">🇺🇸 English</option>
              <option value="zh">🇨🇳 中文 / Mandarin</option>
            </select>
          </div>

          {!isRegistered ? (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <h2 className="font-black text-base uppercase text-center bg-blue-200 border-2 border-black py-1.5 rounded">{t[language].regTitle}</h2>
              <input type="text" placeholder={t[language].regUserPlace} value={username} onChange={(e) => setUsername(e.target.value)} className="p-3 border-3 border-black font-semibold rounded-lg text-black focus:outline-none" />
              <input type="password" placeholder={t[language].regPassPlace} value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 border-3 border-black font-semibold rounded-lg text-black focus:outline-none" />
              <button type="submit" className="py-3 bg-blue-400 font-extrabold text-black border-3 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                {t[language].regBtn}
              </button>
              <p className="text-center text-xs font-bold mt-2">{t[language].haveAcc} <span onClick={() => setIsRegistered(true)} className="text-blue-600 underline cursor-pointer">{t[language].regLink}</span></p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <h2 className="font-black text-base uppercase text-center bg-green-200 border-2 border-black py-1.5 rounded">{t[language].loginTitle}</h2>
              <input type="text" placeholder={t[language].loginUserPlace} value={username} onChange={(e) => setUsername(e.target.value)} className="p-3 border-3 border-black font-semibold rounded-lg text-black focus:outline-none" />
              <input type="password" placeholder={t[language].loginPassPlace} value={password} onChange={(e) => setPassword(e.target.value)} className="p-3 border-3 border-black font-semibold rounded-lg text-black focus:outline-none" />
              <button type="submit" className="py-3 bg-green-400 font-extrabold text-black border-3 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-x-0.5 active:translate-y-0.5 active:shadow-none">
                {t[language].loginBtn}
              </button>
              <p className="text-center text-xs font-bold mt-2">{t[language].noAcc} <span onClick={() => setIsRegistered(false)} className="text-blue-600 underline cursor-pointer">{t[language].noAccLink}</span></p>
            </form>
          )}
        </div>
      </main>
    );
  }

  // --- DASHBOARD UTAMA SETELAH LOGIN (TETAP TURQUOISE DENGAN DEKORASI INTERAKTIF) ---
  return (
    <main className="min-h-screen bg-[#E3FAF4] py-10 px-4 flex flex-col items-center font-sans text-black relative overflow-hidden">
      <style jsx global>{`
        @keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
        @keyframes waggle { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(15deg); } }
        .anim-hewan-1 { animation: bounceSlow 3s ease-in-out infinite; }
        .anim-hewan-2 { animation: bounceSlow 4s ease-in-out infinite 1s; }
        .anim-hewan-3 { animation: waggle 2s ease-in-out infinite; }
      `}</style>

      {/* 🦁 Hiasan Hewan Dashboard */}
      <div className="absolute top-20 left-6 text-4xl anim-hewan-2 opacity-60 hidden lg:block">🦁</div>
      <div className="absolute top-80 right-8 text-4xl anim-hewan-3 opacity-60 hidden lg:block">🐨</div>
      <div className="absolute bottom-40 left-10 text-4xl anim-hewan-1 opacity-60 hidden lg:block">🐯</div>

      <div className="max-w-2xl w-full flex justify-between items-center mb-6 px-2 font-bold text-sm relative z-10">
        <div className="bg-white px-2 py-0.5 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          {t[language].student}: <span className="underline">{currentUser}</span> 🦁
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => { setShowRaporPanel(!showRaporPanel); setSelectedReport(null); }} 
            className={`px-3 py-1 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase transition-colors cursor-pointer ${showRaporPanel ? 'bg-purple-400' : 'bg-purple-200'}`}
          >
            {t[language].raporMenuBtn}
          </button>
          <button onClick={handleLogout} className="px-3 py-1 bg-red-400 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs font-black uppercase cursor-pointer">
            {t[language].logout}
          </button>
        </div>
      </div>

      {/* PANEL DAFTAR RAPOR */}
      {showRaporPanel && (
        <div className="max-w-2xl w-full bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-5 mb-8 relative z-10">
          <h2 className="font-black text-lg uppercase mb-4 tracking-wide bg-purple-200 border-2 border-black py-1 px-3 rounded inline-block">
            {t[language].raporTitle}
          </h2>
          {history.length === 0 ? (
            <p className="text-xs font-bold text-gray-500 italic">Belum ada riwayat kuis.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {history.map((card) => (
                <div key={card.id} onClick={() => setSelectedReport(card)} className="p-3 border-2 border-black rounded-lg bg-gray-50 flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:bg-purple-50 transition-colors">
                  <div>
                    <p className="font-extrabold text-sm capitalize">📚 {card.material} <span className="text-[10px] text-purple-600 font-bold ml-1 uppercase">(Detail Laporan)</span></p>
                    <p className="text-xs font-bold text-gray-500 mt-0.5">Bahasa: {card.language} | Tgl: {card.date}</p>
                  </div>
                  <div className={`text-xl font-black p-2 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${card.score >= 70 ? 'bg-green-300' : 'bg-red-300'}`}>
                    {card.score}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ISI LAPORAN DETAIL JAWABAN RAPOR */}
      {selectedReport && showRaporPanel && (
        <div className="max-w-2xl w-full bg-amber-50 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-5 mb-8 relative z-10">
          <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-4">
            <h3 className="font-black text-sm text-purple-800 uppercase">{t[language].detailTitle}</h3>
            <span className="text-base font-black bg-white px-2 border-2 border-black rounded">{selectedReport.score}</span>
          </div>
          <p className="font-extrabold text-xs mb-3">📚 Materi: <span className="capitalize">{selectedReport.material}</span></p>
          <div className="flex flex-col gap-3 max-h-64 overflow-y-auto pr-1">
            {selectedReport.details?.map((det, dIdx) => (
              <div key={dIdx} className="p-2.5 bg-white border-2 border-black rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] text-xs">
                <p className="font-black mb-1">{dIdx + 1}. {det.question}</p>
                <p className={`font-bold ${det.isCorrect ? 'text-green-700' : 'text-red-600'}`}>{t[language].yourAns} {det.selected}</p>
                {!det.isCorrect && <p className="font-bold text-gray-600 mt-0.5">{t[language].ansKey} {det.correct}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Form Input Generator */}
      <div className="max-w-2xl w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 mb-8 relative z-10">
        <h1 className="text-3xl font-extrabold text-center mb-2 uppercase tracking-wide">🧙‍♂️ EduGenie Pop</h1>
        <p className="text-center text-sm font-bold text-gray-600 mb-6">{t[language].mainSubtitle}</p>

        <form onSubmit={handleSubmitQuiz} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm uppercase">{t[language].selectLang}</label>
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="p-3 border-3 border-black font-bold rounded-lg bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none cursor-pointer">
              <option value="id">🇮🇩 Bahasa Indonesia (Kocak & Sarkas)</option>
              <option value="en">🇺🇸 English (Funny & Casual)</option>
              <option value="zh">🇨🇳 中文 / Mandarin (Humorous)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm uppercase">{t[language].inputLabel}</label>
            <textarea value={material} onChange={(e) => setMaterial(e.target.value)} placeholder={t[language].inputPlace} rows={4} disabled={loading} className="p-3 border-3 border-black font-semibold rounded-lg text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none disabled:bg-gray-200" />
          </div>

          <button type="submit" disabled={loading} className="w-full mt-2 py-3 bg-green-400 disabled:bg-gray-400 font-extrabold uppercase tracking-wider text-black border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] cursor-pointer active:translate-x-1 active:translate-y-1 active:shadow-none transition-all">
            {loading ? t[language].loadingBtn : t[language].submitBtn}
          </button>
        </form>
      </div>

      {/* TAMPILAN 10 SOAL KUIS SEKALIGUS KE BAWAH DENGAN PILIHAN GRID 2x2 */}
      {quiz.length > 0 && (
        <div className="max-w-2xl w-full flex flex-col gap-6 mb-10 relative z-10">
          {quiz.map((item, qIdx) => {
            const isCorrect = userAnswers[qIdx] === item.answer;
            // Kumpulan emoji hewan acak untuk dipasang di pojok kartu kuis
            const animalIcons = ['🐱', '🐰', '🦊', '🦁', '🐼', '🐨', '🐸', '🦉'];
            const assignedIcon = animalIcons[qIdx % animalIcons.length];

            return (
              <div key={qIdx} className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-5 relative">
                {/* 🐾 Maskot Hewan Kecil Melayang Bergoyang di Tiap Soal */}
                <span className="absolute -top-3.5 -right-3 text-2xl anim-hewan-3 bg-white border-2 border-black rounded-full p-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  {assignedIcon}
                </span>

                <h3 className="font-extrabold text-lg mb-4 text-black pr-6">
                  {qIdx + 1}. {item.question}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {item.options.map((option, oIdx) => {
                    const isSelected = userAnswers[qIdx] === option;
                    let btnStyle = 'bg-white hover:bg-amber-50';

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
                        className={`w-full p-3 border-2 border-black font-bold text-left rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all cursor-pointer ${btnStyle}`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>

                {showResults && (
                  <div className="mt-4 p-3 bg-yellow-100 border-2 border-dashed border-black rounded-lg text-sm text-black relative">
                    <p className="font-extrabold">
                      {isCorrect ? t[language].correct : t[language].wrong} {t[language].ansKey} {item.answer}
                    </p>
                    <p className="mt-1 font-semibold text-gray-700 italic">
                      💡 {item.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          {/* Tombol Hitung Skor */}
          {!showResults && (
            <button
              onClick={checkScore}
              className="w-full py-4 bg-yellow-400 font-black uppercase text-black border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer text-center"
            >
              {t[language].scoreBtn}
            </button>
          )}
        </div>
      )}

      <div className="text-center font-bold text-xs uppercase tracking-widest text-gray-500 mt-4 relative z-10">
        © 2026 Copyright by Sasam 🐾
      </div>
    </main>
  );
}