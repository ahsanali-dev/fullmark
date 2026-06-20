import { useState } from 'react';
import {
  FiTag,
  FiCheckCircle,
  FiClock,
  FiUser,
  FiCopy,
  FiPlus,
  FiX,
  FiSearch,
  FiCreditCard,
  FiZap,
  FiKey,
  FiShoppingBag,
  FiFileText
} from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

const Coupons = () => {
  const navigate = useNavigate();

  // Initial mock coupons data
  const [coupons, setCoupons] = useState([
    {
      id: 'cp-1',
      code: 'FM-STBBACC9',
      value: 2000,
      balance: 1800,
      status: 'active', // active, used, expired, revoked
      createdDate: 'Jun 12, 2026',
      linkedUser: 'ali',
      expiresIn: 'never',
      history: [
        { id: 'h-1', user: 'ali', spent: 200, date: 'Jun 12, 2026 • 6:37 AM', subjectName: 'chemistry', balanceAfter: 1800 }
      ]
    },
    {
      id: 'cp-2',
      code: 'FM-60D8RF52',
      value: 500,
      balance: 500,
      status: 'active',
      createdDate: 'Jun 12, 2026',
      linkedUser: 'Not linked',
      expiresIn: '30 days',
      history: []
    }
  ]);

  // States
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, used, expired, revoked
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingCoupon, setDeletingCoupon] = useState(null);
  
  // Revoke Confirmation States
  const [showRevokeConfirm, setShowRevokeConfirm] = useState(false);
  const [revokingCoupon, setRevokingCoupon] = useState(null);

  // History Modal States
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyCoupon, setHistoryCoupon] = useState(null);

  // Form States for Generate Coupon
  const [couponValue, setCouponValue] = useState('');
  const [autoGenerate, setAutoGenerate] = useState(true);
  const [customCode, setCustomCode] = useState('');
  const [expiresIn, setExpiresIn] = useState('never'); // never, 30 days, 60 days, 90 days, 180 days

  // Stats
  const totalCoupons = coupons.length;
  const activeCoupons = coupons.filter(c => c.status === 'active').length;
  const usedCoupons = coupons.filter(c => c.status === 'used' || (c.value > c.balance && c.balance === 0)).length;
  const expiredCoupons = coupons.filter(c => c.status === 'expired').length;

  // Copy Code to Clipboard
  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    toast.success(`Coupon code "${code}" copied! 📋`);
  };

  // Revoke Click
  const handleRevokeClick = (coupon) => {
    setRevokingCoupon(coupon);
    setShowRevokeConfirm(true);
  };

  // Confirm Revoke
  const confirmRevoke = () => {
    setCoupons(prev =>
      prev.map(c =>
        c.id === revokingCoupon.id
          ? { ...c, status: 'revoked' }
          : c
      )
    );
    setShowRevokeConfirm(false);
    setRevokingCoupon(null);
    toast.success('Coupon revoked successfully!');
  };

  // Delete Click
  const handleDeleteClick = (coupon) => {
    setDeletingCoupon(coupon);
    setShowDeleteConfirm(true);
  };

  // Confirm Delete
  const confirmDelete = () => {
    setCoupons(prev => prev.filter(c => c.id !== deletingCoupon.id));
    setShowDeleteConfirm(false);
    setDeletingCoupon(null);
    toast.success('Coupon deleted successfully!');
  };

  // View History
  const handleViewHistory = (coupon) => {
    setHistoryCoupon(coupon);
    setIsHistoryOpen(true);
  };

  // Helper to generate a random 8-character string for coupon code
  const generateRandomCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `FM-${result}`;
  };

  // Form Submit Handler
  const handleGenerateSubmit = (e) => {
    e.preventDefault();

    const valueNum = Number(couponValue);
    if (!couponValue || isNaN(valueNum) || valueNum <= 0) {
      toast.error('Please enter a valid positive coupon value.');
      return;
    }

    let codeToUse = '';
    if (autoGenerate) {
      codeToUse = generateRandomCode();
    } else {
      if (!customCode.trim()) {
        toast.error('Please enter a custom code.');
        return;
      }
      codeToUse = customCode.trim().toUpperCase();
      // Ensure custom code starts with FM- or format it nicely
      if (!codeToUse.startsWith('FM-')) {
        codeToUse = `FM-${codeToUse}`;
      }
    }

    // Check for duplicate codes
    if (coupons.some(c => c.code === codeToUse)) {
      toast.error('This coupon code already exists.');
      return;
    }

    const newCoupon = {
      id: `cp-${Date.now()}`,
      code: codeToUse,
      value: valueNum,
      balance: valueNum,
      status: 'active',
      createdDate: 'Jun 20, 2026',
      linkedUser: 'Not linked',
      expiresIn: expiresIn,
      history: []
    };

    setCoupons(prev => [newCoupon, ...prev]);
    toast.success(`Coupon ${codeToUse} generated successfully!`);
    setIsModalOpen(false);

    // Reset Form
    setCouponValue('');
    setCustomCode('');
    setAutoGenerate(true);
    setExpiresIn('never');
  };

  // Filtered coupons
  const filteredCoupons = coupons.filter(c => {
    const matchesSearch =
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.linkedUser.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === 'active') {
      return matchesSearch && c.status === 'active';
    }
    if (filterStatus === 'used') {
      // either marked used or balance is fully spent
      return matchesSearch && (c.status === 'used' || (c.value > 0 && c.balance === 0));
    }
    if (filterStatus === 'expired') {
      return matchesSearch && c.status === 'expired';
    }
    if (filterStatus === 'revoked') {
      return matchesSearch && c.status === 'revoked';
    }
    return matchesSearch;
  });

  const isBlurred = isModalOpen || showDeleteConfirm || showRevokeConfirm || isHistoryOpen;

  return (
    <DashboardLayout
      role="admin"
      activeTab="coupons"
      title="Coupon Management"
      subtitle={`${totalCoupons} coupons total`}
      isModalOpen={isBlurred}
      disableScroll={true}
      showBackButton={true}
      onBackClick={() => navigate('/admin/dashboard')}
    >
      {/* Main Page Content */}
      <div className={`h-full flex flex-col px-4 md:px-8 py-4 overflow-hidden gap-5 animate-fade-in relative transition-all duration-300 ${isBlurred ? 'blur-sm pointer-events-none' : ''}`}>

        {/* Top Controls Section */}
        <div className="flex flex-col gap-4 shrink-0">
          {/* Search */}
          <div className="relative w-full">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by code or linked student..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#0e101a] border border-gray-800 rounded-2xl text-white text-sm focus:outline-none focus:border-red-500/50 transition-colors"
            />
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-4 gap-2 md:gap-4">
            {/* Total Card */}
            <div className="p-3 md:p-4 bg-[#0e101a] border border-red-500/15 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg">
              <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 mb-2">
                <FiTag size={16} />
              </div>
              <span className="text-xl md:text-2xl font-extrabold text-red-400">{totalCoupons}</span>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-500 tracking-wider mt-1 uppercase">Total</span>
            </div>
            {/* Active Card */}
            <div className="p-3 md:p-4 bg-[#0e101a] border border-emerald-500/15 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
                <FiCheckCircle size={16} />
              </div>
              <span className="text-xl md:text-2xl font-extrabold text-emerald-400">{activeCoupons}</span>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-500 tracking-wider mt-1 uppercase">Active</span>
            </div>
            {/* Used Card */}
            <div className="p-3 md:p-4 bg-[#0e101a] border border-blue-500/15 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg">
              <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-2">
                <FiUser size={16} />
              </div>
              <span className="text-xl md:text-2xl font-extrabold text-blue-400">{usedCoupons}</span>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-500 tracking-wider mt-1 uppercase">Used</span>
            </div>
            {/* Expired Card */}
            <div className="p-3 md:p-4 bg-[#0e101a] border border-orange-500/15 rounded-3xl flex flex-col items-center justify-center text-center shadow-lg">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 mb-2">
                <FiClock size={16} />
              </div>
              <span className="text-xl md:text-2xl font-extrabold text-orange-400">{expiredCoupons}</span>
              <span className="text-[9px] md:text-[10px] font-bold text-gray-500 tracking-wider mt-1 uppercase">Expired</span>
            </div>
          </div>

          {/* Filters pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
            {['all', 'active', 'used', 'expired', 'revoked'].map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer capitalize whitespace-nowrap ${filterStatus === status
                    ? 'bg-red-500 text-white shadow-[0_4px_15px_rgba(239,68,68,0.3)]'
                    : 'bg-transparent border border-gray-800 text-gray-400 hover:text-white hover:border-gray-700'
                  }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Stat Labels */}
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-gray-400">{filteredCoupons.length} coupons</span>
            <span className="text-gray-500">Tap code to copy</span>
          </div>
        </div>

        {/* Coupons List */}
        <div className="flex-1 overflow-y-auto pr-1 pb-36">
          {filteredCoupons.length === 0 ? (
            <div className="p-8 text-center bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center">
              <span className="text-sm font-bold text-gray-500">No coupons match search filters</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCoupons.map((coupon) => {
                const spentAmount = coupon.value - coupon.balance;
                const progressPercent = coupon.value > 0 ? Math.round((coupon.balance / coupon.value) * 100) : 0;

                return (
                  <div
                    key={coupon.id}
                    className="p-5 bg-[#0e101a] border border-gray-800/80 rounded-3xl shadow-lg flex flex-col gap-4 relative overflow-hidden transition-all duration-300 hover:border-emerald-500/25"
                  >
                    {/* Top Row: Icon, Value, Status */}
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] shrink-0">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                            <path d="M13 5v2"/>
                            <path d="M13 17v2"/>
                            <path d="M13 11v2"/>
                          </svg>
                        </div>
                        <div className="flex flex-col text-left">
                          <h4 className="text-base font-extrabold text-white leading-tight">Value: {coupon.value.toLocaleString()}</h4>
                          <p className="text-xs text-gray-500 font-semibold mt-1">Created {coupon.createdDate}</p>
                        </div>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full border text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 ${
                        coupon.status === 'active'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                          : coupon.status === 'used'
                          ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          : coupon.status === 'expired'
                          ? 'bg-orange-500/10 border-orange-500/20 text-orange-400'
                          : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          coupon.status === 'active' ? 'bg-emerald-400 animate-pulse' :
                          coupon.status === 'used' ? 'bg-blue-400' :
                          coupon.status === 'expired' ? 'bg-orange-400' : 'bg-red-400'
                        }`} />
                        {coupon.status}
                      </span>
                    </div>

                    {/* Code Container */}
                    <div className="flex items-center justify-between p-3.5 bg-[#07080e] border border-gray-800 rounded-2xl">
                      <div className="flex items-center gap-2.5 text-emerald-400">
                        <FiKey size={16} />
                        <span className="font-mono font-extrabold text-sm text-white tracking-wider">{coupon.code}</span>
                      </div>
                      <button
                        onClick={() => handleCopyCode(coupon.code)}
                        className="px-3.5 py-1.5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-400 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5"
                      >
                        <FiCopy size={12} />
                        Copy
                      </button>
                    </div>

                    {/* Progress Balance */}
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between items-center text-xs font-bold">
                        <span className="text-gray-400">Balance: {coupon.balance.toLocaleString()} / {coupon.value.toLocaleString()}</span>
                        <span className="text-blue-400 font-extrabold">{spentAmount.toLocaleString()} spent</span>
                      </div>
                      <div className="h-2 w-full bg-gray-900 rounded-full overflow-hidden border border-gray-800/60">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-500"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>

                    {/* Linked User */}
                    <div className="flex items-center gap-2 px-3 py-2.5 bg-[#07080e]/40 border border-gray-800/40 rounded-2xl text-xs font-bold text-gray-400">
                      <FiUser size={14} className="text-blue-400" />
                      <span>Linked to {coupon.linkedUser}</span>
                    </div>

                    {/* Bottom row: Expires and Actions */}
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                        <FiClock size={12} className="text-orange-400" />
                        Expires: {coupon.expiresIn === 'never' ? 'Never' : coupon.expiresIn}
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleViewHistory(coupon)}
                          className="px-3.5 py-2 border border-blue-500/20 text-blue-400 hover:bg-blue-500/10 rounded-2xl text-xs font-extrabold transition-all cursor-pointer"
                        >
                          History
                        </button>
                        {coupon.status === 'active' && (
                          <button
                            onClick={() => handleRevokeClick(coupon)}
                            className="px-3.5 py-2 border border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10 rounded-2xl text-xs font-extrabold transition-all cursor-pointer"
                          >
                            Revoke
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteClick(coupon)}
                          className="px-3.5 py-2 border border-red-500/20 text-red-400 hover:bg-red-500/10 rounded-2xl text-xs font-extrabold transition-all cursor-pointer"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Generate Coupon Button */}
        <div className="fixed bottom-26 right-6 lg:bottom-10 lg:right-10 z-30">
          <Button
            onClick={() => setIsModalOpen(true)}
            roleColor="admin"
            icon={FiPlus}
            className="w-auto h-auto px-5 py-3.5 !rounded-2xl shadow-[0_4px_25px_rgba(239,68,68,0.4)]"
          >
            Generate Coupon
          </Button>
        </div>

      </div>

      {/* 1. Generate Coupon Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="w-full sm:max-w-md bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Handle */}
              <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />

              {/* Close Button */}
              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>

              {/* Header Title with gold background tag icon */}
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)] shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"/>
                    <path d="M13 5v2"/>
                    <path d="M13 17v2"/>
                    <path d="M13 11v2"/>
                  </svg>
                </div>
                <h3 className="text-xl font-black text-white">Generate Coupon</h3>
              </div>

              {/* Form */}
              <form onSubmit={handleGenerateSubmit} className="flex flex-col gap-5 mt-2">
                {/* Coupon Value field */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Coupon Value</label>
                  <Input
                    label="Amount"
                    type="number"
                    value={couponValue}
                    onChange={(e) => setCouponValue(e.target.value)}
                    icon={FiCreditCard}
                    roleColor="admin"
                  />

                  {/* Preset Values Grid */}
                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {[500, 1000, 2000, 5000].map(val => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setCouponValue(val.toString())}
                        className={`py-2 px-1 text-xs font-bold border rounded-xl transition-all cursor-pointer text-center ${
                          Number(couponValue) === val
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                            : 'border-gray-800 bg-[#07080e]/40 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {val.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Auto-generate code switch */}
                <div className="flex items-center justify-between p-4 bg-[#07080e]/40 border border-gray-800/60 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                      <FiZap size={18} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-xs font-bold text-white leading-tight">Auto-Generate Code</span>
                      <span className="text-[10px] text-gray-500 font-medium">System generates a unique code</span>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={autoGenerate}
                      onChange={() => setAutoGenerate(!autoGenerate)}
                    />
                    <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>

                {/* Custom Code field (only if auto-generate is toggled off) */}
                <AnimatePresence>
                  {!autoGenerate && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex flex-col gap-2 overflow-hidden"
                    >
                      <Input
                        label="Custom Code"
                        type="text"
                        value={customCode}
                        onChange={(e) => setCustomCode(e.target.value)}
                        placeholder={customCode ? "" : "e.g. DISCOUNT50"}
                        icon={FiKey}
                        roleColor="admin"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Expires In field */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Expires In</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {[
                      { key: 'never', label: '∞ never' },
                      { key: '30 days', label: '30 days' },
                      { key: '60 days', label: '60 days' },
                      { key: '90 days', label: '90 days' },
                      { key: '180 days', label: '180 days' }
                    ].map(exp => (
                      <button
                        key={exp.key}
                        type="button"
                        onClick={() => setExpiresIn(exp.key)}
                        className={`py-2 px-1 text-[10px] font-bold border rounded-xl transition-all cursor-pointer text-center whitespace-nowrap ${
                          expiresIn === exp.key
                            ? 'border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                            : 'border-gray-800 bg-[#07080e]/40 text-gray-400 hover:text-gray-200'
                        }`}
                      >
                        {exp.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  roleColor="admin"
                  icon={FiTag}
                  className="w-full mt-2 !rounded-2xl"
                >
                  Generate Coupon
                </Button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. History Dialog Modal */}
      <AnimatePresence>
        {isHistoryOpen && historyCoupon && (
          <div
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-end sm:items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => setIsHistoryOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 100, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 100, opacity: 0 }}
              className="w-full sm:max-w-md bg-[#0c0d19] border-t sm:border border-gray-800 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 pb-10 sm:pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden text-left"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Mobile Handle */}
              <div className="w-12 h-1.5 bg-gray-800 rounded-full mx-auto mb-6 sm:hidden" />

              {/* Close Button */}
              <button
                onClick={() => setIsHistoryOpen(false)}
                className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors cursor-pointer"
              >
                <FiX size={20} />
              </button>

              {/* Header section with blue receipt icon and text, and right stats */}
              <div className="flex items-center justify-between mb-6 pr-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.15)] shrink-0">
                    <FiFileText size={22} />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-lg font-black text-white leading-tight">Usage History</h3>
                    <span className="text-xs font-mono font-bold text-gray-500 tracking-wider mt-1">{historyCoupon.code}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-end text-right">
                  <span className="text-xl font-black text-emerald-400">{historyCoupon.balance.toLocaleString()}</span>
                  <span className="text-[10px] font-bold text-gray-500 tracking-wide mt-0.5">of {historyCoupon.value.toLocaleString()} left</span>
                </div>
              </div>

              {/* Transaction List Card container */}
              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto mt-2 pr-1">
                {historyCoupon.history.length === 0 ? (
                  <div className="p-8 text-center bg-[#07080e]/40 border border-gray-800/80 rounded-3xl">
                    <span className="text-xs font-semibold text-gray-500">No transactions recorded yet.</span>
                  </div>
                ) : (
                  historyCoupon.history.map((tx) => (
                    <div
                      key={tx.id}
                      className="p-4 bg-[#07080e]/45 border border-gray-800 rounded-3xl flex justify-between items-center"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.1)] shrink-0">
                          <FiShoppingBag size={18} />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-extrabold text-sm text-white leading-tight">{tx.subjectName || 'chemistry'}</span>
                          <span className="text-xs font-semibold text-gray-400 mt-1">{tx.user}</span>
                          <span className="text-[10px] font-medium text-gray-500 mt-0.5">{tx.date}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end text-right shrink-0">
                        <span className="text-sm font-extrabold text-red-500">-{tx.spent.toLocaleString()}</span>
                        <span className="text-[10px] font-semibold text-gray-500 mt-1">bal {tx.balanceAfter.toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Revoke Confirmation Modal */}
      <AnimatePresence>
        {showRevokeConfirm && revokingCoupon && (
          <div
            className="fixed inset-0 bg-[#020205]/70 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => {
              setShowRevokeConfirm(false);
              setRevokingCoupon(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0b0c16] border border-gray-800 rounded-[2rem] p-6 w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 flex flex-col gap-4 text-left relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-xl font-black text-white">Revoke Coupon?</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-semibold">
                This will deactivate coupon <span className="font-mono text-white">"{revokingCoupon.code}"</span>. Its remaining balance of {revokingCoupon.balance.toLocaleString()} can no longer be spent.
              </p>
              <div className="flex justify-end gap-2 mt-2">
                <Button
                  type="button"
                  variant="secondary"
                  roleColor="admin"
                  onClick={() => {
                    setShowRevokeConfirm(false);
                    setRevokingCoupon(null);
                  }}
                  className="w-auto px-5 py-3 !rounded-2xl text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  roleColor="admin"
                  onClick={confirmRevoke}
                  className="w-auto px-6 py-3 !rounded-2xl text-sm"
                >
                  Revoke
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 3. Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && deletingCoupon && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
            onClick={() => {
              setShowDeleteConfirm(false);
              setDeletingCoupon(null);
            }}
          >
            <div
              className="bg-[#0b0c16] border border-gray-800 rounded-3xl p-6 w-full max-w-sm shadow-[0_20px_50px_rgba(0,0,0,0.8)] z-50 flex flex-col gap-4 text-left relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-black text-white">Delete Coupon</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-semibold">
                Are you sure you want to delete the coupon <span className="text-red-400 font-extrabold font-mono">"{deletingCoupon.code}"</span>? This action cannot be undone.
              </p>
              <div className="flex gap-3 mt-2 w-full">
                <Button
                  type="button"
                  variant="secondary"
                  roleColor="admin"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeletingCoupon(null);
                  }}
                  className="flex-1 py-3 !rounded-2xl text-sm"
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  roleColor="admin"
                  onClick={confirmDelete}
                  className="flex-1 py-3 !rounded-2xl text-sm"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>
        )}
      </AnimatePresence>

    </DashboardLayout>
  );
};

export default Coupons;
