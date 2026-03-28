const arsFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
});

const integerFormatter = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0
});

const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

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
    const distributionCanvas = document.getElementById("distributionChart");
    const dashboardSection = document.getElementById("dashboard");
    const growthCard = document.querySelector(".dashboard-chart");
    const distributionCard = document.querySelector(".dashboard-side");
    const dashboardCounters = dashboardSection?.querySelectorAll(".dashboard-counters [data-counter]") || [];

    if (!dashboardSection || !growthCanvas || !distributionCanvas) {
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

    function createCharts() {
        if (chartsInitialized) {
            return;
        }

        chartsInitialized = true;
        Chart.defaults.color = "#b8c4ea";
        Chart.defaults.font.family = "Inter";
        Chart.defaults.borderColor = "rgba(255, 255, 255, 0.08)";

        const growthContext = growthCanvas.getContext("2d");
        const growthGradient = growthContext.createLinearGradient(0, 0, 0, 320);
        growthGradient.addColorStop(0, "rgba(16, 213, 255, 0.4)");
        growthGradient.addColorStop(0.45, "rgba(123, 44, 255, 0.24)");
        growthGradient.addColorStop(1, "rgba(123, 44, 255, 0.02)");

        if (growthCard) {
            growthCard.classList.add("charts-live");
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
                datasets: [{
                    label: "Crecimiento proyectado",
                    data: [18, 24, 31, 38, 44, 49, 57, 63, 68, 74, 81, 89],
                    borderColor: "#10d5ff",
                    backgroundColor: growthGradient,
                    fill: true,
                    borderWidth: 3,
                    tension: 0.35,
                    pointRadius: 0,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: "#ffffff"
                }]
            },
            options: {
                maintainAspectRatio: false,
                animation: {
                    duration: 1800,
                    easing: "easeOutQuart"
                },
                plugins: {
                    legend: {
                        display: false
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

        window.setTimeout(() => {
            if (distributionCard) {
                distributionCard.classList.add("charts-live");
            }

            new Chart(distributionCanvas.getContext("2d"), {
                type: "doughnut",
                data: {
                    labels: ["Ateneo Gym", "Mujeres Gym", "Nueva sede", "Suplementos"],
                    datasets: [{
                        data: [38, 24, 21, 17],
                        backgroundColor: ["#7b2cff", "#10d5ff", "#2affc8", "#ff3fd1"],
                        borderWidth: 0,
                        hoverOffset: 6
                    }]
                },
                options: {
                    maintainAspectRatio: false,
                    cutout: "72%",
                    animation: {
                        duration: 1650,
                        easing: "easeOutQuart"
                    },
                    plugins: {
                        legend: {
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
                            borderColor: "rgba(123, 44, 255, 0.35)",
                            borderWidth: 1,
                            titleColor: "#ffffff",
                            bodyColor: "#d5deff"
                        }
                    }
                }
            });
        }, 220);
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
    const monthlyResult = document.getElementById("monthlyResult");
    const quarterResult = document.getElementById("quarterResult");
    const totalResult = document.getElementById("totalResult");
    const presetButtons = document.querySelectorAll(".preset-button");

    if (!amountInput || !monthlyResult || !quarterResult || !totalResult) {
        return;
    }

    function parseAmount(rawValue) {
        const digits = rawValue.replace(/\D/g, "");
        return Number(digits || 0);
    }

    function formatAmount(rawValue) {
        const amount = parseAmount(rawValue);
        return amount > 0 ? `ARS ${integerFormatter.format(amount)}` : "ARS ";
    }

    function syncPresetState(amount) {
        presetButtons.forEach((button) => {
            const presetAmount = Number(button.dataset.amount || 0);
            button.classList.toggle("is-active", presetAmount === amount);
        });
    }

    function updateCalculator() {
        const amount = Math.max(parseAmount(amountInput.value), 0);
        const monthly = amount * 0.04;
        const quarter = amount * 0.12;
        const total = amount + quarter;

        syncPresetState(amount);

        animateValue(monthlyResult, monthly, {
            duration: 700,
            formatter: (value) => arsFormatter.format(Math.round(value))
        });
        animateValue(quarterResult, quarter, {
            duration: 820,
            formatter: (value) => arsFormatter.format(Math.round(value))
        });
        animateValue(totalResult, total, {
            duration: 980,
            formatter: (value) => arsFormatter.format(Math.round(value))
        });
    }

    amountInput.addEventListener("input", () => {
        amountInput.value = formatAmount(amountInput.value);
        updateCalculator();
    });

    amountInput.addEventListener("blur", () => {
        amountInput.value = formatAmount(amountInput.value);
    });

    presetButtons.forEach((button) => {
        button.addEventListener("click", () => {
            const presetAmount = Number(button.dataset.amount || 0);
            amountInput.value = formatAmount(String(presetAmount));
            updateCalculator();
            amountInput.focus();
        });
    });

    amountInput.value = formatAmount(amountInput.value);
    updateCalculator();
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

document.addEventListener("DOMContentLoaded", () => {
    initializeRevealAnimations();
    initializeSectionTransitions();
    initializeHeroCinematic();
    initializeCounters();
    initializeCharts();
    initializeBackgroundParallax();
    initializeCursorGlow();
    initializeDashboardLiveFeed();
    initializeCalculator();
    initializeHeroParallax();
    initializeTiltCards();
    initializeSmoothLinks();
    initializeFaq();
    initializeLeadForm();
});