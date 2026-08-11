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
  uploadSubjectBanner
} from '../../redux/slices/teacherSlice';
import { ContentSkeleton } from '../../components/shared/SkeletonLoading';
import { getImageUrl } from '../../utils/imageUrl';

const SubjectDetails = () => {
  const navigate = useNavigate();
  const { subjectId } = useParams();
  const dispatch = useDispatch();
  const bannerInputRef = useRef(null);

  const { subjects = [], units = [], questions = [], exams: examsList = [], lessons = [], isLoading } = useSelector((state) => state.teacher);

  const [activeTab, setActiveTab] = useState('lessons'); // 'units' | 'lessons' | 'questions' | 'exams'
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

  // Banner upload state
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  useEffect(() => {
    dispatch(fetchTeacherSubjects());
    dispatch(fetchSubjectUnits(subjectId));
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
    title: 'Unknown Subject',
    description: 'No description available',
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
      toast.error('Only image files are allowed for subject banner');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image size must be less than 10MB');
      return;
    }

    setIsUploadingBanner(true);
    const loadingToast = toast.loading('Uploading banner image...');

    try {
      await dispatch(uploadSubjectBanner({ subjectId, file })).unwrap();
      toast.success('Subject banner updated! 🎨', { id: loadingToast });
      dispatch(fetchTeacherSubjects());
    } catch (err) {
      toast.error(err || 'Failed to upload banner', { id: loadingToast });
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
      toast.error('Unit title is required');
      return;
    }

    setIsSubmittingUnit(true);
    const loadingToast = toast.loading(editingUnit ? 'Updating unit...' : 'Creating unit...');

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
        toast.success('Unit updated successfully!', { id: loadingToast });
      } else {
        await dispatch(createUnit({
          subjectId,
          title: unitTitle,
          titleAr: unitTitleAr,
          order: Number(unitOrder)
        })).unwrap();
        toast.success('Unit created successfully! 📁', { id: loadingToast });
      }

      setIsUnitModalOpen(false);
      dispatch(fetchSubjectUnits(subjectId));
    } catch (err) {
      toast.error(err || 'Failed to save unit', { id: loadingToast });
    } finally {
      setIsSubmittingUnit(false);
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (!window.confirm('Are you sure you want to delete this unit?')) return;
    const loadingToast = toast.loading('Deleting unit...');

    try {
      await dispatch(deleteUnit(unitId)).unwrap();
      toast.success('Unit deleted successfully!', { id: loadingToast });
      dispatch(fetchSubjectUnits(subjectId));
    } catch (err) {
      toast.error(err || 'Failed to delete unit', { id: loadingToast });
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
      toast.error('Failed to reorder unit');
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
    const loadingToast = toast.loading('Cancelling exam...');
    try {
      await dispatch(deleteExam(id)).unwrap();
      toast.success('Exam cancelled successfully!', { id: loadingToast });
      dispatch(fetchExams());
      setDeletingExam(null);
    } catch (err) {
      toast.error(err || 'Failed to cancel exam', { id: loadingToast });
    } finally {
      setIsDeletingId(null);
    }
  };

  if (isLoading && !lessons.length && !questions.length && !examsList.length) {
    return (
      <DashboardLayout
        role="teacher"
        activeTab="subjects"
        title={subject.title}
        subtitle="Loading Subject Hub..."
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
      subtitle="Subject Hub"
      isModalOpen={showDeleteConfirm || isUnitModalOpen}
    >
      <div className="w-full max-w-full p-6 md:p-8 pb-32 text-left flex flex-col gap-6 animate-fade-in relative">

        {/* Premium Banner Header */}
        <div className="relative w-full bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 p-6 md:p-8 text-white overflow-hidden rounded-[2.5rem] shadow-2xl min-h-[220px] flex flex-col justify-between border border-blue-400/20">
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
              title="Back to Subjects"
            >
              <FiChevronLeft size={22} />
            </button>

            {/* Upload Banner Button */}
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={isUploadingBanner}
              className="px-4.5 py-2.5 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/30 backdrop-blur-md text-xs font-black text-white flex items-center gap-2 transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
            >
              <FiImage size={17} />
              {isUploadingBanner ? 'Uploading Banner...' : 'Change Course Banner'}
            </button>
          </div>

          {/* Subject info row */}
          <div className="relative z-10 flex items-center gap-4.5 my-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-inner shrink-0 backdrop-blur-md">
              <FiBookOpen size={28} />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight">{subject.title}</h2>
              <p className="text-base text-white/80 font-medium mt-1">{subject.description}</p>
            </div>
          </div>

          {/* Stats Badge Grid */}
          <div className="relative z-10 grid grid-cols-4 gap-1 border-t border-white/10 pt-4 mt-2">
            <div className="flex flex-col items-center text-center">
              <FiFolder size={16} className="text-white/70" />
              <span className="text-lg font-black mt-1">{units.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/50 mt-0.5">Units</span>
            </div>
            <div className="flex flex-col items-center text-center border-l border-white/10">
              <FiBookOpen size={16} className="text-white/70" />
              <span className="text-lg font-black mt-1">{subjectLessons.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/50 mt-0.5">Lessons</span>
            </div>
            <div className="flex flex-col items-center text-center border-l border-white/10">
              <FiHelpCircle size={16} className="text-white/70" />
              <span className="text-lg font-black mt-1">{subjectQuestions.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/50 mt-0.5">Questions</span>
            </div>
            <div className="flex flex-col items-center text-center border-l border-white/10">
              <FiFileText size={16} className="text-white/70" />
              <span className="text-lg font-black mt-1">{subjectExams.length}</span>
              <span className="text-[10px] font-black tracking-wider uppercase text-white/50 mt-0.5">Exams</span>
            </div>
          </div>
        </div>

        {/* Tab Selection Switch */}
        <div className="p-1.5 bg-[#0a0b14]/80 backdrop-blur-md border border-gray-800/80 rounded-2xl w-full grid grid-cols-2 sm:grid-cols-4 gap-1.5 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab('units')}
            className={`py-3 px-4 text-center font-black text-xs sm:text-sm rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'units'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.01]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <FiFolder size={16} /> Units ({units.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lessons')}
            className={`py-3 px-4 text-center font-black text-xs sm:text-sm rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'lessons'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.01]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <FiBookOpen size={16} /> Lessons ({subjectLessons.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={`py-3 px-4 text-center font-black text-xs sm:text-sm rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'questions'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.01]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <FiHelpCircle size={16} /> Questions ({subjectQuestions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('exams')}
            className={`py-3 px-4 text-center font-black text-xs sm:text-sm rounded-xl transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 ${activeTab === 'exams'
              ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.4)] border border-blue-400/30 scale-[1.01]'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <FiFileText size={16} /> Exams ({subjectExams.length})
          </button>
        </div>

        {/* Tab Contents Area */}
        <div className="w-full">
          {/* TAB 1: UNITS */}
          {activeTab === 'units' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-white">Course Units</h3>
                  <p className="text-xs text-gray-500 font-semibold">Organize lessons into collapsible unit chapters</p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenAddUnit}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs md:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-blue-400/30"
                >
                  <FiPlus size={18} className="stroke-[3]" /> Add Unit
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
                        className="p-5 rounded-2xl bg-[#0e101a] border border-gray-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md hover:border-gray-700 transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black shrink-0">
                            #{unit.order || index + 1}
                          </div>
                          <div>
                            <h4 className="text-base font-extrabold text-white flex items-center gap-2">
                              {unit.title}
                              {unit.titleAr && <span className="text-xs font-normal text-gray-400">({unit.titleAr})</span>}
                            </h4>
                            <span className="text-xs text-gray-500 font-semibold mt-0.5 block">
                              {unitLessonsCount} lesson(s) assigned
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleReorderUnit(unit, 'up')}
                            className="p-2.5 rounded-xl bg-gray-900/80 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 transition-all cursor-pointer border border-gray-800 hover:border-blue-500/30"
                            title="Move Unit Up"
                          >
                            <FiArrowUp size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReorderUnit(unit, 'down')}
                            className="p-2.5 rounded-xl bg-gray-900/80 hover:bg-blue-600/20 text-gray-400 hover:text-blue-400 transition-all cursor-pointer border border-gray-800 hover:border-blue-500/30"
                            title="Move Unit Down"
                          >
                            <FiArrowDown size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenEditUnit(unit)}
                            className="px-3.5 py-2.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-blue-500/20"
                            title="Edit Unit"
                          >
                            <FiEdit3 size={15} /> Edit
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteUnit(unit._id || unit.id)}
                            className="px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-rose-500/20"
                            title="Delete Unit"
                          >
                            <FiTrash2 size={15} /> Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center bg-[#0e101a] border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
                  <FiFolder className="text-gray-600 mb-3" size={36} />
                  <span className="text-sm font-bold text-gray-400">No units created for this subject yet.</span>
                  <span className="text-xs text-gray-600 mt-1">Create units to group your lessons into organized modules.</span>
                  <button
                    type="button"
                    onClick={handleOpenAddUnit}
                    className="mt-4 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all cursor-pointer border border-blue-400/30"
                  >
                    <FiPlus size={16} /> Create First Unit
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: LESSONS */}
          {activeTab === 'lessons' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-gray-500 uppercase">
                  Lesson List
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/teacher/subjects/${subjectId}/add-lesson`)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs md:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-blue-400/30"
                >
                  <FiPlus size={18} className="stroke-[3]" /> Add Lesson
                </button>
              </div>

              {subjectLessons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjectLessons.map((les) => {
                    const lessonUnit = units.find(u => (u._id || u.id) === (les.unit?._id || les.unit || les.unitId));

                    return (
                      <div
                        key={les._id || les.id}
                        className="p-5 rounded-2xl bg-[#0e101a] border border-gray-800/80 hover:border-gray-700 transition-all flex flex-col justify-between gap-4 text-left group"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                              Module {les.order || 1} {lessonUnit ? `• ${lessonUnit.title}` : ''}
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
                              title="Edit Lesson"
                            >
                              <FiEdit3 size={15} /> Edit
                            </button>
                          </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-850 pt-3 text-xs text-gray-500 font-semibold">
                          <span className="flex items-center gap-1">
                            <FiClock size={14} /> {les.duration || 0} mins
                          </span>
                          <span className={`px-2.5 py-1 rounded-lg font-black text-[10px] uppercase ${les.isPublished ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {les.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-12 text-center bg-[#0e101a] border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
                  <FiBookOpen className="text-gray-600 mb-3" size={36} />
                  <span className="text-sm font-bold text-gray-400">No lessons uploaded yet for this subject.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: QUESTIONS */}
          {activeTab === 'questions' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-gray-500 uppercase">
                  Question Bank
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/teacher/subjects/${subjectId}/add-question`)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs md:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-blue-400/30"
                >
                  <FiPlus size={18} className="stroke-[3]" /> Add Question
                </button>
              </div>

              {subjectQuestions.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {subjectQuestions.map((q) => (
                    <div
                      key={q._id || q.id}
                      className="p-4 rounded-2xl bg-[#0e101a] border border-gray-800/80 flex items-center justify-between gap-4 text-left"
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white line-clamp-1">{q.questionText}</span>
                        <span className="text-xs text-gray-500 font-semibold mt-0.5">
                          Type: {q.type || 'MCQ'} • Difficulty: {q.difficulty || 'Medium'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate(`/teacher/questions/${q._id || q.id}/edit`)}
                        className="px-3 py-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 hover:text-blue-300 font-extrabold text-xs flex items-center gap-1.5 transition-all cursor-pointer border border-blue-500/20"
                      >
                        <FiEdit3 size={15} /> Edit
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-[#0e101a] border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
                  <FiHelpCircle className="text-gray-600 mb-3" size={36} />
                  <span className="text-sm font-bold text-gray-400">No questions added for this subject yet.</span>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: EXAMS */}
          {activeTab === 'exams' && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black tracking-widest text-gray-500 uppercase">
                  Exams & Tests
                </span>
                <button
                  type="button"
                  onClick={() => navigate(`/teacher/subjects/${subjectId}/create-exam`)}
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs md:text-sm flex items-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.35)] hover:shadow-[0_6px_25px_rgba(37,99,235,0.5)] transition-all duration-300 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer border border-blue-400/30"
                >
                  <FiPlus size={18} className="stroke-[3]" /> Create Exam
                </button>
              </div>

              {subjectExams.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subjectExams.map((ex) => (
                    <div
                      key={ex._id || ex.id}
                      className="p-5 rounded-2xl bg-[#0e101a] border border-gray-800/80 flex flex-col justify-between gap-4 text-left"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h4 className="text-base font-extrabold text-white">{ex.title}</h4>
                          <span className="text-xs text-gray-500 font-semibold mt-1 block">
                            {ex.questions?.length || 0} Questions • Duration: {ex.duration || 0} mins
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteClick(ex)}
                          className="px-3 py-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 font-extrabold text-xs flex items-center gap-1.5 transition-all border border-rose-500/20 cursor-pointer"
                          title="Cancel Exam"
                        >
                          <FiTrash2 size={15} /> Cancel
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center bg-[#0e101a] border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
                  <FiFileText className="text-gray-600 mb-3" size={36} />
                  <span className="text-sm font-bold text-gray-400">No exams created for this subject yet.</span>
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
              className="w-full max-w-md bg-[#0e101a] border border-gray-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-5 text-left relative"
            >
              <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                <h3 className="text-lg font-black text-white">
                  {editingUnit ? 'Edit Unit' : 'Create New Unit'}
                </h3>
                <button
                  onClick={() => setIsUnitModalOpen(false)}
                  className="p-2 rounded-full hover:bg-gray-800 text-gray-400 hover:text-white"
                >
                  <FiX size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveUnit} className="flex flex-col gap-4">
                <Input
                  label="Unit Title (English)"
                  type="text"
                  value={unitTitle}
                  onChange={(e) => setUnitTitle(e.target.value)}
                  placeholder="e.g. Unit 1: Foundations"
                  required
                  roleColor="teacher"
                />

                <Input
                  label="Unit Title (Arabic - Optional)"
                  type="text"
                  value={unitTitleAr}
                  onChange={(e) => setUnitTitleAr(e.target.value)}
                  placeholder="مثال: الوحدة الأولى"
                  roleColor="teacher"
                />

                <Input
                  label="Display Order"
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
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingUnit}
                    className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-xs font-black text-white shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all cursor-pointer border border-blue-400/30 disabled:opacity-50"
                  >
                    {isSubmittingUnit ? 'Saving...' : editingUnit ? 'Update Unit' : 'Create Unit'}
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
