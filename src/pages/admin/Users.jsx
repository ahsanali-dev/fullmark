import React, { useState, useEffect } from 'react';
import { useFormik, FormikProvider } from 'formik';
import * as Yup from 'yup';
import {
  FiSearch,
  FiChevronDown,
  FiUserPlus,
  FiUser,
  FiMail,
  FiLock,
  FiCheck,
  FiBookOpen,
  FiUsers,
  FiShield,
  FiHeart,
  FiX,
  FiDownload,
  FiPhone,
  FiTag,
  FiClock,
  FiAward,
  FiActivity,
  FiEdit3,
  FiTrash2,
  FiEye,
  FiPower,
  FiGrid,
  FiList
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllUsers,
  createUser,
  updateUser,
  deleteUser,
  toggleUserActive,
  exportUsersExcel,
  fetchAllSubjects,
  fetchDashboardStats
} from '../../redux/slices/adminSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { UsersSkeleton } from '../../components/shared/SkeletonLoading';

const Users = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { users, isLoading, pagination, usersMetrics, stats, subjects } = useSelector((state) => state.admin);

  // URL Query Parameters
  const queryParams = new URLSearchParams(location.search);
  const initialFilter = queryParams.get('filter') || 'all'; // all, subscribed, non_subscribed
  const activeOnlyParam = queryParams.get('activeOnly') === 'true';

  // Filters, sorting & view mode
  const [searchQuery, setSearchQuery] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState(initialFilter);
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all'); // all, student, teacher, parent
  const [selectedCourse, setSelectedCourse] = useState('');
  const [isActiveOnly, setIsActiveOnly] = useState(activeOnlyParam);
  const [sortBy, setSortBy] = useState('Newest');
  const [isExporting, setIsExporting] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUserDetail, setSelectedUserDetail] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);

  useEffect(() => {
    dispatch(fetchAllSubjects());
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Sync state with URL search params when navigating from Dashboard
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filterParam = params.get('filter');
    const activeParam = params.get('activeOnly');
    if (filterParam) {
      setSubscriptionFilter(filterParam);
    }
    if (activeParam !== null) {
      setIsActiveOnly(activeParam === 'true');
    }
  }, [location.search]);

  useEffect(() => {
    dispatch(fetchAllUsers({
      search: searchQuery || undefined,
      filter: subscriptionFilter === 'all' ? undefined : subscriptionFilter,
      role: selectedRoleFilter === 'all' ? undefined : selectedRoleFilter,
      course: selectedCourse || undefined,
      isActive: isActiveOnly ? true : undefined,
      sortBy: sortBy === 'Newest' ? 'createdAt' : '-createdAt',
      limit: 1000
    }));
  }, [dispatch, searchQuery, subscriptionFilter, selectedRoleFilter, selectedCourse, isActiveOnly, sortBy]);

  // Handle Export Excel
  const handleExportExcel = async () => {
    const toastId = toast.loading('Generating Excel file...');
    setIsExporting(true);
    try {
      await dispatch(exportUsersExcel({
        search: searchQuery || undefined,
        filter: subscriptionFilter === 'all' ? undefined : subscriptionFilter,
        role: selectedRoleFilter === 'all' ? undefined : selectedRoleFilter,
        course: selectedCourse || undefined,
        isActive: isActiveOnly ? true : undefined,
      })).unwrap();
      toast.dismiss(toastId);
      toast.success('Excel report downloaded successfully! 📊');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err || 'Failed to export Excel report');
    } finally {
      setIsExporting(false);
    }
  };

  // Delete User Action
  const handleDeleteUser = async (userId) => {
    const toastId = toast.loading('Deleting user account...');
    try {
      await dispatch(deleteUser(userId)).unwrap();
      toast.dismiss(toastId);
      toast.success('User account deleted successfully!');
      setDeleteConfirmUser(null);
      if (selectedUserDetail?._id === userId) {
        setSelectedUserDetail(null);
      }
      dispatch(fetchAllUsers({
        search: searchQuery || undefined,
        filter: subscriptionFilter === 'all' ? undefined : subscriptionFilter,
        role: selectedRoleFilter === 'all' ? undefined : selectedRoleFilter,
        course: selectedCourse || undefined,
        isActive: isActiveOnly ? true : undefined,
        sortBy: sortBy === 'Newest' ? 'createdAt' : '-createdAt',
        limit: 1000
      }));
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err || 'Failed to delete user');
    }
  };

  const totalCount = users.length;

  const getRoleColors = (isSubscribed) => {
    if (isSubscribed) {
      return {
        bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
        badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      };
    }
    return {
      bg: 'bg-amber-500/10 border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]',
      badge: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
    };
  };

  const getRoleAvatarGradient = (role) => {
    const r = (role || 'student').toLowerCase();
    if (r === 'teacher') {
      return 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(168,85,247,0.35)]';
    } else if (r === 'parent') {
      return 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-[0_0_20px_rgba(245,158,11,0.35)]';
    } else if (r === 'admin') {
      return 'bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.35)]';
    }
    return 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_0_20px_rgba(59,130,246,0.35)]';
  };

  const getRoleBadge = (role) => {
    const r = (role || 'student').toLowerCase();
    if (r === 'teacher') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border uppercase bg-purple-500/15 border-purple-500/30 text-purple-300 flex items-center gap-1">
          <FiAward size={11} /> TEACHER
        </span>
      );
    } else if (r === 'parent') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border uppercase bg-amber-500/15 border-amber-500/30 text-amber-300 flex items-center gap-1">
          <FiHeart size={11} /> PARENT
        </span>
      );
    } else if (r === 'admin') {
      return (
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border uppercase bg-red-500/15 border-red-500/30 text-red-300 flex items-center gap-1">
          <FiShield size={11} /> ADMIN
        </span>
      );
    }
    return (
      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider border uppercase bg-blue-500/15 border-blue-500/30 text-blue-300 flex items-center gap-1">
        <FiUser size={11} /> STUDENT
      </span>
    );
  };

  // Add User Formik
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      phone: '',
      role: 'student'
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(3, 'Name must be at least 3 characters')
        .required('Full Name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email address is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      phone: Yup.string().optional()
    }),
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      const toastId = toast.loading('Creating user...');
      try {
        await dispatch(createUser(values)).unwrap();
        toast.dismiss(toastId);
        toast.success(`User ${values.name} created successfully! 🎉`);
        setIsModalOpen(false);
        resetForm();
        dispatch(fetchAllUsers({
          search: searchQuery || undefined,
          filter: subscriptionFilter === 'all' ? undefined : subscriptionFilter,
          role: selectedRoleFilter === 'all' ? undefined : selectedRoleFilter,
          course: selectedCourse || undefined,
          isActive: isActiveOnly ? true : undefined,
        }));
      } catch (err) {
        toast.dismiss(toastId);
        toast.error(err || 'Failed to create user');
      } finally {
        setSubmitting(false);
      }
    }
  });

  // Edit User Formik
  const editFormik = useFormik({
    initialValues: {
      name: editingUser?.name || '',
      email: editingUser?.email || '',
      phone: editingUser?.phone || '',
      role: editingUser?.role || 'student'
    },
    enableReinitialize: true,
    validationSchema: Yup.object({
      name: Yup.string().min(2, 'Too short').required('Full Name is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
      phone: Yup.string().optional(),
      role: Yup.string().required('Role is required')
    }),
    onSubmit: async (values) => {
      if (!editingUser?._id) return;
      const toastId = toast.loading('Updating user profile...');
      try {
        await dispatch(updateUser({ id: editingUser._id, userData: values })).unwrap();
        toast.dismiss(toastId);
        toast.success('User updated successfully!');
        setEditingUser(null);
        if (selectedUserDetail?._id === editingUser._id) {
          setSelectedUserDetail({ ...selectedUserDetail, ...values });
        }
        dispatch(fetchAllUsers({
          search: searchQuery || undefined,
          filter: subscriptionFilter === 'all' ? undefined : subscriptionFilter,
          role: selectedRoleFilter === 'all' ? undefined : selectedRoleFilter,
          course: selectedCourse || undefined,
          isActive: isActiveOnly ? true : undefined,
          limit: 1000
        }));
      } catch (err) {
        toast.dismiss(toastId);
        toast.error(err || 'Failed to update user');
      }
    }
  });

  if (isLoading && users.length === 0) {
    return (
      <DashboardLayout role="admin" activeTab="users" title="User Management" subtitle="Loading users...">
        <UsersSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" activeTab="users" title="User Management" subtitle="Filtered user lists & exports" isModalOpen={isModalOpen || !!selectedUserDetail || !!editingUser || !!deleteConfirmUser}>
      <div className={`w-full flex flex-col p-4 md:p-8 gap-5 animate-fade-in relative transition-all duration-300 ${isModalOpen || selectedUserDetail || editingUser || deleteConfirmUser ? 'blur-sm pointer-events-none' : ''
        }`}>

        {/* Fixed Top Controls Section */}
        <div className="flex flex-col gap-4 shrink-0">

          {/* User Overview Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {/* 1. All Users */}
            <div
              onClick={() => {
                setSubscriptionFilter('all');
                setIsActiveOnly(false);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left ${subscriptionFilter === 'all' && !isActiveOnly
                  ? 'bg-[#0e101a] border-red-500/60 shadow-[0_0_20px_rgba(239,68,68,0.2)]'
                  : 'bg-[#0e101a]/70 border-gray-800 hover:border-gray-700'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-gray-400">Total Registered</span>
                <div className="w-8 h-8 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <FiUsers size={16} />
                </div>
              </div>
              <span className="text-2xl font-black text-white mt-2">
                {usersMetrics?.totalUsers ?? (selectedRoleFilter === 'all' && subscriptionFilter === 'all' ? totalCount : stats?.subscription?.totalRegistered ?? totalCount)}
              </span>
            </div>

            {/* 2. Subscribed */}
            <div 
              onClick={() => {
                setSubscriptionFilter('subscribed');
                setIsActiveOnly(false);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left ${subscriptionFilter === 'subscribed'
                  ? 'bg-[#0e101a] border-emerald-500/60 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                  : 'bg-[#0e101a]/70 border-gray-800 hover:border-gray-700'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-emerald-400">Subscribed</span>
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <FiAward size={16} />
                </div>
              </div>
              <span className="text-2xl font-black text-emerald-400 mt-2">
                {usersMetrics?.subscribedUsers ?? stats?.subscription?.totalSubscribed ?? 0}
              </span>
            </div>

            {/* 3. Non-Subscribed */}
            <div 
              onClick={() => {
                setSubscriptionFilter('non_subscribed');
                setIsActiveOnly(false);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left ${subscriptionFilter === 'non_subscribed'
                  ? 'bg-[#0e101a] border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : 'bg-[#0e101a]/70 border-gray-800 hover:border-gray-700'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-amber-400">Non-Subscribed</span>
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <FiUser size={16} />
                </div>
              </div>
              <span className="text-2xl font-black text-amber-400 mt-2">
                {usersMetrics?.nonSubscribedUsers ?? stats?.subscription?.totalNonSubscribed ?? 0}
              </span>
            </div>

            {/* 4. Active Now */}
            <div 
              onClick={() => {
                setSubscriptionFilter('all');
                setIsActiveOnly(true);
              }}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between text-left ${isActiveOnly
                  ? 'bg-[#0e101a] border-blue-500/60 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                  : 'bg-[#0e101a]/70 border-gray-800 hover:border-gray-700'
                }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-400">Active Now</span>
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <FiActivity size={16} />
                </div>
              </div>
              <span className="text-2xl font-black text-blue-400 mt-2">
                {usersMetrics?.activeUsers ?? stats?.subscription?.totalActive ?? 0}
              </span>
            </div>
          </div>

          {/* Dual Filters Row: Role Filter + Subscription Filter */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Role Filter Tabs */}
            <div className="grid grid-cols-4 p-1.5 bg-[#0c0d19]/90 border border-gray-800 rounded-2xl gap-1">
              {[
                { id: 'all', label: 'All Roles' },
                { id: 'student', label: 'Students' },
                { id: 'teacher', label: 'Teachers' },
                { id: 'parent', label: 'Parents' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedRoleFilter(tab.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${selectedRoleFilter === tab.id
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Subscription Filter Tabs */}
            <div className="grid grid-cols-3 p-1.5 bg-[#0c0d19]/90 border border-gray-800 rounded-2xl gap-1">
              {[
                { id: 'all', label: 'All Users' },
                { id: 'subscribed', label: 'Subscribed' },
                { id: 'non_subscribed', label: 'Non-Subscribed' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSubscriptionFilter(tab.id)}
                  className={`py-2 px-1 rounded-xl text-xs font-extrabold transition-all duration-300 cursor-pointer ${subscriptionFilter === tab.id
                      ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-md'
                      : 'text-gray-400 hover:text-white'
                    }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Total Count Banner + Excel Export Button */}
          <div className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800/80 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 font-black">
                {totalCount}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-sm font-black text-white leading-tight">
                  Category Total: {totalCount} {selectedRoleFilter !== 'all' ? selectedRoleFilter.toUpperCase() + 'S' : 'Users'}
                </span>
                <span className="text-xs text-gray-400 font-semibold mt-0.5">
                  Showing individual detailed records below. Click any card for full details.
                </span>
              </div>
            </div>

            {/* Excel Export Button */}
            <button
              onClick={handleExportExcel}
              disabled={isExporting}
              className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2.5 rounded-xl text-xs font-black shadow-[0_4px_15px_rgba(16,185,129,0.3)] transition-all cursor-pointer disabled:opacity-50"
            >
              <FiDownload size={16} />
              <span>{isExporting ? 'Exporting...' : 'Export Excel'}</span>
            </button>
          </div>

          {/* Search Box and Course Filter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Box */}
            <div className="relative md:col-span-2">
              <FiSearch className="absolute left-4 top-4 text-gray-500 text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone number, email address..."
                className="w-full py-3.5 pl-12 pr-4 bg-[#0e101a]/70 border border-gray-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:border-red-500/50 transition-colors"
              />
            </div>

            {/* Course Filter Dropdown */}
            <div className="relative">
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full py-3.5 px-4 bg-[#0e101a]/70 border border-gray-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:border-red-500/50 appearance-none cursor-pointer"
              >
                <option value="">All Courses</option>
                {subjects?.map((s) => (
                  <option key={s._id} value={s._id} className="bg-[#0e101a]">
                    {s.name}
                  </option>
                ))}
              </select>
              <FiChevronDown className="absolute right-4 top-4 text-gray-400 pointer-events-none" size={16} />
            </div>
          </div>

          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-gray-800/40 pb-2">
            <span className="text-xs font-bold text-gray-400">Displaying {users.length} users</span>

            <div className="flex items-center gap-2">
              {/* Active toggle filter */}
              <button
                onClick={() => setIsActiveOnly(!isActiveOnly)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${isActiveOnly ? 'bg-green-500/20 border border-green-500/40 text-green-400' : 'bg-gray-800/40 border border-gray-700 text-gray-400'
                  }`}
              >
                {isActiveOnly ? '✓ Active Only' : 'Show All Statuses'}
              </button>

              {/* View Mode Toggle Buttons */}
              <div className="flex items-center bg-[#07080e] p-1 border border-gray-800 rounded-xl gap-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'grid' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  title="Grid View"
                >
                  <FiGrid size={15} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${viewMode === 'list' ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  title="List View"
                >
                  <FiList size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* User Cards List / Grid */}
        <div className="w-full pb-28">
          {users.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4.5' : 'flex flex-col gap-4'}>
              {users.map((user, idx) => {
                const isSubscribed = user.isSubscribed || (user.enrolledCourses && user.enrolledCourses.length > 0);
                const colors = getRoleColors(isSubscribed);
                const avatarGradient = getRoleAvatarGradient(user.role);
                const initials = user.name ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'US';
                const createdDate = user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                const activatedDate = user.activatedAt ? new Date(user.activatedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : null;

                if (viewMode === 'grid') {
                  return (
                    <div
                      key={user._id || idx}
                      className="p-5 bg-[#0c0d19]/90 border border-gray-800/80 rounded-[2rem] shadow-xl hover:border-red-500/50 hover:shadow-[0_8px_30px_rgba(239,68,68,0.15)] transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group"
                    >
                      {/* Top Accent Glow Line */}
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      <div>
                        {/* Header: Avatar, Roles & Status */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="relative">
                            <div className={`w-13 h-13 rounded-2xl flex items-center justify-center font-black text-base ${avatarGradient}`}>
                              {initials}
                            </div>
                            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0c0d19] ${user.isActive !== false ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]' : 'bg-gray-500'}`} />
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            {getRoleBadge(user.role)}
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${colors.badge}`}>
                              {isSubscribed ? 'Subscribed' : 'Non-Subscribed'}
                            </span>
                          </div>
                        </div>

                        {/* Name & Contact Info */}
                        <div className="mb-4">
                          <h4
                            onClick={() => setSelectedUserDetail(user)}
                            className="text-base font-black text-white leading-tight hover:text-red-400 transition-colors cursor-pointer mb-2"
                          >
                            {user.name}
                          </h4>

                          <div className="flex flex-col gap-1.5 text-xs text-gray-400 font-semibold">
                            <span className="flex items-center gap-2 truncate bg-[#07080e] px-3 py-1.5 rounded-xl border border-gray-800/60">
                              <FiMail size={13} className="text-red-400 shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </span>
                            <span className="flex items-center gap-2 bg-[#07080e] px-3 py-1.5 rounded-xl border border-gray-800/60">
                              <FiPhone size={13} className="text-emerald-400 shrink-0" />
                              <span>{user.phone || 'No Phone Number'}</span>
                            </span>
                          </div>
                        </div>

                        {/* Subscription Info Box */}
                        {isSubscribed ? (
                          <div className="p-3 bg-[#07080e]/90 border border-emerald-500/20 rounded-2xl flex flex-col gap-2 text-xs mb-4">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                                <FiBookOpen size={12} className="text-emerald-400" /> Courses ({user.enrolledCourses?.length || 0})
                              </span>
                              {user.couponCode && (
                                <span className="font-mono font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 text-[10px]">
                                  {user.couponCode}
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1">
                              {user.enrolledCourses && user.enrolledCourses.length > 0 ? (
                                user.enrolledCourses.map((c) => (
                                  <span key={c._id || c} className="px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 rounded-lg text-[10px] font-bold">
                                    {c.name || 'Course'}
                                  </span>
                                ))
                              ) : (
                                <span className="text-gray-400 text-[11px]">Subscribed Access</span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="p-3 bg-[#07080e]/60 border border-gray-800/60 rounded-2xl flex items-center justify-between text-xs font-semibold text-gray-400 mb-4">
                            <span className="text-[11px]">Joined {createdDate}</span>
                            <span className="text-amber-400 font-bold text-[10px] uppercase">Free Account</span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons Toolbar */}
                      <div className="grid grid-cols-4 gap-1.5 pt-3 border-t border-gray-800/80">
                        <button
                          onClick={() => setSelectedUserDetail(user)}
                          className="py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                          title="View Details"
                        >
                          <FiEye size={14} />
                        </button>

                        <button
                          onClick={() => setEditingUser(user)}
                          className="py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1"
                          title="Edit User"
                        >
                          <FiEdit3 size={14} />
                        </button>

                        <button
                          onClick={() => {
                            dispatch(toggleUserActive(user._id)).unwrap()
                              .then(() => toast.success(`${user.name} status updated!`))
                              .catch(err => toast.error(err || 'Failed to update user status'));
                          }}
                          className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center justify-center ${user.isActive !== false
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                          title={user.isActive !== false ? 'Deactivate User' : 'Activate User'}
                        >
                          <FiPower size={14} />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmUser(user)}
                          className="py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center"
                          title="Delete User"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                }

                {/* List View Card */ }
                return (
                  <div
                    key={user._id || idx}
                    className="p-5 bg-[#0c0d19]/90 border border-gray-800/80 rounded-[1.75rem] shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-red-500/40 transition-all duration-300 text-left group"
                  >
                    {/* User Profile Header */}
                    <div className="flex items-center gap-4 cursor-pointer min-w-0" onClick={() => setSelectedUserDetail(user)}>
                      <div className={`w-13 h-13 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 ${avatarGradient}`}>
                        {initials}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-base font-black text-white leading-tight hover:text-red-400 transition-colors truncate">{user.name}</span>
                          {getRoleBadge(user.role)}
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${colors.badge}`}>
                            {isSubscribed ? 'Subscribed' : 'Non-Subscribed'}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-400 mt-1.5">
                          <span className="flex items-center gap-1.5">
                            <FiMail size={13} className="text-red-400 shrink-0" />
                            <span className="truncate">{user.email}</span>
                          </span>
                          <span className="flex items-center gap-1.5">
                            <FiPhone size={13} className="text-emerald-400 shrink-0" />
                            <span>{user.phone || 'No Phone'}</span>
                          </span>
                          <span className="text-gray-500">• Registered {createdDate}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subscription & Actions toolbar */}
                    <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end border-t md:border-t-0 border-gray-800/60 pt-3 md:pt-0">
                      {isSubscribed && user.couponCode && (
                        <span className="font-mono font-black text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 text-xs hidden lg:inline-block">
                          Coupon: {user.couponCode}
                        </span>
                      )}

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedUserDetail(user)}
                          className="px-3.5 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <FiEye size={14} />
                          <span>Details</span>
                        </button>

                        <button
                          onClick={() => setEditingUser(user)}
                          className="px-3.5 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                        >
                          <FiEdit3 size={14} />
                          <span>Edit</span>
                        </button>

                        <button
                          onClick={() => {
                            dispatch(toggleUserActive(user._id)).unwrap()
                              .then(() => toast.success(`${user.name} status updated!`))
                              .catch(err => toast.error(err || 'Failed to update user status'));
                          }}
                          className={`flex items-center gap-1.5 text-xs font-bold px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${user.isActive !== false
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}
                        >
                          <span className={`w-2 h-2 rounded-full ${user.isActive !== false ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                          <span>{user.isActive !== false ? 'Active' : 'Deactivated'}</span>
                        </button>

                        <button
                          onClick={() => setDeleteConfirmUser(user)}
                          className="p-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl text-xs font-bold transition-all cursor-pointer"
                          title="Delete User Account"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#0c0d19]/40 border border-gray-800 rounded-3xl text-gray-500 font-bold">
              No users found matching selected criteria.
            </div>
          )}
        </div>
      </div>

      {/* Floating Fixed Button to Add User */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-24 right-6 lg:bottom-10 lg:right-10 z-40 flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-500 text-white px-5 py-3.5 rounded-2xl font-extrabold shadow-[0_6px_30px_rgba(239,68,68,0.5)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer border border-red-400/30"
      >
        <FiUserPlus size={18} />
        <span>Add User</span>
      </button>

      {/* 1. Add User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-fade-in flex flex-col gap-4 text-left relative">
            <button
              onClick={() => {
                setIsModalOpen(false);
                formik.resetForm();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-black text-white text-left pr-8">Add New User</h3>

            <FormikProvider value={formik}>
              <form onSubmit={formik.handleSubmit} className="flex flex-col gap-4 mt-2">
                <div className="flex flex-col gap-1 mt-2">
                  <Input
                    name="name"
                    type="text"
                    label="Full Name"
                    placeholder="User Full Name"
                    icon={FiUser}
                    roleColor="admin"
                  />
                  <Input
                    name="email"
                    type="email"
                    label="Email Address"
                    placeholder="email@example.com"
                    icon={FiMail}
                    roleColor="admin"
                  />
                  <Input
                    name="phone"
                    type="text"
                    label="Phone Number"
                    placeholder="+964 7XX XXX XXXX"
                    icon={FiPhone}
                    roleColor="admin"
                  />

                  <div className="flex flex-col gap-1 text-left">
                    <label className="text-xs font-extrabold text-gray-400">Account Role</label>
                    <select
                      name="role"
                      value={formik.values.role}
                      onChange={formik.handleChange}
                      className="w-full py-3 px-4 bg-[#0e101a] border border-gray-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:border-red-500/50"
                    >
                      <option value="student">Student</option>
                      <option value="teacher">Teacher</option>
                      <option value="parent">Parent</option>
                    </select>
                  </div>

                  <Input
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="••••••••"
                    icon={FiLock}
                    showPasswordToggle={true}
                    roleColor="admin"
                  />
                </div>

                <Button
                  type="submit"
                  roleColor="admin"
                  disabled={formik.isSubmitting}
                  icon={formik.isSubmitting ? undefined : FiCheck}
                  className="w-full mt-2 !rounded-2xl"
                >
                  {formik.isSubmitting ? 'Creating...' : 'Create User'}
                </Button>
              </form>
            </FormikProvider>
          </div>
        </div>
      )}

      {/* 2. View User Details Modal */}
      {selectedUserDetail && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 w-full max-w-lg shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-fade-in flex flex-col gap-4 text-left relative overflow-hidden">
            <button
              onClick={() => setSelectedUserDetail(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer z-10"
            >
              <FiX size={20} />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4 border-b border-gray-800/80 pb-4">
              <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-black text-lg">
                {selectedUserDetail.name ? selectedUserDetail.name.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-white">{selectedUserDetail.name}</h3>
                  {getRoleBadge(selectedUserDetail.role)}
                </div>
                <span className="text-xs text-gray-400 font-semibold">{selectedUserDetail.email}</span>
              </div>
            </div>

            {/* Key Information Fields */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#0e101a] border border-gray-800 rounded-2xl flex flex-col gap-1">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Phone Number</span>
                <span className="text-white font-black">{selectedUserDetail.phone || 'N/A'}</span>
              </div>

              <div className="p-3 bg-[#0e101a] border border-gray-800 rounded-2xl flex flex-col gap-1">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Account Status</span>
                <span className={`font-black ${selectedUserDetail.isActive ? 'text-emerald-400' : 'text-red-400'}`}>
                  {selectedUserDetail.isActive ? 'Active' : 'Deactivated'}
                </span>
              </div>

              <div className="p-3 bg-[#0e101a] border border-gray-800 rounded-2xl flex flex-col gap-1">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Registration Date</span>
                <span className="text-gray-300 font-bold">
                  {selectedUserDetail.createdAt ? new Date(selectedUserDetail.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>

              <div className="p-3 bg-[#0e101a] border border-gray-800 rounded-2xl flex flex-col gap-1">
                <span className="text-gray-500 font-bold uppercase text-[10px]">Subscription Status</span>
                <span className={`font-black ${selectedUserDetail.isSubscribed ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {selectedUserDetail.isSubscribed ? 'Subscribed Student' : 'Standard User'}
                </span>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex gap-2 pt-2 border-t border-gray-800/80">
              <button
                onClick={() => {
                  setEditingUser(selectedUserDetail);
                  setSelectedUserDetail(null);
                }}
                className="flex-1 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FiEdit3 size={14} /> Edit Profile
              </button>

              <button
                onClick={() => {
                  dispatch(toggleUserActive(selectedUserDetail._id)).unwrap()
                    .then(() => {
                      toast.success('Account status updated!');
                      setSelectedUserDetail({ ...selectedUserDetail, isActive: !selectedUserDetail.isActive });
                    })
                    .catch(err => toast.error(err || 'Failed to toggle status'));
                }}
                className="flex-1 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FiPower size={14} /> {selectedUserDetail.isActive ? 'Deactivate' : 'Activate'}
              </button>

              <button
                onClick={() => {
                  setDeleteConfirmUser(selectedUserDetail);
                }}
                className="py-2.5 px-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FiTrash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Edit User Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-fade-in flex flex-col gap-4 text-left relative">
            <button
              onClick={() => setEditingUser(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-black text-white text-left pr-8">Edit User Profile</h3>

            <FormikProvider value={editFormik}>
              <form onSubmit={editFormik.handleSubmit} className="flex flex-col gap-4 mt-2">
                <Input
                  name="name"
                  type="text"
                  label="Full Name"
                  placeholder="Name"
                  icon={FiUser}
                  roleColor="admin"
                />

                <Input
                  name="email"
                  type="email"
                  label="Email Address"
                  placeholder="email@example.com"
                  icon={FiMail}
                  roleColor="admin"
                />

                <Input
                  name="phone"
                  type="text"
                  label="Phone Number"
                  placeholder="+964 7XX XXX XXXX"
                  icon={FiPhone}
                  roleColor="admin"
                />

                <div className="flex flex-col gap-1 text-left">
                  <label className="text-xs font-extrabold text-gray-400">Account Role</label>
                  <select
                    name="role"
                    value={editFormik.values.role}
                    onChange={editFormik.handleChange}
                    className="w-full py-3 px-4 bg-[#0e101a] border border-gray-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:border-red-500/50"
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="parent">Parent</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-2xl text-xs font-black hover:bg-gray-700 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={editFormik.isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl text-xs font-black shadow-lg hover:opacity-90 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {editFormik.isSubmitting ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            </FormikProvider>
          </div>
        </div>
      )}

      {/* 4. Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0b0c16] border border-red-500/30 rounded-3xl p-6 w-full max-w-sm shadow-[0_20px_50px_rgba(239,68,68,0.2)] animate-fade-in flex flex-col items-center justify-center text-center gap-4 relative">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 font-black">
              <FiTrash2 size={24} />
            </div>

            <div>
              <h3 className="text-lg font-black text-white">Delete User Account?</h3>
              <p className="text-xs text-gray-400 font-semibold mt-1">
                Are you sure you want to delete <strong className="text-white">{deleteConfirmUser.name}</strong> ({deleteConfirmUser.email})? This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3 w-full pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="flex-1 py-3 bg-gray-800 text-gray-300 rounded-xl text-xs font-black hover:bg-gray-700 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteUser(deleteConfirmUser._id)}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-lg transition-all cursor-pointer"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

    </DashboardLayout>
  );
};

export default Users;
