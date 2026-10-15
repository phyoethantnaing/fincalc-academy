# FinCalc Academy — Financial Calculator & Learning Lab

A browser-local financial calculator and Myanmar-language learning application. Built with React 19, strict TypeScript, Vite, decimal.js, Zod, Lucide, Recharts, Vitest, Playwright, and a precaching PWA service worker. English can be selected in the toolbar. No accounts, API keys, analytics, or backend are required.

## Run

Requires Node.js 22.12+ (tested on Node 24).

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

To run browser tests, start the development server in one terminal, then:

```sh
npx playwright install chromium
npm run test:e2e
```

The browser configuration uses `/usr/bin/chromium` when installed, or Playwright's bundled Chromium. For production offline tests, build, run `npm run preview -- --port 4173`, then `npm run test:offline`.

## Using the app

- **Professional calculator:** Classic-style ten-column keypad with a genuine four-level RPN stack. `2 ENTER 3 +` returns 5. Keyboard digits, Enter, +, -, *, /, period, %, f, g, Escape/Backspace work. Right-click or hold a key for help. Mobile users can select **Larger touch keys**. Full-screen mode supports classrooms.
- **Financial keys:** Enter a value and its register key. After storing a financial register, another financial key solves that variable. `RCL` plus a register recalls its value. The interest register is a percentage **per period**.
- **Beginner mode:** Loan/installment plans, target savings, compound/simple interest, PV, FV, investment NPV/IRR/ROI/CAGR, and bank discount. Each result has a working equivalent keypad sequence. Rates, timing and day bases are explicit.
- **Academy:** Seven original Myanmar lessons, scenarios, formulas, real engine demonstrations, per-key animation, replay/previous/next, adjustable speed, guided manual practice, three exercise sizes, and conceptual quizzes. Both practice and quiz must pass to complete a lesson. Answers use ±0.01 tolerance.
- **Analysis:** Repayment schedule, monthly/yearly grouping, payment filter, principal/interest and balance charts, savings/growth charts, investment cash flows and direction diagrams. Loan comparisons include reducing/flat interest, fees, BEGIN/END timing, net proceeds, total paid, and an IRR-based annual borrowing rate.
- **Local storage:** Preferences, calculations, quiz/practice progress, activity dates, bookmarks. Saved calculations can be named, loaded or deleted. Settings allows clearing app data. No remote collection.
- **Exports:** UTF-8 CSV, Excel-compatible SpreadsheetML XML, browser print/PDF, history CSV, copied results and shared summaries. XML export opens in Excel; it is not an XLSX file. Reports include rounding conventions.

## Mathematical conventions

Authoritative calculations use decimal.js with 40 significant digits, ROUND_HALF_UP. Display rounding never truncates stored values. Near-zero annuity factors use a series expansion. PV/PMT/FV solve algebraically; n uses a logarithmic inversion; rate solving uses a scanned bracket and decimal bisection. The rate search domain is approximately −99.9999% to 99,900% **per period**; no-root and detected multiple-root cases are errors. This is a bounded search, not a proof that no other mathematical root exists.

END TVM: `PV(1+r)^n + PMT((1+r)^n−1)/r + FV = 0`. BEGIN multiplies the payment annuity factor by `1+r`. At zero rate, the factor is n. Positive means money received; negative means money paid.

Loan schedules use periodic rates from annual nominal rate/12. Payments and each interest amount are rounded to two decimal places; the final payment settles the exact remaining rounded balance. BEGIN charges no interest on the first immediate payment. Totals use decimal sums. Calculator AMORT uses the calculator's selected precision, updates PV/n, and places interest in X, principal in Y and payment count in Z. Reset n to zero before a new amortization run.

Simple interest/discount use explicitly selected 360/365-day years. Compound daily frequency means 365. No live currency conversion is performed. Bank discount annual simple cost is labeled separately from EAR. Comparison EAR is `(1+monthly cash-flow IRR)^12−1`, with fees deducted from proceeds. Flat interest is charged on original principal.

Conventional cash flows (one sign change) support a bracketed IRR. Flows with multiple sign changes are explicitly declined rather than presented as having a unique IRR. ROI and CAGR in the beginner investment tool use the separately entered initial/terminal values, while NPV/IRR use the entered periodic cash flows.

## Compatibility

This is **not a fully compatible HP 12C emulator**. See [docs/COMPATIBILITY.md](docs/COMPATIBILITY.md) for verified mappings, intentional differences and unsupported functions. Unsupported original-device operations produce an explicit notice. Original branding and CSS artwork are used; no HP logos, manual excerpts or device images are shipped.

## Architecture

- `src/engine/finance.ts`: decimal financial formulas, numerical solvers and schedules.
- `src/engine/rpn.ts`: stateful stack, register and prefix interpreter; no expression evaluator or eval.
- `src/lessons/curriculum.ts`: seven lessons, key sequences, verified practice answer/sequence generation.
- `src/components/`: calculator, learning player, beginner tools, comparison, tables and lazy chart modules.
- `src/utils.ts`: formatting, local storage, calculation snapshots and file export.
- `tests/engine.test.ts`: independent references, official-guide examples, all lesson and practice sequences.
- `tests/e2e/`: student flow, keypad, persistence, practice, export and mobile browser tests.
- `tests/offline/`: production PWA reload and calculation with networking disabled.

Custom CSS is used instead of Tailwind/shadcn so the physical keypad and original visual system need fewer dependencies. CSS honors reduced motion. Charts and the learning UI are loaded as separate chunks. Fonts are self-hosted and precached.

## Deployment

Build a static site with `npm ci && npm run build`, then serve **dist/** over HTTPS. Vercel configuration is included. No environment variables or server functions are needed. Any static host can serve these files. Routes are client-side view state and do not require rewrites. Do not cache `sw.js` permanently; the supplied host configs set no-cache for service-worker updates.

GitHub Actions runs type checking, production build and financial tests. No remote repository or live deployment is implied by this source checkout. Follow [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) before publication. Do not commit `.env` files or credentials.

## Legal and privacy

Independent educational application inspired by classic financial calculator workflows. Not affiliated with or endorsed by HP.

This application is for financial education and calculation. Results depend on the entered assumptions and rounding conventions. Verify important financial decisions against actual contracts and qualified advice.

Application source is offered under MIT; bundled dependency/font licenses remain applicable. See LICENSE and THIRD_PARTY_NOTICES.md.
