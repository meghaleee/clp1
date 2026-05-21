import { useState, useEffect, useRef } from "react";

/* ================================================================
   BRAND TOKENS
   — Change colours here to update globally
================================================================ */
const NAVY        = "#2a2076";   /* Primary navy/purple */
const PINK        = "#D60D47";   /* Primary pink/red */
const GRAD        = `linear-gradient(90deg, ${PINK} 0%, ${NAVY} 100%)`; /* Main gradient */
const BADGE_GRAD  = `linear-gradient(90deg, #EA89A5 0%, #8C178C 100%)`; /* Product badge gradient */
const BORDER      = "#e4e0eb";   /* Light border colour */
const GRAY        = "#6f6f6f";   /* Body / secondary text */
const BG          = "#f7f6f9";   /* Light section background */

/* ================================================================
   DATA
================================================================ */
const NAV_LINKS = [
  "Life Insurance Plans",
  "Group Insurance Plans",
  "Life Insurance Library",
  "Customer Services",
  "Tools and Calculators",
  "About Us",
  "Contact",
];

const HERO_FEATURES = [
  { icon: "lifecover",         text: "Life Cover at an Affordable Premium" },
  { icon: "levelcover",        text: "Level Cover, Increasing Cover, and Level Cover with Future Proofing Benefit" },
  { icon: "betterhalfbenefit", text: "Optional Better Half Benefit and Rider& Benefit" },
];

const POLICY_FEATURES = [
  { icon: "lifecover",         text: "Financial protection at an affordable cost" },
  { icon: "lifecover100",      text: "Life cover up to 100 years or 79 years" },
  { icon: "levelcover",        text: "3 plan options to suit your protection needs" },
  { icon: "premium",           text: "Flexibility to pay premium" },
  { icon: "betterhalfbenefit", text: "Optional Better Half Benefit" },
  { icon: "highersumassured",  text: "Higher Sum Assured with Lower Premium Rates" },
];

const STATS = [
  { icon: "money",               value: "₹306,452 Crore", label: "Claims paid till date*" },
  { icon: "User",                value: "98.20%",         label: "Claim Settlement Ratio" },
  { icon: "house Icon Container",value: "1230",           label: "Branches in India**" },
  { icon: "people",              value: "8,36,78,351",    label: "Policy Holders^" },
];

const PRODUCTS = [
  { badge: "Savings Plan",               logo: "/smart-platina-supreme.png", name: "Smart Platina Supreme", uin: "UIN : 111N171V03", desc: "Enables you to move confidently with guaranteed benefits" },
  { badge: "Term Insurance",             logo: "/smart-shield-premier.png",  name: "Smart Shield Premier",  uin: "UIN: 111N145V01",  desc: "A plan that offers you guaranteed returns and protection, for a lifetime" },
  { badge: "Unit Linked Insurance Plans",logo: "/smart-fortune-builder.png", name: "Smart Fortune Builder", uin: "UIN: 111L142V01",  desc: "Becomes the starting point for growing aspirations." },
];

const FAQS = [
  { q: "Why should I buy SBI Life - Smart Shield Plus?",                    a: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s" },
  { q: "Is the SBI Life - Smart Shield Plus worth buying?",                 a: "" },
  { q: "How is my insurance premium determined?",                           a: "" },
  { q: "What are the advantages of choosing SBI Life - Smart Shield Plus?", a: "" },
  { q: "What riders are available with SBI Life - Smart Shield Plus?",      a: "" },
  { q: "What is the eligibility requirements for SBI Life - Smart Shield Plus?", a: "" },
];

const FOOTER_COLS = [
  { title: "Life Insurance Plans",    links: ["Term Plans","Savings Plans","Retirement Plans","Child Plan","ULIP / Wealth Creation Plans","Health / Protection Plans"] },
  { title: "Group Insurance Plans",   links: ["Corporate Solutions Plans","Group Loan Protection Plans","Group Micro Insurance Plans"] },
  { title: "Customer Services",       links: ["Services","Claim and Maturity","NRI Corner","Download Center","Nav & Fund Performance","Need Assessment Calculator"] },
  { title: "Tools & Calculators",     links: ["Human Life Value","Goal Planner","Cost Of Smoking","Power Of Compounding","Health Tax Saving"] },
  { title: "SBI LIFE",                links: ["About Us","Leadership","Key Milestone","Awards","CSR","Media Centre","Investor Relations","Careers","Life Verse","Partners"] },
  { title: "Life Insurance Library",  links: ["Insurance Guide","FAQs","Understanding Life Insurance"] },
  { title: "Group Companies",         links: ["SBI","SBI Online","SBI General Insurance","SBI Card","SBI Mutual Funds","SBI Capital","SBI Global","SBI DFHI"] },
  { title: "Connect with Us",         links: ["Facebook","Twitter","LinkedIn","Youtube","Instagram","Quora"] },
];

/* ================================================================
   SVG ICON HELPERS
================================================================ */
const Icon = ({ name, size = 24 }: { name: string; size?: number }) => (
  <img src={`/icons/${name}.svg`} alt="" width={size} height={size}
    style={{ objectFit: "contain", display: "block", flexShrink: 0 }} />
);

const DownloadSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 3v13M7 11l5 5 5-5" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 21h14" stroke={NAVY} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const PhoneSVG = ({ color="#fff", size=18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.6 21 3 13.4 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.01L6.6 10.8z"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ChevronSVG = ({ color="#fff" }: { color?: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowSVG = ({ color=NAVY }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShieldSVG = ({ color="#fff", size=16 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M12 2L4 6v6c0 5.25 3.5 10.15 8 11.35C16.5 22.15 20 17.25 20 12V6l-8-4z"
      stroke={color} strokeWidth="1.8" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HamburgerSVG = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M3 12h18M3 18h18" stroke={NAVY} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SearchSVG = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="7" stroke={NAVY} strokeWidth="1.8"/>
    <path d="M16.5 16.5L21 21" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

/* ================================================================
   MAIN COMPONENT
================================================================ */
export default function SBILifePage() {
  const [showSticky, setShowSticky]         = useState(false);
  const [openFaq, setOpenFaq]               = useState(0);
  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => {
      if (triggerRef.current)
        setShowSticky(triggerRef.current.getBoundingClientRect().top <= 70);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Lato', sans-serif", background: "#fff", color: "#111111", overflowX: "hidden" }}>

      {/* ============================================================
          GLOBAL STYLES
          — All responsive breakpoints and shared classes live here
          — To adjust mobile font sizes search for @media (max-width: 768px)
          — To adjust tablet font sizes search for @media (max-width: 1024px)
      ============================================================ */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;700;900&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Lato', sans-serif; overflow-x: hidden; }
        button { font-family: 'Lato', sans-serif; cursor: pointer; }
        input, select { font-family: 'Lato', sans-serif; }

        /* ── CONTAINER ── */
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }

        /* ────────────────────────────────────────
           HEADER — DESKTOP TOP BAR
           Height: 70px
        ──────────────────────────────────────── */
        .header-top {
          height: 70px;
          background: #fff;
          border-bottom: 1px solid ${BORDER};
          position: sticky;
          top: 0;
          z-index: 300;
        }
        .header-top-inner {
          height: 100%;
          display: flex;
          align-items: center;
          gap: 20px;
        }

        /* ────────────────────────────────────────
           HEADER — SEARCH BAR (desktop only)
        ──────────────────────────────────────── */
        .search-bar {
          flex: 1;
          max-width: 540px;
          height: 44px;
          background: #f1f1f1;
          border: none;
          border-radius: 999px;
          padding: 0 20px;
          font-size: 14px;    /* ← DESKTOP search font size */
          color: #777;
          outline: none;
        }

        /* ────────────────────────────────────────
           HEADER — DARK NAVY NAV BAR (desktop only)
           Hidden on mobile via media query
        ──────────────────────────────────────── */
        .nav-bar {
          height: 48px;
          background: ${NAVY};
          position: sticky;
          top: 70px;
          z-index: 299;
        }
        .nav-bar-inner {
          height: 100%;
          display: flex;
          align-items: center;
          gap: 28px;
        }
        .nav-link {
          color: #fff;
          font-size: 14px;   /* ← DESKTOP nav link font size */
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
          letter-spacing: 0.003em;
        }

        /* ────────────────────────────────────────
           SECONDARY STICKY NAV (product logo bar)
           Appears after hero on scroll
        ──────────────────────────────────────── */
        .secondary-nav {
          height: 56px;
          background: #fff;
          border-bottom: 1px solid ${BORDER};
          position: sticky;
          top: 118px;        /* ← Adjust if header height changes */
          z-index: 298;
          display: flex;
          align-items: center;
        }

        /* ────────────────────────────────────────
           HERO SECTION
           Section padding controlled by .hero-section
        ──────────────────────────────────────── */
        .hero-section {
          background: #fff;
          padding-top: 40px;    /* ← DESKTOP hero top padding */
          padding-bottom: 40px; /* ← DESKTOP hero bottom padding */
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 468px;
          gap: 28px;
          align-items: start;
        }

        /* ────────────────────────────────────────
           HERO — 3 BENEFIT FEATURES
           Horizontal row with dividers between items, NO outer border
        ──────────────────────────────────────── */
        .feature-row {
          display: flex;              /* ← Always horizontal, including mobile */
          align-items: stretch;
          margin-top: 24px;
        }
        .feature-cell {
          flex: 1;
          padding: 16px 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
          font-size: 14px;   /* ← DESKTOP feature text font size */
          font-weight: 400;
          line-height: 1.35;
          color: #111111;
          position: relative;
        }
        /* Divider between feature cells — NOT a border on the row */
        .feature-cell + .feature-cell::before {
          content: "";
          position: absolute;
          top: 10%;
          left: 0;
          width: 1px;
          height: 80%;
          background: ${BORDER};
        }

        /* ────────────────────────────────────────
           FORM CARD
        ──────────────────────────────────────── */
        .form-card {
          background: #fff;
          border: 1px solid ${BORDER};
          border-radius: 16px;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .input-wrap { position: relative; }
        .float-label {
          position: absolute;
          top: -9px; left: 12px;
          background: #fff;
          padding: 0 4px;
          font-size: 12px;   /* ← Form label font size */
          font-weight: 400;
          color: #808080;
          line-height: 1;
          z-index: 1;
        }
        .float-label .req { color: ${PINK}; }
        .form-input {
          width: 100%;
          height: 56px;
          border: 1px solid ${BORDER};
          border-radius: 4px;
          padding: 0 16px;
          font-size: 14px;   /* ← Form input font size */
          font-weight: 400;
          color: #111;
          outline: none;
          background: #fff;
        }
        .form-input:focus { border-color: ${NAVY}; }

        /* ────────────────────────────────────────
           BUTTONS
        ──────────────────────────────────────── */
        .btn-primary {
          width: 100%;
          height: 56px;
          border: none;
          border-radius: 999px;
          background: ${NAVY};
          color: #fff;
          font-size: 16px;   /* ← Primary button font size */
          font-weight: 500;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity .15s;
        }
        .btn-primary:hover { opacity: .88; }
        .btn-secondary {
          width: 100%;
          height: 56px;
          border: 1px solid ${NAVY};
          border-radius: 999px;
          background: #fff;
          color: ${NAVY};
          font-size: 16px;   /* ← Secondary button font size */
          font-weight: 500;
        }
        .btn-outline {
          height: 52px;
          padding: 0 28px;
          border: 1px solid ${NAVY};
          border-radius: 999px;
          background: #fff;
          color: ${NAVY};
          font-size: 16px;   /* ← Outline button font size */
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        /* ────────────────────────────────────────
           SECTION SPACING
           White sections: 40px top + bottom
           Coloured sections (FAQ, Products): 56px top + bottom
           Documents: 40px top, 0 bottom
        ──────────────────────────────────────── */
        .sec-white {
          background: #fff;
          padding-top: 56px;    /* ← WHITE section top padding */
          padding-bottom: 56px; /* ← WHITE section bottom padding */
        }
        .sec-colored {
          background: ${BG};
          padding-top: 56px;    /* ← COLOURED section top padding */
          padding-bottom: 56px; /* ← COLOURED section bottom padding */
        }
        .sec-docs {
          background: #fff;
          padding-top: 40px;    /* ← DOCUMENTS section top padding */
          padding-bottom: 40px; /* ← DOCUMENTS section bottom padding (set 0 if above coloured) */
          
        }

        /* ────────────────────────────────────────
           IMPORTANT DOCUMENTS — button layout
        ──────────────────────────────────────── */
        .doc-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .doc-btns {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }

        /* ────────────────────────────────────────
           UNDERSTAND POLICY SECTION
        ──────────────────────────────────────── */
        .policy-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 32px;
          align-items: start;
        }
        .policy-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px 20px;
        }

        /* ────────────────────────────────────────
           STATS SECTION
        ──────────────────────────────────────── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          margin-top: 32px;
        }
        /* DESKTOP stat value font size: see inline style on the value span */

        /* ────────────────────────────────────────
           PRODUCTS SECTION
        ──────────────────────────────────────── */
        .products-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-top: 32px;
        }
        .product-card {
          background: #fff;
          border: 1px solid ${BORDER};
          border-radius: 16px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        /* ────────────────────────────────────────
           FAQ SECTION
           White cards on grey (BG) background
        ──────────────────────────────────────── */
        .faq-list { margin-top: 32px; display: flex; flex-direction: column; gap: 12px; }
        .faq-item {
          background: ${BG};
          border-radius: 8px;
          padding: 18px 20px;
          cursor: pointer;
        }

        /* ────────────────────────────────────────
           CONTACT / STILL UNSURE SECTION
           Gradient background, left-right layout
        ──────────────────────────────────────── */
        .contact-section {
          background: ${GRAD};
          padding-top: 56px;    /* ← CONTACT section top padding */
          padding-bottom: 56px; /* ← CONTACT section bottom padding */
        }
        .contact-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }

        /* ────────────────────────────────────────
           FOOTER
        ──────────────────────────────────────── */
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }

        /* ────────────────────────────────────────
           STICKY BOTTOM BAR
           Gradient background, fixed at bottom
        ──────────────────────────────────────── */
        .sticky-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: ${GRAD};
          z-index: 500;
          padding: 16px 40px;  /* ← STICKY BAR top/bottom padding — increase to give more space */
        }
        .sticky-inner {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* ════════════════════════════════════════
           TABLET BREAKPOINT — max-width: 1024px
           Adjust tablet-specific overrides here
        ════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .hero-grid            { grid-template-columns: 1fr; }
          .policy-grid          { grid-template-columns: 1fr; }
          .products-grid        { grid-template-columns: repeat(2, 1fr); }
          .footer-grid          { grid-template-columns: repeat(2, 1fr); }
          .stats-grid           { grid-template-columns: repeat(2, 1fr); }
          .contact-inner        { flex-direction: column; align-items: flex-start; }
        }

        /* ════════════════════════════════════════
           MOBILE BREAKPOINT — max-width: 768px
           All mobile font size overrides go here
        ════════════════════════════════════════ */
        @media (max-width: 768px) {

          /* ── Container padding on mobile ── */
          .container {
            padding-left: 16px;
            padding-right: 16px;
          }

          /* ── Hide desktop nav bar on mobile ── */
          .nav-bar { display: none; }

          /* ── Secondary nav sits just under main header on mobile ── */
          .secondary-nav { top: 70px; }

          /* ── Hero section mobile padding ── */
          .hero-section {
            padding-top: 24px;    /* ← MOBILE hero top padding */
            padding-bottom: 24px; /* ← MOBILE hero bottom padding */
          }

          /* ── Hero features: horizontal scroll on mobile ── */
          .feature-row {
            overflow-x: visible;
            padding-bottom: 8px;
          }
          .feature-cell {
            min-width: 140px;
            font-size: 12px;   /* ← MOBILE feature text font size */
            padding: 12px 12px;
          }

          /* ── Section spacing on mobile ── */
          .sec-white {
            padding-top: 40px;    /* ← MOBILE white section top padding */
            padding-bottom: 40px; /* ← MOBILE white section bottom padding */
          }
          .sec-colored {
            padding-top: 56px;    /* ← MOBILE coloured section top padding */
            padding-bottom: 56px; /* ← MOBILE coloured section bottom padding */
          }
          .sec-docs {
            padding-top: 24px;    /* ← MOBILE documents section top padding */
            padding-bottom: 24px; /* ← MOBILE documents section bottom padding */
          }

          /* ── Important documents: full-width stacked buttons on mobile ── */
          .doc-row { flex-direction: column; align-items: stretch; gap: 16px; }
          .doc-btns { flex-direction: column; width: 100%; }
          .doc-btns .btn-outline {
            width: 100%;              /* Full width on mobile */
            justify-content: center;
          }

          /* ── Products: single column on mobile ── */
          .products-grid { grid-template-columns: 1fr; }

          /* ── Footer: 2 columns on mobile ── */
          .footer-grid { grid-template-columns: 1fr 1fr; }

          /* ── Policy features: single column on mobile ── */
          .policy-features { grid-template-columns: 1fr; }

          /* ── Contact section mobile ── */
          .contact-section {
            padding-top: 40px;    /* ← MOBILE contact top padding */
            padding-bottom: 40px; /* ← MOBILE contact bottom padding */
          }
          .contact-inner { flex-direction: column; }

          /* ── Sticky bar mobile ── */
          .sticky-bar {
            padding: 0px 12px;   /* ← MOBILE sticky bar padding — top/bottom 20px */
          }

          /* ── Section title mobile font size ── */
          .section-title-lg {
            font-size: 24px !important;  /* ← MOBILE large section title */
          }
          .section-title-md {
            font-size: 20px !important;  /* ← MOBILE medium section title */
          }

          /* ── Stat values mobile ── */
          .stat-value {
            font-size: 18px !important;  /* ← MOBILE stat value font size */
          }
          .stat-label {
            font-size: 13px !important;  /* ← MOBILE stat label font size */
          }

          /* ── FAQ question mobile ── */
          .faq-question {
            font-size: 14px !important;  /* ← MOBILE FAQ question font size */
          }

          /* ── Button sizes on mobile ── */
          .btn-primary, .btn-secondary {
            font-size: 14px;   /* ← MOBILE button font size */
            height: 52px;
          }
        }

        /* ════════════════════════════════════════
           SMALL MOBILE — max-width: 480px
        ════════════════════════════════════════ */
        @media (max-width: 480px) {
          .footer-grid          { grid-template-columns: 1fr; }
          .stats-grid           { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      {/* ============================================================
          SECTION: HEADER — DESKTOP TOP BAR
          Contains: SBI Life logo, Liberating Lives logo, Search, Icons, Pay Premium
      ============================================================ */}
      <div className="header-top">
        <div className="container header-top-inner">

          {/* ── Logo group: SBI Life + Liberating Lives ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <img
              src="/sbi-life-logo.png"
              alt="SBI Life"
              style={{ height: 40, objectFit: "contain" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
            {/* Liberating Lives logo — file: /public/liberatinglives.svg */}
            <img
              src="/liberatinglives.svg"
              alt="Liberating Lives"
              style={{ height: 36, objectFit: "contain" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>

          {/* ── Search bar (hidden on mobile) ── */}
          <input className="search-bar" placeholder="Search for Insurance" readOnly
            style={{ display: "flex" }} />

          {/* ── Desktop right icons + Pay Premium ── */}
          <div className="desktop-header-right"
            style={{ display: "flex", alignItems: "center", gap: 16, flexShrink: 0, marginLeft: "auto" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#333", cursor: "pointer", display: "flex", alignItems: "center", gap: 3 }}>
              EN <ChevronSVG color="#333" />
            </span>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f3f3f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke={NAVY} strokeWidth="1.8"/>
                <path d="M5 20c0-3.87 3.13-7 7-7s7 3.13 7 7" stroke={NAVY} strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f3f3f3", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <PhoneSVG color={NAVY} size={20} />
            </div>
            <button style={{ background: GRAD, color: "#fff", border: "none", borderRadius: 999, padding: "10px 20px", fontWeight: 700, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="5" width="20" height="14" rx="2" stroke="#fff" strokeWidth="1.8"/>
                <path d="M2 10h20" stroke="#fff" strokeWidth="1.8"/>
              </svg>
              Pay Premium
            </button>
          </div>

          {/* ── Mobile header right: search icon + hamburger ── */}
          <div className="mobile-header-right"
            style={{ display: "none", alignItems: "center", gap: 12, marginLeft: "auto" }}>
            <button style={{ background: "none", border: "none", padding: 4 }} onClick={() => {}}>
              <SearchSVG />
            </button>
            <button style={{ background: "none", border: "none", padding: 4 }} onClick={() => setMobileMenuOpen(o => !o)}>
              <HamburgerSVG />
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile nav menu (shown when hamburger tapped) ── */}
      {mobileMenuOpen && (
        <div style={{ position: "fixed", top: 70, left: 0, right: 0, bottom: 0, background: "#fff", zIndex: 400, overflowY: "auto", padding: "20px" }}>
          {NAV_LINKS.map(l => (
            <div key={l} style={{ padding: "16px 0", borderBottom: `1px solid ${BORDER}`, fontSize: 16, fontWeight: 700, color: NAVY, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              {l} <ChevronSVG color={NAVY} />
            </div>
          ))}
        </div>
      )}

      {/* ============================================================
          SECTION: DESKTOP DARK NAVY NAV BAR
          Hidden on mobile via CSS (.nav-bar display:none at 768px)
      ============================================================ */}
      <div className="nav-bar">
        <div className="container nav-bar-inner">
          {NAV_LINKS.map(l => (
            <span key={l} className="nav-link">
              {l} {l !== "Contact" && <ChevronSVG />}
            </span>
          ))}
        </div>
      </div>

      {/* ============================================================
          SECTION: SECONDARY STICKY NAV (product logo bar)
          Appears after user scrolls past the hero section
          Top position: 118px desktop (70px header + 48px nav bar)
                        70px mobile  (no navy nav bar)
      ============================================================ */}
      {showSticky && (
        <div className="secondary-nav">
          <div className="container">
            <img
              src="/smart-shield-plus.png"
              alt="Smart Shield Plus"
              style={{ height: 36, objectFit: "contain" }}
              onError={e => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                if (el.nextElementSibling) (el.nextElementSibling as HTMLElement).style.display = "flex";
              }}
            />
            {/* Fallback text if image missing */}
            <div style={{ display: "none", flexDirection: "column", lineHeight: 1.25 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: NAVY }}>
                <span style={{ color: PINK, fontStyle: "italic" }}>SBI Life</span> - Smart Shield Plus
              </span>
              <span style={{ fontSize: 11, color: GRAY, fontWeight: 400 }}>UIN: 111N150V01</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          SECTION: HERO
          Contains: Product logo, description, premium text, 3 features, form, disclaimer
          Desktop padding: 40px top + bottom (class: hero-section)
          Mobile padding:  24px top + bottom
      ============================================================ */}
      <div className="hero-section">
        <div className="container">
          <div className="hero-grid">

            {/* ── Hero Left: product info ── */}
            <div>
              {/* Product logo image */}
              <img
                src="/smart-shield-plus.png"
                alt="SBI Life Smart Shield Plus"
                style={{ height: 125, objectFit: "contain" }}
                onError={e => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  if (el.nextElementSibling) (el.nextElementSibling as HTMLElement).style.display = "block";
                }}
              />
              {/* Fallback product title if image fails */}
              <div style={{ display: "none" }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: NAVY, lineHeight: 1.1 }}>
                  <span style={{ color: PINK, fontStyle: "italic" }}>SBI Life</span> -<br />Smart<br />Shield Plus
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: GRAY, marginTop: 4 }}>UIN: 111N150V01</div>
              </div>

              {/* Product description */}
              {/* DESKTOP: 16px/400 · MOBILE: override in @media if needed */}
              <p style={{ fontSize: 16, fontWeight: 400, lineHeight: 1.35, color: "#111111", marginTop: 12 }}>
                An Individual, Non-Linked, Non-Participating, Life Insurance Pure Risk Product
              </p>

              {/* Premium heading */}
              {/* DESKTOP: 24px/700 · MOBILE: override in @media if needed */}
              <h2 style={{ fontSize: 24, fontWeight: 700, color: NAVY, marginTop: 24 }}>
                Premium starting at ₹499/month<sup style={{ fontSize: 14, fontWeight: 400 }}>*</sup>
              </h2>

              {/* ────────────────────────────────────────
                  3 BENEFIT FEATURES
                  — Horizontal flex row, dividers between items only
                  — NO outer border on the row
                  — On mobile: horizontally scrollable
              ──────────────────────────────────────── */}
              <div className="feature-row">
                {HERO_FEATURES.map((f, i) => (
                  <div key={i} className="feature-cell">
                    {/* Icon: 40px desktop, stays same on mobile */}
                    <Icon name={f.icon} size={28} />
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>

              {/* Disclaimer text */}
              {/* DESKTOP: 12px/500 at 50% opacity */}
              <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.5)", lineHeight: 1.7, marginTop: 20 }}>
                For more details on risk factors, terms and conditions please read the sales brochure carefully before concluding a sale.<br />
                &For more details on risk factors, terms and conditions of riders please read the rider brochure carefully before concluding a sale
              </p>
            </div>

            {/* ── Hero Right: form card ── */}
            <div className="form-card">

              {/* Name row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div className="input-wrap">
                  <span className="float-label">First Name<span className="req">*</span></span>
                  <input className="form-input" defaultValue="Shreyash" />
                </div>
                <div className="input-wrap">
                  <span className="float-label">Last Name</span>
                  <input className="form-input" defaultValue="Deshmukh" />
                </div>
              </div>
              <p style={{ fontSize: 12, color: GRAY, marginTop: -12 }}>As per Govt. ID proof</p>

              {/* Mobile field */}
              <div className="input-wrap">
                <span className="float-label">Mobile<span className="req">*</span></span>
                <div className="form-input" style={{ display: "flex", alignItems: "center", gap: 8, height: 56, padding: "0 16px" }}>
                  <span style={{ color: GRAY, fontSize: 14, display: "flex", alignItems: "center", gap: 4 }}>
                    <ChevronSVG color={GRAY} /> +91
                  </span>
                  <span style={{ width: 1, height: 20, background: BORDER, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, color: "#111" }}>9876543210</span>
                </div>
              </div>

              {/* We don't spam */}
              <p style={{ fontSize: 12, color: GRAY, marginTop: -12, display: "flex", alignItems: "center", gap: 6 }}>
                <ShieldSVG color={GRAY} size={14} /> We don't spam
              </p>

              {/* Checkbox: PwD */}
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                <input type="checkbox" style={{ width: 16, height: 16, marginTop: 2, accentColor: NAVY, flexShrink: 0 }} />
                {/* Checkbox text: 12px/500 at 50% opacity */}
                <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.5)", lineHeight: 1.25 }}>
                  I am a differently abled person and I hold a valid PwD certificate.
                </span>
              </label>

              {/* Checkbox: Privacy */}
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                <input type="checkbox" style={{ width: 16, height: 16, marginTop: 1, accentColor: NAVY, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.5)", lineHeight: 1.25 }}>
                  I accept SBI Life's{" "}
                  <a href="https://www.sbilife.co.in/en/privacy-policy" target="_blank" rel="noreferrer"
                    style={{ color: "#111", textDecoration: "underline" }}>Privacy policy</a>{" "}
                  and by submitting my contact details here, I override my NCPR registration and authorise SBl Life and its authorised representatives to contact me and send information/communication relating to this proposal through SMS /Email /Phone /Letter /WhatsApp /any other electronic mode of communication to my registered email id/mobile number.
                </span>
              </label>

              {/* CTA buttons */}
              <button className="btn-primary">
                <PhoneSVG color="#fff" size={16} /> Talk to an Expert
              </button>
              <button className="btn-secondary">Continue your Application</button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll trigger — secondary nav + sticky bar appear after this point */}
      <div ref={triggerRef} />

      {/* ============================================================
          SECTION: IMPORTANT DOCUMENTS
          Desktop: side-by-side label + buttons
          Mobile:  stacked, full-width buttons
          Padding: 40px top, 40px bottom (set 0 bottom if above coloured bg)
      ============================================================ */}
      <div className="sec-docs">
        <div className="container">
          <div className="doc-row">
            {/* Section label */}
            {/* DESKTOP: 20px/500 navy */}
            <h3 style={{ fontSize: 20, fontWeight: 600, color: NAVY }}>Important documents</h3>
            <div className="doc-btns">
              <button className="btn-outline"><DownloadSVG /> Required Documents</button>
              <button className="btn-outline"><DownloadSVG /> Product Brochure</button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION: UNDERSTAND YOUR POLICY
          White background, 40px top + bottom
          Left: title + subtitle + CTA button
          Right: 2-col feature grid with icons
      ============================================================ */}
      <div className="sec-white">
        <div className="container">
          <div className="policy-grid">

            {/* Left side */}
            <div>
              {/* Section title: 24px/700 navy */}
              <h2 className="section-title-md" style={{ fontSize: 24, fontWeight: 600, color: NAVY, lineHeight: 1.3 }}>
                Understand your policy better
              </h2>
              {/* Subtitle: 16px/400 gray */}
              <p style={{ fontSize: 16, fontWeight: 400, color: GRAY, lineHeight: 1.5, marginTop: 8 }}>
                Know all the benefits and features this policy has to offer
              </p>
              <button className="btn-outline" style={{ marginTop: 32 }}>
                Check Benefits &amp; Features <ArrowSVG />
              </button>
            </div>

            {/* Right: 2-col feature list */}
            <div className="policy-features">
              {POLICY_FEATURES.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <Icon name={f.icon} size={24} />
                  {/* Feature text: 16px/500 */}
                  <span style={{ fontSize: 16, fontWeight: 500, color: "#111111", lineHeight: 1.35 }}>{f.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION: STATS — TRUSTED BY CUSTOMERS
          White background, 40px top + bottom
          4-column grid of stat cards
      ============================================================ */}
      <div className="sec-white">
        <div className="container">
          {/* Section title: 32px/700 navy */}
          <h2 className="section-title-lg" style={{ fontSize: 32, fontWeight: 600, color: NAVY }}>
            Trusted by customers across India
          </h2>
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Icon name={s.icon} size={42} />
                {/* Stat value: 20px/700 navy — MOBILE: overridden to 18px via .stat-value class */}
                <div className="stat-value" style={{ fontSize: 20, fontWeight: 700, color: NAVY }}>{s.value}</div>
                {/* Stat label: 16px/400 — MOBILE: overridden to 13px via .stat-label class */}
                <div className="stat-label" style={{ fontSize: 16, fontWeight: 400, color: "#111111", lineHeight: 1.35 }}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Stats disclaimer */}
          <p style={{ fontSize: 12, fontWeight: 400, color: GRAY, lineHeight: 1.7, marginTop: 32 }}>
            *As per public disclosure (L-7 - Benefits Paid) &amp; Financial Statements (Schedule 4 - Benefits Paid) of the Company, benefits paid since inception upto period ending 31st December 2025.<br />
            **Includes count of in force and paid-up individual policies along with count of lives covered under various group policies as on period ending 31st December 2025.<br />
            ^Network of branches as on period ending 31st December 2025.
          </p>
        </div>
      </div>

      {/* ============================================================
          SECTION: EXPLORE PRODUCTS
          White background, 40px top + bottom
          3-column product cards
          Badge gradient: #EA89A5 → #8C178C (pink-purple)
          Card: white bg, border, rounded corners
      ============================================================ */}
      <div className="sec-white">
        <div className="container">
          {/* Section title: 32px/700 navy */}
          <h2 className="section-title-lg" style={{ fontSize: 32, fontWeight: 600, color: NAVY }}>
            Explore our other products
          </h2>
          {/* Subtitle: 16px/400 gray */}
          <p style={{ fontSize: 16, fontWeight: 400, color: GRAY, marginTop: 8 }}>
            Discover a variety of plans designed for every life stage
          </p>

          <div className="products-grid">
            {PRODUCTS.map((p, i) => (
              <div key={i} className="product-card">

                {/* ── Product badge ──
                    Gradient: #EA89A5 → #8C178C (left to right pink to purple)
                    Font: 14px/500 white
                    Change BADGE_GRAD at top of file to update colour */}
                <div style={{
                  display: "inline-flex",
                  padding: "4px 16px",
                  borderRadius: 999,
                  background: BADGE_GRAD,
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 500,
                  width: "fit-content",
                }}>
                  {p.badge}
                </div>

                {/* ── Product logo image (120×72) ── */}
                <img
                  src={p.logo}
                  alt={p.name}
                  style={{ width: 120, height: 72, objectFit: "contain" }}
                  onError={e => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                    if (el.nextElementSibling) (el.nextElementSibling as HTMLElement).style.display = "block";
                  }}
                />
                {/* Fallback product name if image missing */}
                <div style={{ display: "none" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>
                    <span style={{ color: PINK, fontStyle: "italic" }}>SBI Life</span> - {p.name}
                  </div>
                  <div style={{ fontSize: 11, color: GRAY }}>{p.uin}</div>
                </div>

                {/* ── Product description: 14px/400 at 60% opacity ── */}
                <p style={{ fontSize: 14, fontWeight: 400, color: "rgba(0,0,0,0.6)", lineHeight: 1.35, flex: 1 }}>
                  {p.desc}
                </p>

                {/* ── Learn More button ── */}
                <button style={{ height: 48, borderRadius: 999, border: "none", background: NAVY, color: "#fff", fontSize: 16, fontWeight: 500, width: "100%" }}>
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION: FAQ — FREQUENTLY ASKED QUESTIONS
          Coloured background (BG = #f7f6f9), 56px top + bottom
          White cards, no border on cards, no divider inside open card
      ============================================================ */}
      <div className="sec-white">
        <div className="container">
          {/* Section title: 32px/700 navy */}
          <h2 className="section-title-lg" style={{ fontSize: 32, fontWeight: 600, color: NAVY }}>
            Frequently Asked Questions
          </h2>

          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div
                key={i}
                className="faq-item"
                onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
                  {/* FAQ question: 16px/700 — MOBILE: overridden via .faq-question */}
                  <span className="faq-question" style={{ fontSize: 16, fontWeight: 700, color: "#111111", lineHeight: 1.35 }}>
                    {f.q}
                  </span>
                  {/* Toggle icon */}
                  <span style={{ fontSize: 22, color: GRAY, flexShrink: 0, lineHeight: 1 }}>
                    {openFaq === i ? "−" : "+"}
                  </span>
                </div>
                {/* FAQ answer — only shown when open, no divider above it */}
                {openFaq === i && f.a && (
                  <p style={{ fontSize: 16, fontWeight: 400, color: "rgba(0,0,0,0.6)", lineHeight: 1.5, marginTop: 16 }}>
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION: STILL UNSURE / CONTACT
          Gradient background: pink → navy (left to right)
          56px top + bottom
          Left: title + subtitle + phone number
          Right: Request a Callback button
      ============================================================ */}
      <div className="contact-section">
        <div className="container">
          <div className="contact-inner">
            <div style={{ color: "#fff" }}>
              {/* Contact title: 24px/700 white */}
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>
                Still unsure? We're just a click away
              </h2>
              {/* Contact subtitle: 16px/400 white at 85% opacity */}
              <p style={{ fontSize: 16, fontWeight: 400, color: "#fff", opacity: 0.85, marginTop: 6 }}>
                Speak to our insurance expert - call us at
              </p>
              {/* Phone number: 28px/700 white */}
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                <PhoneSVG color="#fff" size={24} />
                <span style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: "36px" }}>1800 267 1800</span>
              </div>
            </div>

            {/* Request a Callback button */}
            <button style={{
              height: 56, padding: "0 32px", borderRadius: 999,
              border: "1.5px solid rgba(255,255,255,0.6)",
              background: "transparent", color: "#fff",
              fontSize: 16, fontWeight: 700,
              display: "flex", alignItems: "center", gap: 8, flexShrink: 0,
            }}>
              <PhoneSVG color="#fff" size={16} /> Request a Callback
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          SECTION: FOOTER
          White background
          Desktop: 4-column grid
          Mobile: 2-column → 1-column at 480px
          Contains: Disclaimer accordion, footer links, legal notices
      ============================================================ */}
      <footer style={{ background: "#fff", borderTop: `1px solid ${BORDER}` }}>
        <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>

          {/* ── Disclaimer accordion ── */}
          <div
            style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", paddingBottom: 20, borderBottom: `1px solid ${BORDER}`, marginBottom: 32 }}
            onClick={() => setDisclaimerOpen(o => !o)}
          >
            {/* Disclaimer label: 12px/700 uppercase gray */}
            <span style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              DISCLAIMER
            </span>
            <ChevronSVG color={GRAY} />
          </div>
          {disclaimerOpen && (
            <p style={{ fontSize: 12, color: GRAY, lineHeight: 1.7, marginBottom: 24 }}>
              SBI Life Insurance Company Limited is registered with IRDAI. Reg No. 111. Trade logo belongs to State Bank of India, used under license. Please read the sales brochure carefully before concluding a sale.
            </p>
          )}

          {/* ── Footer link columns ── */}
          <div className="footer-grid">
            {FOOTER_COLS.map((col, i) => (
              <div key={i}>
                {/* Column heading: 16px/700 navy */}
                <h4 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 16 }}>{col.title}</h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map(l => (
                    /* Footer link: 14px/400 gray */
                    <span key={l} style={{ fontSize: 14, fontWeight: 400, color: GRAY, cursor: "pointer", lineHeight: 1.4 }}>{l}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* ── Legal section ── */}
          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 40, paddingTop: 24, fontSize: 12, color: GRAY, lineHeight: 1.7 }}>
            <p style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 11, marginBottom: 6 }}>NOTICES</p>
            <p>As stipulated by IRDAI in its circular F&amp;I-CIR-INV-173-08-2011 dated July 29, 2011 the computation of Net Asset Value for Linked funds stands modified. <span style={{ color: PINK, cursor: "pointer" }}>Know more</span></p>
            <p style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 11, margin: "12px 0 6px" }}>QUICK LINKS</p>
            <p><span style={{ color: PINK }}>IRDAI</span> | Consumer Education Website by IRDAI | Sitemap | Life Insurance Council | SFIN Codes | <span style={{ color: PINK }}>Privacy Policy</span> | Disclaimer | Do Not Call</p>
            <p style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 11, margin: "12px 0 6px" }}>SBI LIFE INSURANCE COMPANY LIMITED</p>
            <p>IRDAI Registration No. 111 Issued on 29th March 2001. Trade logo belongs to State Bank of India, used under license.</p>
            <p>REGISTERED &amp; CORPORATE OFFICE: SBI Life Insurance Co. Ltd, Natraj, M.V. Road &amp; Western Express Highway Junction, Andheri (East), Mumbai - 400 069. CIN: L99999MH2000PLC129113</p>
            <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 24, paddingTop: 16, textAlign: "center", fontSize: 12 }}>
              © 2022 SBI Life Insurance Company Limited. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================
          SECTION: STICKY BOTTOM BAR
          Fixed at bottom, gradient background
          Left: shield icon + claim ratio text
          Right: phone circle button + Check Premium button
          Padding: 16px top + bottom desktop, 20px mobile
          — Increase padding values in .sticky-bar CSS above
      ============================================================ */}
      {showSticky && (
        <div className="sticky-bar">
          <div className="sticky-inner">
            {/* Left: shield + text */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#fff" }}>
              <ShieldSVG color="#fff" size={20} />
              {/* Claim ratio text: 16px/700 white */}
              <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
                98.20% Claim Settlement Ratio
              </span>
            </div>

            {/* Right: phone + check premium */}
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button style={{
                width: 44, height: 44, borderRadius: "50%",
                border: "1.5px solid rgba(255,255,255,0.6)",
                background: "transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <PhoneSVG color="#fff" size={18} />
              </button>
              {/* Check Premium button: white bg, navy text */}
              <button style={{
                height: 48, padding: "0 28px", borderRadius: 999,
                border: "none", background: "#fff", color: NAVY,
                fontSize: 16, fontWeight: 700,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                Check Premium <ArrowSVG color={NAVY} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Mobile CSS overrides for header ── */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-header-right { display: none !important; }
          .mobile-header-right  { display: flex !important; }
          .search-bar           { display: none !important; }
        }
      `}</style>

    </div>
  );
}
