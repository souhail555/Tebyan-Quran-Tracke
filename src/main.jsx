import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart3, Bell, BookOpen, CalendarCheck, CalendarDays, Check, ChevronLeft,
  ClipboardList, Clock3, FileText, LayoutDashboard, Menu, Plus, Search,
  Sparkles, Trash2, UserRound, Users, X, LogOut
} from 'lucide-react';
import './styles.css';

const appBaseUrl = import.meta.env.BASE_URL;

const navItems = [
  ['dashboard', 'لوحة التحكم', LayoutDashboard], ['students', 'الطالبات', Users], ['lessons', 'الحفظ والتلاوة', BookOpen],
  ['attendance', 'الحضور والغياب', CalendarCheck], ['exams', 'الاختبارات', ClipboardList], ['reports', 'التقارير', BarChart3],
];
const juzAmmaSurahs = ['النبأ', 'النازعات', 'عبس', 'التكوير', 'الانفطار', 'المطففين', 'الانشقاق', 'البروج', 'الطارق', 'الأعلى', 'الغاشية', 'الفجر', 'البلد', 'الشمس', 'الليل', 'الضحى', 'الشرح', 'التين', 'العلق', 'القدر', 'البينة', 'الزلزلة', 'العاديات', 'القارعة', 'التكاثر', 'العصر', 'الهمزة', 'الفيل', 'قريش', 'الماعون', 'الكوثر', 'الكافرون', 'النصر', 'المسد', 'الإخلاص', 'الفلق', 'الناس'];

if (localStorage.getItem('tebyan-data-version') !== 'empty-roster-v2') {
  localStorage.removeItem('tebyan-students');
  localStorage.removeItem('tebyan-activities');
  localStorage.setItem('tebyan-data-version', 'empty-roster-v2');
}

function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat('ar-SA', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}

function App() {
  const [students, setStudents] = useState(() => JSON.parse(localStorage.getItem('tebyan-students') || 'null') || []);
  const [activePage, setActivePage] = useState('dashboard');
  const [today, setToday] = useState(() => new Date());
  const [showAdd, setShowAdd] = useState(false);
  const [showAttendance, setShowAttendance] = useState(false);
  const [search, setSearch] = useState('');
  const [activities, setActivities] = useState(() => JSON.parse(localStorage.getItem('tebyan-activities') || 'null') || [
    { icon: 'book', color: 'blue', title: 'متابعة الحفظ', text: 'ستظهر هنا آخر إنجازات الطالبات بعد إضافتهن', time: 'اليوم' },
  ]);

  useEffect(() => localStorage.setItem('tebyan-students', JSON.stringify(students)), [students]);
  useEffect(() => localStorage.setItem('tebyan-activities', JSON.stringify(activities)), [activities]);
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      const serviceWorkerUrl = import.meta.env.DEV ? '/sw.js' : `${appBaseUrl}sw.js`;
      navigator.serviceWorker.register(serviceWorkerUrl).catch(() => {});
    }
  }, []);
  useEffect(() => {
    const timer = window.setInterval(() => setToday(new Date()), 60000);
    return () => window.clearInterval(timer);
  }, []);

  const filteredStudents = useMemo(() => students.filter((student) => student.name.includes(search) || student.country.includes(search)), [students, search]);
  const present = students.filter((student) => student.attendance === 'حاضرة').length;
  const average = students.length ? Math.round(students.reduce((sum, student) => sum + student.progress, 0) / students.length) : 0;
  const pageTitle = navItems.find(([id]) => id === activePage)?.[1] || 'لوحة التحكم';

  function addStudent(form) {
    const newStudent = { ...form, id: Date.now(), progress: 0, attendance: 'حاضرة', surah: form.surah || juzAmmaSurahs[0] };
    setStudents((current) => [newStudent, ...current]);
    setActivities((current) => [{ icon: 'user', color: 'green', title: form.name, text: 'تمت إضافة طالبة جديدة إلى النظام', time: 'الآن' }, ...current]);
    setShowAdd(false);
  }

  function markAttendance(id, status) {
    setStudents((current) => current.map((student) => student.id === id ? { ...student, attendance: status } : student));
  }
  
  function updateStudent(id, changes) {
    setStudents((current) => current.map((student) => student.id === id ? { ...student, ...changes } : student));
  }

  function deleteStudent(id) {
    const student = students.find((item) => item.id === id);
    if (!student || !window.confirm(`هل تريدين حذف الطالبة ${student.name}؟`)) return;
    setStudents((current) => current.filter((item) => item.id !== id));
    setActivities((current) => [{ icon: 'user', color: 'red', title: student.name, text: 'تم حذف الطالبة من النظام', time: 'الآن' }, ...current]);
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand-mini"><img src={`${appBaseUrl}assets/tebyan-logo.jpeg`} alt="شعار مؤسسة تبيان" /><div><strong>تبيان</strong><span>للقراءات والدراسات القرآنية</span></div></div>
      <div className="profile"><div className="avatar teacher-avatar">ب</div><div><b>أهلًا وسهلًا</b><strong>بشرى اليعقوبي</strong><small>مديرة المؤسسة</small></div><Bell size={18} /></div>
      <nav>{navItems.map(([id, label, Icon]) => <button key={id} className={activePage === id ? 'nav-item active' : 'nav-item'} onClick={() => setActivePage(id)}><Icon size={20} /><span>{label}</span>{id === 'students' && <em>{students.length}</em>}</button>)}</nav>
      <div className="sidebar-footer"><div className="quran-mark">۞</div><p>متابعة طالبات جزء عم</p><small>مؤسسة تبيان القرآنية</small></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><button className="mobile-menu"><Menu /></button><div><p className="eyebrow">{formatDate(today)}</p><h1>{pageTitle}</h1></div><div className="top-actions"><div className="search"><Search size={18} /><input placeholder="ابحثي عن طالبة..." value={search} onChange={(event) => setSearch(event.target.value)} /></div><div className="top-avatar">ب</div></div></header>

      {activePage === 'dashboard' && <Dashboard students={students} present={present} average={average} activities={activities} onAdd={() => setShowAdd(true)} onAttendance={() => setShowAttendance(true)} onNavigate={setActivePage} onDelete={deleteStudent} />}
      {activePage === 'students' && <StudentsPage students={filteredStudents} onAdd={() => setShowAdd(true)} onAttendance={() => setShowAttendance(true)} onDelete={deleteStudent} />}
      {activePage === 'attendance' && <AttendancePage students={students} onMark={markAttendance} />}
      {activePage === 'lessons' && <ProgressPage students={students} onUpdateStudent={updateStudent} />}
      {activePage === 'exams' && <ExamsPage />}
      {activePage === 'reports' && <ReportsPage students={students} />}

      <footer className="footer"><span>© 2026 مؤسسة تبيان للقراءات والدراسات القرآنية</span><span>نظام متابعة الطالبات والحفظ</span></footer>
    </main>

    {showAdd && <AddStudentModal onClose={() => setShowAdd(false)} onSubmit={addStudent} />}
    {showAttendance && <AttendanceModal students={students} onClose={() => setShowAttendance(false)} onMark={markAttendance} />}
  </div>;
}

function Dashboard({ students, present, average, activities, onAdd, onAttendance, onNavigate, onDelete }) {
  return <div className="page-body dashboard-page"><img className="dashboard-watermark" src={`${appBaseUrl}assets/tebyan-logo.jpeg`} alt="" aria-hidden="true" /><section className="welcome-banner"><div><span className="tag"><Sparkles size={14} /> يوم مبارك مليء بالإنجاز</span><h2>مرحبًا بك في نظام متابعة الطالبات</h2><p>متابعة حفظ وتلاوة الطالبات في جزء عم بكل سهولة ووضوح.</p></div><div className="ayah">﴿وَقُلْ رَبِّ زِدْنِي عِلْمًا﴾<small>برنامج متابعة جزء عم</small></div></section>
    <div className="quick-actions"><button onClick={onAdd}><Plus size={17} /> إضافة طالبة جديدة</button><button onClick={onAttendance}><CalendarCheck size={17} /> تسجيل حضور اليوم</button></div>
    <section className="stats-grid"><StatCard icon={Users} label="إجمالي الطالبات" value={students.length || 0} suffix="طالبة مسجلة" color="green" /><StatCard icon={CalendarCheck} label="الحاضرات اليوم" value={present} suffix={`من أصل ${students.length}`} color="mint" /><StatCard icon={BookOpen} label="نسبة الحفظ العامة" value={`${average}%`} suffix="متوسط التقدم" color="rose" progress={average} /><StatCard icon={ClipboardList} label="الاختبارات القادمة" value="5" suffix="هذا الشهر" color="yellow" /></section>
    <div className="content-grid"><section className="panel activity-panel"><PanelHeader title="آخر النشاطات" action="عرض الكل" /><div className="activity-list">{activities.slice(0, 4).map((activity, index) => <div className="activity" key={`${activity.title}-${index}`}><div className={`activity-icon ${activity.color}`}>{activity.icon === 'check' ? <Check size={17} /> : activity.icon === 'book' ? <BookOpen size={17} /> : activity.icon === 'star' ? '★' : activity.icon === 'user' ? <UserRound size={17} /> : '!'}</div><div><b>{activity.title}</b><p>{activity.text}</p></div><time>{activity.time}</time></div>)}</div></section><section className="panel progress-panel"><PanelHeader title="تقدم الطالبات في الحفظ" action="عرض التفاصيل" /><div className="progress-overview"><div className="donut" style={{ '--value': `${average}%` }}><strong>{average}%</strong><small>متوسط الإنجاز</small></div><div className="legend"><Legend color="green" text="ممتاز" value="18" /><Legend color="lime" text="جيدة جدًا" value="14" /><Legend color="yellow" text="جيد" value="10" /><Legend color="orange" text="مقبول" value="6" /><Legend color="rose" text="تحتاج دعم" value="4" /></div></div></section></div>
    <div className="content-grid bottom-grid"><section className="panel students-panel"><PanelHeader title="الطالبات الجدد" action="عرض جميع الطالبات" onClick={() => onNavigate('students')} />{students.slice(0, 4).map((student) => <StudentRow key={student.id} student={student} onDelete={onDelete} />)}</section><section className="panel surah-panel"><PanelHeader title="سور جزء عم" action="متابعة الحفظ" /><Surah name="سورة النبأ" count="آخر سورة مسجلة" percent="84%" /><Surah name="سورة النازعات" count="جزء عم" percent="62%" /><Surah name="سورة عبس" count="جزء عم" percent="48%" /><Surah name="سورة التكوير" count="جزء عم" percent="39%" /></section></div>
  </div>;
}

function StatCard({ icon: Icon, label, value, suffix, color, progress }) { return <div className={`stat-card ${color}`}><div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={20} /></div></div><strong>{value}</strong>{progress ? <div className="mini-progress"><i style={{ width: `${progress}%` }} /></div> : null}<small>{suffix}</small></div>; }
function PanelHeader({ title, action, onClick }) { return <div className="panel-header"><h3>{title}</h3><button onClick={onClick}>{action} <ChevronLeft size={15} /></button></div>; }
function Legend({ color, text, value }) { return <div><i className={`legend-dot ${color}`} /> <span>{text}</span><b>{value}</b></div>; }
function Surah({ name, count, percent }) { return <div className="surah"><div><BookOpen size={17} /><div><b>{name}</b><small>{count}</small></div></div><div><span>{percent}</span><div className="line"><i style={{ width: percent }} /></div></div></div>; }
function StudentRow({ student, onDelete }) { return <div className="student-row"><div className="student-avatar">{student.name[0]}</div><div><b>{student.name}</b><small>{student.country} · {student.level} · سورة {student.surah}</small></div><span className={`status ${student.attendance === 'حاضرة' ? 'present' : student.attendance === 'متأخرة' ? 'late' : 'absent'}`}>{student.attendance}</span>{onDelete && <button className="delete-student-button" type="button" onClick={() => onDelete(student.id)} aria-label={`حذف الطالبة ${student.name}`} title="حذف الطالبة"><Trash2 size={16} /><span>حذف</span></button>}</div>; }

function StudentsPage({ students, onAdd, onAttendance, onDelete }) { return <div className="page-body"><div className="page-toolbar"><div><p>إدارة بيانات الطالبات ومستوى تقدمهن</p></div><div className="toolbar-actions"><button className="secondary-button" onClick={onAttendance}><CalendarCheck size={17} /> الحضور اليوم</button><button className="primary-button" onClick={onAdd}><Plus size={17} /> إضافة طالبة</button></div></div><section className="panel table-panel"><div className="table-head"><span>الطالبة</span><span>المستوى</span><span>المعلمة</span><span>السورة الحالية</span><span>الإنجاز</span><span>الحالة</span><span>الإجراءات</span></div>{students.map((student) => <div className="table-row" key={student.id}><div className="student-cell"><div className="student-avatar">{student.name[0]}</div><div><b>{student.name}</b><small>{student.country} · انضمت {student.joined}</small></div></div><span>{student.level}</span><span>{student.teacher}</span><span>{student.surah}</span><div className="table-progress"><b>{student.progress}%</b><i><em style={{ width: `${student.progress}%` }} /></i></div><span className={`status ${student.attendance === 'حاضرة' ? 'present' : student.attendance === 'متأخرة' ? 'late' : 'absent'}`}>{student.attendance}</span><button className="delete-student-button" type="button" onClick={() => onDelete(student.id)} aria-label={`حذف الطالبة ${student.name}`} title="حذف الطالبة"><Trash2 size={16} /><span>حذف</span></button></div>)}</section></div>; }
function AttendancePage({ students, onMark }) { return <div className="page-body"><div className="page-toolbar"><div><p>سجل حضور الطالبات ليوم {formatDate()}</p></div><span className="date-chip"><CalendarDays size={17} /> {formatDate()}</span></div><section className="panel table-panel"><div className="attendance-summary"><b>{students.filter(s => s.attendance === 'حاضرة').length} حاضرة</b><b>{students.filter(s => s.attendance === 'متأخرة').length} متأخرة</b><b>{students.filter(s => s.attendance === 'غائبة').length} غائبة</b></div>{students.map(student => <div className="attendance-row" key={student.id}><StudentRow student={student} /><div className="attendance-buttons"><button className={student.attendance === 'حاضرة' ? 'selected present-button' : ''} onClick={() => onMark(student.id, 'حاضرة')}><Check size={16} /> حاضرة</button><button className={student.attendance === 'متأخرة' ? 'selected late-button' : ''} onClick={() => onMark(student.id, 'متأخرة')}><Clock3 size={16} /> متأخرة</button><button className={student.attendance === 'غائبة' ? 'selected absent-button' : ''} onClick={() => onMark(student.id, 'غائبة')}><X size={16} /> غائبة</button></div></div>)}</section></div>; }
function ProgressPage({ students, onUpdateStudent }) { return <div className="page-body"><div className="page-toolbar"><div><p>متابعة المحفوظ والمراجعة لكل طالبة في جزء عم</p></div><button className="primary-button"><Plus size={17} /> تسجيل حفظ جديد</button></div><div className="progress-cards">{students.map(s => <div className="panel progress-student" key={s.id}><div className="student-row"><div className="student-avatar">{s.name[0]}</div><div><b>{s.name}</b><small>السورة الحالية: {s.surah}</small></div><strong>{s.progress}%</strong></div><label className="surah-select">السورة الحالية<select value={s.surah} onChange={event => onUpdateStudent(s.id, { surah: event.target.value })}>{juzAmmaSurahs.map(surah => <option key={surah}>{surah}</option>)}</select></label><div className="wide-progress"><i style={{ width: `${s.progress}%` }} /></div><div className="progress-meta"><span>المحفوظ السابق <b>جزء عم</b></span><span>الحفظ الجديد <b>سورة {s.surah}</b></span><span>المراجعة <b>جيدة جدًا</b></span></div></div>)}</div></div>; }
function ExamsPage() { return <div className="page-body"><div className="page-toolbar"><div><p>الاختبارات القادمة ودرجات الطالبات</p></div><button className="primary-button"><Plus size={17} /> إضافة اختبار</button></div><section className="panel empty-panel"><div className="empty-icon"><ClipboardList /></div><h2>اختبارات شهر سبتمبر</h2><p>لا توجد اختبارات مسجلة لهذا الشهر بعد.</p><button className="secondary-button"><Plus size={16} /> جدولة أول اختبار</button></section></div>; }
function ReportsPage({ students }) { return <div className="page-body"><div className="page-toolbar"><div><p>ملخص شامل عن تقدم الحفظ والحضور والاختبارات</p></div><button className="primary-button"><FileText size={17} /> تصدير التقرير</button></div><div className="report-grid"><div className="panel report-highlight"><span>متوسط الحفظ العام</span><strong>{students.length ? Math.round(students.reduce((a, b) => a + b.progress, 0) / students.length) : 0}%</strong><small>مقارنة بالشهر الماضي +8%</small></div><div className="panel report-highlight mint"><span>نسبة الحضور</span><strong>{students.length ? Math.round(students.filter(s => s.attendance === 'حاضرة').length / students.length * 100) : 0}%</strong><small>أداء مستقر هذا الشهر</small></div><div className="panel report-highlight gold"><span>مستوى التلاوة</span><strong>جيد جدًا</strong><small>حسب آخر تقييمات المعلمات</small></div></div></div>; }
function AddStudentModal({ onClose, onSubmit }) { const [form, setForm] = useState({ name: '', country: 'السعودية', phone: '', level: 'مبتدئ', teacher: 'أ. بشرى اليعقوبي', joined: new Date().toISOString().slice(0, 10), surah: juzAmmaSurahs[0] }); const change = (key, value) => setForm((current) => ({ ...current, [key]: value })); return <div className="modal-backdrop"><form className="modal" onSubmit={(e) => { e.preventDefault(); if (form.name.trim()) onSubmit(form); }}><div className="modal-header"><div><span>ملف طالبة جديد</span><h2>إضافة طالبة</h2></div><button type="button" onClick={onClose}><X /></button></div><div className="form-grid"><label>الاسم الكامل<input autoFocus required value={form.name} onChange={e => change('name', e.target.value)} placeholder="مثال: آمنة محمد" /></label><label>الدولة<input value={form.country} onChange={e => change('country', e.target.value)} /></label><label>رقم الهاتف<input value={form.phone} onChange={e => change('phone', e.target.value)} placeholder="05xxxxxxxx" /></label><label>المستوى<select value={form.level} onChange={e => change('level', e.target.value)}><option>مبتدئ</option><option>متوسط</option><option>متقدم</option></select></label><label>اسم المعلمة<input value={form.teacher} onChange={e => change('teacher', e.target.value)} /></label><label>تاريخ الالتحاق<input type="date" value={form.joined} onChange={e => change('joined', e.target.value)} /></label><label>السورة الحالية من جزء عم<select value={form.surah} onChange={e => change('surah', e.target.value)}>{juzAmmaSurahs.map(surah => <option key={surah}>{surah}</option>)}</select></label></div><div className="modal-actions"><button type="button" className="secondary-button" onClick={onClose}>إلغاء</button><button className="primary-button" type="submit"><Check size={17} /> حفظ الطالبة</button></div></form></div>; }
function AttendanceModal({ students, onClose, onMark }) { return <div className="modal-backdrop"><div className="modal attendance-modal"><div className="modal-header"><div><span>تسجيل سريع</span><h2>حضور اليوم</h2></div><button onClick={onClose}><X /></button></div><p className="modal-intro">حددي حالة كل طالبة، وسيتم حفظها تلقائيًا بتاريخ {formatDate()}.</p><div className="quick-attendance">{students.map(s => <div key={s.id}><StudentRow student={s} /><div><button onClick={() => onMark(s.id, 'حاضرة')} className={s.attendance === 'حاضرة' ? 'selected present-button' : ''}><Check size={14} /></button><button onClick={() => onMark(s.id, 'متأخرة')} className={s.attendance === 'متأخرة' ? 'selected late-button' : ''}><Clock3 size={14} /></button><button onClick={() => onMark(s.id, 'غائبة')} className={s.attendance === 'غائبة' ? 'selected absent-button' : ''}><X size={14} /></button></div></div>)}</div><button className="primary-button full-button" onClick={onClose}>تم الحفظ</button></div></div>; }

createRoot(document.getElementById('root')).render(<App />);
