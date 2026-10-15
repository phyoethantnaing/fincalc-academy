# Verification record

Verified in the managed Linux environment on 2026-10-15 using Node 24, Chromium, and the checked-in lockfile.

- 57 Vitest checks passed: four-level RPN operations, financial store/solve behavior, arithmetic/percentages, prefixes, errors, all TVM variables, zero/near-zero/high rates, signs, BEGIN/END, simple/compound interest, discounts, NPV/IRR, EAR/ROI/CAGR, amortization reconciliation, two official-guide examples, all seven lesson demonstrations, and 21 practice answer/key-sequence pairs.
- Six Playwright browser tests passed: complete Myanmar loan-learning workflow; practice and quiz completion persisted across reload; calculator entry; language switch; save/load; CSV download; guided manual key presses; previous/replay; beginner form matching keypad output; effective borrowing cost display; each of the 39 physical keys responding; unsupported-function notices; layouts at widths 320, 390, 768 and 1280; expanded mobile touch targets at least 44×44 pixels.
- One production PWA test passed with networking disabled after initial cache installation: reload, RPN calculation, lazy-loaded lesson, animated loan calculation and chart rendering.
- Strict TypeScript and optimized production build passed.
- Original desktop visual design and Myanmar font shaping were inspected using a browser screenshot.

These tests verify the described release scope. They do not establish complete original-device compatibility, exhaustive financial edge-case coverage, screen-reader certification, native Excel installation behavior, or bank-contract agreement. See COMPATIBILITY.md for deliberate limits. Excel export is SpreadsheetML XML; it is generated without parsing user-supplied workbooks.
