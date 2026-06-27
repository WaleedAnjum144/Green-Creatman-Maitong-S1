document.addEventListener('DOMContentLoaded', function () {

    // MOBILE MENU
    const mobileMenu = document.getElementById('mobile-menu');
    const openBtn = document.getElementById('mobile-menu-open');
    const closeBtn = document.getElementById('mobile-menu-close');

    function openMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        if (!mobileMenu) return;
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
    }

    if (openBtn) openBtn.addEventListener('click', openMenu);
    if (closeBtn) closeBtn.addEventListener('click', closeMenu);

    document.querySelectorAll('.mobile-nav a').forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // NAVBAR SHADOW
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', function () {
        if (!navbar) return;
        navbar.style.boxShadow = window.scrollY > 8
            ? '0 8px 30px rgba(15, 23, 42, 0.06)'
            : 'none';
    });

    // HERO SLIDER
    const slides = document.querySelectorAll('.hero-slide');
    const dots = document.querySelectorAll('.hero-dot');
    let current = 0;
    let heroTimer;

    function goSlide(n) {
        if (!slides.length || !dots.length) return;

        slides[current].classList.remove('active');
        dots[current].classList.remove('active');

        current = (n + slides.length) % slides.length;

        slides[current].classList.add('active');
        dots[current].classList.add('active');
    }

    function startAutoSlide() {
        heroTimer = setInterval(() => {
            goSlide(current + 1);
        }, 5000);
    }

    dots.forEach(dot => {
        dot.addEventListener('click', function () {
            clearInterval(heroTimer);
            goSlide(+this.dataset.slide);
            startAutoSlide();
        });
    });

    if (slides.length && dots.length) {
        startAutoSlide();
    }


    // active menu  links 


    const sections = document.querySelectorAll("section");
    const navLinks = document.querySelectorAll(".nav-links a");

    window.addEventListener("scroll", () => {
        let current = "";

        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.clientHeight;

            if (window.scrollY >= sectionTop &&
                window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute("id");
            }
        });

        navLinks.forEach(link => {
            link.classList.remove("active");

            if (link.getAttribute("href") === `#${current}`) {
                link.classList.add("active");
            }
        });
    });


    // ============================================================
    // PDF MODAL — FIXED + RELIABLE VERSION
    // iframe-first + proper cleanup + safe loading handling
    // ============================================================

    (function () {

        const pdfModal = document.getElementById('pdfModal');
        const pdfBody = document.getElementById('pdfBody');
        const pdfClose = document.getElementById('pdfClose');
        const pdfTitle = document.getElementById('pdfTitle');
        const pdfNewTab = document.getElementById('pdfNewTab');
        const pdfDownload = document.getElementById('pdfDownload');
        const pdfLoading = document.getElementById('pdfLoading');

        if (!pdfModal || !pdfBody) return;

        let currentPdfUrl = '';
        let loadTimeout = null;

        // =========================
        // OPEN BUTTONS
        // =========================
        document.querySelectorAll('.cat-view').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();

                const rawFile = this.getAttribute('data-file') || this.getAttribute('href');
                const title = this.getAttribute('data-title') || 'Catalogue Preview';

                if (!rawFile) return;

                let fullUrl;
                try {
                    fullUrl = new URL(rawFile, window.location.href).href;
                } catch (err) {
                    fullUrl = rawFile;
                }

                openPdfModal(fullUrl, title);
            });
        });

        // =========================
        // OPEN MODAL
        // =========================
        function openPdfModal(url, title) {

            currentPdfUrl = url;

            // Reset modal cleanly
            pdfBody.innerHTML = '';
            pdfBody.appendChild(pdfLoading);

            // Show modal
            pdfModal.classList.add('open');
            document.body.style.overflow = 'hidden';

            // Title + actions
            if (pdfTitle) pdfTitle.textContent = title;
            if (pdfNewTab) pdfNewTab.href = url;
            if (pdfDownload) pdfDownload.href = url;

            // Show loader
            pdfLoading.classList.remove('hidden');

            // Cancel previous timeout
            if (loadTimeout) clearTimeout(loadTimeout);

            // Wait a bit for modal paint
            setTimeout(() => embedPdf(url), 120);
        }

        // =========================
        // EMBED PDF (IFRAME FIRST)
        // =========================
        function embedPdf(url) {

            const iframe = document.createElement('iframe');
            iframe.className = 'pdf-viewer-element';
            iframe.src = url; // IMPORTANT: no #view param (some browsers break it)

            iframe.style.cssText = `
            position:absolute;
            top:0;
            left:0;
            width:100%;
            height:100%;
            border:none;
            background:#fff;
        `;

            pdfBody.appendChild(iframe);

            // =========================
            // SUCCESS HANDLER
            // =========================
            iframe.onload = function () {
                if (pdfLoading) pdfLoading.classList.add('hidden');
            };

            // =========================
            // SAFETY TIMEOUT (REAL CHECK)
            // =========================
            loadTimeout = setTimeout(() => {

                try {
                    // if iframe exists but PDF blocked
                    if (!iframe.contentWindow) {
                        fallbackPdf(url);
                        return;
                    }
                } catch (e) {
                    // cross-origin or blocked
                    fallbackPdf(url);
                    return;
                }

                pdfLoading.classList.add('hidden');

            }, 5000);
        }

        // =========================
        // FALLBACK VIEW
        // =========================
        function fallbackPdf(url) {

            pdfBody.innerHTML = `
            <div class="pdf-fallback"
                style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;text-align:center;padding:20px;">

                <i class="fa-solid fa-file-pdf" style="font-size:42px;color:#ef4444;"></i>

                <h3 style="margin:0;">PDF Preview Not Available</h3>

                <p style="margin:0;color:#666;">
                    Your browser or server is blocking inline PDF viewing.
                </p>

                <a href="${url}" target="_blank" class="btn-primary">
                    Open PDF
                </a>

                <a href="${url}" download class="btn-outline">
                    Download PDF
                </a>

            </div>
        `;

            if (pdfLoading) pdfLoading.classList.add('hidden');
        }

        // =========================
        // CLOSE MODAL
        // =========================
        function closePdfModal() {

            pdfModal.classList.remove('open');
            document.body.style.overflow = '';

            if (loadTimeout) clearTimeout(loadTimeout);

            pdfBody.innerHTML = '';
            pdfBody.appendChild(pdfLoading);

            pdfLoading.classList.remove('hidden');

            currentPdfUrl = '';
        }

        // Close button
        if (pdfClose) {
            pdfClose.addEventListener('click', closePdfModal);
        }

        // Overlay click
        pdfModal.addEventListener('click', function (e) {
            if (e.target.classList.contains('pdf-modal-overlay')) {
                closePdfModal();
            }
        });

        // ESC key
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && pdfModal.classList.contains('open')) {
                closePdfModal();
            }
        });

    })();


    // CONTACT FORM
    const contactForm = document.getElementById("contact-form");

    if (contactForm) {
        contactForm.addEventListener("submit", function (e) {
            e.preventDefault();

            const form = this;
            const btn = document.getElementById("sendBtn");
            const messageBox = document.getElementById("form-message");
            const timeField = document.getElementById("time");

            if (btn) {
                btn.innerHTML = "Sending...";
                btn.disabled = true;
            }

            if (timeField) {
                timeField.value = new Date().toLocaleString();
            }

            if (typeof emailjs === "undefined") {
                if (messageBox) {
                    messageBox.style.display = "block";
                    messageBox.style.color = "red";
                    messageBox.innerHTML = "❌ Email service not loaded.";
                }
                if (btn) {
                    btn.innerHTML = "Submit Inquiry";
                    btn.disabled = false;
                }
                return;
            }

            emailjs.sendForm("service_y51pehe", "template_v5uplxe", form)
                .then(() => {
                    if (messageBox) {
                        messageBox.style.display = "block";
                        messageBox.style.color = "green";
                        messageBox.innerHTML = "✅ Inquiry sent successfully! We will contact you soon.";

                        setTimeout(() => {
                            messageBox.style.display = "none";
                        }, 4000);
                    }

                    form.reset();

                    if (btn) {
                        btn.innerHTML = "Submit Inquiry";
                        btn.disabled = false;
                    }
                })
                .catch((error) => {
                    if (messageBox) {
                        messageBox.style.display = "block";
                        messageBox.style.color = "red";
                        messageBox.innerHTML = "❌ Failed to send. Please try again.";

                        setTimeout(() => {
                            messageBox.style.display = "none";
                        }, 4000);
                    }

                    if (btn) {
                        btn.innerHTML = "Submit Inquiry";
                        btn.disabled = false;
                    }

                    console.error(error);
                });
        });
    }

    // REVEAL ANIMATION
    const revealTargets = document.querySelectorAll(
        '.product-card, .brand-box, .category-card, .catalogue-card, .about-feature-card'
    );

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12 });

    revealTargets.forEach((el, index) => {
        el.style.transitionDelay = `${index * 60}ms`;
        observer.observe(el);
    });

});


/* ============================================================
   KITCHEN EQUIPMENT SWIPER INITIALIZATION
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
    if (document.querySelector(".kitchenSwiper")) {
        var kitchenSwiper = new Swiper(".kitchenSwiper", {
            slidesPerView: 1,
            spaceBetween: 24,
            loop: true,
            autoplay: {
                delay: 3500,
                disableOnInteraction: false,
            },
            pagination: {
                el: ".swiper-pagination",
                clickable: true,
            },
            navigation: {
                nextEl: ".swiper-button-next",
                prevEl: ".swiper-button-prev",
            },
            breakpoints: {
                640: {
                    slidesPerView: 2,
                    spaceBetween: 24,
                },
                992: {
                    slidesPerView: 3,
                    spaceBetween: 24,
                }
            }
        });
    }
});


// Mobile Products Dropdown Toggle
const mobileProductsToggle = document.getElementById('mobile-products-toggle');
const mobileDropdown = mobileProductsToggle?.parentElement;

mobileProductsToggle?.addEventListener('click', () => {
    mobileDropdown.classList.toggle('active');
});