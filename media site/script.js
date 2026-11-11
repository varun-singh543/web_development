// Lumina Media Studio - Interactive Controls

document.addEventListener('DOMContentLoaded', () => {
  /* ========================================================
     1. VIDEO PLAYER CONTROLS
     ======================================================== */
  const video = document.getElementById('mainVideo');
  const playOverlay = document.getElementById('videoOverlay');
  const playPauseBtn = document.getElementById('playPauseBtn');
  const playPauseIcon = document.getElementById('playPauseIcon');
  const progressContainer = document.getElementById('progressContainer');
  const progressBar = document.getElementById('progressBar');
  const currentTimeDisplay = document.getElementById('currentTime');
  const durationDisplay = document.getElementById('duration');
  const muteBtn = document.getElementById('muteBtn');
  const muteIcon = document.getElementById('muteIcon');
  const volumeSlider = document.getElementById('volumeSlider');
  const speedSelect = document.getElementById('speedSelect');
  const pipBtn = document.getElementById('pipBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const videoContainer = document.getElementById('videoContainer');

  function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  }

  function updatePlayIcons(isPlaying) {
    if (isPlaying) {
      playPauseIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
      playOverlay.classList.add('hidden');
    } else {
      playPauseIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
      playOverlay.classList.remove('hidden');
    }
  }

  function togglePlay() {
    if (video.paused || video.ended) {
      video.play().catch(e => console.log('Autoplay prevent:', e));
    } else {
      video.pause();
    }
  }

  if (video) {
    video.addEventListener('play', () => updatePlayIcons(true));
    video.addEventListener('pause', () => updatePlayIcons(false));
    playOverlay.addEventListener('click', togglePlay);
    playPauseBtn.addEventListener('click', togglePlay);

    // Update Progress Bar
    video.addEventListener('timeupdate', () => {
      if (!isNaN(video.duration) && video.duration > 0) {
        const percent = (video.currentTime / video.duration) * 100;
        progressBar.style.width = `${percent}%`;
        currentTimeDisplay.textContent = formatTime(video.currentTime);
      }
    });

    // Loaded metadata
    video.addEventListener('loadedmetadata', () => {
      durationDisplay.textContent = formatTime(video.duration);
    });

    // Click to seek in video
    progressContainer.addEventListener('click', (e) => {
      const rect = progressContainer.getBoundingClientRect();
      const clickPos = (e.clientX - rect.left) / rect.width;
      video.currentTime = clickPos * video.duration;
    });

    // Volume & Mute
    function updateVolume() {
      video.volume = volumeSlider.value;
      video.muted = video.volume === 0;
      updateMuteIcon();
    }

    function updateMuteIcon() {
      if (video.muted || video.volume === 0) {
        muteIcon.innerHTML = `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/>`;
      } else {
        muteIcon.innerHTML = `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>`;
      }
    }

    volumeSlider.addEventListener('input', updateVolume);

    muteBtn.addEventListener('click', () => {
      video.muted = !video.muted;
      if (!video.muted && video.volume === 0) {
        video.volume = 0.5;
        volumeSlider.value = 0.5;
      }
      updateMuteIcon();
    });

    // Playback Speed
    speedSelect.addEventListener('change', () => {
      video.playbackRate = parseFloat(speedSelect.value);
    });

    // Picture in Picture
    if (pipBtn && document.pictureInPictureEnabled) {
      pipBtn.addEventListener('click', async () => {
        try {
          if (video !== document.pictureInPictureElement) {
            await video.requestPictureInPicture();
          } else {
            await document.exitPictureInPicture();
          }
        } catch (error) {
          console.error(error);
        }
      });
    } else if (pipBtn) {
      pipBtn.style.display = 'none';
    }

    // Fullscreen
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        videoContainer.requestFullscreen().catch(err => alert(err.message));
      } else {
        document.exitFullscreen();
      }
    });

    // Auto-hide controls when idle in fullscreen
    let hideTimer;
    videoContainer.addEventListener('mousemove', () => {
      videoContainer.classList.remove('controls-hidden');
      clearTimeout(hideTimer);
      hideTimer = setTimeout(() => {
        if (!video.paused) {
          videoContainer.classList.add('controls-hidden');
        }
      }, 3000);
    });
  }

  /* ========================================================
     2. IMAGE FILTERS & LIGHTBOX
     ======================================================== */
  const showcaseImg = document.getElementById('showcaseImg');
  const filterChips = document.querySelectorAll('.img-filter-chip');
  const lightboxModal = document.getElementById('lightboxModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const openLightboxBtn = document.getElementById('openLightboxBtn');

  // Filter chips click handler
  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const filterClass = chip.getAttribute('data-filter');
      showcaseImg.className = 'showcase-img ' + filterClass;
      if (lightboxImg) {
        lightboxImg.className = filterClass;
      }
    });
  });

  // Lightbox open / close
  function openLightbox() {
    lightboxImg.src = showcaseImg.src;
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (openLightboxBtn) {
    openLightboxBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox();
    });
  }

  if (showcaseImg) {
    showcaseImg.parentElement.addEventListener('click', openLightbox);
  }

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal && lightboxModal.classList.contains('active')) {
      closeLightbox();
    }
  });

  /* ========================================================
     3. AUDIO PLAYER CONTROLS & SOUNDWAVE
     ======================================================== */
  const audio = document.getElementById('mainAudio');
  const audioPlayBtn = document.getElementById('audioPlayBtn');
  const audioPlayIcon = document.getElementById('audioPlayIcon');
  const waveContainer = document.getElementById('soundwaveAnimator');
  const audioTimeline = document.getElementById('audioTimeline');
  const audioTimelineFill = document.getElementById('audioTimelineFill');
  const audioCurrentTime = document.getElementById('audioCurrentTime');
  const audioDuration = document.getElementById('audioDuration');
  const audioDisc = document.getElementById('audioDisc');

  if (audio) {
    audio.addEventListener('loadedmetadata', () => {
      audioDuration.textContent = formatTime(audio.duration);
    });

    audio.addEventListener('timeupdate', () => {
      if (!isNaN(audio.duration) && audio.duration > 0) {
        const percent = (audio.currentTime / audio.duration) * 100;
        audioTimelineFill.style.width = `${percent}%`;
        audioCurrentTime.textContent = formatTime(audio.currentTime);
      }
    });

    function toggleAudio() {
      if (audio.paused) {
        audio.play().then(() => {
          waveContainer.classList.add('wave-playing');
          if (audioDisc) audioDisc.classList.add('disc-spinning');
          audioPlayIcon.innerHTML = `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>`;
        }).catch(err => console.log(err));
      } else {
        audio.pause();
        waveContainer.classList.remove('wave-playing');
        if (audioDisc) audioDisc.classList.remove('disc-spinning');
        audioPlayIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
      }
    }

    if (audioPlayBtn) {
      audioPlayBtn.addEventListener('click', toggleAudio);
    }

    audio.addEventListener('ended', () => {
      waveContainer.classList.remove('wave-playing');
      if (audioDisc) audioDisc.classList.remove('disc-spinning');
      audioPlayIcon.innerHTML = `<path d="M8 5v14l11-7z"/>`;
      audioTimelineFill.style.width = '0%';
    });

    if (audioTimeline) {
      audioTimeline.addEventListener('click', (e) => {
        const rect = audioTimeline.getBoundingClientRect();
        const pos = (e.clientX - rect.left) / rect.width;
        audio.currentTime = pos * audio.duration;
      });
    }
  }

  /* ========================================================
     4. CATEGORY NAVIGATION FILTERING
     ======================================================== */
  const navFilterBtns = document.querySelectorAll('.nav-filters .filter-btn');
  const sections = {
    'all': document.querySelectorAll('.media-section'),
    'video': [document.getElementById('videoSection')],
    'photo': [document.getElementById('photoAudioSection')],
    'stream': [document.getElementById('streamSection')]
  };

  navFilterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      navFilterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterType = btn.getAttribute('data-target');
      if (filterType === 'all') {
        document.querySelectorAll('.media-section').forEach(s => s.style.display = '');
      } else if (filterType === 'video') {
        document.getElementById('videoSection').style.display = '';
        document.getElementById('photoAudioSection').style.display = 'none';
        document.getElementById('streamSection').style.display = 'none';
        document.getElementById('videoSection').scrollIntoView({ behavior: 'smooth' });
      } else if (filterType === 'photo') {
        document.getElementById('videoSection').style.display = 'none';
        document.getElementById('photoAudioSection').style.display = '';
        document.getElementById('streamSection').style.display = 'none';
        document.getElementById('photoAudioSection').scrollIntoView({ behavior: 'smooth' });
      } else if (filterType === 'stream') {
        document.getElementById('videoSection').style.display = 'none';
        document.getElementById('photoAudioSection').style.display = 'none';
        document.getElementById('streamSection').style.display = '';
        document.getElementById('streamSection').scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
});
