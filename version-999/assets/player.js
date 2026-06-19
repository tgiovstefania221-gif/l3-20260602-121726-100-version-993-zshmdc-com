(function () {
  var video = document.getElementById('moviePlayer');
  var coverButton = document.getElementById('playCover');
  var source = typeof pagePlayerSource === 'string' ? pagePlayerSource : '';
  var hlsInstance = null;
  var ready = false;

  function preparePlayer() {
    if (!video || !source || ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function hideCover() {
    if (coverButton) {
      coverButton.classList.add('is-hidden');
    }
  }

  function startPlayer() {
    preparePlayer();
    hideCover();

    if (video) {
      var attempt = video.play();
      if (attempt && typeof attempt.catch === 'function') {
        attempt.catch(function () {});
      }
    }
  }

  if (coverButton) {
    coverButton.addEventListener('click', startPlayer);
  }

  if (video) {
    video.addEventListener('play', hideCover);
    video.addEventListener('loadedmetadata', hideCover);
    video.addEventListener('click', function () {
      if (!ready) {
        startPlayer();
      }
    });
    preparePlayer();
  }

  window.addEventListener('beforeunload', function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
