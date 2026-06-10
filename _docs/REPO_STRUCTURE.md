# Repository Structure

This document explains how the portfolio repository is organized.

The goal is to keep the website easy to maintain without changing the current design or breaking existing links.

## Top-Level Structure

```txt
tngoc1810.github.io/
├── index.html
├── writeups/
├── projects/
├── achievements/
├── contact/
├── assets/
├── _docs/
└── _templates/
```

## Folder Meaning

### `index.html`

The main homepage of the portfolio.

Use it for:

- Short introduction
- Current focus
- Featured writeups
- Featured projects
- Important links

Avoid putting too many items here. Only add polished and important work.

---

### `writeups/`

This folder contains published writeups.

Recommended organization:

```txt
writeups/
├── index.html
├── tryhackme/
├── htb/
├── soc/
├── ctf/
└── platform-or-topic-name/
```

Use this folder for:

- TryHackMe SOC rooms
- CyberDefenders labs
- BTLO labs
- HackTheBox Sherlocks
- CTF writeups
- DFIR notes
- Malware traffic analysis

Recommended future path style:

```txt
writeups/platform/writeup-name/index.html
```

Examples:

```txt
writeups/tryhackme/boogeyman-3/index.html
writeups/htb/brutus/index.html
writeups/soc/compromised-wordpress-log-analysis/index.html
```

---

### `projects/`

This folder contains security projects.

Use it for:

- Wazuh SOC Home Lab
- Detection engineering lab
- IOC enrichment toolkit
- Log parsing utilities
- SOC playbooks
- Malware triage workflow

Recommended future structure:

```txt
projects/
├── index.html
├── wazuh-soc-home-lab/
├── detection-engineering-lab/
├── soc-playbooks/
└── log-parsing-utilities/
```

---

### `achievements/`

This folder contains certificates, learning milestones and CTF achievements.

Use it for:

- TryHackMe certificates
- Splunk certificates
- Blue Team certificates
- CTF rankings
- Course completions

---

### `contact/`

This folder contains the contact page.

Use it for:

- Email
- LinkedIn
- GitHub
- CyberDefenders profile
- Blue Team Labs profile

---

### `assets/`

This folder contains static files used by the website.

Recommended organization:

```txt
assets/
├── css/
├── js/
├── images/
├── media/
└── files/
```

Use it for:

- CSS files
- JavaScript files
- Screenshots
- Avatar and images
- PDFs
- CV files

Do not rename or move existing assets unless all HTML references are updated.

---

### `_docs/`

Internal documentation for maintaining the repo.

This folder is not part of the main website navigation.

Use it for:

- Repo structure notes
- Content index
- Update checklist
- Future planning

---

### `_templates/`

Templates for future content.

Use it for:

- SOC writeup template
- Incident report template
- Detection rule documentation template
- Project README template

## Rules to Avoid Breaking the Website

1. Do not move existing HTML pages without updating every link.
2. Do not rename image folders without updating every image path.
3. Keep URLs stable after publishing.
4. Use lowercase folder names.
5. Use hyphens instead of spaces.
6. Keep each major writeup inside its own folder.
7. Add new writeup cards to `writeups/index.html`.
8. Add only the best writeups to the homepage.

## Recommended Naming Style

Good:

```txt
boogeyman-3
network-analysis-malware-compromise
compromised-wordpress-log-analysis
wazuh-soc-home-lab
```

Avoid:

```txt
Boogeyman 3
new writeup final
lab1
abc
```
