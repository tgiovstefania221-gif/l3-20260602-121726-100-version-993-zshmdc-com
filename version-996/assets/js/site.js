(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var navLinks = document.querySelector('[data-nav-links]');

  if (menuButton && navLinks) {
    menuButton.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var current = 0;

    var showSlide = function (index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    };

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
      });
    });

    if (slides.length > 1) {
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-search-form]')).forEach(function (form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var input = form.querySelector('input[name="q"]');
      var query = input ? input.value.trim() : '';
      var target = form.getAttribute('data-search-target') || './movies.html';
      if (query) {
        window.location.href = target + '?q=' + encodeURIComponent(query);
      } else {
        window.location.href = target;
      }
    });
  });

  var localInput = document.querySelector('[data-local-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter]'));
  var activeFilter = 'all';

  var params = new URLSearchParams(window.location.search);
  if (localInput && params.get('q')) {
    localInput.value = params.get('q');
  }

  var applyFilter = function () {
    var keyword = localInput ? localInput.value.trim().toLowerCase() : '';
    cards.forEach(function (card) {
      var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '') + ' ' + card.textContent).toLowerCase();
      var matchesText = !keyword || text.indexOf(keyword) !== -1;
      var matchesFilter = activeFilter === 'all' || text.indexOf(activeFilter.toLowerCase()) !== -1;
      card.classList.toggle('is-hidden', !(matchesText && matchesFilter));
    });
  };

  if (localInput) {
    localInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeFilter = button.getAttribute('data-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyFilter();
    });
  });

  var hlsPromise = null;
  var loadHls = function () {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }
    if (!hlsPromise) {
      hlsPromise = new Promise(function (resolve, reject) {
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.5/dist/hls.min.js';
        script.async = true;
        script.onload = function () {
          resolve(window.Hls);
        };
        script.onerror = reject;
        document.head.appendChild(script);
      });
    }
    return hlsPromise;
  };

  var startPlayer = function (shell) {
    if (!shell || shell.classList.contains('is-playing')) {
      return;
    }

    var video = shell.querySelector('video');
    var source = shell.getAttribute('data-video');
    if (!video || !source) {
      return;
    }

    var playVideo = function () {
      shell.classList.add('is-playing');
      var playAttempt = video.play();
      if (playAttempt && typeof playAttempt.catch === 'function') {
        playAttempt.catch(function () {});
      }
    };

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      playVideo();
      return;
    }

    loadHls().then(function (Hls) {
      if (Hls && Hls.isSupported()) {
        var hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, playVideo);
      } else {
        video.src = source;
        playVideo();
      }
    }).catch(function () {
      video.src = source;
      playVideo();
    });
  };

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
    shell.addEventListener('click', function (event) {
      if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'video') {
        return;
      }
      startPlayer(shell);
    });
    var button = shell.querySelector('[data-play-button]');
    if (button) {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        startPlayer(shell);
      });
    }
  });
})();
