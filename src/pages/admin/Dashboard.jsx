import { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiBookOpen, 
  FiActivity, 
  FiCalendar, 
  FiTrendingUp, 
  FiUserPlus, 
  FiPlusCircle, 
  FiAward,
  FiX,
  FiUser,
  FiMail,
  FiLock,
  FiCheck,
  FiHeart,
  FiChevronDown,
  FiDollarSign,
  FiShield,
  FiArrowRight,
  FiPhone
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { Formik, Form, useFormik, FormikProvider } from 'formik';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats, createUser, createSubject, fetchAllUsers } from '../../redux/slices/adminSlice';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { DashboardSkeleton } from '../../components/shared/SkeletonLoading';
import { UserSchema, SubjectSchema } from '../../schemas/adminSchemas';

// Role avatar and badge styling helpers matching Users page
const getRoleAvatarGradient = (role) => {
  switch (role?.toLowerCase()) {
    case 'student':
      return 'bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]';
    case 'teacher':
      return 'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.3)]';
    case 'parent':
      return 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-[0_0_15px_rgba(245,158,11,0.3)]';
    case 'admin':
      return 'bg-gradient-to-br from-red-600 to-rose-600 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]';
    default:
      return 'bg-gradient-to-br from-gray-700 to-gray-900 text-white';
  }
};

const getRoleBadge = (role) => {
  switch (role?.toLowerCase()) {
    case 'student':
      return {
        label: 'Student',
        Icon: FiUser,
        badgeClass: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400'
      };
    case 'teacher':
      return {
        label: 'Teacher',
        Icon: FiAward,
        badgeClass: 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
      };
    case 'parent':
      return {
        label: 'Parent',
        Icon: FiHeart,
        badgeClass: 'bg-amber-500/10 border-amber-500/20 text-amber-400'
      };
    case 'admin':
      return {
        label: 'Admin',
        Icon: FiShield,
        badgeClass: 'bg-red-500/10 border-red-500/20 text-red-400'
      };
    default:
      return {
        label: role || 'User',
        Icon: FiUser,
        badgeClass: 'bg-gray-500/10 border-gray-500/20 text-gray-400'
      };
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { stats, recentUsers, isLoading } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  // Modals state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [isDescFocused, setIsDescFocused] = useState(false);
  const [isSelectFocused, setIsSelectFocused] = useState(false);
  const [teachers, setTeachers] = useState([]);

  // Fetch teachers when Subject modal opens
  useEffect(() => {
    if (isSubjectModalOpen) {
      dispatch(fetchAllUsers({ role: 'teacher', limit: 1000 })).unwrap()
        .then((res) => {
          setTeachers(res.users || []);
        })
        .catch((err) => {
          toast.error('Failed to load teachers list');
        });
    }
  }, [isSubjectModalOpen, dispatch]);

  // Formik for User Modal
  const userFormik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: 'Teacher'
    },
    validationSchema: UserSchema,
    onSubmit: async (values, { resetForm, setSubmitting }) => {
      const loadToast = toast.loading('Creating user...');
      try {
        await dispatch(createUser({
          name: values.name,
          email: values.email,
          password: values.password,
          role: values.role.toLowerCase()
        })).unwrap();
        toast.dismiss(loadToast);
        toast.success(`${values.name} added successfully as ${values.role}!`);
        setIsUserModalOpen(false);
        resetForm();
        dispatch(fetchDashboardStats());
      } catch (err) {
        toast.dismiss(loadToast);
        toast.error(err || 'Failed to create user');
      } finally {
        setSubmitting(false);
      }
    }
  });

  const handleSubjectSubmit = async (values, { resetForm, setSubmitting }) => {
    const loadToast = toast.loading('Creating subject...');
    try {
      await dispatch(createSubject({
        name: values.title,
        description: values.description,
        teacher: values.teacher || null,
        price: values.price || 0,
        colorTop: '#ef4444',
        colorBottom: '#f43f5e',
        icon: 'FiBookOpen',
        grade: 'Primary'
      })).unwrap();
      toast.dismiss(loadToast);
      toast.success(`Subject "${values.title}" created successfully!`);
      setIsSubjectModalOpen(false);
      resetForm();
      dispatch(fetchDashboardStats());
    } catch (err) {
      toast.dismiss(loadToast);
      toast.error(err || 'Failed to create subject');
    } finally {
      setSubmitting(false);
    }
  };

  const isBlurred = isUserModalOpen || isSubjectModalOpen;

  if (isLoading && !stats) {
    return (
      <DashboardLayout role="admin" activeTab="dashboard">
        <DashboardSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="admin" activeTab="dashboard" isModalOpen={isBlurred}>
      <div className={`px-6 md:px-8 py-4 flex flex-col gap-8 animate-fade-in transition-all duration-300 ${
        isBlurred ? 'blur-sm pointer-events-none' : ''
      }`}>
        {/* User Subscription Statistics (Requirement 1) */}
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center">
            <h3 className="text-lg md:text-xl font-black tracking-wide text-white">User Overview</h3>
            <span className="text-xs font-semibold text-gray-500">Click any card to view user list</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 1. Total Registered Users */}
            <div 
              onClick={() => navigate('/admin/users?filter=all')}
              className="p-5 bg-[#0e101a] border border-gray-800 hover:border-red-500/40 rounded-3xl flex flex-col justify-between shadow-lg cursor-pointer hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
                  <FiUsers className="text-xl" />
                </div>
                <span className="text-[10px] font-extrabold text-red-400 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">All Users</span>
              </div>
              <div>
                <h4 className="text-3xl font-black text-white">{stats?.subscription?.totalRegistered ?? stats?.totalStudents ?? 0}</h4>
                <span className="text-xs font-bold text-gray-400 mt-1 block">Total Registered Users</span>
              </div>
            </div>

            {/* 2. Total Subscribed Users */}
            <div 
              onClick={() => navigate('/admin/users?filter=subscribed')}
              className="p-5 bg-[#0e101a] border border-gray-800 hover:border-emerald-500/40 rounded-3xl flex flex-col justify-between shadow-lg cursor-pointer hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <FiAward className="text-xl" />
                </div>
                <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">Subscribed</span>
              </div>
              <div>
                <h4 className="text-3xl font-black text-emerald-400">{stats?.subscription?.totalSubscribed ?? 0}</h4>
                <span className="text-xs font-bold text-gray-400 mt-1 block">Total Subscribed Users</span>
              </div>
            </div>

            {/* 3. Total Registered Non-Subscribed Users */}
            <div 
              onClick={() => navigate('/admin/users?filter=non_subscribed')}
              className="p-5 bg-[#0e101a] border border-gray-800 hover:border-amber-500/40 rounded-3xl flex flex-col justify-between shadow-lg cursor-pointer hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <FiUser className="text-xl" />
                </div>
                <span className="text-[10px] font-extrabold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">Non-Subscribed</span>
              </div>
              <div>
                <h4 className="text-3xl font-black text-amber-400">{stats?.subscription?.totalNonSubscribed ?? 0}</h4>
                <span className="text-xs font-bold text-gray-400 mt-1 block">Registered Non-Subscribed</span>
              </div>
            </div>

            {/* 4. Total Users Currently Active */}
            <div 
              onClick={() => navigate('/admin/users?filter=all&activeOnly=true')}
              className="p-5 bg-[#0e101a] border border-gray-800 hover:border-blue-500/40 rounded-3xl flex flex-col justify-between shadow-lg cursor-pointer hover:scale-[1.02] transition-all duration-300 group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <FiActivity className="text-xl" />
                </div>
                <span className="text-[10px] font-extrabold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">Active Now</span>
              </div>
              <div>
                <h4 className="text-3xl font-black text-blue-400">{stats?.subscription?.totalActive ?? 0}</h4>
                <span className="text-xs font-bold text-gray-400 mt-1 block">Currently Active Users</span>
              </div>
            </div>
          </div>
        </div>

        {/* Core Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Students */}
          <div 
            onClick={() => navigate('/admin/users?filter=all')}
            className="p-5 stat-card-student rounded-3xl flex flex-col items-center justify-center text-center shadow-lg cursor-pointer hover:scale-[1.02] transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] mb-4">
              <FiAward className="text-xl" />
            </div>
            <span className="text-2xl md:text-3xl font-extrabold text-white">{stats?.totalStudents || 0}</span>
            <span className="text-xs font-bold text-gray-500 tracking-wider mt-1 uppercase">Students</span>
          </div>
          {/* Teachers */}
          <div 
            onClick={() => navigate('/admin/users?filter=all')}
            className="p-5 stat-card-teacher rounded-3xl flex flex-col items-center justify-center text-center shadow-lg cursor-pointer hover:scale-[1.02] transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] mb-4">
              <FiUsers className="text-xl" />
            </div>
            <span className="text-2xl md:text-3xl font-extrabold text-white">{stats?.totalTeachers || 0}</span>
            <span className="text-xs font-bold text-gray-500 tracking-wider mt-1 uppercase">Teachers</span>
          </div>
          {/* Subjects */}
          <div 
            onClick={() => navigate('/admin/content')}
            className="p-5 stat-card-exam rounded-3xl flex flex-col items-center justify-center text-center shadow-lg cursor-pointer hover:scale-[1.02] transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)] mb-4">
              <FiBookOpen className="text-xl" />
            </div>
            <span className="text-2xl md:text-3xl font-extrabold text-white">{stats?.totalSubjects || 0}</span>
            <span className="text-xs font-bold text-gray-500 tracking-wider mt-1 uppercase">Subjects</span>
          </div>
          {/* Coupons */}
          <div 
            onClick={() => navigate('/admin/coupons')}
            className="p-5 stat-card-question rounded-3xl flex flex-col items-center justify-center text-center shadow-lg cursor-pointer hover:scale-[1.02] transition-all duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.15)] mb-4">
              <span className="text-lg font-bold">$</span>
            </div>
            <span className="text-2xl md:text-3xl font-extrabold text-white">{stats?.totalCoupons || 0}</span>
            <span className="text-xs font-bold text-gray-500 tracking-wider mt-1 uppercase">Coupons</span>
          </div>
        </div>

        {/* B. System Health Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg md:text-xl font-bold tracking-wide text-white">System Health</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Parents */}
            <div className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-3xl flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.12)]">
                  <FiActivity className="text-lg" />
                </div>
              </div>
              <div>
                <h4 className="text-xl md:text-2xl font-black text-white leading-none">{stats?.totalParents || 0}</h4>
                <span className="text-xs text-gray-500 font-semibold tracking-wide mt-1 block">Parents</span>
              </div>
            </div>
            {/* Exams Completed */}
            <div className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-3xl flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_12px_rgba(59,130,246,0.12)]">
                  <FiCalendar className="text-lg" />
                </div>
              </div>
              <div>
                <h4 className="text-xl md:text-2xl font-black text-white leading-none">{stats?.totalExams || 0}</h4>
                <span className="text-xs text-gray-500 font-semibold tracking-wide mt-1 block">Exams Completed</span>
              </div>
            </div>
            {/* Avg Score */}
            <div className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-3xl flex flex-col justify-between shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center text-yellow-400 shadow-[0_0_12px_rgba(234,179,8,0.12)]">
                  <FiTrendingUp className="text-lg" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-emerald-500/30 text-emerald-400 bg-emerald-500/5 flex items-center gap-1">
                  Pass Rate: {stats?.passRate || 0}%
                </span>
              </div>
              <div>
                <h4 className="text-xl md:text-2xl font-black text-white leading-none">{stats?.avgScore || 0}%</h4>
                <span className="text-xs text-gray-500 font-semibold tracking-wide mt-1 block">Avg Score</span>
              </div>
            </div>
          </div>
        </div>

        {/* C. Quick Actions Section */}
        <div className="flex flex-col gap-4">
          <h3 className="text-lg md:text-xl font-bold tracking-wide text-white">Quick Actions</h3>
          <div className="grid grid-cols-3 gap-4">
            <button 
              onClick={() => {
                userFormik.setFieldValue('role', 'Teacher');
                setIsUserModalOpen(true);
              }}
              className="p-4 action-btn-teacher rounded-3xl flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.3)] group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 transition-transform duration-300 group-hover:scale-110">
                <FiUserPlus className="text-lg" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">Add Teacher</span>
            </button>
            <button 
              onClick={() => {
                userFormik.setFieldValue('role', 'Student');
                setIsUserModalOpen(true);
              }}
              className="p-4 action-btn-student rounded-3xl flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.3)] group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 transition-transform duration-300 group-hover:scale-110">
                <FiAward className="text-lg" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">Add Student</span>
            </button>
            <button 
              onClick={() => {
                setIsSubjectModalOpen(true);
              }}
              className="p-4 action-btn-subject rounded-3xl flex flex-col items-center justify-center text-center gap-3 transition-all duration-300 shadow-[0_8px_20px_rgba(0,0,0,0.3)] group cursor-pointer"
            >
              <div className="w-11 h-11 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 transition-transform duration-300 group-hover:scale-110">
                <FiPlusCircle className="text-lg" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide">New Subject</span>
            </button>
          </div>
        </div>

        {/* D. Recent Users Section */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg md:text-xl font-black tracking-wide text-white">Recent Users</h3>
            <button 
              onClick={() => navigate('/admin/users')}
              className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors flex items-center gap-1.5 cursor-pointer bg-red-500/10 hover:bg-red-500/20 px-3.5 py-1.5 rounded-xl border border-red-500/20"
            >
              <span>View All Users</span>
              <FiArrowRight size={14} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentUsers && recentUsers.map((u, idx) => {
              const avatarInitials = u.name
                ? u.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
                : 'US';
              const avatarGradient = getRoleAvatarGradient(u.role);
              const { label: roleLabel, Icon: RoleIcon, badgeClass: roleBadgeClass } = getRoleBadge(u.role);
              const isSubscribed = u.isSubscribed || (u.enrolledCourses && u.enrolledCourses.length > 0);

              return (
                <div 
                  key={u._id || idx}
                  onClick={() => navigate('/admin/users')}
                  className="p-5 bg-[#0c0d19]/90 border border-gray-800/80 rounded-[1.75rem] shadow-xl hover:border-red-500/40 hover:shadow-[0_8px_30px_rgba(239,68,68,0.15)] transition-all duration-300 flex flex-col justify-between text-left relative overflow-hidden group cursor-pointer"
                >
                  {/* Top Accent Glow Line */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="flex items-start justify-between gap-3 mb-4">
                    {/* Role Avatar with Live Status Dot */}
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm tracking-wider ${avatarGradient}`}>
                        {avatarInitials}
                      </div>
                      <span 
                        className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#0c0d19] ${
                          u.isActive !== false ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                        }`} 
                      />
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap items-center justify-end gap-1.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border flex items-center gap-1 uppercase tracking-wider ${roleBadgeClass}`}>
                        <RoleIcon size={11} />
                        {roleLabel}
                      </span>
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border flex items-center gap-1 uppercase tracking-wider ${
                        isSubscribed 
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                          : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                      }`}>
                        {isSubscribed ? 'Subscribed' : 'Non-Subscribed'}
                      </span>
                    </div>
                  </div>

                  {/* Name & Contact */}
                  <div className="mb-3">
                    <h4 className="text-base font-black text-white leading-tight group-hover:text-red-400 transition-colors">
                      {u.name}
                    </h4>
                    <div className="flex flex-col gap-1.5 text-xs text-gray-400 font-semibold mt-2">
                      <span className="flex items-center gap-2 truncate bg-[#07080e] px-3 py-1.5 rounded-xl border border-gray-800/60">
                        <FiMail size={13} className="text-red-400 shrink-0" />
                        <span className="truncate">{u.email}</span>
                      </span>
                      {u.phone && (
                        <span className="flex items-center gap-2 truncate bg-[#07080e] px-3 py-1.5 rounded-xl border border-gray-800/60">
                          <FiPhone size={13} className="text-emerald-400 shrink-0" />
                          <span>{u.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Footer / Action */}
                  <div className="pt-3 border-t border-gray-800/50 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-gray-500">
                      {u.isActive !== false ? '✓ Account Active' : '✕ Account Suspended'}
                    </span>
                    <span className="text-xs font-black text-red-400 group-hover:translate-x-1 transition-transform flex items-center gap-1">
                      Manage User <FiArrowRight size={13} />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ADD USER MODAL */}
      {isUserModalOpen && (
        <div 
          className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => {
            setIsUserModalOpen(false);
            userFormik.resetForm();
          }}
        >
          {/* Modal Body */}
          <div 
            className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-fade-in flex flex-col gap-4 text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => {
                setIsUserModalOpen(false);
                userFormik.resetForm();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-black text-white text-left pr-8">Add New User</h3>

            <FormikProvider value={userFormik}>
              <form onSubmit={userFormik.handleSubmit} className="flex flex-col gap-4 mt-2">
                
                {/* Role Selector Grid */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      type="button"
                      onClick={() => userFormik.setFieldValue('role', 'Student')}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        userFormik.values.role === 'Student'
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                          : 'border-gray-800 bg-[#0e101a]/50 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <FiBookOpen size={20} />
                      <span className="text-[11px] font-bold">Student</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => userFormik.setFieldValue('role', 'Teacher')}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        userFormik.values.role === 'Teacher'
                          ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-extrabold shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                          : 'border-gray-800 bg-[#0e101a]/50 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <FiUsers size={20} />
                      <span className="text-[11px] font-bold">Teacher</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => userFormik.setFieldValue('role', 'Parent')}
                      className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        userFormik.values.role === 'Parent'
                          ? 'border-purple-500 bg-purple-500/10 text-purple-400 font-extrabold shadow-[0_0_15px_rgba(168,85,247,0.1)]'
                          : 'border-gray-800 bg-[#0e101a]/50 text-gray-400 hover:text-gray-200'
                      }`}
                    >
                      <FiHeart size={20} />
                      <span className="text-[11px] font-bold">Parent</span>
                    </button>
                  </div>
                </div>

                {/* Form Input fields */}
                <div className="flex flex-col gap-1 mt-2">
                  <Input 
                    name="name"
                    type="text"
                    label="Full Name"
                    placeholder="Fitzgerald Simon"
                    icon={FiUser}
                    roleColor={userFormik.values.role.toLowerCase()}
                  />
                  
                  <Input 
                    name="email"
                    type="email"
                    label="Email Address"
                    placeholder="tukyb@mailinator.com"
                    icon={FiMail}
                    roleColor={userFormik.values.role.toLowerCase()}
                  />

                  <Input 
                    name="password"
                    type="password"
                    label="Password"
                    placeholder="••••••••"
                    icon={FiLock}
                    showPasswordToggle={true}
                    roleColor={userFormik.values.role.toLowerCase()}
                  />
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  roleColor={userFormik.values.role.toLowerCase()}
                  disabled={userFormik.isSubmitting}
                  icon={userFormik.isSubmitting ? undefined : FiCheck}
                  className="w-full mt-2 !rounded-2xl"
                >
                  {userFormik.isSubmitting ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                      <span>Creating User...</span>
                    </span>
                  ) : (
                    'Create User'
                  )}
                </Button>
              </form>
            </FormikProvider>
          </div>
        </div>
      )}

      {/* ADD SUBJECT MODAL */}
      {isSubjectModalOpen && (
        <div 
          className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300"
          onClick={() => {
            setIsSubjectModalOpen(false);
          }}
        >
          {/* Modal Body */}
          <div 
            className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-fade-in flex flex-col gap-4 text-left relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={() => {
                setIsSubjectModalOpen(false);
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer"
            >
              <FiX size={20} />
            </button>

            <h3 className="text-xl font-black text-white text-left pr-8">Add New Subject</h3>

            <Formik
              initialValues={{
                title: '',
                description: '',
                teacher: '',
                price: 0,
              }}
              validationSchema={SubjectSchema}
              onSubmit={handleSubjectSubmit}
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
                        <span>Creating Subject...</span>
                      </span>
                    ) : (
                      'Create Subject'
                    )}
                  </Button>

                </Form>
              )}
            </Formik>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
