import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiChevronLeft,
  FiType,
  FiClock,
  FiPlay,
  FiImage,
  FiLock,
  FiCalendar,
  FiChevronDown,
  FiEye,
  FiRefreshCw,
  FiBookOpen,
  FiPlus,
  FiSave
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import VideoUploader, { startBunnyDirectUpload } from '../../components/shared/VideoUploader';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTeacherSubjects,
  fetchSubjectUnits,
  fetchLessons,
  createLesson,
  updateLesson
} from '../../redux/slices/teacherSlice';
import { useLanguage } from '../../context/LanguageContext';

const formatSecondsToMMSS = (totalSeconds) => {
  if (!totalSeconds || isNaN(totalSeconds)) return '';
  const sec = Number(totalSeconds);
  const hours = Math.floor(sec / 3600);
  const minutes = Math.floor((sec % 3600) / 60);
  const remainingSeconds = sec % 60;
  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

const parseVideoLengthToSeconds = (lengthStr) => {
  if (!lengthStr) return 0;
  if (typeof lengthStr === 'number') return lengthStr;
  const str = String(lengthStr).trim();
  const parts = str.split(':');
  if (parts.length === 2) {
    const minutes = parseInt(parts[0], 10) || 0;
    const seconds = parseInt(parts[1], 10) || 0;
    return minutes * 60 + seconds;
  }
  if (parts.length === 3) {
    const hours = parseInt(parts[0], 10) || 0;
    const minutes = parseInt(parts[1], 10) || 0;
    const seconds = parseInt(parts[2], 10) || 0;
    return hours * 3600 + minutes * 60 + seconds;
  }
  const val = parseInt(str, 10);
  return isNaN(val) ? 0 : val;
};

const parseDurationToMinutes = (durStr) => {
  if (typeof durStr === 'number') return durStr;
  if (!durStr || typeof durStr !== 'string') return 0;
  const match = durStr.match(/\d+/);
  return match ? parseInt(match[0], 10) : 0;
};

const AddLesson = () => {
  const navigate = useNavigate();
  const { subjectId, lessonId } = useParams();
  const isEditing = Boolean(lessonId);
  const dispatch = useDispatch();
  const { t, isRTL } = useLanguage();

  const { subjects = [], units = [], lessons = [], isLoading } = useSelector((state) => state.teacher);

  const [selectedSubjectId, setSelectedSubjectId] = useState(() => {
    if (!subjectId || subjectId === 'select') {
      return '';
    }
    return subjectId;
  });

  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Accordion section states (all open by default in edit/add mode for fast access)
  const [openSections, setOpenSections] = useState({
    basic: true,
    content: true,
    settings: true
  });

  const toggleSection = (sec) => {
    setOpenSections((prev) => ({ ...prev, [sec]: !prev[sec] }));
  };

  // Form States
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonTitleAr, setLessonTitleAr] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonOrder, setLessonOrder] = useState(1);
  const [explanationVideoUrl, setExplanationVideoUrl] = useState('');
  const [videoLength, setVideoLength] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [pendingVideoFile, setPendingVideoFile] = useState(null);

  // Settings Toggles
  const [isPublished, setIsPublished] = useState(false);
  const [isFree, setIsFree] = useState(false);
  const [requirePrevious, setRequirePrevious] = useState(false);
  const [allowRetakes, setAllowRetakes] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormInitialized, setIsFormInitialized] = useState(false);

  // Load teacher subjects on mount
  useEffect(() => {
    dispatch(fetchTeacherSubjects());
  }, [dispatch]);

  // Load lessons and units when subject is known
  useEffect(() => {
    if (selectedSubjectId) {
      setHasLoadedData(false);
      Promise.all([
        dispatch(fetchLessons(selectedSubjectId)).unwrap().catch(() => {}),
        dispatch(fetchSubjectUnits(selectedSubjectId)).unwrap().catch(() => {})
      ]).finally(() => {
        setHasLoadedData(true);
      });
    }
  }, [dispatch, selectedSubjectId]);

  // Set default subject for new lessons if subjectId is 'select' and subjects load
  useEffect(() => {
    if (!isEditing && !selectedSubjectId && subjects.length > 0 && subjectId === 'select') {
      setSelectedSubjectId(subjects[0]?._id || subjects[0]?.id || '');
    }
  }, [subjects, selectedSubjectId, subjectId, isEditing]);

  const subject = subjects.find((sub) => (sub._id || sub.id) === selectedSubjectId) || { name: 'Unknown Subject' };
  const existingLesson = isEditing ? lessons.find((l) => (l._id || l.id) === lessonId) : null;

  // Reset initialization flag if lessonId changes
  useEffect(() => {
    setIsFormInitialized(false);
  }, [lessonId]);

  // Sync form states when existingLesson is found
  useEffect(() => {
    if (existingLesson && !isFormInitialized) {
      const lessonSubId = existingLesson.subject?._id || existingLesson.subject || existingLesson.subjectId;
      if (lessonSubId && (!selectedSubjectId || selectedSubjectId === 'select')) {
        setSelectedSubjectId(lessonSubId);
      }
      setLessonTitle(existingLesson.title || '');
      setLessonTitleAr(existingLesson.titleAr || '');
      setLessonDescription(existingLesson.description || '');
      setLessonDuration(
        existingLesson.duration !== undefined && existingLesson.duration !== null
          ? String(existingLesson.duration)
          : ''
      );
      setLessonOrder(existingLesson.order || 1);
      setSelectedUnitId(existingLesson.unit?._id || existingLesson.unit || existingLesson.unitId || '');
      setExplanationVideoUrl(existingLesson.videoUrl || existingLesson.videoPreviewUrl || '');
      
      const formattedLength = existingLesson.videoLength
        ? existingLesson.videoLength
        : (existingLesson.videoDuration ? formatSecondsToMMSS(existingLesson.videoDuration) : '');
      setVideoLength(formattedLength);
      
      setThumbnailUrl(existingLesson.thumbnailUrl || '');
      setIsPublished(Boolean(existingLesson.isPublished));
      setIsFree(Boolean(existingLesson.isFree));
      setRequirePrevious(Boolean(existingLesson.requirePrevious));
      setAllowRetakes(existingLesson.allowRetakes !== false);
      setIsFormInitialized(true);
    }
  }, [existingLesson, isFormInitialized, selectedSubjectId]);

  // Set default order for newly created lesson
  useEffect(() => {
    if (!isEditing && selectedSubjectId && lessons.length >= 0) {
      const subjectLessons = lessons.filter(l => (l.subject?._id || l.subject || l.subjectId) === selectedSubjectId);
      setLessonOrder(subjectLessons.length + 1);
    }
  }, [isEditing, selectedSubjectId, lessons]);

  // Only handle missing lesson after data has been loaded and verified
  useEffect(() => {
    if (isEditing && hasLoadedData && !isLoading && !existingLesson && lessons.length > 0) {
      // Check if current loaded lessons belong to the right subject before declaring not found
      const matchInLessons = lessons.some(l => (l._id || l.id) === lessonId);
      if (!matchInLessons) {
        toast.error(isRTL ? 'الدرس غير موجود' : 'Lesson not found');
        navigate(selectedSubjectId ? `/teacher/subjects/${selectedSubjectId}` : '/teacher/subjects');
      }
    }
  }, [isEditing, hasLoadedData, isLoading, existingLesson, lessons, isRTL, navigate, selectedSubjectId, lessonId]);

  // Handle Form Submission
  const handleSaveLesson = async (e) => {
    e.preventDefault();

    if (!selectedSubjectId) {
      toast.error(isRTL ? 'يرجى اختيار المادة' : 'Please select a subject');
      return;
    }
    if (!lessonTitle.trim()) {
      toast.error(isRTL ? 'عنوان الدرس مطلوب' : 'Lesson title is required');
      setOpenSections(prev => ({ ...prev, basic: true }));
      return;
    }
    if (!lessonDuration.trim()) {
      toast.error(isRTL ? 'مدة الدرس مطلوبة' : 'Lesson duration is required');
      setOpenSections(prev => ({ ...prev, basic: true }));
      return;
    }

    setIsSubmitting(true);

    const payload = {
      subject: selectedSubjectId,
      subjectId: selectedSubjectId,
      unitId: selectedUnitId || null,
      unit: selectedUnitId || null,
      title: lessonTitle.trim(),
      titleAr: lessonTitleAr.trim() || null,
      description: lessonDescription.trim(),
      duration: parseDurationToMinutes(lessonDuration),
      order: Number(lessonOrder) || 1,
      videoLength: videoLength.trim(),
      videoDuration: parseVideoLengthToSeconds(videoLength),
      videoUrl: explanationVideoUrl.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      isPublished: Boolean(isPublished),
      isFree: Boolean(isFree),
      requirePrevious: Boolean(requirePrevious),
      allowRetakes: Boolean(allowRetakes)
    };

    const loadingToast = toast.loading(
      isEditing
        ? (isRTL ? 'جاري تحديث الدرس...' : 'Updating lesson...')
        : (isRTL ? 'جاري إنشاء الدرس...' : 'Creating lesson...')
    );

    try {
      let targetLessonId = lessonId;

      if (isEditing) {
        const res = await dispatch(updateLesson({ id: lessonId, lessonData: payload })).unwrap();
        const updated = res?.lesson || res;
        targetLessonId = updated?._id || updated?.id || lessonId;
      } else {
        const res = await dispatch(createLesson(payload)).unwrap();
        const created = res?.lesson || res;
        targetLessonId = created?._id || created?.id;
      }

      toast.success(
        isEditing
          ? (isRTL ? 'تم تحديث الدرس بنجاح!' : 'Lesson updated successfully!')
          : (isRTL ? 'تم إنشاء الدرس بنجاح!' : 'Lesson created successfully!'),
        { id: loadingToast }
      );

      // If user picked a video file before creating a new lesson, start upload now
      if (!isEditing && pendingVideoFile && targetLessonId) {
        const uploadToast = toast.loading(isRTL ? 'جاري بدء رفع الفيديو...' : 'Starting video upload...');
        startBunnyDirectUpload({
          targetType: 'lesson',
          targetId: targetLessonId,
          title: lessonTitle,
          file: pendingVideoFile,
          onProgress: (pct) => {
            toast.loading(isRTL ? `جاري رفع الفيديو... ${pct}%` : `Uploading video... ${pct}%`, { id: uploadToast });
          },
          onSuccess: () => {
            toast.success(isRTL ? 'تم رفع الفيديو بنجاح!' : 'Video uploaded successfully!', { id: uploadToast });
            if (selectedSubjectId) {
              dispatch(fetchLessons(selectedSubjectId));
            }
          },
          onError: (err) => {
            toast.error((isRTL ? 'فشل رفع الفيديو: ' : 'Video upload failed: ') + (err.message || ''), { id: uploadToast });
          }
        });
      }

      setIsSubmitting(false);
      navigate(`/teacher/subjects/${selectedSubjectId}`);
    } catch (err) {
      setIsSubmitting(false);
      toast.error(err || (isRTL ? 'فشل حفظ الدرس' : 'Failed to save lesson'), { id: loadingToast });
    }
  };

  return (
    <DashboardLayout
      role="teacher"
      activeTab="subjects"
      title={isEditing ? (isRTL ? 'تعديل الدرس' : 'Edit Lesson') : (isRTL ? 'إضافة درس' : 'Add Lesson')}
      subtitle={
        selectedSubjectId
          ? `${isRTL ? 'المادة' : 'Subject'}: ${subject.name || subject.title || ''}`
          : (isRTL ? 'اختر المادة والتفاصيل' : 'Choose subject and details')
      }
    >
      <div className="w-full max-w-full p-6 md:p-8 pb-32 text-start flex flex-col gap-6 animate-fade-in">

        {/* Header Block */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-800/40">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => {
                const targetId = (subjectId === 'select' ? selectedSubjectId : subjectId) || selectedSubjectId;
                navigate(targetId ? `/teacher/subjects/${targetId}` : '/teacher/subjects');
              }}
              className={`w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer ${isRTL ? 'ml-3' : 'mr-3'}`}
            >
              <FiChevronLeft size={20} className={isRTL ? 'rotate-180' : ''} />
            </button>
          </div>

          {/* Status Indicator */}
          <div className={`px-4.5 py-1.5 rounded-full text-sm font-black border flex items-center gap-1.5 ${
            isPublished
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            <span>{isPublished ? (isRTL ? 'منشور' : 'Published') : (isRTL ? 'مسودة' : 'Draft')}</span>
          </div>
        </div>

        {/* Subject Dropdown Selector */}
        <div className="flex flex-col gap-3 text-start">
          <span className="text-xs font-black tracking-widest text-gray-500 uppercase px-1">
            {isRTL ? "المادة" : "Subject"}
          </span>
          <div className="relative w-full">
            <FiBookOpen className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-blue-500`} size={18} />
            <select
              value={selectedSubjectId}
              onChange={(e) => {
                const newSubId = e.target.value;
                setSelectedSubjectId(newSubId);
                if (!isEditing) {
                  const subjectLessons = lessons.filter(l => (l.subject?._id || l.subject || l.subjectId) === newSubId);
                  setLessonOrder(subjectLessons.length + 1);
                }
              }}
              className={`w-full ${isRTL ? 'pr-12 pl-10' : 'pl-12 pr-10'} py-4 bg-[#0e101a] border border-gray-800 rounded-2xl text-white font-semibold outline-none focus:border-blue-500/50 appearance-none cursor-pointer focus:ring-0 text-base`}
              disabled={isEditing}
            >
              <option value="" disabled>{isRTL ? "اختر المادة" : "Select Subject"}</option>
              {subjects.map(s => (
                <option key={s._id || s.id} value={s._id || s.id}>{s.title || s.name}</option>
              ))}
            </select>
            <FiChevronDown className={`text-gray-400 absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none`} />
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSaveLesson} className="flex flex-col gap-4 w-full">

          {/* ACCORDION A: BASIC INFORMATION */}
          <div className="flex flex-col">
            <div
              onClick={() => toggleSection('basic')}
              className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800/80 rounded-2xl cursor-pointer hover:bg-[#121424] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <FiType size={18} />
                </div>
                <span className="text-base font-extrabold text-white">{isRTL ? "المعلومات الأساسية" : "Basic Information"}</span>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${openSections.basic ? 'rotate-180' : ''}`} />
            </div>

            {openSections.basic && (
              <div className="p-5 bg-[#0e101a]/50 border-x border-b border-gray-800/80 rounded-b-2xl -mt-2.5 flex flex-col gap-4 animate-fade-in text-start">
                {/* Lesson Titles */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={isRTL ? "عنوان الدرس (الإنجليزية)" : "Lesson Title"}
                    type="text"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    placeholder={lessonTitle ? "" : (isRTL ? "مثال: مقدمة في الفيزياء" : "e.g. Introduction to Physics")}
                    icon={FiType}
                    roleColor="teacher"
                  />

                  <Input
                    label={isRTL ? "عنوان الدرس (بالعربية)" : "Arabic Lesson Title"}
                    type="text"
                    value={lessonTitleAr}
                    onChange={(e) => setLessonTitleAr(e.target.value)}
                    placeholder={lessonTitleAr ? "" : "مثال: تأسيس هام وشامل جداً"}
                    icon={FiType}
                    roleColor="teacher"
                  />
                </div>

                {/* Unit Selector */}
                <div className="flex flex-col gap-1 text-start">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">
                    {isRTL ? "تعيين إلى وحدة (اختياري)" : "Assign to Unit (Optional)"}
                  </span>
                  <div className="relative w-full">
                    <select
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#0e101a] border border-gray-800 rounded-2xl text-white font-semibold outline-none focus:border-blue-500/50 appearance-none cursor-pointer text-sm"
                    >
                      <option value="">{isRTL ? "بدون وحدة (درس عام)" : "No Unit (General Lesson)"}</option>
                      {units.map((u) => (
                        <option key={u._id || u.id} value={u._id || u.id}>
                          {u.title} {u.titleAr ? `(${u.titleAr})` : ''}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className={`text-gray-400 absolute ${isRTL ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 pointer-events-none`} />
                  </div>
                </div>

                {/* Description */}
                <textarea
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  placeholder={isRTL ? "الوصف" : "Description"}
                  rows={4}
                  className="w-full bg-[#0e101a] border border-gray-800 rounded-2xl p-4 text-white text-base focus:outline-none focus:border-blue-500/50 resize-none font-semibold focus:ring-0"
                />

                {/* Duration and Order Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={isRTL ? "المدة (بالدقائق)" : "Duration (minutes)"}
                    type="text"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder={lessonDuration ? "" : (isRTL ? "مثال: 45" : "e.g. 45")}
                    icon={FiClock}
                    roleColor="teacher"
                  />

                  {/* Order Counter */}
                  <div className="w-full flex items-center justify-between rounded-2xl bg-[#0e101a] border border-gray-800 h-15 px-4">
                    <div className="flex flex-col text-start">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{isRTL ? "الترتيب" : "Order"}</span>
                      <span className="text-xs text-white font-extrabold">{isRTL ? "تسلسل الدرس" : "Sequence of lesson"}</span>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-900 border border-gray-800 rounded-xl p-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => setLessonOrder(Math.max(1, lessonOrder - 1))}
                        className="w-8 h-8 rounded-lg bg-gray-800 text-white font-black hover:bg-gray-750 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      >
                        -
                      </button>
                      <span className="text-sm font-black text-white px-1 min-w-[15px] text-center">{lessonOrder}</span>
                      <button
                        type="button"
                        onClick={() => setLessonOrder(lessonOrder + 1)}
                        className="w-8 h-8 rounded-lg bg-gray-800 text-white font-black hover:bg-gray-750 flex items-center justify-center cursor-pointer transition-all active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION B: LESSON CONTENT */}
          <div className="flex flex-col">
            <div
              onClick={() => toggleSection('content')}
              className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800/80 rounded-2xl cursor-pointer hover:bg-[#121424] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <FiPlay size={18} />
                </div>
                <span className="text-base font-extrabold text-white">{isRTL ? "محتوى الدرس" : "Lesson Content"}</span>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${openSections.content ? 'rotate-180' : ''}`} />
            </div>

            {openSections.content && (
              <div className="p-5 bg-[#0e101a]/50 border-x border-b border-gray-800/80 rounded-b-2xl -mt-2.5 flex flex-col gap-5 animate-fade-in text-start">
                {/* Bunny Direct Video Uploader */}
                <VideoUploader
                  targetType="lesson"
                  targetId={lessonId || null}
                  title={lessonTitle}
                  currentVideoUrl={explanationVideoUrl}
                  videoPreviewUrl={existingLesson?.videoPreviewUrl || null}
                  videoId={existingLesson?.videoId || null}
                  hasVideo={Boolean(
                    explanationVideoUrl ||
                    existingLesson?.videoPreviewUrl ||
                    existingLesson?.videoId ||
                    (existingLesson?.videoStatus === 'ready' || existingLesson?.videoStatus === 'processing')
                  )}
                  videoReady={existingLesson ? (existingLesson.videoStatus === 'ready' || existingLesson.videoReady !== false) : true}
                  selectedFile={pendingVideoFile}
                  onFileSelect={(file) => setPendingVideoFile(file)}
                  onUploadSuccess={(ticket) => {
                    if (ticket?.playbackUrl || ticket?.directUrl || ticket?.url) {
                      setExplanationVideoUrl(ticket.playbackUrl || ticket.directUrl || ticket.url);
                    }
                    if (selectedSubjectId) {
                      dispatch(fetchLessons(selectedSubjectId));
                    }
                  }}
                  onDeleteSuccess={() => {
                    setExplanationVideoUrl('');
                    if (selectedSubjectId) {
                      dispatch(fetchLessons(selectedSubjectId));
                    }
                  }}
                />

                <Input
                  label={isRTL ? "رابط فيديو خارجي (YouTube أو رابط مباشر)" : "External Video URL (YouTube or direct link)"}
                  type="text"
                  value={explanationVideoUrl}
                  onChange={(e) => setExplanationVideoUrl(e.target.value)}
                  placeholder={explanationVideoUrl ? "" : "e.g. https://youtube.com/watch?v=..."}
                  icon={FiPlay}
                  roleColor="teacher"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={isRTL ? "طول الفيديو (دقيقة:ثانية)" : "Video Length (mm:ss)"}
                    type="text"
                    value={videoLength}
                    onChange={(e) => setVideoLength(e.target.value)}
                    placeholder={videoLength ? "" : "e.g. 04:06"}
                    icon={FiClock}
                    roleColor="teacher"
                  />

                  <Input
                    label={isRTL ? "رابط الصورة المصغرة (اختياري)" : "Thumbnail URL (optional)"}
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder={thumbnailUrl ? "" : "e.g. https://images.unsplash.com/..."}
                    icon={FiImage}
                    roleColor="teacher"
                  />
                </div>
              </div>
            )}
          </div>

          {/* ACCORDION C: SETTINGS */}
          <div className="flex flex-col">
            <div
              onClick={() => toggleSection('settings')}
              className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800/80 rounded-2xl cursor-pointer hover:bg-[#121424] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <FiCalendar size={18} />
                </div>
                <span className="text-base font-extrabold text-white">{isRTL ? "الإعدادات" : "Settings"}</span>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${openSections.settings ? 'rotate-180' : ''}`} />
            </div>

            {openSections.settings && (
              <div className="p-5 bg-[#0e101a]/50 border-x border-b border-gray-800/80 rounded-b-2xl -mt-2.5 flex flex-col gap-4 animate-fade-in text-start">
                <div className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <FiEye size={18} />
                    </div>
                    <div className="flex flex-col text-start">
                      <span className="text-sm font-extrabold text-white">{isRTL ? "نشر الدرس" : "Publish Lesson"}</span>
                      <span className="text-[10px] text-gray-500 font-bold mt-0.5">{isRTL ? "جعل هذا الدرس مرئياً للطلاب" : "Make this lesson visible to students"}</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isPublished}
                      onChange={() => setIsPublished(!isPublished)}
                    />
                    <div className="w-11 h-6 bg-slate-300 dark:bg-gray-800 border border-slate-400 dark:border-transparent peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:shadow-md after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500 peer-checked:border-transparent" />
                  </label>
                </div>

                {/* Free Lesson Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                      <FiLock size={18} />
                    </div>
                    <div className="flex flex-col text-start">
                      <span className="text-sm font-extrabold text-white">
                        {isRTL ? "درس مجاني (معاينة)" : "Free Lesson (Preview)"}
                      </span>
                      <span className="text-[10px] text-gray-500 font-bold mt-0.5">
                        {isRTL ? "السماح للطلاب بمشاهدة هذا الدرس بدون اشتراك" : "Allow students to watch this lesson without subscription"}
                      </span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isFree}
                      onChange={() => setIsFree(!isFree)}
                    />
                    <div className="w-11 h-6 bg-gray-800 border border-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:shadow-md after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-500 peer-checked:border-transparent" />
                  </label>
                </div>

                {/* Require Previous Lesson Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <FiLock size={18} />
                    </div>
                    <div className="flex flex-col text-start">
                      <span className="text-sm font-extrabold text-white">{isRTL ? "اشتراط الدرس السابق" : "Require Previous Lesson"}</span>
                      <span className="text-[10px] text-gray-500 font-bold mt-0.5">{isRTL ? "يجب على الطلاب إكمال الدرس السابق أولاً" : "Students must complete previous lesson first"}</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={requirePrevious}
                      onChange={() => setRequirePrevious(!requirePrevious)}
                    />
                    <div className="w-11 h-6 bg-gray-800 border border-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:shadow-md after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:border-transparent" />
                  </label>
                </div>

                {/* Allow Question Retakes Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <FiRefreshCw size={18} />
                    </div>
                    <div className="flex flex-col text-start">
                      <span className="text-sm font-extrabold text-white">{isRTL ? "السماح بإعادة الأسئلة" : "Allow Question Retakes"}</span>
                      <span className="text-[10px] text-gray-500 font-bold mt-0.5">{isRTL ? "يمكن للطلاب إعادة محاولة أسئلة الدرس" : "Students can retry lesson questions"}</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={allowRetakes}
                      onChange={() => setAllowRetakes(!allowRetakes)}
                    />
                    <div className="w-11 h-6 bg-gray-800 border border-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-200 after:shadow-md after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500 peer-checked:border-transparent" />
                  </label>
                </div>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            roleColor="teacher"
            icon={isEditing ? FiSave : FiPlus}
            className="w-full mt-6 !rounded-2xl text-base"
          >
            {isEditing ? (isRTL ? 'حفظ التغييرات' : 'Save Changes') : (isRTL ? 'إنشاء الدرس' : 'Create Lesson')}
          </Button>

        </form>

      </div>
    </DashboardLayout>
  );
};

export default AddLesson;
