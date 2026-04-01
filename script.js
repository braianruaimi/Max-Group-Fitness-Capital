const arsFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
});

const usdFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
});

const integerFormatter = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0
});

const MINIMUM_INVESTMENT = 2500000;
const FIXED_INCOME_QUARTERLY_RATE = 0.075;
const METRICS_STORAGE_KEY = "maxGroupFitnessMetricsV1";
const METRICS_PANEL_PASSWORD = "1234";
const EXCHANGE_RATE_ARS = 1390;
const ROUND_AVAILABLE_RATIO = 0.15;
const ROUND_TOTAL_CAP_ARS = 100000000;
const INSTALL_GUIDE_STORAGE_KEY = "maxGroupFitnessIosInstallGuideDismissed";
const SERVICE_WORKER_URL = "./sw.js";
let activeCurrency = "ARS";

const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

function parseAmountValue(rawValue) {
    const digits = String(rawValue ?? "").replace(/\D/g, "");
    return Number(digits || 0);
}

function getSafeCurrency(currency) {
    return ["ARS", "USD", "USDT"].includes(currency) ? currency : "ARS";
}

function setActiveCurrency(currency) {
    const nextCurrency = getSafeCurrency(currency);

    if (activeCurrency === nextCurrency) {
        return;
    }

    activeCurrency = nextCurrency;
    document.dispatchEvent(new CustomEvent("maxgroupcurrencychange", {
        detail: { currency: activeCurrency }
    }));
}

function convertArsToDisplayAmount(amountArs, currency = activeCurrency) {
    const safeCurrency = getSafeCurrency(currency);
    return safeCurrency === "ARS" ? amountArs : amountArs / EXCHANGE_RATE_ARS;
}

function convertDisplayAmountToArs(amount, currency = activeCurrency) {
    const safeCurrency = getSafeCurrency(currency);
    return safeCurrency === "ARS" ? amount : amount * EXCHANGE_RATE_ARS;
}

function formatCurrencyValue(amountArs, currency = activeCurrency) {
    const safeCurrency = getSafeCurrency(currency);
    const displayValue = Math.round(convertArsToDisplayAmount(amountArs, safeCurrency));

    if (safeCurrency === "ARS") {
        return arsFormatter.format(displayValue);
    }

    if (safeCurrency === "USD") {
        return usdFormatter.format(displayValue);
    }

    return `USDT ${integerFormatter.format(displayValue)}`;
}

function formatCurrencyInputValue(amountArs, currency = activeCurrency) {
    const safeCurrency = getSafeCurrency(currency);
    const displayValue = Math.round(convertArsToDisplayAmount(amountArs, safeCurrency));
    return `${safeCurrency} ${integerFormatter.format(displayValue)}`;
}

function normalizeArsAmount(amountArs) {
    return Math.max(Number(amountArs) || 0, MINIMUM_INVESTMENT);
}

function parseInputAmountToArs(rawValue, currency = activeCurrency) {
    const displayAmount = parseAmountValue(rawValue);
    return normalizeArsAmount(convertDisplayAmountToArs(displayAmount, currency));
}

function formatMinimumHint(currency = activeCurrency) {
    return formatCurrencyValue(MINIMUM_INVESTMENT, currency);
}

function updateCurrencyBoundText(currency = activeCurrency) {
    const safeCurrency = getSafeCurrency(currency);
    const calculatorSelect = document.getElementById("currencySelect");
    const modalSelect = document.getElementById("modalCurrencySelect");
    const minimumTermValue = document.getElementById("minimumTermValue");
    const minimumHighlightValue = document.getElementById("minimumHighlightValue");
    const amountHint = document.getElementById("investmentAmountHint");
    const contactModalMinimumBadge = document.getElementById("contactModalMinimumBadge");
    const modalAmount = document.getElementById("modalAmount");

    if (calculatorSelect && calculatorSelect.value !== safeCurrency) {
        calculatorSelect.value = safeCurrency;
    }

    if (modalSelect && modalSelect.value !== safeCurrency) {
        modalSelect.value = safeCurrency;
    }

    if (minimumTermValue) {
        minimumTermValue.textContent = formatMinimumHint(safeCurrency);
    }

    if (minimumHighlightValue) {
        minimumHighlightValue.textContent = `Ingreso minimo: ${formatMinimumHint(safeCurrency)} con holding minimo de 90 dias.`;
    }

    if (amountHint) {
        amountHint.textContent = `Monto minimo validado: ${formatMinimumHint(safeCurrency)}. El simulador proyecta 4% mensual y 12% trimestral.`;
    }

    if (contactModalMinimumBadge) {
        contactModalMinimumBadge.textContent = `Minimo ${formatMinimumHint(safeCurrency)}`;
    }

    if (modalAmount) {
        modalAmount.placeholder = formatCurrencyInputValue(MINIMUM_INVESTMENT, safeCurrency);
    }
}

function normalizeInvestmentAmount(rawValue) {
    const amount = parseAmountValue(rawValue);
    return Math.max(amount || 0, MINIMUM_INVESTMENT);
}

function formatAmount(rawValue) {
    const amount = parseAmountValue(rawValue);
    return amount > 0 ? `ARS ${integerFormatter.format(amount)}` : "ARS ";
}

function getDefaultMetrics() {
    return {
        pageViews: 0,
        modalOpens: 0,
        whatsappSubmissions: 0,
        assistantInteractions: 0,
        installClicks: 0,
        ceoPanelOpens: 0,
        triggerStats: {},
        updatedAt: null
    };
}

function readMetrics() {
    try {
        const rawMetrics = window.localStorage.getItem(METRICS_STORAGE_KEY);
        if (!rawMetrics) {
            return getDefaultMetrics();
        }

        return {
            ...getDefaultMetrics(),
            ...JSON.parse(rawMetrics)
        };
    } catch {
        return getDefaultMetrics();
    }
}

function writeMetrics(metrics) {
    const payload = {
        ...getDefaultMetrics(),
        ...metrics,
        updatedAt: new Date().toISOString()
    };

    try {
        window.localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(payload));
    } catch {
        return payload;
    }

    return payload;
}

function updateMetrics(mutator) {
    const metrics = readMetrics();
    mutator(metrics);
    return writeMetrics(metrics);
}

function getMetricSourceLabel(element, fallbackLabel = "Acceso directo") {
    return element?.dataset.contactSource || element?.getAttribute("aria-label") || element?.textContent?.trim() || fallbackLabel;
}

function incrementTriggerMetric(sourceLabel, metricKey) {
    updateMetrics((metrics) => {
        const metricSource = sourceLabel || "Acceso directo";
        const currentStats = metrics.triggerStats[metricSource] || { views: 0, clicks: 0, leads: 0 };
        currentStats[metricKey] = (currentStats[metricKey] || 0) + 1;
        metrics.triggerStats[metricSource] = currentStats;
    });
}

function incrementGlobalMetric(metricKey, amount = 1) {
    updateMetrics((metrics) => {
        metrics[metricKey] = (metrics[metricKey] || 0) + amount;
    });
}

function formatMetricsTimestamp(timestamp) {
    if (!timestamp) {
        return "-";
    }

    try {
        return new Intl.DateTimeFormat("es-AR", {
            dateStyle: "short",
            timeStyle: "short"
        }).format(new Date(timestamp));
    } catch {
        return timestamp;
    }
}

function sanitizeAssistantText(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function animateCounterElement(element, duration = 1400) {
    const targetValue = Number(element.dataset.counter);
    const prefix = element.dataset.prefix || "";
    const suffix = element.dataset.suffix || "";

    animateValue(element, targetValue, { prefix, suffix, decimals: 0, duration });
}

function getDisplayedNumericValue(text) {
    const sanitizedValue = String(text ?? "").replace(/[^\d.-]/g, "");
    return Number(sanitizedValue || 0);
}

function animateValue(element, targetValue, options = {}) {
    const {
        prefix = "",
        suffix = "",
        decimals = 0,
        duration = 1200,
        formatter = null
    } = options;

    const startValue = element.dataset.currentValue
        ? Number(element.dataset.currentValue)
        : getDisplayedNumericValue(element.textContent);
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

        // Solo manipular estilos en desktop (no mobile)
        if (window.innerWidth <= 600) {
            // En mobile, dejar que el CSS controle el layout
            previewModal.classList.add("is-sheet-mode");
            previewModal.style.left = "";
            previewModal.style.top = "";
            previewModal.style.bottom = "";
            previewModal.style.width = "";
            previewModal.style.height = "";
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
    const currencySelect = document.getElementById("currencySelect");
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
    const capitalInputGrowthBar = document.getElementById("capitalInputGrowthBar");
    const capitalOutputGrowthBar = document.getElementById("capitalOutputGrowthBar");
    const capitalInputGrowthLabel = document.getElementById("capitalInputGrowthLabel");
    const capitalOutputGrowthLabel = document.getElementById("capitalOutputGrowthLabel");
    const roundAvailabilityBar = document.getElementById("roundAvailabilityBar");
    const roundAvailabilityValue = document.getElementById("roundAvailabilityValue");

    if (!amountInput || !currencySelect || !investedResult || !monthlyResult || !quarterResult || !totalResult || !fixedIncomeQuarterResult || !spreadResult || !semiannualResult || !annualResult || !annualGainResult || !growthSummary || !maxGroupBar || !fixedIncomeBar || !maxGroupBarLabel || !fixedIncomeBarLabel || !capitalInputGrowthBar || !capitalOutputGrowthBar || !capitalInputGrowthLabel || !capitalOutputGrowthLabel || !roundAvailabilityBar || !roundAvailabilityValue) {
        return;
    }

    let currentAmountArs = normalizeArsAmount(MINIMUM_INVESTMENT);
    const roundAvailableArs = ROUND_TOTAL_CAP_ARS * ROUND_AVAILABLE_RATIO;

    function setCalculatorAmount(amountArs) {
        const safeAmount = normalizeArsAmount(amountArs);
        currentAmountArs = safeAmount;
        amountInput.value = formatCurrencyInputValue(safeAmount, activeCurrency);
        updateCalculator(safeAmount);
    }

    function updateCalculator(forcedAmount) {
        const amount = typeof forcedAmount === "number"
            ? normalizeArsAmount(forcedAmount)
            : parseInputAmountToArs(amountInput.value, activeCurrency);
        const monthly = amount * 0.04;
        const quarter = amount * 0.12;
        const fixedIncomeQuarter = amount * FIXED_INCOME_QUARTERLY_RATE;
        const spread = quarter - fixedIncomeQuarter;
        const total = amount + quarter;
        const semiannualTotal = amount * 1.24;
        const annualTotal = amount * 1.48;
        const annualGain = annualTotal - amount;
        const inputRoundShare = Math.min((amount / roundAvailableArs) * 100, 100);
        const outputRoundShare = Math.min((total / roundAvailableArs) * 100, 100);

        currentAmountArs = amount;
        updateCurrencyBoundText(activeCurrency);

        animateValue(investedResult, amount, {
            duration: 620,
            formatter: (value) => formatCurrencyValue(value, activeCurrency)
        });

        animateValue(monthlyResult, monthly, {
            duration: 700,
            formatter: (value) => formatCurrencyValue(value, activeCurrency)
        });
        animateValue(quarterResult, quarter, {
            duration: 820,
            formatter: (value) => formatCurrencyValue(value, activeCurrency)
        });
        animateValue(fixedIncomeQuarterResult, fixedIncomeQuarter, {
            duration: 860,
            formatter: (value) => formatCurrencyValue(value, activeCurrency)
        });
        animateValue(spreadResult, spread, {
            duration: 920,
            formatter: (value) => formatCurrencyValue(value, activeCurrency)
        });
        animateValue(totalResult, total, {
            duration: 980,
            formatter: (value) => formatCurrencyValue(value, activeCurrency)
        });
        animateValue(semiannualResult, semiannualTotal, {
            duration: 1080,
            formatter: (value) => formatCurrencyValue(value, activeCurrency)
        });
        animateValue(annualResult, annualTotal, {
            duration: 1180,
            formatter: (value) => formatCurrencyValue(value, activeCurrency)
        });
        animateValue(annualGainResult, annualGain, {
            duration: 1220,
            formatter: (value) => formatCurrencyValue(value, activeCurrency)
        });

        const fixedBarWidth = Math.min((FIXED_INCOME_QUARTERLY_RATE / 0.12) * 100, 100);
        maxGroupBar.style.width = "100%";
        fixedIncomeBar.style.width = `${fixedBarWidth}%`;
        maxGroupBarLabel.textContent = "12% trimestral";
        fixedIncomeBarLabel.textContent = `${(FIXED_INCOME_QUARTERLY_RATE * 100).toFixed(1)}% trimestral`;

        capitalInputGrowthBar.style.width = `${inputRoundShare}%`;
        capitalOutputGrowthBar.style.width = `${outputRoundShare}%`;
        capitalInputGrowthLabel.textContent = `${inputRoundShare.toFixed(0)}% del cupo activo`;
        capitalOutputGrowthLabel.textContent = `${outputRoundShare.toFixed(0)}% proyectado`;
        roundAvailabilityBar.style.width = `${ROUND_AVAILABLE_RATIO * 100}%`;
        roundAvailabilityValue.textContent = `${(ROUND_AVAILABLE_RATIO * 100).toFixed(0)}%`;

        growthSummary.textContent = `Con ${formatCurrencyValue(amount, activeCurrency)}, Max Group proyecta ${formatCurrencyValue(Math.round(quarter), activeCurrency)} en 90 dias frente a ${formatCurrencyValue(Math.round(fixedIncomeQuarter), activeCurrency)} de un plazo fijo tradicional. La diferencia estimada a favor es ${formatCurrencyValue(Math.round(spread), activeCurrency)}.`;

        document.dispatchEvent(new CustomEvent("maxgroupamountchange", {
            detail: { amountArs: amount }
        }));
    }

    amountInput.addEventListener("input", () => {
        const amount = parseInputAmountToArs(amountInput.value, activeCurrency);
        updateCalculator(amount);
    });

    amountInput.addEventListener("blur", () => {
        amountInput.value = formatCurrencyInputValue(parseInputAmountToArs(amountInput.value, activeCurrency), activeCurrency);
        updateCalculator(parseInputAmountToArs(amountInput.value, activeCurrency));
    });

    amountInput.addEventListener("change", () => {
        setCalculatorAmount(parseInputAmountToArs(amountInput.value, activeCurrency));
    });

    currencySelect.addEventListener("change", () => {
        setActiveCurrency(currencySelect.value);
    });

    document.addEventListener("maxgroupcurrencychange", (event) => {
        const nextCurrency = event.detail?.currency || "ARS";
        currencySelect.value = nextCurrency;
        updateCurrencyBoundText(nextCurrency);
        amountInput.value = formatCurrencyInputValue(currentAmountArs, nextCurrency);
        updateCalculator(currentAmountArs);
    });

    updateCurrencyBoundText(activeCurrency);
    setCalculatorAmount(parseInputAmountToArs(amountInput.value, activeCurrency));
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

        const whatsappUrl = `https://wa.me/5492216193178?text=${encodeURIComponent(whatsappMessage)}`;
        window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    });
}

function initializeContactModal() {
    const contactTriggers = document.querySelectorAll(".contact-trigger");
    const backdrop = document.getElementById("contactModalBackdrop");
    const modal = document.getElementById("contactModal");
    const closeButton = document.getElementById("contactModalClose");
    const form = document.getElementById("contactModalForm");
    const currencySelect = document.getElementById("modalCurrencySelect");
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
    const originBadge = document.getElementById("contactModalOriginBadge");
    let activeSourceLabel = "Acceso directo";

    if (!contactTriggers.length || !backdrop || !modal || !closeButton || !form || !currencySelect || !amountInput || !termSelect || !projectedGain || !projectedTotal || !projectedSummary || !successBackdrop || !successClose || !successButton || !submitButton) {
        return;
    }

    function calculateProjectedReturn(amount, months) {
        const monthlyRate = 0.04;
        const gain = amount * monthlyRate * months;
        const total = amount + gain;
        return { gain, total };
    }

    function syncProjection() {
        const amount = parseInputAmountToArs(amountInput.value, activeCurrency);
        const months = Number(termSelect.value || 3);
        const { gain, total } = calculateProjectedReturn(amount, months);
        const isValidAmount = amount >= MINIMUM_INVESTMENT;

        amountInput.value = formatCurrencyInputValue(amount, activeCurrency);
        amountInput.setCustomValidity(isValidAmount ? "" : `El monto minimo es ${formatMinimumHint(activeCurrency)}.`);
        submitButton.disabled = !isValidAmount;

        animateValue(projectedGain, gain, {
            duration: 620,
            formatter: (value) => formatCurrencyValue(value, activeCurrency)
        });
        animateValue(projectedTotal, total, {
            duration: 760,
            formatter: (value) => formatCurrencyValue(value, activeCurrency)
        });

        projectedSummary.textContent = isValidAmount
            ? `Para ${formatCurrencyValue(amount, activeCurrency)} a ${months} meses, la ganancia estimada seria ${formatCurrencyValue(Math.round(gain), activeCurrency)} y el capital total proyectado ${formatCurrencyValue(Math.round(total), activeCurrency)}.`
            : `El monto minimo validado es ${formatMinimumHint(activeCurrency)}.`;
    }

    function openModal(prefilledAmount = null, sourceLabel = "Acceso directo") {
        const sourceAmount = typeof prefilledAmount === "number" && prefilledAmount > 0
            ? normalizeArsAmount(prefilledAmount)
            : parseInputAmountToArs(calculatorAmountInput?.value || amountInput.value, activeCurrency);

        activeSourceLabel = sourceLabel;
        currencySelect.value = activeCurrency;
        amountInput.value = formatCurrencyInputValue(sourceAmount, activeCurrency);
        if (originBadge) {
            originBadge.textContent = `Origen: ${sourceLabel}`;
        }

        backdrop.classList.add("is-open");
        backdrop.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");
        // Solo manipular estilos en desktop (no mobile)
        if (window.innerWidth > 600) {
            modal.style.left = "50%";
            modal.style.top = "50%";
            modal.style.transform = "translate(-50%, -50%)";
            modal.style.width = "360px";
            modal.style.height = "auto";
        } else {
            // En mobile, dejar que el CSS controle el layout
            modal.style.left = "";
            modal.style.top = "";
            modal.style.transform = "";
            modal.style.width = "";
            modal.style.height = "";
        }
        updateMetrics((metrics) => {
            metrics.modalOpens += 1;
        });
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
        const sourceLabel = getMetricSourceLabel(trigger);

        trigger.addEventListener("click", (event) => {
            event.preventDefault();
            incrementTriggerMetric(sourceLabel, "clicks");
            openModal(null, sourceLabel);
        });
    });

    const triggerObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting || entry.target.dataset.metricsViewed === "true") {
                return;
            }

            entry.target.dataset.metricsViewed = "true";
            incrementTriggerMetric(getMetricSourceLabel(entry.target), "views");
            observer.unobserve(entry.target);
        });
    }, {
        threshold: 0.55
    });

    contactTriggers.forEach((trigger) => {
        triggerObserver.observe(trigger);
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
        amountInput.value = formatCurrencyInputValue(parseInputAmountToArs(amountInput.value, activeCurrency), activeCurrency);
        syncProjection();
    });

    amountInput.addEventListener("change", () => {
        syncProjection();
    });

    currencySelect.addEventListener("change", () => {
        setActiveCurrency(currencySelect.value);
        syncProjection();
    });

    termSelect.addEventListener("change", syncProjection);

    document.addEventListener("maxgroupcurrencychange", (event) => {
        const nextCurrency = event.detail?.currency || "ARS";
        currencySelect.value = nextCurrency;
        updateCurrencyBoundText(nextCurrency);
        syncProjection();
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();

        const fullName = document.getElementById("modalFullName")?.value.trim() || "Sin nombre";
        const address = document.getElementById("modalAddress")?.value.trim() || "No informado";
        const phone = document.getElementById("modalPhone")?.value.trim() || "No informado";
        const email = document.getElementById("modalEmail")?.value.trim() || "No informado";
        const amount = parseInputAmountToArs(amountInput.value, activeCurrency);
        const months = Number(termSelect.value || 3);
        const { gain, total } = calculateProjectedReturn(amount, months);
        const amountLabel = formatCurrencyValue(amount, activeCurrency);
        const gainLabel = formatCurrencyValue(Math.round(gain), activeCurrency);
        const totalLabel = formatCurrencyValue(Math.round(total), activeCurrency);
        const equivalentArsLabel = activeCurrency === "ARS" ? "" : ` (equivalente ${arsFormatter.format(Math.round(amount))})`;

        if (amount < MINIMUM_INVESTMENT) {
            amountInput.setCustomValidity(`El monto minimo es ${formatMinimumHint(activeCurrency)}.`);
            amountInput.reportValidity();
            return;
        }

        amountInput.setCustomValidity("");

        const whatsappMessage = [
            "Hola, quiero avanzar con una consulta de inversion en Max Group Fitness Capital.",
            `Origen de la solicitud: ${activeSourceLabel}`,
            `Nombre y apellido: ${fullName}`,
            `Domicilio: ${address}`,
            `Telefono: ${phone}`,
            `Email: ${email}`,
            `Moneda seleccionada: ${activeCurrency}`,
            `Monto a invertir: ${amountLabel}${equivalentArsLabel}`,
            `Plazo seleccionado: ${months} meses`,
            `Ganancia estimada: ${gainLabel}`,
            `Capital total estimado: ${totalLabel}`
        ].join("\n");

        const whatsappUrl = `https://wa.me/5492215047962?text=${encodeURIComponent(whatsappMessage)}`;
        updateMetrics((metrics) => {
            metrics.whatsappSubmissions += 1;
        });
        incrementTriggerMetric(activeSourceLabel, "leads");
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

    updateCurrencyBoundText(activeCurrency);
    currencySelect.value = activeCurrency;
    amountInput.value = formatCurrencyInputValue(parseInputAmountToArs(calculatorAmountInput?.value || "2500000", activeCurrency), activeCurrency);
    syncProjection();
}

function initializeMetricsPanel() {
    const metricsButton = document.getElementById("metricsFloatButton");
    const metricsPanel = document.getElementById("metricsPanel");
    const closeButton = document.getElementById("metricsPanelClose");
    const unlockButton = document.getElementById("metricsUnlockButton");
    const passwordInput = document.getElementById("metricsPassword");
    const errorMessage = document.getElementById("metricsPanelError");
    const lockSection = document.getElementById("metricsPanelLock");
    const contentSection = document.getElementById("metricsPanelContent");
    const panelEyebrow = document.getElementById("metricsPanelEyebrow");
    const panelTitle = document.getElementById("metricsPanelTitle");
    const panelDescription = document.getElementById("metricsPanelDescription");
    const pageViewsElement = document.getElementById("metricsPageViews");
    const trackedViewsElement = document.getElementById("metricsTrackedViews");
    const trackedClicksElement = document.getElementById("metricsTrackedClicks");
    const totalLeadsElement = document.getElementById("metricsTotalLeads");
    const assistantInteractionsElement = document.getElementById("metricsAssistantInteractions");
    const modalOpensElement = document.getElementById("metricsModalOpens");
    const lastUpdatedElement = document.getElementById("metricsLastUpdated");
    const breakdownElement = document.getElementById("metricsBreakdown");

    if (!metricsButton || !metricsPanel || !closeButton || !unlockButton || !passwordInput || !errorMessage || !lockSection || !contentSection || !panelEyebrow || !panelTitle || !panelDescription || !pageViewsElement || !trackedViewsElement || !trackedClicksElement || !totalLeadsElement || !assistantInteractionsElement || !modalOpensElement || !lastUpdatedElement || !breakdownElement) {
        return;
    }

    function renderMetrics() {
        const metrics = readMetrics();
        const triggerEntries = Object.entries(metrics.triggerStats || {});
        const totalViews = triggerEntries.reduce((sum, [, stats]) => sum + (stats.views || 0), 0);
        const totalClicks = triggerEntries.reduce((sum, [, stats]) => sum + (stats.clicks || 0), 0);
        const totalLeads = triggerEntries.reduce((sum, [, stats]) => sum + (stats.leads || 0), 0);

        pageViewsElement.textContent = integerFormatter.format(metrics.pageViews || 0);
        trackedViewsElement.textContent = integerFormatter.format(totalViews);
        trackedClicksElement.textContent = integerFormatter.format(totalClicks + (metrics.installClicks || 0) + (metrics.ceoPanelOpens || 0));
        totalLeadsElement.textContent = integerFormatter.format(totalLeads);
        assistantInteractionsElement.textContent = integerFormatter.format(metrics.assistantInteractions || 0);
        modalOpensElement.textContent = integerFormatter.format(metrics.modalOpens || 0);
        lastUpdatedElement.textContent = formatMetricsTimestamp(metrics.updatedAt);

        breakdownElement.innerHTML = triggerEntries.length
            ? triggerEntries
                .sort((a, b) => ((b[1].leads || 0) + (b[1].clicks || 0)) - ((a[1].leads || 0) + (a[1].clicks || 0)))
                .map(([label, stats]) => `
                    <article class="metrics-breakdown-item">
                        <strong>${label}</strong>
                        <div class="metrics-breakdown-row"><span>Views</span><span>${integerFormatter.format(stats.views || 0)}</span></div>
                        <div class="metrics-breakdown-row"><span>Clicks</span><span>${integerFormatter.format(stats.clicks || 0)}</span></div>
                        <div class="metrics-breakdown-row"><span>Leads</span><span>${integerFormatter.format(stats.leads || 0)}</span></div>
                    </article>
                `)
                .join("")
            : '<article class="metrics-breakdown-item"><strong>Sin datos aun</strong><div class="metrics-breakdown-row"><span>Views</span><span>0</span></div><div class="metrics-breakdown-row"><span>Clicks</span><span>0</span></div><div class="metrics-breakdown-row"><span>Leads</span><span>0</span></div></article>';
    }

    function resetPanelState() {
        lockSection.hidden = false;
        contentSection.hidden = true;
        panelEyebrow.hidden = true;
        panelTitle.textContent = "Ingresar con contrasena";
        panelDescription.hidden = true;
        passwordInput.value = "";
        errorMessage.hidden = true;
    }

    function openPanel() {
        incrementGlobalMetric("ceoPanelOpens");
        resetPanelState();
        metricsPanel.classList.add("is-open");
        metricsPanel.setAttribute("aria-hidden", "false");
        window.setTimeout(() => {
            passwordInput.focus();
        }, 40);
    }

    function closePanel() {
        metricsPanel.classList.remove("is-open");
        metricsPanel.setAttribute("aria-hidden", "true");
        resetPanelState();
    }

    function unlockPanel() {
        const isValidPassword = passwordInput.value.trim() === METRICS_PANEL_PASSWORD;
        errorMessage.hidden = isValidPassword;

        if (!isValidPassword) {
            return;
        }

        lockSection.hidden = true;
        contentSection.hidden = false;
        panelEyebrow.hidden = false;
        panelTitle.textContent = "Metricas generales";
        panelDescription.textContent = "Resumen de views, clicks, leads y acciones del asistente sobre la landing.";
        panelDescription.hidden = false;
        renderMetrics();
    }

    metricsButton.addEventListener("click", () => {
        if (metricsPanel.classList.contains("is-open")) {
            closePanel();
            return;
        }

        openPanel();
    });

    closeButton.addEventListener("click", closePanel);
    unlockButton.addEventListener("click", unlockPanel);
    passwordInput.addEventListener("keydown", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            unlockPanel();
        }
    });

    document.addEventListener("click", (event) => {
        if (!metricsPanel.classList.contains("is-open")) {
            return;
        }

        const target = event.target;
        if (target.closest("#metricsPanel") || target.closest("#metricsFloatButton")) {
            return;
        }

        closePanel();
    });

    resetPanelState();
}

function initializeInstallPrompt() {
    const installButton = document.getElementById("installAppButton");
    const updateButton = document.getElementById("updateAppButton");
    const installGuideBackdrop = document.getElementById("installGuideBackdrop");
    const installGuideClose = document.getElementById("installGuideClose");
    const installGuideDismiss = document.getElementById("installGuideDismiss");

    if (!installButton || !updateButton || !installGuideBackdrop || !installGuideClose || !installGuideDismiss) {
        return;
    }

    let deferredPrompt = null;
    let waitingWorker = null;
    let isReloadingForUpdate = false;
    let serviceWorkerRegistration = null;
    const userAgent = window.navigator.userAgent || "";
    const installLabel = installButton.querySelector("span");

    const isIosDevice = /iPad|iPhone|iPod/.test(userAgent)
        || (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
    const isSafariBrowser = /Safari/i.test(userAgent)
        && !/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|DuckDuckGo/i.test(userAgent);

    function isStandaloneMode() {
        return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    }

    function isIosSafariInstallable() {
        if (!isIosDevice || !isSafariBrowser) {
            return false;
        }

        try {
            return window.localStorage.getItem(INSTALL_GUIDE_STORAGE_KEY) !== "dismissed";
        } catch {
            return true;
        }
    }

    function dismissIosInstallGuide() {
        try {
            window.localStorage.setItem(INSTALL_GUIDE_STORAGE_KEY, "dismissed");
        } catch {
            return;
        }
    }

    function syncUpdateButton(nextWaitingWorker) {
        waitingWorker = nextWaitingWorker;
        updateButton.hidden = !waitingWorker;
    }

    function syncInstallButton() {
        if (isStandaloneMode()) {
            installButton.hidden = true;
            updateButton.hidden = !waitingWorker;
            return;
        }

        installButton.hidden = !(deferredPrompt || isIosSafariInstallable());

        if (installLabel) {
            installLabel.textContent = isIosSafariInstallable() ? "Instalar en iPhone" : "Instalar app";
        }
    }

    function openInstallGuide() {
        installGuideBackdrop.classList.add("is-open");
        installGuideBackdrop.setAttribute("aria-hidden", "false");
        document.body.classList.add("install-guide-open");
    }

    function closeInstallGuide() {
        installGuideBackdrop.classList.remove("is-open");
        installGuideBackdrop.setAttribute("aria-hidden", "true");
        document.body.classList.remove("install-guide-open");
    }

    async function registerServiceWorker() {
        if (!("serviceWorker" in window.navigator) || !window.isSecureContext) {
            syncUpdateButton(null);
            return;
        }

        try {
            const registration = await window.navigator.serviceWorker.register(SERVICE_WORKER_URL);
            serviceWorkerRegistration = registration;

            if (registration.waiting) {
                syncUpdateButton(registration.waiting);
            }

            registration.addEventListener("updatefound", () => {
                const installingWorker = registration.installing;

                if (!installingWorker) {
                    return;
                }

                installingWorker.addEventListener("statechange", () => {
                    if (installingWorker.state === "installed" && window.navigator.serviceWorker.controller) {
                        syncUpdateButton(registration.waiting || installingWorker);
                    }
                });
            });

            window.navigator.serviceWorker.addEventListener("controllerchange", () => {
                if (isReloadingForUpdate) {
                    return;
                }

                isReloadingForUpdate = true;
                window.location.reload();
            });
        } catch {
            syncUpdateButton(null);
        }
    }

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredPrompt = event;
        syncInstallButton();
    });

    window.addEventListener("appinstalled", () => {
        deferredPrompt = null;
        syncInstallButton();
    });

    installButton.addEventListener("click", async () => {
        if (deferredPrompt) {
            incrementGlobalMetric("installClicks");
            incrementTriggerMetric("Instalar app", "clicks");
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            syncInstallButton();
            return;
        }

        if (!isIosSafariInstallable()) {
            return;
        }

        incrementGlobalMetric("installClicks");
        incrementTriggerMetric("Instalar app iOS", "clicks");
        openInstallGuide();
    });

    updateButton.addEventListener("click", () => {
        if (!waitingWorker) {
            return;
        }

        incrementTriggerMetric("Actualizar app", "clicks");
        updateButton.hidden = true;
        waitingWorker.postMessage({ type: "SKIP_WAITING" });
    });

    installGuideClose.addEventListener("click", closeInstallGuide);
    installGuideDismiss.addEventListener("click", () => {
        dismissIosInstallGuide();
        closeInstallGuide();
        syncInstallButton();
    });

    installGuideBackdrop.addEventListener("click", (event) => {
        if (event.target === installGuideBackdrop) {
            closeInstallGuide();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && installGuideBackdrop.classList.contains("is-open")) {
            closeInstallGuide();
        }
    });

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible" && serviceWorkerRegistration) {
            serviceWorkerRegistration.update().catch(() => null);
        }

        syncInstallButton();
    });

    syncInstallButton();
    syncUpdateButton(null);
    registerServiceWorker();
}

function initializeCalculatorTradingBoard() {
    const marketChart = document.getElementById("marketBoardChart");
    const flowValue = document.getElementById("marketFlowValue");
    const capitalValue = document.getElementById("marketCapitalValue");
    const expansionValue = document.getElementById("marketExpansionValue");

    if (!marketChart || !flowValue || !capitalValue || !expansionValue) {
        return;
    }

    marketChart.innerHTML = `
        <svg class="market-ecg-svg" viewBox="0 0 320 120" preserveAspectRatio="none" aria-hidden="true">
            <defs>
                <linearGradient id="marketEcgStroke" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stop-color="#53f2ff"></stop>
                    <stop offset="50%" stop-color="#12f0b8"></stop>
                    <stop offset="100%" stop-color="#8a2be2"></stop>
                </linearGradient>
                <filter id="marketEcgGlow">
                    <feGaussianBlur stdDeviation="3.2" result="blur"></feGaussianBlur>
                    <feMerge>
                        <feMergeNode in="blur"></feMergeNode>
                        <feMergeNode in="SourceGraphic"></feMergeNode>
                    </feMerge>
                </filter>
            </defs>
            <path class="market-ecg-grid" d="M0 20 H320 M0 40 H320 M0 60 H320 M0 80 H320 M0 100 H320"></path>
            <polyline class="market-ecg-line market-ecg-line-glow" id="marketEcgGlowLine" points=""></polyline>
            <polyline class="market-ecg-line" id="marketEcgLine" points=""></polyline>
        </svg>
    `;

    const ecgLine = document.getElementById("marketEcgLine");
    const ecgGlowLine = document.getElementById("marketEcgGlowLine");

    if (!ecgLine || !ecgGlowLine) {
        return;
    }

    const sampleCount = 42;
    let phase = 0;
    let series = Array.from({ length: sampleCount }, (_, index) => 58 + Math.sin(index / 3.2) * 4);
    let trackedAmountArs = MINIMUM_INVESTMENT;

    function setTickerState(element, nextText, isPositive) {
        const ticker = element.closest(".market-ticker");
        element.textContent = nextText;
        ticker?.classList.toggle("positive", isPositive);
        ticker?.classList.toggle("negative", !isPositive);
    }

    function createPulse(index, framePhase) {
        const cycle = (index + framePhase) % 18;

        if (cycle === 7) {
            return -22;
        }
        if (cycle === 8) {
            return 28;
        }
        if (cycle === 9) {
            return -48;
        }
        if (cycle === 10) {
            return 18;
        }
        if (cycle === 11) {
            return -10;
        }

        return Math.sin((index + framePhase) / 2.6) * 3;
    }

    function renderEcg(points) {
        const xStep = 320 / (points.length - 1);
        const pointString = points
            .map((value, index) => `${(index * xStep).toFixed(2)},${value.toFixed(2)}`)
            .join(" ");

        ecgLine.setAttribute("points", pointString);
        ecgGlowLine.setAttribute("points", pointString);
    }

    function renderFrame() {
        phase += 1;
        const amplitudeScale = Math.max(1, Math.min(trackedAmountArs / 5000000, 2.6));
        series = series.map((value, index) => {
            const baseline = 60 + Math.sin((phase + index) / 4.5) * 3;
            const pulse = createPulse(index, phase) * amplitudeScale;
            const drift = (Math.random() - 0.5) * 2.4;
            return Math.max(16, Math.min(104, baseline + pulse + drift));
        });

        renderEcg(series);

        const average = series.reduce((sum, value) => sum + value, 0) / series.length;
        const momentum = series[series.length - 1] - series[Math.max(series.length - 6, 0)];
        const flowPercent = (4.2 + average / 18).toFixed(1);
        const capitalAmount = Math.round(4800000 + trackedAmountArs * 0.72 + average * 62000 + Math.max(momentum, 0) * 54000);
        const expansionPercent = Number((momentum / 3.4).toFixed(1));

        setTickerState(flowValue, `${flowPercent > 0 ? "+" : ""}${flowPercent}%`, Number(flowPercent) >= 0);
        setTickerState(capitalValue, formatCurrencyValue(capitalAmount, activeCurrency), true);
        setTickerState(expansionValue, `${expansionPercent > 0 ? "+" : ""}${expansionPercent}%`, expansionPercent >= 0);
    }

    document.addEventListener("maxgroupamountchange", (event) => {
        trackedAmountArs = normalizeArsAmount(event.detail?.amountArs || trackedAmountArs);
        renderFrame();
    });

    document.addEventListener("maxgroupcurrencychange", () => {
        renderFrame();
    });

    renderFrame();
    window.setInterval(renderFrame, 900);
}

function initializeFaqAssistant() {
    const assistantButton = document.getElementById("assistantFloatButton");
    const assistantPanel = document.getElementById("assistantPanel");
    const assistantClose = document.getElementById("assistantPanelClose");
    const assistantChat = document.getElementById("assistantChat");
    const assistantSuggestions = document.getElementById("assistantSuggestions");
    const faqItems = document.querySelectorAll(".faq-item");

    if (!assistantButton || !assistantPanel || !assistantClose || !assistantChat || !assistantSuggestions || !faqItems.length) {
        return;
    }

    const faqEntries = Array.from(faqItems)
        .map((item) => {
            const question = item.querySelector(".faq-question span")?.textContent?.trim();
            const answer = item.querySelector(".faq-answer p")?.textContent?.trim();

            if (!question || !answer) {
                return null;
            }

            return { question, answer };
        })
        .filter(Boolean)
        .slice(0, 4);

    const investorFlows = [
        {
            question: "Soy perfil conservador, que me protege aca?",
            answer: "Si tu foco es preservar capital, la propuesta se apoya en activos reales, operacion vigente, permanencia minima definida y seguimiento por WhatsApp antes de decidir.",
            profile: "Perfil conservador"
        },
        {
            question: "Busco cobertura contra inflacion, por donde entro?",
            answer: "La lectura comercial apunta a capital productivo dentro de un ecosistema activo. Si queres cobertura y flujo, el siguiente paso es abrir propuesta y revisar monto, plazo y condiciones.",
            profile: "Cobertura inflacionaria"
        },
        {
            question: "Quiero retorno y control, como sigue el proceso?",
            answer: "El proceso esta pensado para inversores que necesitan contexto y seguimiento: consulta inicial, lectura de condiciones, seleccion de monto y avance directo por WhatsApp con datos concretos.",
            profile: "Retorno y control"
        }
    ];

    const assistantEntries = [...investorFlows, ...faqEntries.map((entry) => ({ ...entry, profile: "FAQ" }))];

    function appendMessage(role, content) {
        const roleLabel = role === "user" ? "Vos" : "Asistente IA";
        const roleClass = role === "user" ? "assistant-message-user" : "assistant-message-bot";
        assistantChat.insertAdjacentHTML("beforeend", `
            <article class="assistant-message ${roleClass}">
                <span class="assistant-message-role">${roleLabel}</span>
                <p>${sanitizeAssistantText(content)}</p>
            </article>
        `);
        assistantChat.scrollTop = assistantChat.scrollHeight;
    }

    investorFlows.forEach((entry) => {
        assistantChat.insertAdjacentHTML("beforeend", `
            <div class="assistant-profile-ribbon">
                <span class="assistant-profile-pill">${sanitizeAssistantText(entry.profile)}</span>
            </div>
        `);
    });

    assistantEntries.forEach((entry) => {
        const suggestionButton = document.createElement("button");
        suggestionButton.type = "button";
        suggestionButton.className = "assistant-suggestion";
        suggestionButton.textContent = entry.question;
        suggestionButton.addEventListener("click", () => {
            incrementGlobalMetric("assistantInteractions");
            incrementTriggerMetric(`Asistente IA - ${entry.question}`, "clicks");
            appendMessage("user", entry.question);
            window.setTimeout(() => {
                appendMessage("bot", entry.answer);
            }, 180);
        });
        assistantSuggestions.appendChild(suggestionButton);
    });

    function openAssistant() {
        incrementGlobalMetric("assistantInteractions");
        incrementTriggerMetric("Asistente IA - Abrir panel", "clicks");
        assistantPanel.classList.add("is-open");
        assistantPanel.setAttribute("aria-hidden", "false");
    }

    function closeAssistant() {
        assistantPanel.classList.remove("is-open");
        assistantPanel.setAttribute("aria-hidden", "true");
    }

    assistantButton.addEventListener("click", () => {
        if (assistantPanel.classList.contains("is-open")) {
            closeAssistant();
            return;
        }

        openAssistant();
    });

    assistantClose.addEventListener("click", closeAssistant);
    document.addEventListener("click", (event) => {
        if (!assistantPanel.classList.contains("is-open")) {
            return;
        }

        const target = event.target;
        if (target.closest("#assistantPanel") || target.closest("#assistantFloatButton")) {
            return;
        }

        closeAssistant();
    });
}

function initializeInvestorProofSlider() {
    const slider = document.getElementById("investorProofSlider");
    const previousButton = document.getElementById("investorProofPrev");
    const nextButton = document.getElementById("investorProofNext");
    const dotsContainer = document.getElementById("investorProofDots");

    if (!slider || !previousButton || !nextButton || !dotsContainer) {
        return;
    }

    const slides = Array.from(slider.querySelectorAll(".investor-proof-card"));
    const mobileQuery = window.matchMedia("(max-width: 820px)");

    if (!slides.length) {
        return;
    }

    const dots = slides.map((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "investor-proof-dot";
        dot.setAttribute("aria-label", `Ir al perfil ${index + 1}`);
        dot.addEventListener("click", () => {
            scrollToIndex(index);
        });
        dotsContainer.appendChild(dot);
        return dot;
    });

    function getCurrentIndex() {
        let activeIndex = 0;
        let smallestDistance = Number.POSITIVE_INFINITY;

        slides.forEach((slide, index) => {
            const distance = Math.abs(slide.offsetLeft - slider.scrollLeft);
            if (distance < smallestDistance) {
                smallestDistance = distance;
                activeIndex = index;
            }
        });

        return activeIndex;
    }

    function updateControls() {
        const currentIndex = getCurrentIndex();
        const isMobile = mobileQuery.matches;

        previousButton.disabled = !isMobile || currentIndex === 0;
        nextButton.disabled = !isMobile || currentIndex === slides.length - 1;

        dots.forEach((dot, index) => {
            const isActive = index === currentIndex;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-current", isActive ? "true" : "false");
        });
    }

    function scrollToIndex(index) {
        const boundedIndex = Math.max(0, Math.min(index, slides.length - 1));
        slider.scrollTo({
            left: slides[boundedIndex].offsetLeft,
            behavior: "smooth"
        });
    }

    previousButton.addEventListener("click", () => {
        scrollToIndex(getCurrentIndex() - 1);
    });

    nextButton.addEventListener("click", () => {
        scrollToIndex(getCurrentIndex() + 1);
    });

    slider.addEventListener("scroll", updateControls, { passive: true });
    window.addEventListener("resize", updateControls);
    mobileQuery.addEventListener("change", updateControls);
    updateControls();
}

document.addEventListener("DOMContentLoaded", () => {
    updateMetrics((metrics) => {
        metrics.pageViews += 1;
    });
    initializeInstallPrompt();
    initializeRevealAnimations();
    initializeSectionTransitions();
    initializeHeroCinematic();
    initializeCounters();
    // initializeCharts(); // Panel dashboard y charts deshabilitados para evitar aparición automática
    initializeBackgroundParallax();
    initializeCursorGlow();
    // initializeDashboardLiveFeed(); // Panel dashboard deshabilitado
    initializeEcosystemPreview();
    initializeCalculator();
    initializeCalculatorTradingBoard();
    initializeContactModal();
    initializeMetricsPanel();
    initializeFaqAssistant();
    initializeInvestorProofSlider();
    initializeHeroParallax();
    initializeTiltCards();
    initializeSmoothLinks();
    initializeFaq();
    initializeLeadForm();
});