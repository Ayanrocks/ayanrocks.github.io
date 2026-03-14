/**
 * AYANROCKS // PORTFOLIO SCRIPT
 * Brutalist / Atmospheric aesthetic logic.
 */

gsap.registerPlugin(ScrollTrigger);

// --- Page Transitions ---
const transitionBars = document.querySelectorAll('.transition-bars .bar');
if (transitionBars.length > 0) {
    // Reveal page on load by shrinking bars upwards
    gsap.to(transitionBars, {
        scaleY: 0,
        transformOrigin: "bottom",
        duration: 1,
        stagger: 0.1,
        ease: "power4.inOut"
    });

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
        }
    });
}

// --- Theme Toggle Logic ---
const themeToggleBtn = document.getElementById('theme-toggle');
const currentTheme = localStorage.getItem('theme');

if (currentTheme) {
    document.documentElement.classList.add(currentTheme);
    document.body.classList.remove('dark-theme', 'light-theme'); // Cleanup old localstorage behavior
}

if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.documentElement.classList.toggle('dark-theme');
        let theme = 'light-theme';
        if (document.documentElement.classList.contains('dark-theme')) {
            theme = 'dark-theme';
        }
        localStorage.setItem('theme', theme);
    });
}

// --- Custom Mouse Pointer ---
const cursor = document.querySelector('.cursor');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let cursorX = mouseX, cursorY = mouseY;

if (cursor) {
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
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
const featuredRepos = ['DataSQuirreL', 'mneme', 'PrismPlay', 'my-coding-fonts', 'remix-ide', 'micro'];

async function fetchGitHubProjects() {
    if (!projectsList) return;

    try {
        const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
        if (!response.ok) throw new Error('Failed to fetch repositories');

        const repos = await response.json();

        const displayRepos = repos.filter(repo => !repo.fork || featuredRepos.includes(repo.name))
            .filter(repo => featuredRepos.includes(repo.name) || repo.stargazers_count > 0)
            .sort((a, b) => {
                const isAFeatured = featuredRepos.includes(a.name) ? 1 : 0;
                const isBFeatured = featuredRepos.includes(b.name) ? 1 : 0;
                if (isAFeatured !== isBFeatured) return isBFeatured - isAFeatured;
                return b.stargazers_count - a.stargazers_count;
            })
            .slice(0, 6);

        projectsList.innerHTML = '';

        displayRepos.forEach((repo, index) => {
            const numStr = (index + 1).toString().padStart(2, '0');
            const card = document.createElement('a');
            card.href = `project.html?repo=${repo.name}`;
            card.target = '_self';
            card.className = 'project-row hover-link';

            card.innerHTML = `
                <div>
                    <span class="project-lang" style="margin-bottom: 0.5rem; display: block;">NO. ${numStr} // ${repo.language || 'SYS'}</span>
                    <h3 class="project-name">${repo.name}</h3>
                </div>
                <div class="project-meta">
                    <p class="project-desc">${repo.description || 'INTERNAL SYSTEMS DATA ARCHIVE. REDACTED.'}</p>
                    <span class="project-lang">STARS [ ${repo.stargazers_count} ]</span>
                </div>
            `;

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
        console.error('Error fetching GitHub projects:', error);
        projectsList.innerHTML = '<div style="color: red; padding: 2rem 0;">ERROR: FAILED TO PARSE ARCHIVES.</div>';
    }
}

fetchGitHubProjects();


// --- Three.js 3D Background (Massive Central Object) ---
const canvas = document.getElementById('webgl-canvas');
if (canvas && window.THREE) {
    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create a data-flow particle system (instead of the central sun)
    const particleCount = 2000;
    const geometry = new THREE.BufferGeometry();
    const vertices = [];

    for (let i = 0; i < particleCount; i++) {
        // Spread particles across a wide volume
        const x = THREE.MathUtils.randFloatSpread(50);
        const y = THREE.MathUtils.randFloatSpread(50);
        const z = THREE.MathUtils.randFloatSpread(50);
        vertices.push(x, y, z);
    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));

    // Material 1: Blue particles
    const material1 = new THREE.PointsMaterial({
        color: 0x4059ad,
        size: 0.15,
        transparent: true,
        opacity: 0.6,
        sizeAttenuation: true
    });

    // Material 2: Yellow particles (larger, sparse)
    const material2 = new THREE.PointsMaterial({
        color: 0xF4B942,
        size: 0.3,
        transparent: true,
        opacity: 0.8,
        sizeAttenuation: true
    });

    // Create two interwoven point clouds
    const particles1 = new THREE.Points(geometry, material1);

    // Create a second geometry with fewer particles for the yellow highlights
    const geometry2 = new THREE.BufferGeometry();
    const vertices2 = [];
    for (let i = 0; i < 500; i++) {
        vertices2.push(
            THREE.MathUtils.randFloatSpread(40),
            THREE.MathUtils.randFloatSpread(40),
            THREE.MathUtils.randFloatSpread(40)
        );
    }
    geometry2.setAttribute('position', new THREE.Float32BufferAttribute(vertices2, 3));
    const particles2 = new THREE.Points(geometry2, material2);

    const group = new THREE.Group();
    group.add(particles1);
    group.add(particles2);

    // Position it centrally
    group.position.set(0, 0, -10);
    scene.add(group);

    // Parallax logic
    let targetX = 0;
    let targetY = 0;
    const windowHalfX = window.innerWidth / 2;
    const windowHalfY = window.innerHeight / 2;

    document.addEventListener('mousemove', (event) => {
        targetX = (event.clientX - windowHalfX) * 0.001;
        targetY = (event.clientY - windowHalfY) * 0.001;
    });

    // Scroll Logic tied to 3D object rotation
    let scrollY = 0;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // Constant slow rotation of the point cloud
        group.rotation.y = elapsedTime * 0.05;
        group.rotation.x = elapsedTime * 0.02;

        // Subtle floating movement
        particles2.position.y = Math.sin(elapsedTime * 0.5) * 0.5;

        // Parallax addition (moves the camera slightly based on mouse)
        camera.position.x += (targetX - camera.position.x) * 0.05;
        camera.position.y += (-targetY - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        // Scroll influence (tumbles the cloud as you scroll)
        group.rotation.z = scrollY * 0.0005;

        renderer.render(scene, camera);
    }

    animate();

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}
