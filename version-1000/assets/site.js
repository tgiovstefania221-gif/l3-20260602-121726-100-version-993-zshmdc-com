const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function initMobileMenu() {
    const button = $('[data-menu-button]');
    const nav = $('[data-main-nav]');
    if (!button || !nav) return;

    button.addEventListener('click', () => {
        nav.classList.toggle('is-open');
    });
}

function initHeroCarousel() {
    const slides = $$('.hero-slide');
    const dots = $$('.hero-dot');
    if (slides.length <= 1) return;

    let index = 0;
    const show = (next) => {
        index = next % slides.length;
        slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
        dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));
    };

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => show(i));
    });

    window.setInterval(() => show(index + 1), 5200);
}

function initFilters() {
    const panels = $$('[data-filter-panel]');
    panels.forEach((panel) => {
        const scopeSelector = panel.getAttribute('data-filter-panel');
        const scope = scopeSelector ? $(scopeSelector) : document;
        if (!scope) return;

        const input = $('[data-filter-keyword]', panel);
        const yearSelect = $('[data-filter-year]', panel);
        const genreSelect = $('[data-filter-genre]', panel);
        const countEl = $('[data-filter-count]');
        const cards = $$('.movie-card', scope);

        const apply = () => {
            const keyword = (input?.value || '').trim().toLowerCase();
            const year = yearSelect?.value || '';
            const genre = genreSelect?.value || '';
            let visible = 0;

            cards.forEach((card) => {
                const title = (card.dataset.title || '').toLowerCase();
                const genres = (card.dataset.genre || '').toLowerCase();
                const tags = (card.dataset.tags || '').toLowerCase();
                const region = (card.dataset.region || '').toLowerCase();
                const cardYear = card.dataset.year || '';
                const textMatch = !keyword || title.includes(keyword) || genres.includes(keyword) || tags.includes(keyword) || region.includes(keyword);
                const yearMatch = !year || cardYear === year;
                const genreMatch = !genre || genres.includes(genre.toLowerCase()) || tags.includes(genre.toLowerCase());
                const ok = textMatch && yearMatch && genreMatch;
                card.classList.toggle('is-hidden', !ok);
                if (ok) visible += 1;
            });

            if (countEl) {
                countEl.textContent = `当前显示 ${visible} 部影片`;
            }
        };

        [input, yearSelect, genreSelect].filter(Boolean).forEach((el) => {
            el.addEventListener('input', apply);
            el.addEventListener('change', apply);
        });

        apply();
    });
}

async function attachHls(video, sourceUrl) {
    if (!sourceUrl) {
        throw new Error('当前影片暂无可用播放地址');
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = sourceUrl;
        return;
    }

    const module = await import('./hls-vendor.js');
    const Hls = module.H || module.default || window.Hls;
    if (!Hls || !Hls.isSupported()) {
        throw new Error('当前浏览器不支持 HLS 播放');
    }

    const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
    });
    hls.loadSource(sourceUrl);
    hls.attachMedia(video);
}

function initPlayers() {
    const panels = $$('[data-player-panel]');
    panels.forEach((panel) => {
        const video = $('video[data-player]', panel);
        const button = $('[data-play-button]', panel);
        const message = $('[data-player-message]', panel);
        if (!video || !button) return;

        let attached = false;
        button.addEventListener('click', async () => {
            try {
                if (!attached) {
                    await attachHls(video, video.dataset.src || '');
                    attached = true;
                }
                panel.classList.add('is-playing');
                await video.play();
                if (message) {
                    message.textContent = '正在播放：支持拖动进度与全屏观看。';
                }
            } catch (error) {
                panel.classList.remove('is-playing');
                if (message) {
                    message.textContent = error.message || '播放初始化失败，请更换浏览器或稍后重试。';
                }
            }
        });
    });
}

function initHeroSearch() {
    const form = $('[data-hero-search]');
    if (!form) return;

    form.addEventListener('submit', (event) => {
        event.preventDefault();
        const input = $('input', form);
        const query = encodeURIComponent((input?.value || '').trim());
        window.location.href = query ? `search.html?q=${query}` : 'search.html';
    });
}

function hydrateSearchFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('q');
    const input = $('[data-filter-keyword]');
    if (q && input) {
        input.value = q;
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
}

document.addEventListener('DOMContentLoaded', () => {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initPlayers();
    initHeroSearch();
    hydrateSearchFromUrl();
});
