(function () {
    function ready(callback) {
        if (document.readyState !== 'loading') {
            callback();
            return;
        }
        document.addEventListener('DOMContentLoaded', callback);
    }

    function setupMenu() {
        var button = document.querySelector('.nav-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (!button || !panel) {
            return;
        }
        button.addEventListener('click', function () {
            panel.classList.toggle('open');
        });
    }

    function setupShowcase() {
        var slides = Array.prototype.slice.call(document.querySelectorAll('.showcase-slide'));
        var dots = Array.prototype.slice.call(document.querySelectorAll('.slide-dot'));
        if (!slides.length) {
            return;
        }
        var current = 0;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('active', dotIndex === current);
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var target = parseInt(dot.getAttribute('data-target-slide'), 10) || 0;
                show(target);
            });
        });
        window.setInterval(function () {
            show(current + 1);
        }, 5600);
    }

    function getCards() {
        return Array.prototype.slice.call(document.querySelectorAll('.sortable-grid .movie-card, .sortable-grid .rank-item'));
    }

    function cardText(card) {
        return [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-genre') || '',
            card.getAttribute('data-tags') || ''
        ].join(' ').toLowerCase();
    }

    function setupSearch() {
        var input = document.getElementById('searchInput');
        var results = document.getElementById('searchResults');
        var count = document.getElementById('resultCount');
        var empty = document.querySelector('.empty-state');
        if (!input || !results) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = params.get('q') || '';
        input.value = q;
        function apply() {
            var keyword = input.value.trim().toLowerCase();
            var visible = 0;
            getCards().forEach(function (card) {
                var matched = keyword === '' || cardText(card).indexOf(keyword) !== -1;
                card.hidden = !matched;
                if (matched) {
                    visible += 1;
                }
            });
            if (count) {
                count.textContent = visible ? visible + ' 部影片' : '';
            }
            if (empty) {
                empty.hidden = visible !== 0;
            }
        }
        input.addEventListener('input', apply);
        apply();
    }

    function setupSort() {
        var selects = Array.prototype.slice.call(document.querySelectorAll('.sort-select'));
        if (!selects.length) {
            return;
        }
        selects.forEach(function (select) {
            select.addEventListener('change', function () {
                var container = document.querySelector('.sortable-grid');
                if (!container) {
                    return;
                }
                var cards = getCards();
                var value = select.value;
                cards.sort(function (a, b) {
                    if (value === 'title') {
                        return (a.getAttribute('data-title') || '').localeCompare(b.getAttribute('data-title') || '', 'zh-Hans-CN');
                    }
                    if (value === 'year') {
                        return Number(b.getAttribute('data-year') || 0) - Number(a.getAttribute('data-year') || 0);
                    }
                    return Number(b.getAttribute('data-hot') || 0) - Number(a.getAttribute('data-hot') || 0);
                });
                cards.forEach(function (card) {
                    container.appendChild(card);
                });
            });
        });
    }

    ready(function () {
        setupMenu();
        setupShowcase();
        setupSearch();
        setupSort();
    });
})();
