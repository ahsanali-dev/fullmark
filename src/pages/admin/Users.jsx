import React, { useState } from 'react';
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
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';

const Users = () => {
  // Local list of users
  const [users, setUsers] = useState([
    { name: 'Ahmad', email: 'baaddawe@gmail.com', role: 'Student', status: 'Active', avatar: 'AH', color: 'emerald', date: 'May 2026', detail: '0% avg', lastActive: 'Never' },
    { name: 'teacher 23', email: 't2@gmail.com', role: 'Teacher', status: 'Active', avatar: 'T2', color: 'blue', date: 'May 2026', detail: '0 students', lastActive: 'Never' },
    { name: 'teacher', email: 't@gmail.com', role: 'Teacher', status: 'Active', avatar: 'TE', color: 'blue', date: 'May 2026', detail: '0 students', lastActive: '3d ago' },
    { name: 'Ali Faraz', email: 'alifaraz933@gmail.commmm', role: 'Student', status: 'Active', avatar: 'AF', color: 'emerald', date: 'May 2026', detail: '0% avg', lastActive: 'Never' },
    { name: 'Ahmad Faraz', email: 'ahmadfaraz@gmail.com', role: 'Student', status: 'Active', avatar: 'AF', color: 'emerald', date: 'May 2026', detail: '0% avg', lastActive: 'Never' },
    { name: 'Admin Principal', email: 'admin@fullmark.com', role: 'Admin', status: 'Active', avatar: 'AP', color: 'red', date: 'Apr 2026', detail: 'Primary', lastActive: 'Just now' },
    { name: 'Parent User', email: 'parent@gmail.com', role: 'Parent', status: 'Active', avatar: 'PU', color: 'purple', date: 'May 2026', detail: '1 child', lastActive: '1d ago' }
  ]);

  // Filters and sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [sortBy, setSortBy] = useState('Newest');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  // Drawer / Add user state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Dynamically calculate metrics
  const totalCount = users.length;
  const activeCount = users.filter(u => u.status === 'Active').length;
  const studentsCount = users.filter(u => u.role === 'Student').length;
  const teachersCount = users.filter(u => u.role === 'Teacher').length;

  // Filter & search users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          user.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = selectedFilter === 'All' || user.role === selectedFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColors = (role) => {
    switch (role) {
      case 'Student':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
          badge: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
          dot: 'bg-emerald-500'
        };
      case 'Teacher':
        return {
          bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
          badge: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
          dot: 'bg-blue-500'
        };
      case 'Parent':
        return {
          bg: 'bg-purple-500/10 border-purple-500/20 text-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.15)]',
          badge: 'bg-purple-500/10 text-purple-400 border border-purple-500/20',
          dot: 'bg-purple-500'
        };
      case 'Admin':
      default:
        return {
          bg: 'bg-red-500/10 border-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]',
          badge: 'bg-red-500/10 text-red-400 border border-red-500/20',
          dot: 'bg-red-500'
        };
    }
  };

  // Formik and Yup Validation
  const formik = useFormik({
    initialValues: {
      name: '',
      email: '',
      password: '',
      role: 'Student'
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .min(3, 'Name must be at least 3 characters')
        .required('Full Name is required'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email Address is required'),
      password: Yup.string()
        .min(6, 'Password must be at least 6 characters')
        .required('Password is required'),
      role: Yup.string()
        .oneOf(['Student', 'Teacher', 'Parent'], 'Invalid role')
        .required('Role selection is required')
    }),
    onSubmit: (values, { resetForm }) => {
      const initials = values.name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      
      const newUser = {
        name: values.name,
        email: values.email,
        role: values.role,
        status: 'Active',
        avatar: initials || 'US',
        color: values.role === 'Student' ? 'emerald' : values.role === 'Teacher' ? 'blue' : 'purple',
        date: 'Jun 2026',
        detail: values.role === 'Student' ? '0% avg' : values.role === 'Teacher' ? '0 students' : '0 children',
        lastActive: 'Never'
      };

      setUsers([newUser, ...users]);
      toast.success(`${values.name} added as ${values.role}!`);
      setIsModalOpen(false);
      resetForm();
    }
  });

  const location = useLocation();

  React.useEffect(() => {
    if (location.state?.openAddModal) {
      const targetRole = location.state.initialRole || 'Student';
      const capitalizedRole = targetRole.charAt(0).toUpperCase() + targetRole.slice(1);
      formik.setFieldValue('role', capitalizedRole);
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  return (
    <DashboardLayout role="admin" activeTab="users" title="User Management" subtitle={`${totalCount} total users`} disableScroll={true} isModalOpen={isModalOpen}>
      <div className={`h-full flex flex-col p-4 md:p-8 overflow-hidden gap-5 animate-fade-in relative transition-all duration-300 ${
        isModalOpen ? 'blur-sm pointer-events-none' : ''
      }`}>
        
        {/* Fixed Top Controls Section */}
        <div className="flex flex-col gap-4 shrink-0">
          {/* 1. Metrics Summary Cards */}
          <div className="grid grid-cols-4 gap-2.5 md:gap-4">
            <div className="bg-[#0c0d19]/90 border border-red-500/20 rounded-2xl md:rounded-3xl p-3 md:p-4 flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-xl md:text-3xl font-black text-red-500">{totalCount}</span>
              <span className="text-[10px] md:text-xs font-bold text-gray-500 tracking-wider uppercase mt-1">Total</span>
            </div>
            <div className="bg-[#0c0d19]/90 border border-green-500/20 rounded-2xl md:rounded-3xl p-3 md:p-4 flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-xl md:text-3xl font-black text-green-500">{activeCount}</span>
              <span className="text-[10px] md:text-xs font-bold text-gray-500 tracking-wider uppercase mt-1">Active</span>
            </div>
            <div className="bg-[#0c0d19]/90 border border-emerald-500/20 rounded-2xl md:rounded-3xl p-3 md:p-4 flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-xl md:text-3xl font-black text-emerald-400">{studentsCount}</span>
              <span className="text-[10px] md:text-xs font-bold text-gray-500 tracking-wider uppercase mt-1">Students</span>
            </div>
            <div className="bg-[#0c0d19]/90 border border-blue-500/20 rounded-2xl md:rounded-3xl p-3 md:p-4 flex flex-col items-center justify-center text-center shadow-lg">
              <span className="text-xl md:text-3xl font-black text-blue-400">{teachersCount}</span>
              <span className="text-[10px] md:text-xs font-bold text-gray-500 tracking-wider uppercase mt-1">Teachers</span>
            </div>
          </div>

          {/* 2. Search Box */}
          <div className="relative">
            <FiSearch className="absolute left-4 top-4 text-gray-500 text-base" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..." 
              className="w-full py-3.5 pl-12 pr-4 bg-[#0e101a]/70 border border-gray-800 rounded-2xl text-sm font-semibold text-white focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>

          {/* 3. Horizontal Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            {['All', 'Student', 'Teacher', 'Admin', 'Parent'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedFilter(role)}
                className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all duration-300 whitespace-nowrap cursor-pointer ${
                  selectedFilter === role 
                    ? 'bg-gradient-to-r from-red-600 to-rose-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.35)]'
                    : 'bg-gray-950/40 border border-gray-800/80 text-gray-400 hover:text-white'
                }`}
              >
                {role}
              </button>
            ))}
          </div>

          {/* 4. Subtitle Sort & Header */}
          <div className="flex items-center justify-between border-b border-gray-800/40 pb-2">
            <span className="text-sm font-bold text-gray-400">{filteredUsers.length} users</span>
            
            {/* Sort Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-1.5 text-sm font-extrabold text-red-500 hover:text-red-400 transition-colors cursor-pointer"
              >
                <span>{sortBy}</span>
                <FiChevronDown size={14} />
              </button>

              {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-32 bg-[#111222] border border-gray-800 rounded-2xl p-1 shadow-2xl z-30">
                  {['Newest', 'Oldest'].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => {
                        setSortBy(opt);
                        setShowSortDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-gray-300 hover:bg-gray-800/50 hover:text-white rounded-xl transition-all cursor-pointer"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 5. User Cards List (Only Scrollable Section!) */}
        <div className="flex-1 overflow-y-auto pr-1 pb-28 flex flex-col gap-3">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user, idx) => {
              const colors = getRoleColors(user.role);
              return (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 bg-[#0c0d19]/90 border border-gray-800/80 rounded-[1.75rem] shadow-lg"
                >
                  <div className="flex items-center gap-3.5">
                    {/* Avatar Icon */}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm border shrink-0 ${colors.bg}`}>
                      {user.avatar}
                    </div>
                    {/* Text Details */}
                    <div className="flex flex-col text-left">
                      <span className="text-sm md:text-base font-extrabold text-white leading-tight">{user.name}</span>
                      <span className="text-xs text-gray-500 font-semibold mb-1 mt-0.5">{user.email}</span>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${colors.badge}`}>
                          {user.role}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-gray-500 font-semibold">
                          <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                          {user.lastActive}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Metric detail */}
                  <div className="flex flex-col items-end text-right">
                    <span className="text-[10px] font-bold text-gray-500">{user.date}</span>
                    <span className={`text-xs font-black mt-1.5 ${
                      user.role === 'Student' ? 'text-emerald-400' : user.role === 'Teacher' ? 'text-blue-400' : 'text-purple-400'
                    }`}>
                      {user.detail}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center bg-[#0c0d19]/40 border border-gray-800 rounded-3xl text-gray-500 font-bold">
              No users found matching your criteria.
            </div>
          )}
        </div>

        {/* 6. Floating Action Button to Add User (Fixed Position at Bottom-Right) */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="fixed bottom-26 right-6 lg:bottom-10 lg:right-10 z-30 flex items-center gap-2 bg-gradient-to-r from-red-600 to-rose-500 text-white px-5 py-3.5 rounded-2xl font-extrabold shadow-[0_4px_25px_rgba(239,68,68,0.4)] hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
        >
          <FiUserPlus size={18} />
          <span>Add User</span>
        </button>

      </div>

      {/* 7. Centered Modal (Formik & Yup Validation) */}
      {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            
            {/* Modal Body */}
            <div className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 w-full max-w-md shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 animate-fade-in flex flex-col gap-4 text-left relative">
              
              {/* Close Button */}
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
                  
                  {/* Role Selector Grid */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Role</label>
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => formik.setFieldValue('role', 'Student')}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                          formik.values.role === 'Student'
                            ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.1)]'
                            : 'border-gray-800 bg-[#0e101a]/50 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <FiBookOpen size={20} />
                        <span className="text-[11px] font-bold">Student</span>
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => formik.setFieldValue('role', 'Teacher')}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                          formik.values.role === 'Teacher'
                            ? 'border-blue-500 bg-blue-500/10 text-blue-400 font-extrabold shadow-[0_0_15px_rgba(59,130,246,0.1)]'
                            : 'border-gray-800 bg-[#0e101a]/50 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        <FiUsers size={20} />
                        <span className="text-[11px] font-bold">Teacher</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => formik.setFieldValue('role', 'Parent')}
                        className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                          formik.values.role === 'Parent'
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
                      roleColor={formik.values.role.toLowerCase()}
                    />
                    
                    <Input 
                      name="email"
                      type="email"
                      label="Email Address"
                      placeholder="tukyb@mailinator.com"
                      icon={FiMail}
                      roleColor={formik.values.role.toLowerCase()}
                    />

                    <Input 
                      name="password"
                      type="password"
                      label="Password"
                      placeholder="••••••••"
                      icon={FiLock}
                      showPasswordToggle={true}
                      roleColor={formik.values.role.toLowerCase()}
                    />
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="w-full py-4 mt-2 bg-gradient-to-r from-red-600 to-rose-500 text-white rounded-2xl font-black text-sm tracking-wide shadow-[0_4px_25px_rgba(239,68,68,0.4)] flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all duration-300 cursor-pointer"
                  >
                    <span>Create User</span>
                    <FiCheck size={16} />
                  </button>
                </form>
              </FormikProvider>
            </div>
          </div>
        )}

    </DashboardLayout>
  );
};

export default Users;
