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
        .sheet-layer { position: fixed; inset: 0; z-index: 1100; }

        .sheet-scrim {
          position: absolute; inset: 0;
          background: rgba(0,0,0,.45);
          animation: sheet-fade .28s ease both;
        }

        .sheet {
          --sheet-y: 0px;
          position: absolute; left: 0; right: 0; bottom: 0;
          z-index: 1101;
          display: flex; flex-direction: column;
          /* the design is ~660 on a 390x844 handset; derived from the live
             viewport so the dimmed strip stays tappable on shorter devices.
             The keyboard is allowed to overlay the sheet (incl. the footer
             button) rather than resizing it — simpler and matches how the
             native share sheet / most iOS keyboards behave. */
          max-height: min(660px, calc(100vh - 40px));
          max-height: min(660px, calc(100dvh - 40px));
          background: #fff;
          border-radius: 16px 16px 0 0;
          box-shadow: 0 -2px 16px rgba(17,17,17,.16);
          transform: translateY(var(--sheet-y));
          animation: sheet-rise .34s cubic-bezier(.32,.72,0,1) both;
          touch-action: none;
          outline: none;
        }
        .sheet[data-dragging="true"] { animation: none; transition: none; }

        @keyframes sheet-rise { from { transform: translateY(100%); } to { transform: translateY(0); } }
        @keyframes sheet-fade { from { opacity: 0; } to { opacity: 1; } }
        @media (prefers-reduced-motion: reduce) {
          .sheet, .sheet-scrim { animation-duration: .01ms; }
        }

        /* ---- top bar: close sits in normal flow, not floating ---- */
        .sheet-topbar {
          flex: none;
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px 0;
          cursor: grab; touch-action: none;
        }
        .sheet-topbar:active { cursor: grabbing; }
        .sheet-topbar-spacer { width: 44px; height: 44px; }

        .sheet-back, .sheet-close {
          width: 44px; height: 44px; padding: 2px;
          display: flex; align-items: center; justify-content: center;
          border: none; border-radius: 50%; cursor: pointer;
        }
        .sheet-close { background: ${NAVY}; color: #fff; }
        .sheet-back { background: transparent; color: ${NAVY}; }
        .sheet-back:focus-visible, .sheet-close:focus-visible {
          outline: 2px solid ${NAVY}; outline-offset: 2px;
        }

        .sheet-head {
          flex: none;
          padding: 8px 20px 20px;
          text-align: center;
          border-bottom: 1px solid ${BORDER};
          cursor: grab; touch-action: none;
        }
        .sheet-head:active { cursor: grabbing; }
        .sheet-title {
          font-size: 24px; font-weight: 700; color: ${NAVY};
          line-height: 1.25; text-wrap: balance;
        }
        .sheet-subtitle {
          margin-top: 8px; font-size: 16px; font-weight: 400;
          color: ${GRAY}; line-height: 1.4;
        }

        .sheet-body {
          flex: 1; min-height: 0; overflow-y: auto;
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain; touch-action: pan-y;
          padding: 24px 16px 16px;
        }

        .sheet-foot {
          flex: none; background: #fff;
          border-top: 1px solid ${BORDER};
          padding: 16px;
          padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
        }
        .sheet-foot-note {
          margin-bottom: 12px; text-align: center;
          font-size: 14px; color: ${GRAY};
        }
        .sheet-foot .btn-primary:disabled {
          background: #c7c3d4; cursor: default; opacity: 1;
        }

        /* ---- fields: reuse .form-input and .float-label from SBILifePage ---- */
        .sheet-field { margin-bottom: 16px; }
        .sheet-help { margin-top: 8px; font-size: 14px; color: ${GRAY}; line-height: 1.4; }
        .sheet-req { color: ${PINK}; margin-left: 2px; }

        /* ---- DD / MM / YYYY segmented date entry ---- */
        .sheet-dob {
          display: flex; align-items: center; gap: 6px;
          height: 56px; padding: 0 16px;
          border: 1px solid ${BORDER}; border-radius: 4px; background: #fff;
        }
        .sheet-dob-seg {
          flex: 0 0 28px; width: 28px; border: none; outline: none;
          font-size: 16px; font-family: inherit; color: #111;
          text-align: center; padding: 0; background: transparent;
        }
        .sheet-dob-seg-year { flex-basis: 46px; width: 46px; text-align: left; }
        .sheet-dob-seg::placeholder { color: #b6b2c2; }
        .sheet-dob-sep { color: ${GRAY}; }
        .sheet-dob:focus-within { border-color: ${NAVY}; }

        select.form-input.sheet-select {
          -webkit-appearance: none; appearance: none;
          padding-right: 44px;
          background-color: #fff;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='8' viewBox='0 0 14 8'%3E%3Cpath d='M1 1l6 6 6-6' fill='none' stroke='%23111111' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 16px center;
        }

        /* ---- Plan Benefits: sticky sub-header (logo + badge + tabs) ---- */
        .sheet-subhead-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 12px; width: 100%;
        }
        .sheet-subhead-uin { margin-top: 6px; font-size: 10px; color: ${GRAY}; }
        .sheet-subhead-badge {
          flex: none; padding: 4px 16px; border-radius: 20px;
          background: linear-gradient(90deg, ${PINK}, ${NAVY});
          color: #fff; font-size: 12px; font-weight: 500;
        }
        .sheet-tabs {
          display: flex; gap: 24px; margin-top: 12px;
          border-bottom: 1px solid ${BORDER};
        }
        .sheet-tab {
          padding: 12px 0 10px; border: none; background: none; cursor: pointer;
          font-size: 14px; font-weight: 500; color: rgba(0,0,0,.5);
          border-bottom: 2px solid transparent; margin-bottom: -1px;
        }
        .sheet-tab[data-active="true"] {
          color: ${NAVY}; border-bottom-color: ${NAVY};
        }

        /* ---- Plan Benefits: feature list ---- */
        .sheet-feature-list { display: flex; flex-direction: column; gap: 16px; }
        .sheet-feature-row { display: flex; gap: 8px; align-items: flex-start; }
        .sheet-feature-icon { flex: none; width: 24px; height: 24px; }
        .sheet-feature-title { font-size: 14px; font-weight: 600; color: #111; margin: 0 0 4px; }
        .sheet-feature-desc { font-size: 12px; color: rgba(0,0,0,.6); line-height: 1.25; margin: 0; }

        /* ---- question card with chip answers ---- */
        .sheet-question {
          margin: 0 0 20px; padding: 16px;
          border: 1px solid ${BORDER}; border-radius: 8px;
        }
        .sheet-question-label {
          /* float + full width stops <legend> notching the border */
          float: left; width: 100%; padding: 0;
          font-size: 16px; font-weight: 700; color: #111; line-height: 1.35;
        }
        .sheet-chips {
          clear: both; display: flex; flex-wrap: wrap; gap: 12px; margin-top: 16px;
        }
        .sheet-chip { position: relative; }
        .sheet-chip input { position: absolute; opacity: 0; width: 0; height: 0; }
        .sheet-chip span {
          display: flex; align-items: center; justify-content: center;
          min-height: 44px; padding: 0 14px;
          border: 1px solid ${BORDER}; border-radius: 8px;
          background: #fff; color: ${NAVY};
          font-size: 16px; line-height: 1.2; cursor: pointer;
        }
        .sheet-chip input:checked + span {
          background: ${NAVY}; border-color: ${NAVY}; color: #fff; font-weight: 700;
        }
        .sheet-chip input:focus-visible + span {
          outline: 2px solid ${NAVY}; outline-offset: 2px;
        }

        /* ---- inline text button (Change, Resend OTP) ---- */
        .sheet-link {
          padding: 0; border: none; background: none; color: ${NAVY};
          font-size: inherit; font-weight: 700; text-decoration: underline; cursor: pointer;
        }
        .sheet-subtitle .sheet-link { margin-left: 8px; }
        .sheet-link:disabled {
          color: ${GRAY}; font-weight: 400; text-decoration: none; cursor: default;
        }

        /* ---- OTP: one real field behind six drawn boxes ---- */
        .sheet-otp-label { text-align: center; font-size: 16px; font-weight: 700; color: #111; }
        .sheet-otp { position: relative; margin: 20px 0 12px; }
        .sheet-otp-boxes {
          display: flex; justify-content: center; gap: 10px; pointer-events: none;
        }
        .sheet-otp-boxes i {
          display: flex; align-items: center; justify-content: center;
          width: 48px; height: 56px;
          border: 1px solid ${BORDER}; border-radius: 4px; background: #f4f3f7;
          font-style: normal; font-size: 20px; font-weight: 700; color: #111;
        }
        .sheet-otp-boxes i[data-filled="true"] { background: #fff; }
        .sheet-otp-boxes i[data-next="true"] {
          border-color: ${NAVY}; background: #fff; box-shadow: 0 0 0 3px rgba(42,32,118,.13);
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

        /* ---- confirmation ---- */
        .sheet-done { text-align: center; padding-top: 8px; }
        .sheet-done-art {
          position: relative; width: 132px; height: 132px; margin: 0 auto 20px;
          border-radius: 50%; background: linear-gradient(145deg,#f7e3ef,#e2dff8);
          display: flex; align-items: center; justify-content: center;
        }
        .sheet-done-glyph { font-size: 46px; color: ${NAVY}; }
        .sheet-done-tick {
          position: absolute; left: 6px; bottom: 4px;
          width: 38px; height: 38px; border-radius: 11px;
          background: ${NAVY}; color: #fff; font-size: 19px;
          display: flex; align-items: center; justify-content: center;
        }
        .sheet-done-title {
          margin-bottom: 16px; font-size: 20px; font-weight: 700;
          color: ${NAVY}; line-height: 1.35; text-wrap: balance;
        }
        .sheet-done-slot {
          display: inline-block; padding: 10px 16px; border-radius: 8px;
          background: #fdf3d3; color: #5b4a12; font-size: 14px; font-weight: 700;
        }
        .sheet-done-reach {
          margin-top: 16px; font-size: 14px; color: ${GRAY}; line-height: 1.7;
        }
        .sheet-done-reach a { color: ${NAVY}; font-weight: 700; }

        /* ---- desktop: same component as a right-hand side sheet ---- */
        @media (min-width: 769px) {
          .sheet {
            top: 0; bottom: 0; left: auto; right: 0;
            width: 444px; max-height: none; border-radius: 0;
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
        <div className="sheet-topbar" data-sheet-grip>
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
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
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
