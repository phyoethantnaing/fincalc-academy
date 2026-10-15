# Calculator specification and verification

Reference consulted 2026-10-15:

- https://literature.hpcalc.org/official/hp12c-ug-en.pdf
- https://commerce.hpcalc.org/12c.php

The guide was consulted as a functional reference; its content and device artwork are not distributed in the application.

## Verified mappings used

| Base key | f shift             | g shift                         |
| -------- | ------------------- | ------------------------------- |
| n        | AMORT               | 12× (stores n)                  |
| i        | INT                 | 12÷ (stores i)                  |
| PV       | NPV                 | CF0                             |
| PMT      | RND                 | CFj                             |
| FV       | IRR                 | Nj                              |
| CHS      | —                   | DATE                            |
| EEX      | —                   | ΔDYS                            |
| y^x      | PRICE (unsupported) | square root                     |
| 1/x      | YTM (unsupported)   | exp                             |
| %T       | SL (unsupported)    | ln                              |
| Δ%       | SOYD (unsupported)  | fractional part                 |
| %        | DB (unsupported)    | integer part                    |
| 7 / 8    | display precision   | BEGIN / END                     |
| 4 / 5    | display precision   | D.MY / M.DY                     |
| 3        | display precision   | factorial                       |
| x↔y      | CLEAR FIN           | program condition (unsupported) |
| CLx      | CLEAR REG           | program condition (unsupported) |
| ENTER    | PREFIX cancel       | LAST X                          |

f + any digit selects display decimal places. STO/RCL support 0–9 and five financial registers. The original 4×10 arrangement is preserved, including the double-height ENTER key. The optional larger touch layout rearranges keys for narrow screens and is an application feature.

## Verified behavior

RPN is a real four-level X/Y/Z/T stack. ENTER duplicates X to Y and disables the next entry lift. Binary arithmetic drops the stack and repeats T; percentages retain Y. Recall normally lifts. Financial storage suppresses lift. Unary/binary operations preserve Last X. Financial key store/solve behavior follows the guide's preceding-operation distinction, including storing computed values. Prefixes do not end digit entry. Errors preserve a finite stack and explain the problem.

Official-guide reference tests:

- $450, 7%, 60 days, 360 basis: simple interest $5.25 (guide pp. 33–34).
- $50,000, annual 13.25%, END payment −573.35, first 12 amortized payments: interest −6608.89, principal −271.31, balance 49728.69 (guide pp. 54–55).

Independent closed-form tests cover PV/FV/PMT/n/i, BEGIN/END, zero and near-zero interest, high rates, invalid rates/signs, annuities, loan reconciliation, NPV, conventional IRR, discount, EAR, ROI and CAGR. Every lesson and each of the 21 practice variations executes the displayed real key sequence to reproduce its answer.

## Explicit limitations and deliberate differences

- Program memory/run/stop/single-step, statistics and regressions, bond price/yield, depreciation, memory allocation, program conditionals and extended decimal-address storage registers are unsupported. Pressing these functions returns a notice; it does not invent a numerical result. The three unsupported primary keys have a visible marker and a tooltip.
- Fractional TVM periods use standard compound growth. Original odd-period simple-interest treatment and upward integer rounding of calculated n are not reproduced.
- Internal precision is 40 significant digits, rather than emulating the original hardware's precision. Rounding is half up. Hardware overflow codes, display mantissa formatting, exact error numbers, and hardware battery behavior are not emulated.
- IRR conservatively declines every non-conventional cash-flow sequence, including some that have a unique root. The supported search is finite.
- Cash-flow groups and repetitions are implemented, but original cash-flow memory-sharing and indexed review/edit programming workflows are not emulated.
- Calendar dates use packed MM.DDYYYY or DD.MMYYYY inputs. Results show an application-friendly full date; actual days are supported. The original second 30/360 output and weekday display are not reproduced.
- Modern beginner forms, larger touch keys, saved calculations, loan charts, comparison, exports, lessons and practice are application features. No algebraic mode is represented as a classic HP 12C feature.
- Three exercise difficulty choices scale monetary inputs by 1, 2 or 3; these are progressively larger examples, not a claim of increasingly sophisticated financial concepts.
