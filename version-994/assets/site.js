(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobilePanel = document.querySelector('[data-mobile-panel]');

  if (menuButton && mobilePanel) {
    menuButton.addEventListener('click', function () {
      mobilePanel.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dotsWrap = document.querySelector('[data-hero-dots]');
  var activeIndex = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeIndex = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeIndex);
    });

    if (dotsWrap) {
      Array.prototype.slice.call(dotsWrap.children).forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === activeIndex);
      });
    }
  }

  if (slides.length && dotsWrap) {
    slides.forEach(function (_, index) {
      var dot = document.createElement('button');
      dot.className = 'hero-dot' + (index === 0 ? ' active' : '');
      dot.type = 'button';
      dot.setAttribute('aria-label', '切换焦点影片');
      dot.addEventListener('click', function () {
        showSlide(index);
      });
      dotsWrap.appendChild(dot);
    });

    window.setInterval(function () {
      showSlide(activeIndex + 1);
    }, 5600);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));

  if (filterInput && cards.length) {
    var initInput = document.querySelector('[data-query-init]');
    var urlParams = new URLSearchParams(window.location.search);
    var initialQuery = urlParams.get('q') || '';

    if (initInput && initialQuery) {
      filterInput.value = initialQuery;
    }

    function normalize(value) {
      return String(value || '').toLowerCase().trim();
    }

    function applyFilter() {
      var query = normalize(filterInput.value);

      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-region'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.textContent
        ].join(' '));

        card.style.display = haystack.indexOf(query) === -1 ? 'none' : '';
      });
    }

    filterInput.addEventListener('input', applyFilter);
    applyFilter();
  }

  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(function (shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('.play-toggle');

    if (!video) {
      return;
    }

    var stream = video.getAttribute('data-stream');
    var attached = false;

    function attachStream() {
      if (attached || !stream) {
        return;
      }

      attached = true;

      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        video._hlsHandle = hls;
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
      } else {
        video.src = stream;
      }
    }

    function playVideo() {
      attachStream();
      var promise = video.play();
      shell.classList.add('is-playing');

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          shell.classList.remove('is-playing');
        });
      }
    }

    if (button) {
      button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        playVideo();
      } else {
        video.pause();
        shell.classList.remove('is-playing');
      }
    });

    video.addEventListener('play', function () {
      shell.classList.add('is-playing');
    });

    video.addEventListener('pause', function () {
      shell.classList.remove('is-playing');
    });
  });
})();
