/* @ds-bundle: {"format":4,"namespace":"LetReportDesignSystem_c26832","components":[{"name":"Button","sourcePath":"components/actions/Button.jsx"},{"name":"BrandHeader","sourcePath":"components/brand/BrandHeader.jsx"},{"name":"DayBadge","sourcePath":"components/brand/DayBadge.jsx"},{"name":"HeroCharacter","sourcePath":"components/brand/HeroCharacter.jsx"},{"name":"HeroHeadline","sourcePath":"components/brand/HeroHeadline.jsx"},{"name":"LogoLockup","sourcePath":"components/brand/LogoLockup.jsx"},{"name":"TermHighlight","sourcePath":"components/brand/TermHighlight.jsx"},{"name":"Badge","sourcePath":"components/content/Badge.jsx"},{"name":"Callout","sourcePath":"components/content/Callout.jsx"},{"name":"EduCard","sourcePath":"components/content/EduCard.jsx"},{"name":"ICON_CDN","sourcePath":"components/content/Icon.jsx"},{"name":"Icon","sourcePath":"components/content/Icon.jsx"},{"name":"NumberBadge","sourcePath":"components/content/NumberBadge.jsx"},{"name":"ProgressIndicator","sourcePath":"components/content/ProgressIndicator.jsx"},{"name":"SectionHeader","sourcePath":"components/content/SectionHeader.jsx"},{"name":"BenefitFooter","sourcePath":"components/cta/BenefitFooter.jsx"},{"name":"CTABanner","sourcePath":"components/cta/CTABanner.jsx"},{"name":"DocumentIllustration","sourcePath":"components/quiz/DocumentIllustration.jsx"},{"name":"QuizCard","sourcePath":"components/quiz/QuizCard.jsx"},{"name":"RecordIllustration","sourcePath":"components/quiz/RecordIllustration.jsx"}],"sourceHashes":{"components/actions/Button.jsx":"523425da4264","components/brand/BrandHeader.jsx":"e8cb8be63bc5","components/brand/DayBadge.jsx":"0f1c2253be15","components/brand/HeroCharacter.jsx":"a15c81d3c492","components/brand/HeroHeadline.jsx":"12f9b7d6b815","components/brand/LogoLockup.jsx":"aa4cdd2968a8","components/brand/TermHighlight.jsx":"bba4466372d6","components/content/Badge.jsx":"f8e65572609f","components/content/Callout.jsx":"e63af7b253fc","components/content/EduCard.jsx":"156db4a67a86","components/content/Icon.jsx":"f38cfd2127b8","components/content/NumberBadge.jsx":"4ec663379c40","components/content/ProgressIndicator.jsx":"7c48b3decfc1","components/content/SectionHeader.jsx":"7348a9e549b7","components/cta/BenefitFooter.jsx":"b313d5c7628b","components/cta/CTABanner.jsx":"ce8a0afb9d2d","components/quiz/DocumentIllustration.jsx":"41a5879ba3b9","components/quiz/QuizCard.jsx":"2b26a81572da","components/quiz/RecordIllustration.jsx":"93655d17e45a","ui_kits/social-posts/Post.jsx":"5e65946ce412"},"inlinedExternals":[],"unexposedExports":[]} */

(() => {

const __ds_ns = (window.LetReportDesignSystem_c26832 = window.LetReportDesignSystem_c26832 || {});

const __ds_scope = {};

(__ds_ns.__errors = __ds_ns.__errors || []);

// components/brand/DayBadge.jsx
try { (() => {
const SZ = {
  sm: {
    fs: 24,
    px: 16,
    h: 44,
    r: 8
  },
  md: {
    fs: 40,
    px: 24,
    h: 68,
    r: 12
  },
  lg: {
    fs: 56,
    px: 32,
    h: 92,
    r: 16
  }
};
function DayBadge({
  day = 1,
  label = 'Day',
  size = 'md',
  pad = false,
  tone = 'green'
}) {
  const s = SZ[size] || SZ.md;
  const bg = tone === 'navy' ? 'var(--navy-900)' : tone === 'blue' ? 'var(--blue-600)' : 'var(--green-600)';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3em',
      height: s.h,
      padding: '0 ' + s.px + 'px',
      borderRadius: s.r,
      background: bg,
      color: 'var(--white)',
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: s.fs,
      lineHeight: 1,
      letterSpacing: '-0.01em',
      boxShadow: 'inset 0 -3px 0 rgba(0,0,0,.14)',
      whiteSpace: 'nowrap'
    }
  }, label, " ", pad ? String(day).padStart(2, '0') : day);
}
Object.assign(__ds_scope, { DayBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/DayBadge.jsx", error: String((e && e.message) || e) }); }

// components/brand/HeroCharacter.jsx
try { (() => {
const META = {
  vina: {
    name: 'Vina',
    role: 'Food Safety Guide'
  },
  sokha: {
    name: 'Sokha',
    role: 'Production Worker'
  },
  dara: {
    name: 'Dara',
    role: 'QA / Supervisor'
  }
};
function HeroCharacter({
  character = 'vina',
  pose = 'half',
  height = 420,
  speech,
  speechSide = 'left',
  assetBase = ''
}) {
  const src = assetBase + 'assets/characters/' + character + '-' + (pose === 'portrait' ? 'portrait' : pose === 'full' ? 'full' : 'half') + '.png';
  const img = pose === 'portrait' ? /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: META[character].name,
    style: {
      width: height,
      height: height,
      objectFit: 'cover',
      objectPosition: 'top',
      borderRadius: '50%',
      display: 'block',
      border: '4px solid var(--white)',
      boxShadow: 'var(--shadow-card)'
    }
  }) : /*#__PURE__*/React.createElement("img", {
    src: src,
    alt: META[character].name + ', ' + META[character].role,
    style: {
      height,
      display: 'block',
      mixBlendMode: 'multiply',
      WebkitMaskImage: 'linear-gradient(180deg,#000 ' + (pose === 'full' ? 80 : 70) + '%,transparent)',
      maskImage: 'linear-gradient(180deg,#000 ' + (pose === 'full' ? 80 : 70) + '%,transparent)'
    }
  });
  const bubble = speech ? /*#__PURE__*/React.createElement("div", {
    style: {
      position: speechSide === 'top-left' ? 'absolute' : 'relative',
      right: speechSide === 'top-left' ? 'calc(100% - ' + Math.round(height * 0.06) + 'px)' : undefined,
      top: speechSide === 'top-left' ? 0 : undefined,
      width: speechSide === 'top-left' ? 250 : undefined,
      maxWidth: 250,
      marginTop: speechSide === 'top-left' ? 0 : height * 0.08,
      padding: '18px 22px',
      background: 'var(--white)',
      border: '2.5px solid var(--navy-900)',
      borderRadius: 28,
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: 24,
      lineHeight: 1.25,
      color: 'var(--navy-900)',
      textAlign: 'center',
      boxShadow: 'var(--shadow-card)',
      boxSizing: 'border-box'
    }
  }, speech) : null;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      display: 'inline-flex',
      flexDirection: speechSide === 'left' ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      gap: 8
    }
  }, img, bubble);
}
Object.assign(__ds_scope, { HeroCharacter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/HeroCharacter.jsx", error: String((e && e.message) || e) }); }

// components/brand/LogoLockup.jsx
try { (() => {
function LogoLockup({
  variant = 'lockup',
  height = 64,
  assetBase = '',
  inverse = false,
  tagline
}) {
  if (variant === 'badge') return /*#__PURE__*/React.createElement("img", {
    src: assetBase + 'assets/logo-badge.jpg',
    alt: "Standard AI Copilot",
    style: {
      height,
      width: height,
      borderRadius: '50%',
      display: 'block'
    }
  });
  if (variant === 'wordmark') return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      lineHeight: 1
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: height * 0.5,
      letterSpacing: '-0.02em',
      color: inverse ? 'var(--white)' : 'var(--navy-900)'
    }
  }, "Let ", /*#__PURE__*/React.createElement("span", {
    style: {
      color: inverse ? 'var(--green-300)' : 'var(--green-600)'
    }
  }, "Report")), tagline ? /*#__PURE__*/React.createElement("span", {
    style: {
      marginTop: height * 0.1,
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      fontSize: height * 0.2,
      color: inverse ? 'var(--blue-200)' : 'var(--navy-700)'
    }
  }, tagline) : null);
  return /*#__PURE__*/React.createElement("img", {
    src: assetBase + 'assets/logo-lockup.png',
    alt: "Standard AI Copilot \u2014 Your Partner for Safer Food",
    style: {
      height,
      display: 'block',
      mixBlendMode: inverse ? 'normal' : 'multiply'
    }
  });
}
Object.assign(__ds_scope, { LogoLockup });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/LogoLockup.jsx", error: String((e && e.message) || e) }); }

// components/brand/BrandHeader.jsx
try { (() => {
function BrandHeader({
  logo,
  right,
  tagline = 'Standards made simple for every food business',
  assetBase = ''
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: 24
    }
  }, /*#__PURE__*/React.createElement("div", null, logo || /*#__PURE__*/React.createElement(__ds_scope.LogoLockup, {
    height: 76,
    assetBase: assetBase
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      textAlign: 'right',
      maxWidth: 320,
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      fontSize: 20,
      lineHeight: 1.35,
      color: 'var(--navy-900)'
    }
  }, right || tagline));
}
Object.assign(__ds_scope, { BrandHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/BrandHeader.jsx", error: String((e && e.message) || e) }); }

// components/brand/TermHighlight.jsx
try { (() => {
function TermHighlight({
  tone = 'blue',
  children
}) {
  const bg = tone === 'green' ? 'var(--green-600)' : 'var(--blue-600)';
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-block',
      padding: '0.02em 0.28em 0.08em',
      borderRadius: '0.22em',
      background: bg,
      color: 'var(--white)',
      fontWeight: 700,
      lineHeight: 1.1
    }
  }, children);
}
Object.assign(__ds_scope, { TermHighlight });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/TermHighlight.jsx", error: String((e && e.message) || e) }); }

// components/brand/HeroHeadline.jsx
try { (() => {
function HeroHeadline({
  eyebrow,
  title,
  subtitle,
  definitions = [],
  align = 'center',
  size = 'h1'
}) {
  const fs = size === 'display' ? 'var(--fs-display)' : 'var(--fs-h1)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: align === 'center' ? 'center' : 'flex-start',
      textAlign: align,
      gap: 14
    }
  }, eyebrow ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginBottom: 6
    }
  }, eyebrow) : null, /*#__PURE__*/React.createElement("h1", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: fs,
      lineHeight: 'var(--lh-h1)',
      letterSpacing: 'var(--ls-h1)',
      color: 'var(--navy-900)',
      textWrap: 'balance'
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 40,
      lineHeight: 1.15,
      color: 'var(--navy-900)'
    }
  }, subtitle) : null, definitions.length ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      marginTop: 14,
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      fontSize: 'var(--fs-body)',
      lineHeight: 1.3,
      color: 'var(--navy-900)'
    }
  }, definitions.map((d, i) => /*#__PURE__*/React.createElement("div", {
    key: i
  }, d.article || 'A', " ", /*#__PURE__*/React.createElement(__ds_scope.TermHighlight, {
    tone: d.tone || (i === 0 ? 'blue' : 'green')
  }, d.term), " ", d.text))) : null);
}
Object.assign(__ds_scope, { HeroHeadline });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/brand/HeroHeadline.jsx", error: String((e && e.message) || e) }); }

// components/content/Icon.jsx
try { (() => {
const ALIAS = {
  document: 'file-text',
  record: 'clipboard-check',
  cleaning: 'spray-can',
  temperature: 'thermometer',
  hygiene: 'hand',
  training: 'graduation-cap',
  supplier: 'truck',
  equipment: 'wrench',
  'food-safety': 'shield-check',
  checklist: 'list-checks',
  warning: 'triangle-alert',
  correct: 'circle-check',
  incorrect: 'circle-x',
  comment: 'message-square-text',
  people: 'users',
  trust: 'chart-column',
  leaf: 'leaf',
  question: 'circle-help',
  tip: 'lightbulb',
  calendar: 'calendar-days',
  arrow: 'arrow-right',
  chevron: 'chevron-right'
};
const ICON_CDN = 'https://unpkg.com/lucide-static@0.460.0/icons/';
const CACHE = {};
function load(n) {
  if (!CACHE[n]) CACHE[n] = fetch(ICON_CDN + n + '.svg').then(r => r.ok ? r.text() : '').then(t => t.replace(/<!--[\s\S]*?-->/g, '').replace(/\s(width|height)="[^"]*"/g, '').replace('<svg', '<svg width="100%" height="100%" style="display:block"')).catch(() => '');
  return CACHE[n];
}
function Icon({
  name = 'document',
  size = 24,
  color = 'currentColor',
  strokeWidth,
  style,
  title
}) {
  const n = ALIAS[name] || name;
  const [svg, setSvg] = React.useState('');
  React.useEffect(() => {
    let on = true;
    load(n).then(s => {
      if (on) setSvg(strokeWidth ? s.replace(/stroke-width="[^"]*"/, 'stroke-width="' + strokeWidth + '"') : s);
    });
    return () => {
      on = false;
    };
  }, [n, strokeWidth]);
  return /*#__PURE__*/React.createElement("span", {
    role: title ? 'img' : undefined,
    "aria-label": title,
    "aria-hidden": title ? undefined : true,
    style: {
      display: 'inline-block',
      flex: 'none',
      width: size,
      height: size,
      color,
      lineHeight: 0,
      ...style
    },
    dangerouslySetInnerHTML: {
      __html: svg
    }
  });
}
Object.assign(__ds_scope, { ICON_CDN, Icon });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Icon.jsx", error: String((e && e.message) || e) }); }

// components/actions/Button.jsx
try { (() => {
const SZ = {
  sm: {
    h: 40,
    px: 18,
    fs: 18,
    r: 8,
    ic: 18
  },
  md: {
    h: 52,
    px: 24,
    fs: 22,
    r: 10,
    ic: 22
  },
  lg: {
    h: 64,
    px: 32,
    fs: 26,
    r: 12,
    ic: 26
  }
};
const V = {
  primary: {
    bg: 'var(--blue-600)',
    hv: 'var(--blue-700)',
    fg: 'var(--white)'
  },
  success: {
    bg: 'var(--green-600)',
    hv: 'var(--green-700)',
    fg: 'var(--white)'
  },
  secondary: {
    bg: 'var(--white)',
    hv: 'var(--blue-50)',
    fg: 'var(--blue-700)',
    bd: 'var(--blue-600)'
  },
  navy: {
    bg: 'var(--navy-900)',
    hv: 'var(--navy-800)',
    fg: 'var(--white)'
  }
};
function Button({
  variant = 'primary',
  size = 'md',
  state,
  icon,
  iconRight,
  fullWidth,
  disabled,
  onClick,
  children
}) {
  const [hover, setHover] = React.useState(false);
  const [down, setDown] = React.useState(false);
  const s = SZ[size] || SZ.md;
  let v = {
    ...(V[variant] || V.primary)
  };
  const st = disabled ? 'disabled' : state || (down ? 'active' : hover ? 'hover' : 'default');
  let bg = v.bg,
    fg = v.fg,
    bd = v.bd,
    shadow = v.bd ? 'none' : 'var(--shadow-button)',
    ty = 0,
    ic2 = iconRight;
  if (st === 'hover') bg = v.hv;
  if (st === 'active') {
    bg = v.hv;
    shadow = v.bd ? 'none' : 'var(--shadow-button-pressed)';
    ty = 2;
  }
  if (st === 'disabled') {
    bg = 'var(--gray-100)';
    fg = 'var(--gray-500)';
    bd = 'var(--gray-200)';
    shadow = 'none';
  }
  if (st === 'correct') {
    bg = 'var(--green-600)';
    fg = 'var(--white)';
    bd = null;
    shadow = '0 0 0 4px var(--green-300)';
    ic2 = 'correct';
  }
  if (st === 'incorrect') {
    bg = 'var(--red-100)';
    fg = 'var(--red-700)';
    bd = 'var(--red-500)';
    shadow = 'none';
    ic2 = 'incorrect';
  }
  return /*#__PURE__*/React.createElement("button", {
    type: "button",
    disabled: st === 'disabled',
    onClick: onClick,
    onMouseEnter: () => setHover(true),
    onMouseLeave: () => {
      setHover(false);
      setDown(false);
    },
    onMouseDown: () => setDown(true),
    onMouseUp: () => setDown(false),
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 10,
      height: s.h,
      padding: '0 ' + s.px + 'px',
      width: fullWidth ? '100%' : undefined,
      borderRadius: s.r,
      border: bd ? '2px solid ' + bd : '2px solid transparent',
      background: bg,
      color: fg,
      boxShadow: shadow,
      transform: 'translateY(' + ty + 'px)',
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: s.fs,
      lineHeight: 1,
      whiteSpace: 'nowrap',
      cursor: st === 'disabled' ? 'not-allowed' : 'pointer',
      transition: 'background var(--dur-fast) var(--ease-standard),transform var(--dur-fast) var(--ease-standard),box-shadow var(--dur-fast)',
      boxSizing: 'border-box'
    }
  }, icon ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: s.ic
  }) : null, children, ic2 ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: ic2,
    size: s.ic
  }) : null);
}
Object.assign(__ds_scope, { Button });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/actions/Button.jsx", error: String((e && e.message) || e) }); }

// components/content/Badge.jsx
try { (() => {
const V = {
  topic: {
    bg: 'var(--blue-100)',
    fg: 'var(--blue-700)',
    icon: null
  },
  category: {
    bg: 'var(--white)',
    fg: 'var(--navy-900)',
    bd: 'var(--color-border)',
    icon: null
  },
  correct: {
    bg: 'var(--green-600)',
    fg: 'var(--white)',
    icon: 'correct'
  },
  incorrect: {
    bg: 'var(--red-100)',
    fg: 'var(--red-700)',
    icon: 'incorrect'
  },
  record: {
    bg: 'var(--green-100)',
    fg: 'var(--green-700)',
    icon: null
  },
  document: {
    bg: 'var(--blue-100)',
    fg: 'var(--blue-700)',
    icon: null
  }
};
function Badge({
  variant = 'topic',
  icon,
  size = 'md',
  children
}) {
  const v = V[variant] || V.topic;
  const ic = icon === undefined ? v.icon : icon;
  const s = size === 'sm' ? {
    fs: 18,
    h: 32,
    px: 12,
    ic: 18
  } : {
    fs: 22,
    h: 40,
    px: 16,
    ic: 22
  };
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      height: s.h,
      padding: '0 ' + s.px + 'px',
      borderRadius: 'var(--radius-pill)',
      background: v.bg,
      color: v.fg,
      border: v.bd ? '1.5px solid ' + v.bd : 'none',
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: s.fs,
      lineHeight: 1,
      whiteSpace: 'nowrap'
    }
  }, ic ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: ic,
    size: s.ic
  }) : null, children);
}
Object.assign(__ds_scope, { Badge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Badge.jsx", error: String((e && e.message) || e) }); }

// components/content/Callout.jsx
try { (() => {
const V = {
  tip: {
    bg: 'var(--blue-100)',
    bd: 'var(--blue-200)',
    ic: 'tip',
    icbg: 'var(--blue-600)',
    label: 'Tip'
  },
  warning: {
    bg: 'var(--amber-100)',
    bd: '#F5CF85',
    ic: 'warning',
    icbg: 'var(--amber-500)',
    label: 'Watch out'
  },
  correct: {
    bg: 'var(--green-100)',
    bd: 'var(--green-300)',
    ic: 'correct',
    icbg: 'var(--green-600)',
    label: 'Correct answer'
  }
};
function Callout({
  variant = 'tip',
  title,
  children
}) {
  const v = V[variant] || V.tip;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'flex-start',
      padding: '20px 24px',
      background: v.bg,
      border: '1.5px solid ' + v.bd,
      borderRadius: 'var(--radius-md)',
      fontFamily: 'var(--font-body)',
      color: 'var(--navy-900)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 44,
      height: 44,
      borderRadius: '50%',
      background: v.icbg,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: v.ic,
    size: 26,
    color: "var(--white)"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      paddingTop: 2
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 24,
      lineHeight: 1.25
    }
  }, title || v.label), children ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 22,
      lineHeight: 1.4,
      fontWeight: 500,
      color: 'var(--color-text-secondary)'
    }
  }, children) : null));
}
Object.assign(__ds_scope, { Callout });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/Callout.jsx", error: String((e && e.message) || e) }); }

// components/content/NumberBadge.jsx
try { (() => {
const TONE = {
  blue: ['var(--blue-600)', 'var(--white)'],
  green: ['var(--green-600)', 'var(--white)'],
  navy: ['var(--navy-900)', 'var(--white)'],
  soft: ['var(--blue-100)', 'var(--blue-700)']
};
const SIZE = {
  sm: 36,
  md: 48,
  lg: 64
};
function NumberBadge({
  n = 1,
  tone = 'blue',
  size = 'md',
  pad = false
}) {
  const [bg, fg] = TONE[tone] || TONE.blue;
  const d = SIZE[size] || size;
  return /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flex: 'none',
      width: d,
      height: d,
      borderRadius: '50%',
      background: bg,
      color: fg,
      fontFamily: 'var(--font-label)',
      fontWeight: 800,
      fontSize: Math.round(d * 0.5),
      lineHeight: 1,
      boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.12)'
    }
  }, pad ? String(n).padStart(2, '0') : n);
}
Object.assign(__ds_scope, { NumberBadge });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/NumberBadge.jsx", error: String((e && e.message) || e) }); }

// components/content/EduCard.jsx
try { (() => {
const V = {
  default: {
    bg: 'var(--white)',
    bd: 'var(--color-border-neutral)',
    tone: 'navy',
    ic: null
  },
  question: {
    bg: 'var(--gradient-card)',
    bd: 'var(--color-border)',
    tone: 'blue',
    ic: 'question'
  },
  answer: {
    bg: 'var(--green-50)',
    bd: 'var(--green-300)',
    tone: 'green',
    ic: 'correct'
  },
  example: {
    bg: 'var(--white)',
    bd: 'var(--color-border)',
    tone: 'blue',
    ic: null
  },
  warning: {
    bg: 'var(--amber-100)',
    bd: '#F5CF85',
    tone: 'navy',
    ic: 'warning',
    icc: 'var(--amber-700)'
  },
  success: {
    bg: 'var(--green-100)',
    bd: 'var(--green-300)',
    tone: 'green',
    ic: 'correct'
  },
  educational: {
    bg: 'var(--blue-100)',
    bd: 'var(--color-border)',
    tone: 'blue',
    ic: 'training'
  }
};
function EduCard({
  variant = 'default',
  number,
  title,
  icon,
  media,
  footer,
  children,
  padding = 'md',
  style
}) {
  const v = V[variant] || V.default;
  const ic = icon === undefined ? v.ic : icon;
  const pad = padding === 'lg' ? 'var(--card-padding-lg)' : 'var(--card-padding)';
  const iconColor = v.icc || (v.tone === 'green' ? 'var(--green-600)' : v.tone === 'blue' ? 'var(--blue-600)' : 'var(--navy-900)');
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--media-text-gap)',
      padding: pad,
      background: v.bg,
      border: '1.5px solid ' + v.bd,
      borderRadius: 'var(--radius-lg)',
      boxShadow: variant === 'default' || variant === 'example' ? 'var(--shadow-card)' : 'none',
      color: 'var(--navy-900)',
      fontFamily: 'var(--font-body)',
      boxSizing: 'border-box',
      ...style
    }
  }, number != null || title ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, number != null ? /*#__PURE__*/React.createElement(__ds_scope.NumberBadge, {
    n: number,
    tone: v.tone === 'navy' ? 'blue' : v.tone
  }) : ic ? /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: ic,
    size: 36,
    color: iconColor
  }) : null, title ? /*#__PURE__*/React.createElement("h3", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: 28,
      lineHeight: 1.2,
      color: 'var(--navy-900)',
      textWrap: 'balance'
    }
  }, title) : null) : null, media ? /*#__PURE__*/React.createElement("div", null, media) : null, children ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 'var(--fs-body-sm)',
      lineHeight: 'var(--lh-body-sm)',
      fontWeight: 500,
      color: 'var(--color-text-secondary)'
    }
  }, children) : null, footer ? /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto'
    }
  }, footer) : null);
}
Object.assign(__ds_scope, { EduCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/EduCard.jsx", error: String((e && e.message) || e) }); }

// components/content/ProgressIndicator.jsx
try { (() => {
function ProgressIndicator({
  current = 1,
  total = 30,
  variant = 'bar',
  label
}) {
  const pct = Math.max(0, Math.min(1, current / total));
  const txt = /*#__PURE__*/React.createElement("span", {
    style: {
      fontFamily: 'var(--font-label)',
      fontWeight: 700,
      fontSize: 20,
      color: 'var(--navy-900)',
      whiteSpace: 'nowrap'
    }
  }, label ?? 'Day ' + current + ' of ' + total);
  if (variant === 'dots') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 16
      }
    }, /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        gap: 8
      }
    }, Array.from({
      length: total
    }, (_, i) => /*#__PURE__*/React.createElement("span", {
      key: i,
      style: {
        width: i + 1 === current ? 28 : 12,
        height: 12,
        borderRadius: 999,
        background: i + 1 < current ? 'var(--green-500)' : i + 1 === current ? 'var(--blue-600)' : 'var(--blue-200)'
      }
    }))), txt);
  }
  if (variant === 'steps') {
    return /*#__PURE__*/React.createElement("div", {
      style: {
        display: 'flex',
        alignItems: 'center',
        gap: 6
      }
    }, Array.from({
      length: total
    }, (_, i) => {
      const s = i + 1 < current ? 'done' : i + 1 === current ? 'now' : 'todo';
      return /*#__PURE__*/React.createElement("span", {
        key: i,
        style: {
          width: 36,
          height: 36,
          borderRadius: '50%',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-label)',
          fontWeight: 800,
          fontSize: 16,
          background: s === 'done' ? 'var(--green-600)' : s === 'now' ? 'var(--blue-600)' : 'var(--white)',
          color: s === 'todo' ? 'var(--navy-500)' : 'var(--white)',
          border: s === 'todo' ? '1.5px solid var(--blue-200)' : 'none'
        }
      }, i + 1);
    }));
  }
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 16
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 120,
      height: 12,
      borderRadius: 999,
      background: 'var(--blue-100)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      width: pct * 100 + '%',
      height: '100%',
      borderRadius: 999,
      background: 'var(--green-500)'
    }
  })), txt);
}
Object.assign(__ds_scope, { ProgressIndicator });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/ProgressIndicator.jsx", error: String((e && e.message) || e) }); }

// components/content/SectionHeader.jsx
try { (() => {
function SectionHeader({
  title,
  description,
  align = 'center',
  eyebrow
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 'var(--heading-body-gap)',
      alignItems: align === 'center' ? 'center' : 'flex-start',
      textAlign: align
    }
  }, eyebrow ? /*#__PURE__*/React.createElement("div", null, eyebrow) : null, /*#__PURE__*/React.createElement("h2", {
    style: {
      margin: 0,
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 'var(--fs-h3)',
      lineHeight: 'var(--lh-h3)',
      letterSpacing: 'var(--ls-h3)',
      color: 'var(--navy-900)',
      textWrap: 'balance'
    }
  }, title), description ? /*#__PURE__*/React.createElement("p", {
    style: {
      margin: 0,
      maxWidth: 820,
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      fontSize: 'var(--fs-body-sm)',
      lineHeight: 'var(--lh-body-sm)',
      color: 'var(--color-text-secondary)',
      textWrap: 'pretty'
    }
  }, description) : null);
}
Object.assign(__ds_scope, { SectionHeader });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/content/SectionHeader.jsx", error: String((e && e.message) || e) }); }

// components/cta/BenefitFooter.jsx
try { (() => {
const DEF = [{
  icon: 'shield-check',
  label: 'Safer Food',
  color: 'var(--navy-900)'
}, {
  icon: 'users',
  label: 'Stronger Business',
  color: 'var(--blue-600)'
}, {
  icon: 'chart-column',
  label: 'Greater Trust',
  color: 'var(--navy-900)'
}, {
  icon: 'leaf',
  label: 'A Healthier Future',
  color: 'var(--green-600)'
}];
function BenefitFooter({
  items = DEF,
  follow = {
    title: 'Follow Standard AI Copilot',
    text: 'for simple and practical food safety knowledge one step at a time.'
  }
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'stretch',
      background: 'var(--white)',
      borderTop: '1.5px solid var(--gray-200)',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      padding: '20px 24px',
      gap: 8
    }
  }, items.map((it, i) => /*#__PURE__*/React.createElement(React.Fragment, {
    key: i
  }, i > 0 ? /*#__PURE__*/React.createElement("span", {
    style: {
      width: 1.5,
      alignSelf: 'stretch',
      margin: '8px 0',
      background: 'var(--gray-200)'
    }
  }) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: 10
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: it.icon,
    size: 34,
    color: it.color || 'var(--navy-900)'
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      fontWeight: 600,
      fontSize: 19,
      lineHeight: 1.2,
      color: 'var(--navy-900)'
    }
  }, it.label))))), follow ? /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none',
      width: 360,
      display: 'flex',
      alignItems: 'center',
      gap: 16,
      padding: '18px 24px 18px 48px',
      background: 'var(--green-600)',
      color: 'var(--white)',
      clipPath: 'polygon(24px 0,100% 0,100% 100%,0 100%)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 800,
      fontSize: 22,
      lineHeight: 1.2
    }
  }, follow.title), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 16,
      lineHeight: 1.35,
      fontWeight: 500
    }
  }, follow.text)), /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 40,
      height: 40,
      borderRadius: '50%',
      background: 'var(--white)',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: "chevron-right",
    size: 24,
    color: "var(--green-700)"
  }))) : null);
}
Object.assign(__ds_scope, { BenefitFooter });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cta/BenefitFooter.jsx", error: String((e && e.message) || e) }); }

// components/cta/CTABanner.jsx
try { (() => {
function CTABanner({
  icon = 'comment',
  title = 'Comment your answers below!',
  subtitle = "Let's learn together.",
  tone = 'navy'
}) {
  const bg = tone === 'green' ? 'var(--green-600)' : 'var(--navy-900)';
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 28,
      padding: '22px 40px',
      background: bg,
      borderRadius: 'var(--radius-pill)',
      color: 'var(--white)',
      boxShadow: 'var(--shadow-floating)'
    }
  }, icon ? /*#__PURE__*/React.createElement("span", {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: 76,
      height: 76,
      borderRadius: '50%',
      background: 'var(--white)',
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.Icon, {
    name: icon,
    size: 42,
    color: "var(--navy-900)"
  })) : null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 4,
      textAlign: 'center'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-display)',
      fontWeight: 800,
      fontSize: 40,
      lineHeight: 1.1,
      letterSpacing: '-0.01em'
    }
  }, title), subtitle ? /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-body)',
      fontWeight: 500,
      fontSize: 28,
      lineHeight: 1.3,
      color: 'var(--blue-100)'
    }
  }, subtitle) : null));
}
Object.assign(__ds_scope, { CTABanner });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/cta/CTABanner.jsx", error: String((e && e.message) || e) }); }

// components/quiz/DocumentIllustration.jsx
try { (() => {
function DocumentIllustration({
  title = 'Procedure',
  variant = 'procedure',
  lines = 5,
  width = 190,
  avatar
}) {
  const h = Math.round(width * 1.22);
  const line = (w, i) => /*#__PURE__*/React.createElement("div", {
    key: i,
    style: {
      height: 6,
      width: w,
      borderRadius: 3,
      background: 'var(--navy-300)'
    }
  });
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'relative',
      width,
      height: h,
      flex: 'none'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      transform: 'rotate(-4deg) translate(-6px,4px)',
      background: 'var(--white)',
      border: '1.5px solid var(--gray-300)',
      borderRadius: 6
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--white)',
      border: '1.5px solid var(--navy-500)',
      borderRadius: 6,
      padding: '18px 16px',
      boxSizing: 'border-box',
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      boxShadow: 'var(--shadow-card)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: Math.round(width * 0.085),
      lineHeight: 1.15,
      color: 'var(--navy-900)',
      textAlign: variant === 'procedure' ? 'center' : 'left',
      marginBottom: 4
    }
  }, title), variant === 'form' ? /*#__PURE__*/React.createElement(React.Fragment, null, line('90%', 0), line('70%', 1), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 'auto',
      height: 28,
      border: '1.5px solid var(--navy-300)',
      borderRadius: 4
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      height: 28,
      border: '1.5px solid var(--navy-300)',
      borderRadius: 4
    }
  })) : variant === 'instruction' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 10,
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: 10,
      flex: 1
    }
  }, Array.from({
    length: lines
  }, (_, i) => line('100%', i))), avatar ? /*#__PURE__*/React.createElement("div", {
    style: {
      width: '44%',
      alignSelf: 'center'
    }
  }, avatar) : null) : Array.from({
    length: lines
  }, (_, i) => line(['92%', '80%', '96%', '70%', '86%', '60%'][i % 6], i))));
}
Object.assign(__ds_scope, { DocumentIllustration });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/quiz/DocumentIllustration.jsx", error: String((e && e.message) || e) }); }

// components/quiz/QuizCard.jsx
try { (() => {
function QuizCard({
  number = 1,
  title,
  illustration,
  question = 'Document or Record?',
  options = ['Document', 'Record'],
  answer,
  selected,
  reveal = false,
  onSelect,
  layout = 'side',
  density = 'regular'
}) {
  const [pick, setPick] = React.useState(selected);
  const cur = selected ?? pick;
  const done = reveal || cur != null && answer != null;
  const stateFor = o => !done ? undefined : o === answer ? 'correct' : o === cur ? 'incorrect' : 'disabled';
  const c = density === 'compact';
  const q = c ? [question] : question.split(' or ');
  const buttons = /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 8
    }
  }, options.map((o, i) => /*#__PURE__*/React.createElement(__ds_scope.Button, {
    key: o,
    size: "sm",
    variant: i === 0 ? 'primary' : 'success',
    state: stateFor(o),
    onClick: () => {
      setPick(o);
      onSelect && onSelect(o);
    }
  }, o)));
  const qText = /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: c ? 20 : 24,
      lineHeight: 1.3,
      color: 'var(--navy-900)',
      textAlign: 'center'
    }
  }, q.length === 2 ? /*#__PURE__*/React.createElement(React.Fragment, null, q[0], /*#__PURE__*/React.createElement("br", null), "or", /*#__PURE__*/React.createElement("br", null), q[1]) : question);
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: c ? 10 : 16,
      padding: c ? '14px 14px 16px' : '20px 20px 22px',
      background: 'var(--gradient-card)',
      border: '1.5px solid var(--color-border)',
      borderRadius: 'var(--radius-lg)',
      boxSizing: 'border-box',
      height: '100%'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      alignItems: 'center',
      gap: c ? 12 : 14,
      minHeight: c ? 36 : 48
    }
  }, /*#__PURE__*/React.createElement(__ds_scope.NumberBadge, {
    n: number,
    size: c ? 'sm' : 'md'
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: c ? 20 : 24,
      lineHeight: 1.18,
      color: 'var(--navy-900)',
      textWrap: 'balance'
    }
  }, title)), layout === 'stack' ? /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: c ? 8 : 16,
      flex: 1,
      justifyContent: 'space-between'
    }
  }, illustration, qText, buttons) : /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      flex: 1
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 'none'
    }
  }, illustration), /*#__PURE__*/React.createElement("div", {
    style: {
      flex: 1,
      minWidth: 0,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 18
    }
  }, qText, buttons)));
}
Object.assign(__ds_scope, { QuizCard });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/quiz/QuizCard.jsx", error: String((e && e.message) || e) }); }

// components/quiz/RecordIllustration.jsx
try { (() => {
function RecordIllustration({
  title = 'Log',
  columns = ['Date', 'Time', 'Checked by'],
  rows = [['12/09', '08:00', '✓'], ['12/09', '12:00', '✓'], ['12/09', '16:00', '✓']],
  width = 220
}) {
  const cell = {
    borderRight: '1px solid var(--navy-300)',
    borderBottom: '1px solid var(--navy-300)',
    padding: '5px 6px',
    fontSize: Math.round(width * 0.058),
    lineHeight: 1.1,
    color: 'var(--navy-900)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  };
  const val = v => v === '✓' ? /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--green-600)',
      fontWeight: 800,
      fontSize: '1.35em'
    }
  }, "\u2713") : v;
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width,
      flex: 'none',
      background: 'var(--white)',
      border: '1.5px solid var(--navy-500)',
      borderRadius: 6,
      boxShadow: 'var(--shadow-card)',
      fontFamily: 'var(--font-body)',
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '10px 10px 8px',
      fontFamily: 'var(--font-heading)',
      fontWeight: 700,
      fontSize: Math.round(width * 0.068),
      color: 'var(--navy-900)',
      textAlign: 'center'
    }
  }, title), /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(' + columns.length + ',minmax(0,1fr))',
      borderTop: '1px solid var(--navy-300)'
    }
  }, columns.map((c, i) => /*#__PURE__*/React.createElement("div", {
    key: 'h' + i,
    style: {
      ...cell,
      fontWeight: 700,
      background: 'var(--blue-50)',
      borderRight: i === columns.length - 1 ? 'none' : cell.borderRight
    }
  }, c)), rows.flatMap((r, ri) => r.map((v, i) => /*#__PURE__*/React.createElement("div", {
    key: ri + '-' + i,
    style: {
      ...cell,
      textAlign: 'center',
      borderRight: i === r.length - 1 ? 'none' : cell.borderRight,
      borderBottom: ri === rows.length - 1 ? 'none' : cell.borderBottom
    }
  }, val(v))))));
}
Object.assign(__ds_scope, { RecordIllustration });
})(); } catch (e) { __ds_ns.__errors.push({ path: "components/quiz/RecordIllustration.jsx", error: String((e && e.message) || e) }); }

// ui_kits/social-posts/Post.jsx
try { (() => {
const {
  BrandHeader,
  DayBadge,
  HeroHeadline,
  HeroCharacter,
  SectionHeader,
  QuizCard,
  Icon,
  CTABanner,
  BenefitFooter,
  ProgressIndicator
} = window.LetReportDesignSystem_c26832;
const A = '../../';
const EXAMPLES = [{
  t: 'Wiping crumbs off a prep table',
  i: 'sparkles',
  a: 'Clean'
}, {
  t: 'Spraying sanitizer on a cutting board',
  i: 'spray-can',
  a: 'Sanitize'
}, {
  t: 'Washing plates with soap and water',
  i: 'droplets',
  a: 'Clean'
}, {
  t: 'Dipping tongs in 77 °C water for 30 s',
  i: 'thermometer',
  a: 'Sanitize'
}, {
  t: 'Scrubbing grease off the fryer',
  i: 'cooking-pot',
  a: 'Clean'
}, {
  t: 'Soaking knives in a chlorine solution',
  i: 'utensils',
  a: 'Sanitize'
}];
function Tile({
  icon,
  size = 96
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      width: size,
      height: size,
      borderRadius: size > 70 ? 20 : 16,
      background: 'var(--white)',
      border: '1.5px solid var(--blue-200)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  }, /*#__PURE__*/React.createElement(Icon, {
    name: icon,
    size: size * 0.5,
    color: "var(--blue-600)"
  }));
}
function QuizGrid({
  reveal,
  cols = 3,
  tile = 96,
  examples = EXAMPLES
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'grid',
      gridTemplateColumns: 'repeat(' + cols + ',minmax(0,1fr))',
      gap: 16
    }
  }, examples.map((e, i) => /*#__PURE__*/React.createElement(QuizCard, {
    key: i,
    number: i + 1,
    title: e.t,
    layout: "stack",
    density: "compact",
    question: "Clean or sanitize?",
    options: ['Clean', 'Sanitize'],
    answer: e.a,
    reveal: reveal,
    illustration: tile ? /*#__PURE__*/React.createElement(Tile, {
      icon: e.i,
      size: tile
    }) : null
  })));
}
function Panel({
  children,
  style
}) {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      background: 'rgba(242,248,254,.92)',
      border: '1.5px solid var(--blue-200)',
      borderRadius: 28,
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
      ...style
    }
  }, children);
}
const defs = [{
  article: '',
  term: 'Cleaning',
  text: 'removes the dirt you can see.'
}, {
  article: '',
  term: 'Sanitizing',
  text: 'kills the germs you can’t.'
}];
const shortDesc = /*#__PURE__*/React.createElement(React.Fragment, null, "Is it ", /*#__PURE__*/React.createElement("b", null, "cleaning"), " (removing dirt) or ", /*#__PURE__*/React.createElement("b", null, "sanitizing"), " (killing germs)?");
const sectionDesc = /*#__PURE__*/React.createElement(React.Fragment, null, "Look at each task. Is it ", /*#__PURE__*/React.createElement("b", null, "cleaning"), " (removing dirt) or ", /*#__PURE__*/React.createElement("b", null, "sanitizing"), " (killing germs)?");
function CTA({
  reveal
}) {
  return reveal ? /*#__PURE__*/React.createElement(CTABanner, {
    tone: "green",
    icon: "correct",
    title: "How many did you get right?",
    subtitle: "Share your score in the comments."
  }) : /*#__PURE__*/React.createElement(CTABanner, {
    title: "Comment your answers below!",
    subtitle: "Let's learn together with Vina!"
  });
}
function Backdrop() {
  return /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      inset: 0,
      background: 'var(--gradient-sky)'
    }
  }, /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: -120,
      top: -160,
      width: 620,
      height: 620,
      borderRadius: '50%',
      background: 'radial-gradient(circle,rgba(56,181,115,.10),transparent 70%)'
    }
  }), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: -200,
      top: 180,
      width: 560,
      height: 560,
      borderRadius: '50%',
      background: 'radial-gradient(circle,rgba(38,134,230,.10),transparent 70%)'
    }
  }));
}
function PostPortrait({
  reveal
}) {
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Portrait 1080x1350",
    style: {
      position: 'relative',
      width: 1080,
      height: 1350,
      overflow: 'hidden',
      fontFamily: 'var(--font-body)'
    }
  }, /*#__PURE__*/React.createElement(Backdrop, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 44,
      right: 44,
      top: 32
    }
  }, /*#__PURE__*/React.createElement(BrandHeader, {
    assetBase: A,
    right: /*#__PURE__*/React.createElement("span", null)
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 44,
      top: 122,
      width: 760
    }
  }, /*#__PURE__*/React.createElement(HeroHeadline, {
    align: "left",
    eyebrow: /*#__PURE__*/React.createElement(DayBadge, {
      day: 9
    }),
    title: reveal ? 'The answers!' : 'Clean or sanitized?',
    subtitle: reveal ? 'Clean first, then sanitize.' : 'Test your knowledge!',
    definitions: defs
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 36,
      top: 40
    }
  }, /*#__PURE__*/React.createElement(HeroCharacter, {
    character: "vina",
    height: 350,
    speech: reveal ? 'Great job, everyone!' : 'Which tasks kill germs?',
    speechSide: "top-left",
    assetBase: A
  })), /*#__PURE__*/React.createElement(Panel, {
    style: {
      position: 'absolute',
      left: 44,
      right: 44,
      top: 470,
      gap: 16,
      padding: '20px 20px 20px'
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    title: reveal ? 'Here is what each task does' : 'Which is cleaning and which is sanitizing?',
    description: shortDesc
  }), /*#__PURE__*/React.createElement(QuizGrid, {
    reveal: reveal,
    tile: 64
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 132,
      right: 132,
      top: 1118
    }
  }, /*#__PURE__*/React.createElement(CTA, {
    reveal: reveal
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0
    }
  }, /*#__PURE__*/React.createElement(BenefitFooter, null)));
}
function PostSquare({
  reveal
}) {
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Square 1080x1080",
    style: {
      position: 'relative',
      width: 1080,
      height: 1080,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(Backdrop, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 44,
      right: 44,
      top: 28
    }
  }, /*#__PURE__*/React.createElement(BrandHeader, {
    assetBase: A,
    right: /*#__PURE__*/React.createElement(DayBadge, {
      day: 9,
      size: "sm"
    })
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 44,
      top: 128,
      width: 720
    }
  }, /*#__PURE__*/React.createElement(HeroHeadline, {
    align: "left",
    title: "Clean or sanitized?",
    subtitle: "Test your knowledge!"
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      right: 52,
      top: 108
    }
  }, /*#__PURE__*/React.createElement(HeroCharacter, {
    character: "vina",
    pose: "portrait",
    height: 180,
    assetBase: A
  })), /*#__PURE__*/React.createElement(Panel, {
    style: {
      position: 'absolute',
      left: 44,
      right: 44,
      top: 330,
      padding: 20
    }
  }, /*#__PURE__*/React.createElement(QuizGrid, {
    reveal: reveal,
    tile: 0
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 132,
      right: 132,
      top: 862
    }
  }, /*#__PURE__*/React.createElement(CTA, {
    reveal: reveal
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      transform: 'scale(1)'
    }
  }, /*#__PURE__*/React.createElement(BenefitFooter, {
    follow: null
  })));
}
function PostLandscape({
  reveal
}) {
  return /*#__PURE__*/React.createElement("div", {
    "data-screen-label": "Landscape 1920x1080",
    style: {
      position: 'relative',
      width: 1920,
      height: 1080,
      overflow: 'hidden'
    }
  }, /*#__PURE__*/React.createElement(Backdrop, null), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 72,
      right: 72,
      top: 40
    }
  }, /*#__PURE__*/React.createElement(BrandHeader, {
    assetBase: A
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 72,
      top: 170,
      width: 640
    }
  }, /*#__PURE__*/React.createElement(HeroHeadline, {
    align: "left",
    eyebrow: /*#__PURE__*/React.createElement(DayBadge, {
      day: 9
    }),
    title: "Clean or sanitized?",
    subtitle: "Test your knowledge!",
    definitions: defs
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 170,
      top: 560
    }
  }, /*#__PURE__*/React.createElement(HeroCharacter, {
    character: "vina",
    height: 360,
    speech: reveal ? 'Great job!' : 'Which tasks kill germs?',
    speechSide: "right",
    assetBase: A
  })), /*#__PURE__*/React.createElement(Panel, {
    style: {
      position: 'absolute',
      left: 780,
      right: 72,
      top: 150
    }
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    align: "left",
    title: "Which is cleaning and which is sanitizing?",
    description: sectionDesc
  }), /*#__PURE__*/React.createElement(QuizGrid, {
    reveal: reveal,
    tile: 110
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 780,
      right: 72,
      top: 860
    }
  }, /*#__PURE__*/React.createElement(CTA, {
    reveal: reveal
  })), /*#__PURE__*/React.createElement("div", {
    style: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0
    }
  }, /*#__PURE__*/React.createElement(BenefitFooter, null)));
}
Object.assign(window, {
  PostPortrait,
  PostSquare,
  PostLandscape
});
})(); } catch (e) { __ds_ns.__errors.push({ path: "ui_kits/social-posts/Post.jsx", error: String((e && e.message) || e) }); }

__ds_ns.Button = __ds_scope.Button;

__ds_ns.BrandHeader = __ds_scope.BrandHeader;

__ds_ns.DayBadge = __ds_scope.DayBadge;

__ds_ns.HeroCharacter = __ds_scope.HeroCharacter;

__ds_ns.HeroHeadline = __ds_scope.HeroHeadline;

__ds_ns.LogoLockup = __ds_scope.LogoLockup;

__ds_ns.TermHighlight = __ds_scope.TermHighlight;

__ds_ns.Badge = __ds_scope.Badge;

__ds_ns.Callout = __ds_scope.Callout;

__ds_ns.EduCard = __ds_scope.EduCard;

__ds_ns.ICON_CDN = __ds_scope.ICON_CDN;

__ds_ns.Icon = __ds_scope.Icon;

__ds_ns.NumberBadge = __ds_scope.NumberBadge;

__ds_ns.ProgressIndicator = __ds_scope.ProgressIndicator;

__ds_ns.SectionHeader = __ds_scope.SectionHeader;

__ds_ns.BenefitFooter = __ds_scope.BenefitFooter;

__ds_ns.CTABanner = __ds_scope.CTABanner;

__ds_ns.DocumentIllustration = __ds_scope.DocumentIllustration;

__ds_ns.QuizCard = __ds_scope.QuizCard;

__ds_ns.RecordIllustration = __ds_scope.RecordIllustration;

})();
