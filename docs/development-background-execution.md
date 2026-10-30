# Background development contract update

Date: 2026-10-30. User explicitly requested direct screenshot/widget attempts under keep-alive and background scripts create/attach with deferred foreground presentation. App spec: scripting-ios/mydocs/specs/2026-10-30_DesktopDevelopmentBackgroundExecution.md.

CLI has no foreground admission gate; runtime protocol remains unchanged. Update EN/ZH README and portable development Skill to stop requiring foreground. Retain old-App needs_foreground error handling, permissions, busy/conflict/deadline rules and real image/render evidence. Binding does not automatically execute a script, and returning to foreground must not replay an operation.

Validation: documentation review against current App changes and unchanged CLI protocol; actual App/CLI targeted fixture outcomes recorded in the App spec. No new npm release or Git push requested.

Closeout: App build and 10 targeted unit tests passed. User waived actual App/CLI fixture/manual validation. CLI existing 38 tests/build passed with unchanged runtime/dist. User subsequently requested npm publication and CLI commit; version 2.0.1 published/latest verified and release metadata committed/pushed. See docs/releases/2.0.1-release.md.
