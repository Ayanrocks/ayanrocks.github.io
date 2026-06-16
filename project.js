document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const repoName = urlParams.get('repo');

    if (!repoName) {
        document.getElementById('project-title').textContent = "NO REPOSITORY SPECIFIED.";
        return;
    }

    const username = 'Ayanrocks';

    // UI Elements
    const titleEl = document.getElementById('project-title');
    const bgTextEl = document.getElementById('bg-repo-name');
    const descEl = document.getElementById('project-description');
    const imgEl = document.getElementById('project-image');
    const imgFallbackEl = document.getElementById('project-image-fallback');
    const visitBtn = document.getElementById('project-visit-btn');
    const githubBtn = document.getElementById('project-github-btn');
    const langEl = document.getElementById('project-lang');
    const starsEl = document.getElementById('project-stars');
    const forksEl = document.getElementById('project-forks');
    const updateEl = document.getElementById('project-update');

    try {
        // Fetch Repo Info
        const repoRes = await fetch(`https://api.github.com/repos/${username}/${repoName}`);
        if (!repoRes.ok) throw new Error("Repo fetch failed");
        const repoData = await repoRes.json();

        titleEl.textContent = repoData.name;
        bgTextEl.textContent = repoData.name;

        let homepageUrl = repoData.homepage;
        if (repoData.name.toLowerCase() === 'better-leetcode') {
            homepageUrl = "https://marketplace.visualstudio.com/items?itemName=Ayanrocks.better-leetcode";
        }

        if (homepageUrl && homepageUrl !== "") {
            visitBtn.href = homepageUrl;
            visitBtn.style.display = 'inline-block';
        } else {
            visitBtn.style.display = 'none';
        }

        githubBtn.href = repoData.html_url;
        langEl.textContent = repoData.language || "SYS";
        starsEl.textContent = repoData.stargazers_count;
        forksEl.textContent = repoData.forks_count;
        updateEl.textContent = new Date(repoData.updated_at).toLocaleDateString();

        const checkImage = (src) => new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(src);
            img.onerror = reject;
            img.src = src;
        });

        // Strategy to find a cover image:
        // 1. Local assets cover
        // 2. Repo logo.png or icon.png
        // 3. Fallback to first non-badge image in README
        
        let finalImgSrc = null;

        // 1. Check for local cover image first
        const localCoverUrl = `assets/${repoName}_cover.png`;
        try {
            finalImgSrc = await checkImage(localCoverUrl);
        } catch (e) {
            // fast fail
        }

        // 2. If no local cover, check repository for logo.png or icon.png
        if (!finalImgSrc) {
            const possibleLogos = [
                `https://raw.githubusercontent.com/${username}/${repoName}/main/logo.png`,
                `https://raw.githubusercontent.com/${username}/${repoName}/master/logo.png`,
                `https://raw.githubusercontent.com/${username}/${repoName}/main/icon.png`,
                `https://raw.githubusercontent.com/${username}/${repoName}/master/icon.png`
            ];
            
            for (const logoUrl of possibleLogos) {
                try {
                    finalImgSrc = await checkImage(logoUrl);
                    if (finalImgSrc) break;
                } catch (e) {}
            }
        }

        // Fetch README
        const readmeRes = await fetch(`https://raw.githubusercontent.com/${username}/${repoName}/master/README.md`);
        let readmeText = "";

        if (readmeRes.ok) {
            readmeText = await readmeRes.text();
        } else {
            const readmeMainRes = await fetch(`https://raw.githubusercontent.com/${username}/${repoName}/main/README.md`);
            if (readmeMainRes.ok) {
                readmeText = await readmeMainRes.text();
            }
        }

        if (readmeText) {
            // 3. Fallback to README image if still no cover found
            if (!finalImgSrc) {
                const imgRegex = /(!\[.*?\]\((.*?)\)|<img.*?src=["'](.*?)["'].*?>)/g;
                let match;
                while ((match = imgRegex.exec(readmeText)) !== null) {
                    let src = match[2] || match[3];
                    if (src) {
                        // ignore common badges
                        if (src.includes('badge') || src.includes('shields.io') || src.includes('travis-ci') || src.includes('goreportcard') || src.includes('sonarcloud')) {
                            continue;
                        }
                        if (!src.startsWith('http')) {
                            if (src.startsWith('./')) src = src.substring(2);
                            src = `https://raw.githubusercontent.com/${username}/${repoName}/main/${src}`;
                        }
                        finalImgSrc = src;
                        break;
                    }
                }
            }



            // Clean up the readme to extract nice text but keep formatting
            let cleanText = readmeText
                .replace(/!\[.*?\]\(.*?\)/g, '') // remove markdown images
                .replace(/<img[^>]*>/ig, '') // remove html images
                .replace(/<div(?:[\s\S]*?)<\/div>/ig, '') // remove layout divs/badges
                .replace(/^#\s+.*$/gm, '') // remove main h1 header (since we have the title)
                .trim();

            if (cleanText) {
                // Render the markdown using Marked.js
                descEl.innerHTML = marked.parse(cleanText);
            } else {
                descEl.textContent = repoData.description || "NO DETAILED README DESCRIPTION FOUND.";
            }
        } else {
            descEl.textContent = repoData.description || "NO README FOUND FOR THIS ARCHIVE.";
        }

        if (finalImgSrc) {
            imgEl.src = finalImgSrc;
            imgEl.style.display = 'block';
            imgFallbackEl.style.display = 'none';
        }

    } catch (err) {
        console.error(err);
        titleEl.textContent = "ERROR LOADING ARCHIVE.";
        descEl.textContent = "SYSTEM FAILURE: COULD NOT RETRIEVE REPOSITORY DATA.";
    }
});
