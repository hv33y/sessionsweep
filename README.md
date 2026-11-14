# SessionSweep

### One queue. Fewer open sessions.

A Tampermonkey userscript that helps you sign out of Google Account device sessions sequentially without changing your password.

SessionSweep follows the device links on your account’s device-activity page, opens each detail page in the current tab, and uses the visible **Sign out** controls. No background-frame tricks. No password collection. No private API calls.

> **Independent community project. Not affiliated with or endorsed by Google or Tampermonkey. Use only on accounts you own or are authorized to manage.**

## Why SessionSweep?

Signing out of a long list of sessions by hand gets repetitive. SessionSweep automates that interface workflow while keeping a visible status panel and a stop control.

It does not bypass authentication or Google’s security checks. It performs the sign-out actions available through the page you are already using.

## Features

- **Sequential processing:** visits one device-detail page at a time in the current tab.
- **No password change:** uses the page’s existing sign-out controls.
- **Confirmation handling:** clicks an exact “Sign out” control inside a visible confirmation dialog.
- **Success verification:** recognizes Google’s “Successfully signed out” message or a signed-out detail-page state.
- **Conservative stopping:** stops when it cannot identify the expected control or verify the result.
- **Session filtering:** attempts to skip entries labelled “Your current session” or “Signed out.”
- **Visible progress:** reports remaining entries, confirmed results, and skipped entries.
- **Stop control:** clears the queue and prevents subsequent automated clicks.
- **Local queue:** stores progress in this tab’s `sessionStorage` so navigation can continue the workflow.

## Requirements

- A browser with Tampermonkey installed and enabled.
- Your Google Account already signed in.
- Google’s device-activity interface in English. The script matches English labels.
- The final, patched userscript, including the success-notification check.

## Installation

### 1. Install Tampermonkey

Install the [Tampermonkey browser extension](https://www.tampermonkey.net/) if you don’t already have it.

### 2. Install SessionSweep

[**Click to install SessionSweep**](https://github.com/hv33y/sessionsweep/raw/refs/heads/master/sessionsweep.user.js)

Tampermonkey will open an installation screen. Review the script and click **Install**.

### 3. Start sweeping

Open [Google’s device-activity page](https://myaccount.google.com/device-activity), scroll through the device list, and click **Start sequential sign-out**.

The userscript is scoped to:

```text
https://myaccount.google.com/device-activity*
```

## Usage

1. Open the main device list.
2. Scroll through the page to load the entries you want included.
3. Click **Start sequential sign-out** in the helper panel.
4. Review the number of sessions and accept the confirmation prompt.
5. Leave this tab alone while SessionSweep works through its queue.
6. When it finishes, refresh the device list and review the actual account state.

You may need to sign in again on devices whose sessions you ended.

### Stopping

Click **Stop / clear queue**. This clears the saved queue and prevents further automated clicks; it cannot undo a sign-out or cancel a click already sent to Google.

### Restarting after a stop

Return to the main device list, reload it to clear old notifications, scroll to load entries, and start a fresh scan. Review the list first if the previous run stopped after clicking Sign out: the action may have succeeded even if verification timed out.

## How it works

```text
Scan device links
        |
Review and approve the queue
        |
Open one device-detail page
        |
Skip current / already-signed-out sessions when identifiable
        |
Click the exact Sign out control
        |
Confirm in a dialog, if shown
        |
Verify success -------- Unexpected state
        |                      |
Advance to next entry      Stop for inspection
```

Each detail page loads in the main tab. The script saves its queue before navigating and reads that queue when it starts on the next page.

A click alone is not counted as a confirmed sign-out.

## Privacy and permissions

The sign-out script uses `@grant none`. Its code does not include analytics, telemetry, external network requests, or credential collection.

It reads device links, page labels, and visible controls. The queue contains device-detail URLs and progress counters, stored in this tab’s `sessionStorage` under:

```text
google-device-signout-v3
```

Click **Stop / clear queue** to remove that saved state. A completed run leaves its final state in session storage until cleared or replaced by a new run.

Device-detail URLs can contain account-specific identifiers. Do not include them in public issue reports. Redact names, email addresses, device identifiers, and other personal information from diagnostics and screenshots.

## Limitations

- **UI-dependent:** Google can change page structure, labels, dialogs, or navigation and break the automation.
- **English labels only:** other interface languages are not currently supported.
- **Loaded links only:** the initial scan includes device links present in the page, not necessarily every session in the account.
- **Best-effort skipping:** current-session and already-signed-out detection depends on visible labels.
- **Sessions, not physical devices:** queue entries represent the links shown by Google; multiple entries may relate to the same device.
- **Not a removal tool:** it signs out sessions. It does not erase devices, delete local files, or guarantee that historical entries disappear from the list.
- **Not an account-security reset:** it does not change passwords, revoke every third-party authorization, or resolve an account compromise.
- **Authentication is manual:** it does not handle passwords, passkeys, CAPTCHAs, or security challenges.
- **No guarantee of completeness:** always review the refreshed device list afterward.

## Troubleshooting

| Status or symptom | What to do |
| --- | --- |
| No eligible device links found | Open the main device list, scroll through it, and scan again. |
| Could not identify exactly one Sign out control | Inspect the detail page. The session may already be inactive, or the interface may have changed. |
| Click made, but success not verified | Check the page before retrying. Sign-out may have succeeded despite the timeout. |
| Google says “Successfully signed out,” but the helper waits | Confirm your installed version includes the success-notification check. |
| Navigation did not reach the expected device page | Clear the queue and inspect the destination. Complete any authentication yourself before restarting. |
| Helper panel missing | Check that the userscript is enabled and that the current page matches the supported device-activity URL. |

Do not “fix” a verification failure by treating every click as success or clicking generic “OK” and “Yes” controls. Inspect the unexpected state first.

## Reporting issues

Include:

- Browser and Tampermonkey versions.
- Whether you were on the device list or a detail page.
- The helper’s exact status message.
- The relevant visible button labels.
- Whether Google displayed a success notification or redirected you.

Do not post passwords, cookies, tokens, complete account-specific URLs, or unredacted account diagnostics.

## Contributing

Useful improvements include:

- More robust, narrowly scoped success detection.
- Explicit support for additional interface languages.
- Clearer pause and recovery behavior.
- Tests for control matching and state transitions.
- Accessibility improvements to the helper panel.

Keep automation conservative: prefer a clear stop over an uncertain click.
