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
  FiShare2,
  FiTag,
  FiTrendingUp,
  FiCalendar,
  FiX
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

  // Fetch reports when timeframe changes
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
      toast.success(isRTL ? 'تم تنزيل تقرير إكسل للمستخدمين المشتركين!' : 'Subscribed Users Excel Report downloaded!');
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
      toast.success(isRTL ? 'تم تنزيل تقرير إكسل للمستخدمين غير المشتركين!' : 'Non-Subscribed Users Excel Report downloaded!');
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
        subtitle={isRTL ? "جاري تحيل التحليلات..." : "Loading analytics..."}
      >
        <ReportsSkeleton />
      </DashboardLayout>
    );
  }

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
                      : 'bg-gray-950/40 hover:bg-gray-800/40 border border-gray-800 text-gray-400 hover:text-gray-200'
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
            <div className="flex items-center justify-between p-3 bg-[#0c0d19] border border-amber-500/20 rounded-2xl text-xs text-amber-400 font-bold text-start">
              <span className="flex items-center gap-2">
                <FiCalendar /> {isRTL ? `الفترة المحددة: من ${fromDate || 'تاريخ البداية'} إلى ${toDate || 'تاريخ النهاية'}` : `Selected Range: ${fromDate || 'Start Date'} to ${toDate || 'End Date'}`}
              </span>
              <button 
                onClick={() => setIsCustomDateOpen(true)} 
                className="underline text-white hover:text-amber-300 cursor-pointer"
              >
                {isRTL ? "تغيير التواريخ" : "Change Dates"}
              </button>
            </div>
          )}

          {/* Segmented controls Overview vs Users */}
          <div className="grid grid-cols-2 p-1 sm:p-1.5 bg-[#0c0d19]/80 border border-gray-800/50 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center justify-center gap-2 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.25)]'
                  : 'text-gray-400 hover:text-gray-200'
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
                  : 'text-gray-400 hover:text-gray-200'
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
                <div className="p-3.5 sm:p-5 bg-[#0c0d19]/40 border border-gray-800/80 hover:border-emerald-500/25 rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4 relative overflow-hidden transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <FiUsers className="text-lg sm:text-2xl" />
                  </div>
                  <div className="flex flex-col text-start">
                    <span className="text-xl sm:text-2xl font-black text-emerald-400 leading-tight">
                      {reportsData.overview?.newStudents || 0}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mt-1 truncate">
                      {t('admin.reports.newRegistered')}
                    </span>
                  </div>
                </div>

                {/* Card 2: Subscribed Users */}
                <div className="p-3.5 sm:p-5 bg-[#0c0d19]/40 border border-gray-800/80 hover:border-blue-500/25 rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4 relative overflow-hidden transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <FiAward className="text-lg sm:text-2xl" />
                  </div>
                  <div className="flex flex-col text-start">
                    <span className="text-xl sm:text-2xl font-black text-blue-400 leading-tight">
                      {reportsData.overview?.subscribedStudents || 0}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mt-1 truncate">
                      {isRTL ? "مستخدمون مشتركون" : "Subscribed Users"}
                    </span>
                  </div>
                </div>

                {/* Card 3: Exams Completed */}
                <div className="p-3.5 sm:p-5 bg-[#0c0d19]/40 border border-gray-800/80 hover:border-cyan-500/25 rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4 relative overflow-hidden transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    <FiFileText className="text-lg sm:text-2xl" />
                  </div>
                  <div className="flex flex-col text-start">
                    <span className="text-xl sm:text-2xl font-black text-cyan-400 leading-tight">
                      {reportsData.overview?.completedExams || 0}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mt-1 truncate">
                      {isRTL ? "امتحانات مكتملة" : "Exams Completed"}
                    </span>
                  </div>
                </div>

                {/* Card 4: Coupons Redeemed */}
                <div className="p-3.5 sm:p-5 bg-[#0c0d19]/40 border border-gray-800/80 hover:border-yellow-500/25 rounded-2xl sm:rounded-3xl flex flex-col gap-3 sm:gap-4 relative overflow-hidden transition-all duration-300">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                    <FiTag className="text-lg sm:text-2xl" />
                  </div>
                  <div className="flex flex-col text-start">
                    <span className="text-xl sm:text-2xl font-black text-yellow-400 leading-tight">
                      {reportsData.overview?.couponsUsed || 0}
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mt-1 truncate">
                      {isRTL ? "كوبونات مفعلة" : "Coupons Activated"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Performance Section */}
              <div className="p-6 bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl shadow-lg flex flex-col gap-5 text-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                    <FiTrendingUp size={18} />
                  </div>
                  <h3 className="text-base font-extrabold text-white">{isRTL ? "أداء المواد" : "Course Performance"}</h3>
                </div>

                {(!reportsData.subjectPerformance || reportsData.subjectPerformance.length === 0) ? (
                  <div className="py-8 text-center border border-dashed border-gray-800 rounded-2xl">
                    <span className="text-xs text-gray-500 font-semibold">{isRTL ? "لا توجد بيانات أداء للمواد بالفترة المحددة" : "No course performance data for selected period"}</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className={`w-full ${isRTL ? 'text-right' : 'text-left'} border-collapse`}>
                      <thead>
                        <tr className="border-b border-gray-800 text-xs font-bold text-gray-400">
                          <th className="py-3 px-4">{isRTL ? "المادة" : "Subject"}</th>
                          <th className="py-3 px-4">{isRTL ? "المحاولات" : "Attempts"}</th>
                          <th className="py-3 px-4">{isRTL ? "متوسط الدرجات" : "Average Score"}</th>
                          <th className="py-3 px-4">{isRTL ? "نسبة النجاح" : "Pass Rate"}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800/50 text-xs font-semibold">
                        {reportsData.subjectPerformance.map((item, idx) => (
                          <tr key={idx} className="hover:bg-gray-850/20 text-gray-300">
                            <td className="py-3.5 px-4 font-bold text-white capitalize">{item.subjectName}</td>
                            <td className="py-3.5 px-4">{item.totalAttempts}</td>
                            <td className="py-3.5 px-4 text-yellow-400 font-extrabold">{item.avgScore}%</td>
                            <td className="py-3.5 px-4 text-emerald-400 font-black">{item.passRate}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
                { label: isRTL ? 'الطلاب' : 'Students', count: studentData.count, percentage: Math.round((studentData.count / totalCount) * 100), icon: FiAward, iconBg: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400', barBg: 'bg-emerald-500', textColor: 'text-emerald-400' },
                { label: isRTL ? 'المعلمون' : 'Teachers', count: teacherData.count, percentage: Math.round((teacherData.count / totalCount) * 100), icon: FiTv, iconBg: 'bg-blue-500/10 border border-blue-500/20 text-blue-400', barBg: 'bg-blue-500', textColor: 'text-blue-400' },
                { label: isRTL ? 'أولياء الأمور' : 'Parents', count: parentData.count, percentage: Math.round((parentData.count / totalCount) * 100), icon: FiUsers, iconBg: 'bg-purple-500/10 border border-purple-500/20 text-purple-400', barBg: 'bg-purple-500', textColor: 'text-purple-400' },
                { label: isRTL ? 'المسؤولون' : 'Admins', count: adminData.count, percentage: Math.round((adminData.count / totalCount) * 100), icon: FiShield, iconBg: 'bg-red-500/10 border border-red-500/20 text-red-400', barBg: 'bg-red-500', textColor: 'text-red-400' }
              ];

              return (
                <div className="flex flex-col gap-5">
                  <div className="p-6 bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl shadow-lg flex flex-col gap-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                        <FiPieChart size={18} />
                      </div>
                      <h3 className="text-base font-extrabold text-white">{isRTL ? "توزيع الأدوار" : "Role Distribution"}</h3>
                    </div>

                    <div className="flex flex-col gap-5">
                      {distribution.map((role, idx) => {
                        const Icon = role.icon;
                        return (
                          <div key={idx} className="flex flex-col gap-2">
                            <div className="flex justify-between items-center text-sm font-bold">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-xl ${role.iconBg} flex items-center justify-center`}>
                                  <Icon className="text-base" />
                                </div>
                                <span className="text-gray-300 font-bold">{role.label}</span>
                              </div>
                              <span className={`${role.textColor} font-black`}>
                                {role.count} ({role.percentage}%)
                              </span>
                            </div>
                            <div className="w-full h-2.5 bg-gray-950 rounded-full overflow-hidden border border-gray-800/80">
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
            className="w-full max-w-md bg-[#0c0d19] border border-gray-800 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsExportOpen(false)}
              className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-gray-500 hover:text-white transition-colors cursor-pointer`}
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-black text-white mb-2">
              {isRTL ? `تصدير تقارير إكسل (${timeframe.toUpperCase()})` : `Export Excel Reports (${timeframe.toUpperCase()})`}
            </h3>
            <p className="text-xs text-gray-400 font-semibold mb-6">
              {isRTL ? "تنزيل جداول إكسل منسقة لأنواع مستخدمين محددين." : "Download formatted Excel spreadsheets for specific user types."}
            </p>

            <div className="flex flex-col gap-4">
              {/* Option 1: Subscribed Users Report */}
              <button
                onClick={handleExportSubscribedExcel}
                className="w-full bg-[#121324] hover:bg-[#181a30] border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 text-start group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <FiGrid size={22} />
                  </div>
                  <div className="text-start">
                    <h4 className="text-sm font-black text-white">{isRTL ? "تقرير إكسل للمستخدمين المشتركين" : "Subscribed Users Excel Report"}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isRTL ? "الاسم، الهاتف، البريد، كود الكوبون، المواد، السعر، تاريخ التفعيل" : "Name, Phone, Email, Coupon Code, Courses, Price, Activation Date/Time"}
                    </p>
                  </div>
                </div>
                {isRTL ? (
                  <FiChevronLeft className="text-emerald-400 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <FiChevronRight className="text-emerald-400 group-hover:translate-x-1 transition-transform" />
                )}
              </button>

              {/* Option 2: Registered Non-Subscribed Users Report */}
              <button
                onClick={handleExportNonSubscribedExcel}
                className="w-full bg-[#121324] hover:bg-[#181a30] border border-amber-500/30 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 text-start group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <FiUsers size={22} />
                  </div>
                  <div className="text-start">
                    <h4 className="text-sm font-black text-white">{isRTL ? "تقرير إكسل للمستخدمين غير المشتركين" : "Non-Subscribed Users Excel Report"}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {isRTL ? "الاسم، الهاتف، البريد، تاريخ إنشاء الحساب" : "Name, Phone, Email, Account Registration Date"}
                    </p>
                  </div>
                </div>
                {isRTL ? (
                  <FiChevronLeft className="text-amber-400 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <FiChevronRight className="text-amber-400 group-hover:translate-x-1 transition-transform" />
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
            className="w-full max-w-sm bg-[#0c0d19] border border-gray-800 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setIsCustomDateOpen(false)}
              className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-gray-500 hover:text-white transition-colors cursor-pointer`}
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-black text-white mb-4">
              {isRTL ? "تحديد فترة تاريخ مخصصة" : "Select Custom Date Range"}
            </h3>

            <div className="flex flex-col gap-4 text-start">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">{isRTL ? "من تاريخ" : "From Date"}</label>
                <input 
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className={`w-full py-3 px-4 bg-[#07080e] border border-gray-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:border-red-500/50 ${isRTL ? 'text-right' : 'text-left'}`}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-bold text-gray-400">{isRTL ? "إلى تاريخ" : "To Date"}</label>
                <input 
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className={`w-full py-3 px-4 bg-[#07080e] border border-gray-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:border-red-500/50 ${isRTL ? 'text-right' : 'text-left'}`}
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
                className="w-full py-3.5 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl font-black shadow-[0_4px_20px_rgba(239,68,68,0.3)] mt-2 cursor-pointer"
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
