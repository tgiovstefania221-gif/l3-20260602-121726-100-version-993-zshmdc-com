document.addEventListener("DOMContentLoaded", () => {
  setupMenu();
  setupHero();
  setupFilters();
  applySearchQuery();
});

function setupMenu() {
  const button = document.querySelector("[data-menu-button]");
  const menu = document.querySelector("[data-mobile-nav]");

  if (!button || !menu) {
    return;
  }

  button.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

function setupHero() {
  const hero = document.querySelector("[data-hero]");

  if (!hero) {
    return;
  }

  const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
  const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
  const prev = hero.querySelector("[data-hero-prev]");
  const next = hero.querySelector("[data-hero-next]");
  let activeIndex = 0;
  let timer = null;

  const activate = (index) => {
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("active", slideIndex === activeIndex);
    });

    dots.forEach((dot, dotIndex) => {
      dot.classList.toggle("active", dotIndex === activeIndex);
    });
  };

  const start = () => {
    stop();
    timer = window.setInterval(() => activate(activeIndex + 1), 5200);
  };

  const stop = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
  };

  prev?.addEventListener("click", () => {
    activate(activeIndex - 1);
    start();
  });

  next?.addEventListener("click", () => {
    activate(activeIndex + 1);
    start();
  });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      activate(index);
      start();
    });
  });

  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  activate(0);
  start();
}

function setupFilters() {
  const input = document.querySelector("[data-filter-input]");
  const selects = Array.from(document.querySelectorAll("[data-filter-select]"));
  const cards = Array.from(document.querySelectorAll("[data-card]"));

  if (!input && selects.length === 0) {
    return;
  }

  const filter = () => {
    const keyword = (input?.value || "").trim().toLowerCase();
    const filters = new Map(selects.map((select) => [select.dataset.filterSelect, select.value]));

    cards.forEach((card) => {
      const text = [card.dataset.title, card.dataset.region, card.dataset.genre, card.dataset.keywords]
        .join(" ")
        .toLowerCase();
      const matchesKeyword = !keyword || text.includes(keyword);
      const matchesType = !filters.get("type") || card.dataset.type === filters.get("type");
      const matchesYear = !filters.get("year") || card.dataset.year === filters.get("year");

      card.hidden = !(matchesKeyword && matchesType && matchesYear);
    });
  };

  input?.addEventListener("input", filter);
  selects.forEach((select) => select.addEventListener("change", filter));
  filter();
}

function applySearchQuery() {
  const input = document.querySelector("[data-filter-input]");

  if (!input) {
    return;
  }

  const query = new URLSearchParams(window.location.search).get("q");

  if (query) {
    input.value = query;
    input.dispatchEvent(new Event("input"));
  }
}
