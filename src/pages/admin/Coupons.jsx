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

  // Search and view states
  const [searchQuery, setSearchQuery] = useState('');
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
  // Must NOT be enabled by default
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

  // Handle batch click to open detail drawer
  const handleOpenBatchDetail = (batchId) => {
    if (!batchId || batchId === 'null') {
      toast.error(isRTL ? 'لا يوجد معرف دفعة متاح لهذا السجل القديم.' : 'No batch ID available for this legacy record.');
      return;
    }
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
            <div className="p-3.5 sm:p-4 bg-[#0e101a] border border-red-500/15 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-xl sm:text-2xl font-black text-red-400">{summaryStats.totalGenerated || 0}</span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-gray-500 tracking-wider mt-1 uppercase truncate max-w-full">
                {t('admin.coupons.totalGenerated')}
              </span>
            </div>
            <div className="p-3.5 sm:p-4 bg-[#0e101a] border border-emerald-500/15 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-xl sm:text-2xl font-black text-emerald-400">{summaryStats.activatedCount || 0}</span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-gray-500 tracking-wider mt-1 uppercase truncate max-w-full">
                {t('admin.coupons.activated')}
              </span>
            </div>
            <div className="p-3.5 sm:p-4 bg-[#0e101a] border border-amber-500/15 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-xl sm:text-2xl font-black text-amber-400">{summaryStats.notActivatedCount || 0}</span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-gray-500 tracking-wider mt-1 uppercase truncate max-w-full">
                {t('admin.coupons.notActivated')}
              </span>
            </div>
            <div className="p-3.5 sm:p-4 bg-[#0e101a] border border-orange-500/15 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-xl sm:text-2xl font-black text-orange-400">{summaryStats.cancelledCount || 0}</span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-gray-500 tracking-wider mt-1 uppercase truncate max-w-full">
                {t('admin.coupons.cancelledExpired')}
              </span>
            </div>
            <div className="p-3.5 sm:p-4 bg-[#0e101a] border border-purple-500/15 rounded-2xl sm:rounded-3xl flex flex-col items-center justify-center text-center shadow-lg col-span-2 sm:col-span-1">
              <span className="text-xl sm:text-2xl font-black text-purple-400">${(summaryStats.totalSalesValue || 0).toLocaleString()}</span>
              <span className="text-[9px] sm:text-[10px] font-extrabold text-gray-500 tracking-wider mt-1 uppercase truncate max-w-full">
                {t('admin.coupons.salesValue')}
              </span>
            </div>
          </div>

          {/* Search & Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs font-bold text-gray-400 pt-2 border-b border-gray-800/40 pb-2 gap-1">
            <span>{isRTL ? `تم إنشاء ${couponBatches.length} دفعة` : `${couponBatches.length} Batches Generated`}</span>
            <span className="text-[11px] sm:text-xs text-gray-500">{isRTL ? "تقوم الأكواد مسبقة الدفع بتفعيل المواد المختارة فوراً" : "Prepaid codes activate selected courses instantly"}</span>
          </div>
        </div>

        {/* Coupon Batches List */}
        <div className="w-full pb-32">
          {couponBatches.length === 0 ? (
            <div className="p-12 text-center bg-[#0c0d19]/40 border border-gray-800 rounded-3xl text-gray-500 font-bold">
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
                    className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-3xl shadow-lg flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-red-500/30 text-start"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black shrink-0">
                          <FiLayers size={22} />
                        </div>
                        <div className="text-start">
                          <h4 className="text-base font-extrabold text-white leading-tight">
                            {isRTL ? `دفعة #${batchIdDisplay.toString().slice(-6)}` : `Batch #${batchIdDisplay.toString().slice(-6)}`}
                          </h4>
                          <span className="text-xs font-semibold text-gray-400 mt-1 block truncate max-w-[180px]">{mainCourseNames}</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black">
                        ${batch.price ?? 0} {isRTL ? '/ كود' : '/ code'}
                      </span>
                    </div>

                    {/* Progress details */}
                    <div className="p-3 bg-[#07080e] border border-gray-800 rounded-2xl flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-black">{isRTL ? `${actCount} مفعل` : `${actCount} Activated`}</span>
                        <span className="text-gray-600">•</span>
                        <span className="text-amber-400 font-bold">{isRTL ? `${notActCount} متبقي` : `${notActCount} Remaining`}</span>
                      </div>
                      <span className="text-gray-500">{batchDate}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handleOpenBatchDetail(actualBatchId)}
                        className="flex-1 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-black transition-all cursor-pointer text-center"
                      >
                        {isRTL ? "عرض كل الأكواد" : "View All Codes"}
                      </button>
                      {actualBatchId && (
                        <button
                          onClick={() => handleExportBatch(actualBatchId)}
                          className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
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

        {/* Floating Generate Coupon Button */}
        <div className={`fixed bottom-26 ${isRTL ? 'left-6 lg:left-10' : 'right-6 lg:right-10'} lg:bottom-10 z-30`}>
          <Button
            onClick={() => setIsGenerateModalOpen(true)}
            roleColor="admin"
            icon={FiPlus}
            className="w-auto h-auto px-5 py-3.5 !rounded-2xl shadow-[0_4px_25px_rgba(239,68,68,0.4)] cursor-pointer"
          >
            {isRTL ? "إنشاء دفعة كوبونات" : "Generate Coupon Batch"}
          </Button>
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
              className="w-full max-w-lg bg-[#0c0d19] border border-gray-800 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsGenerateModalOpen(false)}
                className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-gray-500 hover:text-white transition-colors cursor-pointer`}
              >
                <FiX size={20} />
              </button>

              <h3 className="text-xl font-black text-white mb-1">
                {isRTL ? "إنشاء دفعة كوبونات مسبقة الدفع" : "Generate Prepaid Coupon Batch"}
              </h3>
              <p className="text-xs text-gray-400 font-semibold mb-5">
                {isRTL ? "قم بإنشاء أكواد تفعيل للمواد المفردة أو المتعددة." : "Generate batch activation codes for single or multiple courses."}
              </p>

              <form onSubmit={handleGenerateBatchSubmit} className="flex flex-col gap-4">
                
                {/* Course Selection (Main Courses) - Searchable Multi-Select */}
                <div className="flex flex-col gap-2 text-start">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {isRTL ? `اختر المادة/المواد الرئيسية (تم تحديد ${selectedCourseIds.length})` : `Select Main Course(s) (${selectedCourseIds.length} selected)`}
                    </label>
                  </div>
                  
                  {/* Search input field */}
                  <div className="relative">
                    <FiSearch className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-gray-400`} size={15} />
                    <input
                      type="text"
                      placeholder={isRTL ? "البحث عن المواد بالإسم..." : "Search courses by name..."}
                      value={mainCourseSearch}
                      onChange={(e) => setMainCourseSearch(e.target.value)}
                      className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2.5 bg-[#07080e] border border-gray-800 rounded-xl text-xs font-bold text-white focus:outline-none focus:border-red-500/50`}
                    />
                  </div>

                  {/* Selected course chips */}
                  {selectedCourseIds.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-[#07080e]/80 border border-red-500/20 rounded-xl max-h-24 overflow-y-auto">
                      {selectedCourseIds.map((id) => {
                        const course = subjects?.find(s => s._id === id);
                        return (
                          <span key={id} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-500/15 border border-red-500/30 text-red-400 rounded-lg text-xs font-extrabold">
                            {course?.name || (isRTL ? 'مادة' : 'Course')}
                            <button
                              type="button"
                              onClick={() => setSelectedCourseIds(selectedCourseIds.filter(cId => cId !== id))}
                              className="hover:text-white cursor-pointer"
                            >
                              <FiX size={13} />
                            </button>
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Scrollable Filtered Subjects List */}
                  <div className="max-h-36 overflow-y-auto p-1.5 bg-[#07080e] border border-gray-800 rounded-2xl flex flex-col gap-1">
                    {filteredMainSubjects.length === 0 ? (
                      <span className="p-3 text-xs text-gray-500 font-semibold text-center">
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
                                ? 'border-red-500 bg-red-500/10 text-red-400'
                                : 'border-gray-800/80 text-gray-400 hover:text-white hover:bg-gray-800/40'
                            }`}
                          >
                            <span>{s.name}</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                              isSelected ? 'bg-red-500/20 text-red-400' : 'bg-gray-800 text-gray-500'
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
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isRTL ? "سعر الكوبون ($)" : "Coupon Price ($)"}</label>
                    <input
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder={isRTL ? "مثال: 50" : "e.g. 50"}
                      className={`w-full p-3 bg-[#07080e] border border-gray-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-red-500/50 ${isRTL ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-start">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isRTL ? "الكمية (العدد)" : "Quantity (Count)"}</label>
                    <input
                      type="number"
                      value={count}
                      onChange={(e) => setCount(e.target.value)}
                      placeholder="e.g. 10, 100, 1000"
                      className={`w-full p-3 bg-[#07080e] border border-gray-800 rounded-2xl text-sm font-bold text-white focus:outline-none focus:border-red-500/50 ${isRTL ? 'text-right' : 'text-left'}`}
                    />
                  </div>
                </div>

                {/* Expiry Days Option */}
                <div className="flex flex-col gap-1.5 text-start">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{isRTL ? "أيام الصلاحية (اختياري)" : "Expiry Days (Optional)"}</label>
                  <select
                    value={expiryDays}
                    onChange={(e) => setExpiryDays(e.target.value)}
                    className={`w-full p-3 bg-[#07080e] border border-gray-800 rounded-2xl text-xs font-bold text-white focus:outline-none cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}
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
                <div className="p-4 bg-[#07080e]/60 border border-gray-800/80 rounded-2xl flex flex-col gap-3 text-start">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FiGift className="text-amber-400" size={16} />
                      <span className="text-xs font-black text-white">{isRTL ? "مواد إضافية تلقائية (مواد مجانية)" : "Automatic Additional Courses (Bonus Courses)"}</span>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer select-none">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={enableBonusCourses}
                        onChange={() => setEnableBonusCourses(!enableBonusCourses)}
                      />
                      <div className={`w-10 h-5 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:${isRTL ? '-translate-x-full' : 'translate-x-full'} peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:${isRTL ? 'right-[2px]' : 'left-[2px]'} after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-500`} />
                    </label>
                  </div>
                  
                  {enableBonusCourses && (
                    <div className="flex flex-col gap-2 mt-1">
                      <span className="text-[11px] text-amber-400/90 font-semibold">
                        {isRTL ? "اختر 1 أو 2 من المواد الإضافية التي تمنح تلقائياً عند تفعيل الكود:" : "Select 1 or 2 bonus courses automatically granted upon code activation:"}
                      </span>

                      {/* Search bonus courses input */}
                      <div className="relative">
                        <FiSearch className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-gray-400`} size={13} />
                        <input
                          type="text"
                          placeholder={isRTL ? "البحث عن مواد إضافية..." : "Search bonus courses..."}
                          value={bonusCourseSearch}
                          onChange={(e) => setBonusCourseSearch(e.target.value)}
                          className={`w-full ${isRTL ? 'pr-9 pl-3 text-right' : 'pl-9 pr-3 text-left'} py-2 bg-[#0c0d19] border border-amber-500/20 rounded-xl text-xs font-bold text-white focus:outline-none`}
                        />
                      </div>

                      {/* Selected bonus chips */}
                      {selectedBonusCourseIds.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 p-2 bg-[#0c0d19]/80 border border-amber-500/20 rounded-xl">
                          {selectedBonusCourseIds.map((id) => {
                            const course = subjects?.find(s => s._id === id);
                            return (
                              <span key={id} className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-lg text-xs font-extrabold">
                                {course?.name || (isRTL ? 'مادة' : 'Course')}
                                <button
                                  type="button"
                                  onClick={() => setSelectedBonusCourseIds(selectedBonusCourseIds.filter(cId => cId !== id))}
                                  className="hover:text-white cursor-pointer"
                                >
                                  <FiX size={12} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}

                      {/* Scrollable Bonus Courses List */}
                      <div className="max-h-28 overflow-y-auto p-1 bg-[#0c0d19] border border-amber-500/20 rounded-xl flex flex-col gap-1">
                        {filteredBonusSubjects.length === 0 ? (
                          <span className="p-2 text-xs text-gray-500 font-semibold text-center">
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
                                    ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                                    : 'border-gray-800 text-gray-400 hover:text-white'
                                }`}
                              >
                                <span>{s.name}</span>
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded ${
                                  isSelected ? 'bg-amber-500/20 text-amber-400' : 'bg-gray-800 text-gray-500'
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
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
            onClick={() => setIsBatchDetailOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-[#0c0d19] border border-gray-800 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start max-h-[85vh] flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setIsBatchDetailOpen(false)}
                className={`absolute top-6 ${isRTL ? 'left-6' : 'right-6'} text-gray-500 hover:text-white transition-colors cursor-pointer z-10`}
              >
                <FiX size={20} />
              </button>

              {!activeBatchDetail ? (
                <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
                  <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-bold text-gray-400">{isRTL ? "جاري تحميل تفاصيل الدفعة..." : "Loading batch details..."}</span>
                </div>
              ) : (
                <>
                  <div className={`flex items-center justify-between ${isRTL ? 'pl-8' : 'pr-8'}`}>
                    <div className="text-start">
                      <h3 className="text-xl font-black text-white">
                        {isRTL 
                          ? `أكواد الدفعة (#${activeBatchDetail?.batch?._id ? activeBatchDetail.batch._id.slice(-6) : activeBatchDetail?.batch?.batchId ? activeBatchDetail.batch.batchId.slice(-6) : 'التفاصيل'})`
                          : `Batch Codes (#${activeBatchDetail?.batch?._id ? activeBatchDetail.batch._id.slice(-6) : activeBatchDetail?.batch?.batchId ? activeBatchDetail.batch.batchId.slice(-6) : 'Detail'})`
                        }
                      </h3>
                      <p className="text-xs text-gray-400 font-semibold mt-0.5">
                        {isRTL 
                          ? `السعر: $${activeBatchDetail?.batch?.price ?? 0} | ${activeBatchDetail?.coupons?.length || 0} إجمالي الأكواد` 
                          : `Price: $${activeBatchDetail?.batch?.price ?? 0} | ${activeBatchDetail?.coupons?.length || 0} Total Codes`
                        }
                      </p>
                    </div>

                    {activeBatchDetail?.batch?._id && (
                      <button
                        onClick={() => handleExportBatch(activeBatchDetail.batch._id)}
                        className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer"
                      >
                        <FiDownload size={14} /> {isRTL ? "تصدير إكسل" : "Export Excel"}
                      </button>
                    )}
                  </div>

              {/* Codes list */}
              <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-3">
                {activeBatchDetail?.coupons?.map((c) => {
                  const isActivated = c.status === 'Activated';
                  const isCancelled = c.status === 'Cancelled';
                  const isExpired = c.status === 'Expired';
                  const actDate = c.activatedAt ? new Date(c.activatedAt).toLocaleString(isRTL ? 'ar-EG' : 'en-US') : '';

                  const getStatusBadgeText = (status) => {
                    if (status === 'Activated') return isRTL ? 'مفعل' : 'Activated';
                    if (status === 'Cancelled') return isRTL ? 'ملغي' : 'Cancelled';
                    if (status === 'Expired') return isRTL ? 'منتهي الصلاحية' : 'Expired';
                    return isRTL ? 'غير مفعل' : status;
                  };

                  return (
                    <div key={c._id} className="p-4 bg-[#07080e] border border-gray-800 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-start">
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-amber-400 bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-500/20 text-sm">
                          {c.code}
                        </span>

                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isActivated ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          isCancelled ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          isExpired ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                          'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {getStatusBadgeText(c.status)}
                        </span>
                      </div>

                      {isActivated ? (
                        <div className="text-xs text-gray-300 font-semibold flex flex-col items-start md:items-end">
                          <span>{isRTL ? "مفعل بواسطة:" : "Activated by:"} <strong className="text-white">{c.usedBy?.name || c.usedBy?.email || (isRTL ? 'طالب' : 'Student')}</strong></span>
                          <span className="text-[10px] text-gray-500">{actDate}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => copyToClipboard(c.code)}
                            className="px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          >
                            {isRTL ? "نسخ" : "Copy"}
                          </button>
                          {!isCancelled && !isExpired && (
                            <button
                              onClick={() => handleCancelCoupon(c._id)}
                              className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                            >
                              {isRTL ? "إلغاء الكود" : "Cancel Code"}
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
                </>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default Coupons;
