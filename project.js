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

        if (repoData.homepage && repoData.homepage !== "") {
            visitBtn.href = repoData.homepage;
            visitBtn.style.display = 'inline-block';
        } else {
            visitBtn.style.display = 'none';
        }

        githubBtn.href = repoData.html_url;
        langEl.textContent = repoData.language || "SYS";
        starsEl.textContent = repoData.stargazers_count;
        forksEl.textContent = repoData.forks_count;
        updateEl.textContent = new Date(repoData.updated_at).toLocaleDateString();

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
            // Very simple markdown parsing for images and description
            // Look for first image: ![alt](url) or <img src="url">
            const imgMatch = readmeText.match(/!\[.*?\]\((.*?)\)/);
            const htmlImgMatch = readmeText.match(/<img.*?src="(.*?)".*?>/);

            let imgSrc = null;
            if (imgMatch && imgMatch[1]) {
                imgSrc = imgMatch[1];
            } else if (htmlImgMatch && htmlImgMatch[1]) {
                imgSrc = htmlImgMatch[1];
            }

            if (imgSrc) {
                // Handle relative paths for GitHub user content
                if (!imgSrc.startsWith('http')) {
                    if (imgSrc.startsWith('./')) imgSrc = imgSrc.substring(2);
                    imgSrc = `https://raw.githubusercontent.com/${username}/${repoName}/main/${imgSrc}`;
                }
                imgEl.src = imgSrc;
                imgEl.style.display = 'block';
                imgFallbackEl.style.display = 'none';
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

    } catch (err) {
        console.error(err);
        titleEl.textContent = "ERROR LOADING ARCHIVE.";
        descEl.textContent = "SYSTEM FAILURE: COULD NOT RETRIEVE REPOSITORY DATA.";
    }
});
