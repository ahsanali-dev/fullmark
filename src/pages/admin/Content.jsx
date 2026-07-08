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
  FiDollarSign
} from 'react-icons/fi';
import { Formik, Form } from 'formik';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllSubjects, createSubject, updateSubject, deleteSubject, fetchAllUsers } from '../../redux/slices/adminSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { SubjectSchema } from '../../schemas/adminSchemas';
import { useLocation } from 'react-router-dom';
import { ContentSkeleton } from '../../components/shared/SkeletonLoading';

// SubjectSchema imported from src/schemas/adminSchemas.js

const Content = () => {
  const dispatch = useDispatch();
  const { subjects, isLoading } = useSelector((state) => state.admin);
  const [teachers, setTeachers] = useState([]);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState(null);
  const [isDescFocused, setIsDescFocused] = useState(false);
  const [isSelectFocused, setIsSelectFocused] = useState(false);

  const location = useLocation();

  useEffect(() => {
    dispatch(fetchAllSubjects());
    dispatch(fetchAllUsers({ role: 'teacher' })).unwrap()
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

  // Toggle switch handler
  const toggleSubjectStatus = async (id, currentStatus) => {
    const loadToast = toast.loading('Updating subject status...');
    try {
      await dispatch(updateSubject({
        id,
        subjectData: { isActive: !currentStatus }
      })).unwrap();
      toast.dismiss(loadToast);
      toast.success('Subject status updated!');
      dispatch(fetchAllSubjects());
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || 'Failed to update subject status');
    }
  };

  // Add Click Handler
  const handleAddClick = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  // Edit Click Handler
  const handleEditClick = (subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };

  // Delete Click Handler
  const handleDeleteClick = (subject) => {
    setDeletingSubject(subject);
    setShowDeleteConfirm(true);
  };

  // Confirm Delete
  const confirmDelete = async () => {
    const loadToast = toast.loading('Deleting subject...');
    try {
      await dispatch(deleteSubject(deletingSubject._id)).unwrap();
      toast.dismiss(loadToast);
      toast.success('Subject deleted successfully!');
      setShowDeleteConfirm(false);
      setDeletingSubject(null);
      dispatch(fetchAllSubjects());
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || 'Failed to delete subject');
    }
  };

  // Form Submit Handler
  const handleFormSubmit = async (values, { resetForm, setSubmitting }) => {
    const loadToast = toast.loading(editingSubject ? 'Saving subject...' : 'Creating subject...');
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
        toast.success('Subject updated successfully!');
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
        toast.success('Subject created successfully!');
      }
      setIsModalOpen(false);
      setEditingSubject(null);
      resetForm();
      dispatch(fetchAllSubjects());
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || 'Failed to submit subject form');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculations for Metrics
  const subjectsList = subjects || [];
  const totalSubjects = subjectsList.length;
  const totalQuestions = subjectsList.reduce((sum, s) => sum + (s.questionsCount || 0), 0);
  const totalStudents = subjectsList.reduce((sum, s) => sum + (s.studentsCount || 0), 0);

  const activeSubjectsCount = subjectsList.filter(s => s.isActive).length;

  // Filtered list
  const filteredSubjects = subjectsList.filter(sub => {
    const nameMatch = sub.name ? sub.name.toLowerCase() : '';
    const teacherName = sub.teacher && typeof sub.teacher === 'object' ? sub.teacher.name : (sub.teacher || '');
    const teacherMatch = teacherName ? teacherName.toLowerCase() : '';

    const matchesSearch =
      nameMatch.includes(searchQuery.toLowerCase()) ||
      teacherMatch.includes(searchQuery.toLowerCase());

    if (filterStatus === 'active') {
      return matchesSearch && sub.isActive;
    }
    if (filterStatus === 'inactive') {
      return matchesSearch && !sub.isActive;
    }
    return matchesSearch;
  });

  const isBlurred = isModalOpen || showDeleteConfirm;

  if (isLoading && subjectsList.length === 0) {
    return (
      <DashboardLayout
        role="admin"
        activeTab="content"
        title="Subjects"
        subtitle="Loading subjects..."
        disableScroll={true}
      >
        <ContentSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      role="admin"
      activeTab="content"
      title="Subjects"
      subtitle={`${totalSubjects} subjects total`}
      isModalOpen={isBlurred}
      disableScroll={true}
    >
      {/* Main Page Content */}
      <div className={`h-full flex flex-col px-4 md:px-8 py-4 overflow-hidden gap-5 animate-fade-in relative transition-all duration-300 ${isBlurred ? 'blur-sm pointer-events-none' : ''}`}>

        {/* Fixed Top Controls Section */}
        <div className="flex flex-col gap-4 shrink-0">
          {/* Search */}
          <div className="relative w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search subjects or teachers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#0e101a] border border-gray-800 rounded-2xl text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            {/* Subjects Metric */}
            <div className="p-4 bg-[#0e101a] border border-red-500/15 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-2xl font-extrabold text-red-400">{totalSubjects}</span>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-500 tracking-wider mt-1 uppercase">Subjects</span>
            </div>
            {/* Questions Metric */}
            <div className="p-4 bg-[#0e101a] border border-yellow-500/15 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-2xl font-extrabold text-yellow-400">{totalQuestions}</span>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-500 tracking-wider mt-1 uppercase">Questions</span>
            </div>
            {/* Students Metric */}
            <div className="p-4 bg-[#0e101a] border border-emerald-500/15 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-2xl font-extrabold text-emerald-400">{totalStudents}</span>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-500 tracking-wider mt-1 uppercase">Students</span>
            </div>
          </div>

          {/* Filters pills */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${filterStatus === 'all'
                  ? 'bg-red-500 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)]'
                  : 'bg-transparent border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${filterStatus === 'active'
                  ? 'bg-red-500 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)]'
                  : 'bg-transparent border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
            >
              Active
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer ${filterStatus === 'inactive'
                  ? 'bg-red-500 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)]'
                  : 'bg-transparent border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                }`}
            >
              Inactive
            </button>
          </div>

          {/* Subjects Row Stats Label */}
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-gray-400">{filteredSubjects.length} subjects</span>
            <span className="text-emerald-400">{activeSubjectsCount} active</span>
          </div>
        </div>

        {/* List of Subjects Cards */}
        <div className="flex-1 overflow-y-auto pr-1 pb-36">
          {filteredSubjects.length === 0 ? (
            <div className="p-8 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-gray-500">No subjects match search criteria</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredSubjects.map((sub) => {
                const teacherName = sub.teacher && typeof sub.teacher === 'object' ? sub.teacher.name : 'Unassigned';
                const formattedDate = sub.createdAt ? new Date(sub.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : '';
                const displayStatus = sub.isActive ? 'active' : 'inactive';

                return (
                  <div
                    key={sub._id}
                    className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-3xl shadow-lg flex flex-col gap-4 relative overflow-hidden"
                  >
                    {/* Top section */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3.5">
                        {/* Book Icon Box */}
                        <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] shrink-0">
                          <FiBookOpen size={22} />
                        </div>
                        <div className="flex flex-col text-left">
                          <h4 className="text-base font-extrabold text-white leading-tight capitalize">{sub.name}</h4>
                          <p className="text-xs text-gray-500 font-semibold mt-1 mb-1 leading-normal">{sub.description}</p>
                          <div className="flex items-center gap-2 mt-1 mb-1 text-[11px] text-gray-500 font-bold">
                            <span className="flex items-center gap-1">
                              <FiUser size={13} className="text-red-400" />
                              <span>{teacherName}</span>
                            </span>
                            <span className="text-gray-700 font-black">•</span>
                            <span className="text-yellow-400">
                              {sub.price === 0 || sub.price === '0' || sub.price === undefined ? 'Free' : `${sub.price} Pts`}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Toggle Switch */}
                      <label className="relative inline-flex items-center cursor-pointer select-none">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={!!sub.isActive}
                          onChange={() => toggleSubjectStatus(sub._id, sub.isActive)}
                        />
                        <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500" />
                      </label>
                    </div>

                    {/* Divider */}
                    <div className="h-[1px] bg-gray-800/50" />

                    {/* Middle details row */}
                    <div className="flex justify-between items-center text-xs font-bold">
                      <div className="flex gap-4 text-gray-400">
                        <span className="flex items-center gap-1">
                          <FiHelpCircle size={14} className="text-red-400" />
                          {sub.questionsCount || 0} Qs
                        </span>
                        <span className="flex items-center gap-1">
                          <FiUsers size={14} className="text-emerald-400" />
                          {sub.studentsCount || 0}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-extrabold uppercase tracking-wider ${sub.isActive
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                            : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
                          }`}>
                          {displayStatus}
                        </span>
                        <span className="text-[10px] text-gray-500">Created {formattedDate}</span>
                      </div>
                    </div>

                    {/* Edit / Delete Buttons */}
                    <div className="flex justify-end gap-2.5 pt-1">
                      <button
                        onClick={() => handleEditClick(sub)}
                        className="flex items-center gap-1 px-4 py-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-2xl text-xs font-extrabold transition-all cursor-pointer"
                      >
                        <FiEdit size={12} />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClick(sub)}
                        className="flex items-center gap-1 px-4 py-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-2xl text-xs font-extrabold transition-all cursor-pointer"
                      >
                        <FiTrash2 size={12} />
                        Delete
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
          className="fixed bottom-26 right-6 lg:bottom-10 lg:right-10 z-30 flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-500 text-white px-5 py-3.5 rounded-2xl font-extrabold shadow-[0_4px_25px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <FiPlus size={18} />
          <span>Add Subject</span>
        </button>

      </div>

      {/* 1. Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-fade-in flex flex-col gap-4 text-left relative">

            {/* Close button */}
            <button
              onClick={() => {
                setIsModalOpen(false);
                setEditingSubject(null);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-black text-white">
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
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
                    label="Subject Title"
                    placeholder="Chemistry"
                    icon={FiBookOpen}
                    roleColor="admin"
                  />

                  <Input
                    name="price"
                    type="number"
                    label="Price (Points)"
                    placeholder="0"
                    icon={FiDollarSign}
                    roleColor="admin"
                  />

                  {/* Description Textarea */}
                  <div className="w-full flex flex-col mb-4 relative select-none">
                    <div className="w-full flex flex-col relative rounded-2xl px-4 py-3 input-3d-admin min-h-[120px] justify-start">
                      <motion.span
                        animate={{
                          y: (isDescFocused || !!values.description) ? -28 : 0,
                          scale: (isDescFocused || !!values.description) ? 0.8 : 1,
                          color: (touched.description && errors.description) ? '#ef4444' : (isDescFocused || !!values.description) ? '#ef4444' : '#9ca3af'
                        }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute left-4 top-3.5 pointer-events-none font-semibold text-sm md:text-base tracking-wide origin-left z-10"
                      >
                        Description
                      </motion.span>
                      <textarea
                        name="description"
                        rows={3}
                        placeholder={isDescFocused ? "Introduce key curriculum topics..." : ""}
                        value={values.description}
                        onChange={handleChange}
                        onFocus={() => setIsDescFocused(true)}
                        onBlur={(e) => {
                          setIsDescFocused(false);
                          handleBlur(e);
                        }}
                        className="w-full bg-transparent border-none text-white text-sm md:text-base font-semibold outline-none focus:ring-0 resize-none pt-4"
                      />
                    </div>
                    {touched.description && errors.description && (
                      <div className="text-red-400 text-xs font-bold mt-1 pl-2">
                        {errors.description}
                      </div>
                    )}
                  </div>

                  {/* Teacher Dropdown */}
                  <div className="w-full flex flex-col mb-4 relative select-none">
                    <div className="w-full flex items-center justify-center relative rounded-2xl px-4 h-15 input-3d-admin">
                      <div className="flex-1 relative h-full flex items-center">
                        <motion.span
                          animate={{
                            y: (isSelectFocused || !!values.teacher) ? -30.5 : 0,
                            scale: (isSelectFocused || !!values.teacher) ? 0.8 : 1,
                            color: (touched.teacher && errors.teacher) ? '#ef4444' : (isSelectFocused || !!values.teacher) ? '#ef4444' : '#9ca3af'
                          }}
                          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                          className="absolute left-0 pointer-events-none font-semibold text-sm md:text-base tracking-wide origin-left z-10"
                        >
                          Assign Teacher
                        </motion.span>
                        <select
                          name="teacher"
                          value={values.teacher}
                          onChange={handleChange}
                          onFocus={() => setIsSelectFocused(true)}
                          onBlur={(e) => {
                            setIsSelectFocused(false);
                            handleBlur(e);
                          }}
                          className="w-full bg-transparent border-none text-white text-sm md:text-base font-semibold pt-4 outline-none focus:ring-0 appearance-none cursor-pointer z-0"
                        >
                          <option value="" className="bg-[#0b0c16] text-gray-500">Select Teacher</option>
                          {teachers && teachers.map((t) => (
                             <option key={t._id} value={t._id} className="bg-[#0b0c16] text-white">
                               {t.name}
                             </option>
                           ))}
                        </select>
                      </div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-red-400 z-10">
                        <FiChevronDown size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    roleColor="admin"
                    disabled={isSubmitting || !(isValid && dirty)}
                    icon={isSubmitting ? undefined : FiCheck}
                    className="w-full mt-2 !rounded-2xl"
                  >
                    {isSubmitting ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                        <span>{editingSubject ? 'Saving Changes...' : 'Creating Subject...'}</span>
                      </span>
                    ) : (
                      editingSubject ? 'Save Changes' : 'Create Subject'
                    )}
                  </Button>

                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}

      {/* 2. Delete Confirmation Modal */}
      {showDeleteConfirm && deletingSubject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-fade-in flex flex-col gap-4 text-left relative">
            <h3 className="text-lg font-black text-white">Delete Subject</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-semibold">
              Are you sure you want to delete the subject <span className="text-red-400 font-extrabold">"{deletingSubject.title}"</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3 mt-2">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingSubject(null);
                }}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-2xl font-bold text-sm transition-all cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-bold text-sm transition-all cursor-pointer text-center shadow-[0_4px_15px_rgba(239,68,68,0.3)]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default Content;
