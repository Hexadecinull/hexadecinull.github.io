const root = document.body;
const themeToggle = document.getElementById('theme-toggle');
const themeIcon = document.getElementById('theme-icon');

function setTheme(mode) {
    if (mode === "light") {
        root.classList.add('light');
        if (themeIcon) {
            themeIcon.classList.remove('fa-moon');
            themeIcon.classList.add('fa-sun');
        }
        localStorage.setItem('theme', 'light');
    } else {
        root.classList.remove('light');
        if (themeIcon) {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-moon');
        }
        localStorage.setItem('theme', 'dark');
    }
}

function toggleTheme() {
    if (root.classList.contains('light')) {
        setTheme('dark');
    } else {
        setTheme('light');
    }
}

if (themeToggle) themeToggle.addEventListener('click', toggleTheme);

(function() {
    const pref = localStorage.getItem('theme') ||
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(pref);
})();

document.addEventListener("DOMContentLoaded", function() {
    const audio = document.getElementById('bg-audio');
    const musicToggle = document.getElementById('music-toggle');
    const musicIcon = document.getElementById('music-icon');

    if (musicToggle && audio) {
        audio.volume = 0.2;
        musicToggle.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                musicIcon.classList.replace('fa-play', 'fa-pause');
            } else {
                audio.pause();
                musicIcon.classList.replace('fa-pause', 'fa-play');
            }
        });
    }
});

const MANUAL_SITES = [
];

function loadManualSites() {
    try {
        return Array.isArray(MANUAL_SITES) ? MANUAL_SITES.slice() : [];
    } catch (e) {
        console.error('Failed to load manual sites', e);
        return [];
    }
}

function makeCard(title, descText, metaHtml, actions = []) {
    const card = document.createElement('div');
    card.className = 'repo-card';

    const titleEl = document.createElement('div');
    titleEl.className = 'repo-title';
    titleEl.textContent = title;
    card.appendChild(titleEl);

    const desc = document.createElement('div');
    desc.className = 'repo-desc';
    desc.textContent = descText || '';
    card.appendChild(desc);

    if (metaHtml && metaHtml.line) {
        const meta = document.createElement('div');
        meta.className = 'repo-meta';
        meta.innerHTML = metaHtml.line;
        card.appendChild(meta);
    }

    if (actions && actions.length) {
        const actionWrap = document.createElement('div');
        actionWrap.style.display = 'flex';
        actionWrap.style.gap = '0.6rem';
        actionWrap.style.flexWrap = 'wrap';
        actions.forEach(a => {
            const btn = document.createElement('a');
            btn.className = 'repo-link';
            btn.href = a.href;
            btn.target = '_blank';
            btn.rel = 'noopener noreferrer';
            btn.textContent = a.label || 'Visit Website';
            actionWrap.appendChild(btn);
        });
        card.appendChild(actionWrap);
    }

    return card;
}

const GITHUB_ORG = 'Hexadecinull';

async function fetchReposAndRender() {
    const container = document.getElementById('repo-list');
    const countEl = document.getElementById('repo-count');
    if (!container) return;
    container.innerHTML = '<div class="repo-card">Loading repositories...</div>';
    try {
        const res = await fetch(`https://api.github.com/orgs/${GITHUB_ORG}/repos?per_page=200&sort=updated`);
        if (!res.ok) throw new Error('GitHub API error');
        const data = await res.json();
        const repos = Array.isArray(data) ? data.filter(r => !r.fork) : [];
        repos.sort((a, b) => b.stargazers_count - a.stargazers_count);

        container.innerHTML = '';
        repos.forEach(repo => {
            const metaLine = `<span title="Stars"><i class="fa-solid fa-star"></i> ${repo.stargazers_count}</span>
                              <span title="Language">${repo.language || 'N/A'}</span>`;
            const actions = [{ href: repo.html_url, label: 'View on GitHub' }];
            if (repo.has_pages || repo.homepage) {
                const siteUrl = repo.homepage || `https://${GITHUB_ORG}.github.io/${repo.name}/`;
                actions.push({ href: siteUrl, label: 'Visit Website' });
            }
            container.appendChild(makeCard(repo.name, repo.description, { line: metaLine }, actions));
        });

        if (countEl) countEl.textContent = `(${repos.length})`;
    } catch (e) {
        container.innerHTML = '<div class="repo-card">Could not load repositories.</div>';
    }
}

async function fetchWebsitesAndRender() {
    const container = document.getElementById('websites-list');
    const countEl = document.getElementById('websites-count');
    if (!container) return;

    const manual = loadManualSites();
    if (manual.length === 0) {
        container.innerHTML = '<div class="repo-card">No external websites listed.</div>';
        if (countEl) countEl.textContent = '(0)';
        return;
    }

    container.innerHTML = '';
    manual.forEach(item => {
        const actions = item.url ? [{ href: item.url, label: 'Visit Website' }] : [];
        container.appendChild(makeCard(item.name, item.description, null, actions));
    });
    if (countEl) countEl.textContent = `(${manual.length})`;
}

document.addEventListener('DOMContentLoaded', () => {
    fetchReposAndRender();
    fetchWebsitesAndRender();
});
