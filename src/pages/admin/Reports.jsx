import React, { useState, useEffect } from 'react';
import { 
  FiGrid, 
  FiUsers, 
  FiFileText, 
  FiPieChart, 
  FiAward, 
  FiTv, 
  FiShield, 
  FiChevronRight,
  FiChevronLeft, 
  FiDownload,
  FiTag,
  FiTrendingUp,
  FiCalendar,
  FiX,
  FiBarChart2,
  FiUserCheck,
  FiUserPlus,
  FiCheckCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReports, exportReportExcel } from '../../redux/slices/adminSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ReportsSkeleton } from '../../components/shared/SkeletonLoading';
import { useLanguage } from '../../context/LanguageContext';

const Reports = () => {
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();
  const { reports, isLoading } = useSelector((state) => state.admin);

  // Theme Sync
  const [theme, setTheme] = useState(localStorage.getItem('admin_theme') || localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    const handleThemeChange = () => {
      const currentTheme = localStorage.getItem('admin_theme') || localStorage.getItem('theme') || 'dark';
      setTheme(currentTheme);
    };
    window.addEventListener('storage', handleThemeChange);
    const interval = setInterval(handleThemeChange, 500);
    return () => {
      window.removeEventListener('storage', handleThemeChange);
      clearInterval(interval);
    };
  }, []);

  const isLight = theme === 'light';

  const [timeframe, setTimeframe] = useState('month'); // week, month, year, custom
  const [activeTab, setActiveTab] = useState('overview'); // overview or users
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCustomDateOpen, setIsCustomDateOpen] = useState(false);

  // Custom date range state
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  // Timeframes list
  const timeframes = [
    { id: 'week', label: isRTL ? 'أسبوعي' : 'Weekly' },
    { id: 'month', label: isRTL ? 'شهري' : 'Monthly' },
    { id: 'year', label: isRTL ? 'سنوي' : 'Yearly' },
    { id: 'custom', label: isRTL ? 'فترة مخصصة' : 'Custom Range' }
  ];

  // Fetch reports when activeTab, timeframe, or custom dates change
  useEffect(() => {
    dispatch(fetchReports({
      type: activeTab,
      period: timeframe,
      from: timeframe === 'custom' ? fromDate : undefined,
      to: timeframe === 'custom' ? toDate : undefined,
    }));
  }, [dispatch, activeTab, timeframe, fromDate, toDate]);

  // Export handlers
  const handleExportSubscribedExcel = async () => {
    const toastId = toast.loading(isRTL ? 'جاري إنشاء تقرير إكسل للمستخدمين المشتركين...' : 'Generating Subscribed Users Excel Report...');
    try {
      await dispatch(exportReportExcel({
        type: 'subscribed',
        period: timeframe,
        from: timeframe === 'custom' ? fromDate : undefined,
        to: timeframe === 'custom' ? toDate : undefined,
      })).unwrap();
      toast.dismiss(toastId);
      toast.success(isRTL ? 'تم تنزيل تقرير إكسل للمستخدمين المشتركين! 📊' : 'Subscribed Users Excel Report downloaded! 📊');
      setIsExportOpen(false);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err || (isRTL ? 'فشل تصدير التقرير' : 'Failed to export report'));
    }
  };

  const handleExportNonSubscribedExcel = async () => {
    const toastId = toast.loading(isRTL ? 'جاري إنشاء تقرير إكسل للمستخدمين غير المشتركين...' : 'Generating Non-Subscribed Users Excel Report...');
    try {
      await dispatch(exportReportExcel({
        type: 'non_subscribed',
        period: timeframe,
        from: timeframe === 'custom' ? fromDate : undefined,
        to: timeframe === 'custom' ? toDate : undefined,
      })).unwrap();
      toast.dismiss(toastId);
      toast.success(isRTL ? 'تم تنزيل تقرير إكسل للمستخدمين غير المشتركين! 📊' : 'Non-Subscribed Users Excel Report downloaded! 📊');
      setIsExportOpen(false);
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err || (isRTL ? 'فشل تصدير التقرير' : 'Failed to export report'));
    }
  };

  const reportsData = reports || {};
  const isBlurred = isExportOpen || isCustomDateOpen;

  if (isLoading && (!reports || Object.keys(reports).length === 0)) {
    return (
      <DashboardLayout
        role="admin"
        activeTab="reports"
        title={isRTL ? "تقارير المنصة" : "Platform Reports"}
        subtitle={isRTL ? "جاري تحميل التحليلات..." : "Loading analytics..."}
      >
        <ReportsSkeleton />
      </DashboardLayout>
    );
  }

  // Parse score distribution buckets safely
  const rawScoreDistribution = reportsData.scoreDistribution || [];
  const formatScoreBucketRange = (boundary) => {
    const b = Number(boundary);
    if (isNaN(b)) return '80-100%';
    if (b === 0) return '0-20%';
    if (b === 20) return '20-40%';
    if (b === 40) return '40-60%';
    if (b === 60) return '60-80%';
    return `${b}-${Math.min(b + 20, 100)}%`;
  };

  const totalScoreAttempts = rawScoreDistribution.reduce((acc, curr) => acc + (curr.count || 0), 0) || 1;

  return (
    <DashboardLayout 
      role="admin" 
      activeTab="reports" 
      title={isRTL ? "تقارير المنصة" : "Platform Reports"} 
      subtitle={isRTL ? "تقارير التصدير الدورية والتحليلات" : "Periodic Export Reports & Analytics"}
      isModalOpen={isBlurred}
      showBackButton={false}
    >
      <div className="w-full flex flex-col px-3.5 sm:px-6 md:px-8 py-4 gap-5 animate-fade-in relative transition-all duration-300">
        
        {/* Controls Section */}
        <div className="flex flex-col gap-4 shrink-0">
          
          {/* Timeframe selector & Export */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Timeframe selector pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar scrollbar-none">
              {timeframes.map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => {
                    setTimeframe(tf.id);
                    if (tf.id === 'custom') setIsCustomDateOpen(true);
                  }}
                  className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-extrabold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                    timeframe === tf.id
                      ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.35)]'
                      : (isLight ? 'bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700' : 'bg-gray-950/40 hover:bg-gray-800/40 border border-gray-800 text-gray-400 hover:text-gray-200')
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>

            {/* Export Button */}
            <button 
              onClick={() => setIsExportOpen(true)}
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white px-4 sm:px-5 py-2.5 rounded-xl sm:rounded-2xl font-extrabold shadow-[0_4px_20px_rgba(16,185,129,0.3)] transition-all active:scale-95 cursor-pointer text-xs sm:text-sm shrink-0 w-full sm:w-auto"
            >
              <FiDownload className="text-sm sm:text-base" />
              <span>{isRTL ? "تصدير تقارير إكسل" : "Export Excel Reports"}</span>
            </button>
          </div>

          {/* Custom Date Range Display Banner (if custom active) */}
          {timeframe === 'custom' && (
            <div className={`flex items-center justify-between p-3 border rounded-2xl text-xs font-bold text-start ${
              isLight ? 'bg-amber-50 border-amber-200 text-amber-800' : 'bg-[#0c0d19] border-amber-500/20 text-amber-400'
            }`}>
              <span className="flex items-center gap-2">
                <FiCalendar /> {isRTL ? `الفترة المحددة: من ${fromDate || 'تاريخ البداية'} إلى ${toDate || 'تاريخ النهاية'}` : `Selected Range: ${fromDate || 'Start Date'} to ${toDate || 'End Date'}`}
              </span>
              <button 
                onClick={() => setIsCustomDateOpen(true)} 
                className="underline hover:opacity-80 cursor-pointer"
              >
                {isRTL ? "تغيير التواريخ" : "Change Dates"}
              </button>
            </div>
          )}

          {/* Segmented controls Overview vs Users */}
          <div className={`grid grid-cols-2 p-1 sm:p-1.5 border rounded-2xl gap-1 ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0c0d19]/80 border-gray-800/50'
          }`}>
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.25)]'
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-gray-200')
              }`}
            >
              <FiGrid className="text-sm sm:text-base" />
              <span>{t('admin.reports.overview')}</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.25)]'
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-gray-200')
              }`}
            >
              <FiUsers className="text-sm sm:text-base" />
              <span>{t('admin.reports.userBreakdown')}</span>
            </button>
          </div>

        </div>

        {/* Stats Dashboard Content */}
        <div className="w-full pb-32">
          {activeTab === 'overview' ? (
            /* Overview Tab layout */
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Card 1: New Students */}
                <div className={`p-3.5 sm:p-5 border rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4 relative overflow-hidden transition-all duration-300 text-start ${
                  isLight 
                    ? 'bg-white border-slate-200 shadow-sm hover:border-emerald-300' 
                    : 'bg-[#0c0d19]/40 border-gray-800/80 hover:border-emerald-500/25'
                }`}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-sm">
                    <FiUsers className="text-lg sm:text-2xl" />
                  </div>
                  <div className="flex flex-col text-start">
                    <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 leading-tight">
                      {reportsData.overview?.newStudents || 0}
                    </span>
                    <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mt-1 truncate ${
                      isLight ? 'text-slate-500' : 'text-gray-500'
                    }`}>
                      {t('admin.reports.newRegistered')}
                    </span>
                  </div>
                </div>

                {/* Card 2: New Teachers */}
                <div className={`p-3.5 sm:p-5 border rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4 relative overflow-hidden transition-all duration-300 text-start ${
                  isLight 
                    ? 'bg-white border-slate-200 shadow-sm hover:border-blue-300' 
                    : 'bg-[#0c0d19]/40 border-gray-800/80 hover:border-blue-500/25'
                }`}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-500 dark:text-blue-400 shadow-sm">
                    <FiTv className="text-lg sm:text-2xl" />
                  </div>
                  <div className="flex flex-col text-start">
                    <span className="text-xl sm:text-2xl font-black text-blue-600 dark:text-blue-400 leading-tight">
                      {reportsData.overview?.newTeachers || 0}
                    </span>
                    <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mt-1 truncate ${
                      isLight ? 'text-slate-500' : 'text-gray-500'
                    }`}>
                      {isRTL ? "معلمون جُدد" : "New Teachers"}
                    </span>
                  </div>
                </div>

                {/* Card 3: Exams Completed */}
                <div className={`p-3.5 sm:p-5 border rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4 relative overflow-hidden transition-all duration-300 text-start ${
                  isLight 
                    ? 'bg-white border-slate-200 shadow-sm hover:border-cyan-300' 
                    : 'bg-[#0c0d19]/40 border-gray-800/80 hover:border-cyan-500/25'
                }`}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shadow-sm">
                    <FiFileText className="text-lg sm:text-2xl" />
                  </div>
                  <div className="flex flex-col text-start">
                    <span className="text-xl sm:text-2xl font-black text-cyan-600 dark:text-cyan-400 leading-tight">
                      {reportsData.overview?.completedExams || 0}
                    </span>
                    <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mt-1 truncate ${
                      isLight ? 'text-slate-500' : 'text-gray-500'
                    }`}>
                      {isRTL ? "امتحانات مكتملة" : "Exams Completed"}
                    </span>
                  </div>
                </div>

                {/* Card 4: Coupons Activated */}
                <div className={`p-3.5 sm:p-5 border rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4 relative overflow-hidden transition-all duration-300 text-start ${
                  isLight 
                    ? 'bg-white border-slate-200 shadow-sm hover:border-amber-300' 
                    : 'bg-[#0c0d19]/40 border-gray-800/80 hover:border-yellow-500/25'
                }`}>
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500 dark:text-yellow-400 shadow-sm">
                    <FiTag className="text-lg sm:text-2xl" />
                  </div>
                  <div className="flex flex-col text-start">
                    <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-yellow-400 leading-tight">
                      {reportsData.overview?.couponsUsed || 0}
                    </span>
                    <span className={`text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mt-1 truncate ${
                      isLight ? 'text-slate-500' : 'text-gray-500'
                    }`}>
                      {isRTL ? "كوبونات مفعلة" : "Coupons Activated"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Performance & Score Distribution Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Course Performance Table (2 Columns on Desktop) */}
                <div className={`lg:col-span-2 p-6 border rounded-3xl shadow-sm flex flex-col gap-5 text-start ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0c0d19]/40 border-gray-800/80'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400 shadow-sm">
                      <FiTrendingUp size={18} />
                    </div>
                    <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {isRTL ? "أداء المواد" : "Course Performance"}
                    </h3>
                  </div>

                  {(!reportsData.subjectPerformance || reportsData.subjectPerformance.length === 0) ? (
                    <div className={`py-8 text-center border border-dashed rounded-2xl ${
                      isLight ? 'border-slate-200 text-slate-500' : 'border-gray-800 text-gray-500'
                    }`}>
                      <span className="text-xs font-semibold">{isRTL ? "لا توجد بيانات أداء للمواد بالفترة المحددة" : "No course performance data for selected period"}</span>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className={`w-full ${isRTL ? 'text-right' : 'text-left'} border-collapse`}>
                        <thead>
                          <tr className={`border-b text-xs font-bold ${isLight ? 'border-slate-200 text-slate-500' : 'border-gray-800 text-gray-400'}`}>
                            <th className="py-3 px-4">{isRTL ? "المادة" : "Subject"}</th>
                            <th className="py-3 px-4">{isRTL ? "المحاولات" : "Attempts"}</th>
                            <th className="py-3 px-4">{isRTL ? "متوسط الدرجات" : "Average Score"}</th>
                            <th className="py-3 px-4">{isRTL ? "نسبة النجاح" : "Pass Rate"}</th>
                          </tr>
                        </thead>
                        <tbody className={`divide-y text-xs font-semibold ${isLight ? 'divide-slate-100 text-slate-700' : 'divide-gray-800/50 text-gray-300'}`}>
                          {reportsData.subjectPerformance.map((item, idx) => (
                            <tr key={idx} className={isLight ? 'hover:bg-slate-50' : 'hover:bg-gray-850/20'}>
                              <td className={`py-3.5 px-4 font-extrabold capitalize ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.subjectName}</td>
                              <td className="py-3.5 px-4 font-bold">{item.totalAttempts}</td>
                              <td className="py-3.5 px-4 text-amber-600 dark:text-yellow-400 font-extrabold">{item.avgScore}%</td>
                              <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-black">{item.passRate}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Score Distribution Breakdown (1 Column on Desktop) */}
                <div className={`p-6 border rounded-3xl shadow-sm flex flex-col gap-5 text-start ${
                  isLight ? 'bg-white border-slate-200' : 'bg-[#0c0d19]/40 border-gray-800/80'
                }`}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400 shadow-sm">
                      <FiBarChart2 size={18} />
                    </div>
                    <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                      {isRTL ? "توزيع الدرجات" : "Score Distribution"}
                    </h3>
                  </div>

                  {rawScoreDistribution.length === 0 ? (
                    <div className={`py-8 text-center border border-dashed rounded-2xl ${
                      isLight ? 'border-slate-200 text-slate-500' : 'border-gray-800 text-gray-500'
                    }`}>
                      <span className="text-xs font-semibold">{isRTL ? "لا توجد امتحانات بالفترة المحددة" : "No exam attempts in selected period"}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-4">
                      {rawScoreDistribution.map((item, idx) => {
                        const label = formatScoreBucketRange(item._id);
                        const pct = Math.round(((item.count || 0) / totalScoreAttempts) * 100);
                        return (
                          <div key={idx} className="flex flex-col gap-1.5">
                            <div className="flex justify-between items-center text-xs font-bold">
                              <span className={isLight ? 'text-slate-700' : 'text-gray-300'}>{label}</span>
                              <span className={isLight ? 'text-slate-900' : 'text-white'}>
                                {item.count} {isRTL ? 'محاولة' : 'attempts'} ({pct}%)
                              </span>
                            </div>
                            <div className={`w-full h-2 rounded-full overflow-hidden ${isLight ? 'bg-slate-100' : 'bg-gray-950 border border-gray-800'}`}>
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-rose-500 rounded-full transition-all duration-700" 
                                style={{ width: `${pct}%` }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            /* Users Tab Layout */
            (() => {
              const roleBreakdown = reportsData.roleBreakdown || [];
              const studentData = roleBreakdown.find(r => r._id === 'student') || { count: 0, active: 0, verified: 0 };
              const teacherData = roleBreakdown.find(r => r._id === 'teacher') || { count: 0, active: 0, verified: 0 };
              const parentData = roleBreakdown.find(r => r._id === 'parent') || { count: 0, active: 0, verified: 0 };
              const adminData = roleBreakdown.find(r => r._id === 'admin') || { count: 0, active: 0, verified: 0 };
              const totalCount = (studentData.count + teacherData.count + parentData.count + adminData.count) || 1;

              const distribution = [
                { label: isRTL ? 'الطلاب' : 'Students', count: studentData.count, active: studentData.active, verified: studentData.verified, percentage: Math.round((studentData.count / totalCount) * 100), icon: FiAward, iconBg: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 dark:text-emerald-400', barBg: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
                { label: isRTL ? 'المعلمون' : 'Teachers', count: teacherData.count, active: teacherData.active, verified: teacherData.verified, percentage: Math.round((teacherData.count / totalCount) * 100), icon: FiTv, iconBg: 'bg-blue-500/10 border border-blue-500/20 text-blue-500 dark:text-blue-400', barBg: 'bg-blue-500', textColor: 'text-blue-600 dark:text-blue-400' },
                { label: isRTL ? 'أولياء الأمور' : 'Parents', count: parentData.count, active: parentData.active, verified: parentData.verified, percentage: Math.round((parentData.count / totalCount) * 100), icon: FiUsers, iconBg: 'bg-purple-500/10 border border-purple-500/20 text-purple-500 dark:text-purple-400', barBg: 'bg-purple-500', textColor: 'text-purple-600 dark:text-purple-400' },
                { label: isRTL ? 'المسؤولون' : 'Admins', count: adminData.count, active: adminData.active, verified: adminData.verified, percentage: Math.round((adminData.count / totalCount) * 100), icon: FiShield, iconBg: 'bg-red-500/10 border border-red-500/20 text-red-500 dark:text-red-400', barBg: 'bg-red-500', textColor: 'text-red-600 dark:text-red-400' }
              ];

              return (
                <div className="flex flex-col gap-5">
                  <div className={`p-6 border rounded-3xl shadow-sm flex flex-col gap-6 text-start ${
                    isLight ? 'bg-white border-slate-200' : 'bg-[#0c0d19]/40 border-gray-800/80'
                  }`}>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 dark:text-emerald-400 shadow-sm">
                        <FiPieChart size={18} />
                      </div>
                      <h3 className={`text-base font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                        {isRTL ? "توزيع الأدوار وحالة الحسابات" : "Role Distribution & Account Status"}
                      </h3>
                    </div>

                    <div className="flex flex-col gap-6">
                      {distribution.map((role, idx) => {
                        const Icon = role.icon;
                        return (
                          <div key={idx} className={`p-4 border rounded-2xl flex flex-col gap-3 ${
                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#07080e] border-gray-800/80'
                          }`}>
                            <div className="flex justify-between items-center text-sm font-bold">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl ${role.iconBg} flex items-center justify-center`}>
                                  <Icon className="text-base" />
                                </div>
                                <div className="flex flex-col">
                                  <span className={`font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{role.label}</span>
                                  <div className="flex items-center gap-2 text-[10px] font-semibold text-slate-500 dark:text-gray-400">
                                    <span className="flex items-center gap-0.5"><FiUserCheck size={11} className="text-emerald-500" /> {role.active || 0} {isRTL ? 'نشط' : 'Active'}</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-0.5"><FiCheckCircle size={11} className="text-blue-500" /> {role.verified || 0} {isRTL ? 'مؤكد' : 'Verified'}</span>
                                  </div>
                                </div>
                              </div>
                              <span className={`${role.textColor} font-black text-base`}>
                                {role.count} <span className="text-xs font-semibold opacity-75">({role.percentage}%)</span>
                              </span>
                            </div>
                            <div className={`w-full h-2.5 rounded-full overflow-hidden ${isLight ? 'bg-slate-200' : 'bg-gray-950 border border-gray-800'}`}>
                              <div 
                                className={`h-full ${role.barBg} rounded-full transition-all duration-700 ease-out`} 
                                style={{ width: `${role.percentage}%` }} 
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()
          )}
        </div>

      </div>

      {/* Export Options Modal (Requirement 3) */}
      {isExportOpen && (
        <div 
          className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => setIsExportOpen(false)}
        >
          <div 
            className={`w-full max-w-md border rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden text-start ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0c0d19] border-gray-800 text-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsExportOpen(false)}
              className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-gray-500 hover:text-white'} transition-colors cursor-pointer`}
            >
              <FiX size={20} />
            </button>

            <h3 className={`text-xl font-black mb-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isRTL ? `تصدير تقارير إكسل (${timeframe.toUpperCase()})` : `Export Excel Reports (${timeframe.toUpperCase()})`}
            </h3>
            <p className={`text-xs font-semibold mb-6 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
              {isRTL ? "تنزيل جداول إكسل منسقة لأنواع مستخدمين محددين." : "Download formatted Excel spreadsheets for specific user types."}
            </p>

            <div className="flex flex-col gap-4">
              {/* Option 1: Subscribed Users Report */}
              <button
                onClick={handleExportSubscribedExcel}
                className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all duration-300 text-start group cursor-pointer border ${
                  isLight 
                    ? 'bg-slate-50 hover:bg-emerald-50/50 border-emerald-200' 
                    : 'bg-[#121324] hover:bg-[#181a30] border-emerald-500/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
                    <FiGrid size={22} />
                  </div>
                  <div className="text-start">
                    <h4 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "تقرير إكسل للمستخدمين المشتركين" : "Subscribed Users Excel Report"}</h4>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                      {isRTL ? "الاسم، الهاتف، البريد، كود الكوبون، المواد، السعر، تاريخ التفعيل" : "Name, Phone, Email, Coupon Code, Courses, Price, Activation Date/Time"}
                    </p>
                  </div>
                </div>
                {isRTL ? (
                  <FiChevronLeft className="text-emerald-500 group-hover:-translate-x-1 transition-transform shrink-0" />
                ) : (
                  <FiChevronRight className="text-emerald-500 group-hover:translate-x-1 transition-transform shrink-0" />
                )}
              </button>

              {/* Option 2: Registered Non-Subscribed Users Report */}
              <button
                onClick={handleExportNonSubscribedExcel}
                className={`w-full rounded-2xl p-4 flex items-center justify-between transition-all duration-300 text-start group cursor-pointer border ${
                  isLight 
                    ? 'bg-slate-50 hover:bg-amber-50/50 border-amber-200' 
                    : 'bg-[#121324] hover:bg-[#181a30] border-amber-500/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0">
                    <FiUsers size={22} />
                  </div>
                  <div className="text-start">
                    <h4 className={`text-sm font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "تقرير إكسل للمستخدمين غير المشتركين" : "Non-Subscribed Users Excel Report"}</h4>
                    <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                      {isRTL ? "الاسم، الهاتف، البريد، تاريخ إنشاء الحساب" : "Name, Phone, Email, Account Registration Date"}
                    </p>
                  </div>
                </div>
                {isRTL ? (
                  <FiChevronLeft className="text-amber-500 group-hover:-translate-x-1 transition-transform shrink-0" />
                ) : (
                  <FiChevronRight className="text-amber-500 group-hover:translate-x-1 transition-transform shrink-0" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Date Picker Modal */}
      {isCustomDateOpen && (
        <div 
          className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => setIsCustomDateOpen(false)}
        >
          <div 
            className={`w-full max-w-sm border rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden text-start ${
              isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0c0d19] border-gray-800 text-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsCustomDateOpen(false)}
              className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-gray-500 hover:text-white'} transition-colors cursor-pointer`}
            >
              <FiX size={20} />
            </button>

            <h3 className={`text-xl font-black mb-4 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {isRTL ? "تحديد فترة تاريخ مخصصة" : "Select Custom Date Range"}
            </h3>

            <div className="flex flex-col gap-4 text-start">
              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{isRTL ? "من تاريخ" : "From Date"}</label>
                <input 
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={`w-full py-3 px-4 rounded-2xl text-sm font-semibold focus:outline-none border transition-colors ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-900 focus:border-red-500' : 'bg-[#07080e] border-gray-800 text-white focus:border-red-500/50'
                  } ${isRTL ? 'text-right' : 'text-left'}`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{isRTL ? "إلى تاريخ" : "To Date"}</label>
                <input 
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={`w-full py-3 px-4 rounded-2xl text-sm font-semibold focus:outline-none border transition-colors ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-900 focus:border-red-500' : 'bg-[#07080e] border-gray-800 text-white focus:border-red-500/50'
                  } ${isRTL ? 'text-right' : 'text-left'}`}
                />
              </div>

              <button
                onClick={() => {
                  if (!fromDate || !toDate) {
                    toast.error(isRTL ? 'يرجى تحديد تاريخي البداية والنهاية معا' : 'Please select both From and To dates');
                    return;
                  }
                  setIsCustomDateOpen(false);
                  dispatch(fetchReports({ type: activeTab, period: 'custom', from: fromDate, to: toDate }));
                  toast.success(isRTL ? 'تم تطبيق فلتر التاريخ المخصص!' : 'Custom date filter applied!');
                }}
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(239,68,68,0.3)] mt-2 cursor-pointer transition-all active:scale-95"
              >
                {isRTL ? "تطبيق الفترة المخصصة" : "Apply Custom Range"}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default Reports;
