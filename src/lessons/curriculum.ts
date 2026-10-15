import {
  solve,
  compound,
  simpleInterest,
  discount,
  D,
} from "../engine/finance";
export type Step = { keys: string[]; en: string; my: string };
export type Lesson = {
  id: number;
  title: string;
  my: string;
  category: string;
  minutes: number;
  description: string;
  explanation: string;
  scenario: string;
  formula: string;
  values: string[];
  steps: Step[];
  practice: { question: string; my: string; answer: number; unit: string };
  quiz: {
    question: string;
    my: string;
    options: string[];
    correct: number;
    explanation: string;
  };
  takeaway: string;
};
const clear: Step = {
  keys: ["f", "x↔y"],
  en: "Clear the five financial registers.",
  my: "f → FIN CLEAR နှိပ်ပြီး အရင်ငွေကြေးတန်ဖိုးများကို ရှင်းပါ။",
};
export const loanSteps: Step[] = [
  clear,
  {
    keys: ["g", "8"],
    en: "Select END: payments happen at the end of each month.",
    my: "g → 8 ဖြင့် END ရွေးပါ။ လစဉ် လကုန်တွင် ငွေပေးချေမည်။",
  },
  {
    keys: ["1", "2", "n"],
    en: "Store 12 monthly payments in n.",
    my: "12 → n ဖြင့် ပေးချေမည့် အကြိမ် ၁၂ ကြိမ်ကို မှတ်ပါ။",
  },
  {
    keys: ["1", "2", "g", "i"],
    en: "Divide 12% annual nominal interest by 12. Store 1% per month.",
    my: "12 → g → i သည် နှစ်စဉ် 12% ကို ၁၂ နှင့်စားပြီး တစ်လစာ 1% ကို i တွင် မှတ်ပေးသည်။",
  },
  {
    keys: ["1", "0", "0", "0", "0", "0", "PV"],
    en: "Store 100,000 received today as a positive PV.",
    my: "ယနေ့ လက်ခံရရှိသော ချေးငွေ 100,000 ကို အပေါင်း PV အဖြစ် မှတ်ပါ။",
  },
  {
    keys: ["0", "FV"],
    en: "Set the final outstanding balance to zero.",
    my: "ချေးငွေအားလုံး ပြန်ဆပ်ပြီးနောက် ကျန်ငွေ FV ကို သုညထားပါ။",
  },
  {
    keys: ["PMT"],
    en: "Solve PMT. The negative sign means money paid out.",
    my: "PMT နှိပ်ပါ။ အနုတ်လက္ခဏာသည် မိမိဘက်မှ ပေးထွက်ရမည့် ငွေဖြစ်ကြောင်း ဆိုလိုသည်။",
  },
];
export const lessons: Lesson[] = [
  {
    id: 1,
    title: "Calculator basics & percentages",
    my: "အခြေခံအသုံးပြုနည်းနှင့် ရာခိုင်နှုန်း",
    category: "FOUNDATIONS",
    minutes: 12,
    description:
      "Get comfortable with RPN, the stack, and everyday percentages.",
    explanation:
      "RPN တွင် ကိန်းနှစ်ခုကြား ENTER နှိပ်ပြီး နောက်ဆုံးမှ တွက်ချက်သင်္ကေတကို နှိပ်ပါ။ X သည် ဖန်သားပြင်၊ Y သည် အရင်ကိန်း ဖြစ်သည်။ f သည် ရွှေရောင်လုပ်ဆောင်ချက်၊ g သည် အပြာရောင်လုပ်ဆောင်ချက်ကို ရွေးပေးသည်။ STO → 1 ဖြင့် သိမ်းပြီး RCL → 1 ဖြင့် ပြန်ခေါ်နိုင်သည်။",
    scenario: "ဆိုင်တွင် ဝယ်ရင်းဈေး 20,000 ကျပ်ကို 15% အမြတ်တင်၍ ရောင်းမည်။",
    formula: "Selling price = cost × (1 + markup / 100)",
    values: ["Cost · 20,000 MMK", "Markup · 15%"],
    steps: [
      {
        keys: ["2", "0", "0", "0", "0", "ENTER"],
        en: "Enter the cost and copy it to Y.",
        my: "ဝယ်ရင်းဈေး 20,000 ရိုက်ပြီး ENTER နှိပ်ပါ။ Y တွင် အခြေခံငွေ ကျန်မည်။",
      },
      {
        keys: ["1", "5", "%"],
        en: "15% calculates the increase and preserves the base in Y.",
        my: "15 → % နှိပ်ပါ။ အမြတ်ငွေ 3,000 ကို တွက်ပြီး Y တွင် 20,000 ကို ထိန်းထားသည်။",
      },
      {
        keys: ["+"],
        en: "Add the increase to get the selling price.",
        my: "+ ဖြင့် ပေါင်းပါ။ ရောင်းဈေး 23,000 ဖြစ်သည်။",
      },
    ],
    practice: {
      question:
        "A product costs 40,000. Add a 20% markup. What is the selling price?",
      my: "40,000 ကျပ်တန်ပစ္စည်းကို 20% အမြတ်တင်လျှင် ရောင်းဈေး ဘယ်လောက်လဲ။",
      answer: 48000,
      unit: "MMK",
    },
    quiz: {
      question: "Is a 20% markup the same as a 20% gross margin?",
      my: "ဝယ်ရင်းအပေါ် 20% အမြတ်တင်ခြင်းနှင့် ရောင်းဈေးအပေါ် 20% အမြတ်နှုန်း တူသလား။",
      options: [
        "No · markup uses cost; margin uses selling price",
        "Yes · both always mean the same thing",
      ],
      correct: 0,
      explanation:
        "Markup = profit ÷ cost. Margin = profit ÷ selling price. 20% markup gives 16.67% margin. Δ% uses the old value in Y; %T uses the total in Y.",
    },
    takeaway:
      "ဝယ်ရင်းဈေးကို အခြေခံလျှင် markup၊ ရောင်းဈေးကို အခြေခံလျှင် margin ဖြစ်သည်။",
  },
  {
    id: 2,
    title: "Loan amortization",
    my: "ချေးငွေပြန်ဆပ်နည်း",
    category: "BORROWING",
    minutes: 15,
    description:
      "Understand every payment: principal, interest, and what remains.",
    explanation:
      "ချေးငွေရင်း (Principal) သည် စတင်ချေးယူသော ငွေဖြစ်သည်။ လစဉ်ပေးငွေ (PMT) တွင် အတိုးနှင့် ငွေရင်းပြန်ဆပ်ခြင်း ပါဝင်သည်။ လက်ကျန်ငွေ ကျဆင်းလာသဖြင့် နောက်ပိုင်းအတိုးလည်း လျော့နည်းလာသည်။",
    scenario:
      "လုပ်ငန်းအတွက် 100,000 ကျပ်ကို နှစ်စဉ်အတိုး 12%၊ ၁၂ လဖြင့် ချေးယူမည်။ လကုန်တိုင်း ငွေပြန်ဆပ်မည်။",
    formula: "PV(1 + r)ⁿ + PMT[(1 + r)ⁿ − 1] / r + FV = 0",
    values: [
      "Loan · 100,000 MMK",
      "Annual nominal rate · 12%",
      "Term · 12 months",
      "Timing · END",
    ],
    steps: loanSteps,
    practice: {
      question:
        "Borrow 200,000 at 12% nominal annual interest for 12 months, END. Enter the monthly payment as a positive amount.",
      my: "200,000 ကျပ်ကို နှစ်စဉ် 12% ဖြင့် ၁၂ လ လကုန်တိုင်းပြန်ဆပ်လျှင် တစ်လပေးငွေ ဘယ်လောက်လဲ။ အပေါင်းဖြင့် ဖြေပါ။",
      answer: solve(
        { n: 12, i: 1, PV: 200000, PMT: 0, FV: 0, begin: false },
        "PMT",
      )
        .abs()
        .toNumber(),
      unit: "MMK",
    },
    quiz: {
      question: "Why does the calculator show a negative payment?",
      my: "PMT အဖြေမှာ အနုတ်လက္ခဏာ ဘာကြောင့်ပါသလဲ။",
      options: [
        "The loan has no interest",
        "It is money paid out, opposite to the loan received",
        "The calculation failed",
      ],
      correct: 1,
      explanation:
        "ငွေရခြင်းကို အပေါင်း၊ ပြန်ပေးခြင်းကို အနုတ် သတ်မှတ်ထားသည်။ အနုတ် PMT သည် အမှားမဟုတ်ပါ။",
    },
    takeaway:
      "နှစ်စဉ် nominal rate ကို ၁၂ နှင့်စား၍ လစဉ် i ရပါသည်။ EAR ကို တိုက်ရိုက် ၁၂ နှင့် မစားရပါ။",
  },
  {
    id: 3,
    title: "Annuities & regular savings",
    my: "လစဉ်ငွေစုခြင်းနှင့် နှစ်စဉ်ငွေစီးဆင်းမှု",
    category: "SAVING",
    minutes: 14,
    description:
      "Turn regular deposits into a future business or savings goal.",
    explanation:
      "တူညီသောအချိန်တိုင်း တူညီသောငွေပမာဏ ထည့်ဝင်ခြင်းကို annuity ဟုခေါ်သည်။ END တွင် ကာလဆုံးမှထည့်ပြီး BEGIN တွင် ကာလအစ၌ ထည့်သည်။ BEGIN ငွေသည် အတိုးတစ်ကာလ ပိုရသည်။",
    scenario:
      "စီးပွားရေးအတွက် လကုန်တိုင်း 10,000 ကျပ် စုမည်။ နှစ်စဉ် nominal အတိုး 6% ဖြင့် ၂၄ လ ပြီးလျှင် ဘယ်လောက်ရမလဲ။",
    formula: "FV = deposit × [(1 + r)ⁿ − 1] / r",
    values: [
      "Deposit · 10,000 MMK / month",
      "Annual nominal rate · 6%",
      "Term · 24 months",
    ],
    steps: [
      clear,
      {
        keys: ["g", "8", "2", "4", "n"],
        en: "Choose END and store 24 months.",
        my: "END ကိုရွေးပြီး n တွင် 24 မှတ်ပါ။",
      },
      {
        keys: ["6", "g", "i"],
        en: "Convert annual 6% to monthly 0.5%.",
        my: "6 → g → i ဖြင့် တစ်လစာ 0.5% မှတ်ပါ။",
      },
      {
        keys: ["0", "PV", "1", "0", "0", "0", "0", "CHS", "PMT"],
        en: "Start with zero. Deposits are cash paid out, so PMT is negative.",
        my: "အစငွေ PV ကို 0 ထားပါ။ ထည့်စုသောငွေသည် ပေးထွက်ငွေဖြစ်၍ PMT ကို −10,000 ထားပါ။",
      },
      {
        keys: ["FV"],
        en: "Solve the future savings balance.",
        my: "FV နှိပ်၍ အနာဂတ် စုငွေကို ရှာပါ။",
      },
    ],
    practice: {
      question:
        "Save 5,000 at each month end for 12 months at 6% nominal annual. What is FV?",
      my: "လကုန်တိုင်း 5,000 ကျပ်ကို နှစ်စဉ် 6% ဖြင့် ၁၂ လ စုလျှင် နောက်ဆုံးစုငွေ ဘယ်လောက်လဲ။",
      answer: solve(
        { n: 12, i: 0.5, PV: 0, PMT: -5000, FV: 0, begin: false },
        "FV",
      ).toNumber(),
      unit: "MMK",
    },
    quiz: {
      question:
        "Which timing earns more interest for the same regular deposits?",
      my: "ပမာဏနှင့် အကြိမ်တူလျှင် ဘယ်အချိန်ထည့်ခြင်းက အတိုးပိုရသလဲ။",
      options: ["BEGIN · start of period", "END · end of period"],
      correct: 0,
      explanation:
        "BEGIN တွင် ငွေတစ်ကြိမ်စီက အတိုးတစ်ကာလ ပိုရသည်။ Savings target အတွက် FV အပေါင်းနှင့် PV=0 ထည့်ပြီး PMT ကို ရှာနိုင်သည်။",
    },
    takeaway: "ပုံမှန်ထည့်ငွေ အနုတ်၊ နောက်ဆုံးပြန်ရငွေ အပေါင်း ဖြစ်ရမည်။",
  },
  {
    id: 4,
    title: "Present value & discounting",
    my: "လက်ရှိတန်ဖိုးနှင့် လျှော့တွက်ခြင်း",
    category: "VALUE OF MONEY",
    minutes: 10,
    description: "Bring future money back to its value today.",
    explanation:
      "Present Value (PV) သည် ဒီနေ့မှာရှိသော ငွေတန်ဖိုးဖြစ်သည်။ အနာဂတ်ငွေကို ယနေ့နှင့် နှိုင်းယှဉ်ရန် အတိုးကြီးထွားမှုကို နောက်ပြန်တွက်ခြင်းအား discounting ဟုခေါ်သည်။ Discount factor သည် 1 ÷ (1 + r)ⁿ ဖြစ်သည်။",
    scenario:
      "၂ နှစ်နောက်တွင် 121,000 ကျပ်ရမည်။ နှစ်စဉ် အခွင့်အလမ်းကုန်ကျစရိတ် 10% ရှိလျှင် ယနေ့တန်ဖိုး ဘယ်လောက်လဲ။",
    formula: "PV = FV / (1 + r)ⁿ",
    values: [
      "Future receipt · 121,000 MMK",
      "Discount rate · 10% annually",
      "Time · 2 years",
    ],
    steps: [
      clear,
      {
        keys: ["2", "n", "1", "0", "i"],
        en: "Use annual periods: n=2 and i=10%.",
        my: "နှစ်အလိုက်တွက်သဖြင့် n=2 နှင့် i=10 ထည့်ပါ။",
      },
      {
        keys: ["0", "PMT", "1", "2", "1", "0", "0", "0", "FV"],
        en: "No regular payments. Store the future receipt.",
        my: "ပုံမှန်ပေးငွေ မရှိ၍ PMT=0 ထားပြီး FV=121,000 ထည့်ပါ။",
      },
      {
        keys: ["PV"],
        en: "Solve PV. Its magnitude is today’s equivalent value.",
        my: "PV ရှာပါ။ −100,000 ဟူသောအဖြေသည် ယနေ့ပေးရမည့်ငွေကို ဖော်ပြသည်။",
      },
    ],
    practice: {
      question:
        "What is today’s value of 133,100 received in 3 years at 10% per year? Enter the positive magnitude.",
      my: "၃ နှစ်နောက်ရမည့် 133,100 ကျပ်၏ ယနေ့တန်ဖိုးကို နှစ်စဉ် 10% ဖြင့် ရှာပါ။ အပေါင်းဖြင့် ဖြေပါ။",
      answer: 100000,
      unit: "MMK",
    },
    quiz: {
      question: "When the discount rate rises, what happens to present value?",
      my: "အနာဂတ်ငွေတူလျှင် discount rate တက်လာသော် PV ဘယ်လိုဖြစ်မလဲ။",
      options: ["PV increases", "PV decreases"],
      correct: 1,
      explanation:
        "လျှော့တွက်နှုန်း ပိုမြင့်လျှင် အနာဂတ်ငွေ၏ ယနေ့တန်ဖိုး ပိုနည်းသည်။",
    },
    takeaway: "အချိန်ကာလနှင့် အတိုးနှုန်း၏ ယူနစ်ကို တူအောင်ထားပါ။",
  },
  {
    id: 5,
    title: "Compound interest",
    my: "အတိုးပေါ်အတိုး တွက်ချက်နည်း",
    category: "GROWTH",
    minutes: 12,
    description: "See how interest begins to earn interest of its own.",
    explanation:
      "ပေါင်းတိုး (Compound Interest) တွင် မူလငွေရင်းအပြင် အရင်ရသော အတိုးပေါ်ပါ အတိုးထပ်ရသည်။ နှစ်စဉ် nominal rate j နှင့် တစ်နှစ် m ကြိမ် ပေါင်းလျှင် တစ်ကြိမ်နှုန်းမှာ j ÷ m ဖြစ်သည်။ နေ့စဉ်တွက်ရာ၌ ဤ app သည် 365 ကြိမ်ကို သုံးသည်။",
    scenario:
      "100,000 ကျပ်ကို နှစ်စဉ် 8% ဖြင့် ၅ နှစ် စုထားမည်။ အတိုးကို တစ်နှစ်တစ်ကြိမ် ပေါင်းမည်။",
    formula: "FV = principal × (1 + annual rate / m)^(years × m)",
    values: [
      "Principal · 100,000 MMK",
      "Rate · 8% annually",
      "Term · 5 years",
      "Compounding · annual",
    ],
    steps: [
      clear,
      {
        keys: ["5", "n", "8", "i"],
        en: "Store five annual periods and 8% per period.",
        my: "n=5 နှင့် i=8 ကို မှတ်ပါ။",
      },
      {
        keys: ["1", "0", "0", "0", "0", "0", "CHS", "PV", "0", "PMT"],
        en: "The initial deposit is an outflow. There are no regular payments.",
        my: "အစထည့်ငွေ −100,000 ကို PV တွင် မှတ်ပြီး PMT ကို သုညထားပါ။",
      },
      {
        keys: ["FV"],
        en: "Solve FV. Subtract principal to find the accumulated interest.",
        my: "FV တွက်ပါ။ FV မှ မူလငွေ 100,000 နုတ်လျှင် ရရှိအတိုးကို သိနိုင်သည်။",
      },
    ],
    practice: {
      question:
        "100,000 grows at 10% compounded annually for 3 years. What is FV?",
      my: "100,000 ကျပ်ကို နှစ်စဉ် 10% ပေါင်းတိုးဖြင့် ၃ နှစ်ထားလျှင် FV ဘယ်လောက်လဲ။",
      answer: compound(100000, 10, 3, 1).toNumber(),
      unit: "MMK",
    },
    quiz: {
      question:
        "Is 12% nominal compounded monthly the same as a 12% effective annual rate?",
      my: "လစဉ်ပေါင်းသည့် nominal 12% သည် EAR 12% နှင့် တူသလား။",
      options: ["Yes", "No · its EAR is about 12.68%"],
      correct: 1,
      explanation:
        "EAR = (1 + 0.12/12)¹² − 1 = 12.6825% ဖြစ်သည်။ အတိုးထပ်ပေါင်းခြင်းကြောင့် nominal ထက် ပိုများသည်။",
    },
    takeaway:
      "အတိုးပေါင်းသည့် အကြိမ်ရေကို သိမှ nominal rate ကို မှန်ကန်စွာ နှိုင်းယှဉ်နိုင်သည်။",
  },
  {
    id: 6,
    title: "Simple interest",
    my: "ရိုးရိုးအတိုး တွက်ချက်နည်း",
    category: "INTEREST",
    minutes: 9,
    description:
      "Calculate interest on the original principal, with a clear day basis.",
    explanation:
      "ရိုးရိုးအတိုးသည် မူလငွေရင်းပေါ်တွင်သာ တွက်သည်။ အတိုးပေါ် အတိုးမထပ်ပါ။ နှစ်စဉ်နှုန်းကို ရက်နှင့်တွက်လျှင် အချိန်ကို days ÷ 360 သို့မဟုတ် days ÷ 365 သို့ ပြောင်းရသည်။ စာချုပ်၏ day-count basis ကို စစ်ပါ။",
    scenario:
      "100,000 ကျပ်ကို နှစ်စဉ် 12% ရိုးရိုးအတိုးဖြင့် ရက် ၉၀ ချေးမည်။ တစ်နှစ် 360 ရက် သတ်မှတ်သည်။",
    formula: "Interest = principal × annual rate × days / basis",
    values: [
      "Principal · 100,000 MMK",
      "Annual rate · 12%",
      "Days · 90",
      "Basis · 360 days",
    ],
    steps: [
      clear,
      {
        keys: ["9", "0", "n", "1", "2", "i"],
        en: "For simple interest, n holds days and i the annual rate.",
        my: "ရိုးရိုးအတိုးတွက်ရာတွင် n ကို ရက် 90၊ i ကို နှစ်စဉ် 12 ထားပါ။",
      },
      {
        keys: ["1", "0", "0", "0", "0", "0", "CHS", "PV"],
        en: "Store the principal with a negative sign.",
        my: "မူလချေးပေးငွေကို −100,000 PV အဖြစ် မှတ်ပါ။",
      },
      {
        keys: ["f", "i"],
        en: "f INT returns 360-day interest. R↓ then swap shows 365-day interest.",
        my: "f → i (INT) ဖြင့် 360 ရက်အခြေခံ အတိုး 3,000 ရမည်။ 365 ရက်အတိုးအတွက် R↓ → x↔y နှိပ်ပါ။",
      },
      {
        keys: ["+"],
        en: "Add the principal to find total repayment.",
        my: "+ ဖြင့် မူလငွေနှင့် အတိုး ပေါင်း၍ ပြန်ဆပ်ငွေ 103,000 ရှာပါ။",
      },
    ],
    practice: {
      question:
        "200,000 at 9% annual simple interest for 180 days on a 360-day basis. Find interest only.",
      my: "200,000 ကျပ်ကို နှစ်စဉ် 9% ဖြင့် ရက် 180 ချေးလျှင် 360 ရက်အခြေခံ အတိုး ဘယ်လောက်လဲ။",
      answer: simpleInterest(200000, 9, 180, 360).toNumber(),
      unit: "MMK",
    },
    quiz: {
      question:
        "With the same principal, rate and 90 days, which basis gives more interest?",
      my: "မူလငွေ၊ နှုန်းနှင့် ရက်တူလျှင် ဘယ် basis က အတိုးပိုများသလဲ။",
      options: ["360-day basis", "365-day basis"],
      correct: 0,
      explanation:
        "90/360 သည် 90/365 ထက် ပိုကြီးသဖြင့် 360 ရက်အခြေခံတွင် အတိုး ပိုများသည်။",
    },
    takeaway: "ရိုးရိုးအတိုးနှင့် ပေါင်းတိုးကို မရောထွေးပါနှင့်။",
  },
  {
    id: 7,
    title: "Simple discount",
    my: "အတိုးကြိုဖြတ် ချေးငွေတွက်နည်း",
    category: "BORROWING",
    minutes: 11,
    description:
      "Understand proceeds, upfront deductions, and the true borrowing cost.",
    explanation:
      "Bank discount တွင် အတိုးကို ကြိုနုတ်ယူပြီး ကျန်ငွေကိုသာ လက်ခံရသည်။ Face Value သည် နောက်ဆုံးပြန်ပေးရမည့် စာချုပ်ငွေဖြစ်သည်။ Proceeds သည် တကယ်လက်ခံငွေ ဖြစ်သည်။ ကုန်ကျစရိတ်နှုန်းကို proceeds အပေါ်တွက်ရသဖြင့် ကြော်ငြာနှုန်းထက် ပိုများနိုင်သည်။",
    scenario:
      "ရက် ၉၀ နောက် 100,000 ကျပ် ပြန်ပေးရမည့် ချေးငွေကို နှစ်စဉ် discount 12% ဖြင့် ကြိုဖြတ်မည်။ 360 ရက်အခြေခံ သုံးမည်။",
    formula:
      "Discount = face × d × t; proceeds = face − discount; cost = discount / proceeds / t",
    values: [
      "Face value · 100,000 MMK",
      "Discount rate · 12%",
      "Days · 90 / 360",
    ],
    steps: [
      {
        keys: ["1", "0", "0", "0", "0", "0", "ENTER", "1", "2", "%"],
        en: "Find 12% of the face value; retain face value in Y.",
        my: "100,000 → ENTER → 12 → % နှိပ်၍ နှစ်စာ discount 12,000 ရှာပါ။",
      },
      {
        keys: ["9", "0", "×", "3", "6", "0", "÷"],
        en: "Scale the annual discount to 90/360 of a year.",
        my: "90 နှင့်မြှောက်ပြီး 360 နှင့်စား၍ ရက် ၉၀ အတွက် ကြိုဖြတ်ငွေ 3,000 ရှာပါ။",
      },
      {
        keys: ["−"],
        en: "Subtract the discount from face value to get actual cash received.",
        my: "− နှိပ်ပါ။ တကယ်လက်ခံငွေ 97,000 ကျပ် ဖြစ်သည်။",
      },
    ],
    practice: {
      question:
        "Face value 200,000, discount 10% annually, 180/360 days. Find actual proceeds.",
      my: "200,000 ကျပ်ကို နှစ်စဉ် 10% discount ဖြင့် ရက် 180/360 ကြိုဖြတ်လျှင် တကယ်ရငွေ ဘယ်လောက်လဲ။",
      answer: discount(200000, 10, 180, 360).proceeds.toNumber(),
      unit: "MMK",
    },
    quiz: {
      question:
        "Which amount is the correct denominator for the actual borrowing cost?",
      my: "တကယ့်ချေးငွေကုန်ကျစရိတ်တွက်ရာတွင် ဘယ်ငွေကို အခြေခံရမလဲ။",
      options: ["Face value only", "Actual proceeds received"],
      correct: 1,
      explanation:
        "ဥပမာတွင် နှစ်စဉ်ရိုးရိုးကုန်ကျစရိတ် = 3,000 ÷ 97,000 × 360/90 = 12.3711% ဖြစ်သည်။ ဤနှုန်းသည် EAR မဟုတ်ပါ။",
    },
    takeaway:
      "ကြိုဖြတ်အတိုးနှင့် fees ရှိလျှင် ကြော်ငြာနှုန်းတူသော်လည်း တကယ်ကုန်ကျစရိတ် ကွာနိုင်သည်။",
  },
];
export const lessonKeys = (l: Lesson) => l.steps.flatMap((s) => s.keys);
export const expectedPractice = (lesson: Lesson, difficulty: number) =>
  D(lesson.practice.answer)
    .mul(difficulty + 1)
    .toNumber();
export function practiceKeys(l: Lesson, difficulty: number) {
  const mult = difficulty + 1;
  const input = (v: number) => String(v * mult).split("");
  const clean = ["f", "x↔y"];
  switch (l.id) {
    case 1:
      return [...input(40000), "ENTER", "2", "0", "%", "+"];
    case 2:
      return [
        ...clean,
        "g",
        "8",
        "1",
        "2",
        "n",
        "1",
        "2",
        "g",
        "i",
        ...input(200000),
        "PV",
        "0",
        "FV",
        "PMT",
        "CHS",
      ];
    case 3:
      return [
        ...clean,
        "g",
        "8",
        "1",
        "2",
        "n",
        "6",
        "g",
        "i",
        "0",
        "PV",
        ...input(5000),
        "CHS",
        "PMT",
        "FV",
      ];
    case 4:
      return [
        ...clean,
        "3",
        "n",
        "1",
        "0",
        "i",
        "0",
        "PMT",
        ...input(133100),
        "FV",
        "PV",
        "CHS",
      ];
    case 5:
      return [
        ...clean,
        "3",
        "n",
        "1",
        "0",
        "i",
        ...input(100000),
        "CHS",
        "PV",
        "0",
        "PMT",
        "FV",
      ];
    case 6:
      return [
        ...clean,
        "1",
        "8",
        "0",
        "n",
        "9",
        "i",
        ...input(200000),
        "CHS",
        "PV",
        "f",
        "i",
      ];
    case 7:
      return [
        ...input(200000),
        "ENTER",
        "1",
        "0",
        "%",
        "1",
        "8",
        "0",
        "×",
        "3",
        "6",
        "0",
        "÷",
        "−",
      ];
    default:
      return [];
  }
}
