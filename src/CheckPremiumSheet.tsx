import { useEffect, useRef, useState, ReactNode, KeyboardEvent as RKeyboardEvent } from "react";
import BottomSheet from "./BottomSheet";

/* ================================================================
   Three sheets, one flow:

     1  details  — Help us with a few basic details
     2  otp      — Verify with OTP
     3  success  — Callback Request Received

   They share one BottomSheet; only the contents swap, so the sheet
   does not close and reopen between steps.

   Fields reuse .form-input / .float-label / .btn-primary from
   SBILifePage, so they look identical to the hero form.
================================================================ */

export type CheckPremiumStep = "details" | "otp" | "success";

export interface CheckPremiumAnswers {
  sumAssured: number;
  term: string;
  dob: string;
  age: number | null;
  gender: string;
  smokes: string;
  staffBenefit: string;
  differentlyAbled: string;
}

/* ---------- helpers ---------- */

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight",
  "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
  "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function under1000(n: number): string {
  if (n < 20) return ONES[n];
  if (n < 100) return TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : "");
  return `${ONES[Math.floor(n / 100)]} Hundred${n % 100 ? ` ${under1000(n % 100)}` : ""}`;
}

/** 10000000 -> "Rupees One Crore" */
export function amountInWords(n: number): string {
  if (!n) return "";
  const cr = Math.floor(n / 1e7);
  let rem = n % 1e7;
  const lakh = Math.floor(rem / 1e5);
  rem %= 1e5;
  const th = Math.floor(rem / 1e3);
  const parts: string[] = [];
  if (cr) parts.push(`${under1000(cr)} Crore`);
  if (lakh) parts.push(`${under1000(lakh)} Lakh`);
  if (th) parts.push(`${under1000(th)} Thousand`);
  return parts.length ? `Rupees ${parts.join(" ")}` : "";
}

/** 10000000 -> "1,00,00,000" */
export function groupIndian(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (!digits) return "";
  const last3 = digits.slice(-3);
  const rest = digits.slice(0, -3);
  return (rest ? `${rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",")},` : "") + last3;
}

/** "1994-11-26" -> 31 */
export function ageFromISO(iso: string): number | null {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return null;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age >= 0 && age < 120 ? age : null;
}

/** "1994-11-26" -> { dd:"26", mm:"11", yyyy:"1994" } */
function isoToSegments(iso: string): { dd: string; mm: string; yyyy: string } {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return { dd: "", mm: "", yyyy: "" };
  return { yyyy: m[1], mm: m[2], dd: m[3] };
}

function isRealCalendarDate(y: string, m: string, d: string): boolean {
  const yn = Number(y), mn = Number(m), dn = Number(d);
  if (!yn || mn < 1 || mn > 12 || dn < 1 || dn > 31) return false;
  const dt = new Date(yn, mn - 1, dn);
  return dt.getFullYear() === yn && dt.getMonth() === mn - 1 && dt.getDate() === dn;
}

function maskPhone(p: string): string {
  const d = p.replace(/\D/g, "").slice(-10);
  return d.length === 10 ? `+91 ${d.slice(0, 5)} ${d.slice(5)}` : `+91 ${d}`;
}

/* ---------- a radio group drawn as chips ---------- */

function ChipGroup({
  legend, name, options, value, onChange, required, note,
}: {
  legend: string;
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  /** Optional helper copy shown inside the same card, below the chips. */
  note?: ReactNode;
}) {
  return (
    <fieldset className="sheet-question">
      <legend className="sheet-question-label">
        {legend}
        {required && <span className="sheet-req">*</span>}
      </legend>
      <div className="sheet-chips">
        {options.map((opt) => (
          <label className="sheet-chip" key={opt}>
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
      {/* .sheet-help's own margin-top (4px) is sized for a normal field hint.
          This note sits further down — Figma's Question Fields spec calls
          for 16px between the chip row and this kind of description text —
          so it's overridden here rather than in the shared CSS, since this
          is the only chip question that has a note under it. */}
      {note ? <div className="sheet-help" style={{ clear: "both", marginTop: 16 }}>{note}</div> : null}
    </fieldset>
  );
}

/* ---------- Date of Birth: 3 auto-advancing segments ----------
   Typing 2 digits into Day jumps to Month, 2 digits into Month jumps to
   Year; Backspace on an empty segment jumps back to the previous one.
   Keeps the same ISO (yyyy-mm-dd) contract as the native date input it
   replaces, so ageFromISO / the rest of the form don't need to change. */

function DobField({
  value, onChange, max, ariaLabel = "Date of Birth",
}: {
  value: string;
  onChange: (iso: string) => void;
  /** ISO yyyy-mm-dd — values after this are rejected, same as the old max="" */
  max?: string;
  ariaLabel?: string;
}) {
  const initial = isoToSegments(value);
  const [dd, setDd] = useState(initial.dd);
  const [mm, setMm] = useState(initial.mm);
  const [yyyy, setYyyy] = useState(initial.yyyy);
  const ddRef = useRef<HTMLInputElement | null>(null);
  const mmRef = useRef<HTMLInputElement | null>(null);
  const yyyyRef = useRef<HTMLInputElement | null>(null);

  /* stay in sync if the parent resets `value` (e.g. clearing the form) */
  useEffect(() => {
    const p = isoToSegments(value);
    setDd(p.dd); setMm(p.mm); setYyyy(p.yyyy);
  }, [value]);

  const emit = (d: string, m: string, y: string) => {
    if (d.length === 2 && m.length === 2 && y.length === 4 && isRealCalendarDate(y, m, d)) {
      const iso = `${y}-${m}-${d}`;
      onChange(max && iso > max ? "" : iso);
    } else {
      onChange("");
    }
  };

  const onDay = (raw: string) => {
    const v = raw.replace(/\D/g, "").slice(0, 2);
    setDd(v);
    emit(v, mm, yyyy);
    if (v.length === 2) mmRef.current?.focus();
  };
  const onMonth = (raw: string) => {
    const v = raw.replace(/\D/g, "").slice(0, 2);
    setMm(v);
    emit(dd, v, yyyy);
    if (v.length === 2) yyyyRef.current?.focus();
  };
  const onYear = (raw: string) => {
    const v = raw.replace(/\D/g, "").slice(0, 4);
    setYyyy(v);
    emit(dd, mm, v);
  };

  const backTo = (prev: () => void) => (e: RKeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !e.currentTarget.value) {
      e.preventDefault();
      prev();
    }
  };

  return (
    <div className="sheet-dob" role="group" aria-label={ariaLabel}>
      <input
        ref={ddRef} className="sheet-dob-seg" type="text" inputMode="numeric"
        placeholder="DD" maxLength={2} value={dd} aria-label="Day"
        onChange={(e) => onDay(e.target.value)}
      />
      <span className="sheet-dob-sep" aria-hidden="true">/</span>
      <input
        ref={mmRef} className="sheet-dob-seg" type="text" inputMode="numeric"
        placeholder="MM" maxLength={2} value={mm} aria-label="Month"
        onChange={(e) => onMonth(e.target.value)}
        onKeyDown={backTo(() => ddRef.current?.focus())}
      />
      <span className="sheet-dob-sep" aria-hidden="true">/</span>
      <input
        ref={yyyyRef} className="sheet-dob-seg sheet-dob-seg-year" type="text" inputMode="numeric"
        placeholder="YYYY" maxLength={4} value={yyyy} aria-label="Year"
        onChange={(e) => onYear(e.target.value)}
        onKeyDown={backTo(() => mmRef.current?.focus())}
      />
    </div>
  );
}

/* ---------- OTP: one real field, six drawn boxes ----------
   Six separate inputs would fire six focus events, and on iOS each one
   re-triggers the auto-zoom. inputMode numeric opens the number pad;
   autoComplete one-time-code lets iOS offer the code from Messages. */

function OtpField({
  value, onChange, length = 6,
}: {
  value: string;
  onChange: (v: string) => void;
  length?: number;
}) {
  const ref = useRef<HTMLInputElement | null>(null);
  const [focused, setFocused] = useState(false);
  return (
    <div className="sheet-otp" onClick={() => ref.current?.focus()}>
      <div className="sheet-otp-boxes" aria-hidden="true">
        {Array.from({ length }, (_, i) => (
          <i
            key={i}
            data-filled={value[i] ? "true" : undefined}
            data-next={focused && i === value.length ? "true" : undefined}
          >
            {value[i] || ""}
          </i>
        ))}
      </div>
      <input
        ref={ref}
        className="sheet-otp-field"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={length}
        value={value}
        aria-label={`Enter the ${length} digit OTP`}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, "").slice(0, length))}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
    </div>
  );
}

function useCountdown(active: boolean, seconds = 60): [number, () => void] {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (!active) return;
    setLeft(seconds);
    const id = window.setInterval(() => setLeft((n) => (n <= 1 ? 0 : n - 1)), 1000);
    return () => window.clearInterval(id);
  }, [active, seconds]);
  return [left, () => setLeft(seconds)];
}

/* ---------- the flow ---------- */

const TERMS = ["10 years", "15 years", "20 years", "25 years", "28 years", "30 years", "35 years", "40 years"];

export interface CheckPremiumSheetProps {
  open: boolean;
  onClose: () => void;
  /** Fired once the OTP is verified. */
  onVerified?: (answers: CheckPremiumAnswers) => void;
  /** Fired when "Check Premium" is tapped on the confirmation sheet. */
  onCheckPremium?: (answers: CheckPremiumAnswers) => void;
  phone?: string;
  initialStep?: CheckPremiumStep;
}

export default function CheckPremiumSheet({
  open,
  onClose,
  onVerified,
  onCheckPremium,
  phone = "9876543210",
  initialStep = "details",
}: CheckPremiumSheetProps) {
  const [step, setStep] = useState<CheckPremiumStep>(initialStep);

  const [sumAssured, setSumAssured] = useState("1,00,00,000");
  const [term, setTerm] = useState("28 years");
  const [dob, setDob] = useState("1994-11-26");
  const [gender, setGender] = useState("Male");
  const [smokes, setSmokes] = useState("Yes");
  const [staffBenefit, setStaffBenefit] = useState("No");
  const [differentlyAbled, setDifferentlyAbled] = useState("No");
  const [otp, setOtp] = useState("");

  const [resendLeft, restartResend] = useCountdown(open && step === "otp");

  useEffect(() => {
    if (open) setStep(initialStep);
    else setOtp("");
  }, [open, initialStep]);

  const numeric = Number(sumAssured.replace(/\D/g, "")) || 0;
  const age = ageFromISO(dob);

  const answers: CheckPremiumAnswers = {
    sumAssured: numeric, term, dob, age, gender, smokes, staffBenefit, differentlyAbled,
  };

  type StepConfig = {
    title: ReactNode;
    subtitle?: ReactNode;
    onBack?: () => void;
    cta: string;
    ctaDisabled?: boolean;
    footerNote?: ReactNode;
    onCta: () => void;
    body: ReactNode;
  };

  const sheets: Record<CheckPremiumStep, StepConfig> = {
    details: {
      title: "Help us with a few basic details",
      subtitle: "Fill in details as per your govt. documents",
      cta: "Continue",
      ctaDisabled: !numeric || age == null,
      onCta: () => setStep("otp"),
      body: (
        <>
          <div className="sheet-field">
            <div className="input-wrap">
              <span className="float-label">
                How much do you want to be covered for? (Sum Assured)
                <span className="req">*</span>
              </span>
              <input
                className="form-input"
                type="text"
                inputMode="numeric"
                autoComplete="off"
                aria-label="Sum Assured"
                value={`₹${sumAssured}`}
                onChange={(e) => setSumAssured(groupIndian(e.target.value))}
              />
            </div>
            <div className="sheet-help">{amountInWords(numeric) || "Enter a sum assured"}</div>
          </div>

          <div className="sheet-field">
            <div className="input-wrap">
              <span className="float-label">
                How long do you want to be covered for? (Policy Term)
                <span className="req">*</span>
              </span>
              <select
                className="form-input sheet-select"
                aria-label="Policy Term"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
              >
                {TERMS.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="sheet-field">
            <div className="input-wrap">
              <span className="float-label">
                Your Date of Birth<span className="req">*</span>
              </span>
              <DobField value={dob} onChange={setDob} max="2010-01-01" ariaLabel="Date of Birth" />
            </div>
            <div className="sheet-help">
              {age == null ? "Enter a valid date of birth" : `Age: ${age} years`}
            </div>
          </div>

          <ChipGroup legend="Your gender" name="cp-gender" required
            options={["Male", "Female", "Third Gender"]} value={gender} onChange={setGender} />
          <ChipGroup legend="Do you Smoke?" name="cp-smokes" required
            options={["Yes", "No"]} value={smokes} onChange={setSmokes} />

          <ChipGroup legend="Is Staff Benefit applicable to you?" name="cp-staff-benefit" required
            options={["Yes", "No"]} value={staffBenefit} onChange={setStaffBenefit}
            note="Staff benefit (Discount / Additional Allocation) is applicable for employees, retired employees, VRS holders, minor children and spouse of employees of SBI Life Insurance Co. Ltd, State Bank of India, RRBs sponsored by State Bank of India and subsidiaries of State Bank Group" />

          <ChipGroup legend="Are you differently abled?" name="cp-differently-abled" required
            options={["Yes", "No"]} value={differentlyAbled} onChange={setDifferentlyAbled} />
        </>
      ),
    },

    otp: {
      title: "Verify with OTP",
      subtitle: (
        <>
          Enter the 6 digit code sent to <b>{maskPhone(phone)}</b>
          <button type="button" className="sheet-link" onClick={() => setStep("details")}>
            Change
          </button>
        </>
      ),
      onBack: () => setStep("details"),
      cta: "Continue",
      ctaDisabled: otp.length < 6,
      onCta: () => {
        onVerified?.(answers);
        setStep("success");
      },
      body: (
        <>
          <div className="sheet-otp-label">Enter OTP</div>
          <OtpField value={otp} onChange={setOtp} />
          <div className="sheet-otp-meta">
            <button
              type="button"
              className="sheet-link"
              disabled={resendLeft > 0}
              onClick={() => {
                setOtp("");
                restartResend();
              }}
            >
              {resendLeft > 0 ? "Didn't receive the OTP?" : "Resend OTP"}
            </button>
            {resendLeft > 0 && (
              <span>
                Resend in <b>0:{String(resendLeft).padStart(2, "0")}</b>
              </span>
            )}
          </div>
        </>
      ),
    },

    success: {
      title: "Callback Request Received",
      cta: "Check Premium",
      footerNote: "While you wait, check your premium",
      onCta: () => {
        onCheckPremium?.(answers);
        onClose();
      },
      body: (
        <div className="sheet-done">
          {/* placeholder — swap in the illustration asset from the Figma file */}
          <div className="sheet-done-art" aria-hidden="true">
            <span className="sheet-done-glyph">☏</span>
            <span className="sheet-done-tick">✓</span>
          </div>
          <div className="sheet-done-title">
            Our experts will reach out to you from a 1600 XXX XXXX number
          </div>
          <div className="sheet-done-slot">Today between 9:00 AM to 9:00 PM</div>
          <div className="sheet-done-reach">
            Or you can reach out to us at <a href="tel:18002671800">1800 267 1800</a>
            <br />
            or at <a href="mailto:online.cell@sbilife.co.in">online.cell@sbilife.co.in</a>
          </div>
        </div>
      ),
    },
  };

  const s = sheets[step];

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      onBack={s.onBack}
      title={s.title}
      subtitle={s.subtitle}
      footerNote={s.footerNote}
      footer={
        <button type="button" className="btn-primary" disabled={s.ctaDisabled} onClick={s.onCta}>
          {s.cta}
        </button>
      }
    >
      {s.body}
    </BottomSheet>
  );
}
