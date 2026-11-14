---
name: Bug report
about: Report a reproducible problem with SessionSweep
title: "[Bug]: "
labels: ""
assignees: ""
---

## Before submitting

- [ ] I am using the latest published version of SessionSweep.
- [ ] I disabled older copies and other device sign-out helpers.
- [ ] I checked existing issues for a matching report.
- [ ] I removed personal information from this report and its attachments.

> Never share passwords, cookies, tokens, recovery codes, account-specific device URLs, or unredacted account diagnostics. Blur names, email addresses, and device identifiers in screenshots.

## Bug description

Describe what went wrong and where the script stopped.

## Steps to reproduce

1. Open …
2. Click …
3. Wait for …
4. Observe …

## Expected behavior

What did you expect SessionSweep to do?

## Actual behavior

What happened instead? Include the helper’s exact status message.

```text
Paste the status message here, with personal information removed.
```

## Environment

- SessionSweep version:
- Browser and version:
- Operating system:
- Tampermonkey version:
- Google Account interface language:
- Page when the issue occurred: device list / device detail / other

## Sign-out state

- Did the script click the initial “Sign out” control? Yes / No / Unsure
- Did a confirmation dialog appear? Yes / No / Unsure
- Did the script confirm the dialog? Yes / No / Unsure
- Did Google display “Successfully signed out”? Yes / No / Unsure
- Did Google return to the device list? Yes / No / Unsure
- After manually refreshing, was the target session marked “Signed out”? Yes / No / Unsure / Not checked
- Did an authentication prompt or security challenge appear? Yes / No

> If the script stops after a click, inspect the account state before retrying. Sign-out may have succeeded even if verification timed out. Do not repeat sign-outs solely to gather debugging information.

## Screenshots or diagnostics

Optional: attach a redacted screenshot or relevant visible button labels. Review all diagnostic output before posting.

## Additional context

Mention anything else that may help, such as whether the issue happens every time, whether navigation changed unexpectedly, or whether the interface uses a language other than English.
