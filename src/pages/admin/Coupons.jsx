import { useState, useEffect } from 'react';
import {
  FiTag,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiCopy,
  FiPlus,
  FiX,
  FiSearch,
  FiCreditCard,
  FiZap,
  FiKey,
  FiDownload,
  FiSlash,
  FiLayers,
  FiGift,
  FiDollarSign
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchCouponBatches, 
  createCouponBatch, 
  fetchCouponBatchDetail, 
  exportCouponBatchExcel, 
  cancelCoupon,
  fetchAllSubjects 
} from '../../redux/slices/adminSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { CouponsSkeleton } from '../../components/shared/SkeletonLoading';
import { useLanguage } from '../../context/LanguageContext';

const Coupons = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const { couponBatches, couponSummary, activeBatchDetail, subjects, isLoading } = useSelector((state) => state.admin);

  // Theme Awareness
  const [isLight, setIsLight] = useState(() => localStorage.getItem('theme') === 'light');

  useEffect(() => {
    const handleThemeChange = () => {
      setIsLight(localStorage.getItem('theme') === 'light');
    };
    window.addEventListener('themeChange', handleThemeChange);
    window.addEventListener('storage', handleThemeChange);
    const interval = setInterval(handleThemeChange, 500);
    return () => {
      window.removeEventListener('themeChange', handleThemeChange);
      window.removeEventListener('storage', handleThemeChange);
      clearInterval(interval);
    };
  }, []);

  // Search and view states
  const [searchQuery, setSearchQuery] = useState('');
  const [modalSearch, setModalSearch] = useState('');
  const [modalStatusFilter, setModalStatusFilter] = useState('all');
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isBatchDetailOpen, setIsBatchDetailOpen] = useState(false);

  // Form States for Batch Generation (Requirements 7 & 8)
  const [selectedCourseIds, setSelectedCourseIds] = useState([]);
  const [mainCourseSearch, setMainCourseSearch] = useState('');
  const [price, setPrice] = useState('');
  const [count, setCount] = useState('10');
  const [expiryDays, setExpiryDays] = useState('none');
  const [prefix, setPrefix] = useState('FM');
  const [isGenerating, setIsGenerating] = useState(false);

  // Optional Additional Courses (Bonus Courses) state (Requirement 8)
  const [enableBonusCourses, setEnableBonusCourses] = useState(false);
  const [selectedBonusCourseIds, setSelectedBonusCourseIds] = useState([]);
  const [bonusCourseSearch, setBonusCourseSearch] = useState('');

  const filteredMainSubjects = (subjects || []).filter(s =>
    s.name ? s.name.toLowerCase().includes(mainCourseSearch.toLowerCase()) : false
  );

  const filteredBonusSubjects = (subjects || []).filter(s =>
    s.name ? s.name.toLowerCase().includes(bonusCourseSearch.toLowerCase()) : false
  );

  useEffect(() => {
    dispatch(fetchCouponBatches());
    dispatch(fetchAllSubjects());
  }, [dispatch]);

  const [selectedBatchId, setSelectedBatchId] = useState(null);

  // Handle batch click to open detail drawer
  const handleOpenBatchDetail = (batchId) => {
    if (!batchId || batchId === 'null') {
      toast.error(isRTL ? 'لا يوجد معرف دفعة متاح لهذا السجل القديم.' : 'No batch ID available for this legacy record.');
      return;
    }
    setSelectedBatchId(batchId);
    setIsBatchDetailOpen(true);
    dispatch(fetchCouponBatchDetail(batchId));
  };

  // Export batch Excel
  const handleExportBatch = async (batchId) => {
    const toastId = toast.loading(isRTL ? 'جاري تصدير ملف إكسل للدفعة...' : 'Exporting Batch Excel file...');
    try {
      await dispatch(exportCouponBatchExcel(batchId)).unwrap();
      toast.dismiss(toastId);
      toast.success(isRTL ? 'تم تنزيل ملف إكسل للدفعة! 📊' : 'Batch Excel downloaded! 📊');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err || (isRTL ? 'فشل تصدير ملف إكسل للدفعة' : 'Failed to export batch Excel'));
    }
  };

  // Cancel coupon action (Requirement 9)
  const handleCancelCoupon = async (couponId) => {
    const toastId = toast.loading(isRTL ? 'جاري إلغاء الكوبون...' : 'Cancelling coupon...');
    try {
      await dispatch(cancelCoupon(couponId)).unwrap();
      toast.dismiss(toastId);
      toast.success(isRTL ? 'تم إلغاء الكوبون بنجاح!' : 'Coupon cancelled successfully!');
      if (activeBatchDetail?.batch?._id) {
        dispatch(fetchCouponBatchDetail(activeBatchDetail.batch._id));
      }
      dispatch(fetchCouponBatches());
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err || (isRTL ? 'فشل إلغاء الكوبون' : 'Failed to cancel coupon'));
    }
  };

  // Submit Generate Batch Form
  const handleGenerateBatchSubmit = async (e) => {
    e.preventDefault();

    if (selectedCourseIds.length === 0) {
      toast.error(isRTL ? 'يرجى اختيار مادة رئيسية واحدة على الأقل.' : 'Please select at least one main course.');
      return;
    }

    const priceNum = Number(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error(isRTL ? 'يرجى إدخال سعر كوبون صالحة.' : 'Please enter a valid coupon price.');
      return;
    }

    const countNum = Number(count);
    if (isNaN(countNum) || countNum <= 0) {
      toast.error(isRTL ? 'يرجى إدخال كمية صالحة.' : 'Please enter a valid count.');
      return;
    }

    const payload = {
      courseIds: selectedCourseIds,
      price: priceNum,
      count: countNum,
      prefix: prefix.trim() || 'FM',
      expiryDays: expiryDays !== 'none' ? Number(expiryDays) : undefined,
      bonusCourseIds: enableBonusCourses ? selectedBonusCourseIds : [],
    };

    const loadToast = toast.loading(isRTL ? 'جاري إنشاء دفعة الكوبونات...' : 'Generating prepaid coupon batch...');
    setIsGenerating(true);
    try {
      const res = await dispatch(createCouponBatch(payload)).unwrap();
      toast.dismiss(loadToast);
      toast.success(isRTL ? `تم إنشاء دفعة تحتوي على ${countNum} كوبون(ات)!` : `Generated batch of ${countNum} prepaid coupon(s)!`);
      
      // Auto export Excel
      if (res?.batch?._id) {
        dispatch(exportCouponBatchExcel(res.batch._id));
      }

      setIsGenerateModalOpen(false);
      // Reset Form
      setSelectedCourseIds([]);
      setPrice('');
      setCount('10');
      setExpiryDays('none');
      setEnableBonusCourses(false);
      setSelectedBonusCourseIds([]);
      dispatch(fetchCouponBatches());
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || (isRTL ? 'فشل إنشاء الدفعة' : 'Failed to generate batch'));
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success(isRTL ? `تم نسخ الكود "${text}" إلى الحافظة!` : `Copied code "${text}" to clipboard!`);
  };

  const isBlurred = isGenerateModalOpen || isBatchDetailOpen;

  if (isLoading && couponBatches.length === 0) {
    return (
      <DashboardLayout role="admin" activeTab="coupons" title={isRTL ? "نظام الكوبونات مسبقة الدفع" : "Prepaid Coupon System"} subtitle={isRTL ? "جاري التحميل..." : "Loading batches..."}>
        <CouponsSkeleton />
      </DashboardLayout>
    );
  }

  // Computed Summary stats from batches array
  const computedSummary = couponBatches.reduce((acc, b) => {
    acc.totalGenerated += b.generated ?? b.count ?? 0;
    acc.activatedCount += b.activated ?? b.activatedCount ?? 0;
    acc.notActivatedCount += b.notActivated ?? ((b.generated || 0) - (b.activated || 0)) ?? 0;
    acc.cancelledCount += b.cancelledOrExpired ?? 0;
    acc.totalSalesValue += b.activatedValue ?? ((b.activated || 0) * (b.price || 0));
    return acc;
  }, {
    totalGenerated: 0,
    activatedCount: 0,
    notActivatedCount: 0,
    cancelledCount: 0,
    totalSalesValue: 0
  });

  const summaryStats = couponSummary || computedSummary;

  return (
    <DashboardLayout
      role="admin"
      activeTab="coupons"
      title={t('admin.coupons.title')}
      subtitle={t('admin.coupons.subtitle')}
      isModalOpen={isBlurred}
      showBackButton={true}
      onBackClick={() => navigate('/admin/dashboard')}
    >
      <div className={`w-full flex flex-col px-3.5 sm:px-6 md:px-8 py-4 gap-5 animate-fade-in relative transition-all duration-300 ${isBlurred ? 'blur-sm pointer-events-none' : ''}`}>

        {/* Top Controls Section */}
        <div className="flex flex-col gap-4 shrink-0">
          
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
            <div className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center border shadow-sm transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0e101a] border-red-500/15'
            }`}>
              <span className={`text-xl sm:text-2xl font-black ${isLight ? 'text-red-500' : 'text-red-400'}`}>{summaryStats.totalGenerated || 0}</span>
              <span className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider mt-1 uppercase truncate max-w-full ${
                isLight ? 'text-slate-500' : 'text-gray-500'
              }`}>
                {t('admin.coupons.totalGenerated')}
              </span>
            </div>
            <div className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center border shadow-sm transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0e101a] border-emerald-500/15'
            }`}>
              <span className={`text-xl sm:text-2xl font-black ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>{summaryStats.activatedCount || 0}</span>
              <span className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider mt-1 uppercase truncate max-w-full ${
                isLight ? 'text-slate-500' : 'text-gray-500'
              }`}>
                {t('admin.coupons.activated')}
              </span>
            </div>
            <div className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center border shadow-sm transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0e101a] border-amber-500/15'
            }`}>
              <span className={`text-xl sm:text-2xl font-black ${isLight ? 'text-amber-600' : 'text-amber-400'}`}>{summaryStats.notActivatedCount || 0}</span>
              <span className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider mt-1 uppercase truncate max-w-full ${
                isLight ? 'text-slate-500' : 'text-gray-500'
              }`}>
                {t('admin.coupons.notActivated')}
              </span>
            </div>
            <div className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center border shadow-sm transition-colors ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0e101a] border-orange-500/15'
            }`}>
              <span className={`text-xl sm:text-2xl font-black ${isLight ? 'text-orange-600' : 'text-orange-400'}`}>{summaryStats.cancelledCount || 0}</span>
              <span className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider mt-1 uppercase truncate max-w-full ${
                isLight ? 'text-slate-500' : 'text-gray-500'
              }`}>
                {t('admin.coupons.cancelledExpired')}
              </span>
            </div>
            <div className={`p-3.5 sm:p-4 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center border shadow-sm transition-colors col-span-2 sm:col-span-1 ${
              isLight ? 'bg-white border-slate-200' : 'bg-[#0e101a] border-purple-500/15'
            }`}>
              <span className={`text-xl sm:text-2xl font-black ${isLight ? 'text-purple-600' : 'text-purple-400'}`}>${(summaryStats.totalSalesValue || 0).toLocaleString()}</span>
              <span className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider mt-1 uppercase truncate max-w-full ${
                isLight ? 'text-slate-500' : 'text-gray-500'
              }`}>
                {t('admin.coupons.salesValue')}
              </span>
            </div>
          </div>

          {/* Search & Header */}
          <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2 border-b pb-3 ${
            isLight ? 'border-slate-200' : 'border-gray-800/40'
          }`}>
            <div className="flex flex-col text-start">
              <span className={`text-sm font-extrabold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isRTL ? `تم إنشاء ${couponBatches.length} دفعة` : `${couponBatches.length} Batches Generated`}
              </span>
              <span className={`text-xs font-semibold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                {isRTL ? "تقوم الأكواد مسبقة الدفع بتفعيل المواد المختارة فوراً" : "Prepaid codes activate selected courses instantly"}
              </span>
            </div>

            <button
              onClick={() => setIsGenerateModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl text-xs font-black shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto shrink-0 active:scale-95"
            >
              <FiPlus size={16} />
              <span>{isRTL ? "إنشاء دفعة كوبونات" : "Generate Coupon Batch"}</span>
            </button>
          </div>
        </div>

        {/* Coupon Batches List */}
        <div className="w-full pb-12">
          {couponBatches.length === 0 ? (
            <div className={`p-12 text-center border rounded-3xl font-bold ${
              isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#0c0d19]/40 border-gray-800 text-gray-500'
            }`}>
              {isRTL ? "لم يتم إنشاء أي دفعات كوبونات بعد. انقر فوق \"إنشاء دفعة كوبونات\" لإنشاء واحدة." : "No coupon batches generated yet. Click \"Generate Coupon Batch\" to create one."}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {couponBatches.map((batch, idx) => {
                const batchDate = batch.createdAt ? new Date(batch.createdAt).toLocaleDateString(isRTL ? 'ar-EG' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                const mainCourseNames = batch.courses && batch.courses.length > 0 ? batch.courses.map(c => c.name).join(', ') : (isRTL ? 'مواد' : 'Courses');
                const batchIdDisplay = batch.batchId || batch._id || `BATCH-${idx + 1}`;
                const genCount = batch.generated ?? batch.count ?? 0;
                const actCount = batch.activated ?? batch.activatedCount ?? 0;
                const notActCount = batch.notActivated ?? (genCount - actCount);

                const actualBatchId = batch._id || batch.batchId;

                return (
                  <div
                    key={batch._id || batch.batchId || idx}
                    className={`p-5 border rounded-3xl shadow-sm flex flex-col gap-4 relative overflow-hidden transition-all duration-300 text-start ${
                      isLight 
                        ? 'bg-white border-slate-200 hover:border-slate-300 shadow-slate-100' 
                        : 'bg-[#0e101a] border-gray-800/80 hover:border-red-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shrink-0 border ${
                          isLight ? 'bg-amber-50 border-amber-200 text-amber-600' : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          <FiLayers size={22} />
                        </div>
                        <div className="text-start">
                          <h4 className={`text-base font-extrabold leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {isRTL ? `دفعة #${batchIdDisplay.toString().slice(-6)}` : `Batch #${batchIdDisplay.toString().slice(-6)}`}
                          </h4>
                          <span className={`text-xs font-semibold mt-1 block truncate max-w-[180px] ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{mainCourseNames}</span>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black border ${
                        isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                      }`}>
                        ${batch.price ?? 0} {isRTL ? '/ كود' : '/ code'}
                      </span>
                    </div>

                    {/* Progress details */}
                    <div className={`p-3 border rounded-2xl flex items-center justify-between text-xs font-semibold ${
                      isLight 
                        ? 'bg-slate-100 border-slate-200 text-slate-700' 
                        : 'bg-[#07080e] border-gray-800 text-gray-300'
                    }`}>
                      <div className="flex items-center gap-2">
                        <span className={`font-black ${isLight ? 'text-emerald-700' : 'text-emerald-400'}`}>{isRTL ? `${actCount} مفعل` : `${actCount} Activated`}</span>
                        <span className={isLight ? 'text-slate-400' : 'text-gray-600'}>•</span>
                        <span className={`font-bold ${isLight ? 'text-amber-700' : 'text-amber-400'}`}>{isRTL ? `${notActCount} متبقي` : `${notActCount} Remaining`}</span>
                      </div>
                      <span className={isLight ? 'text-slate-500' : 'text-gray-500'}>{batchDate}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleOpenBatchDetail(actualBatchId)}
                        className={`flex-1 py-2.5 border rounded-xl text-xs font-black transition-all cursor-pointer text-center ${
                          isLight 
                            ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600' 
                            : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400'
                        }`}
                      >
                        {isRTL ? "عرض كل الأكواد" : "View All Codes"}
                      </button>
                      {actualBatchId && (
                        <button
                          onClick={() => handleExportBatch(actualBatchId)}
                          className={`px-4 py-2.5 border rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                            isLight 
                              ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-700' 
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          <FiDownload size={14} />
                          {isRTL ? "إكسل" : "Excel"}
                        </button>
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

      {/* 1. Generate Batch Modal (Requirements 7 & 8) */}
      <AnimatePresence>
        {isGenerateModalOpen && (
          <div
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
            onClick={() => setIsGenerateModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-lg border rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden text-start transition-colors ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0c0d19] border-gray-800 text-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} ${isLight ? 'text-slate-400 hover:text-slate-700' : 'text-gray-500 hover:text-white'} transition-colors cursor-pointer`}
              >
                <FiX size={20} />
              </button>

              <h3 className={`text-xl font-black mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isRTL ? "إنشاء دفعة كوبونات مسبقة الدفع" : "Generate Prepaid Coupon Batch"}
              </h3>
              <p className={`text-xs font-semibold mb-5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                {isRTL ? "قم بإنشاء أكواد تفعيل للمواد المفردة أو المتعددة." : "Generate batch activation codes for single or multiple courses."}
              </p>

              <form onSubmit={handleGenerateBatchSubmit} className="flex flex-col gap-4">
                
                {/* Course Selection (Main Courses) - Searchable Multi-Select */}
                <div className="flex flex-col gap-2 text-start">
                  <div className="flex justify-between items-center">
                    <label className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                      {isRTL ? `اختر المادة/المواد الرئيسية (تم تحديد ${selectedCourseIds.length})` : `Select Main Course(s) (${selectedCourseIds.length} selected)`}
                    </label>
                  </div>
                  
                  {/* Search input field */}
                  <div className="relative">
                    <FiSearch className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-400'}`} size={15} />
                    <input
                      type="text"
                      placeholder={isRTL ? "البحث عن المواد بالإسم..." : "Search courses by name..."}
                      value={mainCourseSearch}
                      onChange={(e) => setMainCourseSearch(e.target.value)}
                      className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2.5 rounded-xl text-xs font-bold focus:outline-none border transition-colors ${
                        isLight ? 'bg-slate-100 border-slate-200 text-slate-900 focus:border-red-500' : 'bg-[#07080e] border-gray-800 text-white focus:border-red-500/50'
                      }`}
                    />
                  </div>

                  {/* Selected course chips */}
                  {selectedCourseIds.length > 0 && (
                    <div className={`flex flex-wrap gap-1.5 p-2 border rounded-xl max-h-24 overflow-y-auto ${
                      isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#07080e]/80 border-red-500/20'
                    }`}>
                      {selectedCourseIds.map((id) => {
                        const course = subjects?.find(s => s._id === id);
                        return (
                          <span key={id} className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold border ${
                            isLight ? 'bg-red-50 border-red-200 text-red-600' : 'bg-red-500/15 border-red-500/30 text-red-400'
                          }`}>
                            {course?.name || (isRTL ? 'مادة' : 'Course')}
                            <button
                              type="button"
                              onClick={() => setSelectedCourseIds(selectedCourseIds.filter(cId => cId !== id))}
                              className="hover:opacity-70 cursor-pointer"
                            >
                              <FiX size={13} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Scrollable Filtered Subjects List */}
                  <div className={`max-h-36 overflow-y-auto p-1.5 border rounded-2xl flex flex-col gap-1 ${
                    isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#07080e] border-gray-800'
                  }`}>
                    {filteredMainSubjects.length === 0 ? (
                      <span className={`p-3 text-xs font-semibold text-center ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                        {isRTL ? `لا توجد مواد تطابق "${mainCourseSearch}"` : `No courses found matching "${mainCourseSearch}"`}
                      </span>
                    ) : (
                      filteredMainSubjects.map((s) => {
                        const isSelected = selectedCourseIds.includes(s._id);
                        return (
                          <button
                            key={s._id}
                            type="button"
                            onClick={() => {
                              if (isSelected) {
                                setSelectedCourseIds(selectedCourseIds.filter(id => id !== s._id));
                              } else {
                                setSelectedCourseIds([...selectedCourseIds, s._id]);
                              }
                            }}
                            className={`w-full p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                              isSelected
                                ? (isLight ? 'border-red-500 bg-red-50 text-red-600' : 'border-red-500 bg-red-500/10 text-red-400')
                                : (isLight ? 'border-slate-200 text-slate-700 hover:bg-slate-200' : 'border-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-800/40')
                            }`}
                          >
                            <span>{s.name}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                              isSelected 
                                ? (isLight ? 'bg-red-100 text-red-600' : 'bg-red-500/20 text-red-400') 
                                : (isLight ? 'bg-slate-200 text-slate-500' : 'bg-gray-800 text-gray-500')
                            }`}>
                              {isSelected ? (isRTL ? 'محدد ✓' : 'Selected ✓') : (isRTL ? '+ تحديد' : '+ Select')}
                            </span>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Price and Quantity Count */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5 text-start">
                    <label className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{isRTL ? "سعر الكوبون ($)" : "Coupon Price ($)"}</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={isRTL ? "مثال: 50" : "e.g. 50"}
                      className={`w-full p-3 rounded-2xl text-sm font-bold focus:outline-none border transition-colors ${
                        isLight ? 'bg-slate-100 border-slate-200 text-slate-900 focus:border-red-500' : 'bg-[#07080e] border-gray-800 text-white focus:border-red-500/50'
                      } ${isRTL ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-start">
                    <label className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{isRTL ? "الكمية (العدد)" : "Quantity (Count)"}</label>
                    <input
                      type="number"
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                      placeholder="e.g. 10, 100, 1000"
                      className={`w-full p-3 rounded-2xl text-sm font-bold focus:outline-none border transition-colors ${
                        isLight ? 'bg-slate-100 border-slate-200 text-slate-900 focus:border-red-500' : 'bg-[#07080e] border-gray-800 text-white focus:border-red-500/50'
                      } ${isRTL ? 'text-right' : 'text-left'}`}
                    />
                  </div>
                </div>

                {/* Expiry Days Option */}
                <div className="flex flex-col gap-1.5 text-start">
                  <label className={`text-xs font-bold uppercase tracking-wider ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{isRTL ? "أيام الصلاحية (اختياري)" : "Expiry Days (Optional)"}</label>
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className={`w-full p-3 rounded-2xl text-xs font-bold focus:outline-none cursor-pointer border transition-colors ${
                      isLight ? 'bg-slate-100 border-slate-200 text-slate-900' : 'bg-[#07080e] border-gray-800 text-white'
                    } ${isRTL ? 'text-right' : 'text-left'}`}
                  >
                    <option value="none">{isRTL ? "بلا صلاحية (لا ينتهي أبداً)" : "No Expiry (Never Expires)"}</option>
                    <option value="30">{isRTL ? "30 يوماً" : "30 Days"}</option>
                    <option value="60">{isRTL ? "60 يوماً" : "60 Days"}</option>
                    <option value="90">{isRTL ? "90 يوماً" : "90 Days"}</option>
                    <option value="180">{isRTL ? "180 يوماً" : "180 Days"}</option>
                    <option value="365">{isRTL ? "365 يوماً" : "365 Days"}</option>
                  </select>
                </div>

                {/* Requirement 8: Optional Additional Courses (Bonus Courses) */}
                <div className={`p-4 border rounded-2xl flex flex-col gap-3 text-start ${
                  isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#07080e]/60 border-gray-800/80'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiGift className={isLight ? 'text-amber-600' : 'text-amber-400'} size={16} />
                      <span className={`text-xs font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>{isRTL ? "مواد إضافية تلقائية (مواد مجانية)" : "Automatic Additional Courses (Bonus Courses)"}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={enableBonusCourses}
                        onChange={() => setEnableBonusCourses(!enableBonusCourses)}
                      />
                      <div className={`w-10 h-5 ${isLight ? 'bg-slate-300' : 'bg-gray-800'} peer-focus:outline-none rounded-full peer peer-checked:after:${isRTL ? '-translate-x-full' : 'translate-x-full'} peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:${isRTL ? 'right-[2px]' : 'left-[2px]'} after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500`} />
                    </label>
                  </div>
                  
                  {enableBonusCourses && (
                    <div className="flex flex-col gap-2 mt-1">
                      <span className={`text-[11px] font-semibold ${isLight ? 'text-amber-700' : 'text-amber-400/90'}`}>
                        {isRTL ? "اختر 1 أو 2 من المواد الإضافية التي تمنح تلقائياً عند تفعيل الكود:" : "Select 1 or 2 bonus courses automatically granted upon code activation:"}
                      </span>

                      {/* Search bonus courses input */}
                      <div className="relative">
                        <FiSearch className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-400'}`} size={13} />
                        <input
                          type="text"
                          placeholder={isRTL ? "البحث عن مواد إضافية..." : "Search bonus courses..."}
                          value={bonusCourseSearch}
                          onChange={(e) => setBonusCourseSearch(e.target.value)}
                          className={`w-full ${isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'} py-2 rounded-xl text-xs font-bold focus:outline-none border ${
                            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0c0d19] border-amber-500/20 text-white'
                          }`}
                        />
                      </div>

                      {/* Selected bonus chips */}
                      {selectedBonusCourseIds.length > 0 && (
                        <div className={`flex flex-wrap gap-1.5 p-2 border rounded-xl ${
                          isLight ? 'bg-white border-slate-200' : 'bg-[#0c0d19]/80 border-amber-500/20'
                        }`}>
                          {selectedBonusCourseIds.map((id) => {
                            const course = subjects?.find(s => s._id === id);
                            return (
                              <span key={id} className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-xs font-extrabold border ${
                                isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                              }`}>
                                {course?.name || (isRTL ? 'مادة' : 'Course')}
                                <button
                                  type="button"
                                  onClick={() => setSelectedBonusCourseIds(selectedBonusCourseIds.filter(cId => cId !== id))}
                                  className="hover:opacity-70 cursor-pointer"
                                >
                                  <FiX size={12} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Scrollable Bonus Courses List */}
                      <div className={`max-h-28 overflow-y-auto p-1 border rounded-xl flex flex-col gap-1 ${
                        isLight ? 'bg-white border-slate-200' : 'bg-[#0c0d19] border-amber-500/20'
                      }`}>
                        {filteredBonusSubjects.length === 0 ? (
                          <span className={`p-2 text-xs font-semibold text-center ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                            {isRTL ? "لم يتم العثور على مواد إضافية" : "No bonus courses found"}
                          </span>
                        ) : (
                          filteredBonusSubjects.map((s) => {
                            const isSelected = selectedBonusCourseIds.includes(s._id);
                            return (
                              <button
                                key={s._id}
                                type="button"
                                onClick={() => {
                                  if (isSelected) {
                                    setSelectedBonusCourseIds(selectedBonusCourseIds.filter(id => id !== s._id));
                                  } else {
                                    if (selectedBonusCourseIds.length >= 2) {
                                      toast.error(isRTL ? 'يُسمح بـ 2 مواد إضافية كحد أقصى.' : 'Maximum 2 bonus courses allowed.');
                                      return;
                                    }
                                    setSelectedBonusCourseIds([...selectedBonusCourseIds, s._id]);
                                  }
                                }}
                                className={`w-full p-2 rounded-lg border text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer ${
                                  isSelected
                                    ? (isLight ? 'border-amber-500 bg-amber-50 text-amber-700' : 'border-amber-500 bg-amber-500/10 text-amber-400')
                                    : (isLight ? 'border-slate-200 text-slate-700 hover:bg-slate-100' : 'border-gray-800 text-gray-400 hover:text-white')
                                }`}
                              >
                                <span>{s.name}</span>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                  isSelected 
                                    ? (isLight ? 'bg-amber-100 text-amber-700' : 'bg-amber-500/20 text-amber-400') 
                                    : (isLight ? 'bg-slate-100 text-slate-500' : 'bg-gray-800 text-gray-500')
                                }`}>
                                  {isSelected ? (isRTL ? 'محدد ✓' : 'Selected ✓') : (isRTL ? '+ تحديد' : '+ Select')}
                                </span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className="w-full py-4 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl font-black text-sm shadow-[0_4px_25px_rgba(239,68,68,0.4)] transition-all cursor-pointer disabled:opacity-50 mt-2"
                >
                  {isGenerating ? (isRTL ? 'جاري إنشاء الدفعة وملف الإكسل...' : 'Generating Batch & Excel...') : (isRTL ? 'إنشاء دفعة الكوبونات' : 'Generate Coupon Batch')}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. Batch Detail Modal (Requirement 9) */}
      <AnimatePresence>
        {isBatchDetailOpen && (
          <div
            className="fixed inset-0 bg-[#020205]/75 backdrop-blur-md z-50 flex items-center justify-center p-3.5 sm:p-4 transition-all duration-300"
            onClick={() => {
              setIsBatchDetailOpen(false);
              setModalSearch('');
              setModalStatusFilter('all');
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-2xl border rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 shadow-2xl relative overflow-hidden text-start max-h-[90vh] flex flex-col gap-4 transition-colors ${
                isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0c0d19] border-gray-800 text-white'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setIsBatchDetailOpen(false);
                  setModalSearch('');
                  setModalStatusFilter('all');
                }}
                className={`absolute top-5 ${isRTL ? 'left-5' : 'right-5'} p-2 rounded-xl transition-colors cursor-pointer z-10 ${
                  isLight ? 'text-slate-400 hover:text-slate-700 hover:bg-slate-100' : 'text-gray-500 hover:text-white hover:bg-gray-800'
                }`}
              >
                <FiX size={18} />
              </button>

              {!activeBatchDetail ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className={`text-sm font-bold ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{isRTL ? "جاري تحميل تفاصيل الدفعة..." : "Loading batch details..."}</span>
                </div>
              ) : (() => {
                const currentBatchId = selectedBatchId || activeBatchDetail?.batch?._id || activeBatchDetail?.coupons?.[0]?.batchId;
                const currentBatchPrice = activeBatchDetail?.batch?.price ?? activeBatchDetail?.coupons?.[0]?.price ?? 0;

                const allCoupons = activeBatchDetail?.coupons || [];

                const actCount = allCoupons.filter(c => {
                  const s = (c.status || '').toLowerCase();
                  return s === 'activated' || s === 'active' || s === 'used';
                }).length;

                const notActCount = allCoupons.filter(c => {
                  const s = (c.status || '').toLowerCase();
                  return s === 'not_activated' || s === 'not activated' || s === 'pending';
                }).length;

                const cancelledCount = allCoupons.filter(c => {
                  const s = (c.status || '').toLowerCase();
                  return s === 'cancelled' || s === 'expired';
                }).length;

                const filteredCoupons = allCoupons.filter(c => {
                  const statusLower = (c.status || '').toLowerCase();
                  const isAct = statusLower === 'activated' || statusLower === 'active' || statusLower === 'used';
                  const isNotAct = statusLower === 'not_activated' || statusLower === 'not activated' || statusLower === 'pending';
                  const isCanc = statusLower === 'cancelled' || statusLower === 'expired';

                  if (modalStatusFilter === 'activated' && !isAct) return false;
                  if (modalStatusFilter === 'not_activated' && !isNotAct) return false;
                  if (modalStatusFilter === 'cancelled' && !isCanc) return false;

                  if (!modalSearch.trim()) return true;
                  const q = modalSearch.toLowerCase();
                  const codeMatch = c.code ? c.code.toLowerCase().includes(q) : false;
                  const userMatch = (c.activatedBy?.name || c.activatedBy?.email || c.usedBy?.name || '').toLowerCase().includes(q);
                  const statusMatch = (c.status || '').toLowerCase().includes(q);
                  return codeMatch || userMatch || statusMatch;
                });

                const displayCoupons = [...filteredCoupons].sort((a, b) => {
                  const aAct = ['activated', 'active', 'used'].includes((a.status || '').toLowerCase());
                  const bAct = ['activated', 'active', 'used'].includes((b.status || '').toLowerCase());
                  if (aAct && !bAct) return -1;
                  if (!aAct && bAct) return 1;
                  return 0;
                });
                
                return (
                <>
                  {/* Modal Header */}
                  <div className="flex flex-col gap-3 pt-1 border-b pb-3 border-slate-200 dark:border-gray-800/60">
                    <div className={`flex items-start justify-between ${isRTL ? 'pl-8' : 'pr-8'}`}>
                      <div className="text-start">
                        <div className="flex items-center gap-2">
                          <h3 className={`text-lg sm:text-xl font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                            {isRTL 
                              ? `أكواد الدفعة (#${currentBatchId ? currentBatchId.slice(-6) : 'التفاصيل'})`
                              : `Batch Codes (#${currentBatchId ? currentBatchId.slice(-6) : 'Detail'})`
                            }
                          </h3>
                        </div>
                        <p className={`text-xs font-semibold mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                          {isRTL 
                            ? `السعر: $${currentBatchPrice} | ${allCoupons.length} إجمالي الأكواد` 
                            : `Price: $${currentBatchPrice} | ${allCoupons.length} Total Codes`
                          }
                        </p>
                      </div>
                    </div>

                    {/* Search & Export Toolbar */}
                    <div className="flex items-center gap-2.5 pt-1">
                      <div className="relative flex-1">
                        <FiSearch className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-400'}`} size={14} />
                        <input
                          type="text"
                          placeholder={isRTL ? "البحث برقم الكود أو التفعيل..." : "Search code or user..."}
                          value={modalSearch}
                          onChange={(e) => setModalSearch(e.target.value)}
                          className={`w-full ${isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'} py-2 rounded-xl text-xs font-bold focus:outline-none border transition-colors ${
                            isLight ? 'bg-slate-100 border-slate-200 text-slate-900 focus:border-red-500' : 'bg-[#07080e] border-gray-800 text-white focus:border-red-500/50'
                          }`}
                        />
                        {modalSearch && (
                          <button
                            onClick={() => setModalSearch('')}
                            className={`absolute ${isRTL ? 'left-2.5' : 'right-2.5'} top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-500'} hover:opacity-75 cursor-pointer`}
                          >
                            <FiX size={13} />
                          </button>
                        )}
                      </div>

                      {currentBatchId && (
                        <button
                          onClick={() => handleExportBatch(currentBatchId)}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
                        >
                          <FiDownload size={14} />
                          <span>{isRTL ? "إكسل" : "Excel"}</span>
                        </button>
                      )}
                    </div>

                    {/* Status Filter Tabs in Modal */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-1 pb-0.5 text-[11px] sm:text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setModalStatusFilter('all')}
                        className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap ${
                          modalStatusFilter === 'all'
                            ? (isLight ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-red-600 text-white border-red-600')
                            : (isLight ? 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200' : 'bg-gray-800/80 border-gray-700 text-gray-400 hover:text-white')
                        }`}
                      >
                        {isRTL ? `الكل (${allCoupons.length})` : `All (${allCoupons.length})`}
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalStatusFilter('activated')}
                        className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                          modalStatusFilter === 'activated'
                            ? (isLight ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm' : 'bg-emerald-500 text-white border-emerald-500')
                            : (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20')
                        }`}
                      >
                        <FiCheckCircle size={11} />
                        {isRTL ? `المفعلة (${actCount})` : `Activated (${actCount})`}
                      </button>

                      <button
                        type="button"
                        onClick={() => setModalStatusFilter('not_activated')}
                        className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                          modalStatusFilter === 'not_activated'
                            ? (isLight ? 'bg-amber-600 text-white border-amber-600 shadow-sm' : 'bg-amber-500 text-white border-amber-500')
                            : (isLight ? 'bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100' : 'bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20')
                        }`}
                      >
                        <FiClock size={11} />
                        {isRTL ? `المتبقية (${notActCount})` : `Not Activated (${notActCount})`}
                      </button>

                      {cancelledCount > 0 && (
                        <button
                          type="button"
                          onClick={() => setModalStatusFilter('cancelled')}
                          className={`px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer whitespace-nowrap flex items-center gap-1 ${
                            modalStatusFilter === 'cancelled'
                              ? (isLight ? 'bg-red-600 text-white border-red-600 shadow-sm' : 'bg-red-500 text-white border-red-500')
                              : (isLight ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' : 'bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20')
                          }`}
                        >
                          <FiSlash size={11} />
                          {isRTL ? `الملغية (${cancelledCount})` : `Cancelled (${cancelledCount})`}
                        </button>
                      )}
                    </div>
                  </div>

              {/* Codes list */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-2.5">
                {displayCoupons.length === 0 ? (
                  <div className={`p-8 text-center text-xs font-bold rounded-2xl border ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#07080e] border-gray-800 text-gray-400'
                  }`}>
                    {isRTL ? `لا توجد أكواد تطابق الخيارات المحددة` : `No codes matching selected filter`}
                  </div>
                ) : (
                  displayCoupons.map((c) => {
                    const statusLower = (c.status || '').toLowerCase();
                    const isActivated = statusLower === 'activated';
                    const isCancelled = statusLower === 'cancelled';
                    const isExpired = statusLower === 'expired';
                    const actDate = c.activatedAt ? new Date(c.activatedAt).toLocaleString(isRTL ? 'ar-EG' : 'en-US') : '';
                    const actUser = c.activatedBy?.name || c.activatedBy?.email || c.usedBy?.name || c.usedBy?.email || (isRTL ? 'طالب' : 'Student');

                    const getStatusBadgeText = (status) => {
                      const s = (status || '').toLowerCase();
                      if (s === 'activated') return isRTL ? 'مفعل' : 'Activated';
                      if (s === 'cancelled') return isRTL ? 'ملغي' : 'Cancelled';
                      if (s === 'expired') return isRTL ? 'منتهي الصلاحية' : 'Expired';
                      return isRTL ? 'غير مفعل' : 'Not Activated';
                    };

                    return (
                      <div key={c._id} className={`p-3.5 border rounded-2xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-start transition-all ${
                        isLight ? 'bg-slate-50/70 border-slate-200/90 hover:border-slate-300' : 'bg-[#07080e] border-gray-800/90 hover:border-gray-700'
                      }`}>
                        {/* Code & Status Badge Row */}
                        <div className="flex items-center justify-between sm:justify-start gap-3">
                          {/* Monospace Code Pill */}
                          <div className={`font-mono font-black text-xs sm:text-sm px-3 py-1.5 rounded-xl border flex items-center gap-2 tracking-wider ${
                            isLight ? 'bg-slate-900 text-amber-300 border-slate-800 shadow-sm' : 'bg-slate-900 text-amber-400 border-amber-500/30'
                          }`}>
                            <FiKey size={13} className="text-amber-400 shrink-0" />
                            <span>{c.code}</span>
                          </div>

                          {/* Status Badge */}
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1 shrink-0 ${
                            isActivated ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400') :
                            isCancelled ? (isLight ? 'bg-red-50 border-red-200 text-red-700' : 'bg-red-500/10 border-red-500/20 text-red-400') :
                            isExpired ? (isLight ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-orange-500/10 border-orange-500/20 text-orange-400') :
                            (isLight ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-amber-500/10 border-amber-500/20 text-amber-400')
                          }`}>
                            {isActivated ? <FiCheckCircle size={11} /> : isCancelled ? <FiSlash size={11} /> : <FiClock size={11} />}
                            {getStatusBadgeText(c.status)}
                          </span>
                        </div>

                        {/* Actions or Activated Info Row */}
                        {isActivated ? (
                          <div className={`text-xs font-semibold flex flex-row sm:flex-col items-center sm:items-end justify-between pt-1 sm:pt-0 border-t sm:border-0 ${
                            isLight ? 'border-slate-200 text-slate-600' : 'border-gray-800 text-gray-400'
                          }`}>
                            <div className="flex items-center gap-1.5">
                              <FiUser size={12} className={isLight ? 'text-slate-400' : 'text-gray-500'} />
                              <span>{isRTL ? "مفعل بواسطة:" : "By:"} <strong className={isLight ? 'text-slate-900' : 'text-white'}>{actUser}</strong></span>
                            </div>
                            <span className={`text-[10px] ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>{actDate}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 justify-end pt-1 sm:pt-0 border-t sm:border-0 border-slate-200/60 dark:border-gray-800/60">
                            {/* Copy button */}
                            <button
                              onClick={() => copyToClipboard(c.code)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 border active:scale-95 ${
                                isLight 
                                  ? 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-sm' 
                                  : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200'
                              }`}
                            >
                              <FiCopy size={13} />
                              <span>{isRTL ? "نسخ" : "Copy"}</span>
                            </button>

                            {/* Cancel code button */}
                            {!isCancelled && !isExpired && (
                              <button
                                onClick={() => handleCancelCoupon(c._id)}
                                className={`px-3 py-1.5 border rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                                  isLight 
                                    ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-600' 
                                    : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 text-red-400'
                                }`}
                              >
                                <FiSlash size={13} />
                                <span>{isRTL ? "إلغاء الكود" : "Cancel"}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
                </>
                );
              })()}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default Coupons;
