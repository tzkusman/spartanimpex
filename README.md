# Spartan Impax — Luxury Light All-in-One IT Portfolio

A bespoke, production-ready, multi-page IT portfolio website engineered with **React 19**, **Vite**, **Tailwind CSS**, and **React Router 7**. Designed with a sophisticated **Luxury Light** aesthetic inspired by high-end editorial publications and tailored for IT architects, software engineers, and technical consultants.

---

## Visual Design System & Aesthetics

- **Background:** Warm Ivory (`#F7F3EC`)
- **Accent:** Champagne Gold (`#C6A46A`, hover `#B59357`)
- **Headings & Primary Text:** Editorial Charcoal (`#252525`)
- **Body & Secondary Copy:** Muted Warm Grey (`#7A766F` / `#8D8A83`)
- **Card Backgrounds:** Soft Crisp Ivory / White (`#FFFFFF`, `#FAFAF7`)
- **Borders:** Subtle Beige (`#EAE4D9` / `#E5DFD3`)
- **Typography:**
  - Headings: **Playfair Display** (Editorial Serif)
  - Body & UI: **DM Sans** (Clean Geometric Sans)

---

## Multi-Page Route Structure

1. `/` — **Home**: Hero section with portrait card, "Code • Create • Impact" badge, 8-card Technical Expertise grid, Featured Projects, Experience & Metrics summary, Dark Charcoal CTA banner, and Footer.
2. `/about` — **About Me**: Professional biography, experience metrics (5+ Yrs, 20+ Projects, 10+ Clients), chronological "My Journey" timeline (Education, Experience, Vision), "Why Me?" value cards, and Resume download section.
3. `/skills` — **Skills & Technologies**: Categorized into 8 domains (Frontend, Backend, Databases, DevOps & Cloud, UI/UX, Security, AI & ML, Tools). Includes live category filter tabs, real-time search, and proficiency indicators.
4. `/projects` — **Projects Portfolio**: Gallery of sample projects with category pills (Web Dev, AI, Cloud, Security, Database), live search, GitHub links, and detail links.
5. `/projects/:slug` — **Individual Project Details**: Dedicated project case study page with full overview, problem & architectural solution breakdown, key features checklist, screenshots gallery, and tech stack tags.
6. `/services` — **IT Services**: 10 distinct service cards (Web Dev, Full-Stack, Mobile-Friendly, UI/UX, API Dev, Database Design, Cloud/DevOps, Cybersecurity, IT Consulting, AI Automation) + "Need a Custom Solution?" banner.
7. `/blog` — **Journal & Blog**: Technical articles archive with category pills, live search bar, reading times, tags, and detail view.
8. `/blog/:slug` — **Individual Article View**: Editorial article reader with metadata bar, takeaways, code insights, and author bio.
9. `/contact` — **Contact Me**: Direct contact cards (Email, Phone, Location), social links, and an interactive contact form with client-side validation, error messages, and API hookup instructions.
10. `*` — **404 Not Found**: Luxury-light error page with home redirection.

---

## Single Central Configuration File

All personal information, resume links, bio, journey milestones, skills, sample projects, services, and articles are stored in one single file:

```
src/data/portfolioData.js
```

To personalize the website with your own information:
1. Open `src/data/portfolioData.js`.
2. Update `personalData` with your name, title, email, phone, location, social links, and bio.
3. Update `skillsData` with your actual technologies and experience years.
4. Update `projectsData` with your real projects, live URLs, GitHub repositories, and image screenshots.
5. Update `servicesData` and `blogArticlesData` as desired.

---

## Getting Started Locally

### Prerequisites
- Node.js (v18+ or v20+)
- npm or yarn

### 1. Installation
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Production Build
```bash
npm run build
```
Generates an optimized static bundle in the `dist/` directory.

### 4. Preview Production Build
```bash
npm run preview
```

---

## Deployment Instructions

### Deploy to Vercel
1. Push this repository to GitHub or GitLab.
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your repository.
4. Framework Preset: **Vite**.
5. Build Command: `npm run build`.
6. Output Directory: `dist`.
7. SPA routing is already preconfigured via [`vercel.json`](file:///C:/Users/asus/.gemini/antigravity-ide/scratch/spartan-impax-portfolio/vercel.json).

### Deploy to Netlify
1. Go to [netlify.com](https://netlify.com) and click **"Add new site" -> "Import an existing project"**.
2. Select your repository.
3. Build Command: `npm run build`.
4. Publish directory: `dist`.
5. SPA redirect handling is already preconfigured via [`public/_redirects`](file:///C:/Users/asus/.gemini/antigravity-ide/scratch/spartan-impax-portfolio/public/_redirects).

---

## Connecting the Contact Form to a Real Backend

The contact form in [`src/pages/ContactPage.jsx`](file:///C:/Users/asus/.gemini/antigravity-ide/scratch/spartan-impax-portfolio/src/pages/ContactPage.jsx) has complete client-side validation. To connect it to direct email delivery:

- **Option A (Formspree):**
  1. Register a free account at [Formspree.io](https://formspree.io).
  2. Create a new form to get your Form ID (e.g., `https://formspree.io/f/mqkopzye`).
  3. Change the `<form>` submission in `ContactPage.jsx` to `fetch("https://formspree.io/f/YOUR_ID", { method: "POST", body: JSON.stringify(formData), headers: { "Content-Type": "application/json" } })`.

- **Option B (EmailJS):**
  1. Install EmailJS: `npm install @emailjs/browser`.
  2. Call `emailjs.send("SERVICE_ID", "TEMPLATE_ID", formData, "PUBLIC_KEY")`.

---

## Project Structure

```
spartan-impax-portfolio/
├── public/
│   ├── _redirects               # Netlify SPA routing rules
│   └── favicon.svg              # Luxury brand icon
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── BrandIcons.jsx   # Pixel-perfect SVG brand icons
│   │   │   ├── Button.jsx       # Champagne gold & ivory buttons
│   │   │   ├── Container.jsx    # Standard max-width container
│   │   │   ├── Footer.jsx       # Luxury footer with social links
│   │   │   ├── Navbar.jsx       # Sticky glassmorphism header & mobile drawer
│   │   │   ├── PageHeader.jsx   # Editorial page title banner
│   │   │   ├── ScrollToTop.jsx  # Instant route scroll reset
│   │   │   ├── SectionHeading.jsx # Serif headings with gold subtitle tags
│   │   │   └── SocialLinks.jsx  # Social profile links
│   │   └── home/
│   │       ├── AboutPreviewSection.jsx  # Experience metrics & story
│   │       ├── CtaBanner.jsx            # Dark charcoal collaboration banner
│   │       ├── FeaturedProjectsSection.jsx # Top 4 projects showcase
│   │       ├── Hero.jsx                 # Editorial hero with portrait card
│   │       └── TechnicalExpertise.jsx   # 8-card domain expertise grid
│   ├── data/
│   │   └── portfolioData.js     # Single source of truth (central config)
│   ├── pages/
│   │   ├── AboutPage.jsx        # Biography, journey timeline, Why Me
│   │   ├── BlogDetailPage.jsx   # Individual article view
│   │   ├── BlogPage.jsx         # Articles archive with search & filters
│   │   ├── ContactPage.jsx      # Contact form with validation
│   │   ├── HomePage.jsx         # Home landing page
│   │   ├── NotFoundPage.jsx     # Custom 404 page
│   │   ├── ProjectDetailPage.jsx # Individual project case study
│   │   ├── ProjectsPage.jsx     # Project gallery with category filters
│   │   ├── ServicesPage.jsx     # 10 service cards & custom solution banner
│   │   └── SkillsPage.jsx       # Categorized skills with search & filters
│   ├── App.jsx                  # React Router routes setup
│   ├── index.css                # Tailwind directives & luxury styling tokens
│   └── main.jsx                 # Application entry point
├── index.html                   # HTML entry with Playfair & DM Sans fonts
├── package.json                 # Dependencies & scripts
├── tailwind.config.js           # Luxury light color palette & typography tokens
└── vercel.json                  # Vercel SPA rewrites configuration
```
