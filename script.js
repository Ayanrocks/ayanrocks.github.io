/**
 * AYANROCKS // PORTFOLIO SCRIPT
 * Brutalist / Atmospheric aesthetic logic.
 */

// --- CONFIGURATION & CONSTANTS ---
const APP_COLORS = {
    particleFill: '#ffffff',
    particleCore: 0x222222,
    particleHighlight: 0x444444,
    errorText: 'red'
};

gsap.registerPlugin(ScrollTrigger, window.ScrollToPlugin);

// --- Theme Handling & Page Transitions ---
const transitionBars = document.querySelectorAll('.transition-bars .bar');

function applyTheme() {
    const theme = localStorage.getItem('theme');
    document.documentElement.classList.remove('dark-theme', 'light-theme');
    if (theme) {
        document.documentElement.classList.add(theme);
        // Only if body has it from old localstorage structure, clean it up
        document.body.classList.remove('dark-theme', 'light-theme');
    }
}
applyTheme();

function revealPage() {
    if (transitionBars.length > 0) {
        gsap.to(transitionBars, {
            scaleY: 0,
            transformOrigin: "bottom",
            duration: 1,
            stagger: 0.1,
            ease: "power4.inOut"
        });
    }
}

// Initial load reveal
revealPage();

// Handle Back/Forward Cache effectively
window.addEventListener('pageshow', (event) => {
    applyTheme();
    if (event.persisted) {
        revealPage();

        // Ensure cursor state is reset on back
        const cursor = document.querySelector('.cursor');
        if (cursor) {
            cursor.classList.remove('hover');
            cursor.classList.add('initial-scroll');
            window.initialInteractionStarted = false;
        }
    }
});

// Sync theme changes universally across tabs
window.addEventListener('storage', (e) => {
    if (e.key === 'theme') {
        applyTheme();
    }
});

if (transitionBars.length > 0) {
    // Intercept navigation links using event delegation for dynamic elements
    document.body.addEventListener('click', e => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');

        // Check if it's an internal link and not just a hash
        if (href && !href.startsWith('http') && !href.startsWith('#') && link.target !== '_blank') {
            e.preventDefault();
            const targetUrl = link.href;

            // Animate bars down to cover the screen
            gsap.set(transitionBars, { transformOrigin: "top", scaleY: 0 });
            gsap.to(transitionBars, {
                scaleY: 1,
                duration: 0.8,
                stagger: 0.1,
                ease: "power4.inOut",
                onComplete: () => {
                    window.location.href = targetUrl;
                }
            });
        } else if (href && href.startsWith('#') && href.length > 1) {
            // Smooth scroll for internal links
            e.preventDefault();
            const target = document.querySelector(href);
            if (target && window.ScrollToPlugin) {
                gsap.to(window, {
                    duration: 1,
                    scrollTo: { y: target, offsetY: 80, autoKill: false },
                    ease: "power3.inOut"
                });
            }
        }
    });
}

// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', async (e) => {
        const toggleThemeLogic = () => {
            document.documentElement.classList.toggle('dark-theme');
            let theme = 'light-theme';
            if (document.documentElement.classList.contains('dark-theme')) {
                theme = 'dark-theme';
            }
            localStorage.setItem('theme', theme);
        };

        if (!document.startViewTransition) {
            toggleThemeLogic();
            return;
        }

        const x = e.clientX || window.innerWidth / 2;
        const y = e.clientY || window.innerHeight / 2;

        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        const transition = document.startViewTransition(() => {
            toggleThemeLogic();
        });

        await transition.ready;

        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${endRadius}px at ${x}px ${y}px)`
                ]
            },
            {
                duration: 800,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-new(root)'
            }
        );
    });
}

// --- Custom Mouse Pointer ---
const cursor = document.querySelector('.cursor');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let cursorX = mouseX, cursorY = mouseY;
window.initialInteractionStarted = false;

if (cursor) {
    // Show 'SCROLL' prominently upon entry
    cursor.classList.add('initial-scroll');

    const removeInitialScroll = () => {
        if (!window.initialInteractionStarted) {
            window.initialInteractionStarted = true;
            cursor.classList.remove('initial-scroll');
        }
    };

    let lastX = null;
    let lastY = null;

    document.addEventListener('mousemove', (e) => {
        if (lastX !== null && lastY !== null) {
            // Only count as an interaction if the mouse actually moved significantly
            // This prevents an immediate false-positive interaction on page load
            if (Math.hypot(e.clientX - lastX, e.clientY - lastY) > 5) {
                removeInitialScroll();
            }
        }
        lastX = e.clientX;
        lastY = e.clientY;
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Listen for direct user interaction rather than 'scroll' to avoid 
    // the browser's automated scroll restoration from immediately hiding the prompt.
    const interactionEvents = ['wheel', 'touchmove', 'keydown', 'mousedown'];
    interactionEvents.forEach(evt => {
        window.addEventListener(evt, removeInitialScroll, { passive: true });
    });

    // Smooth lerp for cursor
    gsap.ticker.add(() => {
        cursorX += (mouseX - cursorX) * 0.2;
        cursorY += (mouseY - cursorY) * 0.2;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
    });

    // Handle hover states for links dynamically
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest('.hover-link') || e.target.tagName.toLowerCase() === 'a' || e.target.tagName.toLowerCase() === 'button') {
            cursor.classList.add('hover');
        } else {
            cursor.classList.remove('hover');
        }
    });
}

// --- Set Copyright Year ---
const yearElems = document.querySelectorAll('.year');
const currentYear = new Date().getFullYear();
yearElems.forEach(elem => elem.textContent = currentYear);

// --- Massive Parallax Text ---
const massiveTexts = document.querySelectorAll('.massive-text');
massiveTexts.forEach(text => {
    const speed = parseFloat(text.getAttribute('data-speed')) || 0.5;
    gsap.to(text, {
        y: (i, target) => -ScrollTrigger.maxScroll(window) * speed,
        ease: "none",
        scrollTrigger: {
            trigger: text.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
        }
    });
});

// --- GitHub Projects Fetch ---
const projectsList = document.getElementById('projects-list');
const username = 'Ayanrocks';
const orderedProjects = ['better-leetcode', 'mneme', 'DataSQuirreL', 'setup', 'PrismPlay'];

const fallbackData = {
    'better-leetcode': {
        name: 'better-leetcode',
        description: 'Better Leetcode extension for vscode to solve your everyday leetcode problems in vscode itself',
        language: 'TypeScript',
        stargazers_count: 1
    },
    'mneme': {
        name: 'mneme',
        description: 'A clean, minimal CLI-based typing speed tester with real-time analytics and wpm history.',
        language: 'Go',
        stargazers_count: 10
    },
    'DataSQuirreL': {
        name: 'DataSQuirreL',
        description: 'Lightweight database migration and seeding assistant tailored for PostgreSQL environments.',
        language: 'Go',
        stargazers_count: 12
    },
    'PrismPlay': {
        name: 'PrismPlay',
        description: 'Interactive shader playground and canvas webgl playground for audio-visualizer logic.',
        language: 'JavaScript',
        stargazers_count: 8
    }
};

async function fetchGitHubProjects() {
    if (!projectsList) return;

    try {
        let repos = [];
        try {
            const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
            if (response.ok) {
                repos = await response.json();
            }
        } catch (e) {
            console.error('Failed to fetch repositories, using fallbacks', e);
        }

        projectsList.innerHTML = '';

        orderedProjects.forEach((projName, index) => {
            const numStr = (index + 1).toString().padStart(2, '0');
            const card = document.createElement('a');
            card.className = 'project-row hover-link';
            card.target = '_self';

            if (projName === 'setup') {
                card.href = 'setup.html';
                card.innerHTML = `
                    <div>
                        <span class="project-lang" style="margin-bottom: 0.5rem; display: block;">NO. ${numStr} // SYS</span>
                        <h3 class="project-name">setup <i class="ri-arrow-right-up-line"></i></h3>
                    </div>
                    <div class="project-meta">
                        <p class="project-desc">Personalized development setup featuring curated coding fonts, terminal settings, and custom IDE configurations.</p>
                        <span class="project-lang">STATUS [ ACTIVE ]</span>
                    </div>
                `;
            } else {
                const repo = repos.find(r => r.name.toLowerCase() === projName.toLowerCase()) || fallbackData[projName];
                const displayName = repo ? repo.name : projName;
                const desc = repo ? repo.description : 'INTERNAL SYSTEMS DATA ARCHIVE. REDACTED.';
                const lang = repo ? repo.language : 'SYS';
                const stars = repo ? repo.stargazers_count : 0;
                
                card.href = `project.html?repo=${displayName}`;
                card.innerHTML = `
                    <div>
                        <span class="project-lang" style="margin-bottom: 0.5rem; display: block;">NO. ${numStr} // ${lang || 'SYS'}</span>
                        <h3 class="project-name">${displayName} <i class="ri-arrow-right-up-line"></i></h3>
                    </div>
                    <div class="project-meta">
                        <p class="project-desc">${desc || 'INTERNAL SYSTEMS DATA ARCHIVE. REDACTED.'}</p>
                        <span class="project-lang">STARS [ ${stars} ]</span>
                    </div>
                `;
            }

            projectsList.appendChild(card);
        });

        // Initialize GSAP reveals for rows
        gsap.utils.toArray('.project-row').forEach(row => {
            gsap.from(row, {
                scrollTrigger: {
                    trigger: row,
                    start: 'top 90%',
                },
                y: 50,
                opacity: 0,
                duration: 1,
                ease: 'power3.out'
            });
        });

    } catch (error) {
        console.error('Error rendering projects:', error);
        projectsList.innerHTML = `<div style="color: ${APP_COLORS.errorText}; padding: 2rem 0;">ERROR: FAILED TO PARSE ARCHIVES.</div>`;
    } finally {
        ScrollTrigger.refresh();
    }
}

fetchGitHubProjects();


// --- GitHub Skills Fetch ---
const skillsList = document.getElementById('skills-list');

async function fetchGitHubSkills() {
    if (!skillsList) return;

    try {
        const response = await fetch(`https://raw.githubusercontent.com/Ayanrocks/Ayanrocks/master/README.md`);
        if (!response.ok) throw new Error('Failed to fetch README');

        const textStr = await response.text();
        
        const match = textStr.match(/skillicons\.dev\/icons\?i=([a-zA-Z0-9,\-_]+)/);
        
        if (match && match[1]) {
            const skills = match[1].split(',');
            skillsList.innerHTML = '';
            skills.forEach(skill => {
                const skillBadge = document.createElement('div');
                skillBadge.style.padding = '0.5rem 1.25rem 0.5rem 0.5rem';
                skillBadge.style.border = '1px solid var(--border-color)';
                skillBadge.style.color = 'var(--text-main)';
                skillBadge.style.textTransform = 'uppercase';
                skillBadge.style.letterSpacing = '2px';
                skillBadge.style.fontSize = '0.8rem';
                skillBadge.style.display = 'flex';
                skillBadge.style.alignItems = 'center';
                skillBadge.style.gap = '0.75rem';
                skillBadge.style.borderRadius = '30px';
                skillBadge.style.background = 'rgba(255, 255, 255, 0.02)';

                const iconUrl = `https://skillicons.dev/icons?i=${skill}`;
                
                skillBadge.innerHTML = `
                    <div style="width: 30px; height: 30px; border-radius: 50%; overflow: hidden; display: flex; align-items: center; justify-content: center; background: #fff;">
                        <img src="${iconUrl}" alt="${skill}" style="width: 100%; height: 100%; object-fit: cover;" />
                    </div>
                    <span>${skill}</span>
                `;
                skillsList.appendChild(skillBadge);
            });
            
            // GSAP reveal for skills
            gsap.from(skillsList.children, {
                scrollTrigger: {
                    trigger: skillsList,
                    start: 'top 90%'
                },
                y: 20,
                opacity: 0,
                duration: 0.5,
                stagger: 0.05,
                ease: 'power3.out'
            });
            
        } else {
            skillsList.innerHTML = `<div style="color: var(--text-muted); padding: 2rem 0;">NO SKILLS FOUND IN ARCHIVE.</div>`;
        }
    } catch (error) {
        console.error('Error fetching GitHub skills:', error);
        skillsList.innerHTML = `<div style="color: var(--color-mint); padding: 2rem 0;">ERROR: FAILED TO EXTRACT SKILLS.</div>`;
    } finally {
        ScrollTrigger.refresh();
    }
}

fetchGitHubSkills();


// --- Three.js 3D Background Module ---
const Background3DModule = {
    canvasId: 'webgl-canvas',
    scene: null,
    camera: null,
    renderer: null,
    group: null,
    particles2: null,
    clock: null,
    targetX: 0,
    targetY: 0,
    scrollY: 0,

    init() {
        const canvas = document.getElementById(this.canvasId);
        if (!canvas || !window.THREE) return;

        this.setupScene(canvas);
        this.createParticles();
        this.addEventListeners();

        this.clock = new THREE.Clock();
        this.animate();
    },

    setupScene(canvas) {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            alpha: true,
            antialias: true
        });

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    },

    createCircleTexture() {
        const circleCanvas = document.createElement('canvas');
        circleCanvas.width = 32;
        circleCanvas.height = 32;
        const ctx = circleCanvas.getContext('2d');
        ctx.beginPath();
        ctx.arc(16, 16, 15, 0, 2 * Math.PI);
        ctx.fillStyle = APP_COLORS.particleFill;
        ctx.fill();
        return new THREE.CanvasTexture(circleCanvas);
    },

    createParticleLayer(count, radiusMax, materialParams) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];

        for (let i = 0; i < count; i++) {
            const radius = radiusMax * Math.cbrt(Math.random());
            const theta = Math.random() * 2 * Math.PI;
            const phi = Math.acos(2 * Math.random() - 1);
            vertices.push(
                radius * Math.sin(phi) * Math.cos(theta),
                radius * Math.sin(phi) * Math.sin(theta),
                radius * Math.cos(phi)
            );
        }

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const material = new THREE.PointsMaterial(materialParams);
        return new THREE.Points(geometry, material);
    },

    createParticles() {
        const circleTexture = this.createCircleTexture();

        // 1. Core Particles
        const particles1 = this.createParticleLayer(200, 30, {
            color: APP_COLORS.particleCore,
            size: 0.15,
            map: circleTexture,
            transparent: true,
            alphaTest: 0.01,
            opacity: 0.6,
            sizeAttenuation: true
        });

        // 2. Highlight Particles
        this.particles2 = this.createParticleLayer(50, 25, {
            color: APP_COLORS.particleHighlight,
            size: 0.25,
            map: circleTexture,
            transparent: true,
            alphaTest: 0.01,
            opacity: 0.8,
            sizeAttenuation: true
        });

        this.group = new THREE.Group();
        this.group.add(particles1);
        this.group.add(this.particles2);

        // Position it centrally
        this.group.position.set(0, 0, -10);
        this.scene.add(this.group);
    },

    addEventListeners() {
        const windowHalfX = window.innerWidth / 2;
        const windowHalfY = window.innerHeight / 2;

        document.addEventListener('mousemove', (event) => {
            // Subtle translation extent for parallax instead of rotation
            this.targetX = (event.clientX - windowHalfX) * 0.002;
            this.targetY = (event.clientY - windowHalfY) * 0.002;
        });

        window.addEventListener('scroll', () => {
            this.scrollY = window.scrollY;
        });

        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    },

    animate() {
        requestAnimationFrame(() => this.animate());

        const elapsedTime = this.clock.getElapsedTime();

        // Reverted to original auto-rotation speed
        this.group.rotation.y = elapsedTime * 0.05;
        this.group.rotation.x = elapsedTime * 0.02;

        // Subtle floating movement
        this.particles2.position.y = Math.sin(elapsedTime * 0.5) * 0.5;

        // Parallax addition (moves the camera sideways smoothly based on mouse)
        // We remove 'camera.lookAt(scene.position)' to avoid the "spinning" illusion when 
        // the camera revolves around the origin. Now it's just a clean, uniform translation.
        this.camera.position.x += (this.targetX - this.camera.position.x) * 0.02;
        this.camera.position.y += (-this.targetY - this.camera.position.y) * 0.02;

        // Scroll influence (tumbles the cloud as you scroll)
        this.group.rotation.z = this.scrollY * 0.0005;

        this.renderer.render(this.scene, this.camera);
    }
};

// Initialize the updated 3D background module
Background3DModule.init();
