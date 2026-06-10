# Adding a New Writeup

Use this checklist whenever you add a new writeup to the portfolio.

The goal is to keep future writeups consistent, easy to find and easy to maintain.

## 1. Choose the Correct Folder

Use one of these patterns:

```txt
writeups/tryhackme/writeup-name/index.html
writeups/htb/writeup-name/index.html
writeups/soc/writeup-name/index.html
writeups/ctf/platform/writeup-name/index.html
writeups/writeup-name/index.html
```

Recommended examples:

```txt
writeups/tryhackme/boogeyman-3/index.html
writeups/htb/brutus/index.html
writeups/soc/compromised-wordpress-log-analysis/index.html
writeups/cyberdefenders/hawkeye/index.html
```

## 2. Use a Clear Slug

Good slugs:

```txt
boogeyman-3
hawkeye-keylogger-exfiltration
compromised-wordpress-log-analysis
network-analysis-malware-compromise
```

Avoid:

```txt
lab1
newwriteup
final-final
abc
```

## 3. Screenshot Location

Store screenshots under:

```txt
assets/images/writeups/platform/writeup-name/
```

Example:

```txt
assets/images/writeups/tryhackme/boogeyman-3/01-alert-overview.png
assets/images/writeups/tryhackme/boogeyman-3/02-process-tree.png
assets/images/writeups/tryhackme/boogeyman-3/03-network-connection.png
```

Use numbered screenshots so the order is clear.

## 4. Recommended SOC Writeup Sections

For SOC / Blue Team writeups, use this structure:

```txt
Overview
Scenario / Alert Context
Tools Used
Methodology
Timeline
Technical Analysis
MITRE ATT&CK Mapping
Indicators of Compromise
Impact Assessment
Recommended Remediation
Lessons Learned
Conclusion
```

## 5. Add the Writeup Card

After publishing the writeup page, add a card to:

```txt
writeups/index.html
```

The card should include:

- Platform
- Category
- Year
- Short description
- 3 tags
- Search keywords in `data-category` and `data-text`

## 6. Add to Homepage Only If Strong

Only add the writeup to `index.html` if it is polished and useful for recruiters.

Good homepage candidates:

- Full SOC investigation
- Malware traffic analysis
- Phishing investigation
- Web compromise investigation
- SIEM / detection engineering case

Avoid adding every small CTF solve to the homepage.

## 7. Update Content Index

After adding a writeup, update:

```txt
_docs/CONTENT_INDEX.md
```

Add the new writeup to the correct table.

## 8. Quality Checklist Before Publishing

Before publishing, check:

- [ ] Title is clear.
- [ ] Description is short and professional.
- [ ] Screenshots load correctly.
- [ ] Images do not expose private information.
- [ ] Commands and code blocks are readable.
- [ ] Timeline is included for SOC cases.
- [ ] IOC table is included when relevant.
- [ ] MITRE mapping is included when relevant.
- [ ] Lessons learned section exists.
- [ ] Links from `writeups/index.html` work.

## 9. Suggested Writing Style

Use simple English.

Write like an analyst, not like a flag hunter.

Instead of:

```txt
The answer is 192.168.1.5.
```

Write:

```txt
The suspicious source IP was 192.168.1.5. I identified it by filtering repeated failed login attempts in the authentication logs during the incident window.
```

## 10. Commit Message Style

Recommended commit messages:

```txt
Add Boogeyman 3 SOC writeup
Add HawkEye network forensics writeup
Update writeup index with new CyberDefenders lab
Add screenshots for compromised WordPress investigation
```
