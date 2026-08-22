import { useState, useEffect } from 'react';
import {
  FiBookOpen,
  FiSearch,
  FiUser,
  FiUsers,
  FiHelpCircle,
  FiEdit,
  FiTrash2,
  FiPlus,
  FiCheck,
  FiX,
  FiChevronDown,
  FiDollarSign,
  FiVideo,
  FiUnlock,
  FiLock,
  FiCheckSquare,
  FiSquare
} from 'react-icons/fi';
import { Formik, Form } from 'formik';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllSubjects, 
  createSubject, 
  updateSubject, 
  deleteSubject, 
  fetchAllUsers,
  fetchAdminLessons,
  toggleLessonFree,
  bulkToggleLessonFree 
} from '../../redux/slices/adminSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { SubjectSchema } from '../../schemas/adminSchemas';
import { useLocation } from 'react-router-dom';
import { ContentSkeleton } from '../../components/shared/SkeletonLoading';
import { useLanguage } from '../../context/LanguageContext';

const Content = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const { t, isRTL } = useLanguage();

  const { subjects, lessons, isLoading } = useSelector((state) => state.admin);
  const [teachers, setTeachers] = useState([]);

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

  // Content Sub-tab: 'subjects' or 'lessons' (Requirement 10)
  const [contentTab, setContentTab] = useState('subjects');

  // Subjects States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState(null);

  // Lessons Free-Preview Management States (Requirement 10)
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('');
  const [lessonSearch, setLessonSearch] = useState('');
  const [selectedLessonIds, setSelectedLessonIds] = useState([]);

  useEffect(() => {
    dispatch(fetchAllSubjects());
    dispatch(fetchAdminLessons());
    dispatch(fetchAllUsers({ role: 'teacher', limit: 1000 })).unwrap()
      .then((res) => {
        setTeachers(res.users || []);
      })
      .catch(() => {});
  }, [dispatch]);

  useEffect(() => {
    if (location.state?.openAddModal) {
      setTimeout(() => {
        setEditingSubject(null);
        setIsModalOpen(true);
      }, 0);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Toggle Free Preview for single lesson (Requirement 10)
  const handleToggleLessonFree = async (lessonId, currentFree) => {
    const toastId = toast.loading(isRTL ? 'جاري تحديث حالة المعاينة...' : 'Updating lesson preview status...');
    try {
      await dispatch(toggleLessonFree(lessonId)).unwrap();
      toast.dismiss(toastId);
      toast.success(isRTL ? `تم تحديد الدرس كـ ${!currentFree ? 'معاينة مجانية' : 'درس مدفوع'}!` : `Lesson marked as ${!currentFree ? 'Free Preview' : 'Paid Lesson'}!`);
      dispatch(fetchAdminLessons({ subjectId: selectedSubjectFilter || undefined }));
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err || (isRTL ? 'فشل تحديث حالة الدرس' : 'Failed to update lesson status'));
    }
  };

  // Bulk Toggle Free Preview (Requirement 10)
  const handleBulkToggleFree = async (isFree) => {
    if (selectedLessonIds.length === 0) {
      toast.error(isRTL ? 'يرجى تحديد درس واحد على الأقل.' : 'Please select at least one lesson.');
      return;
    }

    const toastId = toast.loading(isRTL ? `جاري تحديث ${selectedLessonIds.length} درساً...` : `Updating ${selectedLessonIds.length} lesson(s)...`);
    try {
      await dispatch(bulkToggleLessonFree({ lessonIds: selectedLessonIds, isFree })).unwrap();
      toast.dismiss(toastId);
      toast.success(isRTL ? `تم تحديث ${selectedLessonIds.length} درساً إلى ${isFree ? 'معاينة مجانية' : 'درس مدفوع'}!` : `Updated ${selectedLessonIds.length} lesson(s) to ${isFree ? 'Free Preview' : 'Paid Lesson'}!`);
      setSelectedLessonIds([]);
      dispatch(fetchAdminLessons({ subjectId: selectedSubjectFilter || undefined }));
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err || (isRTL ? 'فشل التحديث الجماعي' : 'Failed bulk update'));
    }
  };

  // Select all lessons in current view
  const handleSelectAllLessons = () => {
    if (selectedLessonIds.length === filteredLessons.length) {
      setSelectedLessonIds([]);
    } else {
      setSelectedLessonIds(filteredLessons.map(l => l._id));
    }
  };

  // Toggle Subject Status
  const toggleSubjectStatus = async (id, currentStatus) => {
    const loadToast = toast.loading(isRTL ? 'جاري تحديث حالة المادة...' : 'Updating subject status...');
    try {
      await dispatch(updateSubject({
        id,
        subjectData: { isActive: !currentStatus }
      })).unwrap();
      toast.dismiss(loadToast);
      toast.success(isRTL ? 'تم تحديث حالة المادة!' : 'Subject status updated!');
      dispatch(fetchAllSubjects());
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || (isRTL ? 'فشل تحديث حالة المادة' : 'Failed to update subject status'));
    }
  };

  const handleAddClick = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (subject) => {
    setDeletingSubject(subject);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    const loadToast = toast.loading(isRTL ? 'جاري حذف المادة...' : 'Deleting subject...');
    try {
      await dispatch(deleteSubject(deletingSubject._id)).unwrap();
      toast.dismiss(loadToast);
      toast.success(isRTL ? 'تم حذف المادة بنجاح!' : 'Subject deleted successfully!');
      setShowDeleteConfirm(false);
      setDeletingSubject(null);
      dispatch(fetchAllSubjects());
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || (isRTL ? 'فشل حذف المادة' : 'Failed to delete subject'));
    }
  };

  const handleFormSubmit = async (values, { resetForm, setSubmitting }) => {
    const loadToast = toast.loading(editingSubject ? (isRTL ? 'جاري حفظ المادة...' : 'Saving subject...') : (isRTL ? 'جاري إنشاء المادة...' : 'Creating subject...'));
    try {
      if (editingSubject) {
        await dispatch(updateSubject({
          id: editingSubject._id,
          subjectData: {
            name: values.title,
            description: values.description,
            teacher: values.teacher || null,
            price: Number(values.price),
          }
        })).unwrap();
        toast.dismiss(loadToast);
        toast.success(isRTL ? 'تم تحديث المادة بنجاح!' : 'Subject updated successfully!');
      } else {
        await dispatch(createSubject({
          name: values.title,
          description: values.description,
          teacher: values.teacher || null,
          price: Number(values.price),
          colorTop: '#ef4444',
          colorBottom: '#f43f5e',
          icon: 'FiBookOpen',
          grade: 'Primary',
        })).unwrap();
        toast.dismiss(loadToast);
        toast.success(isRTL ? 'تم إنشاء المادة بنجاح!' : 'Subject created successfully!');
      }
      setIsModalOpen(false);
      setEditingSubject(null);
      resetForm();
      dispatch(fetchAllSubjects());
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || (isRTL ? 'فشل إرسال نموذج المادة' : 'Failed to submit subject form'));
    } finally {
      setSubmitting(false);
    }
  };

  const subjectsList = subjects || [];
  const totalSubjects = subjectsList.length;

  const filteredSubjects = subjectsList.filter(sub => {
    const nameMatch = sub.name ? sub.name.toLowerCase() : '';
    const teacherName = sub.teacher && typeof sub.teacher === 'object' ? sub.teacher.name : (sub.teacher || '');
    const teacherMatch = teacherName ? teacherName.toLowerCase() : '';

    const matchesSearch =
      nameMatch.includes(searchQuery.toLowerCase()) ||
      teacherMatch.includes(searchQuery.toLowerCase());

    if (filterStatus === 'active') return matchesSearch && sub.isActive;
    if (filterStatus === 'inactive') return matchesSearch && !sub.isActive;
    return matchesSearch;
  });

  const filteredLessons = (lessons || []).filter(l => {
    const titleMatch = l.title ? l.title.toLowerCase().includes(lessonSearch.toLowerCase()) : false;
    const subjectMatch = selectedSubjectFilter ? (l.subject?._id === selectedSubjectFilter || l.subject === selectedSubjectFilter) : true;
    return titleMatch && subjectMatch;
  });

  const isBlurred = isModalOpen || showDeleteConfirm;

  if (isLoading && subjectsList.length === 0 && lessons.length === 0) {
    return (
      <DashboardLayout role="admin" activeTab="content" title={t('admin.content.title')} subtitle={t('common.loading')} disableScroll={true}>
        <ContentSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="admin"
      activeTab="content"
      title={t('admin.content.title')}
      subtitle={t('admin.content.subtitle')}
      isModalOpen={isBlurred}
      disableScroll={true}
    >
      <div className={`h-full flex flex-col px-3.5 sm:px-6 md:px-8 py-3 sm:py-4 overflow-hidden gap-4 sm:gap-5 animate-fade-in relative transition-all duration-300 ${isBlurred ? 'blur-sm pointer-events-none' : ''}`}>

        {/* Top Controls Section */}
        <div className="flex flex-col gap-4 shrink-0">
          
          {/* Segmented Control: Subjects vs Lessons */}
          <div className={`grid grid-cols-2 p-1 sm:p-1.5 rounded-2xl gap-1 border ${
            isLight ? 'bg-slate-100 border-slate-200' : 'bg-[#0c0d19] border-gray-800'
          }`}>
            <button
              onClick={() => setContentTab('subjects')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer min-w-0 ${
                contentTab === 'subjects'
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)]'
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white')
              }`}
            >
              <FiBookOpen className="text-sm sm:text-base shrink-0" />
              <span className="truncate">{isRTL ? `المواد (${totalSubjects})` : `Subjects (${totalSubjects})`}</span>
            </button>

            <button
              onClick={() => setContentTab('lessons')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer min-w-0 ${
                contentTab === 'lessons'
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)]'
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-white')
              }`}
            >
              <FiVideo className="text-sm sm:text-base shrink-0" />
              <span className="truncate">{isRTL ? "الدروس المجانية" : "Free Lessons"}</span>
            </button>
          </div>

        </div>

        {/* 1. Subjects View */}
        {contentTab === 'subjects' && (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <div className="relative flex-1">
                <FiSearch className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-400'}`} size={16} />
                <input
                  type="text"
                  placeholder={isRTL ? "البحث عن المواد أو المعلمين..." : "Search subjects or teachers..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm focus:outline-none transition-colors border ${
                    isLight 
                      ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-red-500/50 shadow-sm' 
                      : 'bg-[#0e101a] border-gray-800 text-white focus:border-red-500/50'
                  }`}
                />
              </div>
              <div className="flex gap-1.5 sm:gap-2">
                {[
                  { id: 'all', label: isRTL ? 'الكل' : 'all' },
                  { id: 'active', label: isRTL ? 'نشط' : 'active' },
                  { id: 'inactive', label: isRTL ? 'معطل' : 'inactive' }
                ].map((st) => (
                  <button
                    key={st.id}
                    onClick={() => setFilterStatus(st.id)}
                    className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold capitalize transition-all cursor-pointer text-center border ${
                      filterStatus === st.id
                        ? 'bg-red-500 text-white shadow-md border-red-500'
                        : (isLight ? 'bg-white border-slate-200 text-slate-600 hover:text-slate-900 shadow-sm' : 'bg-[#0e101a] border-gray-800 text-gray-400 hover:text-white')
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List of Subjects Cards */}
            <div className="flex-1 overflow-y-auto pr-1 pb-36">
              {filteredSubjects.length === 0 ? (
                <div className={`p-8 text-center border rounded-3xl font-bold ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#0c0d19]/40 border-gray-800 text-gray-500'
                }`}>
                  {isRTL ? "لم يتم العثور على مواد." : "No subjects found."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSubjects.map((sub) => {
                    const teacherName = sub.teacher && typeof sub.teacher === 'object' ? sub.teacher.name : (isRTL ? 'غير معين' : 'Unassigned');

                    return (
                      <div
                        key={sub._id}
                        className={`p-5 rounded-3xl shadow-lg flex flex-col gap-4 relative overflow-hidden text-start border transition-all ${
                          isLight 
                            ? 'bg-white border-slate-200 shadow-slate-200/50' 
                            : 'bg-[#0e101a] border-gray-800/80'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 shrink-0">
                              <FiBookOpen size={22} />
                            </div>
                            <div className="text-start">
                              <h4 className={`text-base font-extrabold leading-tight capitalize ${isLight ? 'text-slate-900' : 'text-white'}`}>{sub.name}</h4>
                              <p className={`text-xs mt-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{sub.description || (isRTL ? 'لا يوجد وصف' : 'No description')}</p>
                              <span className={`text-[11px] font-bold block mt-1 ${isLight ? 'text-slate-400' : 'text-gray-500'}`}>
                                {isRTL ? `المعلم: ${teacherName}` : `Teacher: ${teacherName}`}
                              </span>
                            </div>
                          </div>

                          {/* Dynamic Active Switcher */}
                          <label className="relative inline-flex items-center cursor-pointer select-none shrink-0" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={!!sub.isActive}
                              onChange={() => toggleSubjectStatus(sub._id, sub.isActive)}
                            />
                            <div className={`w-12 h-6.5 rounded-full transition-colors duration-300 relative p-1 flex items-center ${
                              sub.isActive 
                                ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.35)]' 
                                : (isLight ? 'bg-slate-300 border border-slate-300' : 'bg-gray-800 border border-gray-700')
                            }`}>
                              <div className={`w-4.5 h-4.5 bg-white rounded-full shadow-md transform transition-transform duration-300 ${
                                sub.isActive
                                  ? (isRTL ? '-translate-x-5.5' : 'translate-x-5.5')
                                  : 'translate-x-0'
                              }`} />
                            </div>
                          </label>
                        </div>

                        <div className={`flex justify-end gap-2 pt-2 border-t ${isLight ? 'border-slate-100' : 'border-gray-800/50'}`}>
                          <button
                            onClick={() => handleEditClick(sub)}
                            className={`px-4 py-2 border rounded-2xl text-xs font-bold cursor-pointer transition-colors ${
                              isLight 
                                ? 'border-slate-200 text-slate-700 hover:bg-slate-100' 
                                : 'border-red-500/20 text-red-400 hover:bg-red-500/10'
                            }`}
                          >
                            {isRTL ? "تعديل" : "Edit"}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(sub)}
                            className={`px-4 py-2 border rounded-2xl text-xs font-bold cursor-pointer transition-colors ${
                              isLight 
                                ? 'border-red-200 text-red-600 hover:bg-red-50' 
                                : 'border-red-500/20 text-red-400 hover:bg-red-500/10'
                            }`}
                          >
                            {isRTL ? "حذف" : "Delete"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Floating Add Subject Button */}
            <button 
              onClick={handleAddClick}
              className={`fixed bottom-26 ${isRTL ? 'left-6 lg:left-10' : 'right-6 lg:right-10'} lg:bottom-10 z-30 flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-500 text-white px-5 py-3.5 rounded-2xl font-extrabold shadow-[0_4px_25px_rgba(239,68,68,0.4)] hover:scale-105 transition-all cursor-pointer`}
            >
              <FiPlus size={18} />
              <span>{isRTL ? "إضافة مادة" : "Add Subject"}</span>
            </button>
          </div>
        )}

        {/* 2. Free Preview & Lesson Management View (Requirement 10) */}
        {contentTab === 'lessons' && (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            
            {/* Filter and Bulk Action Bar */}
            <div className={`flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between border rounded-2xl p-4 transition-colors ${
              isLight ? 'bg-white border-slate-200 shadow-sm' : 'bg-[#0e101a] border-gray-800'
            }`}>
              
              <div className="flex flex-1 gap-3 w-full flex-col sm:flex-row">
                {/* Search */}
                <div className="relative flex-1">
                  <FiSearch className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-400'}`} size={16} />
                  <input
                    type="text"
                    placeholder={isRTL ? "البحث عن عنوان الدرس..." : "Search lesson title..."}
                    value={lessonSearch}
                    onChange={(e) => setLessonSearch(e.target.value)}
                    className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2.5 rounded-xl text-xs font-bold focus:outline-none border transition-colors ${
                      isLight 
                        ? 'bg-slate-100 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-red-500' 
                        : 'bg-[#07080e] border-gray-800 text-white focus:border-red-500/50'
                    }`}
                  />
                </div>

                {/* Course Filter */}
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold focus:outline-none cursor-pointer border transition-colors ${isRTL ? 'text-right' : 'text-left'} ${
                    isLight 
                      ? 'bg-slate-100 border-slate-200 text-slate-900 focus:border-red-500' 
                      : 'bg-[#07080e] border-gray-800 text-white'
                  }`}
                >
                  <option value="">{isRTL ? "جميع المواد" : "All Courses"}</option>
                  {subjects?.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Bulk Toggle Buttons (Requirement 10) */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 w-full lg:flex lg:w-auto items-center py-0.5">
                <button
                  onClick={handleSelectAllLessons}
                  className={`w-full lg:w-auto px-1.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-bold cursor-pointer transition-all duration-200 flex items-center justify-center gap-1 sm:gap-1.5 border min-w-0 ${
                    isLight 
                      ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 shadow-sm' 
                      : 'bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200'
                  }`}
                >
                  <FiCheckSquare size={13} className={`shrink-0 ${selectedLessonIds.length === filteredLessons.length ? 'text-red-500' : 'text-slate-400'}`} />
                  <span className="truncate">{selectedLessonIds.length === filteredLessons.length ? (isRTL ? 'إلغاء التحديد' : 'Deselect') : (isRTL ? 'تحديد الكل' : 'Select All')}</span>
                </button>

                <button
                  onClick={() => handleBulkToggleFree(true)}
                  disabled={selectedLessonIds.length === 0}
                  className={`w-full lg:w-auto px-1.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all duration-200 cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1 sm:gap-1.5 border shadow-sm min-w-0 ${
                    isLight 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600 shadow-emerald-600/20' 
                      : 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/30'
                  }`}
                >
                  <FiUnlock size={13} className="shrink-0" />
                  <span className="truncate">{isRTL ? "تعيين مجاني" : "Mark Free"}</span>
                </button>

                <button
                  onClick={() => handleBulkToggleFree(false)}
                  disabled={selectedLessonIds.length === 0}
                  className={`w-full lg:w-auto px-1.5 sm:px-3 py-2 sm:py-2.5 rounded-xl text-[10px] sm:text-xs font-black transition-all duration-200 cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1 sm:gap-1.5 border shadow-sm min-w-0 ${
                    isLight 
                      ? 'bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-amber-600/20' 
                      : 'bg-amber-500/20 border-amber-500/30 text-amber-400 hover:bg-amber-500/30'
                  }`}
                >
                  <FiLock size={13} className="shrink-0" />
                  <span className="truncate">{isRTL ? "تعيين مدفوع" : "Mark Paid"}</span>
                </button>
              </div>

            </div>

            {/* Lessons List (Requirement 10) */}
            <div className="flex-1 overflow-y-auto pr-1 pb-36">
              {filteredLessons.length === 0 ? (
                <div className={`p-12 text-center border rounded-3xl font-bold ${
                  isLight ? 'bg-slate-50 border-slate-200 text-slate-500' : 'bg-[#0c0d19]/40 border-gray-800 text-gray-500'
                }`}>
                  {isRTL ? "لم يتم العثور على دروس تلتزم بالتصفية." : "No lessons found matching filters."}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredLessons.map((lesson) => {
                    const isSelected = selectedLessonIds.includes(lesson._id);
                    const isFree = lesson.isFree;

                    // Resolve Subject Name dynamically from subjectsList
                    const subjectId = lesson.subject?._id || lesson.subject;
                    const foundSub = subjectsList.find(s => s._id === subjectId);
                    const subjectName = foundSub?.name || lesson.subject?.name || (isRTL ? 'مادة' : 'Subject');

                    return (
                      <div
                        key={lesson._id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedLessonIds(selectedLessonIds.filter(id => id !== lesson._id));
                          } else {
                            setSelectedLessonIds([...selectedLessonIds, lesson._id]);
                          }
                        }}
                        className={`p-3.5 sm:p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all duration-300 text-start cursor-pointer border ${
                          isSelected 
                            ? (isLight ? 'border-red-500 bg-red-50/60 shadow-sm' : 'border-red-500/60 bg-red-500/5') 
                            : (isLight ? 'bg-white border-slate-200 hover:border-slate-300 shadow-sm' : 'bg-[#0e101a] border-gray-800/80 hover:border-gray-700')
                        }`}
                      >
                        {/* Title & Subject Info */}
                        <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                          {/* Checkbox */}
                          <div className={`shrink-0 mt-0.5 sm:mt-0 ${isLight ? 'text-slate-400' : 'text-gray-400'}`}>
                            {isSelected ? <FiCheckSquare className="text-red-500" size={20} /> : <FiSquare size={20} />}
                          </div>

                          {/* Lesson Details - Full un-truncated title */}
                          <div className="flex flex-col text-start min-w-0 flex-1">
                            <span className={`text-sm font-black leading-snug break-words ${isLight ? 'text-slate-900' : 'text-white'}`}>{lesson.title}</span>
                            <span className={`text-xs font-semibold mt-0.5 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>{subjectName}</span>
                          </div>
                        </div>

                        {/* Status Badge & Action Controls */}
                        <div className={`flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-2.5 sm:pt-0 border-t sm:border-t-0 ${isLight ? 'border-slate-100' : 'border-gray-800/60'}`} onClick={(e) => e.stopPropagation()}>
                          <span className={`px-2.5 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 border shrink-0 ${
                            isFree 
                              ? (isLight ? 'bg-emerald-100 border-emerald-300 text-emerald-800' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400') 
                              : (isLight ? 'bg-amber-100 border-amber-300 text-amber-800' : 'bg-amber-500/10 border-amber-500/20 text-amber-400')
                          }`}>
                            {isFree ? <FiUnlock size={11} /> : <FiLock size={11} />}
                            {isFree ? (isRTL ? 'معاينة مجانية' : 'Free Preview') : (isRTL ? 'درس مدفوع' : 'Paid Lesson')}
                          </span>

                          <button
                            onClick={() => handleToggleLessonFree(lesson._id, lesson.isFree)}
                            className={`px-3.5 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer shadow-sm shrink-0 ${
                              isFree 
                                ? (isLight ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30')
                                : (isLight ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30')
                            }`}
                          >
                            {isFree ? (isRTL ? 'جعله مدفوعاً' : 'Make Paid') : (isRTL ? 'جعله مجانياً' : 'Make Free')}
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Add / Edit Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 w-full max-w-md shadow-2xl z-50 animate-fade-in flex flex-col gap-4 text-start relative ${
            isLight ? 'bg-white border-slate-200 text-slate-900' : 'bg-[#0b0c16] border-gray-800 text-white'
          }`}>
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingSubject(null);
              }}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} transition-colors cursor-pointer ${
                isLight ? 'text-slate-400 hover:text-slate-900' : 'text-gray-500 hover:text-white'
              }`}
            >
              <FiX size={20} />
            </button>

            <h3 className={`text-xl font-black text-start ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {editingSubject ? (isRTL ? 'تعديل المادة' : 'Edit Subject') : (isRTL ? 'إضافة مادة جديدة' : 'Add New Subject')}
            </h3>

            <Formik
              initialValues={{
                title: editingSubject ? editingSubject.name : '',
                description: editingSubject ? editingSubject.description : '',
                teacher: editingSubject ? (editingSubject.teacher && typeof editingSubject.teacher === 'object' ? editingSubject.teacher._id : (editingSubject.teacher || '')) : '',
                price: editingSubject ? (editingSubject.price !== undefined ? editingSubject.price : 0) : 0,
              }}
              validationSchema={SubjectSchema}
              onSubmit={handleFormSubmit}
            >
              {({ values, handleChange, handleBlur, touched, errors, isValid, dirty, isSubmitting }) => (
                <Form className="flex flex-col gap-4 mt-2">
                  <Input
                    name="title"
                    type="text"
                    label={isRTL ? "اسم المادة" : "Subject Title"}
                    placeholder={isRTL ? "الكيمياء" : "Chemistry"}
                    icon={FiBookOpen}
                    roleColor="admin"
                  />
                  <Input
                    name="price"
                    type="number"
                    label={isRTL ? "السعر ($)" : "Price ($)"}
                    placeholder="0"
                    icon={FiDollarSign}
                    roleColor="admin"
                  />
                  
                  <div className="flex flex-col gap-1 text-start">
                    <label className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{isRTL ? "الوصف" : "Description"}</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full border rounded-2xl p-3 text-sm focus:outline-none ${isRTL ? 'text-right' : 'text-left'} ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#07080e] border-gray-800 text-white'
                      }`}
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-start">
                    <label className={`text-xs font-bold ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>{isRTL ? "المعلم" : "Teacher"}</label>
                    <select
                      name="teacher"
                      value={values.teacher}
                      onChange={handleChange}
                      className={`w-full border rounded-2xl p-3 text-sm focus:outline-none cursor-pointer ${isRTL ? 'text-right' : 'text-left'} ${
                        isLight ? 'bg-slate-50 border-slate-200 text-slate-900' : 'bg-[#07080e] border-gray-800 text-white'
                      }`}
                    >
                      <option value="">{isRTL ? "اختر المعلم" : "Select Teacher"}</option>
                      {teachers?.map((t) => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>

                  <Button
                    type="submit"
                    roleColor="admin"
                    disabled={isSubmitting || !(isValid && dirty)}
                    icon={isSubmitting ? undefined : FiCheck}
                    className="w-full mt-2 !rounded-2xl cursor-pointer"
                  >
                    {isSubmitting ? (isRTL ? 'جاري الحفظ...' : 'Saving...') : editingSubject ? (isRTL ? 'حفظ التغييرات' : 'Save Changes') : (isRTL ? 'إنشاء المادة' : 'Create Subject')}
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deletingSubject && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className={`border rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-fade-in flex flex-col items-center justify-center text-center gap-4 relative ${
            isLight ? 'bg-white border-red-200' : 'bg-[#0b0c16] border-red-500/30'
          }`}>
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 font-black">
              <FiTrash2 size={24} />
            </div>

            <div>
              <h3 className={`text-lg font-black ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {isRTL ? "حذف المادة؟" : "Delete Subject?"}
              </h3>
              <p className={`text-xs font-semibold mt-1 ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                {isRTL ? (
                  <>هل أنت تأكد من رغبتك في حذف مادة <strong className={isLight ? 'text-slate-900' : 'text-white'}>{deletingSubject.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.</>
                ) : (
                  <>Are you sure you want to delete <strong className={isLight ? 'text-slate-900' : 'text-white'}>{deletingSubject.name}</strong>? This action cannot be undone.</>
                )}
              </p>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingSubject(null);
                }}
                className={`flex-1 py-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  isLight ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer"
              >
                {isRTL ? "حذف المادة" : "Delete Subject"}
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default Content;
