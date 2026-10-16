/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── DEEP NAVY (Logo Background) ────────────────────────────
        navy: {
          50:    '#E8EEF8',
          100:   '#C6D3EE',
          200:   '#9DB5E0',
          300:   '#6D92CF',
          400:   '#4474BF',
          500:   '#1A57AF',
          600:   '#14448C',
          700:   '#0E3069',
          800:   '#091D46',
          900:   '#040E23',
          DEFAULT:'#071525',   // deepest logo navy bg
          dark:   '#040E1A',   // even darker panels
          card:   '#0C1E32',   // card surface
          border: '#142A44',   // border colour
          muted:  '#162C44',   // slightly lighter panel
          deep:   '#071525',
        },

        // ── ELECTRIC CYAN (Logo Primary Accent) ───────────────────
        cyan: {
          50:    '#E0FDFF',
          100:   '#B3FAFF',
          200:   '#7AF5FF',
          300:   '#3DEEFF',
          400:   '#00E5FF',
          DEFAULT:'#00E5FF',   // logo's primary neon cyan
          500:   '#00D4EE',
          600:   '#00AACB',
          700:   '#0080A0',
          800:   '#005572',
          900:   '#002B3D',
          glow:  'rgba(0, 229, 255, 0.20)',
        },

        // ── COBALT BLUE (Logo Secondary) ──────────────────────────
        cobalt: {
          50:    '#EEF2FF',
          100:   '#D4DDFF',
          200:   '#AABBFF',
          300:   '#7799FF',
          400:   '#4477FF',
          DEFAULT:'#1E50C8',
          600:   '#163CAA',
          700:   '#0E2888',
          800:   '#081866',
          900:   '#040C44',
        },

        // ── SILVER / CHROME (Logo Metallic) ───────────────────────
        silver: {
          50:    '#F8FAFC',
          100:   '#EEF2F7',
          200:   '#DDE4EF',
          300:   '#C8D3E4',
          DEFAULT:'#A8BCCF',   // metallic silver
          500:   '#8899BB',
          600:   '#6677AA',
          700:   '#445588',
          800:   '#223366',
        },

        // ── LEGACY ALIASES (keep old components working) ──────────
        champagne: {
          50:    '#EEF4FF',
          100:   '#C8D8F8',
          200:   '#A0BCEE',
          300:   '#7099D8',
          400:   '#4477CC',
          DEFAULT:'#1E50C8',   // remapped to cobalt
          600:   '#163CAA',
          700:   '#0E2888',
          800:   '#0A1E66',
          900:   '#060F44',
        },
        gold: {
          DEFAULT: '#00E5FF',  // remapped gold → cyan for this logo
          400:     '#3DEEFF',
          600:     '#00AACB',
          700:     '#0080A0',
        },
        charcoal: {
          DEFAULT:'#252525',
          muted:  '#52504C',
          dark:   '#1A1A1A',
          banner: '#040E1A',
        },
        ivory: {
          DEFAULT:'#E8EEF8',
          100:    '#C6D3EE',
          200:    '#9DB5E0',
        },
        warmgrey: {
          DEFAULT:'#8899BB',
          light:  '#A8BCCF',
          dark:   '#6677AA',
        },
        beige: {
          border: '#142A44',
          card:   '#0C1E32',
          soft:   '#071525',
        },
      },

      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans:  ['"DM Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      },

      boxShadow: {
        'luxury':       '0 10px 30px -10px rgba(0,229,255,0.15), 0 4px 12px -2px rgba(0,0,0,0.5)',
        'luxury-hover': '0 20px 40px -12px rgba(0,229,255,0.28), 0 8px 16px -4px rgba(0,0,0,0.6)',
        'card':         '0 2px 10px rgba(0,0,0,0.4), 0 1px 3px rgba(0,0,0,0.3)',
        'cyan-glow':    '0 0 24px rgba(0,229,255,0.45)',
        'cobalt-glow':  '0 0 24px rgba(30,80,200,0.45)',
        'silver-glow':  '0 0 16px rgba(168,188,207,0.30)',
      },
    },
  },
  plugins: [],
}
