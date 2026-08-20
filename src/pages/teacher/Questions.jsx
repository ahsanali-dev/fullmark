import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  FiHelpCircle,
  FiPlus,
  FiTrash2,
  FiChevronDown,
  FiBookOpen,
  FiX,
  FiCheck,
  FiChevronLeft,
  FiFileText,
  FiSearch,
  FiSliders,
  FiMoreVertical,
  FiEdit3,
  FiInfo
} from 'react-icons/fi';
import { Formik, Form } from 'formik';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import ModalWrapper from '../../components/shared/ModalWrapper';
import { QuestionSchema } from '../../schemas/questionSchema';
import { useLanguage } from '../../context/LanguageContext';

import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTeacherSubjects,
  fetchQuestions,
  createQuestion,
  deleteQuestion
} from '../../redux/slices/teacherSlice';
import { ContentSkeleton } from '../../components/shared/SkeletonLoading';

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('data:') || path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const baseUrl = import.meta.env.VITE_IMAGE_URL || 'http://146.190.18.35:3008/uploads';
  const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${cleanBase}/${cleanPath}`;
};

const TeacherQuestions = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();
  const [searchParams] = useSearchParams();
  const urlSubjectId = searchParams.get('subject');

  const { subjects = [], questions = [], isLoading } = useSelector((state) => state.teacher);

  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeletingId, setIsDeletingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingQuestion, setDeletingQuestion] = useState(null);

  // pre-select subject if passed in URL
  useEffect(() => {
    if (urlSubjectId) {
      setSelectedSubjectFilter(urlSubjectId);
    }
  }, [urlSubjectId]);

  useEffect(() => {
    dispatch(fetchTeacherSubjects());
    dispatch(fetchQuestions());
  }, [dispatch]);

  const handleAddQuestion = (values, { setSubmitting, resetForm }) => {
    const optionMap = { A: 0, B: 1, C: 2, D: 3 };
    const correctIdx = optionMap[values.correctOption] ?? 0;
    
    toast.promise(
      dispatch(createQuestion({
        subjectId: values.subjectId,
        text: values.text,
        options: [values.optionA, values.optionB, values.optionC, values.optionD],
        correctOption: correctIdx,
      })).unwrap(),
      {
        loading: isRTL ? 'جاري إنشاء السؤال...' : 'Creating question...',
        success: () => {
          resetForm();
          dispatch(fetchTeacherSubjects());
          dispatch(fetchQuestions());
          return isRTL ? 'تم إضافة السؤال بنجاح!' : 'Question added successfully!';
        },
        error: (err) => err || (isRTL ? 'فشل إضافة السؤال' : 'Failed to add question'),
      }
    );
  };

  const handleDeleteClick = (question) => {
    setDeletingQuestion(question);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!deletingQuestion) return;
    const id = deletingQuestion._id || deletingQuestion.id;
    setIsDeletingId(id);
    setShowDeleteConfirm(false);
    const loadingToast = toast.loading(isRTL ? 'جاري حذف السؤال...' : 'Deleting question...');
    try {
      await dispatch(deleteQuestion(id)).unwrap();
      toast.success(isRTL ? 'تم حذف السؤال بنجاح!' : 'Question deleted successfully!', { id: loadingToast });
      dispatch(fetchQuestions());
      setDeletingQuestion(null);
    } catch (err) {
      toast.error(err || (isRTL ? 'فشل حذف السؤال' : 'Failed to delete question'), { id: loadingToast });
    } finally {
      setIsDeletingId(null);
    }
  };

  // Filter logic
  const filteredQuestions = questions.map(q => {
    const qSubjectId = q.subject?._id || q.subject || q.subjectId;
    const rawDiff = q.difficulty || 'easy';
    return {
      ...q,
      id: q._id || q.id,
      subjectId: qSubjectId,
      text: q.text,
      difficulty: rawDiff.charAt(0).toUpperCase() + rawDiff.slice(1).toLowerCase()
    };
  }).filter(q => {
    const matchesSubject = selectedSubjectFilter === 'all' || q.subjectId === selectedSubjectFilter;
    const matchesQuery = q.text.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSubject && matchesQuery;
  });

  const [activeMenuId, setActiveMenuId] = useState(null);

  const totalCount = questions.length;
  const easyCount = questions.filter(q => (q.difficulty || 'Easy').toLowerCase() === 'easy').length;
  const mediumCount = questions.filter(q => (q.difficulty || '').toLowerCase() === 'medium').length;
  const hardCount = questions.filter(q => (q.difficulty || '').toLowerCase() === 'hard').length;

  if (isLoading && !questions.length) {
    return (
      <DashboardLayout
        role="teacher"
        activeTab="questions"
        title={t('teacher.questions.title')}
        subtitle={t('common.loading')}
      >
        <ContentSkeleton />
      </DashboardLayout>
    );
  }
  return (
    <DashboardLayout
      role="teacher"
      activeTab="questions"
      title={t('teacher.questions.title')}
      subtitle={t('teacher.questions.subtitle')}
      isModalOpen={showDeleteConfirm}
    >
      <div className="flex flex-col gap-6 text-start p-6 md:p-8 pb-36">

        {/* Header Block */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-800/40">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/teacher/subjects/select/add-question')}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black shadow-[0_4px_15px_rgba(37,99,235,0.3)] transition-all flex items-center gap-1.5 cursor-pointer text-base"
            >
              <FiPlus size={16} />
              <span>{t('teacher.questions.addQuestion')}</span>
            </button>
            <button
              onClick={() => {
                const query = selectedSubjectFilter && selectedSubjectFilter !== 'all' ? `?subject=${selectedSubjectFilter}` : '';
                navigate(`/teacher/pdf-upload${query}`);
              }}
              className="px-5 py-3 rounded-2xl bg-blue-600/15 hover:bg-blue-600/25 border border-blue-500/30 text-blue-400 font-black transition-all flex items-center gap-1.5 cursor-pointer text-base shadow-md"
            >
              <FiFileText size={16} />
              <span>{t('teacher.dashboard.uploadPdf')}</span>
            </button>
          </div>
        </div>

        {/* Filters & Search Row */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3.5 bg-[#0e101a] border border-gray-800 rounded-2xl text-white text-base font-semibold outline-none focus:border-blue-500/50 placeholder:text-gray-655`}
            />
            <FiSearch className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-500`} size={18} />
          </div>
          <div className="relative w-full md:w-56">
            <FiBookOpen className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-500`} size={16} />
            <select
              value={selectedSubjectFilter}
              onChange={(e) => setSelectedSubjectFilter(e.target.value)}
              className={`w-full ${isRTL ? 'pr-11 pl-10' : 'pl-11 pr-10'} py-3.5 bg-[#0e101a] border border-gray-800 rounded-2xl text-white text-base font-semibold focus:outline-none focus:border-blue-500/50 appearance-none cursor-pointer focus:ring-0`}
            >
              <option value="all">{t('admin.users.filterRoleAll')}</option>
              {subjects.map(s => (
                <option key={s._id || s.id} value={s._id || s.id}>{s.title || s.name}</option>
              ))}
            </select>
            <FiChevronDown className={`text-gray-400 absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none`} />
          </div>
        </div>

        {/* Summary Stat Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 md:gap-4">
          <div className="p-3.5 bg-blue-500/[0.02] border border-blue-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-blue-400 block">{totalCount}</span>
            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1 block">{t('admin.coupons.totalGenerated')}</span>
          </div>
          <div className="p-3.5 bg-emerald-500/[0.02] border border-emerald-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-emerald-400 block">{easyCount}</span>
            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1 block">Easy</span>
          </div>
          <div className="p-3.5 bg-amber-500/[0.02] border border-amber-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-amber-400 block">{mediumCount}</span>
            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1 block">Medium</span>
          </div>
          <div className="p-3.5 bg-red-500/[0.02] border border-red-500/15 rounded-2xl text-center">
            <span className="text-lg md:text-xl font-black text-red-400 block">{hardCount}</span>
            <span className="text-sm text-gray-500 font-bold uppercase tracking-wider mt-1 block">Hard</span>
          </div>
        </div>

        {/* Results Counter & Sort */}
        <div className="flex justify-between items-center text-sm font-bold text-gray-400 px-1">
          <span>{filteredQuestions.length} {isRTL ? "نتيجة" : "results"}</span>
          <div className="flex items-center gap-1.5 text-blue-450 hover:text-blue-400 cursor-pointer">
            <FiSliders size={13} />
            <span>{isRTL ? "الأحدث" : "Newest"}</span>
          </div>
        </div>

        {/* Questions list */}
        {filteredQuestions.length === 0 ? (
          <div className="p-12 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-[2rem] flex flex-col items-center justify-center">
            <FiHelpCircle className="text-gray-650 mb-3" size={40} />
            <span className="text-lg font-extrabold text-gray-500">{isRTL ? "لم يتم العثور على أسئلة" : "No questions found"}</span>
            <p className="text-base text-gray-600 font-semibold mt-1">{isRTL ? "جرب البحث بصياغة مختلفة أو تحقق من الفلاتر" : "Try searching a different wording or check filters"}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredQuestions.map((q) => {
              const subObj = subjects.find(s => (s._id || s.id) === q.subjectId);

              const optionsList = [
                { key: 'A', val: q.options?.[0] || q.optionA, img: q.optionImages?.[0] },
                { key: 'B', val: q.options?.[1] || q.optionB, img: q.optionImages?.[1] },
                { key: 'C', val: q.options?.[2] || q.optionC, img: q.optionImages?.[2] },
                { key: 'D', val: q.options?.[3] || q.optionD, img: q.optionImages?.[3] }
              ].filter(opt => opt.val && typeof opt.val === 'string' && opt.val.trim() !== '');

              const optionKeys = ['A', 'B', 'C', 'D'];
              const correctKey = typeof q.correctOption === 'number' ? optionKeys[q.correctOption] : q.correctOption;

              return (
                <div
                  key={q.id}
                  className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-[2rem] shadow-lg flex flex-col gap-4 relative text-start transition-all duration-300 hover:border-gray-700 animate-fade-in"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* Icon Box with blue glow */}
                      <div className="w-11 h-11 rounded-full bg-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(37,99,235,0.4)] shrink-0">
                        <FiHelpCircle size={18} />
                      </div>
                      <div>
                        <h4 className="text-lg font-extrabold text-white leading-tight capitalize max-w-[140px] md:max-w-[280px] truncate">
                          {q.text}
                        </h4>
                        <span className="text-sm text-gray-500 font-bold mt-1 block uppercase font-semibold">
                          {subObj ? subObj.title || subObj.name : (isRTL ? "غير مسند" : "Unassigned")}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === q.id ? null : q.id);
                        }}
                        className="p-2 rounded-xl hover:bg-white/5 text-gray-450 hover:text-white transition-all cursor-pointer shrink-0"
                      >
                        <FiMoreVertical size={16} />
                      </button>

                      {/* Dropdown Menu */}
                      {activeMenuId === q.id && (
                        <div className={`absolute ${isRTL ? 'left-0' : 'right-0'} top-10 bg-[#0c0d19] border border-gray-800 rounded-2xl shadow-xl p-1.5 z-20 flex flex-col gap-0.5 w-28 text-sm font-bold`}>
                          <button
                            onClick={() => {
                              navigate(`/teacher/subjects/${q.subjectId}/edit-question/${q.id}`);
                              setActiveMenuId(null);
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl cursor-pointer w-full text-start"
                          >
                            <FiEdit3 size={13} />
                            <span>{isRTL ? "تعديل" : "Edit"}</span>
                          </button>
                          <button
                            onClick={() => {
                              handleDeleteClick(q);
                              setActiveMenuId(null);
                            }}
                            disabled={isDeletingId === q.id}
                            className="flex items-center gap-2 px-3 py-2 text-red-500 hover:bg-red-500/10 rounded-xl cursor-pointer w-full text-start disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FiTrash2 size={13} />
                            <span>{isRTL ? "حذف" : "Delete"}</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Optional Question Image */}
                  {q.image && (
                    <div className="w-full rounded-2xl overflow-hidden border border-gray-800/80 max-h-48 mt-1 flex items-center justify-center bg-black/40">
                      <img 
                        src={getImageUrl(q.image)} 
                        alt="Question Visual" 
                        className="max-h-48 object-contain"
                      />
                    </div>
                  )}

                  {/* Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                    {optionsList.map((opt) => {
                      const isCorrect = correctKey === opt.key;
                      return (
                        <div
                          key={opt.key}
                          className={`text-base font-semibold px-4 py-3 rounded-2xl border flex flex-col gap-2 transition-all ${isCorrect
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold'
                            : 'bg-gray-950/20 border-gray-800 text-gray-400'
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className={`text-base font-black ${isRTL ? 'ml-0.5' : 'mr-0.5'} ${isCorrect ? 'text-emerald-400' : 'text-gray-500'
                              }`}>
                              {opt.key}.
                            </span>
                            <span>{opt.val}</span>
                          </div>
                          {opt.img && (
                            <div className="w-full rounded-xl overflow-hidden border border-gray-800/60 max-h-24 bg-black/10 flex items-center justify-center mt-1">
                              <img 
                                src={getImageUrl(opt.img)} 
                                alt={`Option ${opt.key} Visual`} 
                                className="max-h-24 object-contain"
                              />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Divider */}
                  <div className="border-t border-gray-800/40 my-1" />

                  {/* Badges & Actions bottom row */}
                  <div className="flex justify-between items-center text-sm font-black uppercase text-gray-500 tracking-wider pt-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400">
                        MCQ
                      </span>
                      <span className={`px-2.5 py-1 rounded-lg border ${q.difficulty === 'Easy' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                        q.difficulty === 'Medium' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                          'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                        {(() => {
                          const d = (q.difficulty || 'easy').toLowerCase();
                          if (isRTL) {
                            return d === 'easy' ? 'سهل' : d === 'medium' ? 'متوسط' : 'صعب';
                          }
                          return d.charAt(0).toUpperCase() + d.slice(1);
                        })()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          toast.success(isRTL ? 'التوضيح: الإجابات الصحيحة مبرزة باللون الأخضر.' : 'Explanation: Correct answers are highlighted in emerald.');
                        }}
                        className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-amber-500 hover:bg-amber-500/10 transition-all cursor-pointer"
                        title={isRTL ? "إظهار التوضيح" : "Show Explanation"}
                      >
                        <FiInfo size={13} />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(q)}
                        className="p-1.5 rounded-lg bg-gray-900 border border-gray-800 text-red-500 hover:bg-red-500/10 transition-all cursor-pointer"
                        title={isRTL ? "حذف السؤال" : "Delete Question"}
                      >
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: DELETE CONFIRMATION */}
      <AnimatePresence>
        {showDeleteConfirm && deletingQuestion && (
          <div
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeletingQuestion(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 100, opacity: 0 }}
              className="w-full sm:max-w-md bg-[#0c0d19] border border-gray-800 rounded-[2.5rem] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-start"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-black text-white mb-4">{isRTL ? "حذف السؤال" : "Delete Question"}</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-semibold mb-6">
                {isRTL ? "هل أنت تأكد من أنك تريد حذف هذا السؤال؟ لا يمكن التراجع عن هذا الإجراء." : "Are you sure you want to delete this question? This action cannot be undone."}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingQuestion(null);
                  }}
                  className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold text-base transition-all cursor-pointer text-center"
                >
                  {isRTL ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="flex-1 py-4 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-base transition-all cursor-pointer text-center shadow-[0_4px_15px_rgba(239,68,68,0.3)]"
                >
                  {isRTL ? "حذف" : "Delete"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default TeacherQuestions;
