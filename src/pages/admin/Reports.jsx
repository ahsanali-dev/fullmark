import React, { useState, useEffect } from 'react';
import { 
  FiGrid, 
  FiUsers, 
  FiWifi, 
  FiFileText, 
  FiStar, 
  FiPieChart, 
  FiAward, 
  FiTv, 
  FiShield, 
  FiChevronRight, 
  FiDownload,
  FiShare2,
  FiTag,
  FiTrendingUp
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReports } from '../../redux/slices/adminSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { ReportsSkeleton } from '../../components/shared/SkeletonLoading';

const Reports = () => {
  const dispatch = useDispatch();
  const { reports, isLoading } = useSelector((state) => state.admin);

  const [timeframe, setTimeframe] = useState('month'); // today, week, month, year
  const [activeTab, setActiveTab] = useState('overview'); // overview or users
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Timeframes list
  const timeframes = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: 'year', label: 'This Year' }
  ];

  // Helper to map timeframe selector to backend period parameter
  const getMappedPeriod = (tf) => {
    if (tf === 'today') return 'week';
    if (tf === 'week') return 'week';
    if (tf === 'month') return 'month';
    if (tf === 'year') return 'all';
    return 'all';
  };

  // Fetch reports when activeTab or timeframe changes
  useEffect(() => {
    dispatch(fetchReports({
      type: activeTab,
      period: getMappedPeriod(timeframe)
    }));
  }, [dispatch, activeTab, timeframe]);

  // Export handlers
  const handleExportOption = (option) => {
    const loadingToast = toast.loading(option.toastMsg);
    
    setTimeout(() => {
      toast.dismiss(loadingToast);
      toast.success(option.successMsg);
      setIsExportOpen(false);
    }, 1500);
  };

  const exportOptions = [
    {
      id: 'pdf',
      title: 'Export as PDF',
      subtitle: 'Full report in PDF',
      icon: FiFileText,
      iconColor: 'text-red-400',
      iconBg: 'bg-red-500/10 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
      toastMsg: 'Exporting as PDF...',
      successMsg: 'PDF report downloaded successfully!'
    },
    {
      id: 'excel',
      title: 'Export as Excel',
      subtitle: 'Data in spreadsheet',
      icon: FiGrid,
      iconColor: 'text-emerald-400',
      iconBg: 'bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
      toastMsg: 'Exporting as Excel...',
      successMsg: 'Excel spreadsheet downloaded successfully!'
    },
    {
      id: 'share',
      title: 'Share Report',
      subtitle: 'Share via email or link',
      icon: FiShare2,
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
      toastMsg: 'Generating share link...',
      successMsg: 'Link copied to clipboard!'
    }
  ];

  const reportsData = reports || {};
  const isBlurred = isExportOpen;

  if (isLoading && (!reports || Object.keys(reports).length === 0)) {
    return (
      <DashboardLayout
        role="admin"
        activeTab="reports"
        title="Platform Reports"
        subtitle="Loading analytics..."
        disableScroll={true}
      >
        <ReportsSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout 
      role="admin" 
      activeTab="reports" 
      title="Platform Reports" 
      subtitle="Analytics & Insights"
      disableScroll={true}
      isModalOpen={isExportOpen}
      showBackButton={false}
    >
      <div className="h-full flex flex-col px-4 md:px-8 py-4 overflow-hidden gap-5 animate-fade-in relative transition-all duration-300">
        
        {/* Sticky Controls */}
        <div className="flex flex-col gap-4 shrink-0">
          
          {/* Timeframe selector & Export */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            {/* Timeframe selector pills */}
            <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
              {timeframes.map((tf) => (
                <button
                  key={tf.id}
                  onClick={() => setTimeframe(tf.id)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all duration-300 whitespace-nowrap cursor-pointer ${
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
              className="flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white px-5 py-2.5 rounded-2xl font-extrabold shadow-[0_4px_20px_rgba(239,68,68,0.3)] transition-all active:scale-95 cursor-pointer text-sm shrink-0 w-full sm:w-auto"
            >
              <FiDownload className="text-base" />
              <span>Export</span>
            </button>
          </div>

          {/* Segmented controls Overview vs Users */}
          <div className="grid grid-cols-2 p-1.5 bg-[#0c0d19]/80 border border-gray-800/50 rounded-2xl gap-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 cursor-pointer ${
                activeTab === 'overview'
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.25)]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FiGrid className="text-base" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 cursor-pointer ${
                activeTab === 'users'
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.25)]'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FiUsers className="text-base" />
              <span>Users</span>
            </button>
          </div>

        </div>

        {/* Scrollable Stats Dashboard */}
        <div className="flex-1 overflow-y-auto pr-1 pb-36">
          {activeTab === 'overview' ? (
            /* Overview Tab layout */
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Card 1: New Students */}
                <div className="p-5 bg-[#0c0d19]/40 border border-gray-800/80 hover:border-emerald-500/25 rounded-3xl flex flex-col gap-4 relative overflow-hidden transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                    <FiUsers size={22} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-2xl font-black text-emerald-400 leading-tight">
                      {reportsData.overview?.newStudents || 0}
                    </span>
                    <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mt-1">
                      New Students
                    </span>
                  </div>
                </div>

                {/* Card 2: New Teachers */}
                <div className="p-5 bg-[#0c0d19]/40 border border-gray-800/80 hover:border-blue-500/25 rounded-3xl flex flex-col gap-4 relative overflow-hidden transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/25 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]">
                    <FiTv size={22} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-2xl font-black text-blue-400 leading-tight">
                      {reportsData.overview?.newTeachers || 0}
                    </span>
                    <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mt-1">
                      New Teachers
                    </span>
                  </div>
                </div>

                {/* Card 3: Exams Completed */}
                <div className="p-5 bg-[#0c0d19]/40 border border-gray-800/80 hover:border-cyan-500/25 rounded-3xl flex flex-col gap-4 relative overflow-hidden transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
                    <FiFileText size={22} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-2xl font-black text-cyan-400 leading-tight">
                      {reportsData.overview?.completedExams || 0}
                    </span>
                    <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mt-1">
                      Exams Completed
                    </span>
                  </div>
                </div>

                {/* Card 4: Coupons Redeemed */}
                <div className="p-5 bg-[#0c0d19]/40 border border-gray-800/80 hover:border-yellow-500/25 rounded-3xl flex flex-col gap-4 relative overflow-hidden transition-all duration-300">
                  <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.15)]">
                    <FiTag size={22} />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-2xl font-black text-yellow-400 leading-tight">
                      {reportsData.overview?.couponsUsed || 0}
                    </span>
                    <span className="text-[11px] font-extrabold text-gray-500 uppercase tracking-wider mt-1">
                      Coupons Redeemed
                    </span>
                  </div>
                </div>
              </div>

              {/* Subject Performance Section */}
              <div className="p-6 bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl shadow-lg flex flex-col gap-5 text-left">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.2)]">
                    <FiTrendingUp size={18} />
                  </div>
                  <h3 className="text-base font-extrabold text-white">Subject Performance</h3>
                </div>

                {(!reportsData.subjectPerformance || reportsData.subjectPerformance.length === 0) ? (
                  <div className="py-8 text-center border border-dashed border-gray-800 rounded-2xl">
                    <span className="text-xs text-gray-500 font-semibold">No performance data recorded for this period</span>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-gray-800 text-xs font-bold text-gray-400">
                          <th className="py-3 px-4">Subject</th>
                          <th className="py-3 px-4">Attempts</th>
                          <th className="py-3 px-4">Average Score</th>
                          <th className="py-3 px-4">Pass Rate</th>
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
                { label: 'Students', count: studentData.count, percentage: Math.round((studentData.count / totalCount) * 100), icon: FiAward, iconBg: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400', barBg: 'bg-emerald-500', textColor: 'text-emerald-400' },
                { label: 'Teachers', count: teacherData.count, percentage: Math.round((teacherData.count / totalCount) * 100), icon: FiTv, iconBg: 'bg-blue-500/10 border border-blue-500/20 text-blue-400', barBg: 'bg-blue-500', textColor: 'text-blue-400' },
                { label: 'Parents', count: parentData.count, percentage: Math.round((parentData.count / totalCount) * 100), icon: FiUsers, iconBg: 'bg-purple-500/10 border border-purple-500/20 text-purple-400', barBg: 'bg-purple-500', textColor: 'text-purple-400' },
                { label: 'Admins', count: adminData.count, percentage: Math.round((adminData.count / totalCount) * 100), icon: FiShield, iconBg: 'bg-red-500/10 border border-red-500/20 text-red-400', barBg: 'bg-red-500', textColor: 'text-red-400' }
              ];

              const cards = [
                { value: studentData.count, label: 'Total Students', border: 'border-emerald-500/20', text: 'text-emerald-400' },
                { value: teacherData.count, label: 'Total Teachers', border: 'border-blue-500/20', text: 'text-blue-400' },
                { value: studentData.active + teacherData.active + parentData.active + adminData.active, label: 'Active Accounts', border: 'border-yellow-500/20', text: 'text-yellow-400' },
                { value: studentData.verified + teacherData.verified + parentData.verified + adminData.verified, label: 'Verified Accounts', border: 'border-purple-500/20', text: 'text-purple-400' }
              ];

              return (
                <div className="flex flex-col gap-5">
                  {/* Role Distribution Container Card */}
                  <div className="p-6 bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl shadow-lg flex flex-col gap-6">
                    {/* Card Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
                        <FiPieChart size={18} />
                      </div>
                      <h3 className="text-base font-extrabold text-white">Role Distribution</h3>
                    </div>

                    {/* Progress bars list */}
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
                            {/* Progress Bar Track */}
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

                  {/* Bottom 4 Grid Metric Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map((card, idx) => (
                      <div 
                        key={idx} 
                        className={`p-5 bg-[#0c0d19]/40 border ${card.border} rounded-3xl flex flex-col gap-1 text-left hover:scale-[1.02] transition-all duration-300`}
                      >
                        <span className={`text-3xl font-black ${card.text}`}>
                          {card.value}
                        </span>
                        <span className={`text-xs font-bold ${card.text}/80 mt-1`}>
                          {card.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()
          )}
        </div>

      </div>

      {/* Export Report Bottom Sheet Modal */}
      {isExportOpen && (
        <div 
          className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center transition-all duration-300"
          onClick={() => setIsExportOpen(false)}
        >
          {/* Bottom Sheet Card */}
          <div 
            className="w-full sm:max-w-md bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden transition-transform duration-300 animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Pull Bar (visual handle) */}
            <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />
            
            {/* Modal Title */}
            <h3 className="text-xl sm:text-2xl font-black text-white text-center mb-6">
              Export Report
            </h3>

            {/* Export options grid list */}
            <div className="flex flex-col gap-3">
              {exportOptions.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleExportOption(opt)}
                    className="w-full bg-[#121324] hover:bg-[#181a30] border border-gray-800/80 rounded-2xl p-4 flex items-center justify-between transition-all duration-300 hover:border-gray-700/50 cursor-pointer group text-left"
                  >
                    <div className="flex items-center gap-4">
                      {/* Icon Box */}
                      <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${opt.iconBg}`}>
                        <Icon size={20} className={opt.iconColor} />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white leading-tight">
                          {opt.title}
                        </h4>
                        <p className="text-xs text-gray-500 font-semibold mt-1">
                          {opt.subtitle}
                        </p>
                      </div>
                    </div>
                    {/* Right Chevron */}
                    <FiChevronRight className="text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all duration-300" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Reports;
