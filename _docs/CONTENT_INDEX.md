# Content Index

This file is a maintenance index for quickly finding and updating portfolio content.

It does not replace the website pages. It only helps keep the repository organized.

## Main Pages

| Page | Path | Status | Notes |
|---|---|---|---|
| Home | `index.html` | Active | Main landing page and current highlights |
| Writeups | `writeups/index.html` | Active | Main writeup library |
| Projects | `projects/index.html` | Active | Project roadmap / future project area |
| Achievements | `achievements/index.html` | Active | Certificates and CTF milestones |
| Contact | `contact/index.html` | Active | Email and LinkedIn |

## Featured SOC / Blue Team Writeups

| Title | Path | Platform | Topic |
|---|---|---|---|
| Boogeyman 3 | `writeups/tryhackme/boogeyman-3/` | TryHackMe | SOC, Elastic, Sysmon, DFIR |
| Tempest | `writeups/tryhackme/tempest/` | TryHackMe | Windows logs, PCAP, persistence |
| Boogeyman 2 | `writeups/tryhackme/boogeyman-2/` | TryHackMe | SOC L1, memory forensics |
| Boogeyman 1 | `writeups/tryhackme/boogeyman-1/` | TryHackMe | SOC, PCAP, endpoint evidence |
| Shadow Trace | `writeups/tryhackme/shadow-trace/` | TryHackMe | Malware triage |
| HTB Reaper | `writeups/htb/reaper/` | HackTheBox | Windows authentication, EVTX, PCAP |
| HTB Brutus | `writeups/htb/brutus/` | HackTheBox | Linux auth.log, SSH investigation |
| HTB Unit42 | `writeups/htb/unit42/` | HackTheBox | Sysmon, malware investigation |
| HTB BFT | `writeups/htb/bft/` | HackTheBox | NTFS / MFT forensics |
| HawkEye | `writeups/hawkeye/` | CyberDefenders | PCAP, SMTP, exfiltration |
| Web Investigation Lab | `writeups/web-investigation/` | CyberDefenders | Web attack, credential compromise |
| Tomcat Takeover | `writeups/tomcat-takeover/` | CyberDefenders | Tomcat, PCAP, persistence |
| PhishStrike | `writeups/phishstrike/` | CyberDefenders | Phishing, threat intel |
| Network Analysis Malware Compromise | `writeups/network-analysis-malware-compromise/` | BTLO | Malware traffic analysis |
| Compromised WordPress | `writeups/soc/compromised-wordpress-log-analysis/` | BTLO | Apache logs, web shell |

## CTF / Reverse Writeups

| Title | Path | Platform | Topic |
|---|---|---|---|
| no no | `writeups/no-no/` | KMACTF | .NET reverse |
| Misk Nocturne Engine | `writeups/ctf/0xv01d/misk-nocturne-engine/` | 0xV01D | Reverse, state machine |
| Misk Automaton | `writeups/ctf/0xv01d/misk-automaton/` | 0xV01D | PE reverse, automaton |
| 0xV01D CTF Writeups | `writeups/ctf/0xv01d-ctf-writeups/` | 0xV01D | Team CTF hub |
| TJCTF Team Writeups | `writeups/ctf/tjctf-team-writeups/` | TJCTF | Team CTF hub |

## Achievements

| Title | Path | Type |
|---|---|---|
| TryHackMe SOC Level 1 | `achievements/tryhackme-soc-level-1/` | Certificate |
| Security Operations and the Defense Analyst | `achievements/security-operations-defense-analyst/` | Certificate |
| Intro to Splunk | `achievements/intro-to-splunk/` | Certificate |
| Blue Team Junior Analyst | `achievements/blue-team-junior-analyst/` | Certificate |
| TJCTF 2026 Certificate | `tjctf-2026-certificate.pdf` | CTF Certificate |
| 0xV01D CTF | `writeups/ctf/0xv01d-ctf-writeups/` | CTF Ranking / Writeups |

## Future Project Slots

Use these paths when creating real projects later.

| Project | Recommended Path | Status |
|---|---|---|
| Wazuh SOC Home Lab | `projects/wazuh-soc-home-lab/` | Planned |
| Detection Engineering Lab | `projects/detection-engineering-lab/` | Planned |
| SOC Investigation Playbooks | `projects/soc-playbooks/` | Planned |
| IOC Enrichment Toolkit | `projects/ioc-enrichment-toolkit/` | Planned |
| Log Parsing Utilities | `projects/log-parsing-utilities/` | Planned |
| Malware Triage Notes System | `projects/malware-triage-notes-system/` | Planned |

## Update Checklist

When adding a new writeup:

1. Create the writeup folder.
2. Add `index.html` inside that folder.
3. Store screenshots in `assets/images/writeups/...`.
4. Add the new card to `writeups/index.html`.
5. Add the new entry to this file.
6. Add to the homepage only if it is one of the strongest pieces.

When adding a new project:

1. Create the project folder under `projects/`.
2. Add project page or README-style HTML.
3. Add screenshots/assets under `assets/images/projects/...`.
4. Add a card to `projects/index.html`.
5. Add the project to this file.
