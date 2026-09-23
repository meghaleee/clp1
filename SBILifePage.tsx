import { useState, useEffect, useRef } from "react";
import CheckPremiumSheet from "./CheckPremiumSheet";

/* ================================================================
   BRAND TOKENS — change here to update globally
================================================================ */
const NAVY       = "#2a2076";
const PINK       = "#D60D47";
const GRAD       = `linear-gradient(90deg, ${PINK} 0%, ${NAVY} 100%)`;
const BADGE_GRAD = `linear-gradient(90deg, #EA89A5 0%, #8C178C 100%)`;
const BORDER     = "#e4e0eb";
const GRAY       = "#6f6f6f";
const BG         = "#f7f6f9";

/* ================================================================
   DATA
================================================================ */
const NAV_LINKS = [
  "Life Insurance Plans","Group Insurance Plans","Life Insurance Library",
  "Customer Services","Tools and Calculators","About Us","Contact",
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
  { icon: "user",                value: "98.20%",         label: "Claim Settlement Ratio" },
  { icon: "houseiconcontainer",  value: "1230",           label: "Branches in India**" },
  { icon: "people",              value: "8,36,78,351",    label: "Policy Holders^" },
];

const PRODUCTS = [
  { badge: "Savings Plan",                logo: `${process.env.PUBLIC_URL}/smart-platina-supreme.png`, name: "Smart Platina Supreme", uin: "UIN : 111N171V03", desc: "Enables you to move confidently with guaranteed benefits" },
  { badge: "Term Insurance",              logo: `${process.env.PUBLIC_URL}/smart-shield-premier.png`,  name: "Smart Shield Premier",  uin: "UIN: 111N145V01",  desc: "A plan that offers you guaranteed returns and protection, for a lifetime" },
  { badge: "Unit Linked Insurance Plans", logo: `${process.env.PUBLIC_URL}/smart-fortune-builder.png`, name: "Smart Fortune Builder", uin: "UIN: 111L142V01",  desc: "Becomes the starting point for growing aspirations." },
];

const FAQS = [
  { q: "Why should I buy SBI Life - Smart Shield Plus?",                         a: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s" },
  { q: "Is the SBI Life - Smart Shield Plus worth buying?",                      a: "" },
  { q: "How is my insurance premium determined?",                                a: "" },
  { q: "What are the advantages of choosing SBI Life - Smart Shield Plus?",      a: "" },
  { q: "What riders are available with SBI Life - Smart Shield Plus?",           a: "" },
  { q: "What is the eligibility requirements for SBI Life - Smart Shield Plus?", a: "" },
];

const FOOTER_COLS = [
  { title: "Life Insurance Plans",   links: ["Term Plans","Savings Plans","Retirement Plans","Child Plan","ULIP / Wealth Creation Plans","Health / Protection Plans"] },
  { title: "Group Insurance Plans",  links: ["Corporate Solutions Plans","Group Loan Protection Plans","Group Micro Insurance Plans"] },
  { title: "Customer Services",      links: ["Services","Claim and Maturity","NRI Corner","Download Center","Nav & Fund Performance","Need Assessment Calculator"] },
  { title: "Tools & Calculators",    links: ["Human Life Value","Goal Planner","Cost Of Smoking","Power Of Compounding","Health Tax Saving"] },
  { title: "SBI LIFE",               links: ["About Us","Leadership","Key Milestone","Awards","CSR","Media Centre","Investor Relations","Careers","Life Verse","Partners"] },
  { title: "Life Insurance Library", links: ["Insurance Guide","FAQs","Understanding Life Insurance"] },
  { title: "Group Companies",        links: ["SBI","SBI Online","SBI General Insurance","SBI Card","SBI Mutual Funds","SBI Capital","SBI Global","SBI DFHI"] },
  { title: "Connect with Us",        links: ["Facebook","Twitter","LinkedIn","Youtube","Instagram","Quora"] },
];

/* ================================================================
   SVG HELPERS
================================================================ */
const Icon = ({ name, size = 24 }: { name: string; size?: number }) => (
  <img src={`./icons/${name}.svg`} alt="" width={size} height={size}
    style={{ objectFit: "contain", display: "block", flexShrink: 0 }} />
);
const DownloadSVG = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M12 3v13M7 11l5 5 5-5" stroke={NAVY} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M5 21h14" stroke={NAVY} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
const PhoneSVG = ({ color = "#fff", size = 18 }: { color?: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.58.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1C10.6 21 3 13.4 3 4c0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.24 1.01L6.6 10.8z"
      stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ChevronSVG = ({ color = "#fff" }: { color?: string }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
    <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ArrowSVG = ({ color = NAVY }: { color?: string }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
    <path d="M5 12h14M13 6l6 6-6 6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ShieldSVG = ({ color = "#fff", size = 16 }: { color?: string; size?: number }) => (
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
  const [premiumOpen, setPremiumOpen]       = useState(false);
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
    /* ── ROOT — overflow:hidden stops hero from causing horizontal scroll ── */
    <div style={{ fontFamily: "'Lato', sans-serif", background: "#fff", color: "#111111", overflowX: "hidden", width: "100%" }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;500;700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body { overflow-x: hidden; width: 100%; }
        body { font-family: 'Lato', sans-serif; }
        button { font-family: 'Lato', sans-serif; cursor: pointer; }
        input, select { font-family: 'Lato', sans-serif; }

        /* ── CONTAINER ────────────────────────────────────────────
           Max width 1200px, centred, 40px side padding desktop
           Reduced to 16px on mobile
        ──────────────────────────────────────────────────────── */
        .container {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          padding-left: 40px;
          padding-right: 40px;
        }

        /* ══════════════════════════════════════════════════════════
           DESKTOP STYLES
        ══════════════════════════════════════════════════════════ */

        /* ── HEADER TOP BAR ───────────────────────────────────────
           Height: 70px | sticky top:0 | z-index:300
        ──────────────────────────────────────────────────────── */
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

        /* ── HEADER SEARCH BAR ────────────────────────────────────
           Desktop only — hidden on mobile via media query
           Font size: 14px
        ──────────────────────────────────────────────────────── */
        .search-bar {
          flex: 1;
          max-width: 540px;
          height: 44px;
          background: #f1f1f1;
          border: none;
          border-radius: 999px;
          padding: 0 20px;
          font-size: 14px;          /* DESKTOP: search bar font size */
          color: #777;
          outline: none;
        }

        /* ── DARK NAVY NAV BAR ────────────────────────────────────
           Desktop only — hidden on mobile via media query
           Height: 48px | sticky top:70px
        ──────────────────────────────────────────────────────── */
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
          font-size: 14px;          /* DESKTOP: nav link font size */
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          white-space: nowrap;
        }

        /* ── SECONDARY STICKY NAV ─────────────────────────────────
           Shows product logo after hero scroll
           Height: 56px | Desktop top: 118px (70+48) | Mobile top: 70px
        ──────────────────────────────────────────────────────── */
        .secondary-nav {
          height: 56px;
          background: #fff;
          border-bottom: 1px solid ${BORDER};
          position: sticky;
          top: 118px;
          z-index: 298;
          display: flex;
          align-items: center;
        }

        /* ── HERO SECTION ─────────────────────────────────────────
           Desktop: 56px top/bottom
           bg: white
           IMPORTANT: width:100% + overflow:hidden prevents horizontal bleed
        ──────────────────────────────────────────────────────── */
        .hero-section {
          background: #fff;
          width: 100%;
          overflow: hidden;
          padding-top: 56px;        /* DESKTOP: hero top padding */
          padding-bottom: 56px;     /* DESKTOP: hero bottom padding */
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1fr 468px;
          gap: 28px;
          align-items: start;
        }

        /* ── HERO 3 BENEFIT FEATURES ──────────────────────────────
           Horizontal row with only dividers between cells
           NO outer border on the row itself
           On mobile: stays horizontal (3 equal columns)
        ──────────────────────────────────────────────────────── */
        .feature-row {
          display: flex;
          align-items: stretch;
          margin-top: 24px;
          width: 100%;
        }
        .feature-cell {
          flex: 1;
          min-width: 0;             /* CRITICAL: prevents flex child overflow */
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
          font-size: 14px;          /* DESKTOP: feature text font size */
          font-weight: 400;
          line-height: 1.35;
          color: #111111;
          position: relative;
        }
        /* Only divider between cells — no outer border */
        .feature-cell + .feature-cell::before {
          content: "";
          position: absolute;
          top: 10%; left: 0;
          width: 1px; height: 80%;
          background: ${BORDER};
        }

        /* ── FORM CARD ────────────────────────────────────────────
           Right side of hero | white bg | border | 16px radius
        ──────────────────────────────────────────────────────── */
        .form-card {
          background: #fff;
          border: 1px solid ${BORDER};
          border-radius: 16px;
          padding: 32px 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;             /* prevents card from overflowing grid */
        }
        .input-wrap { position: relative; }
        .float-label {
          position: absolute;
          top: -9px; left: 12px;
          background: #fff;
          padding: 0 4px;
          font-size: 12px;          /* DESKTOP: floating label font size */
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
          font-size: 14px;          /* DESKTOP: form input font size */
          font-weight: 400;
          color: #111;
          outline: none;
          background: #fff;
        }
        .form-input:focus { border-color: ${NAVY}; }

        /* ── BUTTONS ──────────────────────────────────────────────
           Primary: navy bg | Secondary: white bg navy border
           Outline: white bg navy border (used for doc buttons etc)
        ──────────────────────────────────────────────────────── */
        .btn-primary {
          width: 100%;
          height: 56px;
          border: none;
          border-radius: 999px;
          background: ${NAVY};
          color: #fff;
          font-size: 16px;          /* DESKTOP: primary button font size */
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
          font-size: 16px;          /* DESKTOP: secondary button font size */
          font-weight: 500;
        }
        .btn-outline {
          height: 52px;
          padding: 0 28px;
          border: 1px solid ${NAVY};
          border-radius: 999px;
          background: #fff;
          color: ${NAVY};
          font-size: 16px;          /* DESKTOP: outline button font size */
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        /* ── SECTION SPACING ──────────────────────────────────────
           White sections:   56px top + bottom
           Coloured sections (FAQ/Products): 56px top + bottom
           Documents section: 40px top, 0 bottom
        ──────────────────────────────────────────────────────── */
        .sec-white {
          background: #fff;
          padding-top: 56px;        /* DESKTOP: white section top padding */
          padding-bottom: 56px;     /* DESKTOP: white section bottom padding */
        }
        .sec-colored {
          background: ${BG};
          padding-top: 56px;        /* DESKTOP: coloured section top padding */
          padding-bottom: 56px;     /* DESKTOP: coloured section bottom padding */
        }
        .sec-docs {
          background: #fff;
          padding-top: 40px;        /* DESKTOP: documents section top padding */
          padding-bottom: 0;        /* DESKTOP: documents section bottom padding */
        }

        /* ── IMPORTANT DOCUMENTS LAYOUT ───────────────────────── */
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

        /* ── UNDERSTAND POLICY LAYOUT ─────────────────────────── */
        .policy-grid {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 32px;
          align-items: start;
        }
        .policy-features {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        /* ── STATS GRID ───────────────────────────────────────── */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 32px;
          margin-top: 32px;
        }

        /* ── PRODUCTS GRID ────────────────────────────────────── */
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

        /* ── FAQ ITEMS ────────────────────────────────────────── */
        .faq-list { margin-top: 32px; display: flex; flex-direction: column; gap: 12px; }
        .faq-item {
          background: ${BG};
          border-radius: 8px;
          padding: 18px 20px;
          cursor: pointer;
        }

        /* ── CONTACT SECTION ──────────────────────────────────── */
        .contact-section {
          background: ${GRAD};
          padding-top: 56px;        /* DESKTOP: contact section top padding */
          padding-bottom: 56px;     /* DESKTOP: contact section bottom padding */
        }
        .contact-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }

        /* ── FOOTER GRID ──────────────────────────────────────── */
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 40px;
        }

        /* ── STICKY BOTTOM BAR ────────────────────────────────── */
        .sticky-bar {
          position: fixed;
          bottom: 0; left: 0; right: 0;
          background: ${GRAD};
          z-index: 500;
          padding: 16px 40px;       /* DESKTOP: sticky bar padding (top/bottom 16px) */
        }
        .sticky-inner {
          width: 100%;
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        /* ══════════════════════════════════════════════════════════
           TABLET — max-width: 1024px
        ══════════════════════════════════════════════════════════ */
        @media (max-width: 1024px) {
          .hero-grid       { grid-template-columns: 1fr; }
          .policy-grid     { grid-template-columns: 1fr; }
          .products-grid   { grid-template-columns: repeat(2, 1fr); }
          .footer-grid     { grid-template-columns: repeat(2, 1fr); }
          .stats-grid      { grid-template-columns: repeat(2, 1fr); }
          .contact-inner   { flex-direction: column; align-items: flex-start; }
        }

        /* ══════════════════════════════════════════════════════════
           MOBILE — max-width: 768px
           Each rule is labelled so you can find and change it easily
        ══════════════════════════════════════════════════════════ */
        @media (max-width: 768px) {

          /* MOBILE: container side padding */
          .container {
            padding-left: 16px;
            padding-right: 16px;
          }

          /* MOBILE: hide desktop nav bar */
          .nav-bar { display: none; }

          /* MOBILE: secondary nav position (no navy bar above it) */
          .secondary-nav { top: 70px; }

          /* ── MOBILE HERO ────────────────────────────────────────
             padding-top/bottom controls vertical space in hero on mobile
          ──────────────────────────────────────────────────────── */
          .hero-section {
            padding-top: 0px;      /* MOBILE: hero top padding */
            padding-bottom: 24px;   /* MOBILE: hero bottom padding */
          }

          /* ── MOBILE HERO FEATURES ───────────────────────────────
             3 columns forced with equal width — no overflow
             Do NOT change display:grid here or layout will break
          ──────────────────────────────────────────────────────── */
          .feature-row {
            display: grid;
            grid-template-columns: repeat(3, 1fr); /* MOBILE: 3 equal columns */
            gap: 0;
            overflow: hidden;
            width: 100%;
          }
          .feature-cell {
            min-width: 0;           /* CRITICAL: prevents overflow */
            padding: 12px 8px;      /* MOBILE: feature cell padding */
            font-size: 11px;        /* MOBILE: feature text font size */
            gap: 8px;
          }
          /* Keep dividers between mobile feature cells */
          .feature-cell + .feature-cell::before {
            content: "";
            position: absolute;
            top: 10%; left: 0;
            width: 1px; height: 80%;
            background: ${BORDER};
          }

          /* ── MOBILE SECTION SPACING ─────────────────────────────
             Change these values to adjust padding on coloured/white sections
          ──────────────────────────────────────────────────────── */
          .sec-white {
            padding-top: 40px;      /* MOBILE: white section top padding */
            padding-bottom: 40px;   /* MOBILE: white section bottom padding */
          }
          .sec-colored {
            padding-top: 56px;      /* MOBILE: coloured section top padding */
            padding-bottom: 56px;   /* MOBILE: coloured section bottom padding */
          }
          .sec-docs {
            padding-top: 24px;      /* MOBILE: documents section top padding */
            padding-bottom: 24px;   /* MOBILE: documents section bottom padding */
          }

          /* ── MOBILE DOCUMENTS BUTTONS ───────────────────────────
             Full width stacked on mobile
          ──────────────────────────────────────────────────────── */
          .doc-row { flex-direction: column; align-items: stretch; gap: 16px; }
          .doc-btns { flex-direction: column; width: 100%; }
          .doc-btns .btn-outline {
            width: 100%;
            justify-content: center;
          }

          /* MOBILE: products single column */
          .products-grid { grid-template-columns: 1fr; }

          /* MOBILE: footer 2 columns */
          .footer-grid { grid-template-columns: 1fr 1fr; }

          /* MOBILE: policy features single column */
          .policy-features { grid-template-columns: 1fr; }

          /* ── MOBILE CONTACT SECTION ─────────────────────────────
             Stacked layout, adjust padding here
          ──────────────────────────────────────────────────────── */
          .contact-section {
            padding-top: 40px;      /* MOBILE: contact section top padding */
            padding-bottom: 40px;   /* MOBILE: contact section bottom padding */
          }
          .contact-inner { flex-direction: column; }

          /* ── MOBILE STICKY BAR ──────────────────────────────────
             Increase padding here if content is getting cut off
          ──────────────────────────────────────────────────────── */
          .sticky-bar {
            padding: 20px 16px;     /* MOBILE: sticky bar padding (top/bottom 20px) */
          }

          /* ── MOBILE TYPOGRAPHY ──────────────────────────────────
             All mobile font size overrides in one place
          ──────────────────────────────────────────────────────── */

          /* MOBILE: large section titles (Trusted by customers, Explore, FAQ) */
          .section-title-lg { font-size: 24px !important; }

          /* MOBILE: medium section titles (Understand policy, Still unsure) */
          .section-title-md { font-size: 20px !important; }

          /* MOBILE: stat value numbers */
          .stat-value { font-size: 16px !important; }

          /* MOBILE: stat labels below numbers */
          .stat-label { font-size: 12px !important; }

          /* MOBILE: FAQ question text */
          .faq-question { font-size: 14px !important; }

          /* MOBILE: primary + secondary buttons */
          .btn-primary, .btn-secondary {
            font-size: 14px;        /* MOBILE: button font size */
            height: 52px;           /* MOBILE: button height */
          }

          /* MOBILE: outline buttons (docs, check benefits etc) */
          .btn-outline {
            font-size: 14px;        /* MOBILE: outline button font size */
            height: 46px;           /* MOBILE: outline button height */
          }

          /* ── MOBILE FORM CARD ───────────────────────────────────
             On mobile the form sits below the hero left content
             Adjust padding/gap here
          ──────────────────────────────────────────────────────── */
          .form-card {
            padding: 24px 16px;     /* MOBILE: form card padding */
            gap: 16px;              /* MOBILE: form card gap between fields */
          }
          .form-input {
            font-size: 16px;        /* MOBILE: 16px or iOS Safari zooms on focus and never zooms back */
            height: 52px;           /* MOBILE: form input height — unchanged by the line above */
          }
          .float-label {
            font-size: 11px;        /* MOBILE: floating label font size */
          }
        }

        /* ══════════════════════════════════════════════════════════
           SMALL MOBILE — max-width: 480px
        ══════════════════════════════════════════════════════════ */
        @media (max-width: 480px) {
          .footer-grid { grid-template-columns: 1fr; }
          .stats-grid  { grid-template-columns: 1fr 1fr; }

          /* SMALL MOBILE: feature cell font size (very small screens) */
          .feature-cell { font-size: 10px; padding: 10px 4px; }
        }

        /* ── MOBILE HEADER SHOW/HIDE ─────────────────────────── */
        @media (max-width: 768px) {
          .desktop-header-right { display: none !important; }
          .mobile-header-right  { display: flex !important; }
          .search-bar           { display: none !important; }
        }
      `}</style>

      {/* ============================================================
          HEADER — DESKTOP TOP BAR
          Contains: logos, search, language, user, phone, pay premium
          On mobile: logos + hamburger only
      ============================================================ */}
      <div className="header-top">
        <div className="container header-top-inner">

          {/* SBI Life logo only — Liberating Lives has moved to hero */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, flexShrink: 0 }}>
            <img
              src={`${process.env.PUBLIC_URL}/sbi-life-logo.png`}
              alt="SBI Life"
              style={{ height: 32, objectFit: "contain" }}
              onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
            />
          </div>

          {/* Search bar — desktop only */}
          <input className="search-bar" placeholder="Search for Insurance" readOnly />

          {/* Desktop right: EN, user, phone, pay premium */}
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

          {/* Mobile right: search icon + hamburger */}
          <div className="mobile-header-right"
            style={{ display: "none", alignItems: "center", gap: 12, marginLeft: "auto" }}>
            <button style={{ background: "none", border: "none", padding: 4 }}>
              <SearchSVG />
            </button>
            <button style={{ background: "none", border: "none", padding: 4 }}
              onClick={() => setMobileMenuOpen(o => !o)}>
              <HamburgerSVG />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile slide-down nav menu */}
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
          DESKTOP DARK NAVY NAV BAR
          Hidden on mobile
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
          SECONDARY STICKY NAV — product logo bar
          Appears after hero on scroll
      ============================================================ */}
      {showSticky && (
        <div className="secondary-nav">
          <div className="container">
            <img
              src={`${process.env.PUBLIC_URL}/smart-shield-plus.png`}
              alt="Smart Shield Plus"
              style={{ height: 36, objectFit: "contain" }}
              onError={e => {
                const el = e.target as HTMLImageElement;
                el.style.display = "none";
                if (el.nextElementSibling) (el.nextElementSibling as HTMLElement).style.display = "flex";
              }}
            />
            <div style={{ display: "none", flexDirection: "column", lineHeight: 1.25 }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: NAVY }}>
                <span style={{ color: PINK, fontStyle: "italic" }}>SBI Life</span> - Smart Shield Plus
              </span>
              <span style={{ fontSize: 11, color: GRAY }}>UIN: 111N150V01</span>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          HERO SECTION
          Desktop: 2-col grid (left content | right form)
          Mobile: single column stacked

          KEY FIX: width:100% + overflow:hidden on .hero-section
          and min-width:0 on all flex/grid children stops horizontal overflow
      ============================================================ */}
      <div className="hero-section">
        <div className="container">
          <div className="hero-grid">

            {/* ── HERO LEFT ── */}
            <div style={{ minWidth: 0 }}>

              {/* ────────────────────────────────────────────────────
                  LIBERATING LIVES LOGO — now in hero, not header
                  DESKTOP: height 40px | MOBILE: height 32px (see inline style)
                  File: /public/liberatinglives.svg
              ──────────────────────────────────────────────────── */}
              <img
                src={`${process.env.PUBLIC_URL}/liberatinglives.svg`}
                alt="Liberating Lives"
                style={{ height: 40, objectFit: "contain", marginBottom: 16 }}   /* DESKTOP: liberating lives logo height */
                onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
              />

              {/* ────────────────────────────────────────────────────
                  PRODUCT LOGO IMAGE
                  DESKTOP: height 125px | change here
              ──────────────────────────────────────────────────── */}
              <img
                src={`${process.env.PUBLIC_URL}/smart-shield-plus.png`}
                alt="SBI Life Smart Shield Plus"
                style={{ height: 125, objectFit: "contain" }}                    /* DESKTOP: product logo height */
                onError={e => {
                  const el = e.target as HTMLImageElement;
                  el.style.display = "none";
                  if (el.nextElementSibling) (el.nextElementSibling as HTMLElement).style.display = "block";
                }}
              />
              {/* Fallback product title text */}
              <div style={{ display: "none" }}>
                <div style={{ fontSize: 36, fontWeight: 900, color: NAVY, lineHeight: 1.1 }}>
                  <span style={{ color: PINK, fontStyle: "italic" }}>SBI Life</span> -<br />Smart<br />Shield Plus
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: GRAY, marginTop: 4 }}>UIN: 111N150V01</div>
              </div>

              {/* ────────────────────────────────────────────────────
                  PRODUCT DESCRIPTION
                  DESKTOP: 16px/400 | change font size here
              ──────────────────────────────────────────────────── */}
              <p style={{ fontSize: 16, fontWeight: 400, lineHeight: 1.35, color: "#111111", marginTop: 12 }}>
                {/* DESKTOP: product description font size = 16px */}
                An Individual, Non-Linked, Non-Participating, Life Insurance Pure Risk Product
              </p>

              {/* ────────────────────────────────────────────────────
                  PREMIUM HEADING
                  DESKTOP: 24px/700 navy | change here
              ──────────────────────────────────────────────────── */}
              <h2 style={{ fontSize: 24, fontWeight: 700, color: NAVY, marginTop: 24 }}>
                {/* DESKTOP: premium heading font size = 24px */}
                Premium starting at ₹499/month<sup style={{ fontSize: 14, fontWeight: 400 }}>*</sup>
              </h2>

              {/* ────────────────────────────────────────────────────
                  3 BENEFIT FEATURES
                  — display:grid on mobile, flex on desktop
                  — NO outer border — only dividers between cells
                  — min-width:0 on each cell prevents overflow
              ──────────────────────────────────────────────────── */}
              <div className="feature-row">
                {HERO_FEATURES.map((f, i) => (
                  <div key={i} className="feature-cell">
                    {/* DESKTOP: icon size 28px | MOBILE: icon size 20px (change size prop below) */}
                    <Icon name={f.icon} size={28} />           {/* ← DESKTOP feature icon size */}
                    <span>{f.text}</span>
                  </div>
                ))}
              </div>

              {/* ────────────────────────────────────────────────────
                  DISCLAIMER TEXT
                  DESKTOP: 12px/500 at 50% opacity
              ──────────────────────────────────────────────────── */}
              <p style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.5)", lineHeight: 1.7, marginTop: 20 }}>
                {/* DESKTOP: disclaimer font size = 12px */}
                For more details on risk factors, terms and conditions please read the sales brochure carefully before concluding a sale.<br />
                &For more details on risk factors, terms and conditions of riders please read the rider brochure carefully before concluding a sale
              </p>
            </div>

            {/* ── HERO RIGHT — FORM CARD ── */}
            <div className="form-card" style={{ minWidth: 0 }}>

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

              {/* As per Govt ID proof hint */}
              <p style={{ fontSize: 12, color: GRAY, marginTop: -12 }}>As per Govt. ID proof</p>

              {/* Mobile number field */}
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

              {/* PwD checkbox */}
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                <input type="checkbox" style={{ width: 16, height: 16, marginTop: 2, accentColor: NAVY, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.5)", lineHeight: 1.25 }}>
                  {/* DESKTOP: checkbox text font size = 12px */}
                  I am a differently abled person and I hold a valid PwD certificate.
                </span>
              </label>

              {/* Privacy policy checkbox */}
              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" }}>
                <input type="checkbox" style={{ width: 16, height: 16, marginTop: 1, accentColor: NAVY, flexShrink: 0 }} />
                <span style={{ fontSize: 12, fontWeight: 500, color: "rgba(0,0,0,0.5)", lineHeight: 1.25 }}>
                  {/* DESKTOP: privacy checkbox text font size = 12px */}
                  I accept SBI Life's{" "}
                  <a href="https://www.sbilife.co.in/en/privacy-policy" target="_blank" rel="noreferrer"
                    style={{ color: "#111", textDecoration: "underline" }}>Privacy policy</a>{" "}
                  and by submitting my contact details here, I override my NCPR registration and authorise SBl Life and its authorised representatives to contact me and send information/communication relating to this proposal/or the resulting policy through SMS /Email /Phone /Letter /WhatsApp /any other electronic mode of communication to my registered email id/mobile number.
                </span>
              </label>

              {/* Talk to Expert — primary button */}
              <button className="btn-primary">
                <PhoneSVG color="#fff" size={16} /> Talk to an Expert
              </button>

              {/* Continue Application — secondary button */}
              <button className="btn-secondary">Continue your Application</button>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll trigger point — sticky elements appear after this */}
      <div ref={triggerRef} />

      {/* ============================================================
          IMPORTANT DOCUMENTS
          Desktop: side-by-side | Mobile: stacked full-width buttons
          Padding: 40px top, 0 bottom
      ============================================================ */}
      <div className="sec-docs">
        <div className="container">
          <div className="doc-row">
            <h3 style={{ fontSize: 20, fontWeight: 600, color: NAVY }}>
              {/* DESKTOP: important documents heading font size = 20px */}
              Important documents
            </h3>
            <div className="doc-btns">
              <button className="btn-outline"><DownloadSVG /> Required Documents</button>
              <button className="btn-outline"><DownloadSVG /> Product Brochure</button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          UNDERSTAND YOUR POLICY
          White bg | 56px top + bottom
          Desktop: 2-col grid | Mobile: stacked
      ============================================================ */}
      <div className="sec-white">
        <div className="container">
          <div className="policy-grid">
            <div>
              <h2 className="section-title-md" style={{ fontSize: 24, fontWeight: 600, color: NAVY, lineHeight: 1.3 }}>
                {/* DESKTOP: understand policy title = 24px/600 */}
                Understand your policy better
              </h2>
              <p style={{ fontSize: 16, fontWeight: 400, color: GRAY, lineHeight: 1.5, marginTop: 8 }}>
                {/* DESKTOP: subtitle = 16px/400 */}
                Know all the benefits and features this policy has to offer
              </p>
              <button className="btn-outline" style={{ marginTop: 32 }}>
                Check Benefits &amp; Features <ArrowSVG />
              </button>
            </div>
            <div className="policy-features">
              {POLICY_FEATURES.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                  <Icon name={f.icon} size={24} />              {/* ← DESKTOP policy feature icon size */}
                  <span style={{ fontSize: 16, fontWeight: 500, color: "#111111", lineHeight: 1.35 }}>
                    {/* DESKTOP: policy feature text = 16px/500 */}
                    {f.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================
          STATS — TRUSTED BY CUSTOMERS
          White bg | 56px top + bottom | 4-col grid
      ============================================================ */}
      <div className="sec-white" style={{ borderTop: `1px solid ${BORDER}` }}>
        <div className="container">
          <h2 className="section-title-lg" style={{ fontSize: 32, fontWeight: 600, color: NAVY }}>
            {/* DESKTOP: stats section title = 32px/600 */}
            Trusted by customers across India
          </h2>
          <div className="stats-grid">
            {STATS.map((s, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <Icon name={s.icon} size={42} />                {/* ← DESKTOP stat icon size */}
                <div className="stat-value" style={{ fontSize: 20, fontWeight: 700, color: NAVY }}>
                  {/* DESKTOP: stat value = 20px/700 | MOBILE: overridden via .stat-value class */}
                  {s.value}
                </div>
                <div className="stat-label" style={{ fontSize: 16, fontWeight: 400, color: "#111111", lineHeight: 1.35 }}>
                  {/* DESKTOP: stat label = 16px/400 | MOBILE: overridden via .stat-label class */}
                  {s.label}
                </div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, fontWeight: 400, color: GRAY, lineHeight: 1.7, marginTop: 32 }}>
            *As per public disclosure (L-7 - Benefits Paid) &amp; Financial Statements (Schedule 4 - Benefits Paid) of the Company, benefits paid since inception upto period ending 31st December 2025.<br />
            **Includes count of in force and paid-up individual policies along with count of lives covered under various group policies as on period ending 31st December 2025.<br />
            ^Network of branches as on period ending 31st December 2025.
          </p>
        </div>
      </div>

      {/* ============================================================
          EXPLORE PRODUCTS
          Coloured bg (BG) | 56px top + bottom | 3-col grid
          Badge: pink→purple gradient (#EA89A5 → #8C178C)
      ============================================================ */}
      <div className="sec-colored">
        <div className="container">
          <h2 className="section-title-lg" style={{ fontSize: 32, fontWeight: 600, color: NAVY }}>
            {/* DESKTOP: products section title = 32px/600 */}
            Explore our other products
          </h2>
          <p style={{ fontSize: 16, fontWeight: 400, color: GRAY, marginTop: 8 }}>
            Discover a variety of plans designed for every life stage
          </p>
          <div className="products-grid">
            {PRODUCTS.map((p, i) => (
              <div key={i} className="product-card">
                {/* Product badge — gradient: #EA89A5 → #8C178C */}
                <div style={{ display: "inline-flex", padding: "4px 16px", borderRadius: 999, background: BADGE_GRAD, color: "#fff", fontSize: 14, fontWeight: 500, width: "fit-content" }}>
                  {/* DESKTOP: badge font size = 14px */}
                  {p.badge}
                </div>
                {/* Product logo image 120×72 */}
                <img src={p.logo} alt={p.name}
                  style={{ width: 120, height: 72, objectFit: "contain" }}       /* ← DESKTOP: product logo size */
                  onError={e => {
                    const el = e.target as HTMLImageElement;
                    el.style.display = "none";
                    if (el.nextElementSibling) (el.nextElementSibling as HTMLElement).style.display = "block";
                  }}
                />
                <div style={{ display: "none" }}>
                  <div style={{ fontSize: 18, fontWeight: 900, color: NAVY }}>
                    <span style={{ color: PINK, fontStyle: "italic" }}>SBI Life</span> - {p.name}
                  </div>
                  <div style={{ fontSize: 11, color: GRAY }}>{p.uin}</div>
                </div>
                <p style={{ fontSize: 14, fontWeight: 400, color: "rgba(0,0,0,0.6)", lineHeight: 1.35, flex: 1 }}>
                  {/* DESKTOP: product description = 14px/400 */}
                  {p.desc}
                </p>
                <button style={{ height: 48, borderRadius: 999, border: "none", background: NAVY, color: "#fff", fontSize: 16, fontWeight: 500, width: "100%" }}>
                  {/* DESKTOP: learn more button font size = 16px */}
                  Learn More
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          FAQ — FREQUENTLY ASKED QUESTIONS
          White bg | 56px top + bottom
          Cards use BG colour, no border, no divider inside open card
      ============================================================ */}
      <div className="sec-white">
        <div className="container">
          <h2 className="section-title-lg" style={{ fontSize: 32, fontWeight: 600, color: NAVY }}>
            {/* DESKTOP: FAQ title = 32px/600 */}
            Frequently Asked Questions
          </h2>
          <div className="faq-list">
            {FAQS.map((f, i) => (
              <div key={i} className="faq-item" onClick={() => setOpenFaq(openFaq === i ? -1 : i)}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 20 }}>
                  <span className="faq-question" style={{ fontSize: 16, fontWeight: 700, color: "#111111", lineHeight: 1.35 }}>
                    {/* DESKTOP: FAQ question = 16px/700 | MOBILE: overridden via .faq-question */}
                    {f.q}
                  </span>
                  <span style={{ fontSize: 22, color: GRAY, flexShrink: 0, lineHeight: 1 }}>
                    {openFaq === i ? "−" : "+"}
                  </span>
                </div>
                {openFaq === i && f.a && (
                  <p style={{ fontSize: 16, fontWeight: 400, color: "rgba(0,0,0,0.6)", lineHeight: 1.5, marginTop: 16 }}>
                    {/* DESKTOP: FAQ answer = 16px/400 */}
                    {f.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================================
          STILL UNSURE / CONTACT
          Gradient bg (pink → navy) | 56px top + bottom
          Desktop: side-by-side | Mobile: stacked
      ============================================================ */}
      <div className="contact-section">
        <div className="container">
          <div className="contact-inner">
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff" }}>
                {/* DESKTOP: contact title = 24px/700 */}
                Still unsure? We're just a click away
              </h2>
              <p style={{ fontSize: 16, fontWeight: 400, color: "#fff", opacity: 0.85, marginTop: 6 }}>
                {/* DESKTOP: contact subtitle = 16px/400 */}
                Speak to our insurance expert - call us at
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                <PhoneSVG color="#fff" size={24} />
                <span style={{ fontSize: 28, fontWeight: 700, color: "#fff", lineHeight: "36px" }}>
                  {/* DESKTOP: phone number = 28px/700 */}
                  1800 267 1800
                </span>
              </div>
            </div>
            <button style={{ height: 56, padding: "0 32px", borderRadius: 999, border: "1.5px solid rgba(255,255,255,0.6)", background: "transparent", color: "#fff", fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              {/* DESKTOP: callback button font size = 16px */}
              <PhoneSVG color="#fff" size={16} /> Request a Callback
            </button>
          </div>
        </div>
      </div>

      {/* ============================================================
          FOOTER
          White bg | Desktop 4-col | Mobile 2-col → 1-col
          Contains: disclaimer, links, legal
      ============================================================ */}
      <footer style={{ background: "#fff", borderTop: `1px solid ${BORDER}` }}>
        <div className="container" style={{ paddingTop: 40, paddingBottom: 40 }}>
          {/* Disclaimer accordion */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", paddingBottom: 20, borderBottom: `1px solid ${BORDER}`, marginBottom: 32 }}
            onClick={() => setDisclaimerOpen(o => !o)}>
            <span style={{ fontSize: 12, fontWeight: 700, color: GRAY, textTransform: "uppercase", letterSpacing: "0.5px" }}>DISCLAIMER</span>
            <ChevronSVG color={GRAY} />
          </div>
          {disclaimerOpen && (
            <p style={{ fontSize: 12, color: GRAY, lineHeight: 1.7, marginBottom: 24 }}>
              SBI Life Insurance Company Limited is registered with IRDAI. Reg No. 111. Trade logo belongs to State Bank of India, used under license.
            </p>
          )}

          {/* Footer columns */}
          <div className="footer-grid">
            {FOOTER_COLS.map((col, i) => (
              <div key={i}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 16 }}>
                  {/* DESKTOP: footer column heading = 16px/700 */}
                  {col.title}
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.links.map(l => (
                    <span key={l} style={{ fontSize: 14, fontWeight: 400, color: GRAY, cursor: "pointer", lineHeight: 1.4 }}>
                      {/* DESKTOP: footer link = 14px/400 */}
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legal */}
          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 40, paddingTop: 24, fontSize: 12, color: GRAY, lineHeight: 1.7 }}>
            <p style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 11, marginBottom: 6 }}>NOTICES</p>
            <p>As stipulated by IRDAI in its circular F&amp;I-CIR-INV-173-08-2011 dated July 29, 2011 the computation of Net Asset Value for Linked funds stands modified. <span style={{ color: PINK, cursor: "pointer" }}>Know more</span></p>
            <p style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 11, margin: "12px 0 6px" }}>QUICK LINKS</p>
            <p><span style={{ color: PINK }}>IRDAI</span> | Consumer Education Website | Sitemap | Life Insurance Council | Privacy Policy | Disclaimer | Do Not Call</p>
            <p style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 11, margin: "12px 0 6px" }}>SBI LIFE INSURANCE COMPANY LIMITED</p>
            <p>IRDAI Registration No. 111 Issued on 29th March 2001. Registered &amp; Corporate Office: SBI Life Insurance Co. Ltd, Natraj, M.V. Road &amp; Western Express Highway Junction, Andheri (East), Mumbai - 400 069. CIN: L99999MH2000PLC129113</p>
            <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 24, paddingTop: 16, textAlign: "center", fontSize: 12 }}>
              © 2022 SBI Life Insurance Company Limited. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* ============================================================
          STICKY BOTTOM BAR
          Fixed bottom | gradient bg | 16px padding desktop, 20px mobile
          Left: shield icon + claim ratio
          Right: phone circle + Check Premium button
      ============================================================ */}
      {showSticky && (
        <div className="sticky-bar">
          <div className="sticky-inner">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <ShieldSVG color="#fff" size={20} />              {/* ← DESKTOP: sticky bar shield icon size */}
              <span style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>
                {/* DESKTOP: sticky bar text = 16px/700 */}
                98.20% Claim Settlement Ratio
              </span>
            </div>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <button style={{ width: 44, height: 44, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.6)", background: "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PhoneSVG color="#fff" size={18} />             {/* ← DESKTOP: sticky bar phone icon size */}
              </button>
              <button
                onClick={() => setPremiumOpen(true)}
                style={{ height: 48, padding: "0 28px", borderRadius: 999, border: "none", background: "#fff", color: NAVY, fontSize: 16, fontWeight: 700, display: "flex", alignItems: "center", gap: 8 }}>
                {/* DESKTOP: Check Premium button font size = 16px */}
                Check Premium <ArrowSVG color={NAVY} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
          CHECK PREMIUM — bottom sheet on mobile, side sheet on desktop
          Three steps: basic details -> OTP -> callback received
      ============================================================ */}
      <CheckPremiumSheet
        open={premiumOpen}
        onClose={() => setPremiumOpen(false)}
        onCheckPremium={() => setPremiumOpen(false)}
      />
    </div>
  );
}
