import { useState } from "react";
import BottomSheet from "./BottomSheet";

const NAVY = "#2a2076";
const PINK = "#D60D47";
const GRAY = "#6f6f6f";

/* Same tiny helper SBILifePage uses for its own feature icons —
   `name` maps to /public/icons/<name>.svg. */
const Icon = ({ name, size = 24 }: { name: string; size?: number }) => (
  <img
    src={`./icons/${name}.svg`}
    alt=""
    width={size}
    height={size}
    style={{ objectFit: "contain", display: "block", flexShrink: 0 }}
  />
);

/* One icon for every row for now — the point of this sheet is proving out
   the sticky sub-header + tabs + scrolling-body pattern, not a full icon
   set. Swap in per-feature icons later without touching the layout. */
const FEATURE_ICON = "shieldcheck";

type Tab = "features" | "advantages" | "benefits";

const TABS: { key: Tab; label: string }[] = [
  { key: "features", label: "Features" },
  { key: "advantages", label: "Advantages" },
  { key: "benefits", label: "Plan Benefits" },
];

const FEATURES: { title: string; desc: string }[] = [
  {
    title: "Three Plan Options",
    desc: "Level Cover, Increasing Cover, and Level Cover with Future Benefit options.",
  },
  {
    title: "Customisable Cover",
    desc: "Flexible coverage options designed to adapt to changing life needs and long-term goals.",
  },
  {
    title: "Death Benefit Payout",
    desc: "Provides financial support to loved ones, helping them stay secure during difficult times.",
  },
  {
    title: "Better Half Benefit",
    desc: "Offers continued coverage support for your spouse, helping maintain financial stability.",
  },
  {
    title: "Life Cover up to 100 Years",
    desc: "Long-term coverage support with an option to stay protected up to 100 years.",
  },
  {
    title: "Flexible Premium Payment",
    desc: "Choose premium payment options that fit your financial preferences and lifestyle.",
  },
  {
    title: "Enhanced Protection with Optional Accident Benefit Rider¹",
    desc: "Adds an extra layer of financial protection in case of accidental events.",
  },
];

export interface PlanBenefitsSheetProps {
  open: boolean;
  onClose: () => void;
  productName?: string;
  uin?: string;
  logoSrc?: string;
}

export default function PlanBenefitsSheet({
  open,
  onClose,
  productName = "SBI Life - Smart Shield Plus",
  uin = "UIN: 111N150V01",
  logoSrc,
}: PlanBenefitsSheetProps) {
  const [tab, setTab] = useState<Tab>("features");

  const subhead = (
    /* This whole block (logo, badge, tabs) gets passed to BottomSheet as
       the `title` prop, so its divider line comes from BottomSheet.tsx's
       .sheet-head — don't add a border here, see the note there. */
    <div style={{ textAlign: "left" }}>
      <div className="sheet-subhead-row">
        {/* Product logo image — height 80px. If this image 404s (logoSrc
            missing or wrong path), the text fallback below shows instead.
            Note: if the logo still looks small at this height, the PNG
            itself likely has built-in transparent padding around the
            mark — no CSS height value can fix that, the source image
            would need to be re-exported cropped tighter. */}
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={productName}
            style={{ height: 80, objectFit: "contain" }}
            onError={(e) => {
              const el = e.target as HTMLImageElement;
              el.style.display = "none";
              if (el.nextElementSibling) (el.nextElementSibling as HTMLElement).style.display = "flex";
            }}
          />
        ) : null}
        {/* Text fallback for the logo — only shows if the image above fails
            to load, or if no logoSrc prop was passed at all. Font size 20px. */}
        <div style={{ display: logoSrc ? "none" : "flex", flexDirection: "column", lineHeight: 1.25 }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: NAVY }}>
            <span style={{ color: PINK, fontStyle: "italic" }}>SBI Life</span>
            {" "}
            {productName.replace(/^SBI Life\s*-\s*/i, "- ")}
          </span>
        </div>
        {/* "Protection Plan" gradient pill — size/gradient colors are in
            BottomSheet.tsx under .sheet-subhead-badge */}
        <span className="sheet-subhead-badge">Protection Plan</span>
      </div>
      {/* "UIN: ..." small grey text — size is in BottomSheet.tsx under .sheet-subhead-uin */}
      <div className="sheet-subhead-uin">{uin}</div>

      {/* Features / Advantages / Plan Benefits tabs — spacing/colors are in
          BottomSheet.tsx under .sheet-tabs and .sheet-tab */}
      <div className="sheet-tabs" role="tablist" aria-label="Plan information">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            role="tab"
            aria-selected={tab === t.key}
            className="sheet-tab"
            data-active={tab === t.key ? "true" : undefined}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <BottomSheet open={open} onClose={onClose} title={subhead} tightHead ariaLabel={`${productName} — plan benefits`}>
      {tab === "features" ? (
        <>
          <p style={{ fontSize: 16, fontWeight: 600, color: NAVY, margin: "0 0 16px" }}>Features</p>
          <div className="sheet-feature-list">
            {FEATURES.map((f) => (
              <div className="sheet-feature-row" key={f.title}>
                <Icon name={FEATURE_ICON} size={24} />
                <div>
                  <p className="sheet-feature-title">{f.title}</p>
                  <p className="sheet-feature-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ height: 1, background: "#e4e0eb", margin: "20px 0" }} />
          <p style={{ fontSize: 12, color: "rgba(0,0,0,.5)", lineHeight: 1.5, margin: 0 }}>
            <sup>1</sup>SBI Life – Accident Benefit Rider (UIN: 111B041V01), Option A: Accidental Death
            Benefit (ADB) and Option B: Accidental Partial Permanent Disability Benefit (APPD)
          </p>
        </>
      ) : (
        <div style={{ textAlign: "center", padding: "48px 16px", color: GRAY, fontSize: 14 }}>
          {TABS.find((t) => t.key === tab)?.label} — coming soon.
        </div>
      )}
    </BottomSheet>
  );
}
