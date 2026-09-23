import { useEffect, useState } from "react";
import BottomSheet from "./BottomSheet";

/* Tokens copied from SBILifePage / BottomSheet so this file stays self-contained. */
const NAVY = "#2a2076";
const GRAY = "#6f6f6f";
const BORDER = "#e4e0eb";

/* ---------- small inline icons ----------
   Drawn inline rather than fetched as separate SVG files, matching how
   SBILifePage already does its small UI glyphs (PhoneSVG / ShieldSVG /
   ChevronSVG) — no new icon files needed for these. */

function PhoneGlyph({ color = NAVY, size = 20 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6.6 10.8c1.3 2.7 3.5 4.9 6.2 6.2l2.1-2.1c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.7c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1.1l-2.1 2.1Z"
        fill={color}
      />
    </svg>
  );
}

function ShieldGlyph({ color = GRAY, size = 14 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 2 4 5v6c0 5 3.4 9.4 8 11 4.6-1.6 8-6 8-11V5l-8-3Z"
        stroke={color} strokeWidth="1.6" strokeLinejoin="round" fill="none"
      />
    </svg>
  );
}

function ChevronGlyph({ color = GRAY, size = 10 }: { color?: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 8" fill="none" aria-hidden="true">
      <path d="M1 1l5 5 5-5" stroke={color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export interface RequestCallbackAnswers {
  firstName: string;
  lastName: string;
  mobile: string;
}

export interface RequestCallbackSheetProps {
  open: boolean;
  onClose: () => void;
  /** Fired once the visitor submits a valid request. */
  onSubmit?: (answers: RequestCallbackAnswers) => void;
  /** Shown in the "Want to learn more about …" heading and, per the codebase's
   *  PRODUCTS naming, kept separate from the hero product name it defaults to. */
  productName?: string;
}

type Step = "form" | "success";

export default function RequestCallbackSheet({
  open,
  onClose,
  onSubmit,
  productName = "SBI Life - Smart Shield Plus",
}: RequestCallbackSheetProps) {
  const [step, setStep] = useState<Step>("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [consent, setConsent] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep("form");
    setFirstName("");
    setLastName("");
    setMobile("");
    setConsent(false);
  }, [open]);

  const mobileDigits = mobile.replace(/\D/g, "");
  const canSubmit = firstName.trim().length > 0 && mobileDigits.length === 10 && consent;

  const answers: RequestCallbackAnswers = { firstName, lastName, mobile: mobileDigits };

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      ariaLabel="Request a callback"
      footer={
        step === "form" ? (
          <button
            type="button"
            className="btn-primary"
            disabled={!canSubmit}
            onClick={() => {
              onSubmit?.(answers);
              setStep("success");
            }}
          >
            Continue
          </button>
        ) : (
          <button type="button" className="btn-primary" onClick={onClose}>
            Done
          </button>
        )
      }
    >
      {step === "form" ? (
        <>
          <div style={{ textAlign: "center", marginBottom: 16 }}>
            <p style={{ fontSize: 20, fontWeight: 600, color: NAVY, lineHeight: 1.35, margin: 0 }}>
              Want to learn more about {productName}? Call us at
            </p>
          </div>

          <a
            href="tel:18002671800"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              background: "#f4f2f8", borderRadius: 8, padding: "12px 0", marginBottom: 20,
              textDecoration: "none",
            }}
          >
            <PhoneGlyph />
            <span style={{ fontSize: 24, fontWeight: 600, color: NAVY }}>1800 267 1800</span>
          </a>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <span style={{ flex: 1, height: 1, background: BORDER }} />
            <span style={{ fontSize: 12, color: GRAY, opacity: 0.8 }}>OR</span>
            <span style={{ flex: 1, height: 1, background: BORDER }} />
          </div>

          <p style={{ fontSize: 16, fontWeight: 600, color: "#111", textAlign: "center", margin: "0 0 16px" }}>
            Request a Callback
          </p>

          <div className="sheet-field" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 8 }}>
            <div className="input-wrap">
              <span className="float-label">First Name<span className="req">*</span></span>
              <input
                className="form-input"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoComplete="given-name"
              />
            </div>
            <div className="input-wrap">
              <span className="float-label">Last Name</span>
              <input
                className="form-input"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
              />
            </div>
          </div>
          <div className="sheet-help" style={{ marginTop: -4 }}>As per Govt. ID proof</div>

          <div className="sheet-field" style={{ marginTop: 16 }}>
            <div className="input-wrap">
              <span className="float-label">Mobile<span className="req">*</span></span>
              <div className="form-input" style={{ display: "flex", alignItems: "center", gap: 8, height: 56, padding: "0 16px" }}>
                <span style={{ color: GRAY, fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
                  <ChevronGlyph /> +91
                </span>
                <span style={{ width: 1, height: 20, background: BORDER, flexShrink: 0 }} />
                <input
                  type="tel"
                  inputMode="numeric"
                  aria-label="Mobile number"
                  value={mobile}
                  maxLength={10}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  style={{ border: "none", outline: "none", fontSize: 14, color: "#111", width: "100%" }}
                />
              </div>
            </div>
          </div>
          <div className="sheet-help" style={{ marginTop: -4, display: "flex", alignItems: "center", gap: 6 }}>
            <ShieldGlyph /> We don&apos;t spam
          </div>

          <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", marginTop: 20 }}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              style={{ width: 16, height: 16, marginTop: 1, accentColor: NAVY, flexShrink: 0 }}
            />
            <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.5)", lineHeight: 1.25 }}>
              I accept SBI Life&apos;s{" "}
              <a href="https://www.sbilife.co.in/en/privacy-policy" target="_blank" rel="noreferrer"
                style={{ color: "#111", textDecoration: "underline" }}>Privacy policy</a>{" "}
              and by submitting my contact details here, I override my NCPR registration and authorise SBI
              Life and its authorised representatives to contact me and send information/communication
              relating to this proposal/or the resulting policy through SMS /Email /Phone /Letter
              /WhatsApp /any other electronic mode of communication to my registered email id/mobile
              number.
            </span>
          </label>
        </>
      ) : (
        <div className="sheet-done">
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
      )}
    </BottomSheet>
  );
}
