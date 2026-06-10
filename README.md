# Nguyen Thai Ngoc — Security Portfolio

This repository contains my personal cybersecurity portfolio website.

Main website: `https://tngoc1810.github.io`

## Purpose

This portfolio is used to document my cybersecurity learning journey and practical work, especially:

- SOC investigations
- Blue Team labs
- DFIR writeups
- Network forensics
- Malware traffic analysis
- CTF writeups
- Certificates and achievements
- Future detection engineering and SOC projects

## Main Website Sections

| Section | Path | Purpose |
|---|---|---|
| Home | `index.html` | Main landing page and featured highlights |
| Writeups | `writeups/index.html` | Library of SOC, CTF, DFIR and Blue Team writeups |
| Projects | `projects/index.html` | Practical security projects and planned project areas |
| Achievements | `achievements/index.html` | Certificates, CTF milestones and learning progress |
| Contact | `contact/index.html` | Email, LinkedIn and contact information |
| Assets | `assets/` | CSS, JavaScript, images, media and portfolio files |

## Repository Management Files

These files are for maintaining the portfolio and do not change the website design:

| File / Folder | Purpose |
|---|---|
| `_docs/CONTENT_INDEX.md` | Quick index of current portfolio content |
| `_docs/ADDING_NEW_WRITEUP.md` | Step-by-step checklist for adding new writeups |
| `_docs/REPO_STRUCTURE.md` | Explanation of the repository structure |
| `_templates/WRITEUP_TEMPLATE.md` | Template for future writeups |
| `_templates/INCIDENT_REPORT_TEMPLATE.md` | Template for SOC-style incident reports |

## Rules for Future Updates

To keep the repo clean:

1. Do not move existing pages unless all links are updated.
2. Keep writeups under `writeups/`.
3. Keep certificates and achievement pages under `achievements/`.
4. Keep screenshots and media under `assets/`.
5. Add each new writeup to `writeups/index.html`.
6. Add important work to the homepage only after it is polished.
7. Use clear folder names with lowercase words and hyphens.

Recommended folder naming:

```txt
writeups/platform-or-category/writeup-name/index.html
```

Examples:

```txt
writeups/tryhackme/boogeyman-3/index.html
writeups/htb/brutus/index.html
writeups/soc/compromised-wordpress-log-analysis/index.html
```

## Current Priority

The portfolio already has strong writeups. The next improvements should focus on:

1. A Wazuh SOC Home Lab project.
2. Sigma / SPL / YARA detection rules.
3. SOC incident report PDFs.
4. Better project documentation.
5. A downloadable SOC Intern CV.
