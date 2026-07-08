import React from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Reusable Theme wrapper for all admin skeletons
const AdminSkeletonTheme = ({ children }) => (
  <SkeletonTheme baseColor="#0c0d19" highlightColor="#16182c">
    {children}
  </SkeletonTheme>
);

// 1. Dashboard Skeleton Loader
export const DashboardSkeleton = () => (
  <AdminSkeletonTheme>
    <div className="px-6 md:px-8 py-4 flex flex-col gap-8 animate-fade-in">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center text-center">
            <Skeleton circle width={48} height={48} className="mb-4" />
            <Skeleton width={60} height={28} className="mb-1" />
            <Skeleton width={80} height={14} />
          </div>
        ))}
      </div>

      {/* Two Columns Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: Performance overview */}
        <div className="lg:col-span-2 p-6 bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col gap-6 text-left">
          <div className="flex items-center gap-3">
            <Skeleton circle width={40} height={40} />
            <Skeleton width={150} height={20} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-gray-950/20 border border-gray-800/50 rounded-2xl">
              <Skeleton width={80} height={14} className="mb-2" />
              <Skeleton width={120} height={28} />
            </div>
            <div className="p-5 bg-gray-950/20 border border-gray-800/50 rounded-2xl">
              <Skeleton width={80} height={14} className="mb-2" />
              <Skeleton width={120} height={28} />
            </div>
          </div>
        </div>

        {/* Right Col: Quick Actions */}
        <div className="flex flex-col gap-4">
          <Skeleton width={120} height={20} className="mb-1" />
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="p-4 bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col items-center justify-center gap-3">
                <Skeleton circle width={44} height={44} />
                <Skeleton width={70} height={12} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent users */}
      <div className="p-6 bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col gap-5 text-left">
        <div className="flex items-center justify-between">
          <Skeleton width={180} height={20} />
          <Skeleton width={80} height={14} />
        </div>
        <div className="flex flex-col gap-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3.5 bg-gray-950/20 border border-gray-800/50 rounded-2xl">
              <div className="flex items-center gap-3.5">
                <Skeleton width={44} height={44} className="rounded-2xl" />
                <div>
                  <Skeleton width={120} height={16} className="mb-1" />
                  <Skeleton width={150} height={12} />
                </div>
              </div>
              <Skeleton width={60} height={20} className="rounded-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </AdminSkeletonTheme>
);

// 2. Users Management Skeleton Loader
export const UsersSkeleton = () => (
  <AdminSkeletonTheme>
    <div className="h-full flex flex-col p-4 md:p-8 gap-5 animate-fade-in">
      {/* Top Controls: Metrics Row */}
      <div className="grid grid-cols-4 gap-2.5 md:gap-4 shrink-0">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-[#0c0d19]/40 border border-gray-800/80 rounded-2xl md:rounded-3xl p-3 md:p-4 flex flex-col items-center justify-center text-center">
            <Skeleton width={40} height={28} className="mb-1" />
            <Skeleton width={65} height={12} />
          </div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 shrink-0">
        <Skeleton height={50} className="rounded-2xl" />
        <div className="flex gap-2 overflow-x-auto py-1">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} width={80} height={36} className="rounded-full shrink-0" />
          ))}
        </div>
        <div className="flex justify-between items-center border-b border-gray-800/40 pb-2">
          <Skeleton width={80} height={16} />
          <Skeleton width={60} height={16} />
        </div>
      </div>

      {/* Cards List */}
      <div className="flex-1 overflow-y-auto pr-1 pb-28 flex flex-col gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-[#0c0d19]/40 border border-gray-800/80 rounded-[1.75rem]">
            <div className="flex items-center gap-3.5">
              <Skeleton width={48} height={48} className="rounded-2xl" />
              <div>
                <Skeleton width={140} height={16} className="mb-1" />
                <Skeleton width={180} height={12} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Skeleton width={60} height={20} className="rounded-full" />
              <Skeleton width={40} height={20} className="rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  </AdminSkeletonTheme>
);

// 3. Subjects Management Skeleton Loader
export const ContentSkeleton = () => (
  <AdminSkeletonTheme>
    <div className="h-full flex flex-col p-4 md:p-8 gap-5 animate-fade-in">
      {/* Top Filter Controls */}
      <div className="flex flex-col gap-4 shrink-0">
        <Skeleton height={50} className="rounded-2xl" />
        <div className="flex gap-2 py-1">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} width={80} height={36} className="rounded-full" />
          ))}
        </div>
        <div className="flex justify-between items-center text-xs">
          <Skeleton width={70} height={14} />
          <Skeleton width={60} height={14} />
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="flex-1 overflow-y-auto pr-1 pb-36 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-5 bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col gap-4 relative">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3.5">
                <Skeleton width={48} height={48} className="rounded-2xl" />
                <div>
                  <Skeleton width={100} height={16} className="mb-1" />
                  <Skeleton width={140} height={12} />
                </div>
              </div>
              <Skeleton width={40} height={20} className="rounded-full" />
            </div>
            <Skeleton height={1} className="my-1" />
            <div className="flex justify-between items-center mt-2">
              <Skeleton width={70} height={24} className="rounded-full" />
              <div className="flex gap-2">
                <Skeleton width={60} height={30} className="rounded-2xl" />
                <Skeleton width={60} height={30} className="rounded-2xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </AdminSkeletonTheme>
);

// 4. Coupons Management Skeleton Loader
export const CouponsSkeleton = () => (
  <AdminSkeletonTheme>
    <div className="h-full flex flex-col p-4 md:p-8 gap-5 animate-fade-in">
      {/* Top Filter Controls */}
      <div className="flex flex-col gap-4 shrink-0">
        <Skeleton height={50} className="rounded-2xl" />
        <div className="flex gap-2 py-1">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} width={80} height={36} className="rounded-full" />
          ))}
        </div>
        <div className="flex justify-between items-center">
          <Skeleton width={80} height={14} />
          <div className="flex gap-4">
            <Skeleton width={60} height={16} />
            <Skeleton width={80} height={16} />
          </div>
        </div>
      </div>

      {/* Grid of Coupon Cards */}
      <div className="flex-1 overflow-y-auto pr-1 pb-36 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-5 bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <Skeleton width={40} height={40} className="rounded-xl" />
                <div>
                  <Skeleton width={120} height={18} className="mb-1" />
                  <Skeleton width={80} height={12} />
                </div>
              </div>
              <Skeleton width={40} height={20} className="rounded-full" />
            </div>
            <div className="flex justify-between items-center mt-2 border-t border-gray-800/40 pt-3">
              <div>
                <Skeleton width={40} height={10} className="mb-1" />
                <Skeleton width={60} height={18} />
              </div>
              <div className="flex gap-2">
                <Skeleton width={32} height={32} className="rounded-xl" />
                <Skeleton width={32} height={32} className="rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </AdminSkeletonTheme>
);

// 5. Reports & Analytics Skeleton Loader
export const ReportsSkeleton = () => (
  <AdminSkeletonTheme>
    <div className="h-full flex flex-col p-4 md:p-8 gap-5 animate-fade-in">
      {/* Top Header controls */}
      <div className="flex flex-col gap-4 shrink-0">
        <Skeleton height={40} className="rounded-2xl" />
        <div className="flex justify-between items-center">
          <Skeleton width={120} height={32} className="rounded-full" />
          <Skeleton width={100} height={32} className="rounded-full" />
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="flex-1 overflow-y-auto pr-1 pb-36 flex flex-col gap-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-5 bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col gap-4">
              <Skeleton circle width={44} height={44} />
              <div>
                <Skeleton width={50} height={24} className="mb-1" />
                <Skeleton width={90} height={12} />
              </div>
            </div>
          ))}
        </div>

        {/* Aggregate Graph/Table Skeleton */}
        <div className="p-6 bg-[#0c0d19]/40 border border-gray-800/80 rounded-3xl flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <Skeleton circle width={40} height={40} />
            <Skeleton width={180} height={18} />
          </div>
          <div className="flex flex-col gap-3 mt-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-gray-850/50">
                <Skeleton width={100} height={16} />
                <Skeleton width={60} height={16} />
                <Skeleton width={80} height={16} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </AdminSkeletonTheme>
);
