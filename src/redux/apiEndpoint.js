const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3008/api';

export const apiEndpoints = {
  baseUrl: BASE_URL,

  auth: {
    register: `${BASE_URL}/auth/register`,
    verifyOtp: `${BASE_URL}/auth/verify-otp`,
    resendOtp: `${BASE_URL}/auth/resend-otp`,
    login: `${BASE_URL}/auth/login`,
    forgotPassword: `${BASE_URL}/auth/forgot-password`,
    resetPassword: `${BASE_URL}/auth/reset-password`,
    me: `${BASE_URL}/auth/me`,
    updateProfile: `${BASE_URL}/auth/update-profile`,
    changePassword: `${BASE_URL}/auth/change-password`,
    logout: `${BASE_URL}/auth/logout`,
  },

  admin: {
    dashboard: `${BASE_URL}/admin/dashboard`,
    users: `${BASE_URL}/admin/users`,
    usersExport: `${BASE_URL}/admin/users/export`,
    userById: (id) => `${BASE_URL}/admin/users/${id}`,
    toggleUserActive: (id) => `${BASE_URL}/admin/users/${id}/toggle-active`,
    subjects: `${BASE_URL}/admin/subjects`,
    subjectById: (id) => `${BASE_URL}/admin/subjects/${id}`,
    // Coupons (v3: Batches)
    couponBatches: `${BASE_URL}/admin/coupons/batches`,
    couponBatchDetail: (batchId) => `${BASE_URL}/admin/coupons/batches/${batchId}`,
    exportCouponBatch: (batchId) => `${BASE_URL}/admin/coupons/batches/${batchId}/export`,
    couponById: (id) => `${BASE_URL}/admin/coupons/${id}`,
    cancelCoupon: (id) => `${BASE_URL}/admin/coupons/${id}/cancel`,
    // Reports
    reports: `${BASE_URL}/admin/reports`,
    reportsExport: `${BASE_URL}/admin/reports/export`,
    // Notifications
    notifications: `${BASE_URL}/admin/notifications`,
    notificationHistory: `${BASE_URL}/admin/notifications/history`,
    // Settings & Others
    approveTeacher: (userId) => `${BASE_URL}/admin/teachers/${userId}/approve`,
    transactions: `${BASE_URL}/admin/transactions`,
    settings: `${BASE_URL}/admin/settings`,
    questions: `${BASE_URL}/admin/questions`,
    questionById: (id) => `${BASE_URL}/admin/questions/${id}`,
    approveQuestion: (id) => `${BASE_URL}/admin/questions/${id}/approve`,
    lessons: `${BASE_URL}/admin/lessons`,
    toggleLessonFree: (id) => `${BASE_URL}/admin/lessons/${id}/toggle-free`,
    bulkToggleLessonFree: `${BASE_URL}/admin/lessons/bulk-free-toggle`,
    exams: `${BASE_URL}/admin/exams`,
    teacherReport: (id) => `${BASE_URL}/admin/reports/teachers/${id}`,
    studentReport: (id) => `${BASE_URL}/admin/reports/students/${id}`,
  },

  student: {
    dashboard: `${BASE_URL}/student/dashboard`,
    profile: `${BASE_URL}/student/profile`,
    fcmToken: `${BASE_URL}/student/fcm-token`,
    linkCode: `${BASE_URL}/student/link-code`,
    enroll: `${BASE_URL}/student/enroll`,
    subjects: `${BASE_URL}/student/subjects`,
    browseSubjects: `${BASE_URL}/student/subjects/browse`,
    subjectLessons: (subjectId) => `${BASE_URL}/student/subjects/${subjectId}/lessons`,
    subjectProgress: (id) => `${BASE_URL}/student/subjects/${id}/progress`,
    lessonProgress: (id) => `${BASE_URL}/student/lessons/${id}/progress`,
    markLessonComplete: `${BASE_URL}/student/lessons/complete`,
    couponsValidate: (code) => `${BASE_URL}/student/coupons/${code}/validate`,
    couponsRedeem: `${BASE_URL}/student/coupons/redeem`,
    couponTransactions: (code) => `${BASE_URL}/student/coupons/${code}/transactions`,
    transactions: `${BASE_URL}/student/transactions`,
    exams: `${BASE_URL}/student/exams`,
    examToTake: (id) => `${BASE_URL}/student/exams/${id}/take`,
    adaptiveQuestion: `${BASE_URL}/student/exams/adaptive-question`,
    generateExam: `${BASE_URL}/student/exams/generate`,
    submitExam: `${BASE_URL}/student/exams/submit`,
    examHistory: `${BASE_URL}/student/exams/history`,
    results: `${BASE_URL}/student/results`,
    resultById: (id) => `${BASE_URL}/student/results/${id}`,
    notifications: `${BASE_URL}/student/notifications`,
    readNotification: (id) => `${BASE_URL}/student/notifications/${id}/read`,
    leaderboard: `${BASE_URL}/student/leaderboard`,
  },

  teacher: {
    profile: `${BASE_URL}/teacher/profile`,
    stats: `${BASE_URL}/teacher/stats`,
    subjects: `${BASE_URL}/teacher/subjects`,
    subjectUnits: (subjectId) => `${BASE_URL}/teacher/subjects/${subjectId}/units`,
    units: `${BASE_URL}/teacher/units`,
    unitById: (id) => `${BASE_URL}/teacher/units/${id}`,
    lessons: `${BASE_URL}/teacher/lessons`,
    lessonById: (id) => `${BASE_URL}/teacher/lessons/${id}`,
    subjectLessons: (subjectId) => `${BASE_URL}/teacher/subjects/${subjectId}/lessons`,
    toggleLessonPublish: (id) => `${BASE_URL}/teacher/lessons/${id}/toggle-publish`,
    questions: `${BASE_URL}/teacher/questions`,
    questionById: (id) => `${BASE_URL}/teacher/questions/${id}`,
    extractPdf: `${BASE_URL}/teacher/questions/extract-pdf`,
    exams: `${BASE_URL}/teacher/exams`,
    examById: (id) => `${BASE_URL}/teacher/exams/${id}`,
    togglePublishExam: (id) => `${BASE_URL}/teacher/exams/${id}/toggle-publish`,
  },

  parent: {
    profile: `${BASE_URL}/parent/profile`,
    children: `${BASE_URL}/parent/children`,
    linkChild: `${BASE_URL}/parent/link-child`,
    unlinkChild: (id) => `${BASE_URL}/parent/children/${id}`,
    childOverview: (childId) => `${BASE_URL}/parent/children/${childId}/overview`,
    childSubjects: (childId) => `${BASE_URL}/parent/children/${childId}/subjects`,
    childResults: (childId) => `${BASE_URL}/parent/children/${childId}/results`,
    childProgress: (id) => `${BASE_URL}/parent/children/${id}/progress`,
    childResultDetail: (id, resultId) => `${BASE_URL}/parent/children/${id}/results/${resultId}`,
  },

  common: {
    uploadAvatar: `${BASE_URL}/upload/avatar`,
    uploadSubjectBanner: `${BASE_URL}/upload/subject-banner`,
    uploadLessonPdf: `${BASE_URL}/upload/lesson-pdf`,
    deleteLessonPdf: (lessonId) => `${BASE_URL}/upload/lesson-pdf/${lessonId}`,
    uploadQuestionImage: `${BASE_URL}/upload/question-image`,

    leaderboardOverall: `${BASE_URL}/leaderboard/overall`,
    leaderboardSubject: (subjectId) => `${BASE_URL}/leaderboard/subject/${subjectId}`,

    notifications: `${BASE_URL}/notifications`,
    markAllNotificationsRead: `${BASE_URL}/notifications/mark-all-read`,
    notificationById: (id) => `${BASE_URL}/notifications/${id}`,
    readNotification: (id) => `${BASE_URL}/notifications/${id}/read`,
  },

  public: {
    appInfo: `${BASE_URL}/public/app-info`,
    subjects: `${BASE_URL}/public/subjects`,
    leaderboardPreview: `${BASE_URL}/public/leaderboard/preview`,
  }
};

export default apiEndpoints;
