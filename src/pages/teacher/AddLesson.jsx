import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  FiChevronLeft,
  FiType,
  FiClock,
  FiPlay,
  FiImage,
  FiUploadCloud,
  FiLock,
  FiCalendar,
  FiChevronDown,
  FiEye,
  FiRefreshCw,
  FiBookOpen,
  FiPlus,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';

import DashboardLayout from '../../components/layout/DashboardLayout';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchTeacherSubjects,
  fetchSubjectUnits,
  fetchLessons,
  createLesson,
  updateLesson,
  uploadLessonPdf,
  deleteLessonPdf
} from '../../redux/slices/teacherSlice';

const AddLesson = () => {
  const navigate = useNavigate();
  const { subjectId, lessonId } = useParams();
  const isEditing = !!lessonId;
  const dispatch = useDispatch();

  const { subjects = [], units = [], lessons = [], isLoading } = useSelector((state) => state.teacher);

  const [selectedSubjectId, setSelectedSubjectId] = useState(() => {
    if (subjectId === 'select') {
      return '';
    }
    return subjectId;
  });

  const [selectedUnitId, setSelectedUnitId] = useState('');

  useEffect(() => {
    dispatch(fetchTeacherSubjects());
  }, [dispatch]);

  useEffect(() => {
    if (selectedSubjectId) {
      dispatch(fetchLessons(selectedSubjectId));
      dispatch(fetchSubjectUnits(selectedSubjectId));
    }
  }, [dispatch, selectedSubjectId]);

  // Set default subject if empty and subjects loaded
  useEffect(() => {
    if (!selectedSubjectId && subjects.length > 0 && subjectId === 'select') {
      setSelectedSubjectId(subjects[0]?._id || subjects[0]?.id || '');
    }
  }, [subjects, selectedSubjectId, subjectId]);

  const subject = subjects.find((sub) => (sub._id || sub.id) === selectedSubjectId) || { name: 'Unknown Subject' };
  const existingLesson = isEditing ? lessons.find((l) => (l._id || l.id) === lessonId) : null;

  // Accordion state - only one open at a time matching AddQuestion.jsx
  const [activeAccordion, setActiveAccordion] = useState('basic'); // 'basic' | 'content' | 'settings' | ''

  // Form States
  const [lessonTitle, setLessonTitle] = useState('');
  const [lessonDescription, setLessonDescription] = useState('');
  const [lessonDuration, setLessonDuration] = useState('');
  const [lessonOrder, setLessonOrder] = useState(1);
  const [explanationVideoUrl, setExplanationVideoUrl] = useState('');
  const [videoLength, setVideoLength] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  // PDF states
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfFileName, setPdfFileName] = useState('');
  const [isDeletingPdf, setIsDeletingPdf] = useState(false);

  const fileInputRef = useRef(null);

  // Settings Toggles
  const [isPublished, setIsPublished] = useState(true);
  const [requirePrevious, setRequirePrevious] = useState(false);
  const [allowRetakes, setAllowRetakes] = useState(true);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are allowed');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      toast.error('File size must be less than 25MB');
      return;
    }

    setPdfFile(file);
    setPdfFileName(file.name);
  };

  const handleRemoveFile = () => {
    setPdfFile(null);
    setPdfFileName('');
    if (pdfUrl) {
      setIsDeletingPdf(true);
      setPdfUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const parseVideoLengthToSeconds = (lengthStr) => {
    if (!lengthStr || typeof lengthStr !== 'string') return 0;
    const parts = lengthStr.split(':');
    if (parts.length === 2) {
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseInt(parts[1], 10) || 0;
      return minutes * 60 + seconds;
    }
    const val = parseInt(lengthStr, 10);
    return isNaN(val) ? 0 : val;
  };

  // Sync form states when existingLesson changes
  useEffect(() => {
    if (existingLesson) {
      setLessonTitle(existingLesson.title || '');
      setLessonDescription(existingLesson.description || '');
      setLessonDuration(existingLesson.duration || '');
      setLessonOrder(existingLesson.order || 1);
      setSelectedUnitId(existingLesson.unit?._id || existingLesson.unit || '');
      setExplanationVideoUrl(existingLesson.videoUrl || '');
      setVideoLength(existingLesson.videoLength || '');
      setThumbnailUrl(existingLesson.thumbnailUrl || '');
      setIsPublished(existingLesson.isPublished !== false);
      setRequirePrevious(!!existingLesson.requirePrevious);
      setAllowRetakes(existingLesson.allowRetakes !== false);
      setPdfUrl(existingLesson.pdfUrl || null);
      setPdfFile(null);
      setPdfFileName('');
      setIsDeletingPdf(false);
    }
  }, [existingLesson]);

  // Set default order for new lesson
  useEffect(() => {
    if (!isEditing && selectedSubjectId) {
      const subjectLessons = lessons.filter(l => (l.subject?._id || l.subject || l.subjectId) === selectedSubjectId);
      setLessonOrder(subjectLessons.length + 1);
    }
  }, [isEditing, selectedSubjectId, lessons]);

  // Handle errors or missing lessons on mount
  useEffect(() => {
    if (isEditing && !isLoading && lessons.length > 0 && !existingLesson) {
      toast.error('Lesson not found');
      navigate(subjectId === 'select' ? '/teacher/subjects' : `/teacher/subjects/${subjectId}`);
    }
  }, [isEditing, existingLesson, subjectId, navigate, isLoading, lessons]);

  // Handle Form Submission
  const handleSaveLesson = async (e) => {
    e.preventDefault();

    if (!selectedSubjectId) {
      toast.error('Please select a subject');
      return;
    }
    if (!lessonTitle.trim()) {
      toast.error('Lesson title is required');
      setActiveAccordion('basic');
      return;
    }
    if (!lessonDuration.trim()) {
      toast.error('Lesson duration is required');
      setActiveAccordion('basic');
      return;
    }
    if (!explanationVideoUrl.trim()) {
      toast.error('Explanation Video URL is required');
      setActiveAccordion('content');
      return;
    }
    if (!videoLength.trim()) {
      toast.error('Video length is required');
      setActiveAccordion('content');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      subject: selectedSubjectId,
      subjectId: selectedSubjectId,
      unitId: selectedUnitId || null,
      unit: selectedUnitId || null,
      title: lessonTitle,
      description: lessonDescription,
      duration: lessonDuration,
      order: Number(lessonOrder),
      videoLength,
      videoDuration: parseVideoLengthToSeconds(videoLength),
      videoUrl: explanationVideoUrl,
      thumbnailUrl,
      isPublished,
      requirePrevious,
      allowRetakes
    };

    const loadingToast = toast.loading(isEditing ? 'Updating lesson...' : 'Creating lesson...');
    try {
      // 1. Create or update lesson details
      const action = isEditing
        ? dispatch(updateLesson({ id: lessonId, lessonData: payload }))
        : dispatch(createLesson(payload));
      
      const response = await action.unwrap();
      
      // Get the lesson ID (could be inside nested response.lesson or directly response)
      const savedLessonId = isEditing ? lessonId : (response.lesson?._id || response.lesson?.id || response._id || response.id);

      if (!savedLessonId) {
        throw new Error('Could not retrieve Lesson ID from backend');
      }

      // 2. Delete old PDF if deletion was requested and we are not uploading a new one
      if (isEditing && isDeletingPdf && !pdfFile) {
        await dispatch(deleteLessonPdf(savedLessonId)).unwrap();
      }

      // 3. Upload new PDF if selected
      if (pdfFile) {
        await dispatch(uploadLessonPdf({ lessonId: savedLessonId, file: pdfFile })).unwrap();
      }

      toast.success(isEditing ? 'Lesson updated successfully!' : 'Lesson created successfully!', { id: loadingToast });
      setIsSubmitting(false);
      navigate(`/teacher/subjects/${selectedSubjectId}`);
    } catch (err) {
      setIsSubmitting(false);
      toast.error(err || 'Failed to save lesson', { id: loadingToast });
    }
  };

  return (
    <DashboardLayout
      role="teacher"
      activeTab={subjectId === 'select' ? 'subjects' : 'subjects'}
      title={isEditing ? 'Edit Lesson' : 'Add Lesson'}
      subtitle={subjectId === 'select' ? 'Choose subject and details' : `Subject: ${subject.name || subject.title}`}
    >
      <div className="w-full max-w-full p-6 md:p-8 pb-32 text-left flex flex-col gap-6 animate-fade-in">

        {/* Hidden File Input for PDF Materials — always mounted */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />

        {/* Header Block */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-800/40">
          <div className="flex items-center">
            <button
              type="button"
              onClick={() => {
                const targetId = (subjectId === 'select' ? selectedSubjectId : subjectId) || '';
                navigate(targetId ? `/teacher/subjects/${targetId}` : '/teacher/subjects');
              }}
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer mr-3"
            >
              <FiChevronLeft size={20} />
            </button>
          </div>

          {/* Status Indicator */}
          <div className={`px-4.5 py-1.5 rounded-full text-sm font-black border flex items-center gap-1.5 ${isPublished
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
            }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${isPublished ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
            <span>{isPublished ? 'Published' : 'Draft'}</span>
          </div>
        </div>

        {/* Subject Dropdown Selector */}
        <div className="flex flex-col gap-3 text-left">
          <span className="text-xs font-black tracking-widest text-gray-500 uppercase px-1">
            Subject
          </span>
          <div className="relative w-full">
            <FiBookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500" size={18} />
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
              className="w-full pl-12 pr-10 py-4 bg-[#0e101a] border border-gray-800 rounded-2xl text-white font-semibold outline-none focus:border-blue-500/50 appearance-none cursor-pointer focus:ring-0 text-base"
              disabled={isEditing}
            >
              <option value="" disabled>Select Subject</option>
              {subjects.map(s => (
                <option key={s._id || s.id} value={s._id || s.id}>{s.title || s.name}</option>
              ))}
            </select>
            <FiChevronDown className="text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSaveLesson} className="flex flex-col gap-4 w-full">

          {/* ACCORDION A: BASIC INFORMATION */}
          <div className="flex flex-col">
            <div
              onClick={() => setActiveAccordion(activeAccordion === 'basic' ? '' : 'basic')}
              className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800/80 rounded-2xl cursor-pointer hover:bg-[#121424] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <FiType size={18} />
                </div>
                <span className="text-base font-extrabold text-white">Basic Information</span>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${activeAccordion === 'basic' ? 'rotate-180' : ''}`} />
            </div>

            {activeAccordion === 'basic' && (
              <div className="p-5 bg-[#0e101a]/50 border-x border-b border-gray-800/80 rounded-b-2xl -mt-2.5 flex flex-col gap-4 animate-fade-in text-left">
                {/* Lesson Title */}
                <Input
                  label="Lesson Title"
                  type="text"
                  value={lessonTitle}
                  onChange={(e) => setLessonTitle(e.target.value)}
                  placeholder={lessonTitle ? "" : "e.g. Introduction to Physics"}
                  icon={FiType}
                  roleColor="teacher"
                />

                {/* Unit Selector */}
                <div className="flex flex-col gap-1 text-left">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-1">
                    Assign to Unit (Optional)
                  </span>
                  <div className="relative w-full">
                    <select
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      className="w-full px-4 py-3.5 bg-[#0e101a] border border-gray-800 rounded-2xl text-white font-semibold outline-none focus:border-blue-500/50 appearance-none cursor-pointer text-sm"
                    >
                      <option value="">No Unit (General Lesson)</option>
                      {units.map((u) => (
                        <option key={u._id || u.id} value={u._id || u.id}>
                          {u.title} {u.titleAr ? `(${u.titleAr})` : ''}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="text-gray-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Description */}
                <textarea
                  value={lessonDescription}
                  onChange={(e) => setLessonDescription(e.target.value)}
                  placeholder="Description"
                  rows={4}
                  className="w-full bg-[#0e101a] border border-gray-800 rounded-2xl p-4 text-white text-base focus:outline-none focus:border-blue-500/50 resize-none font-semibold focus:ring-0"
                />

                {/* Duration and Order Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Duration */}
                  <Input
                    label="Duration"
                    type="text"
                    value={lessonDuration}
                    onChange={(e) => setLessonDuration(e.target.value)}
                    placeholder={lessonDuration ? "" : "e.g. 45 min"}
                    icon={FiClock}
                    roleColor="teacher"
                  />

                  {/* Order Counter */}
                  <div className="w-full flex items-center justify-between rounded-2xl bg-[#0e101a] border border-gray-800 h-15 px-4">
                    <div className="flex flex-col text-left">
                      <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Order</span>
                      <span className="text-xs text-white font-extrabold">Sequence of lesson</span>
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
              onClick={() => setActiveAccordion(activeAccordion === 'content' ? '' : 'content')}
              className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800/80 rounded-2xl cursor-pointer hover:bg-[#121424] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                  <FiPlay size={18} />
                </div>
                <span className="text-base font-extrabold text-white">Lesson Content</span>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${activeAccordion === 'content' ? 'rotate-180' : ''}`} />
            </div>

            {activeAccordion === 'content' && (
              <div className="p-5 bg-[#0e101a]/50 border-x border-b border-gray-800/80 rounded-b-2xl -mt-2.5 flex flex-col gap-4 animate-fade-in text-left">
                {/* Explanation Video URL */}
                <Input
                  label="Explanation Video URL"
                  type="text"
                  value={explanationVideoUrl}
                  onChange={(e) => setExplanationVideoUrl(e.target.value)}
                  placeholder={explanationVideoUrl ? "" : "e.g. https://youtube.com/watch?v=..."}
                  icon={FiPlay}
                  roleColor="teacher"
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Video Length (mm:ss) */}
                  <Input
                    label="Video Length (mm:ss)"
                    type="text"
                    value={videoLength}
                    onChange={(e) => setVideoLength(e.target.value)}
                    placeholder={videoLength ? "" : "e.g. 04:06"}
                    icon={FiClock}
                    roleColor="teacher"
                  />

                  {/* Thumbnail URL */}
                  <Input
                    label="Thumbnail URL (optional)"
                    type="text"
                    value={thumbnailUrl}
                    onChange={(e) => setThumbnailUrl(e.target.value)}
                    placeholder={thumbnailUrl ? "" : "e.g. https://images.unsplash.com/..."}
                    icon={FiImage}
                    roleColor="teacher"
                  />
                </div>

                {/* Upload Card / File Display */}
                {!pdfFile && !pdfUrl ? (
                  <div className="border border-dashed border-gray-800 rounded-3xl p-6 text-center flex flex-col items-center justify-center gap-3 bg-[#0e101a]/30">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shadow-inner shrink-0 text-center">
                      <FiUploadCloud size={22} className="mx-auto" />
                    </div>
                    <div>
                      <span className="font-extrabold text-sm text-white block">Upload Lesson Materials</span>
                      <span className="text-[10px] text-gray-500 font-bold block mt-0.5">PDF format only (Max 25MB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 border border-gray-800 hover:border-gray-700 bg-gray-900/50 hover:bg-gray-900 rounded-xl text-xs font-bold text-gray-400 hover:text-white transition-all cursor-pointer"
                    >
                      Browse Files
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-[#0c0d19] border border-gray-800 rounded-2xl">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0">
                        <FiBookOpen size={18} />
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-sm font-extrabold text-white truncate max-w-[200px] sm:max-w-md">
                          {pdfFile ? pdfFile.name : (pdfUrl.split('/').pop() || 'lesson_material.pdf')}
                        </span>
                        <span className="text-[10px] text-gray-500 font-bold">
                          {pdfFile ? `${(pdfFile.size / (1024 * 1024)).toFixed(2)} MB` : 'Uploaded Document'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {pdfUrl && !pdfFile && (
                        <a
                          href={pdfUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="w-8 h-8 rounded-full bg-blue-500/10 hover:bg-blue-500/20 flex items-center justify-center text-blue-400 transition-all cursor-pointer"
                          title="View Material"
                        >
                          <FiEye size={14} />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="w-8 h-8 rounded-full bg-red-600/10 hover:bg-red-600/20 flex items-center justify-center text-red-400 transition-all cursor-pointer"
                        title="Remove Material"
                      >
                        <FiX size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ACCORDION C: SETTINGS */}
          <div className="flex flex-col">
            <div
              onClick={() => setActiveAccordion(activeAccordion === 'settings' ? '' : 'settings')}
              className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800/80 rounded-2xl cursor-pointer hover:bg-[#121424] transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                  <FiCalendar size={18} />
                </div>
                <span className="text-base font-extrabold text-white">Settings</span>
              </div>
              <FiChevronDown className={`text-gray-500 transition-transform duration-300 ${activeAccordion === 'settings' ? 'rotate-180' : ''}`} />
            </div>

            {activeAccordion === 'settings' && (
              <div className="p-5 bg-[#0e101a]/50 border-x border-b border-gray-800/80 rounded-b-2xl -mt-2.5 flex flex-col gap-4 animate-fade-in text-left">
                {/* Publish Lesson Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                      <FiEye size={18} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-extrabold text-white">Publish Lesson</span>
                      <span className="text-[10px] text-gray-500 font-bold mt-0.5">Make this lesson visible to students</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={isPublished}
                      onChange={() => setIsPublished(!isPublished)}
                    />
                    <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500" />
                  </label>
                </div>

                {/* Require Previous Lesson Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                      <FiLock size={18} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-extrabold text-white">Require Previous Lesson</span>
                      <span className="text-[10px] text-gray-500 font-bold mt-0.5">Students must complete previous lesson first</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={requirePrevious}
                      onChange={() => setRequirePrevious(!requirePrevious)}
                    />
                    <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500" />
                  </label>
                </div>

                {/* Allow Question Retakes Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#0e101a] border border-gray-800 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                      <FiRefreshCw size={18} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-sm font-extrabold text-white">Allow Question Retakes</span>
                      <span className="text-[10px] text-gray-500 font-bold mt-0.5">Students can retry lesson questions</span>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={allowRetakes}
                      onChange={() => setAllowRetakes(!allowRetakes)}
                    />
                    <div className="w-11 h-6 bg-gray-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-300 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500" />
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
            icon={FiPlus}
            className="w-full mt-6 !rounded-2xl text-base"
          >
            {isEditing ? 'Save Changes' : 'Create Lesson'}
          </Button>

        </form>

      </div>
    </DashboardLayout>
  );
};

export default AddLesson;
