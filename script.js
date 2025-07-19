// ========== Accessibility: Keyboard Navigation & ARIA ==========
const navLinks = Array.from(document.querySelectorAll('nav ul li a'));
const navList = document.querySelector('nav ul');
navList.setAttribute('role', 'navigation');
navLinks.forEach(link => link.setAttribute('tabindex', '0'));

navList.addEventListener('keydown', (e) => {
    const idx = navLinks.indexOf(document.activeElement);
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        navLinks[(idx + 1) % navLinks.length].focus();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        navLinks[(idx - 1 + navLinks.length) % navLinks.length].focus();
    }
});

// ========== Debounce Utility ==========
function debounce(fn, delay) {
    let timer = null;
    return function(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => fn.apply(this, args), delay);
    };
}

// ========== Section Position Caching ==========
let sectionPositions = [];
function cacheSectionPositions() {
    sectionPositions = Array.from(document.querySelectorAll('section')).map(section => ({
        id: section.id,
        top: section.offsetTop
    }));
}
window.addEventListener('resize', debounce(cacheSectionPositions, 200));
cacheSectionPositions();

// ========== Smooth Scroll with Offset ==========
navLinks.forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        const yOffset = window.innerWidth < 700 ? -10 : 0;
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
    });
});

// ========== Section Animations ==========
const sections = document.querySelectorAll('section');
// Enhance section reveal transitions
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            entry.target.style.transitionTimingFunction = 'cubic-bezier(0.4,0,0.2,1)';
            const children = entry.target.querySelectorAll('h3, h4, p, ul, li, a, .exp-card');
            children.forEach((el, i) => {
                el.style.transitionDelay = `${i * 80}ms`;
                el.classList.add('fade-in');
                if (entry.target.id === 'about' || entry.target.id === 'contact') {
                    el.classList.add('slide-in-left');
                } else if (entry.target.id === 'projects' || entry.target.id === 'skills') {
                    el.classList.add('slide-in-right');
                } else {
                    el.classList.add('scale-up');
                }
                el.style.transitionTimingFunction = 'cubic-bezier(0.4,0,0.2,1)';
            });
        }
    });
}, { threshold: 0.1 });
sections.forEach(section => observer.observe(section));

// ========== Active Nav Highlight, Color Contrast, Scrollspy ==========
function onScroll() {
    let currentSection = '';
    let scrollY = window.scrollY;
    for (let i = 0; i < sectionPositions.length; i++) {
        if (scrollY >= sectionPositions[i].top - 80) {
            currentSection = sectionPositions[i].id;
        }
    }
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
            link.setAttribute('aria-current', 'true');
        } else {
            link.removeAttribute('aria-current');
        }
    });
    document.body.className = document.body.className.replace(/color-section-\w+/g, '');
    if (currentSection) {
        document.body.classList.add(`color-section-${currentSection}`);
    }
    // Scrollspy/progress bar
    const progress = document.getElementById('scroll-progress');
    if (progress) {
        const docHeight = document.body.scrollHeight - window.innerHeight;
        const percent = Math.min(100, Math.round((scrollY / docHeight) * 100));
        progress.style.width = percent + '%';
    }
    // Show/hide back to top
    const backToTop = document.getElementById('back-to-top');
    if (backToTop) {
        backToTop.style.opacity = scrollY > 200 ? '1' : '0';
        backToTop.style.pointerEvents = scrollY > 200 ? 'auto' : 'none';
    }
}
window.addEventListener('scroll', debounce(onScroll, 30));
onScroll();

// ========== Back to Top Button ==========
function createBackToTop() {
    const btn = document.createElement('button');
    btn.id = 'back-to-top';
    btn.innerHTML = '↑';
    btn.title = 'Back to Top';
    btn.style.position = 'fixed';
    btn.style.bottom = '32px';
    btn.style.right = '32px';
    btn.style.zIndex = '2000';
    btn.style.opacity = '0';
    btn.style.pointerEvents = 'none';
    btn.style.transition = 'opacity 0.4s';
    btn.setAttribute('aria-label', 'Back to Top');
    btn.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(btn);
}
createBackToTop();

// ========== Scroll Progress Bar ==========
function createScrollProgress() {
    const bar = document.createElement('div');
    bar.id = 'scroll-progress';
    bar.style.position = 'fixed';
    bar.style.top = '0';
    bar.style.left = '0';
    bar.style.height = '4px';
    bar.style.width = '0';
    bar.style.background = 'var(--accent-color, #3b82f6)';
    bar.style.zIndex = '3000';
    bar.style.transition = 'width 0.2s';
    document.body.appendChild(bar);
}
createScrollProgress();

// ========== Dark/Light Mode Toggle ==========
function createThemeToggle() {
    const btn = document.createElement('button');
    btn.id = 'theme-toggle';
    btn.innerHTML = '🌙';
    btn.title = 'Toggle Dark/Light Mode';
    btn.style.position = 'fixed';
    btn.style.top = '24px';
    btn.style.right = '32px';
    btn.style.zIndex = '2000';
    btn.style.background = 'none';
    btn.style.border = 'none';
    btn.style.fontSize = '1.5rem';
    btn.style.cursor = 'pointer';
    btn.setAttribute('aria-label', 'Toggle Dark/Light Mode');
    btn.onclick = () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        btn.innerHTML = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    };
    document.body.appendChild(btn);
    // Set initial theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
        btn.innerHTML = '☀️';
    }
}
createThemeToggle();

// ========== Accent Color Picker ==========
function createAccentColorPicker() {
    const input = document.createElement('input');
    input.type = 'color';
    input.id = 'accent-color-picker';
    input.value = localStorage.getItem('accentColor') || '#3b82f6';
    input.title = 'Pick Accent Color';
    input.style.position = 'fixed';
    input.style.top = '64px';
    input.style.right = '32px';
    input.style.zIndex = '2000';
    input.style.width = '32px';
    input.style.height = '32px';
    input.style.border = 'none';
    input.style.background = 'none';
    input.style.cursor = 'pointer';
    input.setAttribute('aria-label', 'Pick Accent Color');
    input.oninput = (e) => {
        document.documentElement.style.setProperty('--accent-color', e.target.value);
        localStorage.setItem('accentColor', e.target.value);
    };
    document.body.appendChild(input);
    // Set initial accent color
    document.documentElement.style.setProperty('--accent-color', input.value);
}
createAccentColorPicker();
// ========== End of Enhancements ==========

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero-section');
    if (hero) {
        const scrollY = window.scrollY;
        hero.style.transform = `translateY(${scrollY * 0.18}px)`;
    }
});

// ========== GitHub Projects Section ==========
// To enable, set your GitHub username below:
const GITHUB_USERNAME = '';

function fetchAndDisplayGitHubProjects() {
    if (!GITHUB_USERNAME) return;
    const container = document.getElementById('github-carousel');
    if (!container) return;
    container.innerHTML = '<p>Loading projects...</p>';
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=10`)
        .then(res => res.json())
        .then(repos => {
            if (!Array.isArray(repos) || repos.length === 0) {
                container.innerHTML = '<p>No public repositories found.</p>';
                return;
            }
            container.innerHTML = '';
            repos.forEach((repo, i) => {
                const card = document.createElement('div');
                card.className = 'github-card fade-in scale-up';
                card.style.transitionDelay = `${i * 100}ms`;
                card.innerHTML = `
                    <h4><a href="${repo.html_url}" target="_blank" rel="noopener">${repo.name}</a></h4>
                    <p>${repo.description ? repo.description : 'No description.'}</p>
                    <div class="github-meta">
                        <span>${repo.language ? repo.language : ''}</span>
                        <span>★ ${repo.stargazers_count}</span>
                    </div>
                `;
                container.appendChild(card);
            });
        })
        .catch(() => {
            container.innerHTML = '<p>Failed to load GitHub projects.</p>';
        });
}
fetchAndDisplayGitHubProjects();

// Carousel arrow navigation
function setupCarouselArrows() {
    const carousel = document.getElementById('github-carousel');
    const left = document.querySelector('.carousel-arrow.left');
    const right = document.querySelector('.carousel-arrow.right');
    if (!carousel || !left || !right) return;
    left.onclick = () => {
        carousel.scrollBy({ left: -carousel.offsetWidth * 0.8, behavior: 'smooth' });
    };
    right.onclick = () => {
        carousel.scrollBy({ left: carousel.offsetWidth * 0.8, behavior: 'smooth' });
    };
}
setupCarouselArrows();
