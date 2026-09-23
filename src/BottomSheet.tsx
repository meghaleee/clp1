import { useEffect, useRef, useCallback, ReactNode, PointerEvent as RPointerEvent, FocusEvent as RFocusEvent } from "react";
import { createPortal } from "react-dom";

/* Tokens copied from SBILifePage so this file stays self-contained. */
const NAVY = "#2a2076";
const PINK = "#D60D47";
const BORDER = "#e4e0eb";
const GRAY = "#6f6f6f";

export interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  /** Omit to skip the title block entirely (e.g. a sheet with its own custom sticky sub-header). */
  title?: ReactNode;
  /** Falls back to `title` when it's a string. Set this when there's no title block but the sheet still needs a label. */
  ariaLabel?: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  /** Small line above the footer button, e.g. "While you wait…". */
  footerNote?: ReactNode;
  /** Pass a handler to show a back arrow on the left of the top bar. */
  onBack?: () => void;
  /** Push a history entry so Android Back / iOS edge-swipe closes the sheet. */
  historyEntry?: boolean;
  closeOnScrim?: boolean;
  draggable?: boolean;
}

/**
 * BottomSheet — mobile bottom sheet, desktop right-hand side sheet.
 *
 * Self-contained: carries its own <style> block the same way SBILifePage
 * does, so nothing in index.css or SBILifePage's styles has to change.
 * Every class it adds is prefixed `sheet-`; it reuses `.form-input`,
 * `.float-label` and `.btn-primary` from SBILifePage so fields and buttons
 * look identical to the hero form.
 *
 * Stacking: SBILifePage uses 300 (header), 299 (nav), 298 (secondary nav),
 * 400 (mobile menu), 500 (sticky bar). This sits at 1100 / 1101.
 */
export default function BottomSheet({
  open,
  onClose,
  title,
  ariaLabel,
  subtitle,
  children,
  footer,
  footerNote,
  onBack,
  historyEntry = true,
  closeOnScrim = true,
  draggable = true,
}: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const pushedRef = useRef(false);
  const dragRef = useRef<{
    y0: number; y: number; t: number; dy: number; v: number; active: boolean; id: number;
  } | null>(null);

  const close = useCallback(() => {
    if (pushedRef.current) {
      pushedRef.current = false;
      window.history.back();
    }
    onClose();
  }, [onClose]);

  /* ---- lock the page behind the sheet ---- */
  useEffect(() => {
    if (!open) return;
    const y = window.scrollY;
    const body = document.body;
    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevWidth = body.style.width;
    const prevOverflow = body.style.overflow;

    body.style.position = "fixed";
    body.style.top = `-${y}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";

    return () => {
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.width = prevWidth;
      body.style.overflow = prevOverflow;
      window.scrollTo(0, y);
    };
  }, [open]);

  /* ---- Android Back / iOS edge-swipe ---- */
  useEffect(() => {
    if (!open || !historyEntry) return;
    window.history.pushState({ sheet: true }, "");
    pushedRef.current = true;
    const onPop = () => {
      pushedRef.current = false;
      onClose();
    };
    window.addEventListener("popstate", onPop);
    return () => {
      window.removeEventListener("popstate", onPop);
      pushedRef.current = false;
    };
  }, [open, historyEntry, onClose]);

  /* ---- focus in on open, restore on close, trap while inside ---- */
  useEffect(() => {
    if (!open) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    const el = sheetRef.current;
    if (!el) return;

    const focusables =
      'input:not([disabled]),select:not([disabled]),textarea:not([disabled]),button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])';
    const first = el.querySelector<HTMLElement>(focusables);
    (first ?? el).focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
        return;
      }
      if (e.key !== "Tab") return;
      const items = el.querySelectorAll<HTMLElement>(focusables);
      if (!items.length) return;
      const a = items[0];
      const z = items[items.length - 1];
      if (e.shiftKey && document.activeElement === a) {
        e.preventDefault();
        z.focus();
      } else if (!e.shiftKey && document.activeElement === z) {
        e.preventDefault();
        a.focus();
      }
    };

    document.addEventListener("keydown", onKey, true);
    return () => {
      document.removeEventListener("keydown", onKey, true);
      returnFocusRef.current?.focus({ preventScroll: true });
    };
  }, [open, close]);

  /* ---- keep the focused field above the keyboard ---- */
  const onFocusCapture = (e: RFocusEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement;
    if (!t.matches?.("input,select,textarea")) return;
    window.setTimeout(() => {
      try {
        t.scrollIntoView({ block: "center", behavior: "smooth" });
      } catch {
        /* older Safari */
      }
    }, 260);
  };

  /* ---- drag to dismiss ----
     From the top bar / header immediately. From the body only once the
     body is already at the top and the gesture is downward, otherwise the
     sheet steals every upward scroll. */
  const onPointerDown = (e: RPointerEvent<HTMLDivElement>) => {
    if (!draggable || e.button) return;
    const target = e.target as HTMLElement;
    if (target.closest("button,a,input,select,textarea,label")) return;
    const fromGrip = !!target.closest("[data-sheet-grip]");
    const fromBody = !!target.closest("[data-sheet-body]");
    if (!fromGrip && !fromBody) return;

    dragRef.current = {
      y0: e.clientY, y: e.clientY, t: performance.now(),
      dy: 0, v: 0, active: fromGrip, id: e.pointerId,
    };
    if (fromGrip && sheetRef.current) {
      sheetRef.current.setPointerCapture(e.pointerId);
      sheetRef.current.dataset.dragging = "true";
    }
  };

  const onPointerMove = (e: RPointerEvent<HTMLDivElement>) => {
    const d = dragRef.current;
    const el = sheetRef.current;
    if (!d || !el) return;

    if (!d.active) {
      if (e.clientY - d.y0 > 8 && (bodyRef.current?.scrollTop ?? 0) <= 0) {
        d.active = true;
        d.y0 = e.clientY;
        d.t = performance.now();
        el.setPointerCapture(e.pointerId);
        el.dataset.dragging = "true";
      } else return;
    }

    const now = performance.now();
    let dy = e.clientY - d.y0;
    if (dy < 0) dy *= 0.18;
    d.v = (e.clientY - d.y) / Math.max(1, now - d.t);
    d.y = e.clientY;
    d.t = now;
    d.dy = dy;
    el.style.setProperty("--sheet-y", `${dy}px`);
    e.preventDefault();
  };

  const endDrag = () => {
    const d = dragRef.current;
    const el = sheetRef.current;
    dragRef.current = null;
    if (!d || !el) return;
    delete el.dataset.dragging;
    try {
      el.releasePointerCapture(d.id);
    } catch {
      /* already released */
    }
    const h = el.offsetHeight || 1;
    const go = d.active && (d.dy > h * 0.35 || (d.v > 0.55 && d.dy > 24));
    el.style.setProperty("--sheet-y", "0px");
    if (go) close();
  };

  if (!open) return null;

  return createPortal(
    <div className="sheet-layer">
      <style>{`
        /* ============================================================
           HOW TO READ THIS FILE
           Every sheet (Check Premium, Request a Callback, Plan Benefits)
           is built from the SAME shell defined here. If you change
           something in this file, it changes on ALL sheets. If you only
           want to change ONE sheet, edit that sheet's own .tsx file
           instead (CheckPremiumSheet.tsx / RequestCallbackSheet.tsx /
           PlanBenefitsSheet.tsx).
           Each rule below has a plain-language note on what it visually
           controls and its current size, so you can search for a class
           name (e.g. "sheet-close") and know what you're looking at.
        ============================================================ */

        /* Full-screen wrapper that holds the dark overlay + the sheet itself. */
        .sheet-layer { position: fixed; inset: 0; z-index: 1100; }

        /* The dark, semi-transparent backdrop behind the sheet. Tapping it closes the sheet. */
        .sheet-scrim {
          position: absolute; inset: 0;
          background: rgba(0,0,0,.45);   /* darkness of the overlay — 45% black */
          animation: sheet-fade .28s ease both;   /* fade-in speed */
        }

        /* THE SHEET ITSELF — the white rounded card that slides up from the bottom. */
        .sheet {
          --sheet-y: 0px;
          position: absolute; left: 0; right: 0; bottom: 0;
          z-index: 1101;
          display: flex; flex-direction: column;
          /* MAX HEIGHT of the whole sheet: capped at 660px tall, or the
             viewport height minus 40px, whichever is smaller — so on a
             short phone screen it never runs edge-to-edge and a sliver of
             the dimmed background stays tappable at the top.
             The on-screen keyboard is allowed to sit OVER the sheet
             (including the footer button) instead of shrinking it — that
             was a deliberate choice so typing doesn't make the layout jump. */
          max-height: min(660px, calc(100vh - 40px));
          max-height: min(660px, calc(100dvh - 40px));
          background: #fff;
          border-radius: 16px 16px 0 0;   /* rounded top corners only — change to round all 4 */
          box-shadow: 0 -2px 16px rgba(17,17,17,.16);   /* soft shadow above the sheet */
          transform: translateY(var(--sheet-y));
          animation: sheet-rise .34s cubic-bezier(.32,.72,0,1) both;   /* slide-up speed/easing on open */
          touch-action: none;
          outline: none;
        }
        .sheet[data-dragging="true"] { animation: none; transition: none; }

        @keyframes sheet-rise { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes sheet-fade { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .sheet, .sheet-scrim { animation-duration: .01ms; }
        }

        /* ============================================================
           TOP BAR — the row with the Back arrow (optional) and the
           Close (X) button. Present on every sheet, always visible,
           never scrolls.
        ============================================================ */
        .sheet-topbar {
          flex: none;
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px 0;   /* top/side spacing around the buttons */
          cursor: grab; touch-action: none;
        }
        .sheet-topbar:active { cursor: grabbing; }
        /* When a sheet has NO title block (like Request a Callback), this
           divider line sits directly under the Close button instead —
           see the .sheet-head divider note below for why it's either/or. */
        .sheet-topbar[data-divider="true"] {
          padding-bottom: 12px;
          border-bottom: 1px solid ${BORDER};
        }
        /* Invisible placeholder the same size as the Close button, used to
           keep Close centered/right-aligned when there's no Back button. */
        .sheet-topbar-spacer { width: 36px; height: 36px; }

        /* Back arrow button AND Close (X) button — same circle size for both. */
        .sheet-back, .sheet-close {
          width: 36px; height: 36px;   /* CIRCLE SIZE — the tappable button size */
          padding: 2px;
          display: flex; align-items: center; justify-content: center;
          border: none; border-radius: 50%; cursor: pointer;
        }
        .sheet-close { background: ${NAVY}; color: #fff; }   /* Close button fill color */
        .sheet-back { background: transparent; color: ${NAVY}; }
        .sheet-back:focus-visible, .sheet-close:focus-visible {
          outline: 2px solid ${NAVY}; outline-offset: 2px;   /* keyboard-focus ring, not usually visible on tap */
        }

        /* ============================================================
           HEAD / TITLE BLOCK — only renders when a sheet passes a
           `title` prop (Check Premium's steps, Plan Benefits' custom
           logo+tabs block). Sits below the top bar, above the scrolling
           body, and never scrolls itself.
           NOTE: this is where the divider line usually comes from
           (border-bottom below). A sheet with NO title (Request a
           Callback) doesn't render this block at all — that's why it
           needed its own divider added to .sheet-topbar above instead.
        ============================================================ */
        .sheet-head {
          flex: none;
          padding: 8px 20px 20px;   /* spacing around the title text */
          text-align: center;       /* Plan Benefits overrides this to left-align its custom content */
          border-bottom: 1px solid ${BORDER};   /* THE divider between header and scrolling body */
          cursor: grab; touch-action: none;
        }
        .sheet-head:active { cursor: grabbing; }
        /* Plain-text title styling (Check Premium's "Help us with a few basic details" etc). */
        .sheet-title {
          font-size: 24px; font-weight: 700; color: ${NAVY};
          line-height: 1.25; text-wrap: balance;
        }
        .sheet-subtitle {
          margin-top: 8px; font-size: 16px; font-weight: 400;
          color: ${GRAY}; line-height: 1.4;
        }

        /* THE SCROLLING AREA — everything between the header and the
           footer button lives here and scrolls if it's taller than the
           sheet. This is the ONE part of the sheet that scrolls. */
        .sheet-body {
          flex: 1; min-height: 0; overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain; touch-action: pan-y;
          padding: 24px 16px 16px;   /* spacing around the body content */
        }

        /* FOOTER — the primary button area pinned to the bottom (e.g.
           "Continue"). Only renders when a sheet passes a `footer` prop;
           never scrolls. */
        .sheet-foot {
          flex: none; background: #fff;
          border-top: 1px solid ${BORDER};   /* divider ABOVE the footer button */
          padding: 16px;
          padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));   /* extra room for iPhone home-bar */
        }
        .sheet-foot-note {
          margin-bottom: 12px; text-align: center;
          font-size: 14px; color: ${GRAY};
        }
        .sheet-foot .btn-primary:disabled {
          background: #c7c3d4; cursor: default; opacity: 1;   /* greyed-out look when the button is disabled */
        }

        /* ---- form fields: reuse .form-input and .float-label from SBILifePage ---- */
        .sheet-field { margin-bottom: 16px; }   /* gap below each field */
        .sheet-help { margin-top: 8px; font-size: 14px; color: ${GRAY}; line-height: 1.4; }   /* small grey helper text under a field */
        .sheet-req { color: ${PINK}; margin-left: 2px; }   /* the red/pink "*" for required fields */

        /* ============================================================
           DATE OF BIRTH — the DD / MM / YYYY segmented input on Check
           Premium's details step.
        ============================================================ */
        .sheet-dob {
          display: flex; align-items: center; gap: 6px;   /* gap between DD, /, MM, /, YYYY */
          height: 56px; padding: 0 16px;   /* BOX HEIGHT — matches other fields */
          border: 1px solid ${BORDER}; border-radius: 4px; background: #fff;
        }
        .sheet-dob-seg {
          flex: 0 0 28px; width: 28px;   /* width of the DD and MM boxes */
          border: none; outline: none;
          font-size: 16px; font-family: inherit; color: #111;
          text-align: center; padding: 0; background: transparent;
        }
        .sheet-dob-seg-year { flex-basis: 46px; width: 46px; text-align: left; }   /* wider YYYY box */
        .sheet-dob-seg::placeholder { color: #b6b2c2; }   /* "DD"/"MM"/"YYYY" placeholder color */
        .sheet-dob-sep { color: ${GRAY}; }   /* the "/" characters */
        .sheet-dob:focus-within { border-color: ${NAVY}; }   /* border turns navy while typing */

        /* Policy Term dropdown arrow (the custom-styled <select>). */
        select.form-input.sheet-select {
          -webkit-appearance: none; appearance: none;
          padding-right: 44px;
          background-color: #fff;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='8' viewBox='0 0 14 8'%3E%3Cpath d='M1 1l6 6 6-6' fill='none' stroke='%23111111' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
        }

        /* ============================================================
           PLAN BENEFITS — sticky sub-header (product logo + "Protection
           Plan" badge + Features/Advantages/Plan Benefits tabs).
           This whole block is passed in as PlanBenefitsSheet.tsx's
           `title` prop, so it renders inside .sheet-head above, and gets
           its divider line from .sheet-head's own border-bottom — NOT
           from anything in this section. (Logo size itself is set in
           PlanBenefitsSheet.tsx, not here — search that file for "height: 56".)
        ============================================================ */
        .sheet-subhead-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 12px; width: 100%;
        }
        .sheet-subhead-uin { margin-top: 6px; font-size: 10px; color: ${GRAY}; }   /* "UIN: 111N150V01" text size */
        .sheet-subhead-badge {
          flex: none; padding: 4px 16px; border-radius: 20px;   /* pill shape/padding */
          background: linear-gradient(90deg, ${PINK}, ${NAVY});   /* "Protection Plan" badge gradient colors */
          color: #fff; font-size: 12px; font-weight: 500;
        }
        .sheet-tabs {
          /* No border-bottom here on purpose — .sheet-head already draws
             ONE divider below all of its content, and the tabs are the
             last thing inside .sheet-head. Adding a border here too was
             the bug that made the divider look doubled — don't re-add it. */
          display: flex; gap: 24px; margin-top: 12px;   /* gap between "Features" / "Advantages" / "Plan Benefits" */
        }
        .sheet-tab {
          padding: 12px 0 10px; border: none; background: none; cursor: pointer;
          font-size: 14px; font-weight: 500; color: rgba(0,0,0,.5);   /* inactive tab text color */
          border-bottom: 2px solid transparent; margin-bottom: -1px;
        }
        .sheet-tab[data-active="true"] {
          color: ${NAVY}; border-bottom-color: ${NAVY};   /* active tab: navy text + navy underline */
        }

        /* ---- Plan Benefits: the scrolling Features list ---- */
        .sheet-feature-list { display: flex; flex-direction: column; gap: 16px; }   /* gap between each feature row */
        .sheet-feature-row { display: flex; gap: 8px; align-items: flex-start; }   /* gap between icon and text */
        .sheet-feature-icon { flex: none; width: 24px; height: 24px; }   /* feature icon size */
        .sheet-feature-title { font-size: 14px; font-weight: 600; color: #111; margin: 0 0 4px; }
        .sheet-feature-desc { font-size: 12px; color: rgba(0,0,0,.6); line-height: 1.25; margin: 0; }

        /* ============================================================
           QUESTION CARD — the bordered box around each chip question
           on Check Premium (gender, smoker, staff benefit, etc).
        ============================================================ */
        .sheet-question {
          margin: 0 0 20px; padding: 16px;   /* spacing inside/below each question card */
          border: 1px solid ${BORDER}; border-radius: 8px;
        }
        .sheet-question-label {
          /* float + full width stops <legend> notching the border */
          float: left; width: 100%; padding: 0;
          font-size: 16px; font-weight: 700; color: #111; line-height: 1.35;
        }
        .sheet-chips {
          clear: both; display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px;   /* gap between chip buttons */
        }
        .sheet-chip { position: relative; }
        .sheet-chip input { position: absolute; opacity: 0; width: 0; height: 0; }
        .sheet-chip span {
          display: flex; align-items: center; justify-content: center;
          min-height: 44px; padding: 0 14px;   /* chip button size */
          border: 1px solid ${BORDER}; border-radius: 8px;
          background: #fff; color: ${NAVY};
          font-size: 16px; line-height: 1.2; cursor: pointer;
        }
        .sheet-chip input:checked + span {
          background: ${NAVY}; border-color: ${NAVY}; color: #fff; font-weight: 700;   /* selected chip look */
        }
        .sheet-chip input:focus-visible + span {
          outline: 2px solid ${NAVY}; outline-offset: 2px;
        }

        /* ---- inline text button (e.g. "Change", "Resend OTP") ---- */
        .sheet-link {
          padding: 0; border: none; background: none; color: ${NAVY};
          font-size: inherit; font-weight: 700; text-decoration: underline; cursor: pointer;
        }
        .sheet-subtitle .sheet-link { margin-left: 8px; }
        .sheet-link:disabled {
          color: ${GRAY}; font-weight: 400; text-decoration: none; cursor: default;
        }

        /* ============================================================
           OTP — the 6 boxes on Check Premium's "Verify with OTP" step.
        ============================================================ */
        .sheet-otp-label { text-align: center; font-size: 16px; font-weight: 700; color: #111; }
        .sheet-otp { position: relative; margin: 20px 0 12px; }
        .sheet-otp-boxes {
          display: flex; justify-content: center; gap: 10px; pointer-events: none;   /* gap between the 6 boxes */
        }
        .sheet-otp-boxes i {
          display: flex; align-items: center; justify-content: center;
          width: 48px; height: 56px;   /* SIZE of each OTP digit box */
          border: 1px solid ${BORDER}; border-radius: 4px; background: #f4f3f7;
          font-style: normal; font-size: 20px; font-weight: 700; color: #111;
        }
        .sheet-otp-boxes i[data-filled="true"] { background: #fff; }
        .sheet-otp-boxes i[data-next="true"] {
          border-color: ${NAVY}; background: #fff; box-shadow: 0 0 0 3px rgba(42,32,118,.13);   /* highlighted "next" box */
        }
        .sheet-otp-field {
          position: absolute; inset: 0; width: 100%; height: 100%;
          border: none; background: none; opacity: 0;
          font-size: 16px;               /* still 16px even though invisible */
          color: transparent; caret-color: transparent;
        }
        .sheet-otp-meta {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; font-size: 14px; color: ${GRAY};
        }
        .sheet-otp-meta b { color: ${NAVY}; font-variant-numeric: tabular-nums; }

        /* ============================================================
           SUCCESS / CONFIRMATION SCREEN — used by Check Premium's
           "Callback Request Received" step and RequestCallbackSheet's
           success state.
        ============================================================ */
        .sheet-done { text-align: center; padding-top: 8px; }
        .sheet-done-art {
          position: relative; width: 132px; height: 132px; margin: 0 auto 20px;   /* size of the round icon graphic */
          border-radius: 50%; background: linear-gradient(145deg,#f7e3ef,#e2dff8);   /* its background gradient */
          display: flex; align-items: center; justify-content: center;
        }
        .sheet-done-glyph { font-size: 46px; color: ${NAVY}; }   /* the phone symbol size */
        .sheet-done-tick {
          position: absolute; left: 6px; bottom: 4px;
          width: 38px; height: 38px; border-radius: 11px;   /* the small checkmark badge size */
          background: ${NAVY}; color: #fff; font-size: 19px;
          display: flex; align-items: center; justify-content: center;
        }
        .sheet-done-title {
          margin-bottom: 16px; font-size: 20px; font-weight: 700;
          color: ${NAVY}; line-height: 1.35; text-wrap: balance;
        }
        .sheet-done-slot {
          display: inline-block; padding: 10px 16px; border-radius: 8px;
          background: #fdf3d3; color: #5b4a12; font-size: 14px; font-weight: 700;   /* the "Today between..." pill */
        }
        .sheet-done-reach {
          margin-top: 16px; font-size: 14px; color: ${GRAY}; line-height: 1.7;
        }
        .sheet-done-reach a { color: ${NAVY}; font-weight: 700; }

        /* ============================================================
           DESKTOP — above 769px wide, the same component becomes a
           right-hand side panel instead of a bottom sheet.
        ============================================================ */
        @media (min-width: 769px) {
          .sheet {
            top: 0; bottom: 0; left: auto; right: 0;
            width: 444px; max-height: none; border-radius: 0;   /* DESKTOP PANEL WIDTH */
            animation-name: sheet-slide-in;
          }
          @keyframes sheet-slide-in {
            from { transform: translateX(100%); }
            to { transform: translateX(0); }
          }
          .sheet-topbar, .sheet-head { cursor: default; }
        }
      `}</style>

      <div
        className="sheet-scrim"
        onClick={closeOnScrim ? close : undefined}
        aria-hidden="true"
      />

      <div
        className="sheet"
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? (typeof title === "string" ? title : undefined)}
        tabIndex={-1}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onFocusCapture={onFocusCapture}
      >
        <div className="sheet-topbar" data-sheet-grip data-divider={title ? undefined : "true"}>
          {onBack ? (
            <button type="button" className="sheet-back" onClick={onBack} aria-label="Back">
              <svg width="10" height="16" viewBox="0 0 10 16" aria-hidden="true">
                <path d="M8 1L2 8l6 7" fill="none" stroke="currentColor" strokeWidth="2"
                  strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <span className="sheet-topbar-spacer" aria-hidden="true" />
          )}
          <button type="button" className="sheet-close" onClick={close} aria-label="Close">
            <svg width="13" height="13" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M2 2l12 12M14 2L2 14" stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {title ? (
          <div className="sheet-head" data-sheet-grip>
            <div className="sheet-title">{title}</div>
            {subtitle ? <div className="sheet-subtitle">{subtitle}</div> : null}
          </div>
        ) : null}

        <div className="sheet-body" data-sheet-body ref={bodyRef}>
          {children}
        </div>

        {footer ? (
          <div className="sheet-foot">
            {footerNote ? <div className="sheet-foot-note">{footerNote}</div> : null}
            {footer}
          </div>
        ) : null}
      </div>
    </div>,
    document.body
  );
}
