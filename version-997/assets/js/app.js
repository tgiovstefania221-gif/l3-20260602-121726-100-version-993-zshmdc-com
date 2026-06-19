(function () {
  function bySelector(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function initMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!toggle || !panel) {
      return;
    }

    toggle.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function initSearchForms() {
    bySelector('[data-search-form]').forEach(function (form) {
      form.addEventListener('submit', function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"], input[type="search"]');
        var query = input ? input.value.trim() : '';
        var target = form.getAttribute('action') || './search.html';
        window.location.href = target + (query ? '?q=' + encodeURIComponent(query) : '');
      });
    });
  }

  function initHero() {
    var slides = bySelector('[data-hero-slide]');
    var dots = bySelector('[data-hero-dot]');
    if (!slides.length) {
      return;
    }

    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        if (timer) {
          window.clearInterval(timer);
        }
        show(index);
        start();
      });
    });

    start();
  }

  function initLocalFilter() {
    var input = document.querySelector('[data-filter-input]');
    var list = document.querySelector('[data-filter-list]');
    var empty = document.querySelector('[data-empty-state]');
    if (!input || !list) {
      return;
    }

    var cards = bySelector('[data-card]', list);
    input.addEventListener('input', function () {
      var keyword = normalize(input.value);
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize([
          card.dataset.title,
          card.dataset.region,
          card.dataset.type,
          card.dataset.year,
          card.dataset.genre,
          card.textContent
        ].join(' '));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.hidden = !matched;
        if (matched) {
          visible += 1;
        }
      });
      if (empty) {
        empty.hidden = visible !== 0;
      }
    });
  }

  function renderMovieCard(movie) {
    var tags = (movie.tags || []).slice(0, 4).map(function (tag) {
      return '<span>' + escapeHtml(tag) + '</span>';
    }).join('');

    return [
      '<a class="movie-card" href="' + escapeHtml(movie.url) + '">',
      '  <div class="poster-frame">',
      '    <img src="' + escapeHtml(movie.cover) + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
      '    <div class="poster-shade"></div>',
      '    <span class="type-badge">' + escapeHtml(movie.type) + '</span>',
      '    <span class="rating-badge">' + escapeHtml(movie.rating) + '</span>',
      '    <span class="play-float">▶</span>',
      '  </div>',
      '  <div class="movie-card-body">',
      '    <h3>' + escapeHtml(movie.title) + '</h3>',
      '    <p class="movie-meta">' + escapeHtml(movie.year) + ' · ' + escapeHtml(movie.region) + ' · ' + escapeHtml(movie.genre) + '</p>',
      '    <p class="movie-one-line">' + escapeHtml(movie.oneLine) + '</p>',
      '    <div class="tag-row">' + tags + '</div>',
      '  </div>',
      '</a>'
    ].join('');
  }

  function initSearchPage() {
    var results = document.getElementById('searchResults');
    var input = document.getElementById('searchInput');
    var summary = document.querySelector('[data-search-summary]');
    if (!results || !window.MOVIES) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (input) {
      input.value = query;
    }

    function render(value) {
      var keyword = normalize(value);
      if (!keyword) {
        results.innerHTML = '';
        if (summary) {
          summary.textContent = '输入关键词后显示搜索结果。';
        }
        return;
      }

      var matched = window.MOVIES.filter(function (movie) {
        var haystack = normalize([
          movie.title,
          movie.region,
          movie.type,
          movie.year,
          movie.genre,
          movie.category,
          (movie.tags || []).join(' '),
          movie.oneLine
        ].join(' '));
        return haystack.indexOf(keyword) !== -1;
      }).slice(0, 120);

      results.innerHTML = matched.map(renderMovieCard).join('');
      if (summary) {
        summary.textContent = matched.length ? '找到 ' + matched.length + ' 条相关影片。' : '未找到匹配影片。';
      }
    }

    render(query);
  }

  function initPlayers() {
    bySelector('[data-player]').forEach(function (shell) {
      var video = shell.querySelector('video');
      var overlay = shell.querySelector('.player-overlay');
      var status = shell.parentElement ? shell.parentElement.querySelector('[data-player-status]') : null;
      var source = shell.getAttribute('data-src');
      var attached = false;
      var hlsInstance = null;

      function setStatus(text) {
        if (status) {
          status.textContent = text;
        }
      }

      function attachSource() {
        if (!video || !source || attached) {
          return;
        }

        attached = true;
        shell.classList.add('is-ready');
        setStatus('正在加载高清片源...');

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
            video.play().catch(function () {
              setStatus('点击视频继续播放。');
            });
          });
          hlsInstance.on(window.Hls.Events.ERROR, function (eventName, data) {
            if (data && data.fatal) {
              setStatus('播放暂不可用，请稍后重试。');
              if (hlsInstance) {
                hlsInstance.destroy();
              }
            }
          });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = source;
          video.play().catch(function () {
            setStatus('点击视频继续播放。');
          });
        } else {
          setStatus('当前浏览器暂不支持 HLS 播放。');
        }
      }

      function startPlayback() {
        attachSource();
        if (video) {
          video.play().then(function () {
            shell.classList.add('is-playing');
            setStatus('正在播放。');
          }).catch(function () {
            setStatus('点击视频继续播放。');
          });
        }
      }

      if (overlay) {
        overlay.addEventListener('click', function (event) {
          event.preventDefault();
          event.stopPropagation();
          startPlayback();
        });
      }

      shell.addEventListener('click', function () {
        if (!attached) {
          startPlayback();
        }
      });

      if (video) {
        video.addEventListener('play', function () {
          shell.classList.add('is-playing');
          setStatus('正在播放。');
        });
        video.addEventListener('pause', function () {
          setStatus('播放已暂停。');
        });
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initMenu();
    initSearchForms();
    initHero();
    initLocalFilter();
    initSearchPage();
    initPlayers();
  });
})();
