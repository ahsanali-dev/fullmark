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
  FiX,
  FiVideo,
  FiVideoOff,
  FiMoreVertical,
  FiEye,
  FiEyeOff
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
  deleteLesson,
  toggleLessonPublish,
  deleteExam,
  deleteQuestion,
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

  const [activeTab, setActiveTab] = useState('units'); // 'units' | 'lessons' | 'questions' | 'exams' | 'weaknesses'
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'unit'|'lesson'|'question'|'exam'|'topic', id, title, name }
  const [isDeleting, setIsDeleting] = useState(false);
  const [activeLessonDropdown, setActiveLessonDropdown] = useState(null);

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

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id } = deleteTarget;
    setIsDeleting(true);
    const loadingToast = toast.loading(isRTL ? 'جاري الحذف...' : 'Deleting...');

    try {
      if (type === 'unit') {
        await dispatch(deleteUnit(id)).unwrap();
        toast.success(isRTL ? 'تم حذف الوحدة بنجاح!' : 'Unit deleted successfully!', { id: loadingToast });
        dispatch(fetchSubjectUnits(subjectId));
      } else if (type === 'lesson') {
        await dispatch(deleteLesson(id)).unwrap();
        toast.success(isRTL ? 'تم حذف الدرس بنجاح!' : 'Lesson deleted successfully!', { id: loadingToast });
        dispatch(fetchLessons(subjectId));
      } else if (type === 'question') {
        await dispatch(deleteQuestion(id)).unwrap();
        toast.success(isRTL ? 'تم حذف السؤال بنجاح!' : 'Question deleted successfully!', { id: loadingToast });
        dispatch(fetchQuestions());
      } else if (type === 'exam') {
        await dispatch(deleteExam(id)).unwrap();
        toast.success(isRTL ? 'تم إلغاء الامتحان بنجاح!' : 'Exam cancelled successfully!', { id: loadingToast });
        dispatch(fetchExams());
      } else if (type === 'topic') {
        await dispatch(deleteWeaknessTopic(id)).unwrap();
        toast.success(isRTL ? 'تم حذف موضوع التعثر بنجاح!' : 'Weakness topic deleted successfully!', { id: loadingToast });
        dispatch(fetchWeaknessTopics(subjectId));
      }
      setDeleteTarget(null);
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل الحذف' : 'Failed to delete'), { id: loadingToast });
    } finally {
      setIsDeleting(false);
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

  const handleTogglePublishLesson = async (les) => {
    const targetId = les._id || les.id;
    try {
      await dispatch(toggleLessonPublish(targetId)).unwrap();
      toast.success(isRTL ? 'تم تغيير حالة نشر الدرس بنجاح!' : 'Lesson publish status updated!');
      dispatch(fetchLessons(subjectId));
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل تغيير حالة النشر' : 'Failed to update publish status'));
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
      isModalOpen={!!deleteTarget || isUnitModalOpen || isWeaknessModalOpen}
    >
      <div className="w-full max-w-full p-6 md:p-8 pb-32 text-start flex flex-col gap-6 animate-fade-in relative">

        {/* Premium Banner Header */}
        <div className="relative w-full bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-6 md:p-8 text-white preserve-white overflow-hidden rounded-[2.5rem] shadow-2xl min-h-[220px] flex flex-col justify-between border border-blue-400/20 text-start">
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
              className="w-11 h-11 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md flex items-center justify-center text-white transition-all duration-200 cursor-pointer shadow-lg hover:scale-105 active:scale-95 preserve-white"
              title={isRTL ? "العودة إلى المواد" : "Back to Subjects"}
            >
              <FiChevronLeft size={22} className={isRTL ? 'rotate-180' : ''} />
            </button>

            {/* Upload Banner Button */}
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUploadingBanner}
              className="px-4 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md text-xs font-black text-white flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] preserve-white"
            >
              <FiImage size={17} />
              {isUploadingBanner ? (isRTL ? 'جاري رفع الغلاف...' : 'Uploading Banner...') : (isRTL ? 'تغيير غلاف المادة' : 'Change Course Banner')}
            </button>
          </div>

          {/* Subject info row */}
          <div className="relative z-10 flex items-center gap-4.5 my-4 text-start preserve-white">
            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-inner shrink-0 backdrop-blur-md">
              <FiBookOpen size={28} />
            </div>
            <div className="text-start">
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white">{subject.title}</h2>
              <p className="text-base text-white/90 font-medium mt-1">{subject.description}</p>
            </div>
          </div>

          {/* Stats Badge Grid */}
          <div className="relative z-10 grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-1 border-t border-white/15 pt-4 mt-2 preserve-white">
            <div className="flex flex-col items-center text-center">
              <FiFolder size={16} className="text-white/80" />
              <span className="text-lg font-black mt-1 text-white">{units.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/70 mt-0.5">{t('teacher.subjectDetails.units')}</span>
            </div>
            <div className="flex flex-col items-center text-center sm:border-l border-white/15">
              <FiBookOpen size={16} className="text-white/80" />
              <span className="text-lg font-black mt-1 text-white">{subjectLessons.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/70 mt-0.5">{t('teacher.subjectDetails.lessons')}</span>
            </div>
            <div className="flex flex-col items-center text-center sm:border-l border-white/15">
              <FiHelpCircle size={16} className="text-white/80" />
              <span className="text-lg font-black mt-1 text-white">{subjectQuestions.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/70 mt-0.5">{t('teacher.subjectDetails.questions')}</span>
            </div>
            <div className="flex flex-col items-center text-center sm:border-l border-white/15">
              <FiFileText size={16} className="text-white/80" />
              <span className="text-lg font-black mt-1 text-white">{subjectExams.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/70 mt-0.5">{t('teacher.subjectDetails.exams')}</span>
            </div>
            <div className="flex flex-col items-center text-center sm:border-l border-white/15 col-span-2 sm:col-span-1">
              <span className="text-sm font-black text-amber-300">🎯</span>
              <span className="text-lg font-black mt-1 text-amber-200">{weaknessTopics.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/70 mt-0.5">{t('teacher.subjectDetails.weaknessTopics')}</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Switch */}
        <div className="p-1.5 bg-[#0a0b14]/80 border border-gray-800/80 rounded-2xl w-full grid grid-cols-2 sm:grid-cols-5 gap-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('units')}
            className={`py-3 px-3 text-center font-black text-xs rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'units'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white preserve-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.01]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <FiFolder size={15} /> {isRTL ? "الوحدات" : "Units"} ({units.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lessons')}
            className={`py-3 px-3 text-center font-black text-xs rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'lessons'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white preserve-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.01]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <FiBookOpen size={15} /> {isRTL ? "الدروس" : "Lessons"} ({subjectLessons.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`py-3 px-3 text-center font-black text-xs rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'questions'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white preserve-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.01]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <FiHelpCircle size={15} /> {isRTL ? "الأسئلة" : "Questions"} ({subjectQuestions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`py-3 px-3 text-center font-black text-xs rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'exams'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white preserve-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.01]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <FiFileText size={15} /> {isRTL ? "الامتحانات" : "Exams"} ({subjectExams.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('weaknesses')}
            className={`py-3 px-3 text-center font-black text-xs rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-1.5 ${activeTab === 'weaknesses'
              ? 'bg-gradient-to-r from-amber-500 via-orange-600 to-amber-600 text-white preserve-white shadow-[0_4px_20px_rgba(245,158,11,0.4)] border border-amber-400/30 scale-[1.01]'
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
                  className="px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white preserve-white font-black text-xs md:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-blue-400/30"
                >
                  <FiPlus size={18} className="stroke-[3] shrink-0" /> <span className="whitespace-nowrap text-white preserve-white">{isRTL ? "إضافة وحدة" : "Add Unit"}</span>
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

                        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                          <button
                            type="button"
                            onClick={() => handleReorderUnit(unit, 'up')}
                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-900/90 text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white transition-all cursor-pointer border border-slate-300 dark:border-gray-800 hover:border-blue-500/40"
                            title={isRTL ? "تحريك لأعلى" : "Move Unit Up"}
                          >
                            <FiArrowUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReorderUnit(unit, 'down')}
                            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-gray-900/90 text-slate-700 hover:text-slate-900 dark:text-gray-300 dark:hover:text-white transition-all cursor-pointer border border-slate-300 dark:border-gray-800 hover:border-blue-500/40"
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
                            onClick={() => setDeleteTarget({ type: 'unit', id: unit._id || unit.id, title: unit.title, name: isRTL ? 'الوحدة' : 'Unit' })}
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
                  className="px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white preserve-white font-black text-xs md:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-blue-400/30"
                >
                  <FiPlus size={18} className="stroke-[3] shrink-0" /> <span className="whitespace-nowrap text-white preserve-white">{isRTL ? "إضافة درس" : "Add Lesson"}</span>
                </button>
              </div>

              {subjectLessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjectLessons.map((les) => {
                    const lessonUnit = units.find(u => (u._id || u.id) === (les.unit?._id || les.unit || les.unitId));

                    return (
                      <div
                        key={les._id || les.id}
                        className={`p-5 rounded-2xl bg-[#0e101a] border border-gray-800/80 hover:border-gray-700 transition-all flex flex-col justify-between gap-4 text-start group relative min-w-0 ${activeLessonDropdown === (les._id || les.id) ? 'z-30' : 'z-10'}`}
                      >
                        <div className="flex items-start justify-between gap-3 min-w-0">
                          <div className="flex flex-col text-start min-w-0 flex-1">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider truncate">
                              {isRTL ? "الوحدة" : "Module"} {les.order || 1} {lessonUnit ? `• ${lessonUnit.title}` : ''}
                            </span>
                            <h4 className="text-base font-extrabold text-white mt-1 group-hover:text-blue-400 transition-colors line-clamp-2 break-words break-all" title={les.title}>
                              {les.title}
                            </h4>
                          </div>

                          <div className="relative shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveLessonDropdown(activeLessonDropdown === (les._id || les.id) ? null : (les._id || les.id));
                              }}
                              className="w-8 h-8 rounded-xl bg-gray-800/60 hover:bg-gray-700/80 text-gray-300 hover:text-white transition-all cursor-pointer border border-gray-700/50 flex items-center justify-center"
                              title={isRTL ? "خيارات الدرس" : "Lesson Actions"}
                            >
                              <FiMoreVertical size={16} />
                            </button>

                            {activeLessonDropdown === (les._id || les.id) && (
                              <>
                                <div 
                                  className="fixed inset-0 z-40" 
                                  onClick={() => setActiveLessonDropdown(null)} 
                                />

                                <div className="absolute right-0 ltr:right-0 rtl:left-0 top-full mt-1 w-48 rounded-2xl bg-[#141829] border border-gray-700 shadow-[0_10px_30px_rgba(0,0,0,0.8)] z-50 p-1.5 flex flex-col gap-1 text-start">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveLessonDropdown(null);
                                      navigate(`/teacher/subjects/${subjectId}/edit-lesson/${les._id || les.id}`);
                                    }}
                                    className="w-full px-3 py-2 rounded-xl hover:bg-blue-500/10 text-gray-300 hover:text-blue-400 font-bold text-xs flex items-center gap-2 transition-all text-start cursor-pointer"
                                  >
                                    <FiEdit3 size={15} className="text-blue-400" />
                                    <span>{isRTL ? "تعديل الدرس" : "Edit Lesson"}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveLessonDropdown(null);
                                      handleTogglePublishLesson(les);
                                    }}
                                    className={`w-full px-3 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all text-start cursor-pointer ${les.isPublished ? 'hover:bg-amber-500/10 text-gray-300 hover:text-amber-400' : 'hover:bg-emerald-500/10 text-gray-300 hover:text-emerald-400'}`}
                                  >
                                    {les.isPublished ? (
                                      <>
                                        <FiEyeOff size={15} className="text-amber-400" />
                                        <span>{isRTL ? "تحويل إلى مسودة" : "Unpublish (Draft)"}</span>
                                      </>
                                    ) : (
                                      <>
                                        <FiEye size={15} className="text-emerald-400" />
                                        <span>{isRTL ? "نشر الدرس" : "Publish Lesson"}</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveLessonDropdown(null);
                                      setDeleteTarget({ type: 'lesson', id: les._id || les.id, title: les.title, name: isRTL ? 'الدرس' : 'Lesson' });
                                    }}
                                    className="w-full px-3 py-2 rounded-xl hover:bg-rose-500/10 text-gray-300 hover:text-rose-400 font-bold text-xs flex items-center gap-2 transition-all text-start cursor-pointer"
                                  >
                                    <FiTrash2 size={15} className="text-rose-400" />
                                    <span>{isRTL ? "حذف الدرس" : "Delete Lesson"}</span>
                                  </button>
                                </div>
                              </>
                            )}
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
                  className="px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white preserve-white font-black text-xs md:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-blue-400/30"
                >
                  <FiPlus size={18} className="stroke-[3] shrink-0" /> <span className="whitespace-nowrap text-white preserve-white">{isRTL ? "إضافة سؤال" : "Add Question"}</span>
                </button>
              </div>

              {subjectQuestions.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {subjectQuestions.map((q) => {
                    const diff = (q.difficulty || 'easy').toLowerCase();
                    const diffBadge = diff === 'hard' 
                      ? 'bg-red-500/10 text-red-400 border-red-500/20'
                      : diff === 'medium'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';

                    return (
                      <div
                        key={q._id || q.id}
                        className="p-4 sm:p-5 rounded-2xl bg-[#0e101a] border border-gray-800/80 hover:border-gray-700 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-start transition-all"
                      >
                        <div className="flex items-start gap-3.5 text-start min-w-0 flex-1">
                          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold shrink-0 mt-0.5">
                            <FiHelpCircle size={18} />
                          </div>
                          <div className="flex flex-col text-start min-w-0 flex-1">
                            <span className="text-sm sm:text-base font-bold text-white leading-snug line-clamp-2">
                              {q.text || q.textAr || q.questionText || (isRTL ? 'بدون نص' : 'Untitled Question')}
                            </span>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase border ${diffBadge}`}>
                                {isRTL ? (diff === 'hard' ? 'صعب' : diff === 'medium' ? 'متوسط' : 'سهل') : diff}
                              </span>
                              {q.options && q.options.length > 0 && (
                                <span className="text-[11px] text-gray-500 font-semibold">
                                  {q.options.length} {isRTL ? "خيارات" : "options"}
                                </span>
                              )}
                              {q.image && (
                                <span className="text-[11px] text-blue-400 font-semibold flex items-center gap-1">
                                  <FiImage size={12} /> {isRTL ? "صورة مرفقة" : "Image"}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => navigate(`/teacher/subjects/${subjectId}/edit-question/${q._id || q.id}`)}
                            className="px-3.5 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-blue-500/20"
                            title={isRTL ? "تعديل السؤال" : "Edit Question"}
                          >
                            <FiEdit3 size={14} /> {isRTL ? "تعديل" : "Edit"}
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget({ type: 'question', id: q._id || q.id, title: q.text || q.textAr || q.questionText, name: isRTL ? 'السؤال' : 'Question' })}
                            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-rose-500/20"
                            title={isRTL ? "حذف السؤال" : "Delete Question"}
                          >
                            <FiTrash2 size={14} /> {isRTL ? "حذف" : "Delete"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center bg-[#0e101a] border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
                  <FiHelpCircle className="text-gray-600 mb-3" size={36} />
                  <span className="text-sm font-bold text-gray-400">{isRTL ? "لم يتم إضافة أسئلة لهذه المادة بعد." : "No questions added for this subject yet."}</span>
                  <button
                    type="button"
                    onClick={() => navigate(`/teacher/subjects/${subjectId}/add-question`)}
                    className="mt-4 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer border border-blue-400/30"
                  >
                    <FiPlus size={16} /> {isRTL ? "إضافة أول سؤال" : "Add First Question"}
                  </button>
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
                  className="px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white preserve-white font-black text-xs md:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-blue-400/30"
                >
                  <FiPlus size={18} className="stroke-[3] shrink-0" /> <span className="whitespace-nowrap text-white preserve-white">{isRTL ? "إنشاء امتحان" : "Create Exam"}</span>
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
                          onClick={() => setDeleteTarget({ type: 'exam', id: ex._id || ex.id, title: ex.title, name: isRTL ? 'الامتحان' : 'Exam' })}
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
                  className="px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white preserve-white font-black text-xs md:text-sm flex items-center justify-center gap-1.5 whitespace-nowrap shrink-0 shadow-[0_4px_20px_rgba(245,158,11,0.35)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-amber-400/30"
                >
                  <FiPlus size={18} className="stroke-[3] shrink-0" /> <span className="whitespace-nowrap text-white preserve-white">{isRTL ? "إضافة موضوع تعثر" : "Add Weakness Topic"}</span>
                </button>
              </div>

              {weaknessTopics.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {weaknessTopics.map((topic, index) => (
                    <div
                      key={topic._id || topic.id}
                      className="p-5 rounded-2xl bg-[#0e101a] border border-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md hover:border-amber-500/30 transition-all text-start"
                    >
                      <div className="flex items-start sm:items-center gap-3.5 text-start min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col items-center justify-center text-amber-500 font-black shrink-0 shadow-sm">
                          <span className="text-sm leading-none">🎯</span>
                          <span className="text-[11px] font-black mt-0.5">#{topic.order || index + 1}</span>
                        </div>
                        <div className="flex flex-col text-start min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-base font-extrabold text-white leading-snug">
                              {topic.title}
                            </h4>
                            {topic.titleAr && (
                              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20 dir-rtl">
                                {topic.titleAr}
                              </span>
                            )}
                          </div>
                          {topic.generalVideoUrl ? (
                            <span className="text-xs text-emerald-500 dark:text-emerald-400 font-semibold mt-1.5 flex items-center gap-1.5">
                              <FiVideo size={13} className="shrink-0" />
                              <span>{isRTL ? "فيديو توضيحي مرتبط:" : "General Video Linked:"}</span>
                              <a href={topic.generalVideoUrl} target="_blank" rel="noreferrer" className="underline truncate max-w-xs hover:text-emerald-600 dark:hover:text-emerald-300 transition-colors">
                                {topic.generalVideoUrl}
                              </a>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 font-semibold mt-1.5 flex items-center gap-1.5">
                              <FiVideoOff size={13} className="shrink-0 text-gray-400" />
                              <span>{isRTL ? "لا يوجد فيديو توضيحي مرتبط" : "No general video linked"}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-800/40 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenEditTopic(topic)}
                          className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-amber-500/30"
                          title={isRTL ? "تعديل الموضوع" : "Edit Topic"}
                        >
                          <FiEdit3 size={15} /> {isRTL ? "تعديل" : "Edit"}
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTarget({ type: 'topic', id: topic._id || topic.id, title: topic.title, name: isRTL ? 'موضوع التعثر' : 'Weakness Topic' })}
                          className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-rose-500/30"
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

      {/* GLOBAL DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <div
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => !isDeleting && setDeleteTarget(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 100, opacity: 0 }}
              className="w-full sm:max-w-md bg-[#0c0d19] border border-gray-800 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-black text-white mb-3">
                {isRTL ? `حذف ${deleteTarget.name}` : `Delete ${deleteTarget.name}`}
              </h3>
              <p className="text-sm text-gray-400 leading-relaxed font-semibold mb-6">
                {isRTL 
                  ? `هل أنت متأكد من أنك تريد حذف "${deleteTarget.title || deleteTarget.name}"؟ لا يمكن التراجع عن هذا الإجراء.`
                  : `Are you sure you want to delete "${deleteTarget.title || deleteTarget.name}"? This action cannot be undone.`}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-3.5 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold text-base transition-all cursor-pointer text-center disabled:opacity-50"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={handleConfirmDelete}
                  className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-base transition-all cursor-pointer text-center shadow-[0_4px_15px_rgba(239,68,68,0.3)] disabled:opacity-50"
                >
                  {isDeleting ? (isRTL ? "جاري الحذف..." : "Deleting...") : (isRTL ? "حذف" : "Delete")}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default SubjectDetails;
