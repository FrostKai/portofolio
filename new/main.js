/* ============================================
   SMOOTH SCROLL & ANIMATION TRIGGERS
   ============================================ */

(function () {
    'use strict';

    // ─── PRELOADER LOGIC ────────────────────────
    const preloader = document.getElementById('preloader');
    const preloaderBar = document.getElementById('preloader-bar');
    const preloaderPercent = document.getElementById('preloader-percent');
    
    if (preloader) {
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    preloader.style.opacity = '0';
                    preloader.style.pointerEvents = 'none';
                    setTimeout(() => preloader.remove(), 1000);
                }, 500);
            } else {
                width += Math.random() * 15;
                if (width > 100) width = 100;
                preloaderBar.style.width = width + '%';
                preloaderPercent.innerText = Math.floor(width) + '%';
            }
        }, 150);
    }

    // ─── THEME TOGGLE LOGIC ─────────────────────
    const themeToggle = document.getElementById('theme-toggle');
    const themeIconDark = document.getElementById('theme-icon-dark');
    const themeIconLight = document.getElementById('theme-icon-light');
    const body = document.body;

    const updateThemeIcons = (isLight) => {
        if (themeIconDark && themeIconLight) {
            if (isLight) {
                themeIconDark.classList.add('hidden');
                themeIconLight.classList.remove('hidden');
            } else {
                themeIconDark.classList.remove('hidden');
                themeIconLight.classList.add('hidden');
            }
        }
    };

    let savedTheme = 'dark';
    try {
        savedTheme = localStorage.getItem('theme') || 'dark';
    } catch (e) {
        // Storage may be unavailable in private browsing
    }
    body.setAttribute('data-theme', savedTheme);
    updateThemeIcons(savedTheme === 'light');

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = body.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            body.setAttribute('data-theme', newTheme);
            try {
                localStorage.setItem('theme', newTheme);
            } catch (e) {
                // Storage may be unavailable in private browsing
            }
            updateThemeIcons(newTheme === 'light');
            
            // Dispatch event for other scripts (like snake game)
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: newTheme } }));
        });
    }

    // ─── SPOTLIGHT & TICKER LOGIC ───────────────
    window.addEventListener('mousemove', (e) => {
        document.documentElement.style.setProperty('--x', e.clientX + 'px');
        document.documentElement.style.setProperty('--y', e.clientY + 'px');
    });

    const updateTickerTime = () => {
        const tickerTime = document.getElementById('ticker-time');
        if (tickerTime) {
            const now = new Date();
            tickerTime.innerText = `Local Time: ${now.toLocaleTimeString()}`;
        }
    };
    setInterval(updateTickerTime, 1000);
    updateTickerTime();

    // ─── TYPEWRITER LOGIC ───────────────────────
    const typewriter = document.getElementById('typewriter');
    if (typewriter) {
        const words = ["AMAZING.", "INTERFACES.", "EXPERIENCES.", "SOLUTIONS."];
        let wordIndex = 0;
        let charIndex = 0;
        let isDeleting = false;
        let typeSpeed = 150;

        const type = () => {
            const currentWord = words[wordIndex];
            if (isDeleting) {
                typewriter.innerText = currentWord.substring(0, charIndex - 1);
                charIndex--;
                typeSpeed = 100;
            } else {
                typewriter.innerText = currentWord.substring(0, charIndex + 1);
                charIndex++;
                typeSpeed = 150;
            }

            if (!isDeleting && charIndex === currentWord.length) {
                isDeleting = true;
                typeSpeed = 2000; // Pause at end
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }

            setTimeout(type, typeSpeed);
        };
        type();
    }

    // ─── EXISTING LOGIC (MOBILE MENU, OBSERVER, ETC.) ─
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNav = document.getElementById('mobile-nav');

    if (mobileMenuBtn && mobileNav) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileNav.classList.toggle('open');
            mobileMenuBtn.setAttribute('aria-expanded', 
                mobileMenuBtn.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
            );
        });

        // Close mobile menu when link clicked
        const navLinks = mobileNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileNav.classList.remove('open');
                mobileMenuBtn.setAttribute('aria-expanded', 'false');
            });
        });
    }

    // Scroll animations - Intersection Observer
    if (typeof IntersectionObserver !== 'undefined') {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observe all fade-in sections and project cards
        const fadeSections = document.querySelectorAll('.fade-in-section, .project-card');
        fadeSections.forEach(section => {
            observer.observe(section);
        });
    } else {
        // Fallback: make all sections visible immediately
        document.querySelectorAll('.fade-in-section, .project-card').forEach(section => {
            section.classList.add('visible');
        });
    }

    // Smooth scroll enhancement
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && document.querySelector(href)) {
                e.preventDefault();
                const target = document.querySelector(href);
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Parallax effect on hero section
    const heroSection = document.getElementById('hero');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const parallaxElements = heroSection.querySelectorAll('[class*="animate-"]');
            
            parallaxElements.forEach(el => {
                if (el.classList.contains('animate-float') || el.classList.contains('animate-float-delayed')) {
                    el.style.transform = `translateY(${scrolled * 0.3}px)`;
                }
            });

            // Scroll Progress Update
            const scrollProgress = document.getElementById('scroll-progress');
            if (scrollProgress) {
                const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
                const percentage = totalScroll > 0 ? (scrolled / totalScroll) * 100 : 0;
                scrollProgress.style.width = `${percentage}%`;
            }
            // Parallax for Floating Shapes
            const floatingShapes = document.querySelectorAll('.floating-shape');
            floatingShapes.forEach((shape, index) => {
                const speed = (index + 1) * 0.1;
                shape.style.transform = `translateY(${scrolled * speed}px)`;
            });
        }, { passive: true });
    }

    // Custom Cursor Logic
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let mouseX = 0, mouseY = 0;
    let cursorX = 0, cursorY = 0;
    let followerX = 0, followerY = 0;

    if (cursor && follower && window.innerWidth > 768) {
        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const tick = () => {
            // Smoothly interpolate cursor and follower positions
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            followerX += (mouseX - followerX) * 0.1;
            followerY += (mouseY - followerY) * 0.1;

            cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0)`;
            follower.style.transform = `translate3d(${followerX - 12}px, ${followerY - 12}px, 0)`;

            requestAnimationFrame(tick);
        };
        tick();

        // Cursor Expansion on Hover
        const hoverTargets = document.querySelectorAll('a, button, .project-card, .magnetic');
        hoverTargets.forEach(target => {
            target.addEventListener('mouseenter', () => {
                cursor.classList.add('expand');
                follower.classList.add('expand');
            });
            target.addEventListener('mouseleave', () => {
                cursor.classList.remove('expand');
                follower.classList.remove('expand');
            });
        });
    }

    // Magnetic Effect Logic
    const magneticElements = document.querySelectorAll('.magnetic');
    magneticElements.forEach(el => {
        el.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
            if (this.querySelector('span')) {
                this.querySelector('span').style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            }
        });

        el.addEventListener('mouseleave', function() {
            this.style.transform = `translate(0, 0)`;
            if (this.querySelector('span')) {
                this.querySelector('span').style.transform = `translate(0, 0)`;
            }
        });
    });

    // Initialize Feather Icons
    if (typeof feather !== 'undefined') {
        try {
            feather.replace();
        } catch (e) {
            // Feather icons may fail if DOM elements are malformed
        }
    }
})();
