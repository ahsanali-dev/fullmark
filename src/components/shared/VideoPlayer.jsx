import React, { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import axios from 'axios';
import { FiPlay, FiRefreshCw, FiAlertCircle, FiFilm } from 'react-icons/fi';
import apiEndpoints from '../../redux/apiEndpoint';
import { getImageUrl } from '../../utils/imageUrl';
import { useLanguage } from '../../context/LanguageContext';

const VideoPlayer = ({
  videoUrl,
  videoReady = true,
  thumbnailUrl = null,
  title = '',
  className = '',
  targetType = 'lesson',
  targetId = null,
  onTimeUpdate = null,
  onEnded = null,
  onLoadedMetadata = null,
  lastPosition = 0,
  autoPlay = false,
  controls = true,
  onRefreshUrl = null
}) => {
  const videoRef = useRef(null);
  const hlsRef = useRef(null);
  const [currentUrl, setCurrentUrl] = useState(videoUrl);
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [playbackError, setPlaybackError] = useState(null);
  const hasRetried403 = useRef(false);
  const initialPositionApplied = useRef(false);
  const { t, isRTL } = useLanguage();
  const onRefreshUrlRef = useRef(onRefreshUrl);
  useEffect(() => {
    onRefreshUrlRef.current = onRefreshUrl;
  }, [onRefreshUrl]);

  const lastPositionRef = useRef(lastPosition);
  useEffect(() => {
    if (!initialPositionApplied.current) {
      lastPositionRef.current = lastPosition;
    }
  }, [lastPosition]);

  const loadedUrlRef = useRef(null);

  // Helper to determine if URL is YouTube
  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url) => {
    let videoId = '';
    if (url.includes('v=')) videoId = url.split('v=')[1]?.split('&')[0];
    else if (url.includes('youtu.be/')) videoId = url.split('youtu.be/')[1]?.split('?')[0];
    return `https://www.youtube.com/embed/${videoId}?autoplay=${autoPlay ? 1 : 0}`;
  };

  // Function to refresh expired 403 token or fetch missing playback URL
  const refreshExpiredToken = useCallback(async () => {
    if (hasRetried403.current || isRefreshingToken) return;
    hasRetried403.current = true;
    setIsRefreshingToken(true);

    try {
      if (onRefreshUrlRef.current) {
        const newUrl = await onRefreshUrlRef.current();
        if (newUrl) {
          setCurrentUrl(newUrl);
          setPlaybackError(null);
          setIsRefreshingToken(false);
          return;
        }
      }

      if (targetId) {
        const token = localStorage.getItem('token');
        const res = await axios.get(apiEndpoints.video.playbackUrl(targetType, targetId), {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        const d = res.data?.data || res.data;
        const freshHls = d?.hlsUrl || d?.videoUrl || d?.playbackUrl || d?.url;
        if (freshHls) {
          setCurrentUrl(freshHls);
          setPlaybackError(null);
          setIsRefreshingToken(false);
          return;
        }
      }
    } catch (err) {
      console.error('Failed to refresh video playback URL:', err);
    }

    setIsRefreshingToken(false);
    setPlaybackError(isRTL ? 'انتهت صلاحية رابط الفيديو. تعذر تجديد الرابط.' : 'Video link expired. Failed to refresh.');
  }, [targetType, targetId, isRefreshingToken, isRTL]);

  // Keep currentUrl in sync if videoUrl prop changes or fetch playback URL if missing
  useEffect(() => {
    if (videoUrl && videoUrl !== currentUrl) {
      setCurrentUrl(videoUrl);
      setPlaybackError(null);
      hasRetried403.current = false;
      initialPositionApplied.current = false;
    } else if (!currentUrl && targetId && videoReady !== false) {
      refreshExpiredToken();
    }
  }, [videoUrl, targetId, videoReady, currentUrl, refreshExpiredToken]);

  // Initialize HLS or native video player
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !currentUrl || isYouTubeUrl(currentUrl) || !videoReady) return;
    if (loadedUrlRef.current === currentUrl) return; // Prevent re-initializing HLS if same URL is already playing!

    loadedUrlRef.current = currentUrl;
    const isHls = currentUrl.includes('.m3u8') || currentUrl.includes('b-cdn.net');

    // Destroy existing HLS instance
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    if (isHls && Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
      });
      hlsRef.current = hls;

      hls.loadSource(getImageUrl(currentUrl));
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setPlaybackError(null);
        if (lastPositionRef.current > 0 && !initialPositionApplied.current) {
          video.currentTime = lastPositionRef.current;
          initialPositionApplied.current = true;
        }
        if (autoPlay) {
          video.play().catch(() => {});
        }
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          if (data.response?.code === 403 || data.details === Hls.ErrorDetails.MANIFEST_LOAD_ERROR) {
            refreshExpiredToken();
          } else {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                hls.startLoad();
                break;
              case Hls.ErrorTypes.MEDIA_ERROR:
                hls.recoverMediaError();
                break;
              default:
                hls.destroy();
                break;
            }
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl') || !isHls) {
      // Native HLS (Safari) or standard MP4
      video.src = getImageUrl(currentUrl);
      if (lastPositionRef.current > 0 && !initialPositionApplied.current) {
        video.currentTime = lastPositionRef.current;
        initialPositionApplied.current = true;
      }
      if (autoPlay) {
        video.play().catch(() => {});
      }
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [currentUrl, videoReady, autoPlay, refreshExpiredToken]);

  // Handle native video element errors (e.g. 403 on standard video tag)
  const handleNativeError = (e) => {
    console.warn('Native video element error:', e);
    refreshExpiredToken();
  };

  // Video processing / encoding or missing state
  if (!videoReady || !currentUrl) {
    return (
      <div className={`aspect-video w-full rounded-3xl bg-[#090b14] border border-gray-800/80 shadow-2xl flex flex-col items-center justify-center p-6 text-center relative overflow-hidden ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/20 via-transparent to-blue-950/20 pointer-events-none" />
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-2xl mb-4 shadow-[0_0_20px_rgba(245,158,11,0.15)] animate-pulse">
          <FiFilm />
        </div>
        <h4 className="text-base font-extrabold text-white mb-1.5">
          {isRTL ? "الفيديو قيد المعالجة" : "Video is Processing"}
        </h4>
        <p className="text-xs font-semibold text-gray-400 max-w-sm leading-relaxed">
          {isRTL 
            ? "يتم الآن تجهيز وضغط الفيديو لجودة عالية. يستغرق ذلك دقيقتين، يرجى إعادة المحاولة قريباً." 
            : "The video is currently encoding for optimal playback. This usually takes 1-3 minutes."}
        </p>
        <div className="mt-4 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-[11px] font-black text-amber-300 flex items-center gap-2">
          <FiRefreshCw className="animate-spin text-xs" />
          <span>{isRTL ? "جاري التجهيز... (videoReady: false)" : "Encoding in progress..."}</span>
        </div>
      </div>
    );
  }

  // Token refreshing state overlay
  if (isRefreshingToken) {
    return (
      <div className={`aspect-video w-full rounded-3xl bg-[#090b14] border border-gray-800 shadow-2xl flex flex-col items-center justify-center p-6 text-center ${className}`}>
        <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin mb-3" />
        <p className="text-sm font-bold text-white">
          {isRTL ? "جاري تحديث رابط المشاهدة..." : "Refreshing video token..."}
        </p>
      </div>
    );
  }

  // YouTube embed player
  if (isYouTubeUrl(currentUrl)) {
    return (
      <div className={`aspect-video w-full rounded-3xl bg-black border border-gray-800 shadow-2xl overflow-hidden relative ${className}`}>
        <iframe
          src={getYouTubeEmbedUrl(currentUrl)}
          title={title || "YouTube Video Player"}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className={`aspect-video w-full rounded-3xl bg-black border border-gray-800 shadow-2xl overflow-hidden relative flex items-center justify-center ${className}`}>
      {playbackError ? (
        <div className="p-6 text-center flex flex-col items-center gap-3">
          <FiAlertCircle className="text-red-400 text-3xl" />
          <p className="text-sm font-bold text-red-300">{playbackError}</p>
          <button
            onClick={() => {
              hasRetried403.current = false;
              refreshExpiredToken();
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black transition-all cursor-pointer"
          >
            {isRTL ? "إعادة التحديث" : "Retry Playback"}
          </button>
        </div>
      ) : (
        <video
          ref={videoRef}
          poster={getImageUrl(thumbnailUrl)}
          controls={controls}
          onError={handleNativeError}
          onTimeUpdate={onTimeUpdate}
          onEnded={onEnded}
          onLoadedMetadata={onLoadedMetadata}
          className="w-full h-full object-contain bg-black"
          playsInline
        />
      )}
    </div>
  );
};

export default VideoPlayer;
