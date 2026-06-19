(function () {
  function ready(fn) {
    if (document.readyState !== "loading") {
      fn();
    } else {
      document.addEventListener("DOMContentLoaded", fn);
    }
  }

  function setupMobileMenu() {
    var button = document.querySelector(".mobile-toggle");
    var panel = document.querySelector(".mobile-panel");
    if (!button || !panel) return;
    button.addEventListener("click", function () {
      panel.classList.toggle("open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll(".site-search-form").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = form.querySelector('input[name="q"], input[type="search"]');
        var query = input ? input.value.trim() : "";
        var target = form.getAttribute("data-search-url") || form.getAttribute("action") || "search.html";
        if (query) {
          window.location.href = target + "?q=" + encodeURIComponent(query);
        } else {
          window.location.href = target;
        }
      });
    });
  }

  function setupHero() {
    var slider = document.querySelector(".hero-slider");
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
    var prev = slider.querySelector(".hero-prev");
    var next = slider.querySelector(".hero-next");
    var index = 0;
    var timer = null;

    function show(target) {
      index = (target + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 4800);
    }

    function stop() {
      if (timer) window.clearInterval(timer);
    }

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function (dot, i) {
      dot.addEventListener("click", function () {
        show(i);
        start();
      });
    });

    slider.addEventListener("mouseenter", stop);
    slider.addEventListener("mouseleave", start);
    start();
  }

  function sortCards(cards, mode) {
    var list = cards.slice();
    if (mode === "views") {
      list.sort(function (a, b) {
        return Number(b.dataset.views || 0) - Number(a.dataset.views || 0);
      });
    } else if (mode === "rating") {
      list.sort(function (a, b) {
        return Number(b.dataset.rating || 0) - Number(a.dataset.rating || 0);
      });
    } else if (mode === "year") {
      list.sort(function (a, b) {
        return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
      });
    }
    return list;
  }

  function filterList(container, query, sortMode) {
    var cards = Array.prototype.slice.call(container.querySelectorAll(".movie-card"));
    var text = (query || "").trim().toLowerCase();
    var ordered = sortCards(cards, sortMode || "default");
    ordered.forEach(function (card) {
      container.appendChild(card);
    });
    var visible = 0;
    ordered.forEach(function (card) {
      var hit = !text || (card.dataset.text || "").indexOf(text) !== -1 || (card.dataset.title || "").toLowerCase().indexOf(text) !== -1;
      card.style.display = hit ? "" : "none";
      if (hit) visible += 1;
    });
    var empty = container.parentElement ? container.parentElement.querySelector(".empty-state") : null;
    if (empty) empty.classList.toggle("show", visible === 0);
  }

  function setupLocalFilters() {
    document.querySelectorAll(".search-filter-form").forEach(function (form) {
      var scope = form.closest("main") || document;
      var list = scope.querySelector(".filter-list");
      var input = form.querySelector(".local-filter-input");
      var select = form.querySelector(".local-sort-select");
      if (!list) return;
      var run = function () {
        filterList(list, input ? input.value : "", select ? select.value : "default");
      };
      if (input) input.addEventListener("input", run);
      if (select) select.addEventListener("change", run);
      run();
    });
  }

  function setupSearchPage() {
    var form = document.getElementById("search-page-form");
    var input = document.getElementById("search-page-input");
    var sort = document.getElementById("search-sort");
    var list = document.getElementById("search-result-list");
    if (!form || !input || !list) return;
    var params = new URLSearchParams(window.location.search);
    input.value = params.get("q") || "";
    var run = function () {
      filterList(list, input.value, sort ? sort.value : "match");
    };
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var query = input.value.trim();
      var nextUrl = query ? "search.html?q=" + encodeURIComponent(query) : "search.html";
      window.history.replaceState(null, "", nextUrl);
      run();
    });
    input.addEventListener("input", run);
    if (sort) sort.addEventListener("change", run);
    run();
  }

  function playVideo(video, url, overlay) {
    if (!video || !url) return;
    if (overlay) overlay.classList.add("hidden");
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      if (video.src !== url) video.src = url;
      video.play().catch(function () {});
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      if (!video._hlsReady) {
        var hls = new window.Hls({ lowLatencyMode: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        video._hlsReady = true;
        video._hlsInstance = hls;
      }
      video.play().catch(function () {});
    }
  }

  function setupPlayers() {
    document.querySelectorAll(".player-box").forEach(function (box) {
      var video = box.querySelector("video");
      var overlay = box.querySelector(".player-overlay");
      var url = box.getAttribute("data-hls-url") || "";
      if (overlay) {
        overlay.addEventListener("click", function () {
          playVideo(video, url, overlay);
        });
      }
      if (video) {
        video.addEventListener("click", function () {
          if (video.paused) playVideo(video, url, overlay);
        });
      }
    });
  }

  ready(function () {
    setupMobileMenu();
    setupSearchForms();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
    setupPlayers();
  });
})();
