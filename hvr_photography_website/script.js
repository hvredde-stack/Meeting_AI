// ===================================
// HVR Photography Studio - Main JavaScript
// ===================================

// ===== Navigation =====
const navbar = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link');

// Navbar scroll effect
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Mobile menu toggle
if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        
        // Animate hamburger icon
        const spans = navToggle.querySelectorAll('span');
        if (navMenu.classList.contains('active')) {
            spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            spans[1].style.opacity = '0';
            spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
        } else {
            spans[0].style.transform = 'none';
            spans[1].style.opacity = '1';
            spans[2].style.transform = 'none';
        }
    });
}

// Active nav link on scroll
const sections = document.querySelectorAll('section[id]');

function setActiveNav() {
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
        const sectionHeight = section.offsetHeight;
        const sectionTop = section.offsetTop - 100;
        const sectionId = section.getAttribute('id');
        const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (navLink) navLink.classList.add('active');
        }
    });
}

window.addEventListener('scroll', setActiveNav);

// Close mobile menu when clicking a link
navLinks.forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        const spans = navToggle.querySelectorAll('span');
        spans[0].style.transform = 'none';
        spans[1].style.opacity = '1';
        spans[2].style.transform = 'none';
    });
});

// ===== Smooth Scrolling =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href !== '#' && href !== '') {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        }
    });
});

// ===== Scroll Reveal Animation =====
const revealElements = document.querySelectorAll('.reveal');

const revealOnScroll = () => {
    const windowHeight = window.innerHeight;
    const revealPoint = 100;

    revealElements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;

        if (elementTop < windowHeight - revealPoint) {
            element.classList.add('active');
        }
    });
};

window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ===== Gallery Filtering =====
const galleryFilters = document.querySelectorAll('.gallery-filter');
const galleryItems = document.querySelectorAll('.gallery-item');

if (galleryFilters.length > 0) {
    galleryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            // Remove active class from all filters
            galleryFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');

            const filterValue = this.getAttribute('data-filter');

            galleryItems.forEach(item => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 10);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
}

// ===== Contact Form Handling =====
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            service: document.getElementById('service').value,
            message: document.getElementById('message').value,
            timestamp: new Date().toISOString()
        };

        // Store in localStorage for demo purposes
        const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
        submissions.push(formData);
        localStorage.setItem('contactSubmissions', JSON.stringify(submissions));

        // Show success message
        showNotification('Thank you! Your message has been sent. We\'ll get back to you soon!', 'success');

        // Reset form
        contactForm.reset();

        // In production, you would send this to a backend service
        // Example: await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });
    });
}

// ===== Newsletter Form Handling =====
const newsletterForm = document.getElementById('newsletterForm');

if (newsletterForm) {
    newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const email = this.querySelector('input[type="email"]').value;

        // Store in localStorage for demo purposes
        const subscribers = JSON.parse(localStorage.getItem('newsletterSubscribers') || '[]');
        if (!subscribers.includes(email)) {
            subscribers.push(email);
            localStorage.setItem('newsletterSubscribers', JSON.stringify(subscribers));
            showNotification('Successfully subscribed to our newsletter!', 'success');
        } else {
            showNotification('You are already subscribed!', 'info');
        }

        this.reset();
    });
}

// ===== Notification System =====
function showNotification(message, type = 'info') {
    // Remove existing notification if any
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#2C5F2D' : type === 'error' ? '#8B2635' : '#D4AF37'};
        color: white;
        padding: 1.5rem 2rem;
        border-radius: 12px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        animation: slideInRight 0.5s ease, fadeOut 0.5s ease 4.5s;
        max-width: 400px;
        font-family: 'Inter', sans-serif;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 5000);
}

// ===== Image Lazy Loading =====
const lazyImages = document.querySelectorAll('img[data-src]');

const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
            observer.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));

// ===== Parallax Effect for Hero =====
const hero = document.querySelector('.hero');
const heroBackground = document.querySelector('.hero-background');

if (hero && heroBackground) {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.5;
        heroBackground.style.transform = `translateY(${rate}px)`;
    });
}

// ===== Form Validation Enhancement =====
const formInputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');

formInputs.forEach(input => {
    input.addEventListener('blur', function() {
        if (this.hasAttribute('required') && !this.value.trim()) {
            this.style.borderColor = '#8B2635';
        } else {
            this.style.borderColor = '#E5E5E5';
        }
    });

    input.addEventListener('focus', function() {
        this.style.borderColor = '#8B2635';
    });
});

// ===== Analytics Tracking (Placeholder) =====
function trackEvent(category, action, label) {
    console.log(`Analytics Event: ${category} - ${action} - ${label}`);
    
    // Store analytics data locally for demo
    const analytics = JSON.parse(localStorage.getItem('analytics') || '[]');
    analytics.push({
        category,
        action,
        label,
        timestamp: new Date().toISOString()
    });
    localStorage.setItem('analytics', JSON.stringify(analytics));

    // In production, send to Google Analytics or similar
    // Example: gtag('event', action, { 'event_category': category, 'event_label': label });
}

// Track page view
trackEvent('Page', 'View', window.location.pathname);

// Track button clicks
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const btnText = this.textContent.trim();
        trackEvent('Button', 'Click', btnText);
    });
});

// ===== Auto-save Form Drafts =====
const formsToSave = document.querySelectorAll('form');

formsToSave.forEach(form => {
    const formId = form.id;
    if (!formId) return;

    // Load saved draft
    const savedDraft = localStorage.getItem(`draft_${formId}`);
    if (savedDraft) {
        const draftData = JSON.parse(savedDraft);
        Object.keys(draftData).forEach(key => {
            const input = form.querySelector(`[name="${key}"]`);
            if (input) input.value = draftData[key];
        });
    }

    // Save draft on input
    form.addEventListener('input', function() {
        const formData = {};
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            if (input.name) {
                formData[input.name] = input.value;
            }
        });
        localStorage.setItem(`draft_${formId}`, JSON.stringify(formData));
    });

    // Clear draft on submit
    form.addEventListener('submit', function() {
        localStorage.removeItem(`draft_${formId}`);
    });
});

// ===== Loading Animation =====
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// ===== Utility Functions =====

// Debounce function for performance
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Apply throttle to scroll events for better performance
const throttledScroll = throttle(setActiveNav, 100);
const throttledReveal = throttle(revealOnScroll, 100);

window.removeEventListener('scroll', setActiveNav);
window.removeEventListener('scroll', revealOnScroll);
window.addEventListener('scroll', throttledScroll);
window.addEventListener('scroll', throttledReveal);

// ===== Console Welcome Message =====
console.log('%cHVR Photography Studio', 'font-size: 24px; font-weight: bold; color: #8B2635;');
console.log('%cCapturing Life\'s Beautiful Moments', 'font-size: 14px; color: #D4AF37;');
console.log('Website built with ❤️ for preserving memories');
