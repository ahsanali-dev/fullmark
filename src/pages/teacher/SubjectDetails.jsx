import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiChevronLeft,
  FiBookOpen,
  FiHelpCircle,
  FiUsers,
  FiFileText,
  FiPlus,
  FiEdit3,
  FiTrash2,
  FiClock,
  FiFolder,
  FiImage,
  FiArrowUp,
  FiArrowDown,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTeacherSubjects,
  fetchSubjectUnits,
  createUnit,
  updateUnit,
  deleteUnit,
  fetchQuestions,
  fetchExams,
  fetchLessons,
  deleteExam,
  uploadSubjectBanner,
  fetchWeaknessTopics,
  createWeaknessTopic,
  updateWeaknessTopic,
  deleteWeaknessTopic
} from '../../redux/slices/teacherSlice';
import { ContentSkeleton } from '../../components/shared/SkeletonLoading';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../context/LanguageContext';

const SubjectDetails = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const dispatch = useDispatch();
  const bannerInputRef = useRef(null);
  const { t, isRTL } = useLanguage();

  const { subjects = [], units = [], weaknessTopics = [], questions = [], exams: examsList = [], lessons = [], isLoading } = useSelector((state) => state.teacher);

  const [activeTab, setActiveTab] = useState('lessons'); // 'units' | 'lessons' | 'questions' | 'exams' | 'weaknesses'
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingExam, setDeletingExam] = useState(null);

  // Unit Modal States
  const [isUnitModalOpen, setIsUnitModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [unitTitle, setUnitTitle] = useState('');
  const [unitTitleAr, setUnitTitleAr] = useState('');
  const [unitOrder, setUnitOrder] = useState(1);
  const [isSubmittingUnit, setIsSubmittingUnit] = useState(false);

  // Weakness Topic Modal States
  const [isWeaknessModalOpen, setIsWeaknessModalOpen] = useState(false);
  const [editingTopic, setEditingTopic] = useState(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicTitleAr, setTopicTitleAr] = useState('');
  const [topicVideoUrl, setTopicVideoUrl] = useState('');
  const [topicOrder, setTopicOrder] = useState(1);
  const [isSubmittingTopic, setIsSubmittingTopic] = useState(false);

  // Banner upload state
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  useEffect(() => {
    dispatch(fetchTeacherSubjects());
    dispatch(fetchSubjectUnits(subjectId));
    dispatch(fetchWeaknessTopics(subjectId));
    dispatch(fetchQuestions());
    dispatch(fetchExams());
    dispatch(fetchLessons(subjectId));
  }, [dispatch, subjectId]);

  const foundSubject = subjects.find((sub) => (sub._id || sub.id) === subjectId);
  const subject = foundSubject ? {
    ...foundSubject,
    id: foundSubject._id || foundSubject.id,
    title: foundSubject.name || foundSubject.title,
    description: foundSubject.description || '',
    bannerUrl: foundSubject.bannerUrl || null
  } : {
    id: subjectId,
    title: isRTL ? 'مادة غير معروفة' : 'Unknown Subject',
    description: isRTL ? 'لا يوجد وصف متاح' : 'No description available',
    bannerUrl: null
  };

  const subjectQuestions = questions.filter(
    (q) => (q.subject?._id || q.subject || q.subjectId) === subjectId
  );
  const subjectExams = examsList.filter(
    (ex) => (ex.subject?._id || ex.subject || ex.subjectId) === subjectId
  );
  const subjectLessons = lessons.filter(
    (les) => (les.subject?._id || les.subject || les.subjectId) === subjectId
  );

  // Handle Banner Upload
  const handleBannerSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(isRTL ? 'يُسمح فقط بملفات الصور لغلاف المادة' : 'Only image files are allowed for subject banner');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error(isRTL ? 'يجب أن يكون حجم الصورة أقل من 10 ميجابايت' : 'Image size must be less than 10MB');
      return;
    }

    setIsUploadingBanner(true);
    const loadingToast = toast.loading(isRTL ? 'جاري رفع صورة الغلاف...' : 'Uploading banner image...');

    try {
      await dispatch(uploadSubjectBanner({ subjectId, file })).unwrap();
      toast.success(isRTL ? 'تم تحديث غلاف المادة! 🎨' : 'Subject banner updated! 🎨', { id: loadingToast });
      dispatch(fetchTeacherSubjects());
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل رفع الغلاف' : 'Failed to upload banner'), { id: loadingToast });
    } finally {
      setIsUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  // Unit Modal Handlers
  const handleOpenAddUnit = () => {
    setEditingUnit(null);
    setUnitTitle('');
    setUnitTitleAr('');
    setUnitOrder(units.length + 1);
    setIsUnitModalOpen(true);
  };

  const handleOpenEditUnit = (unit) => {
    setEditingUnit(unit);
    setUnitTitle(unit.title || '');
    setUnitTitleAr(unit.titleAr || '');
    setUnitOrder(unit.order || 1);
    setIsUnitModalOpen(true);
  };

  const handleSaveUnit = async (e) => {
    e.preventDefault();
    if (!unitTitle.trim()) {
      toast.error(isRTL ? 'عنوان الوحدة مطلوب' : 'Unit title is required');
      return;
    }

    setIsSubmittingUnit(true);
    const loadingToast = toast.loading(editingUnit ? (isRTL ? 'جاري تحديث الوحدة...' : 'Updating unit...') : (isRTL ? 'جاري إنشاء الوحدة...' : 'Creating unit...'));

    try {
      if (editingUnit) {
        await dispatch(updateUnit({
          id: editingUnit._id || editingUnit.id,
          unitData: {
            title: unitTitle,
            titleAr: unitTitleAr,
            order: Number(unitOrder)
          }
        })).unwrap();
        toast.success(isRTL ? 'تم تحديث الوحدة بنجاح!' : 'Unit updated successfully!', { id: loadingToast });
      } else {
        await dispatch(createUnit({
          subjectId,
          title: unitTitle,
          titleAr: unitTitleAr,
          order: Number(unitOrder)
        })).unwrap();
        toast.success(isRTL ? 'تم إنشاء الوحدة بنجاح! 📁' : 'Unit created successfully! 📁', { id: loadingToast });
      }

      setIsUnitModalOpen(false);
      dispatch(fetchSubjectUnits(subjectId));
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل حفظ الوحدة' : 'Failed to save unit'), { id: loadingToast });
    } finally {
      setIsSubmittingUnit(false);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm(isRTL ? 'هل أنت تأكد من أنك تريد حذف هذه الوحدة؟' : 'Are you sure you want to delete this unit?')) return;
    const loadingToast = toast.loading(isRTL ? 'جاري حذف الوحدة...' : 'Deleting unit...');

    try {
      await dispatch(deleteUnit(unitId)).unwrap();
      toast.success(isRTL ? 'تم حذف الوحدة بنجاح!' : 'Unit deleted successfully!', { id: loadingToast });
      dispatch(fetchSubjectUnits(subjectId));
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل حذف الوحدة' : 'Failed to delete unit'), { id: loadingToast });
    }
  };

  const handleReorderUnit = async (unit, direction) => {
    const currentOrder = unit.order || 1;
    const newOrder = direction === 'up' ? Math.max(1, currentOrder - 1) : currentOrder + 1;

    try {
      await dispatch(updateUnit({
        id: unit._id || unit.id,
        unitData: { order: newOrder }
      })).unwrap();
      dispatch(fetchSubjectUnits(subjectId));
    } catch (err) {
      toast.error(isRTL ? 'فشل إعادة ترتيب الوحدة' : 'Failed to reorder unit');
    }
  };

  const handleDeleteClick = (exam) => {
    setDeletingExam(exam);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingExam) return;
    const id = deletingExam._id || deletingExam.id;
    setIsDeletingId(id);
    setShowDeleteConfirm(false);
    const loadingToast = toast.loading(isRTL ? 'جاري إلغاء الامتحان...' : 'Cancelling exam...');
    try {
      await dispatch(deleteExam(id)).unwrap();
      toast.success(isRTL ? 'تم إلغاء الامتحان بنجاح!' : 'Exam cancelled successfully!', { id: loadingToast });
      dispatch(fetchExams());
      setDeletingExam(null);
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل إلغاء الامتحان' : 'Failed to cancel exam'), { id: loadingToast });
    } finally {
      setIsDeletingId(null);
    }
  };

  // Weakness Topic Handlers
  const handleOpenAddTopic = () => {
    setEditingTopic(null);
    setTopicTitle('');
    setTopicTitleAr('');
    setTopicVideoUrl('');
    setTopicOrder(weaknessTopics.length + 1);
    setIsWeaknessModalOpen(true);
  };

  const handleOpenEditTopic = (topic) => {
    setEditingTopic(topic);
    setTopicTitle(topic.title || '');
    setTopicTitleAr(topic.titleAr || '');
    setTopicVideoUrl(topic.generalVideoUrl || '');
    setTopicOrder(topic.order || 1);
    setIsWeaknessModalOpen(true);
  };

  const handleSaveTopic = async (e) => {
    e.preventDefault();
    if (!topicTitle.trim()) {
      toast.error(isRTL ? 'عنوان موضوع التعثر مطلوب' : 'Weakness Topic title is required');
      return;
    }

    setIsSubmittingTopic(true);
    const loadingToast = toast.loading(editingTopic ? (isRTL ? 'جاري تحديث الموضوع...' : 'Updating topic...') : (isRTL ? 'جاري إنشاء الموضوع...' : 'Creating topic...'));

    try {
      if (editingTopic) {
        await dispatch(updateWeaknessTopic({
          id: editingTopic._id || editingTopic.id,
          topicData: {
            title: topicTitle,
            titleAr: topicTitleAr,
            generalVideoUrl: topicVideoUrl,
            order: Number(topicOrder)
          }
        })).unwrap();
        toast.success(isRTL ? 'تم تحديث موضوع التعثر بنجاح!' : 'Weakness topic updated successfully!', { id: loadingToast });
      } else {
        await dispatch(createWeaknessTopic({
          subjectId,
          title: topicTitle,
          titleAr: topicTitleAr,
          generalVideoUrl: topicVideoUrl,
          order: Number(topicOrder)
        })).unwrap();
        toast.success(isRTL ? 'تم إنشاء موضوع التعثر بنجاح! 🎯' : 'Weakness topic created successfully! 🎯', { id: loadingToast });
      }

      setIsWeaknessModalOpen(false);
      dispatch(fetchWeaknessTopics(subjectId));
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل حفظ الموضوع' : 'Failed to save topic'), { id: loadingToast });
    } finally {
      setIsSubmittingTopic(false);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!window.confirm(isRTL ? 'هل أنت تأكد من أنك تريد حذف موضوع التعثر هذا؟' : 'Are you sure you want to delete this weakness topic?')) return;
    const loadingToast = toast.loading(isRTL ? 'جاري حذف موضوع التعثر...' : 'Deleting weakness topic...');

    try {
      await dispatch(deleteWeaknessTopic(topicId)).unwrap();
      toast.success(isRTL ? 'تم حذف الموضوع بنجاح!' : 'Topic deleted successfully!', { id: loadingToast });
      dispatch(fetchWeaknessTopics(subjectId));
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل حذف الموضوع' : 'Failed to delete topic'), { id: loadingToast });
    }
  };

  if (isLoading && !lessons.length && !questions.length && !examsList.length) {
    return (
      <DashboardLayout
        role="teacher"
        activeTab="subjects"
        title={subject.title}
        subtitle={isRTL ? "جاري تحميل مركز المادة..." : "Loading Subject Hub..."}
      >
        <ContentSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="teacher"
      activeTab="subjects"
      title={subject.title}
      subtitle={isRTL ? "مركز المادة" : "Subject Hub"}
      isModalOpen={showDeleteConfirm || isUnitModalOpen}
    >
      <div className="w-full max-w-full p-6 md:p-8 pb-32 text-start flex flex-col gap-6 animate-fade-in relative">

        {/* Premium Banner Header */}
        <div className="relative w-full bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-6 md:p-8 text-white overflow-hidden rounded-[2.5rem] shadow-2xl min-h-[220px] flex flex-col justify-between border border-blue-400/20 text-start">
          {/* Banner Image Background if uploaded */}
          {subject.bannerUrl && (
            <div className="absolute inset-0 z-0">
              <img
                src={getImageUrl(subject.bannerUrl)}
                alt={subject.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-blue-950/90 via-blue-900/85 to-indigo-950/90" />
            </div>
          )}

          {/* Hidden File Input for Banner */}
          <input
            type="file"
            ref={bannerInputRef}
            onChange={handleBannerSelect}
            accept="image/*"
            className="hidden"
          />

          <div className="relative z-10 flex items-center justify-between">
            {/* Navigation Back button */}
            <button
              type="button"
              onClick={() => navigate('/teacher/subjects')}
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 active:scale-95"
              title={isRTL ? "العودة إلى المواد" : "Back to Subjects"}
            >
              <FiChevronLeft size={22} className={isRTL ? 'rotate-180' : ''} />
            </button>

            {/* Upload Banner Button */}
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUploadingBanner}
              className="px-4.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md text-xs font-black text-white flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <FiImage size={17} />
              {isUploadingBanner ? (isRTL ? 'جاري رفع الغلاف...' : 'Uploading Banner...') : (isRTL ? 'تغيير غلاف المادة' : 'Change Course Banner')}
            </button>
          </div>

          {/* Subject info row */}
          <div className="relative z-10 flex items-center gap-4.5 my-4 text-start">
            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-inner shrink-0 backdrop-blur-md">
              <FiBookOpen size={28} />
            </div>
            <div className="text-start">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">{subject.title}</h2>
              <p className="text-base text-white/80 font-medium mt-1">{subject.description}</p>
            </div>
          </div>

          {/* Stats Badge Grid */}
          <div className="relative z-10 grid grid-cols-5 gap-1 border-t border-white/10 pt-4 mt-2">
            <div className="flex flex-col items-center text-center">
              <FiFolder size={16} className="text-white/70" />
              <span className="text-lg font-black mt-1">{units.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/50 mt-0.5">{t('teacher.subjectDetails.units')}</span>
            </div>
            <div className="flex flex-col items-center text-center border-l border-white/10">
              <FiBookOpen size={16} className="text-white/70" />
              <span className="text-lg font-black mt-1">{subjectLessons.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/50 mt-0.5">{t('teacher.subjectDetails.lessons')}</span>
            </div>
            <div className="flex flex-col items-center text-center border-l border-white/10">
              <FiHelpCircle size={16} className="text-white/70" />
              <span className="text-lg font-black mt-1">{subjectQuestions.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/50 mt-0.5">{t('teacher.subjectDetails.questions')}</span>
            </div>
            <div className="flex flex-col items-center text-center border-l border-white/10">
              <FiFileText size={16} className="text-white/70" />
              <span className="text-lg font-black mt-1">{subjectExams.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/50 mt-0.5">{t('teacher.subjectDetails.exams')}</span>
            </div>
            <div className="flex flex-col items-center text-center border-l border-white/10">
              <span className="text-sm font-black text-amber-400">🎯</span>
              <span className="text-lg font-black mt-1 text-amber-300">{weaknessTopics.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/50 mt-0.5">{t('teacher.subjectDetails.weaknessTopics')}</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Switch */}
        <div className="p-1.5 bg-[#0a0b14]/80 backdrop-blur-md border border-gray-800/80 rounded-2xl w-full grid grid-cols-2 sm:grid-cols-5 gap-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('units')}
            className={`py-3 px-3 text-center font-black text-xs rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'units'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.01]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <FiFolder size={15} /> {isRTL ? "الوحدات" : "Units"} ({units.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lessons')}
            className={`py-3 px-3 text-center font-black text-xs rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'lessons'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.01]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <FiBookOpen size={15} /> {isRTL ? "الدروس" : "Lessons"} ({subjectLessons.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`py-3 px-3 text-center font-black text-xs rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'questions'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.01]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <FiHelpCircle size={15} /> {isRTL ? "الأسئلة" : "Questions"} ({subjectQuestions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`py-3 px-3 text-center font-black text-xs rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'exams'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.01]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <FiFileText size={15} /> {isRTL ? "الامتحانات" : "Exams"} ({subjectExams.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('weaknesses')}
            className={`py-3 px-3 text-center font-black text-xs rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'weaknesses'
              ? 'bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 text-white shadow-[0_4px_20px_rgba(245,158,11,0.4)] border border-amber-400/30 scale-[1.01]'
              : 'text-gray-400 hover:text-amber-400 hover:bg-white/5'
              }`}
          >
            <span>🎯</span> {isRTL ? "نقاط التعثر" : "Weaknesses"} ({weaknessTopics.length})
          </button>
        </div>

        {/* Tab Contents Area */}
        <div className="w-full text-start">
          {/* TAB 1: UNITS */}
          {activeTab === 'units' && (
            <div className="flex flex-col gap-6 text-start">
              <div className="flex items-center justify-between">
                <div className="text-start">
                  <h3 className="text-lg font-black text-white">{isRTL ? "وحدات المادة" : "Course Units"}</h3>
                  <p className="text-xs text-gray-500 font-semibold">{isRTL ? "تنظيم الدروس في فصول وحدات قابلة للطي" : "Organize lessons into collapsible unit chapters"}</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddUnit}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs md:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-blue-400/30"
                >
                  <FiPlus size={18} className="stroke-[3]" /> {isRTL ? "إضافة وحدة" : "Add Unit"}
                </button>
              </div>

              {units.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {units.map((unit, index) => {
                    const unitLessonsCount = subjectLessons.filter(
                      l => (l.unit?._id || l.unit || l.unitId) === (unit._id || unit.id)
                    ).length;

                    return (
                      <div
                        key={unit._id || unit.id}
                        className="p-5 rounded-2xl bg-[#0e101a] border border-gray-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md hover:border-gray-700 transition-all text-start"
                      >
                        <div className="flex items-center gap-4 text-start">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black shrink-0">
                            #{unit.order || index + 1}
                          </div>
                          <div className="text-start">
                            <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                              {unit.title}
                              {unit.titleAr && <span className="text-xs font-normal text-gray-400">({unit.titleAr})</span>}
                            </h4>
                            <span className="text-xs text-gray-500 font-semibold mt-0.5 block">
                              {unitLessonsCount} {isRTL ? 'درس/دروس مخصصة' : 'lesson(s) assigned'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleReorderUnit(unit, 'up')}
                            className="p-2.5 rounded-xl bg-gray-900/80 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 transition-all cursor-pointer border border-gray-800 hover:border-blue-500/30"
                            title={isRTL ? "تحريك لأعلى" : "Move Unit Up"}
                          >
                            <FiArrowUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReorderUnit(unit, 'down')}
                            className="p-2.5 rounded-xl bg-gray-900/80 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 transition-all cursor-pointer border border-gray-800 hover:border-blue-500/30"
                            title={isRTL ? "تحريك لأسفل" : "Move Unit Down"}
                          >
                            <FiArrowDown size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditUnit(unit)}
                            className="px-3.5 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-blue-500/20"
                            title={isRTL ? "تعديل الوحدة" : "Edit Unit"}
                          >
                            <FiEdit3 size={15} /> {isRTL ? 'تعديل' : 'Edit'}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUnit(unit._id || unit.id)}
                            className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-rose-500/20"
                            title={isRTL ? "حذف الوحدة" : "Delete Unit"}
                          >
                            <FiTrash2 size={15} /> {isRTL ? 'حذف' : 'Delete'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center bg-[#0e101a] border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
                  <FiFolder className="text-gray-600 mb-3" size={36} />
                  <span className="text-sm font-bold text-gray-400">{isRTL ? "لم يتم إنشاء وحدات لهذه المادة بعد." : "No units created for this subject yet."}</span>
                  <span className="text-xs text-gray-600 mt-1">{isRTL ? "قم بإنشاء وحدات لتجميع دروسك في وحدات تنظيمية." : "Create units to group your lessons into organized modules."}</span>
                  <button
                    type="button"
                    onClick={handleOpenAddUnit}
                    className="mt-4 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer border border-blue-400/30"
                  >
                    <FiPlus size={16} /> {isRTL ? "إنشاء أول وحدة" : "Create First Unit"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LESSONS */}
          {activeTab === 'lessons' && (
            <div className="flex flex-col gap-6 text-start">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-gray-500 uppercase">
                  {isRTL ? "قائمة الدروس" : "Lesson List"}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/teacher/subjects/${subjectId}/add-lesson`)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs md:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-blue-400/30"
                >
                  <FiPlus size={18} className="stroke-[3]" /> {isRTL ? "إضافة درس" : "Add Lesson"}
                </button>
              </div>

              {subjectLessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjectLessons.map((les) => {
                    const lessonUnit = units.find(u => (u._id || u.id) === (les.unit?._id || les.unit || les.unitId));

                    return (
                      <div
                        key={les._id || les.id}
                        className="p-5 rounded-2xl bg-[#0e101a] border border-gray-800/80 hover:border-gray-700 transition-all flex flex-col justify-between gap-4 text-start group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col text-start">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                              {isRTL ? "الوحدة" : "Module"} {les.order || 1} {lessonUnit ? `• ${lessonUnit.title}` : ''}
                            </span>
                            <h4 className="text-base font-extrabold text-white mt-1 group-hover:text-blue-400 transition-colors">
                              {les.title}
                            </h4>
                          </div>

                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => navigate(`/teacher/subjects/${subjectId}/edit-lesson/${les._id || les.id}`)}
                              className="px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-blue-500/20"
                              title={isRTL ? "تعديل الدرس" : "Edit Lesson"}
                            >
                              <FiEdit3 size={15} /> {isRTL ? "تعديل" : "Edit"}
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-850 pt-3 text-xs text-gray-500 font-semibold">
                          <span className="flex items-center gap-1">
                            <FiClock size={14} /> {les.duration || 0} {isRTL ? "دقيقة" : "mins"}
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] uppercase ${les.isPublished ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {les.isPublished ? (isRTL ? 'منشور' : 'Published') : (isRTL ? 'مسودة' : 'Draft')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center bg-[#0e101a] border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
                  <FiBookOpen className="text-gray-600 mb-3" size={36} />
                  <span className="text-sm font-bold text-gray-400">{isRTL ? "لم يتم رفع أي دروس لهذه المادة بعد." : "No lessons uploaded yet for this subject."}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="flex flex-col gap-6 text-start">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-gray-500 uppercase">
                  {isRTL ? "بنك الأسئلة" : "Question Bank"}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/teacher/subjects/${subjectId}/add-question`)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs md:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-blue-400/30"
                >
                  <FiPlus size={18} className="stroke-[3]" /> {isRTL ? "إضافة سؤال" : "Add Question"}
                </button>
              </div>

              {subjectQuestions.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {subjectQuestions.map((q) => (
                    <div
                      key={q._id || q.id}
                      className="p-4 rounded-2xl bg-[#0e101a] border border-gray-800/80 flex items-center justify-between gap-4 text-start"
                    >
                      <div className="flex flex-col text-start">
                        <span className="text-sm font-bold text-white line-clamp-1">{q.questionText}</span>
                        <span className="text-xs text-gray-500 font-semibold mt-0.5">
                          {isRTL ? "النوع" : "Type"}: {q.type || 'MCQ'} • {isRTL ? "الصعوبة" : "Difficulty"}: {q.difficulty || 'Medium'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/teacher/questions/${q._id || q.id}/edit`)}
                        className="px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-blue-500/20 shrink-0"
                      >
                        <FiEdit3 size={15} /> {isRTL ? "تعديل" : "Edit"}
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-[#0e101a] border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
                  <FiHelpCircle className="text-gray-600 mb-3" size={36} />
                  <span className="text-sm font-bold text-gray-400">{isRTL ? "لم يتم إضافة أسئلة لهذه المادة بعد." : "No questions added for this subject yet."}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EXAMS */}
          {activeTab === 'exams' && (
            <div className="flex flex-col gap-6 text-start">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-gray-500 uppercase">
                  {isRTL ? "الامتحانات والاختبارات" : "Exams & Tests"}
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/teacher/subjects/${subjectId}/create-exam`)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs md:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-blue-400/30"
                >
                  <FiPlus size={18} className="stroke-[3]" /> {isRTL ? "إنشاء امتحان" : "Create Exam"}
                </button>
              </div>

              {subjectExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjectExams.map((ex) => (
                    <div
                      key={ex._id || ex.id}
                      className="p-5 rounded-2xl bg-[#0e101a] border border-gray-800/80 flex flex-col justify-between gap-4 text-start"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="text-start">
                          <h4 className="text-base font-extrabold text-white">{ex.title}</h4>
                          <span className="text-xs text-gray-500 font-semibold mt-1 block">
                            {ex.questions?.length || 0} {isRTL ? "سؤال" : "Questions"} • {isRTL ? "المدة" : "Duration"}: {ex.duration || 0} {isRTL ? "دقيقة" : "mins"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(ex)}
                          className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-extrabold text-xs flex items-center gap-1.5 transition-all border border-rose-500/20 cursor-pointer shrink-0"
                          title={isRTL ? "إلغاء الامتحان" : "Cancel Exam"}
                        >
                          <FiTrash2 size={15} /> {isRTL ? "إلغاء" : "Cancel"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-[#0e101a] border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
                  <FiFileText className="text-gray-600 mb-3" size={36} />
                  <span className="text-sm font-bold text-gray-400">{isRTL ? "لم يتم إنشاء امتحانات لهذه المادة بعد." : "No exams created for this subject yet."}</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 5: WEAKNESS TOPICS */}
          {activeTab === 'weaknesses' && (
            <div className="flex flex-col gap-6 text-start">
              <div className="flex items-center justify-between">
                <div className="text-start">
                  <h3 className="text-lg font-black text-white">{isRTL ? "مواضيع التعثر" : "Weakness Topics"}</h3>
                  <p className="text-xs text-gray-500 font-semibold">{isRTL ? "تصنيف الأسئلة إلى مناطق تعثر مستهدفة لتوليد النماذج بالذكاء الاصطناعي" : "Categorize questions into target weakness areas for AI variant generation"}</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddTopic}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-black text-xs md:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(245,158,11,0.35)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-amber-400/30"
                >
                  <FiPlus size={18} className="stroke-[3]" /> {isRTL ? "إضافة موضوع تعثر" : "Add Weakness Topic"}
                </button>
              </div>

              {weaknessTopics.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {weaknessTopics.map((topic, index) => (
                    <div
                      key={topic._id || topic.id}
                      className="p-5 rounded-2xl bg-[#0e101a] border border-gray-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md hover:border-amber-500/30 transition-all text-start"
                    >
                      <div className="flex items-center gap-4 text-start">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 font-black shrink-0">
                          🎯 #{topic.order || index + 1}
                        </div>
                        <div className="text-start">
                          <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                            {topic.title}
                            {topic.titleAr && <span className="text-xs font-normal text-gray-400">({topic.titleAr})</span>}
                          </h4>
                          {topic.generalVideoUrl ? (
                            <span className="text-xs text-emerald-400 font-semibold mt-0.5 flex items-center gap-1">
                              🎥 {isRTL ? "فيديو توضيحي مرتبط:" : "General Video Linked:"} <a href={topic.generalVideoUrl} target="_blank" rel="noreferrer" className="underline truncate max-w-xs">{topic.generalVideoUrl}</a>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 font-semibold mt-0.5">{isRTL ? "لا يوجد فيديو توضيحي مرتبط" : "No general video linked"}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTopic(topic)}
                          className="px-3.5 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-amber-500/20"
                          title={isRTL ? "تعديل الموضوع" : "Edit Topic"}
                        >
                          <FiEdit3 size={15} /> {isRTL ? "تعديل" : "Edit"}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteTopic(topic._id || topic.id)}
                          className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-rose-500/20"
                          title={isRTL ? "حذف الموضوع" : "Delete Topic"}
                        >
                          <FiTrash2 size={15} /> {isRTL ? "حذف" : "Delete"}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-[#0e101a] border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
                  <span className="text-4xl mb-3">🎯</span>
                  <span className="text-sm font-bold text-gray-400">{isRTL ? "لم يتم إنشاء مواضيع تعثر لهذه المادة بعد." : "No weakness topics created for this subject yet."}</span>
                  <span className="text-xs text-gray-600 mt-1">{isRTL ? "أضف مواضيع التعثر لتنظيم نقاط ضعف الطلاب وتوليد أسئلة بالذكاء الاصطناعي." : "Add weakness topics to organize student weak points and auto-generate AI question variants."}</span>
                  <button
                    type="button"
                    onClick={handleOpenAddTopic}
                    className="mt-4 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer border border-amber-400/30"
                  >
                    <FiPlus size={16} /> {isRTL ? "إنشاء أول موضوع تعثر" : "Create First Weakness Topic"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* UNIT CREATION / EDIT MODAL */}
      <AnimatePresence>
        {isUnitModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e101a] border border-gray-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-start relative"
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-lg font-black text-white">
                  {editingUnit ? (isRTL ? 'تعديل الوحدة' : 'Edit Unit') : (isRTL ? 'إنشاء وحدة جديدة' : 'Create New Unit')}
                </h3>
                <button
                  onClick={() => setIsUnitModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveUnit} className="flex flex-col gap-4 text-start">
                <Input
                  label={isRTL ? "عنوان الوحدة (إنجليزي)" : "Unit Title (English)"}
                  type="text"
                  value={unitTitle}
                  onChange={(e) => setUnitTitle(e.target.value)}
                  placeholder={isRTL ? "مثال: Unit 1: Foundations" : "e.g. Unit 1: Foundations"}
                  required
                  roleColor="teacher"
                />

                <Input
                  label={isRTL ? "عنوان الوحدة (عربي - اختياري)" : "Unit Title (Arabic - Optional)"}
                  type="text"
                  value={unitTitleAr}
                  onChange={(e) => setUnitTitleAr(e.target.value)}
                  placeholder="مثال: الوحدة الأولى"
                  roleColor="teacher"
                />

                <Input
                  label={isRTL ? "ترتيب العرض" : "Display Order"}
                  type="number"
                  value={unitOrder}
                  onChange={(e) => setUnitOrder(e.target.value)}
                  min={1}
                  required
                  roleColor="teacher"
                />

                <div className="flex items-center justify-end gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setIsUnitModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-xs font-black text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    {isRTL ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingUnit}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-black text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all cursor-pointer border border-blue-400/30 disabled:opacity-50"
                  >
                    {isSubmittingUnit ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : editingUnit ? (isRTL ? 'تحديث الوحدة' : 'Update Unit') : (isRTL ? 'إنشاء الوحدة' : 'Create Unit')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WEAKNESS TOPIC CREATION / EDIT MODAL */}
      <AnimatePresence>
        {isWeaknessModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#0e101a] border border-gray-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-start relative"
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>🎯</span> {editingTopic ? (isRTL ? 'تعديل موضوع التعثر' : 'Edit Weakness Topic') : (isRTL ? 'إنشاء موضوع تعثر' : 'Create Weakness Topic')}
                </h3>
                <button
                  onClick={() => setIsWeaknessModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveTopic} className="flex flex-col gap-4 text-start">
                <Input
                  label={isRTL ? "عنوان الموضوع (إنجليزي)" : "Topic Title (English)"}
                  type="text"
                  value={topicTitle}
                  onChange={(e) => setTopicTitle(e.target.value)}
                  placeholder={isRTL ? "مثال: Quadratic Equations Concept" : "e.g. Quadratic Equations Concept"}
                  required
                  roleColor="teacher"
                />

                <Input
                  label={isRTL ? "عنوان الموضوع (عربي - اختياري)" : "Topic Title (Arabic - Optional)"}
                  type="text"
                  value={topicTitleAr}
                  onChange={(e) => setTopicTitleAr(e.target.value)}
                  placeholder="مثال: المعادلات التربيعية"
                  roleColor="teacher"
                />

                <Input
                  label={isRTL ? "رابط فيديو الشرح العام (اختياري)" : "General Explanation Video URL (Optional)"}
                  type="url"
                  value={topicVideoUrl}
                  onChange={(e) => setTopicVideoUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  roleColor="teacher"
                />

                <Input
                  label={isRTL ? "ترتيب العرض" : "Display Order"}
                  type="number"
                  value={topicOrder}
                  onChange={(e) => setTopicOrder(e.target.value)}
                  min={1}
                  required
                  roleColor="teacher"
                />

                <div className="flex items-center justify-end gap-3 mt-3">
                  <button
                    type="button"
                    onClick={() => setIsWeaknessModalOpen(false)}
                    className="px-5 py-2.5 rounded-2xl bg-gray-900/80 hover:bg-gray-800 border border-gray-800 text-xs font-black text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    {isRTL ? "إلغاء" : "Cancel"}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingTopic}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-xs font-black text-white shadow-[0_4px_15px_rgba(245,158,11,0.3)] transition-all cursor-pointer border border-amber-400/30 disabled:opacity-50"
                  >
                    {isSubmittingTopic ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : editingTopic ? (isRTL ? 'تحديث الموضوع' : 'Update Topic') : (isRTL ? 'إنشاء الموضوع' : 'Create Topic')}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default SubjectDetails;
