(function () {
  'use strict';

  const STREAM_PROFILE = {
    manifest: 'https://otte.cache.aiv-cdn.net/lhr-nitro/live/clients/dash/enc/ap5wz1ofsp/out/v1/7fa6feef143747beaa186ebb6dfb2532/cenc.mpd',
    clearKeys: {
      'c620c93c60c04999eb9ddc28ecfb70a8': 'e76a709c251313190e76cb3c3d3a5824'
    }
  };

  const $ = (id) => document.getElementById(id);

  let player = null;
  let ui = null;
  let video = null;

  function setStatus(text, ok = true) {
    const label = $('stateLabel');
    const dot = $('statusDot');
    const statusText = $('statusText');

    if (label) label.textContent = text;
    if (statusText) statusText.textContent = text;
    if (dot) dot.classList.toggle('error', !ok);
  }

  function showToast(message) {
    const toast = $('toast');
    if (!toast) return;

    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), 1800);
  }

  function hideLoading() {
    const loading = $('loadingCard');
    if (!loading) return;
    loading.classList.add('hide');
    setTimeout(() => loading.style.display = 'none', 280);
  }

  function formatTime(seconds) {
    if (!Number.isFinite(seconds)) return 'LIVE';
    const total = Math.max(0, Math.floor(seconds));
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    if (h > 0) return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function updateClock() {
    const timeLabel = $('timeLabel');
    if (!timeLabel || !video) return;
    timeLabel.textContent = video.duration === Infinity ? 'LIVE' : formatTime(video.currentTime);
  }

  function updateQuality() {
    const qualityLabel = $('qualityLabel');
    if (!qualityLabel || !player) return;

    const tracks = player.getVariantTracks ? player.getVariantTracks() : [];
    const active = tracks.find((track) => track.active);
    qualityLabel.textContent = active && active.height ? `Quality: ${active.height}p` : 'Quality: Auto';
  }

  async function openStream() {
    setStatus('Loading stream...', true);

    player.configure({
      drm: {
        clearKeys: STREAM_PROFILE.clearKeys
      },
      streaming: {
        bufferingGoal: 20,
        rebufferingGoal: 3,
        retryParameters: {
          timeout: 15000,
          maxAttempts: 3,
          baseDelay: 800,
          backoffFactor: 2,
          fuzzFactor: 0.4
        }
      }
    });

    await player.load(STREAM_PROFILE.manifest);
    hideLoading();
    setStatus('Playing', true);
    updateQuality();

    try {
      await video.play();
    } catch (err) {
      setStatus('Tap Play untuk mulai', true);
    }
  }

  async function reloadStream() {
    try {
      setStatus('Reloading...', true);
      if (player) await player.unload();
      const loading = $('loadingCard');
      if (loading) {
        loading.style.display = 'grid';
        loading.classList.remove('hide');
      }
      await openStream();
      showToast('Stream dimuat ulang');
    } catch (err) {
      console.error(err);
      setStatus('Reload gagal', false);
      showToast('Reload gagal');
    }
  }

  function bindNavigation() {
    $('btnPlay')?.addEventListener('click', async () => {
      try {
        await video.play();
        setStatus('Playing', true);
      } catch (err) {
        setStatus('Play gagal', false);
      }
    });

    $('btnPause')?.addEventListener('click', () => {
      video.pause();
      setStatus('Paused', true);
    });

    $('btnMute')?.addEventListener('click', () => {
      video.muted = !video.muted;
      $('btnMute').textContent = video.muted ? 'Unmute' : 'Mute';
      showToast(video.muted ? 'Audio dimatikan' : 'Audio aktif');
    });

    $('btnFullscreen')?.addEventListener('click', async () => {
      const target = $('video-container');
      if (!document.fullscreenElement) await target.requestFullscreen?.();
      else await document.exitFullscreen?.();
    });

    $('btnReload')?.addEventListener('click', reloadStream);

    video.addEventListener('timeupdate', updateClock);
    video.addEventListener('waiting', () => setStatus('Buffering...', true));
    video.addEventListener('playing', () => setStatus('Playing', true));
    video.addEventListener('pause', () => setStatus('Paused', true));
  }

  async function bootOrion() {
    if (!window.shaka) {
      setStatus('Shaka belum termuat', false);
      return;
    }

    shaka.polyfill.installAll();

    if (!shaka.Player.isBrowserSupported()) {
      setStatus('Browser tidak support', false);
      return;
    }

    video = $('video');
    const container = $('video-container');

    player = new shaka.Player(video);
    ui = new shaka.ui.Overlay(player, container, video);

    player.addEventListener('error', (event) => {
      console.error('Shaka error:', event.detail);
      setStatus('Player error', false);
      showToast('Player error, cek console');
    });

    player.addEventListener('trackschanged', updateQuality);
    player.addEventListener('adaptation', updateQuality);

    bindNavigation();

    try {
      await openStream();
    } catch (err) {
      console.error(err);
      setStatus('Gagal membuka stream', false);
      showToast('Gagal membuka stream');
    }
  }

  document.addEventListener('DOMContentLoaded', bootOrion);
})();
