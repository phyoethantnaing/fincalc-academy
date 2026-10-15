import { Calculator } from "./engine/rpn";
import { D, type Variable } from "./engine/finance";
export const money = (v: number | string, decimals = 2, separator = true) =>
  new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: separator,
  }).format(Number(v));
export function readStore<T>(key: string, fallback: T): T {
  try {
    return (
      JSON.parse(localStorage.getItem("fincalc." + key) || "null") ?? fallback
    );
  } catch {
    return fallback;
  }
}
export function writeStore(key: string, value: unknown) {
  try {
    localStorage.setItem("fincalc." + key, JSON.stringify(value));
  } catch {
    /* private mode or full storage: calculations still work */
  }
}
export function snapshot(c: Calculator) {
  return {
    stack: c.stack.map(String),
    lastX: String(c.lastX),
    financial: Object.fromEntries(
      Object.entries(c.financial).map(([k, v]) => [k, String(v)]),
    ),
    registers: Object.fromEntries(
      Object.entries(c.registers).map(([k, v]) => [k, String(v)]),
    ),
    begin: c.begin,
    flows: c.flows.map(String),
    repeats: c.repeats,
    history: c.history,
  };
}
export type Snapshot = ReturnType<typeof snapshot>;
export function restore(s: Snapshot) {
  const c = new Calculator();
  c.stack = s.stack.map(D);
  c.lastX = D(s.lastX);
  for (const k of Object.keys(c.financial) as Variable[])
    c.financial[k] = D(s.financial[k]);
  c.registers = Object.fromEntries(
    Object.entries(s.registers).map(([k, v]) => [k, D(v)]),
  );
  c.begin = s.begin;
  c.flows = s.flows.map(D);
  c.repeats = s.repeats;
  c.history = s.history;
  return c;
}
export function download(name: string, content: string, type = "text/plain") {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([content], { type }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
export const KEY_HELP: Record<
  string,
  { en: string; my: string; example: string }
> = {
  n: {
    en: "Number of periods",
    my: "အတိုးတွက်မည့် သို့မဟုတ် ငွေပေးချေမည့် အကြိမ်အရေအတွက်။ n တွင် လထည့်လျှင် i ကိုလည်း လစဉ်နှုန်း ထည့်ပါ။",
    example: "12 → n",
  },
  i: {
    en: "Periodic interest rate (%)",
    my: "တစ်ကြိမ်စာ အတိုးနှုန်း (%)။ နှစ်စဉ် nominal 12% ကို လစဉ်ပြောင်းရန် 12 → g → i နှိပ်ပါ။",
    example: "12 → g → i",
  },
  PV: {
    en: "Present value",
    my: "ဒီနေ့မှာရှိသော ငွေတန်ဖိုး။ လက်ခံရသောငွေကို အပေါင်း၊ ပေးထွက်သောငွေကို အနုတ်ထားပါ။",
    example: "100000 → PV",
  },
  PMT: {
    en: "Periodic payment",
    my: "တစ်ကြိမ်ချင်း ပေးရမည့် သို့မဟုတ် ရမည့် ငွေ။ အခြားတန်ဖိုးများကို မှတ်ပြီး PMT နှိပ်၍ ရှာနိုင်သည်။",
    example: "0 → FV → PMT",
  },
  FV: {
    en: "Future value",
    my: "အနာဂတ်တွင် ဖြစ်လာမည့် ငွေတန်ဖိုး။ ချေးငွေအကုန်ဆပ်ရန် FV=0 ထားပါ။",
    example: "0 → FV",
  },
  ENTER: {
    en: "Enter / duplicate X",
    my: "X ကို Y သို့ ကူး၍ နောက်ကိန်းထည့်နိုင်ရန် ခွဲပေးသည်။ RPN တွင် ညီမျှခြင်းခလုတ် မလိုပါ။",
    example: "2 → ENTER → 3 → +",
  },
  CHS: {
    en: "Change sign",
    my: "အပေါင်းနှင့် အနုတ်ကို ပြောင်းပေးသည်။ ငွေထည့်စုခြင်းနှင့် ချေးငွေပြန်ဆပ်ခြင်းကို အနုတ်ထားသည်။",
    example: "100 → CHS",
  },
  f: {
    en: "Gold shift",
    my: "နောက်ခလုတ်၏ ရွှေရောင်လုပ်ဆောင်ချက်ကို ရွေးပေးသည်။ f → 2 သည် ဒဿမ ၂ နေရာ ပြသည်။",
    example: "f → x↔y = FIN CLEAR",
  },
  g: {
    en: "Blue shift",
    my: "နောက်ခလုတ်၏ အပြာရောင်လုပ်ဆောင်ချက်ကို ရွေးပေးသည်။",
    example: "g → 8 = END",
  },
  STO: {
    en: "Store a register",
    my: "ဖန်သားပြင်တန်ဖိုးကို 0–9 မှတ်ဉာဏ်တစ်ခုတွင် သိမ်းသည်။",
    example: "42 → STO → 1",
  },
  RCL: {
    en: "Recall a register",
    my: "သိမ်းထားသောတန်ဖိုးကို ပြန်ခေါ်သည်။ အများအားဖြင့် stack ကို မြှင့်သည်။",
    example: "RCL → 1",
  },
  "R↓": {
    en: "Roll stack down",
    my: "Y ကို X၊ Z ကို Y၊ T ကို Z၊ X ကို T သို့ လှည့်ပြောင်းသည်။",
    example: "R↓ → R↓ → R↓ → R↓",
  },
  "x↔y": {
    en: "Swap X and Y",
    my: "လက်ရှိကိန်းနှင့် အရင်ကိန်းကို လဲလှယ်သည်။",
    example: "2 → ENTER → 3 → x↔y",
  },
  CLx: {
    en: "Clear X",
    my: "ဖန်သားပြင်ကို သုညထားသည်။ နောက်ကိန်းသည် stack မမြှင့်ဘဲ X ကို အစားထိုးသည်။",
    example: "CLx → 5",
  },
  EEX: {
    en: "Enter exponent",
    my: "သိပ္ပံကိန်းပုံစံ၏ 10 ၏ပါဝါကို ထည့်သည်။",
    example: "2 → EEX → 3 = 2000",
  },
  "%": {
    en: "Percent",
    my: "Y ၏ X ရာခိုင်နှုန်းကို တွက်ပြီး Y တွင် အခြေခံငွေကို ချန်ထားသည်။",
    example: "200 → ENTER → 10 → %",
  },
  "Δ%": {
    en: "Percent change",
    my: "အရင်တန်ဖိုး Y မှ တန်ဖိုးသစ် X သို့ ပြောင်းလဲမှုနှုန်း။",
    example: "100 → ENTER → 120 → Δ%",
  },
  "%T": {
    en: "Percent of total",
    my: "စုစုပေါင်း Y ၏ အစိတ်အပိုင်း X ကို ရာခိုင်နှုန်းတွက်သည်။",
    example: "200 → ENTER → 50 → %T",
  },
  yˣ: {
    en: "Power",
    my: "Y ကို X ပါဝါတင်သည်။ g ဖြင့် square root ရသည်။",
    example: "2 → ENTER → 3 → yˣ",
  },
  "1/x": {
    en: "Reciprocal",
    my: "တစ်ကို လက်ရှိကိန်းဖြင့် စားသည်။",
    example: "4 → 1/x = 0.25",
  },
};

Object.assign(KEY_HELP, {
  "+": {
    en: "Addition",
    my: "Y နှင့် X ကို ပေါင်းပြီး အဖြေကို X တွင်ထားသည်။ Stack တစ်ဆင့်ကျသည်။",
    example: "2 → ENTER → 3 → + = 5",
  },
  "−": {
    en: "Subtraction",
    my: "Y ထဲမှ X ကို နုတ်သည်။ အစီအစဉ်ကို သတိထားပါ။",
    example: "8 → ENTER → 3 → − = 5",
  },
  "×": {
    en: "Multiplication",
    my: "Y နှင့် X ကို မြှောက်ပြီး stack တစ်ဆင့်ချသည်။",
    example: "2 → ENTER → 3 → × = 6",
  },
  "÷": {
    en: "Division",
    my: "Y ကို X ဖြင့်စားသည်။ သုညဖြင့် မစားနိုင်ပါ။",
    example: "8 → ENTER → 2 → ÷ = 4",
  },
  ON: {
    en: "Power on / off",
    my: "ဖန်သားပြင်ကို ဖွင့်ပိတ်သည်။ ပိတ်ထားသော်လည်း မှတ်ဉာဏ်ထဲမှ ကိန်းများ မပျက်ပါ။",
    example: "ON → ON",
  },
  "R/S": {
    en: "Run / stop — unsupported",
    my: "မူလစက်၏ ပရိုဂရမ်စတင်/ရပ်နားခလုတ် ဖြစ်သည်။ ဤပညာရေး app တွင် ပရိုဂရမ်မှတ်ဉာဏ်လုပ်ဆောင်ချက်ကို မပံ့ပိုးသေးပါ။",
    example: "Unsupported · programming",
  },
  SST: {
    en: "Single step — unsupported",
    my: "မူလစက်၏ ပရိုဂရမ်တစ်ဆင့်စီ လုပ်ဆောင်ခြင်း ဖြစ်သည်။ ဤ app တွင် မပံ့ပိုးသေးပါ။",
    example: "Unsupported · programming",
  },
  "Σ+": {
    en: "Statistics accumulation — unsupported",
    my: "မူလစက်၏ စာရင်းအင်းဒေတာထည့်ခလုတ် ဖြစ်သည်။ ဤ app တွင် စာရင်းအင်းစနစ် မပံ့ပိုးသေးပါ။",
    example: "Unsupported · statistics",
  },
  ".": {
    en: "Decimal point",
    my: "ဒဿမကိန်း ရိုက်ထည့်ရန် အသုံးပြုသည်။ ကိန်းတစ်ခုတွင် ဒဿမအမှတ် တစ်ကြိမ်သာ ထည့်နိုင်သည်။",
    example: "1 → . → 5 = 1.5",
  },
});
for (let digit = 0; digit <= 9; digit++)
  KEY_HELP[String(digit)] = {
    en: `Digit ${digit}`,
    my: "ကိန်းတစ်ခု၏ ဂဏန်းကို ထည့်သည်။ ENTER နောက်တွင် X ကို အစားထိုးပြီး တွက်ချက်မှုအဖြေနောက်တွင် stack ကို မြှင့်သည်။",
    example: `${digit} → ENTER → 2 → +`,
  };
