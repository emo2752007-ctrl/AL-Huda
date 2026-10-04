import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

app.use(express.json());

const INITIAL_VIDEOS = [
  {
    id: 'vid-1',
    title: 'درس 1 مقدمة ج1 | السيرة وبناء الأمة | السيرة النبوية | راغب السرجاني',
    channel: 'أرشيف الشيخ راغب السرجاني',
    category: 'السيرة النبوية',
    description: 'المقدمة التأصيلية الرائعة لدراسة السيرة النبوية العطرة وأثرها في بناء شخصية المسلم ونهضة الأمة الإسلامية للدكتور راغب السرجاني.',
    youtubeId: 'fM8AJIZ6jSY',
    embedUrl: 'https://www.youtube-nocookie.com/embed/fM8AJIZ6jSY',
    thumbnail: 'https://img.youtube.com/vi/fM8AJIZ6jSY/hqdefault.jpg',
    isFeatured: true,
    duration: '45 دقيقة'
  },
  {
    id: 'vid-2',
    title: 'سلسلة السيرة النبوية — الدكتور راغب السرجاني',
    channel: 'أرشيف الشيخ راغب السرجاني',
    category: 'السيرة النبوية',
    description: 'عرض تحليلي موثق وشيق لمحطات السيرة النبوية والدروس التربوية المستفادة في الواقع المعاصر.',
    youtubeId: 'Ck8P2dfg0ns',
    embedUrl: 'https://www.youtube-nocookie.com/embed/Ck8P2dfg0ns',
    thumbnail: 'https://img.youtube.com/vi/Ck8P2dfg0ns/hqdefault.jpg',
    isFeatured: true,
    duration: '42 دقيقة'
  }
];

const QUIZ_QUESTIONS = [
  {
    id: 'q-quran-1',
    category: 'quran',
    categoryAr: 'القرآن الكريم',
    difficulty: 'easy',
    question: 'ما هي أعظم آية في القرآن الكريم وفقاً لما ثبت في السنة النبوية؟',
    options: ['آية الكرسي (سورة البقرة)', 'خواتيم سورة البقرة', 'آية الدين (سورة البقرة)', 'أول آية من سورة الفاتحة'],
    correctIndex: 0,
    explanation: 'سأل النبي ﷺ أُبيّ بن كعب: «أيّ آية في كتاب الله معك أعظم؟» قال: آية الكرسي، فضرب في صدره وقال: «ليهنك العلم يا أبا المنذر».',
    source: 'صحيح مسلم (810)'
  },
  {
    id: 'q-quran-2',
    category: 'quran',
    categoryAr: 'القرآن الكريم',
    difficulty: 'easy',
    question: 'كم عدد آيات سورة الفاتحة (السبع المثاني)؟',
    options: ['6 آيات', '7 آيات', '8 آيات', '9 آيات'],
    correctIndex: 1,
    explanation: 'سورة الفاتحة سبع آيات باتفاق العلماء لقوله تعالى: ﴿وَلَقَدْ آتَيْنَاكَ سَبْعًا مِّنَ الْمَثَانِي وَالْقُرْآنَ الْعَظِيمَ﴾.',
    source: 'القرآن الكريم (سورة الحجر: 87) وتفسير ابن كثير'
  },
  {
    id: 'q-quran-3',
    category: 'quran',
    categoryAr: 'القرآن الكريم',
    difficulty: 'medium',
    question: 'في أي سورة وردت أطول آية في القرآن الكريم (آية الدَّيْن)؟',
    options: ['سورة آل عمران', 'سورة البقرة', 'سورة النساء', 'سورة المائدة'],
    correctIndex: 1,
    explanation: 'آية الدين هي الآية رقم 282 من سورة البقرة، وتستغرق صفحة كاملة في المصحف الشريف.',
    source: 'القرآن الكريم (سورة البقرة: 282)'
  },
  {
    id: 'q-quran-4',
    category: 'quran',
    categoryAr: 'القرآن الكريم',
    difficulty: 'medium',
    question: 'ما هي السورة التي لا تبدأ بالبسملة في المصحف الشريف؟',
    options: ['سورة الأنفال', 'سورة التوبة (براءة)', 'سورة الحشر', 'سورة القيامة'],
    correctIndex: 1,
    explanation: 'سورة التوبة نزلت بالسيف ونبذ عهود المشركين، والبسملة أمان ورحمة، وقيل لأنها نزلت كالمتممة لسورة الأنفال.',
    source: 'الجامع لأحكام القرآن للقرطبي'
  },
  {
    id: 'q-hadith-1',
    category: 'hadith',
    categoryAr: 'الحديث النبوي',
    difficulty: 'easy',
    question: 'أكمل الحديث: «إنما الأعمال بـ ...... وإنما لكل امرئ ما نوى»',
    options: ['الأقوال', 'النيات', 'الخواتيم', 'الأسباب'],
    correctIndex: 1,
    explanation: 'الحديث المتفق عليه من رواية أمير المؤمنين عمر بن الخطاب رضي الله عنه وهو أصل في وجوب إخلاص النية.',
    source: 'صحيح البخاري (1) وصحيح مسلم (1907)'
  },
  {
    id: 'q-hadith-2',
    category: 'hadith',
    categoryAr: 'الحديث النبوي',
    difficulty: 'easy',
    question: 'من هو الصحابي الجليل الذي روى أكبر عدد من الأحاديث النبوية الشريفة؟',
    options: ['عبد الله بن عمر رضي الله عنهما', 'أنس بن مالك رضي الله عنه', 'أبو هريرة رضي الله عنه', 'عبد الله بن عباس رضي الله عنهما'],
    correctIndex: 2,
    explanation: 'أبو هريرة عبد الرحمن بن صخر الدوسي رضي الله عنه روى أكثر من 5374 حديثاً بفضل دعوة النبي ﷺ له بحفظ ما يسمع.',
    source: 'سير أعلام النبلاء للذهبي'
  },
  {
    id: 'q-seerah-1',
    category: 'seerah',
    categoryAr: 'السيرة النبوية',
    difficulty: 'easy',
    question: 'في أي غار كان النبي ﷺ يتعبد عندما نزل عليه الوحي لأول مرة؟',
    options: ['غار ثور', 'غار حراء', 'غار أحد', 'غار النور'],
    correctIndex: 1,
    explanation: 'كان النبي ﷺ يتحنث في غار حراء بجبل النور في مكة المكرمة عندما فاجأه جبريل عليه السلام بـ ﴿اقرأ﴾.',
    source: 'صحيح البخاري (كتاب بدء الوحي)'
  },
  {
    id: 'q-seerah-2',
    category: 'seerah',
    categoryAr: 'السيرة النبوية',
    difficulty: 'easy',
    question: 'من كان رفيق النبي ﷺ في رحلة الهجرة النبوية المباركة من مكة إلى المدينة؟',
    options: ['عمر بن الخطاب رضي الله عنه', 'علي بن أبي طالب رضي الله عنه', 'أبو بكر الصديق رضي الله عنه', 'عثمان بن عفان رضي الله عنه'],
    correctIndex: 2,
    explanation: 'رافقه أبو بكر الصديق رضي الله عنه واختبآ معاً في غار ثور ثلاث ليال كما قال تعالى: ﴿ثَانِيَ اثْنَيْنِ إِذْ هُمَا فِي الْغَارِ﴾.',
    source: 'القرآن الكريم (التوبة: 40)'
  },
  {
    id: 'q-ghazawat-1',
    category: 'ghazawat',
    categoryAr: 'غزوات الرسول ﷺ',
    difficulty: 'easy',
    question: 'ما هي أول غزوة كبرى بين المسلمين ومشركي قريش وسماها القرآن «يوم الفرقان»؟',
    options: ['غزوة أحد', 'غزوة بدر الكبرى', 'غزوة الخندق', 'غزوة بني قينقاع'],
    correctIndex: 1,
    explanation: 'غزوة بدر الكبرى وقعت في 17 رمضان 2 هـ وسماها الله يوم الفرقان لأنه فرق فيه بين الحق والباطل.',
    source: 'القرآن الكريم (الأنفال: 41)'
  },
  {
    id: 'q-ghazawat-2',
    category: 'ghazawat',
    categoryAr: 'غزوات الرسول ﷺ',
    difficulty: 'medium',
    question: 'من الصحابي الجليل الذي أشار على النبي ﷺ بحفر الخندق لحماية المدينة من الأحزاب؟',
    options: ['سلمان الفارسي رضي الله عنه', 'عمار بن ياسر رضي الله عنه', 'أبو عبيدة بن الجراح رضي الله عنه', 'حذيفة بن اليمان رضي الله عنه'],
    correctIndex: 0,
    explanation: 'أشار سلمان الفارسي بحفر الخندق قائلاً: «يا رسول الله، إنا كنا بفارس إذا حوصرنا خندقنا علينا».',
    source: 'السيرة النبوية لابن إسحاق'
  },
  {
    id: 'q-sahaba-1',
    category: 'sahaba',
    categoryAr: 'الصحابة',
    difficulty: 'easy',
    question: 'من هو أول الخلفاء الراشدين وصاحب رسول الله في الغار؟',
    options: ['عمر بن الخطاب', 'علي بن أبي طالب', 'أبو بكر الصديق', 'عثمان بن عفان'],
    correctIndex: 2,
    explanation: 'هو عبد الله بن أبي قحافة المشهور بأبي بكر الصديق رضي الله عنه، أول من أسلم من الرجال وأفضل الأمة بعد نبيها.',
    source: 'تاريخ الخلفاء للسيوطي'
  },
  {
    id: 'q-worship-1',
    category: 'worship',
    categoryAr: 'العبادات',
    difficulty: 'easy',
    question: 'ما هو الركن الثاني من أركان الإسلام وهو عمود الدين؟',
    options: ['شهادة أن لا إله إلا الله', 'إقام الصلاة', 'إيتاء الزكاة', 'صوم رمضان'],
    correctIndex: 1,
    explanation: 'الصلاة هي عماد الدين وركنه الثاني الثابت بحديث: «بُني الإسلام على خمس...» ومن حفظها حفظ دينه.',
    source: 'صحيح البخاري ومسلم'
  }
];

// Ensure data folder and db file exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Password hashing helper using crypto
function hashPassword(password: string, salt = crypto.randomBytes(16).toString('hex')): string {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(':');
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    return hash === originalHash;
  } catch (err) {
    return false;
  }
}

function generateToken(userId: string): string {
  return `${userId}_${crypto.randomBytes(32).toString('hex')}`;
}

// Database schema initialization
interface DatabaseSchema {
  users: any[];
  sessions: Record<string, string>; // token -> userId
  progress: Record<string, any>; // userId -> progress object
  bookmarks: any[];
  quizAttempts: any[];
  videos: any[];
  resetTokens: Record<string, { userId: string; expiresAt: number }>;
}

function getInitialDb(): DatabaseSchema {
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const adminHash = hashPassword('admin123456', adminSalt);

  const initialUsers = [
    {
      id: 'user-admin',
      name: 'مدير منصة الهُدى',
      username: 'admin',
      email: 'admin@alhuda.islam',
      passwordHash: adminHash,
      role: 'admin',
      points: 12500,
      xp: 12500,
      level: 5,
      levelTitle: 'متميز',
      streak: 42,
      leaderboardVisibility: true,
      emailVerified: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'user-ahmed',
      name: 'أحمد عبد الله',
      username: 'ahmed_quran',
      email: 'ahmed@example.com',
      passwordHash: hashPassword('ahmed123'),
      role: 'user',
      points: 9850,
      xp: 9850,
      level: 5,
      levelTitle: 'متميز',
      streak: 21,
      leaderboardVisibility: true,
      emailVerified: true,
      createdAt: '2026-09-01T10:00:00Z'
    },
    {
      id: 'user-mohamed',
      name: 'محمد إبراهيم',
      username: 'mohamed_ibrahim',
      email: 'mohamed@example.com',
      passwordHash: hashPassword('mohamed123'),
      role: 'user',
      points: 9420,
      xp: 9420,
      level: 5,
      levelTitle: 'متميز',
      streak: 18,
      leaderboardVisibility: true,
      emailVerified: true,
      createdAt: '2026-09-05T12:00:00Z'
    },
    {
      id: 'user-youssef',
      name: 'يوسف القحطاني',
      username: 'youssef_q',
      email: 'youssef@example.com',
      passwordHash: hashPassword('youssef123'),
      role: 'user',
      points: 9100,
      xp: 9100,
      level: 4,
      levelTitle: 'متقدم',
      streak: 14,
      leaderboardVisibility: true,
      emailVerified: true,
      createdAt: '2026-09-10T08:00:00Z'
    },
    {
      id: 'user-fatima',
      name: 'فاطمة الزهراء',
      username: 'fatima_z',
      email: 'fatima@example.com',
      passwordHash: hashPassword('fatima123'),
      role: 'user',
      points: 8300,
      xp: 8300,
      level: 4,
      levelTitle: 'متقدم',
      streak: 11,
      leaderboardVisibility: true,
      emailVerified: true,
      createdAt: '2026-09-12T14:00:00Z'
    }
  ];

  return {
    users: initialUsers,
    sessions: {},
    progress: {},
    bookmarks: [],
    quizAttempts: [],
    videos: INITIAL_VIDEOS,
    resetTokens: {}
  };
}

function loadDb(): DatabaseSchema {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error reading db.json:', err);
  }
  const init = getInitialDb();
  saveDb(init);
  return init;
}

function saveDb(data: DatabaseSchema): void {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing db.json:', err);
  }
}

// User points & level calculation helper
function calculateLevel(xp: number): { level: number; title: string } {
  if (xp >= 9000) return { level: 5, title: 'متميز' };
  if (xp >= 6000) return { level: 4, title: 'متقدم' };
  if (xp >= 3000) return { level: 3, title: 'مجتهد' };
  if (xp >= 1000) return { level: 2, title: 'طالب علم' };
  return { level: 1, title: 'مبتدئ' };
}

// Auth Middleware
function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  const db = loadDb();
  const userId = db.sessions[token];
  if (userId) {
    const user = db.users.find(u => u.id === userId);
    if (user) {
      (req as any).user = user;
    }
  }
  next();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user) {
    return res.status(401).json({ error: 'يجب تسجيل الدخول أولاً' });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) {
    return res.status(403).json({ error: 'صلاحيات إدارية مطلوبة' });
  }
  next();
}

app.use(authMiddleware);

// --- AUTH API ROUTES ---
app.post('/api/auth/register', (req: Request, res: Response) => {
  const { name, username, email, password } = req.body;
  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: 'يرجى استيفاء جميع الحقول المطلوبة' });
  }
  if (password.length < 6) {
    return res.status(400).json({ error: 'كلمة المرور يجب ألا تقل عن 6 أحرف' });
  }

  const db = loadDb();
  const lowerEmail = email.toLowerCase().trim();
  const lowerUsername = username.toLowerCase().trim();

  if (db.users.some(u => u.email.toLowerCase() === lowerEmail)) {
    return res.status(400).json({ error: 'البريد الإلكتروني مسجل بالفعل' });
  }
  if (db.users.some(u => u.username.toLowerCase() === lowerUsername)) {
    return res.status(400).json({ error: 'اسم المستخدم محجوز بالفعل، اختر اسماً آخر' });
  }

  const userId = `user-${Date.now()}`;
  const newUser = {
    id: userId,
    name: name.trim(),
    username: lowerUsername,
    email: lowerEmail,
    passwordHash: hashPassword(password),
    role: 'user',
    points: 50, // Welcome bonus
    xp: 50,
    level: 1,
    levelTitle: 'مبتدئ',
    streak: 1,
    leaderboardVisibility: true,
    emailVerified: false,
    createdAt: new Date().toISOString()
  };

  const token = generateToken(userId);
  db.users.push(newUser);
  db.sessions[token] = userId;

  // Initialize progress
  db.progress[userId] = {
    userId,
    quranLastSurah: 1,
    quranLastAyah: 1,
    quranReadAyahsCount: 0,
    khatmaPlanDays: 30,
    khatmaDayProgress: 1,
    completedAzkarTotal: 0,
    ramadanChecklist: {},
    shabanChecklist: {},
    achievementsUnlocked: ['first_account']
  };

  saveDb(db);

  const { passwordHash, ...userClean } = newUser;
  res.json({ user: userClean, token, message: 'تم إنشاء الحساب بنجاح' });
});

app.post('/api/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني وكلمة المرور' });
  }

  const db = loadDb();
  const lowerId = identifier.toLowerCase().trim();
  const user = db.users.find(u => u.email.toLowerCase() === lowerId || u.username.toLowerCase() === lowerId);

  if (!user || !verifyPassword(password, user.passwordHash)) {
    return res.status(401).json({ error: 'بيانات الدخول غير صحيحة، يرجى التحقق من البريد أو كلمة المرور' });
  }

  const token = generateToken(user.id);
  db.sessions[token] = user.id;
  saveDb(db);

  const { passwordHash, ...userClean } = user;
  res.json({ user: userClean, token, message: 'تم تسجيل الدخول بنجاح' });
});

app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = (req as any).user;
  if (!user) {
    return res.json({ user: null });
  }
  const { passwordHash, ...userClean } = user;
  res.json({ user: userClean });
});

app.post('/api/auth/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const db = loadDb();
    delete db.sessions[token];
    saveDb(db);
  }
  res.json({ message: 'تم تسجيل الخروج بنجاح' });
});

app.post('/api/auth/forgot-password', (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'يرجى إدخال البريد الإلكتروني' });
  }
  const db = loadDb();
  const user = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    // Return friendly generic response for privacy
    return res.json({ message: 'إذا كان البريد مسجلاً لدينا، فسيتم إرسال رابط إعادة التعيين إليه.' });
  }

  const resetToken = crypto.randomBytes(24).toString('hex');
  db.resetTokens[resetToken] = {
    userId: user.id,
    expiresAt: Date.now() + 3600000 // 1 hour
  };
  saveDb(db);

  res.json({
    message: 'تم إرسال رابط استعادة كلمة المرور بنجاح إلى بريدك الإلكتروني.',
    demoResetToken: resetToken // Provided for test simulation
  });
});

app.post('/api/auth/reset-password', (req: Request, res: Response) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword || newPassword.length < 6) {
    return res.status(400).json({ error: 'كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف والرمز مطلوب' });
  }

  const db = loadDb();
  const entry = db.resetTokens[token];
  if (!entry || entry.expiresAt < Date.now()) {
    return res.status(400).json({ error: 'رمز إعادة التعيين منتهي الصلاحية أو غير صالح' });
  }

  const user = db.users.find(u => u.id === entry.userId);
  if (!user) {
    return res.status(404).json({ error: 'المستخدم غير موجود' });
  }

  user.passwordHash = hashPassword(newPassword);
  delete db.resetTokens[token];
  saveDb(db);

  res.json({ message: 'تم تحديث كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.' });
});

app.post('/api/auth/verify-email', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = loadDb();
  const target = db.users.find(u => u.id === user.id);
  if (target) {
    target.emailVerified = true;
    target.points += 25;
    target.xp += 25;
    saveDb(db);
    const { passwordHash, ...clean } = target;
    return res.json({ user: clean, message: 'تم التحقق من بريدك الإلكتروني بنجاح ومنحك 25 نقطة!' });
  }
  res.status(404).json({ error: 'المستخدم غير موجود' });
});

// Profile & Settings
app.put('/api/user/profile', requireAuth, (req: Request, res: Response) => {
  const { name, avatar } = req.body;
  const user = (req as any).user;
  const db = loadDb();
  const target = db.users.find(u => u.id === user.id);
  if (!target) return res.status(404).json({ error: 'المستخدم غير موجود' });

  if (name) target.name = name.trim();
  if (avatar !== undefined) target.avatar = avatar;
  saveDb(db);

  const { passwordHash, ...clean } = target;
  res.json({ user: clean, message: 'تم حفظ بيانات الملف الشخصي بنجاح' });
});

app.put('/api/user/settings', requireAuth, (req: Request, res: Response) => {
  const { leaderboardVisibility, prayerSettings } = req.body;
  const user = (req as any).user;
  const db = loadDb();
  const target = db.users.find(u => u.id === user.id);
  if (!target) return res.status(404).json({ error: 'المستخدم غير موجود' });

  if (leaderboardVisibility !== undefined) {
    target.leaderboardVisibility = Boolean(leaderboardVisibility);
  }
  if (prayerSettings) {
    target.prayerSettings = { ...target.prayerSettings, ...prayerSettings };
  }
  saveDb(db);

  const { passwordHash, ...clean } = target;
  res.json({ user: clean, message: 'تم تحديث الإعدادات بنجاح' });
});

// Progress endpoints
app.get('/api/user/progress', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = loadDb();
  const prog = db.progress[user.id] || {
    userId: user.id,
    quranLastSurah: 1,
    quranLastAyah: 1,
    quranReadAyahsCount: 0,
    khatmaPlanDays: 30,
    khatmaDayProgress: 1,
    completedAzkarTotal: 0,
    ramadanChecklist: {},
    shabanChecklist: {},
    achievementsUnlocked: []
  };
  res.json({ progress: prog });
});

app.post('/api/user/progress', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { updates, xpToAdd = 0 } = req.body;
  const db = loadDb();

  if (!db.progress[user.id]) {
    db.progress[user.id] = {
      userId: user.id,
      quranLastSurah: 1,
      quranLastAyah: 1,
      quranReadAyahsCount: 0,
      khatmaPlanDays: 30,
      khatmaDayProgress: 1,
      completedAzkarTotal: 0,
      ramadanChecklist: {},
      shabanChecklist: {},
      achievementsUnlocked: []
    };
  }

  db.progress[user.id] = {
    ...db.progress[user.id],
    ...updates
  };

  const targetUser = db.users.find(u => u.id === user.id);
  if (targetUser && xpToAdd > 0) {
    targetUser.points += xpToAdd;
    targetUser.xp += xpToAdd;
    const { level, title } = calculateLevel(targetUser.xp);
    targetUser.level = level;
    targetUser.levelTitle = title;
  }

  saveDb(db);
  res.json({ progress: db.progress[user.id], user: targetUser ? (({ passwordHash, ...c }) => c)(targetUser) : null });
});

// Bookmarks endpoints
app.get('/api/user/bookmarks', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = loadDb();
  const userBookmarks = db.bookmarks.filter(b => b.userId === user.id);
  res.json({ bookmarks: userBookmarks });
});

app.post('/api/user/bookmarks', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { type, refId, title, subtitle, extraData } = req.body;
  if (!type || !refId || !title) {
    return res.status(400).json({ error: 'بيانات المحفوظة غير مكتملة' });
  }

  const db = loadDb();
  // Check if exists
  const existingIndex = db.bookmarks.findIndex(b => b.userId === user.id && b.type === type && b.refId === refId);
  if (existingIndex >= 0) {
    return res.json({ bookmark: db.bookmarks[existingIndex], message: 'العنصر محفوظ بالفعل' });
  }

  const newBookmark = {
    id: `bm-${Date.now()}`,
    userId: user.id,
    type,
    refId,
    title,
    subtitle,
    extraData,
    createdAt: new Date().toISOString()
  };

  db.bookmarks.push(newBookmark);
  saveDb(db);
  res.json({ bookmark: newBookmark, message: 'تمت الإضافة إلى المحفوظات' });
});

app.delete('/api/user/bookmarks/:id', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  const db = loadDb();
  db.bookmarks = db.bookmarks.filter(b => !(b.id === id && b.userId === user.id));
  saveDb(db);
  res.json({ message: 'تم الحذف من المحفوظات' });
});

// Quiz endpoints
app.get('/api/quiz/questions', (req: Request, res: Response) => {
  const { category, difficulty, count = '10' } = req.query;
  let list = [...QUIZ_QUESTIONS];

  if (category && category !== 'all') {
    list = list.filter(q => q.category === category);
  }
  if (difficulty && difficulty !== 'all') {
    list = list.filter(q => q.difficulty === difficulty);
  }

  // Shuffle
  list.sort(() => Math.random() - 0.5);
  const limit = Math.min(parseInt(count as string, 10) || 10, list.length);
  res.json({ questions: list.slice(0, limit) });
});

app.post('/api/quiz/submit', (req: Request, res: Response) => {
  const { category, categoryAr, difficulty, totalQuestions, correctAnswers, timeSeconds } = req.body;
  const user = (req as any).user;

  const scorePercentage = Math.round((correctAnswers / totalQuestions) * 100);
  let grade = 'جيد، ويمكنك تحسين مستواك 📚';
  if (scorePercentage >= 90) grade = 'ممتاز جدًا 🌟';
  else if (scorePercentage >= 75) grade = 'ممتاز، استمر 👏';

  // Base XP: +20 XP for finishing, +50 XP bonus for perfect score
  let xpEarned = 20;
  if (scorePercentage === 100) xpEarned += 50;
  else if (scorePercentage >= 75) xpEarned += 15;

  const attempt = {
    id: `qa-${Date.now()}`,
    userId: user ? user.id : 'guest',
    category: category || 'all',
    categoryAr: categoryAr || 'اختبار شامل',
    difficulty: difficulty || 'medium',
    totalQuestions,
    correctAnswers,
    scorePercentage,
    grade,
    xpEarned,
    timeSeconds: timeSeconds || 60,
    createdAt: new Date().toISOString()
  };

  const db = loadDb();
  db.quizAttempts.push(attempt);

  if (user) {
    const targetUser = db.users.find(u => u.id === user.id);
    if (targetUser) {
      targetUser.points += xpEarned;
      targetUser.xp += xpEarned;
      const { level, title } = calculateLevel(targetUser.xp);
      targetUser.level = level;
      targetUser.levelTitle = title;
    }
  }

  saveDb(db);
  res.json({ attempt, xpEarned });
});

app.get('/api/quiz/attempts', requireAuth, (req: Request, res: Response) => {
  const user = (req as any).user;
  const db = loadDb();
  const attempts = db.quizAttempts.filter(a => a.userId === user.id);
  res.json({ attempts });
});

// Leaderboard endpoint
app.get('/api/leaderboard', (req: Request, res: Response) => {
  const db = loadDb();
  // Filter visible users and sort by points descending
  const visible = db.users
    .filter(u => u.leaderboardVisibility !== false)
    .sort((a, b) => b.points - a.points);

  const leaderboard = visible.map((u, idx) => {
    const quizzesCount = db.quizAttempts.filter(a => a.userId === u.id).length;
    return {
      rank: idx + 1,
      userId: u.id,
      name: u.name,
      username: u.username,
      avatar: u.avatar,
      points: u.points,
      xp: u.xp,
      level: u.level,
      levelTitle: u.levelTitle,
      quizzesCompleted: Math.max(quizzesCount, Math.floor(u.points / 150)),
      streak: u.streak || 1
    };
  });

  res.json({ leaderboard });
});

// Videos API & Admin Manager
app.get('/api/videos', (req: Request, res: Response) => {
  const db = loadDb();
  res.json({ videos: db.videos || INITIAL_VIDEOS });
});

app.post('/api/admin/videos', requireAdmin, (req: Request, res: Response) => {
  const { youtubeUrl, title, channel, category, description, isFeatured } = req.body;
  if (!youtubeUrl || !title || !category) {
    return res.status(400).json({ error: 'الرابط والعنوان والقسم مطلوبة' });
  }

  // Extract YouTube ID
  let youtubeId = '';
  const match = youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    youtubeId = match[1];
  } else if (/^[\w-]{11}$/.test(youtubeUrl)) {
    youtubeId = youtubeUrl;
  } else {
    return res.status(400).json({ error: 'رابط يوتيوب غير صالح، يرجى إدخال رابط يوتيوب صحيح' });
  }

  const newVideo = {
    id: `vid-${Date.now()}`,
    title: title.trim(),
    channel: (channel || 'الهُدى').trim(),
    category,
    description: (description || '').trim(),
    youtubeId,
    embedUrl: `https://www.youtube-nocookie.com/embed/${youtubeId}`,
    thumbnail: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
    isFeatured: Boolean(isFeatured),
    duration: 'درس علمي'
  };

  const db = loadDb();
  db.videos.unshift(newVideo);
  saveDb(db);
  res.json({ video: newVideo, message: 'تمت إضافة الفيديو بنجاح' });
});

app.delete('/api/admin/videos/:id', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const db = loadDb();
  db.videos = db.videos.filter(v => v.id !== id);
  saveDb(db);
  res.json({ message: 'تم حذف الفيديو بنجاح' });
});

// Admin stats & user management
app.get('/api/admin/stats', requireAdmin, (req: Request, res: Response) => {
  const db = loadDb();
  res.json({
    stats: {
      usersCount: db.users.length,
      quizzesCount: db.quizAttempts.length,
      videosCount: db.videos.length,
      bookmarksCount: db.bookmarks.length,
      averageScore: db.quizAttempts.length > 0 
        ? Math.round(db.quizAttempts.reduce((acc, a) => acc + (a.scorePercentage || 0), 0) / db.quizAttempts.length)
        : 85
    }
  });
});

app.get('/api/admin/users', requireAdmin, (req: Request, res: Response) => {
  const db = loadDb();
  const cleanUsers = db.users.map(({ passwordHash, ...clean }) => clean);
  res.json({ users: cleanUsers });
});

app.put('/api/admin/users/:id/role', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { role } = req.body;
  if (!['user', 'admin', 'superadmin'].includes(role)) {
    return res.status(400).json({ error: 'الدور المحدد غير صالح' });
  }
  const db = loadDb();
  const target = db.users.find(u => u.id === id);
  if (!target) return res.status(404).json({ error: 'المستخدم غير موجود' });
  target.role = role;
  saveDb(db);
  res.json({ message: 'تم تحديث صلاحيات المستخدم بنجاح' });
});

// Vite Middleware for Frontend Serving in Dev / Production
async function setupVite() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✨ خادم منصة الهُدى يعمل الآن على المنفذ: http://localhost:${PORT}`);
  });
}

setupVite().catch(err => {
  console.error('فشل في تشغيل الخادم:', err);
  process.exit(1);
});
