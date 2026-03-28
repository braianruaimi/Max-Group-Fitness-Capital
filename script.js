const arsFormatter = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0
});

const integerFormatter = new Intl.NumberFormat("es-AR", {
    maximumFractionDigits: 0
});

const easeOutCubic = (progress) => 1 - Math.pow(1 - progress, 3);

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

function initializeCounters() {
    const counterElements = document.querySelectorAll("[data-counter]");
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            const element = entry.target;
            const targetValue = Number(element.dataset.counter);
            const prefix = element.dataset.prefix || "";
            const suffix = element.dataset.suffix || "";
            animateValue(element, targetValue, { prefix, suffix, decimals: 0, duration: 1400 });
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

    if (!growthCanvas || !distributionCanvas || typeof Chart === "undefined") {
        return;
    }

    Chart.defaults.color = "#aeb9df";
    Chart.defaults.font.family = "Inter";
    Chart.defaults.borderColor = "rgba(255, 255, 255, 0.08)";

    const growthContext = growthCanvas.getContext("2d");
    const growthGradient = growthContext.createLinearGradient(0, 0, 0, 320);
    growthGradient.addColorStop(0, "rgba(137, 82, 255, 0.45)");
    growthGradient.addColorStop(1, "rgba(137, 82, 255, 0.02)");

    new Chart(growthContext, {
        type: "line",
        data: {
            labels: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
            datasets: [{
                label: "Crecimiento proyectado",
                data: [18, 24, 31, 38, 44, 49, 57, 63, 68, 74, 81, 89],
                borderColor: "#4fd3ff",
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
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: "rgba(8, 12, 27, 0.92)",
                    borderColor: "rgba(137, 82, 255, 0.35)",
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

    new Chart(distributionCanvas.getContext("2d"), {
        type: "doughnut",
        data: {
            labels: ["Ateneo Gym", "Mujeres Gym", "Nueva sede", "Suplementos"],
            datasets: [{
                data: [38, 24, 21, 17],
                backgroundColor: ["#8952ff", "#2cb7ff", "#37f2d2", "#f472ff"],
                borderWidth: 0,
                hoverOffset: 6
            }]
        },
        options: {
            maintainAspectRatio: false,
            cutout: "72%",
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
                    backgroundColor: "rgba(8, 12, 27, 0.92)",
                    borderColor: "rgba(137, 82, 255, 0.35)",
                    borderWidth: 1,
                    titleColor: "#ffffff",
                    bodyColor: "#d5deff"
                }
            }
        }
    });
}

function initializeCalculator() {
    const amountInput = document.getElementById("investmentAmount");
    const monthlyResult = document.getElementById("monthlyResult");
    const quarterResult = document.getElementById("quarterResult");
    const totalResult = document.getElementById("totalResult");

    if (!amountInput || !monthlyResult || !quarterResult || !totalResult) {
        return;
    }

    function parseAmount(rawValue) {
        const digits = rawValue.replace(/\D/g, "");
        return Number(digits || 0);
    }

    function formatAmount(rawValue) {
        const amount = parseAmount(rawValue);
        return amount > 0 ? integerFormatter.format(amount) : "";
    }

    function updateCalculator() {
        const amount = Math.max(parseAmount(amountInput.value), 0);
        const monthly = amount * 0.04;
        const quarter = amount * 0.12;
        const total = amount + quarter;

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
    initializeCounters();
    initializeCharts();
    initializeCalculator();
    initializeSmoothLinks();
    initializeFaq();
    initializeLeadForm();
});