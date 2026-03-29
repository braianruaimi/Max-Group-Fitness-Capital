const arsFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
});

const integerFormatter = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0
});

const MINIMUM_INVESTMENT = 2500000;
const FIXED_INCOME_QUARTERLY_RATE = 0.075;

const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

function parseAmountValue(rawValue) {
    const digits = String(rawValue ?? "").replace(/\D/g, "");
    return Number(digits || 0);
}

function normalizeInvestmentAmount(rawValue) {
    const amount = parseAmountValue(rawValue);
    return Math.max(amount || 0, MINIMUM_INVESTMENT);
}

function formatAmount(rawValue) {
    const amount = parseAmountValue(rawValue);
    return amount > 0 ? `ARS ${integerFormatter.format(amount)}` : "ARS ";
}

function animateCounterElement(element, duration = 1400) {
    const targetValue = Number(element.dataset.counter);
    const prefix = element.dataset.prefix || "";
    const suffix = element.dataset.suffix || "";

    animateValue(element, targetValue, { prefix, suffix, decimals: 0, duration });
}

function animateValue(element, targetValue, options = {}) {
    const {
        prefix = "",
        suffix = "",
        decimals = 0,
        duration = 1200,
        formatter = null
    } = options;

    const startValue = Number(element.dataset.currentValue || 0);
    const startTime = performance.now();

    function updateValue(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutCubic(progress);
        const currentValue = startValue + (targetValue - startValue) * eased;

        element.textContent = formatter
            ? formatter(currentValue)
            : `${prefix}${currentValue.toFixed(decimals)}${suffix}`;

        if (progress < 1) {
            requestAnimationFrame(updateValue);
            return;
        }

        const finalValue = formatter ? formatter(targetValue) : `${prefix}${targetValue.toFixed(decimals)}${suffix}`;
        element.textContent = finalValue;
        element.dataset.currentValue = String(targetValue);
    }

    requestAnimationFrame(updateValue);
}

function initializeRevealAnimations() {
    const revealElements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            const delay = entry.target.dataset.delay || 0;
            entry.target.style.setProperty("--reveal-delay", `${delay}ms`);
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.2
    });

    revealElements.forEach((element) => observer.observe(element));
}

function initializeSectionTransitions() {
    const sections = document.querySelectorAll("main .section");

    if (!sections.length) {
        return;
    }

    const sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            entry.target.classList.toggle("is-active", entry.isIntersecting && entry.intersectionRatio > 0.35);
        });
    }, {
        threshold: [0.2, 0.35, 0.55]
    });

    sections.forEach((section) => sectionObserver.observe(section));
}

function initializeHeroCinematic() {
    const heroSection = document.querySelector(".hero");

    if (!heroSection) {
        return;
    }

    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            heroSection.classList.add("is-live");
            heroObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.45
    });

    heroObserver.observe(heroSection);
}

function initializeCounters() {
    const counterElements = document.querySelectorAll("[data-counter]");
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            const element = entry.target;
            if (element.closest(".dashboard-counters")) {
                counterObserver.unobserve(element);
                return;
            }

            animateCounterElement(element, 1400);
            counterObserver.unobserve(element);
        });
    }, {
        threshold: 0.5
    });

    counterElements.forEach((element) => counterObserver.observe(element));
}

function initializeCharts() {
    const growthCanvas = document.getElementById("growthChart");
    const valuationCanvas = document.getElementById("valuationChart");
    const dashboardSection = document.getElementById("dashboard");
    const growthCard = document.querySelector(".dashboard-chart");
    const dashboardSide = document.querySelector(".dashboard-side");
    const capacityBarFill = document.getElementById("capacityBarFill");
    const dashboardCounters = dashboardSection?.querySelectorAll(".dashboard-counters [data-counter]") || [];

    if (!dashboardSection || !growthCanvas) {
        return;
    }

    if (typeof Chart === "undefined") {
        dashboardSection.classList.add("is-live");
        dashboardCounters.forEach((counterElement, index) => {
            window.setTimeout(() => {
                animateCounterElement(counterElement, 1200);
            }, 140 + index * 120);
        });
        return;
    }

    let chartsInitialized = false;
    let valuationInitialized = false;

    function createCharts() {
        if (chartsInitialized) {
            return;
        }

        chartsInitialized = true;
        Chart.defaults.color = "#b8c4ea";
        Chart.defaults.font.family = "Inter";
        Chart.defaults.borderColor = "rgba(255, 255, 255, 0.08)";

        const growthContext = growthCanvas.getContext("2d");
        if (growthCard) {
            growthCard.classList.add("charts-live");
        }

        if (dashboardSide) {
            dashboardSide.classList.add("charts-live");
        }

        if (capacityBarFill) {
            window.setTimeout(() => {
                capacityBarFill.style.width = "85%";
            }, 260);
        }

        window.setTimeout(() => {
            dashboardSection.classList.add("is-live");
            dashboardCounters.forEach((counterElement, index) => {
                window.setTimeout(() => {
                    animateCounterElement(counterElement, 1250);
                }, index * 120);
            });
        }, 300);

        new Chart(growthContext, {
            type: "line",
            data: {
                labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
                datasets: [
                    {
                        label: "Ateneo Gym",
                        data: [18, 22, 27, 32, 38, 43, 49, 54, 60, 66, 72, 79],
                        borderColor: "#00d4ff",
                        backgroundColor: "rgba(0, 212, 255, 0.12)",
                        fill: false,
                        borderWidth: 3,
                        tension: 0.34,
                        pointRadius: 0,
                        pointHoverRadius: 5
                    },
                    {
                        label: "Mujeres Gym",
                        data: [14, 18, 21, 26, 30, 35, 39, 43, 48, 52, 57, 63],
                        borderColor: "#8a2be2",
                        backgroundColor: "rgba(138, 43, 226, 0.12)",
                        fill: false,
                        borderWidth: 3,
                        tension: 0.34,
                        pointRadius: 0,
                        pointHoverRadius: 5
                    },
                    {
                        label: "Nueva Sede",
                        data: [10, 14, 18, 23, 29, 36, 42, 49, 56, 64, 73, 83],
                        borderColor: "#79ecff",
                        backgroundColor: "rgba(121, 236, 255, 0.12)",
                        fill: false,
                        borderWidth: 3,
                        tension: 0.34,
                        pointRadius: 0,
                        pointHoverRadius: 5
                    },
                    {
                        label: "Suplementos",
                        data: [12, 15, 19, 24, 28, 33, 37, 42, 46, 51, 56, 61],
                        borderColor: "#d7b8ff",
                        backgroundColor: "rgba(215, 184, 255, 0.12)",
                        fill: false,
                        borderWidth: 3,
                        tension: 0.34,
                        pointRadius: 0,
                        pointHoverRadius: 5
                    }
                ]
            },
            options: {
                maintainAspectRatio: false,
                animation: {
                    duration: 1800,
                    easing: "easeOutQuart"
                },
                plugins: {
                    legend: {
                        display: true,
                        position: "bottom",
                        labels: {
                            color: "#d5deff",
                            usePointStyle: true,
                            pointStyle: "circle",
                            padding: 18
                        }
                    },
                    tooltip: {
                        backgroundColor: "rgba(4, 8, 19, 0.94)",
                        borderColor: "rgba(16, 213, 255, 0.32)",
                        borderWidth: 1,
                        titleColor: "#ffffff",
                        bodyColor: "#d5deff",
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        grid: {
                            color: "rgba(255, 255, 255, 0.06)"
                        },
                        ticks: {
                            callback(value) {
                                return `${value}%`;
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    const chartObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            createCharts();
            chartObserver.unobserve(entry.target);
        });
    }, {
        threshold: 0.35
    });

    chartObserver.observe(dashboardSection);

    if (valuationCanvas) {
        const valuationSection = valuationCanvas.closest(".valuation-section");

        function createValuationChart() {
            if (valuationInitialized || typeof Chart === "undefined") {
                return;
            }

            valuationInitialized = true;
            const context = valuationCanvas.getContext("2d");
            const gradient = context.createLinearGradient(0, 0, 0, 320);
            gradient.addColorStop(0, "rgba(94, 242, 255, 0.28)");
            gradient.addColorStop(0.55, "rgba(13, 226, 176, 0.16)");
            gradient.addColorStop(1, "rgba(13, 226, 176, 0.02)");

            new Chart(context, {
                type: "line",
                data: {
                    labels: ["T1", "T2", "T3", "T4", "T5", "T6", "T7", "T8", "T9"],
                    datasets: [{
                        label: "Valuacion consolidada",
                        data: [230000, 248000, 239000, 268000, 287000, 276000, 309000, 332000, 350000],
                        borderColor: "#5ef2ff",
                        backgroundColor: gradient,
                        fill: true,
                        tension: 0.36,
                        borderWidth: 3,
                        pointRadius: 0,
                        pointHoverRadius: 5,
                        pointHoverBackgroundColor: "#c4fff3"
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    animation: {
                        duration: 1600,
                        easing: "easeOutQuart"
                    },
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            backgroundColor: "rgba(4, 12, 20, 0.96)",
                            borderColor: "rgba(94, 242, 255, 0.24)",
                            borderWidth: 1,
                            displayColors: false,
                            callbacks: {
                                label(context) {
                                    return `USD ${integerFormatter.format(context.parsed.y)}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            }
                        },
                        y: {
                            grid: {
                                color: "rgba(255, 255, 255, 0.05)"
                            },
                            ticks: {
                                callback(value) {
                                    return `USD ${integerFormatter.format(value)}`;
                                }
                            }
                        }
                    }
                }
            });
        }

        if (valuationSection) {
            const valuationObserver = new IntersectionObserver((entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    createValuationChart();
                    valuationObserver.unobserve(entry.target);
                });
            }, {
                threshold: 0.3
            });

            valuationObserver.observe(valuationSection);
        }
    }
}

function initializeBackgroundParallax() {
    const backgroundLayers = document.querySelectorAll("[data-bg-speed]");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (!backgroundLayers.length || prefersReducedMotion) {
        return;
    }

    let pointerX = 0;
    let pointerY = 0;
    let scrollDepth = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let frameId = null;

    function updateTargets() {
        targetX = pointerX;
        targetY = pointerY + scrollDepth;
    }

    function renderBackgroundParallax() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        backgroundLayers.forEach((layer) => {
            const speed = Number(layer.dataset.bgSpeed || 0);
            layer.style.setProperty("--bg-shift-x", `${(currentX * speed).toFixed(2)}px`);
            layer.style.setProperty("--bg-shift-y", `${(currentY * speed * 0.75).toFixed(2)}px`);
        });

        if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
            frameId = requestAnimationFrame(renderBackgroundParallax);
            return;
        }

        frameId = null;
    }

    function requestBackgroundFrame() {
        if (frameId !== null) {
            return;
        }

        frameId = requestAnimationFrame(renderBackgroundParallax);
    }

    function handleScroll() {
        const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
        const progress = window.scrollY / maxScroll;
        scrollDepth = (progress - 0.5) * 30;
        updateTargets();
        requestBackgroundFrame();
    }

    if (hasFinePointer) {
        window.addEventListener("pointermove", (event) => {
            const offsetX = event.clientX / window.innerWidth - 0.5;
            const offsetY = event.clientY / window.innerHeight - 0.5;

            pointerX = offsetX * 34;
            pointerY = offsetY * 26;
            updateTargets();
            requestBackgroundFrame();
        });

        window.addEventListener("pointerleave", () => {
            pointerX = 0;
            pointerY = 0;
            updateTargets();
            requestBackgroundFrame();
        });
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
}

function initializeCursorGlow() {
    const cursorGlow = document.querySelector(".cursor-glow");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (!cursorGlow || prefersReducedMotion || !hasFinePointer) {
        return;
    }

    document.body.classList.add("has-cursor-glow");

    const interactiveSelector = "a, button, input, select, textarea, .tilt-card, .button, .card-chip, .faq-question";

    window.addEventListener("pointermove", (event) => {
        cursorGlow.classList.add("is-visible");
        cursorGlow.style.transform = `translate3d(${event.clientX}px, ${event.clientY}px, 0) translate3d(-50%, -50%, 0)`;
    });

    document.addEventListener("pointerover", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        cursorGlow.classList.toggle("is-active", Boolean(target.closest(interactiveSelector)));
    });

    document.addEventListener("pointerleave", () => {
        cursorGlow.classList.remove("is-visible", "is-active");
    });
}

function initializeDashboardLiveFeed() {
    const dashboardSection = document.getElementById("dashboard");
    const stream = document.getElementById("terminalStream");
    const statusChip = document.getElementById("dashboardStatusChip");
    const terminalMode = document.getElementById("terminalMode");
    const counterBlocks = dashboardSection?.querySelectorAll(".counter-block") || [];

    if (!dashboardSection || !stream || !statusChip || !terminalMode || !counterBlocks.length) {
        return;
    }

    const chipStates = ["12 meses", "capital live", "tracking", "sync online"];
    const modeStates = ["syncing", "live", "verified", "active"];
    const feedEntries = [
        ["updating occupancy capture", "84%"],
        ["routing capital to expansion", "queued"],
        ["refreshing unit contribution", "stable"],
        ["monitoring monthly yield", "+4.0%"],
        ["checking supplements velocity", "rising"],
        ["validating holding threshold", "90 dias"],
        ["recomputing blended growth", "+31%"],
        ["syncing investor dashboard", "online"]
    ];

    let intervalId = null;
    let entryIndex = 0;
    let statusIndex = 0;

    function pushFeedLine() {
        const [label, value] = feedEntries[entryIndex % feedEntries.length];
        const line = document.createElement("div");
        line.className = "terminal-line is-fresh";
        line.innerHTML = `<span>${label}</span><strong>${value}</strong>`;

        stream.prepend(line);

        while (stream.children.length > 4) {
            stream.removeChild(stream.lastElementChild);
        }

        window.setTimeout(() => {
            line.classList.remove("is-fresh");
        }, 260);

        statusIndex += 1;
        statusChip.textContent = chipStates[statusIndex % chipStates.length];
        terminalMode.textContent = modeStates[statusIndex % modeStates.length];
        statusChip.classList.add("is-live");

        const activeBlock = counterBlocks[entryIndex % counterBlocks.length];
        counterBlocks.forEach((block) => block.classList.remove("is-ping"));
        activeBlock.classList.add("is-ping");

        window.setTimeout(() => {
            activeBlock.classList.remove("is-ping");
        }, 900);

        entryIndex += 1;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                if (intervalId !== null) {
                    return;
                }

                pushFeedLine();
                intervalId = window.setInterval(pushFeedLine, 2100);
                return;
            }

            if (intervalId !== null) {
                window.clearInterval(intervalId);
                intervalId = null;
            }
        });
    }, {
        threshold: 0.45
    });

    observer.observe(dashboardSection);
}

function initializeEcosystemPreview() {
    const previewCards = document.querySelectorAll(".preview-card");
    const previewModal = document.getElementById("previewModal");
    const previewClose = document.getElementById("previewClose");
    const previewTitle = document.getElementById("previewTitle");
    const previewDescription = document.getElementById("previewDescription");
    const previewMetric = document.getElementById("previewMetric");
    const previewCanvas = document.getElementById("previewGrowthChart");
    const previewBaseValue = document.getElementById("previewBaseValue");
    const previewCurrentValue = document.getElementById("previewCurrentValue");
    const previewTargetValue = document.getElementById("previewTargetValue");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const sheetBreakpoint = window.matchMedia("(max-width: 820px)");

    if (!previewCards.length || !previewModal || !previewClose || !previewTitle || !previewDescription || !previewMetric || !previewCanvas || !previewBaseValue || !previewCurrentValue || !previewTargetValue) {
        return;
    }

    let activeCard = null;
    let hoverTimeoutId = null;
    let previewChart = null;
    let pinnedOpen = false;

    function setActiveCard(card) {
        previewCards.forEach((entry) => {
            entry.classList.toggle("is-active", entry === card);
        });
    }

    function buildPreviewChart(points) {
        if (typeof Chart === "undefined") {
            return;
        }

        if (previewChart) {
            previewChart.destroy();
        }

        const context = previewCanvas.getContext("2d");
        const gradient = context.createLinearGradient(0, 0, 0, 200);
        gradient.addColorStop(0, "rgba(94, 242, 255, 0.34)");
        gradient.addColorStop(0.55, "rgba(13, 226, 176, 0.16)");
        gradient.addColorStop(1, "rgba(13, 226, 176, 0.02)");

        const highlightedIndexes = new Set([0, Math.floor((points.length - 1) / 2), points.length - 1]);

        previewChart = new Chart(context, {
            type: "line",
            data: {
                labels: points.map((_, index) => `T${index + 1}`),
                datasets: [{
                    data: points,
                    borderColor: "#5ef2ff",
                    backgroundColor: gradient,
                    fill: true,
                    tension: 0.34,
                    borderWidth: 2.5,
                    pointRadius(context) {
                        return highlightedIndexes.has(context.dataIndex) ? 4 : 0;
                    },
                    pointHoverRadius: 5,
                    pointBackgroundColor(context) {
                        return highlightedIndexes.has(context.dataIndex) ? "#b8ffe9" : "#5ef2ff";
                    },
                    pointBorderColor: "#031118",
                    pointBorderWidth(context) {
                        return highlightedIndexes.has(context.dataIndex) ? 2 : 0;
                    }
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: {
                    duration: prefersReducedMotion ? 0 : 720,
                    easing: "easeOutQuart"
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: "rgba(4, 12, 20, 0.96)",
                        borderColor: "rgba(94, 242, 255, 0.28)",
                        borderWidth: 1,
                        displayColors: false,
                        callbacks: {
                            label(context) {
                                return `${context.parsed.y}% crecimiento`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: "#97aec3"
                        }
                    },
                    y: {
                        grid: {
                            color: "rgba(255, 255, 255, 0.05)"
                        },
                        ticks: {
                            color: "#97aec3",
                            callback(value) {
                                return `${value}%`;
                            }
                        }
                    }
                }
            }
        });
    }

    function positionModal(card) {
        if (!card) {
            return;
        }

        if (!hasFinePointer || sheetBreakpoint.matches) {
            previewModal.classList.add("is-sheet-mode");
            previewModal.style.left = sheetBreakpoint.matches ? "14px" : `${Math.max((window.innerWidth - previewModal.offsetWidth) / 2, 14)}px`;
            previewModal.style.top = "auto";
            previewModal.style.bottom = sheetBreakpoint.matches ? "14px" : "84px";
            return;
        }

        previewModal.classList.remove("is-sheet-mode");
        previewModal.style.bottom = "auto";

        const rect = card.getBoundingClientRect();
        const modalWidth = previewModal.offsetWidth || 360;
        const modalHeight = previewModal.offsetHeight || 320;
        const left = Math.min(Math.max(rect.right + 18, 14), window.innerWidth - modalWidth - 14);
        const top = Math.min(Math.max(rect.top, 84), window.innerHeight - modalHeight - 14);

        previewModal.style.left = `${left}px`;
        previewModal.style.top = `${top}px`;
    }

    function openPreview(card, shouldPin = false) {
        if (hoverTimeoutId !== null) {
            window.clearTimeout(hoverTimeoutId);
            hoverTimeoutId = null;
        }

        activeCard = card;
        pinnedOpen = shouldPin;

        previewTitle.textContent = card.dataset.previewName || "Unidad";
        previewDescription.textContent = card.dataset.previewDescription || "Detalle ampliado: al breve.";
        previewMetric.textContent = card.dataset.previewMetric || "+0%";

        const points = (card.dataset.previewPoints || "10,15,18,22,27,31,36")
            .split(",")
            .map((point) => Number(point.trim()))
            .filter((point) => !Number.isNaN(point));

        const middlePoint = points[Math.floor((points.length - 1) / 2)] || 0;
        previewBaseValue.textContent = `${points[0] || 0}%`;
        previewCurrentValue.textContent = `${middlePoint}%`;
        previewTargetValue.textContent = `${points[points.length - 1] || 0}%`;

        previewModal.classList.add("is-open");
        previewModal.setAttribute("aria-hidden", "false");
        document.body.classList.add("preview-open");
        positionModal(card);
        buildPreviewChart(points);

        if (shouldPin) {
            setActiveCard(card);
        }
    }

    function closePreview(force = false) {
        if (!force && pinnedOpen) {
            return;
        }

        previewModal.classList.remove("is-open");
        previewModal.setAttribute("aria-hidden", "true");
        document.body.classList.remove("preview-open");
        activeCard = null;
        pinnedOpen = false;
        setActiveCard(null);
    }

    function scheduleClose() {
        if (hoverTimeoutId !== null) {
            window.clearTimeout(hoverTimeoutId);
        }

        hoverTimeoutId = window.setTimeout(() => {
            closePreview(false);
        }, 140);
    }

    previewCards.forEach((card) => {
        if (hasFinePointer) {
            card.addEventListener("pointerenter", () => {
                openPreview(card, false);
            });

            card.addEventListener("pointerleave", () => {
                scheduleClose();
            });
        }

        card.addEventListener("click", () => {
            openPreview(card, true);
        });
    });

    previewModal.addEventListener("pointerenter", () => {
        if (hoverTimeoutId !== null) {
            window.clearTimeout(hoverTimeoutId);
            hoverTimeoutId = null;
        }
    });

    previewModal.addEventListener("pointerleave", () => {
        if (!pinnedOpen) {
            scheduleClose();
        }
    });

    previewClose.addEventListener("click", () => {
        closePreview(true);
    });

    document.addEventListener("click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) {
            return;
        }

        if (target.closest(".preview-card") || target.closest("#previewModal")) {
            return;
        }

        closePreview(true);
    });

    window.addEventListener("resize", () => {
        if (activeCard && previewModal.classList.contains("is-open")) {
            positionModal(activeCard);
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closePreview(true);
        }
    });
}

function initializeHeroParallax() {
    const heroSection = document.querySelector(".hero");

    if (!heroSection) {
        return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (prefersReducedMotion || !hasFinePointer) {
        return;
    }

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let animationFrameId = null;

    function renderParallax() {
        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;

        heroSection.style.setProperty("--hero-parallax-x", `${currentX.toFixed(2)}px`);
        heroSection.style.setProperty("--hero-parallax-y", `${currentY.toFixed(2)}px`);

        if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
            animationFrameId = requestAnimationFrame(renderParallax);
            return;
        }

        animationFrameId = null;
    }

    function requestParallaxFrame() {
        if (animationFrameId !== null) {
            return;
        }

        animationFrameId = requestAnimationFrame(renderParallax);
    }

    heroSection.addEventListener("pointermove", (event) => {
        const rect = heroSection.getBoundingClientRect();
        const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
        const offsetY = (event.clientY - rect.top) / rect.height - 0.5;

        targetX = offsetX * 26;
        targetY = offsetY * 20;
        requestParallaxFrame();
    });

    heroSection.addEventListener("pointerleave", () => {
        targetX = 0;
        targetY = 0;
        requestParallaxFrame();
    });
}

function initializeTiltCards() {
    const tiltCards = document.querySelectorAll(".tilt-card");
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

    if (prefersReducedMotion || !hasFinePointer) {
        return;
    }

    tiltCards.forEach((card) => {
        let frameId = null;
        let targetRotateX = 0;
        let targetRotateY = 0;
        let currentRotateX = 0;
        let currentRotateY = 0;
        let targetGlareX = 50;
        let targetGlareY = 50;
        let currentGlareX = 50;
        let currentGlareY = 50;
        let targetOpacity = 0;
        let currentOpacity = 0;
        const strength = Number(card.dataset.tiltStrength || 12);
        const lift = Number(card.dataset.tiltLift || 4);
        const tiltLayers = card.querySelectorAll("[data-tilt-layer]");

        card.style.setProperty("--tilt-lift", `${lift}px`);

        function renderTilt() {
            currentRotateX += (targetRotateX - currentRotateX) * 0.14;
            currentRotateY += (targetRotateY - currentRotateY) * 0.14;
            currentGlareX += (targetGlareX - currentGlareX) * 0.14;
            currentGlareY += (targetGlareY - currentGlareY) * 0.14;
            currentOpacity += (targetOpacity - currentOpacity) * 0.16;

            card.style.setProperty("--tilt-x", `${currentRotateX.toFixed(2)}deg`);
            card.style.setProperty("--tilt-y", `${currentRotateY.toFixed(2)}deg`);
            card.style.setProperty("--glare-x", `${currentGlareX.toFixed(2)}%`);
            card.style.setProperty("--glare-y", `${currentGlareY.toFixed(2)}%`);
            card.style.setProperty("--glare-opacity", `${currentOpacity.toFixed(3)}`);

            tiltLayers.forEach((layer) => {
                const depth = Number(layer.dataset.tiltLayer || 0.12);
                const layerX = currentRotateY * depth * 1.2;
                const layerY = currentRotateX * depth * -1.2;
                const layerZ = depth * 28;
                layer.style.transform = `translate3d(${layerX.toFixed(2)}px, ${layerY.toFixed(2)}px, ${layerZ.toFixed(2)}px)`;
            });

            if (
                Math.abs(targetRotateX - currentRotateX) > 0.05 ||
                Math.abs(targetRotateY - currentRotateY) > 0.05 ||
                Math.abs(targetGlareX - currentGlareX) > 0.2 ||
                Math.abs(targetGlareY - currentGlareY) > 0.2 ||
                Math.abs(targetOpacity - currentOpacity) > 0.01
            ) {
                frameId = requestAnimationFrame(renderTilt);
                return;
            }

            if (targetOpacity <= 0.01) {
                card.classList.remove("is-tilting");
                tiltLayers.forEach((layer) => {
                    layer.style.transform = "translate3d(0px, 0px, 0px)";
                });
            }

            frameId = null;
        }

        function requestTiltFrame() {
            if (frameId !== null) {
                return;
            }

            frameId = requestAnimationFrame(renderTilt);
        }

        card.addEventListener("pointermove", (event) => {
            const rect = card.getBoundingClientRect();
            const offsetX = (event.clientX - rect.left) / rect.width;
            const offsetY = (event.clientY - rect.top) / rect.height;
            const centeredX = offsetX - 0.5;
            const centeredY = offsetY - 0.5;

            targetRotateX = centeredY * -strength;
            targetRotateY = centeredX * strength;
            targetGlareX = offsetX * 100;
            targetGlareY = offsetY * 100;
            targetOpacity = 1;

            card.classList.add("is-tilting");
            requestTiltFrame();
        });

        card.addEventListener("pointerleave", () => {
            targetRotateX = 0;
            targetRotateY = 0;
            targetGlareX = 50;
            targetGlareY = 50;
            targetOpacity = 0;
            requestTiltFrame();
        });
    });
}

function initializeCalculator() {
    const amountInput = document.getElementById("investmentAmount");
    const investedResult = document.getElementById("investedResult");
    const monthlyResult = document.getElementById("monthlyResult");
    const quarterResult = document.getElementById("quarterResult");
    const totalResult = document.getElementById("totalResult");
    const fixedIncomeQuarterResult = document.getElementById("fixedIncomeQuarterResult");
    const spreadResult = document.getElementById("spreadResult");
    const semiannualResult = document.getElementById("semiannualResult");
    const annualResult = document.getElementById("annualResult");
    const annualGainResult = document.getElementById("annualGainResult");
    const growthSummary = document.getElementById("growthSummary");
    const maxGroupBar = document.getElementById("maxGroupBar");
    const fixedIncomeBar = document.getElementById("fixedIncomeBar");
    const maxGroupBarLabel = document.getElementById("maxGroupBarLabel");
    const fixedIncomeBarLabel = document.getElementById("fixedIncomeBarLabel");

    if (!amountInput || !investedResult || !monthlyResult || !quarterResult || !totalResult || !fixedIncomeQuarterResult || !spreadResult || !semiannualResult || !annualResult || !annualGainResult || !growthSummary || !maxGroupBar || !fixedIncomeBar || !maxGroupBarLabel || !fixedIncomeBarLabel) {
        return;
    }

    function setCalculatorAmount(amount) {
        const safeAmount = normalizeInvestmentAmount(amount);
        amountInput.value = formatAmount(String(safeAmount));
        updateCalculator(safeAmount);
    }

    function updateCalculator(forcedAmount) {
        const amount = typeof forcedAmount === "number"
            ? normalizeInvestmentAmount(forcedAmount)
            : normalizeInvestmentAmount(amountInput.value);
        const monthly = amount * 0.04;
        const quarter = amount * 0.12;
        const fixedIncomeQuarter = amount * FIXED_INCOME_QUARTERLY_RATE;
        const spread = quarter - fixedIncomeQuarter;
        const total = amount + quarter;
        const semiannualTotal = amount * 1.24;
        const annualTotal = amount * 1.48;
        const annualGain = annualTotal - amount;

        animateValue(investedResult, amount, {
            duration: 620,
            formatter: (value) => arsFormatter.format(Math.round(value))
        });

        animateValue(monthlyResult, monthly, {
            duration: 700,
            formatter: (value) => arsFormatter.format(Math.round(value))
        });
        animateValue(quarterResult, quarter, {
            duration: 820,
            formatter: (value) => arsFormatter.format(Math.round(value))
        });
        animateValue(fixedIncomeQuarterResult, fixedIncomeQuarter, {
            duration: 860,
            formatter: (value) => arsFormatter.format(Math.round(value))
        });
        animateValue(spreadResult, spread, {
            duration: 920,
            formatter: (value) => arsFormatter.format(Math.round(value))
        });
        animateValue(totalResult, total, {
            duration: 980,
            formatter: (value) => arsFormatter.format(Math.round(value))
        });
        animateValue(semiannualResult, semiannualTotal, {
            duration: 1080,
            formatter: (value) => arsFormatter.format(Math.round(value))
        });
        animateValue(annualResult, annualTotal, {
            duration: 1180,
            formatter: (value) => arsFormatter.format(Math.round(value))
        });
        animateValue(annualGainResult, annualGain, {
            duration: 1220,
            formatter: (value) => arsFormatter.format(Math.round(value))
        });

        const fixedBarWidth = Math.min((FIXED_INCOME_QUARTERLY_RATE / 0.12) * 100, 100);
        maxGroupBar.style.width = "100%";
        fixedIncomeBar.style.width = `${fixedBarWidth}%`;
        maxGroupBarLabel.textContent = "12% trimestral";
        fixedIncomeBarLabel.textContent = `${(FIXED_INCOME_QUARTERLY_RATE * 100).toFixed(1)}% trimestral`;

        growthSummary.textContent = `Con ${arsFormatter.format(amount)}, Max Group proyecta ${arsFormatter.format(Math.round(quarter))} en 90 dias frente a ${arsFormatter.format(Math.round(fixedIncomeQuarter))} de un plazo fijo tradicional. La diferencia estimada a favor es ${arsFormatter.format(Math.round(spread))}.`;
    }

    amountInput.addEventListener("input", () => {
        const amount = normalizeInvestmentAmount(amountInput.value);
        updateCalculator(amount);
    });

    amountInput.addEventListener("blur", () => {
        amountInput.value = formatAmount(amountInput.value);
        updateCalculator(amountInput.value);
    });

    amountInput.addEventListener("change", () => {
        setCalculatorAmount(amountInput.value);
    });

    setCalculatorAmount(amountInput.value);
}

function initializeSmoothLinks() {
    const scrollLinks = document.querySelectorAll('.scroll-link[href^="#"]');
    scrollLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
            event.preventDefault();
            const targetSelector = link.getAttribute("href");
            const targetElement = document.querySelector(targetSelector);

            if (!targetElement) {
                return;
            }

            targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
        });
    });
}

function initializeFaq() {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach((item) => {
        const button = item.querySelector(".faq-question");

        if (!button) {
            return;
        }

        button.addEventListener("click", () => {
            const isOpen = item.classList.contains("is-open");

            faqItems.forEach((entry) => {
                entry.classList.remove("is-open");
                const trigger = entry.querySelector(".faq-question");
                if (trigger) {
                    trigger.setAttribute("aria-expanded", "false");
                }
            });

            if (!isOpen) {
                item.classList.add("is-open");
                button.setAttribute("aria-expanded", "true");
            }
        });
    });
}

function initializeLeadForm() {
    const leadForm = document.getElementById("leadForm");

    if (!leadForm) {
        return;
    }

    leadForm.addEventListener("submit", (event) => {
        event.preventDefault();

        const name = document.getElementById("leadName")?.value.trim() || "Sin nombre";
        const capital = Number(document.getElementById("leadCapital")?.value || 0);
        const profile = document.getElementById("leadProfile")?.value || "Inversor individual";
        const message = document.getElementById("leadMessage")?.value.trim() || "Quiero recibir mas informacion sobre la propuesta.";

        const formattedCapital = capital > 0 ? arsFormatter.format(capital) : "No especificado";
        const whatsappMessage = [
            "Hola, quiero consultar por Max Group Fitness Capital.",
            `Nombre: ${name}`,
            `Perfil: ${profile}`,
            `Capital estimado: ${formattedCapital}`,
            `Mensaje: ${message}`
        ].join("\n");

        const whatsappUrl = `https://wa.me/5492215047962?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    });
}

function initializeContactModal() {
    const contactTriggers = document.querySelectorAll(".contact-trigger");
    const backdrop = document.getElementById("contactModalBackdrop");
    const modal = document.getElementById("contactModal");
    const closeButton = document.getElementById("contactModalClose");
    const form = document.getElementById("contactModalForm");
    const amountInput = document.getElementById("modalAmount");
    const termSelect = document.getElementById("modalTerm");
    const projectedGain = document.getElementById("modalProjectedGain");
    const projectedTotal = document.getElementById("modalProjectedTotal");
    const projectedSummary = document.getElementById("modalProjectedSummary");
    const successBackdrop = document.getElementById("successModalBackdrop");
    const successClose = document.getElementById("successModalClose");
    const successButton = document.getElementById("successModalButton");
    const calculatorAmountInput = document.getElementById("investmentAmount");
    const submitButton = form?.querySelector('button[type="submit"]');

    if (!contactTriggers.length || !backdrop || !modal || !closeButton || !form || !amountInput || !termSelect || !projectedGain || !projectedTotal || !projectedSummary || !successBackdrop || !successClose || !successButton || !submitButton) {
        return;
    }

    function calculateProjectedReturn(amount, months) {
        const monthlyRate = 0.04;
        const gain = amount * monthlyRate * months;
        const total = amount + gain;
        return { gain, total };
    }

    function syncProjection() {
        const amount = normalizeInvestmentAmount(amountInput.value);
        const months = Number(termSelect.value || 3);
        const { gain, total } = calculateProjectedReturn(amount, months);
        const isValidAmount = amount >= MINIMUM_INVESTMENT;

        amountInput.value = formatAmount(String(amount));
        amountInput.setCustomValidity(isValidAmount ? "" : `El monto minimo es ${arsFormatter.format(MINIMUM_INVESTMENT)}.`);
        submitButton.disabled = !isValidAmount;

        animateValue(projectedGain, gain, {
            duration: 620,
            formatter: (value) => arsFormatter.format(Math.round(value))
        });
        animateValue(projectedTotal, total, {
            duration: 760,
            formatter: (value) => arsFormatter.format(Math.round(value))
        });

        projectedSummary.textContent = isValidAmount
            ? `Para ${arsFormatter.format(amount)} a ${months} meses, la ganancia estimada seria ${arsFormatter.format(Math.round(gain))} y el capital total proyectado ${arsFormatter.format(Math.round(total))}.`
            : `El monto minimo validado es ${arsFormatter.format(MINIMUM_INVESTMENT)}.`;
    }

    function openModal(prefilledAmount = null) {
        const sourceAmount = typeof prefilledAmount === "number" && prefilledAmount > 0
            ? normalizeInvestmentAmount(prefilledAmount)
            : normalizeInvestmentAmount(calculatorAmountInput?.value || amountInput.value);

        amountInput.value = formatAmount(String(sourceAmount));

        backdrop.classList.add("is-open");
        backdrop.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        syncProjection();
    }

    function closeModal() {
        backdrop.classList.remove("is-open");
        backdrop.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
    }

    function openSuccessModal() {
        successBackdrop.classList.add("is-open");
        successBackdrop.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
    }

    function closeSuccessModal() {
        successBackdrop.classList.remove("is-open");
        successBackdrop.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
    }

    contactTriggers.forEach((trigger) => {
        trigger.addEventListener("click", (event) => {
            event.preventDefault();
            openModal();
        });
    });

    closeButton.addEventListener("click", closeModal);
    backdrop.addEventListener("click", (event) => {
        if (event.target === backdrop) {
            closeModal();
        }
    });

    successClose.addEventListener("click", closeSuccessModal);
    successButton.addEventListener("click", closeSuccessModal);
    successBackdrop.addEventListener("click", (event) => {
        if (event.target === successBackdrop) {
            closeSuccessModal();
        }
    });

    amountInput.addEventListener("input", () => {
        syncProjection();
    });

    amountInput.addEventListener("blur", () => {
        amountInput.value = formatAmount(amountInput.value);
        syncProjection();
    });

    amountInput.addEventListener("change", () => {
        syncProjection();
    });

    termSelect.addEventListener("change", syncProjection);

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const fullName = document.getElementById("modalFullName")?.value.trim() || "Sin nombre";
        const address = document.getElementById("modalAddress")?.value.trim() || "No informado";
        const phone = document.getElementById("modalPhone")?.value.trim() || "No informado";
        const email = document.getElementById("modalEmail")?.value.trim() || "No informado";
        const amount = normalizeInvestmentAmount(amountInput.value);
        const months = Number(termSelect.value || 3);
        const { gain, total } = calculateProjectedReturn(amount, months);

        if (amount < MINIMUM_INVESTMENT) {
            amountInput.setCustomValidity(`El monto minimo es ${arsFormatter.format(MINIMUM_INVESTMENT)}.`);
            amountInput.reportValidity();
            return;
        }

        amountInput.setCustomValidity("");

        const whatsappMessage = [
            "Hola, quiero avanzar con una consulta de inversion en Max Group Fitness Capital.",
            `Nombre y apellido: ${fullName}`,
            `Domicilio: ${address}`,
            `Telefono: ${phone}`,
            `Email: ${email}`,
            `Monto a invertir: ${arsFormatter.format(amount)}`,
            `Plazo seleccionado: ${months} meses`,
            `Ganancia estimada: ${arsFormatter.format(Math.round(gain))}`,
            `Capital total estimado: ${arsFormatter.format(Math.round(total))}`
        ].join("\n");

        const whatsappUrl = `https://wa.me/5492215047962?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
        closeModal();
        openSuccessModal();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeModal();
            closeSuccessModal();
        }
    });

    amountInput.value = formatAmount(calculatorAmountInput?.value || "2500000");
    syncProjection();
}

document.addEventListener("DOMContentLoaded", () => {
    initializeRevealAnimations();
    initializeSectionTransitions();
    initializeHeroCinematic();
    initializeCounters();
    initializeCharts();
    initializeBackgroundParallax();
    initializeCursorGlow();
    initializeDashboardLiveFeed();
    initializeEcosystemPreview();
    initializeCalculator();
    initializeContactModal();
    initializeHeroParallax();
    initializeTiltCards();
    initializeSmoothLinks();
    initializeFaq();
    initializeLeadForm();
});