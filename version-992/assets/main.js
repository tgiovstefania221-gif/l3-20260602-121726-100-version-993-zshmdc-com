(function() {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileNav = document.querySelector("[data-mobile-nav]");
        if (toggle && mobileNav) {
            toggle.addEventListener("click", function() {
                mobileNav.classList.toggle("is-open");
            });
        }

        document.querySelectorAll("[data-carousel]").forEach(function(carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll(".hero-slide"));
            var dotsWrap = carousel.querySelector("[data-carousel-dots]");
            var prev = carousel.querySelector("[data-carousel-prev]");
            var next = carousel.querySelector("[data-carousel-next]");
            var index = 0;
            var timer = null;

            function paintDots() {
                if (!dotsWrap) {
                    return;
                }
                dotsWrap.innerHTML = "";
                slides.forEach(function(_, dotIndex) {
                    var button = document.createElement("button");
                    button.type = "button";
                    button.setAttribute("aria-label", "切换到第" + (dotIndex + 1) + "张");
                    if (dotIndex === index) {
                        button.classList.add("is-active");
                    }
                    button.addEventListener("click", function() {
                        show(dotIndex);
                        restart();
                    });
                    dotsWrap.appendChild(button);
                });
            }

            function show(nextIndex) {
                if (!slides.length) {
                    return;
                }
                index = (nextIndex + slides.length) % slides.length;
                slides.forEach(function(slide, slideIndex) {
                    slide.classList.toggle("is-active", slideIndex === index);
                });
                paintDots();
            }

            function restart() {
                if (timer) {
                    window.clearInterval(timer);
                }
                timer = window.setInterval(function() {
                    show(index + 1);
                }, 5200);
            }

            if (prev) {
                prev.addEventListener("click", function() {
                    show(index - 1);
                    restart();
                });
            }

            if (next) {
                next.addEventListener("click", function() {
                    show(index + 1);
                    restart();
                });
            }

            show(0);
            restart();
        });

        document.querySelectorAll("[data-filter-panel]").forEach(function(panel) {
            var keyword = panel.querySelector("[data-filter-keyword]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            var region = panel.querySelector("[data-filter-region]");
            var reset = panel.querySelector("[data-filter-reset]");
            var scope = panel.parentElement;
            var cards = Array.prototype.slice.call(scope.querySelectorAll(".catalog-card"));
            var empty = scope.querySelector("[data-filter-empty]");
            var params = new URLSearchParams(window.location.search);

            if (keyword && params.get("q")) {
                keyword.value = params.get("q");
            }

            function match(card) {
                var text = [
                    card.getAttribute("data-name") || "",
                    card.getAttribute("data-region") || "",
                    card.getAttribute("data-type") || "",
                    card.getAttribute("data-genre") || ""
                ].join(" ").toLowerCase();
                var kw = keyword ? keyword.value.trim().toLowerCase() : "";
                var selectedYear = year ? year.value : "";
                var selectedType = type ? type.value : "";
                var selectedRegion = region ? region.value : "";
                if (kw && text.indexOf(kw) === -1) {
                    return false;
                }
                if (selectedYear && card.getAttribute("data-year") !== selectedYear) {
                    return false;
                }
                if (selectedType && card.getAttribute("data-type") !== selectedType) {
                    return false;
                }
                if (selectedRegion && card.getAttribute("data-region") !== selectedRegion) {
                    return false;
                }
                return true;
            }

            function apply() {
                var visible = 0;
                cards.forEach(function(card) {
                    var ok = match(card);
                    card.style.display = ok ? "" : "none";
                    if (ok) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle("is-visible", visible === 0);
                }
            }

            [keyword, year, type, region].forEach(function(input) {
                if (input) {
                    input.addEventListener("input", apply);
                    input.addEventListener("change", apply);
                }
            });

            if (reset) {
                reset.addEventListener("click", function() {
                    if (keyword) {
                        keyword.value = "";
                    }
                    if (year) {
                        year.value = "";
                    }
                    if (type) {
                        type.value = "";
                    }
                    if (region) {
                        region.value = "";
                    }
                    apply();
                });
            }

            apply();
        });
    });
})();
