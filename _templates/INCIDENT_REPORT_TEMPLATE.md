# Incident Report: Title

## 1. Executive Summary

Write a short business-friendly summary.

Include:

- What happened?
- Who or what was affected?
- Was it true positive or false positive?
- What is the final impact?
- What should be done next?

## 2. Alert Context

| Field | Value |
|---|---|
| Alert name |  |
| Severity |  |
| Status | True Positive / False Positive / Benign True Positive |
| Data source |  |
| Host |  |
| User |  |
| Source IP |  |
| Destination IP |  |
| Timestamp |  |
| Tool / Platform |  |

## 3. Scope

Define the investigation scope.

| Item | Value |
|---|---|
| Investigation start time |  |
| Investigation end time |  |
| Affected host(s) |  |
| Affected user(s) |  |
| Main log sources |  |

## 4. Investigation Timeline

| Time | Event | Evidence | Analyst Note |
|---|---|---|---|
|  |  |  |  |

## 5. Technical Analysis

### 5.1 Initial Evidence

Describe the first suspicious event.

### 5.2 Process / Endpoint Analysis

Describe process tree, parent-child relationship, command lines, file paths and endpoint evidence.

### 5.3 Network Analysis

Describe DNS, HTTP, TLS, IP connections, ports, domains and traffic patterns.

### 5.4 Identity / Authentication Analysis

Describe failed logins, successful logins, privilege changes or credential usage.

### 5.5 Persistence / Lateral Movement / Impact

Describe any persistence, lateral movement, data access, exfiltration or impact staging.

## 6. MITRE ATT&CK Mapping

| Tactic | Technique ID | Technique Name | Evidence |
|---|---|---|---|
| Initial Access | Txxxx |  |  |
| Execution | Txxxx |  |  |
| Persistence | Txxxx |  |  |
| Defense Evasion | Txxxx |  |  |
| Credential Access | Txxxx |  |  |
| Discovery | Txxxx |  |  |
| Lateral Movement | Txxxx |  |  |
| Command and Control | Txxxx |  |  |
| Exfiltration | Txxxx |  |  |
| Impact | Txxxx |  |  |

## 7. Indicators of Compromise

| Type | Indicator | Context | Action |
|---|---|---|---|
| IP |  |  | Block / Monitor |
| Domain |  |  | Block / Monitor |
| URL |  |  | Block / Monitor |
| Hash |  |  | Block / Monitor |
| File path |  |  | Investigate |
| Registry key |  |  | Investigate |
| User account |  |  | Reset / Review |

## 8. Impact Assessment

| Question | Answer |
|---|---|
| Was code executed? |  |
| Was persistence created? |  |
| Were credentials accessed? |  |
| Was lateral movement observed? |  |
| Was data exfiltration observed? |  |
| Was business impact observed? |  |

## 9. Recommended Remediation

### Immediate Actions

- Isolate confirmed compromised hosts.
- Disable or reset affected accounts.
- Block malicious IPs, domains, URLs and hashes.
- Remove malicious files and persistence.

### Follow-up Actions

- Hunt for the same IOCs across the environment.
- Review similar user activity.
- Improve detection coverage.
- Review email security or endpoint policy if relevant.

### Detection Improvements

- Add SIEM rule for similar activity.
- Add Sigma / SPL / KQL query.
- Monitor related process names, command lines and network patterns.

## 10. Lessons Learned

Write 3–5 lessons from the case.

## 11. Final Verdict

Final classification:

```txt
True Positive / False Positive / Benign True Positive
```

Final summary:

```txt
Write the final conclusion here.
```
