import React, { useState, useRef } from 'react';
import * as tus from 'tus-js-client';
import axios from 'axios';
import {
  FiUploadCloud,
  FiCheckCircle,
  FiXCircle,
  FiTrash2,
  FiFilm,
  FiRefreshCw,
  FiPause,
  FiPlay,
  FiX
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import apiEndpoints from '../../redux/apiEndpoint';
import { useLanguage } from '../../context/LanguageContext';
import VideoPlayer from './VideoPlayer';

export const startBunnyDirectUpload = async ({
  targetType,
  targetId,
  title,
  file,
  onProgress,
  onSuccess,
  onError
}) => {
  try {
    const token = localStorage.getItem('token');
    const ticketRes = await axios.post(
      apiEndpoints.video.uploadTicket,
      {
        targetType,
        targetId,
        title: title || file.name
      },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      }
    );

    const ticket = ticketRes.data?.data;
    if (!ticket || !ticket.endpoint) {
      throw new Error('Invalid upload ticket returned from server');
    }

    const upload = new tus.Upload(file, {
      endpoint: ticket.endpoint,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: {
        AuthorizationSignature: ticket.signature,
        AuthorizationExpire: String(ticket.expires),
        VideoId: ticket.videoId,
        LibraryId: String(ticket.libraryId)
      },
      metadata: {
        filetype: file.type || 'video/mp4',
        title: title || file.name
      },
      onError: (error) => {
        if (onError) onError(error);
      },
      onProgress: (bytesUploaded, bytesTotal) => {
        const percentage = Math.round((bytesUploaded / bytesTotal) * 100);
        if (onProgress) onProgress(percentage, bytesUploaded, bytesTotal);
      },
      onSuccess: () => {
        if (onSuccess) onSuccess(ticket);
      }
    });

    upload.start();
    return upload;
  } catch (err) {
    if (onError) onError(err);
    throw err;
  }
};

const VideoUploader = ({
  targetType = 'lesson',
  targetId = null,
  title = 'Untitled Video',
  currentVideoUrl = null,
  videoPreviewUrl = null,
  videoId = null,
  hasVideo: hasVideoProp = undefined,
  videoReady = true,
  onUploadSuccess = null,
  onDeleteSuccess = null,
  onFileSelect = null,
  selectedFile: externalSelectedFile = null
}) => {
  const { t, isRTL } = useLanguage();
  const fileInputRef = useRef(null);

  const [selectedFile, setSelectedFile] = useState(externalSelectedFile);
  const [isUploading, setIsUploading] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [isEncoding, setIsEncoding] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const tusUploadRef = useRef(null);

  const hasExistingVideo = hasVideoProp !== undefined 
    ? Boolean(hasVideoProp) 
    : Boolean(currentVideoUrl || videoPreviewUrl || videoId);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error(isRTL ? 'يرجى اختيار ملف فيديو صالح' : 'Please select a valid video file');
        return;
      }
      setSelectedFile(file);
      if (onFileSelect) {
        onFileSelect(file);
      }
      if (targetId) {
        startBunnyTusUpload(file);
      }
    }
  };

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null);
    if (onFileSelect) onFileSelect(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const startBunnyTusUpload = async (file) => {
    if (!targetId) return;

    setIsUploading(true);
    setIsPaused(false);
    setUploadProgress(0);
    setUploadStatusText(isRTL ? 'جاري تحضير الرفع...' : 'Preparing video upload...');

    try {
      const upload = await startBunnyDirectUpload({
        targetType,
        targetId,
        title,
        file,
        onProgress: (percentage, bytesUploaded, bytesTotal) => {
          setUploadProgress(percentage);
          setUploadStatusText(
            isRTL
              ? `تم رفع ${percentage}% (${(bytesUploaded / (1024 * 1024)).toFixed(1)} MB من ${(bytesTotal / (1024 * 1024)).toFixed(1)} MB)`
              : `Uploaded ${percentage}% (${(bytesUploaded / (1024 * 1024)).toFixed(1)} MB of ${(bytesTotal / (1024 * 1024)).toFixed(1)} MB)`
          );
        },
        onSuccess: (ticket) => {
          setIsUploading(false);
          setIsEncoding(true);
          setUploadProgress(100);
          setUploadStatusText(
            isRTL
              ? 'اكتمال الرفع! يتم الآن معالجة الفيديو في الخلفية...'
              : 'Upload completed! Video is processing in the background...'
          );
          toast.success(
            isRTL
              ? 'تم رفع الفيديو بنجاح! يتم معالجة الفيديو حالياً.'
              : 'Video uploaded successfully! Video is now processing.'
          );
          if (onUploadSuccess) onUploadSuccess(ticket);
        },
        onError: (error) => {
          console.error('TUS Upload Error:', error);
          setIsUploading(false);
          setUploadStatusText('');
          toast.error(
            (isRTL ? 'فشل رفع الفيديو: ' : 'Video upload failed: ') + (error.message || 'Network error')
          );
        }
      });

      tusUploadRef.current = upload;
    } catch (err) {
      console.error('Failed to initiate video upload ticket:', err);
      setIsUploading(false);
      setUploadStatusText('');
      const msg = err.response?.data?.message || err.message || 'Failed to start video upload';
      toast.error(msg);
    }
  };

  const handlePauseResume = () => {
    if (!tusUploadRef.current) return;
    if (isPaused) {
      tusUploadRef.current.start();
      setIsPaused(false);
    } else {
      tusUploadRef.current.abort();
      setIsPaused(true);
    }
  };

  const handleCancelUpload = () => {
    if (tusUploadRef.current) {
      tusUploadRef.current.abort();
    }
    setIsUploading(false);
    setIsPaused(false);
    setUploadProgress(0);
    setSelectedFile(null);
    if (onFileSelect) onFileSelect(null);
    toast.error(isRTL ? 'تم إلغاء رفع الفيديو' : 'Video upload canceled');
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const confirmDeleteVideo = async () => {
    setShowDeleteModal(false);
    if (!targetId) return;

    setIsDeleting(true);
    const loadingToast = toast.loading(isRTL ? 'جاري حذف الفيديو...' : 'Deleting video...');

    try {
      const token = localStorage.getItem('token');
      await axios.delete(apiEndpoints.video.deleteVideo(targetType, targetId), {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      toast.success(isRTL ? 'تم حذف الفيديو بنجاح!' : 'Video deleted successfully!', { id: loadingToast });
      setIsDeleting(false);
      if (onDeleteSuccess) onDeleteSuccess();
    } catch (err) {
      setIsDeleting(false);
      const msg = err.response?.data?.message || err.message || 'Failed to delete video';
      toast.error(msg, { id: loadingToast });
    }
  };

  return (
    <div className="w-full flex flex-col gap-4 p-5 bg-[#0e101a] border border-gray-800/80 rounded-2xl text-start">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="video/*"
        className="hidden"
      />

      <div className="flex items-center justify-between border-b border-gray-800/50 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
            <FiFilm size={16} />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-white">
              {isRTL ? "رفع الفيديو" : "Video Uploader"}
            </h4>
            <p className="text-[11px] text-gray-400 font-semibold">
              {isRTL ? "رفع مباشر عالي الجودة يدعم الاستئناف التلقائي" : "High-quality direct video upload"}
            </p>
          </div>
        </div>

        {hasExistingVideo && !isUploading && (
          <button
            type="button"
            onClick={handleDeleteClick}
            disabled={isDeleting}
            className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
          >
            <FiTrash2 size={14} />
            <span>{isDeleting ? (isRTL ? 'جاري الحذف...' : 'Deleting...') : (isRTL ? 'حذف الفيديو' : 'Delete Video')}</span>
          </button>
        )}
      </div>

      {/* Existing video preview player & status info */}
      {hasExistingVideo && !isUploading && (
        <div className="flex flex-col gap-3">
          <VideoPlayer
            videoUrl={currentVideoUrl || videoPreviewUrl}
            videoReady={videoReady}
            targetType={targetType}
            targetId={targetId}
            title={title}
            className="w-full rounded-2xl max-h-[360px]"
          />

          <div className="flex items-center justify-between p-3.5 rounded-xl bg-gray-900/60 border border-gray-800 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full shrink-0 ${videoReady ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
              <span className="truncate font-semibold text-gray-300">
                {videoReady 
                  ? (isRTL ? "الفيديو جاهز للمشاهدة" : "Video Ready for Playback")
                  : (isRTL ? "جاري معالجة الفيديو في الخلفية..." : "Processing in Background...")}
              </span>
            </div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-lg bg-blue-600/10 border border-blue-500/30 text-blue-400 font-extrabold hover:bg-blue-600/20 transition-all shrink-0 cursor-pointer"
            >
              {isRTL ? "استبدال الفيديو" : "Replace Video"}
            </button>
          </div>
        </div>
      )}

      {/* Upload active progress section */}
      {isUploading ? (
        <div className="flex flex-col gap-3 p-4 rounded-xl bg-purple-500/10 border border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-purple-300">
              {isPaused ? (isRTL ? 'متوقف مؤقتاً ⏸' : 'Paused ⏸') : (isRTL ? 'جاري الرفع... 🚀' : 'Uploading... 🚀')}
            </span>
            <span className="text-sm font-black text-purple-400">{uploadProgress}%</span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-gray-900 overflow-hidden border border-purple-500/20">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>

          <p className="text-[11px] font-bold text-gray-400">{uploadStatusText}</p>

          <div className="flex items-center gap-2 mt-1">
            <button
              type="button"
              onClick={handlePauseResume}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-750 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer"
            >
              {isPaused ? <FiPlay size={12} /> : <FiPause size={12} />}
              <span>{isPaused ? (isRTL ? 'استئناف' : 'Resume') : (isRTL ? 'إيقاف مؤقت' : 'Pause')}</span>
            </button>

            <button
              type="button"
              onClick={handleCancelUpload}
              className="px-3 py-1.5 rounded-lg bg-red-600/20 text-red-400 font-bold text-xs hover:bg-red-600/30 cursor-pointer"
            >
              {isRTL ? "إلغاء الرفع" : "Cancel Upload"}
            </button>
          </div>
        </div>
      ) : selectedFile && !targetId ? (
        /* Selected file queued for upload upon creation */
        <div className="flex items-center justify-between p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-lg shrink-0">
              <FiFilm />
            </div>
            <div className="min-w-0 text-start">
              <h5 className="text-sm font-extrabold text-white truncate">{selectedFile.name}</h5>
              <p className="text-xs text-purple-300 font-semibold">
                {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • {isRTL ? "جاهز للرفع عند الحفظ" : "Ready to upload upon saving"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleRemoveSelectedFile}
            className="w-8 h-8 rounded-full bg-red-600/20 hover:bg-red-600/40 text-red-400 flex items-center justify-center cursor-pointer transition-all shrink-0"
            title={isRTL ? "إزالة الملف" : "Remove file"}
          >
            <FiX size={16} />
          </button>
        </div>
      ) : !hasExistingVideo ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-8 px-4 rounded-2xl border-2 border-dashed border-gray-800 hover:border-purple-500/50 bg-[#0c0d19]/40 hover:bg-purple-500/5 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all text-center group"
        >
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">
            <FiUploadCloud />
          </div>
          <span className="text-sm font-extrabold text-white">
            {isRTL ? "اختر ملف فيديو للرفع" : "Select video file to upload"}
          </span>
          <span className="text-xs text-gray-500 font-semibold">
            {isRTL ? "يدعم صيغ MP4, MOV, WebM" : "Supports MP4, MOV, WebM video formats"}
          </span>
        </div>
      ) : null}

      {isEncoding && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-bold flex items-center gap-2">
          <FiRefreshCw className="animate-spin" />
          <span>{isRTL ? "الفيديو في مرحلة المعالجة حالياً (يستغرق دقيقة أو دقيقتين)." : "Video is currently processing in the background. Check back shortly."}</span>
        </div>
      )}

      {/* Sleek Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="bg-[#0e101a] border border-gray-800 rounded-3xl p-6 max-w-md w-full flex flex-col items-center text-center gap-5 shadow-2xl relative">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-2xl shrink-0">
              <FiTrash2 />
            </div>

            <div className="flex flex-col gap-1.5">
              <h3 className="text-lg font-black text-white">
                {isRTL ? "تأكيد حذف الفيديو" : "Delete Video Confirmation"}
              </h3>
              <p className="text-xs text-gray-400 font-semibold leading-relaxed">
                {isRTL
                  ? "هل أنت تأكد من رغبتك في حذف هذا الفيديو نهائياً؟ لا يمكن التراجع عن هذا الإجراء."
                  : "Are you sure you want to permanently delete this video? This action cannot be undone."}
              </p>
            </div>

            <div className="flex items-center gap-3 w-full mt-2">
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-gray-800 text-gray-300 font-bold text-xs transition-all cursor-pointer"
              >
                {isRTL ? "إلغاء" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={confirmDeleteVideo}
                disabled={isDeleting}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-extrabold text-xs shadow-lg shadow-red-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (isRTL ? 'جاري الحذف...' : 'Deleting...') : (isRTL ? 'نعم، إحذف الفيديو' : 'Yes, Delete Video')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoUploader;
