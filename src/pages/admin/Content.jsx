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
          <div className="grid grid-cols-2 p-1 sm:p-1.5 bg-[#0c0d19] border border-gray-800 rounded-2xl gap-1">
            <button
              onClick={() => setContentTab('subjects')}
              className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-300 cursor-pointer min-w-0 ${
                contentTab === 'subjects'
                  ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_4px_20px_rgba(239,68,68,0.3)]'
                  : 'text-gray-400 hover:text-white'
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
                  : 'text-gray-400 hover:text-white'
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
                <FiSearch className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} />
                <input
                  type="text"
                  placeholder={isRTL ? "البحث عن المواد أو المعلمين..." : "Search subjects or teachers..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full ${isRTL ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'} py-2.5 sm:py-3 bg-[#0e101a] border border-gray-800 rounded-2xl text-white text-xs sm:text-sm focus:outline-none focus:border-red-500/50`}
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
                    className={`flex-1 sm:flex-none px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-xs font-bold capitalize transition-all cursor-pointer text-center ${
                      filterStatus === st.id
                        ? 'bg-red-500 text-white shadow-md'
                        : 'bg-[#0e101a] border border-gray-800 text-gray-400'
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
                <div className="p-8 text-center bg-[#0c0d19]/40 border border-gray-800 rounded-3xl text-gray-500 font-bold">
                  {isRTL ? "لم يتم العثور على مواد." : "No subjects found."}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSubjects.map((sub) => {
                    const teacherName = sub.teacher && typeof sub.teacher === 'object' ? sub.teacher.name : (isRTL ? 'غير معين' : 'Unassigned');

                    return (
                      <div
                        key={sub._id}
                        className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-3xl shadow-lg flex flex-col gap-4 relative overflow-hidden text-start"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                              <FiBookOpen size={22} />
                            </div>
                            <div className="text-start">
                              <h4 className="text-base font-extrabold text-white leading-tight capitalize">{sub.name}</h4>
                              <p className="text-xs text-gray-400 mt-1">{sub.description}</p>
                              <span className="text-[11px] text-gray-500 font-bold block mt-1">
                                {isRTL ? `المعلم: ${teacherName}` : `Teacher: ${teacherName}`}
                              </span>
                            </div>
                          </div>

                          <label className="relative inline-flex items-center cursor-pointer select-none">
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={!!sub.isActive}
                              onChange={() => toggleSubjectStatus(sub._id, sub.isActive)}
                            />
                            <div className={`w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:${isRTL ? '-translate-x-full' : 'translate-x-full'} peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:${isRTL ? 'right-[2px]' : 'left-[2px]'} after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500`} />
                          </label>
                        </div>

                        <div className="flex justify-end gap-2 pt-2 border-t border-gray-800/50">
                          <button
                            onClick={() => handleEditClick(sub)}
                            className="px-4 py-2 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold cursor-pointer hover:bg-red-500/10 transition-colors"
                          >
                            {isRTL ? "تعديل" : "Edit"}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(sub)}
                            className="px-4 py-2 border border-red-500/20 text-red-400 rounded-2xl text-xs font-bold cursor-pointer hover:bg-red-500/10 transition-colors"
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
            <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-[#0e101a] border border-gray-800 rounded-2xl p-4">
              
              <div className="flex flex-1 gap-3 w-full">
                {/* Search */}
                <div className="relative flex-1">
                  <FiSearch className={`absolute ${isRTL ? 'right-3.5' : 'left-3.5'} top-1/2 -translate-y-1/2 text-gray-400`} size={16} />
                  <input
                    type="text"
                    placeholder={isRTL ? "البحث عن عنوان الدرس..." : "Search lesson title..."}
                    value={lessonSearch}
                    onChange={(e) => setLessonSearch(e.target.value)}
                    className={`w-full ${isRTL ? 'pr-10 pl-4 text-right' : 'pl-10 pr-4 text-left'} py-2.5 bg-[#07080e] border border-gray-800 rounded-xl text-xs font-bold text-white focus:outline-none`}
                  />
                </div>

                {/* Course Filter */}
                <select
                  value={selectedSubjectFilter}
                  onChange={(e) => setSelectedSubjectFilter(e.target.value)}
                  className={`py-2.5 px-3 bg-[#07080e] border border-gray-800 rounded-xl text-xs font-bold text-white focus:outline-none cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}
                >
                  <option value="">{isRTL ? "جميع المواد" : "All Courses"}</option>
                  {subjects?.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Bulk Toggle Buttons (Requirement 10) */}
              <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                <button
                  onClick={handleSelectAllLessons}
                  className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {selectedLessonIds.length === filteredLessons.length ? (isRTL ? 'إلغاء تحديد الكل' : 'Deselect All') : (isRTL ? 'تحديد الكل' : 'Select All')}
                </button>

                <button
                  onClick={() => handleBulkToggleFree(true)}
                  disabled={selectedLessonIds.length === 0}
                  className="px-3.5 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-black hover:bg-emerald-500/30 transition-all cursor-pointer disabled:opacity-40"
                >
                  {isRTL ? "تعيين المحدد مجاني" : "Mark Selected Free"}
                </button>

                <button
                  onClick={() => handleBulkToggleFree(false)}
                  disabled={selectedLessonIds.length === 0}
                  className="px-3.5 py-2 bg-amber-500/20 border border-amber-500/30 text-amber-400 rounded-xl text-xs font-black hover:bg-amber-500/30 transition-all cursor-pointer disabled:opacity-40"
                >
                  {isRTL ? "تعيين المحدد مدفوع" : "Mark Selected Paid"}
                </button>
              </div>

            </div>

            {/* Lessons List (Requirement 10) */}
            <div className="flex-1 overflow-y-auto pr-1 pb-36">
              {filteredLessons.length === 0 ? (
                <div className="p-12 text-center bg-[#0c0d19]/40 border border-gray-800 rounded-3xl text-gray-500 font-bold">
                  {isRTL ? "لم يتم العثور على دروس تلتزم بالتصفية." : "No lessons found matching filters."}
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {filteredLessons.map((lesson) => {
                    const isSelected = selectedLessonIds.includes(lesson._id);
                    const isFree = lesson.isFree;
                    const subjectName = lesson.subject?.name || (isRTL ? 'مادة' : 'Subject');

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
                        className={`p-4 bg-[#0e101a] border rounded-2xl flex items-center justify-between gap-4 transition-all duration-300 text-start cursor-pointer ${
                          isSelected ? 'border-red-500/60 bg-red-500/5' : 'border-gray-800/80 hover:border-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-3.5">
                          {/* Checkbox */}
                          <div className="text-gray-400">
                            {isSelected ? <FiCheckSquare className="text-red-400" size={18} /> : <FiSquare size={18} />}
                          </div>

                          {/* Lesson Details */}
                          <div className="flex flex-col text-start">
                            <span className="text-sm font-extrabold text-white leading-tight">{lesson.title}</span>
                            <span className="text-xs text-gray-400 font-semibold mt-0.5">{subjectName}</span>
                          </div>
                        </div>

                        {/* Status Badge & Toggle Action */}
                        <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 ${
                            isFree 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                              : 'bg-amber-500/10 border border-amber-500/20 text-amber-400'
                          }`}>
                            {isFree ? <FiUnlock size={12} /> : <FiLock size={12} />}
                            {isFree ? (isRTL ? 'معاينة مجانية' : 'Free Preview') : (isRTL ? 'درس مدفوع' : 'Paid Lesson')}
                          </span>

                          <button
                            onClick={() => handleToggleLessonFree(lesson._id, lesson.isFree)}
                            className="px-3 py-1.5 bg-[#07080e] border border-gray-800 hover:border-gray-700 text-xs font-bold text-gray-300 rounded-xl transition-all cursor-pointer"
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
          <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-fade-in flex flex-col gap-4 text-start relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingSubject(null);
              }}
              className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} text-gray-500 hover:text-white transition-colors cursor-pointer`}
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-black text-white text-start">
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
                    <label className="text-xs font-bold text-gray-400">{isRTL ? "الوصف" : "Description"}</label>
                    <textarea
                      name="description"
                      rows={3}
                      value={values.description}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      className={`w-full bg-[#07080e] border border-gray-800 rounded-2xl p-3 text-white text-sm focus:outline-none ${isRTL ? 'text-right' : 'text-left'}`}
                    />
                  </div>

                  <div className="flex flex-col gap-1 text-start">
                    <label className="text-xs font-bold text-gray-400">{isRTL ? "المعلم" : "Teacher"}</label>
                    <select
                      name="teacher"
                      value={values.teacher}
                      onChange={handleChange}
                      className={`w-full bg-[#07080e] border border-gray-800 rounded-2xl p-3 text-white text-sm focus:outline-none cursor-pointer ${isRTL ? 'text-right' : 'text-left'}`}
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
          <div className="bg-[#0b0c16] border border-red-500/30 rounded-3xl p-6 w-full max-w-sm shadow-[0_20px_50px_rgba(239,68,68,0.2)] animate-fade-in flex flex-col items-center justify-center text-center gap-4 relative">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 font-black">
              <FiTrash2 size={24} />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">
                {isRTL ? "حذف المادة؟" : "Delete Subject?"}
              </h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">
                {isRTL ? (
                  <>هل أنت تأكد من رغبتك في حذف مادة <strong className="text-white">{deletingSubject.name}</strong>؟ لا يمكن التراجع عن هذا الإجراء.</>
                ) : (
                  <>Are you sure you want to delete <strong className="text-white">{deletingSubject.name}</strong>? This action cannot be undone.</>
                )}
              </p>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingSubject(null);
                }}
                className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl text-xs font-black hover:bg-gray-700 transition-all cursor-pointer"
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
