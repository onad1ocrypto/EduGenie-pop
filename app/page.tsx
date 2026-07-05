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

  // --- STATE KUIS & BAHASA GLOBAL ---
  const [material, setMaterial] = useState('');
  const [language, setLanguage] = useState('id'); // 'id', 'en', atau 'zh'
  const [quiz, setQuiz] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});
  const [showResults, setShowResults] = useState(false);

  // --- KAMUS TRANSLASI HALAMAN UTAMA ---
  const t: { [key: string]: { [key: string]: string } } = {
    id: {
      subtitle: 'Portal Kuis Komedi Siswa',
      selectLang: 'Pilih Bahasa Tampilan & Kuis:',
      regTitle: 'Daftar Akun Siswa Baru',
      regUserPlace: 'Buat Username Baru',
      regPassPlace: 'Buat Sandi Rahasia',
      regBtn: 'BUAT AKUN',
      regLink: 'Yuk Login di sini',
      haveAcc: 'Sudah punya akun?',
      loginTitle: 'Masuk Portal Belajar',
      loginUserPlace: 'Masukkan Username',
      loginPassPlace: 'Masukkan Sandi',
      loginBtn: 'MASUK & MULAI BELAJAR',
      noAcc: 'Belum terdaftar?',
      noAccLink: 'Bikin akun baru dulu',
      alertRegSuccess: '🎉 Pendaftaran Siswa Berhasil! Silakan Login.',
      alertFill: 'Username & Sandi harus diisi!',
      alertWrong: '❌ Username atau Sandi salah!',
      student: '🎒 Siswa',
      logout: 'Keluar (Logout)',
      mainSubtitle: 'Sulap Materi Menjadi 10 Soal Kuis Pilihan Ganda Komedi!',
      inputLabel: 'Masukkan Materi Belajar:',
      inputPlace: 'Contoh: "Belajar hukum Newton atau revolusi industri prancis"',
      submitBtn: '✨ SULAP JADI SOAL KUIS',
      loadingBtn: '🔮 MENYULAP SOAL KOCAK... TUNGGU YA!',
      scoreBtn: '💯 Cek Skor Kuis Komedimu!',
      raporTitle: '📋 Rapor Kuis Kamu',
      correct: '✅ Betul Banget!',
      wrong: '❌ Salah Besar!',
      ansKey: 'Jawaban Benar:'
    },
    en: {
      subtitle: 'Student Comedy Quiz Portal',
      selectLang: 'Select Interface & Quiz Language:',
      regTitle: 'Register New Student Account',
      regUserPlace: 'Create New Username',
      regPassPlace: 'Create Secret Password',
      regBtn: 'CREATE ACCOUNT',
      regLink: 'Login here',
      haveAcc: 'Already have an account?',
      loginTitle: 'Enter Learning Portal',
      loginUserPlace: 'Enter Username',
      loginPassPlace: 'Enter Password',
      loginBtn: 'LOGIN & START LEARNING',
      noAcc: 'Not registered yet?',
      noAccLink: 'Create a new account first',
      alertRegSuccess: '🎉 Registration Successful! Please Login.',
      alertFill: 'Username & Password are required!',
      alertWrong: '❌ Incorrect Username or Password!',
      student: '🎒 Student',
      logout: 'Logout',
      mainSubtitle: 'Transform Study Materials Into 10 Hilarious Multiple-Choice Questions!',
      inputLabel: 'Enter Study Material:',
      inputPlace: 'Example: "Newton laws of motion or French industrial revolution"',
      submitBtn: '✨ MAGIC INTO QUIZ QUESTIONS',
      loadingBtn: '🔮 CONJURING FUNNY QUESTIONS... WAIT UP!',
      scoreBtn: '💯 Check Your Comedy Quiz Score!',
      raporTitle: '📋 Your Report Card',
      correct: '✅ Spot On!',
      wrong: '❌ Way Off!',
      ansKey: 'Correct Answer:'
    },
    zh: {
      subtitle: '学生喜剧测试门户',
      selectLang: '选择界面与测试语言:',
      regTitle: '注册新学生账户',
      regUserPlace: '创建新用户名',
      regPassPlace: '创建登录密码',
      regBtn: '注册账户',
      regLink: '在此登录',
      haveAcc: '已有账户？',
      loginTitle: '进入学习门户',
      loginUserPlace: '输入用户名',
      loginPassPlace: '输入密码',
      loginBtn: '登录并开始学习',
      noAcc: '还没有账户？',
      noAccLink: '先创建一个新账户',
      alertRegSuccess: '🎉 学生注册成功！请登录。',
      alertFill: '用户名和密码不能为空！',
      alertWrong: '❌ 用户名或密码错误！',
      student: '🎒 学生',
      logout: '退出登录',
      mainSubtitle: '将学习材料神奇地变成10道搞笑的选择题！',
      inputLabel: '输入学习材料:',
      inputPlace: '例如：“牛顿运动定律或法国工业革命”',
      submitBtn: '✨ 变身成测试题',
      loadingBtn: '🔮 正在编织搞笑题... 请稍候！',
      scoreBtn: '💯 查看你的喜剧测试分数！',
      raporTitle: '📋 你的成绩单',
      correct: '✅ 完全正确！',
      wrong: '❌ 大错特错！',
      ansKey: '正确答案:'
    }
  };

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
      setError('');
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
      setError(err.message || 'Error');
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
    quiz.forEach((item, idx) => {
      if (userAnswers[idx] === item.answer) correctCount++;
    });

    const finalScore = Math.round((correctCount / quiz.length) * 100);

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

  // --- TAMPILAN HALAMAN LOGIN / REGISTER (DENGAN DROPDOWN BAHASA DI ATASNYA) ---
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-gray-100 py-16 px-4 flex flex-col items-center font-sans text-black">
        <div className="max-w-md w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6">
          <h1 className="text-3xl font-extrabold text-center mb-1 uppercase tracking-wide text-black">
            🧙‍♂️ EduGenie Pop
          </h1>
          <p className="text-center text-xs font-bold text-gray-600 mb-6 uppercase tracking-wider">
            {t[language].subtitle}
          </p>

          {/* 🌐 Pilihan Bahasa Sebelum Login */}
          <div className="flex flex-col gap-1 mb-6 border-b-2 border-dashed border-black pb-4">
            <label className="font-bold text-xs uppercase text-gray-700">{t[language].selectLang}</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="p-2 border-2 border-black font-bold rounded-lg bg-yellow-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none cursor-pointer text-sm"
            >
              <option value="id" className="text-black">🇮🇩 Bahasa Indonesia</option>
              <option value="en" className="text-black">🇺🇸 English</option>
              <option value="zh" className="text-black">🇨🇳 中文 / Mandarin</option>
            </select>
          </div>

          {!isRegistered ? (
            <form onSubmit={handleRegister} className="flex flex-col gap-4">
              <h2 className="font-black text-base uppercase text-center bg-blue-200 border-2 border-black py-1.5 rounded text-black">
                {t[language].regTitle}
              </h2>
              <input
                type="text"
                placeholder={t[language].regUserPlace}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-3 border-3 border-black font-semibold rounded-lg text-black focus:outline-none placeholder-gray-400"
              />
              <input
                type="password"
                placeholder={t[language].regPassPlace}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 border-3 border-black font-semibold rounded-lg text-black focus:outline-none placeholder-gray-400"
              />
              <button type="submit" className="py-3 bg-blue-400 font-extrabold text-black border-3 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer">
                {t[language].regBtn}
              </button>
              <p className="text-center text-xs font-bold mt-2 text-black">
                {t[language].haveAcc} <span onClick={() => setIsRegistered(true)} className="text-blue-600 underline cursor-pointer">{t[language].regLink}</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <h2 className="font-black text-base uppercase text-center bg-green-200 border-2 border-black py-1.5 rounded text-black">
                {t[language].loginTitle}
              </h2>
              <input
                type="text"
                placeholder={t[language].loginUserPlace}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="p-3 border-3 border-black font-semibold rounded-lg text-black focus:outline-none placeholder-gray-400"
              />
              <input
                type="password"
                placeholder={t[language].loginPassPlace}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="p-3 border-3 border-black font-semibold rounded-lg text-black focus:outline-none placeholder-gray-400"
              />
              <button type="submit" className="py-3 bg-green-400 font-extrabold text-black border-3 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer">
                {t[language].loginBtn}
              </button>
              <p className="text-center text-xs font-bold mt-2 text-black">
                {t[language].noAcc} <span onClick={() => setIsRegistered(false)} className="text-blue-600 underline cursor-pointer">{t[language].noAccLink}</span>
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
      <div className="max-w-2xl w-full flex justify-between items-center mb-4 px-2 font-bold text-sm text-black">
        <div>{t[language].student}: <span className="underline">{currentUser}</span></div>
        <button onClick={handleLogout} className="px-3 py-1 bg-red-400 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none cursor-pointer text-xs font-black uppercase text-black">
          {t[language].logout}
        </button>
      </div>

      <div className="max-w-2xl w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-xl p-6 mb-8">
        <h1 className="text-3xl font-extrabold text-center mb-2 uppercase tracking-wide text-black">
          🧙‍♂️ EduGenie Pop
        </h1>
        <p className="text-center text-sm font-bold text-gray-600 mb-6">
          {t[language].mainSubtitle}
        </p>

        <form onSubmit={handleSubmitQuiz} className="flex flex-col gap-4">
          {/* Dropdown Pilihan Bahasa Di Dalam Dashboard */}
          <div className="flex flex-col gap-1">
            <label className="font-bold text-sm uppercase text-black">{t[language].selectLang}</label>
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
            <label className="font-bold text-sm uppercase text-black">{t[language].inputLabel}</label>
            <textarea
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder={t[language].inputPlace}
              rows={4}
              disabled={loading}
              className="p-3 border-3 border-black font-semibold rounded-lg text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] focus:outline-none disabled:bg-gray-200 placeholder-gray-400"
            />
          </div>

          {/* Tombol Aksi */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-green-400 disabled:bg-gray-400 font-extrabold uppercase tracking-wider text-black border-3 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
          >
            {loading ? t[language].loadingBtn : t[language].submitBtn}
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
                    <p className="font-extrabold text-black">
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

          {!showResults && (
            <button
              onClick={checkScore}
              className="w-full py-4 bg-yellow-400 font-black uppercase text-black border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all cursor-pointer"
            >
              {t[language].scoreBtn}
            </button>
          )}
        </div>
      )}

      {/* Rapor Nilai & Riwayat Kuis Siswa */}
      {history.length > 0 && (
        <div className="max-w-2xl w-full bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-xl p-5 mb-10 text-black">
          <h2 className="font-black text-xl uppercase mb-4 tracking-wide bg-purple-200 border-2 border-black py-1 px-3 rounded inline-block text-black">
            {t[language].raporTitle}
          </h2>
          <div className="flex flex-col gap-3">
            {history.map((card, idx) => (
              <div key={idx} className="p-3 border-2 border-black rounded-lg bg-gray-50 flex justify-between items-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black">
                <div>
                  <p className="font-extrabold text-sm capitalize text-black">📚 {card.material}</p>
                  <p className="text-xs font-bold text-gray-500 mt-0.5">Bahasa: {card.language} | Date: {card.date}</p>
                </div>
                <div className={`text-xl font-black p-2 border-2 border-black rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-black ${card.score >= 70 ? 'bg-green-300' : 'bg-red-300'}`}>
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