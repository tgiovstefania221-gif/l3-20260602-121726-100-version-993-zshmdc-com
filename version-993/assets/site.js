const menuToggle = document.querySelector('[data-menu-toggle]');
const navMenu = document.querySelector('[data-nav-menu]');

if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
        navMenu.classList.toggle('open');
    });
}

const slides = Array.from(document.querySelectorAll('[data-hero-slide]'));
const dots = Array.from(document.querySelectorAll('[data-hero-dot]'));
let currentSlide = 0;
let heroTimer = null;

function showSlide(index) {
    if (!slides.length) {
        return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach((slide, itemIndex) => {
        slide.classList.toggle('active', itemIndex === currentSlide);
    });

    dots.forEach((dot, itemIndex) => {
        dot.classList.toggle('active', itemIndex === currentSlide);
    });
}

function startHeroTimer() {
    if (heroTimer || slides.length < 2) {
        return;
    }

    heroTimer = window.setInterval(() => {
        showSlide(currentSlide + 1);
    }, 5200);
}

dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        showSlide(index);
        window.clearInterval(heroTimer);
        heroTimer = null;
        startHeroTimer();
    });
});

showSlide(0);
startHeroTimer();

const filterInput = document.querySelector('[data-filter-input]');
const cards = Array.from(document.querySelectorAll('.js-movie-card'));
const resultCount = document.querySelector('[data-result-count]');
const noResults = document.querySelector('[data-no-results]');

function applyFilter(value) {
    const keyword = value.trim().toLowerCase();
    let visible = 0;

    cards.forEach((card) => {
        const haystack = [
            card.dataset.title || '',
            card.dataset.year || '',
            card.dataset.genre || '',
            card.dataset.tags || ''
        ].join(' ').toLowerCase();
        const matched = !keyword || haystack.includes(keyword);

        card.style.display = matched ? '' : 'none';

        if (matched) {
            visible += 1;
        }
    });

    if (resultCount) {
        resultCount.textContent = `${visible} 部影片`;
    }

    if (noResults) {
        noResults.classList.toggle('active', visible === 0);
    }
}

if (filterInput) {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q') || '';

    if (query) {
        filterInput.value = query;
    }

    filterInput.addEventListener('input', () => {
        applyFilter(filterInput.value);
    });

    applyFilter(filterInput.value);
}
