/**
 * Spartan Impax - Luxury Light IT Portfolio Configuration & Data Store
 * All personal details, skills, projects, services, and articles are centralized here.
 * Easily replace placeholders with real details.
 */

export const personalData = {
  name: "Spartan Impax",
  preferredName: "Spartan Impax",
  title: "Enterprise IT Solutions | Full-Stack Engineering | AI & Cloud Architecture",
  shortBio: "We architect mission-critical digital systems, Generative AI platforms, enterprise ERP portals, and high-conversion commercial applications for global industry leaders.",
  editorialHeadline: "Engineering Elegant & High-Impact Digital Experiences",
  tagline: "Code ? Create ? Impact",
  email: "gajender@spartanimpex.com",
  phone: "+91 98765 43210",
  location: "Bengaluru, India (Available Globally / Remote)",
  yearsExperience: "6+",
  projectsCompleted: "25+",
  happyClients: "15+",
  resumeUrl: "#download-resume",
  avatarUrl: "/assets/spartan-logo.jpg",
  avatarAlt: "Spartan Impex - Enterprise IT Architecture Logo",
  signature: "Gajender Singh & Team",
  leadership: [
    {
      name: "Gajender Singh Rajawat",
      role: "Chief Executive Officer (CEO) & Founder",
      email: "gajender@spartanimpex.com",
      linkedin: "https://www.linkedin.com/in/gajender-singh-rajawat-859547430/",
      bio: "Visionary technology executive leading Spartan Impax. Guiding strategic enterprise partnerships, corporate growth, and international delivery of high-yield digital solutions."
    },
    {
      name: "Usman",
      role: "Chief Information Officer (CIO) & Principal Architect",
      linkedin: "https://www.linkedin.com/in/generalusman/",
      github: "https://github.com/tzkusman/",
      bio: "Principal software architect overseeing cloud infrastructure, Oracle APEX manufacturing ERP portals, Generative AI models, and scalable full-stack web applications."
    }
  ],
  socials: {
    github: "https://github.com/tzkusman/",
    linkedin: "https://www.linkedin.com/in/gajender-singh-rajawat-859547430/",
    cioLinkedin: "https://www.linkedin.com/in/generalusman/",
    email: "mailto:gajender@spartanimpex.com",
  },
  aboutBio: [
    "Spartan Impax is an elite digital engineering firm led by CEO Gajender Singh Rajawat and CIO Usman. We specialize in transforming complex business challenges into resilient, high-speed software architectures.",
    "Our engineering portfolio spans cutting-edge Generative AI Studios (Eye Production & DenimCrafts), enterprise-scale Oracle APEX manufacturing portals, headless e-commerce storefronts (Bleach Resistant), and intelligent SaaS platforms (AI Resume Builder).",
    "Whether designing high-throughput PostgreSQL databases via Prisma ORM, implementing Razorpay payment gateways, or deploying Kubernetes cloud microservices, we combine aesthetic luxury with industrial durability."
  ],
  journey: [
    {
      period: "2018 ? 2022",
      role: "B.Tech in Computer Science & Advanced Systems",
      institution: "Premier Technological Institute",
      description: "Graduated with honors. Rigorous focus on Distributed Systems, Cloud Architecture, Relational Databases, and Cryptographic Security Protocols.",
      type: "education"
    },
    {
      period: "2022 ? Present",
      role: "Executive Technology & Engineering Leadership",
      institution: "Spartan Impax & Enterprise Partners",
      description: "Delivering production platforms for international brands including DenimCrafts, Bleach Resistant, and Denivo, handling mission-critical factory and consumer workloads.",
      type: "experience"
    },
    {
      period: "Ongoing & Future Vision",
      role: "Pioneering AI & Cloud Transformation",
      institution: "Global IT Initiatives",
      description: "Expanding automated Generative AI studio pipelines, cloud ERP architectures, and high-performance financial systems for modern global commerce.",
      type: "goals"
    }
  ],
  whyMe: [
    {
      id: "problem-solving",
      title: "Enterprise Problem Solving",
      desc: "Architecting fault-tolerant, modular architectures that eliminate business bottlenecks and scale effortlessly."
    },
    {
      id: "quick-learner",
      title: "Generative AI & Modern Stack Mastery",
      desc: "Proven track record deploying state-of-the-art AI studio models, Oracle APEX cloud databases, and React 19 microservices."
    },
    {
      id: "team-player",
      title: "C-Level Executive Leadership",
      desc: "Co-led by seasoned executives ensuring strict adherence to deadlines, budget discipline, and transparent communication."
    },
    {
      id: "clean-code",
      title: "Production-Grade Engineering",
      desc: "Strict adherence to type safety, clean code patterns, relational database constraints, and automated CI/CD deployments."
    }
  ]
};

export const technicalExpertiseCategories = [
  {
    id: "web-dev",
    title: "Web Development",
    desc: "React, Next.js, JavaScript, Tailwind, Node.js",
    iconName: "Globe",
    link: "/services"
  },
  {
    id: "mobile-dev",
    title: "Mobile App Development",
    desc: "React Native, Flutter, Cross-Platform Architecture",
    iconName: "Smartphone",
    link: "/services"
  },
  {
    id: "ai-data",
    title: "AI & Data Science",
    desc: "Python, ML Models, Data Pipelines, LLM Integrations",
    iconName: "Cpu",
    link: "/services"
  },
  {
    id: "cloud-devops",
    title: "Cloud & DevOps",
    desc: "AWS, Docker, Kubernetes, CI/CD, Terraform",
    iconName: "Cloud",
    link: "/services"
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity",
    desc: "Ethical Tracking, OAuth2, Vulnerability Audits, SSL",
    iconName: "ShieldCheck",
    link: "/services"
  },
  {
    id: "networking",
    title: "Networking",
    desc: "TCP/IP, CDN, DNS Routing, VPC Architecture",
    iconName: "Network",
    link: "/services"
  },
  {
    id: "databases",
    title: "Databases",
    desc: "MySQL, PostgreSQL, MongoDB, Redis, Schema Design",
    iconName: "Database",
    link: "/services"
  },
  {
    id: "tools",
    title: "Tools & Others",
    desc: "Git, VS Code, Linux, Postman, Figma, Agile",
    iconName: "Wrench",
    link: "/services"
  }
];

export const skillsData = [
  {
    category: "Frontend Development",
    slug: "frontend",
    skills: [
      { name: "React", level: "Expert", years: "5 yrs", icon: "Code", color: "#61DAFB" },
      { name: "Next.js", level: "Advanced", years: "4 yrs", icon: "Layers", color: "#000000" },
      { name: "JavaScript (ES6+)", level: "Expert", years: "5 yrs", icon: "FileCode", color: "#F7DF1E" },
      { name: "HTML5", level: "Expert", years: "5 yrs", icon: "Layout", color: "#E34F26" },
      { name: "CSS3", level: "Expert", years: "5 yrs", icon: "Palette", color: "#1572B6" },
      { name: "Tailwind CSS", level: "Expert", years: "4 yrs", icon: "Wind", color: "#06B6D4" }
    ]
  },
  {
    category: "Backend Development",
    slug: "backend",
    skills: [
      { name: "Node.js", level: "Expert", years: "5 yrs", icon: "Server", color: "#339933" },
      { name: "Express.js", level: "Expert", years: "4 yrs", icon: "Zap", color: "#000000" },
      { name: "Python", level: "Advanced", years: "3 yrs", icon: "Terminal", color: "#3776AB" },
      { name: "Java", level: "Intermediate", years: "3 yrs", icon: "Coffee", color: "#007396" },
      { name: "PHP", level: "Intermediate", years: "2 yrs", icon: "Code2", color: "#777BB4" },
      { name: "Laravel", level: "Intermediate", years: "2 yrs", icon: "Box", color: "#FF2D20" }
    ]
  },
  {
    category: "Databases",
    slug: "databases",
    skills: [
      { name: "MySQL", level: "Advanced", years: "4 yrs", icon: "Database", color: "#4479A1" },
      { name: "PostgreSQL", level: "Expert", years: "4 yrs", icon: "HardDrive", color: "#4169E1" },
      { name: "MongoDB", level: "Advanced", years: "4 yrs", icon: "FolderTree", color: "#47A248" },
      { name: "Firebase", level: "Advanced", years: "3 yrs", icon: "Flame", color: "#FFCA28" },
      { name: "SQLite", level: "Proficient", years: "3 yrs", icon: "Disc", color: "#003B57" },
      { name: "Redis", level: "Advanced", years: "3 yrs", icon: "Cpu", color: "#DC382D" }
    ]
  },
  {
    category: "DevOps & Cloud",
    slug: "devops-cloud",
    skills: [
      { name: "AWS", level: "Advanced", years: "4 yrs", icon: "Cloud", color: "#FF9900" },
      { name: "Docker", level: "Expert", years: "4 yrs", icon: "Boxes", color: "#2496ED" },
      { name: "Kubernetes", level: "Intermediate", years: "2 yrs", icon: "Compass", color: "#326CE5" },
      { name: "CI/CD Pipelines", level: "Advanced", years: "4 yrs", icon: "GitMerge", color: "#2088FF" },
      { name: "GitHub Actions", level: "Advanced", years: "4 yrs", icon: "Workflow", color: "#2088FF" },
      { name: "Terraform", level: "Intermediate", years: "2 yrs", icon: "Grid", color: "#844FBA" }
    ]
  },
  {
    category: "UI/UX & Design",
    slug: "ui-ux",
    skills: [
      { name: "Figma", level: "Advanced", years: "4 yrs", icon: "Figma", color: "#F24E1E" },
      { name: "Design Systems", level: "Expert", years: "4 yrs", icon: "Component", color: "#A259FF" },
      { name: "Responsive Wireframing", level: "Expert", years: "5 yrs", icon: "LayoutGrid", color: "#1ABCFE" },
      { name: "Accessibility (a11y)", level: "Advanced", years: "3 yrs", icon: "Eye", color: "#0ACF83" }
    ]
  },
  {
    category: "Cybersecurity & Networking",
    slug: "security-networking",
    skills: [
      { name: "OWASP Auditing", level: "Proficient", years: "3 yrs", icon: "Shield", color: "#D32F2F" },
      { name: "JWT & OAuth2", level: "Expert", years: "4 yrs", icon: "Key", color: "#4CAF50" },
      { name: "VPC & Subnetting", level: "Advanced", years: "3 yrs", icon: "Network", color: "#1976D2" },
      { name: "SSL / TLS Encryption", level: "Expert", years: "4 yrs", icon: "Lock", color: "#7B1FA2" }
    ]
  },
  {
    category: "AI & Machine Learning",
    slug: "ai-ml",
    skills: [
      { name: "LangChain & LLM APIs", level: "Advanced", years: "2 yrs", icon: "Brain", color: "#10A37F" },
      { name: "Prompt Engineering", level: "Expert", years: "2 yrs", icon: "Sparkles", color: "#FF6F00" },
      { name: "Vector Databases", level: "Intermediate", years: "1 yr", icon: "Binary", color: "#6A1B9A" },
      { name: "Pandas & Data Analysis", level: "Proficient", years: "2 yrs", icon: "BarChart3", color: "#150458" }
    ]
  },
  {
    category: "Tools & Platforms",
    slug: "tools",
    skills: [
      { name: "Git", level: "Expert", years: "5 yrs", icon: "GitBranch", color: "#F05032" },
      { name: "GitHub / GitLab", level: "Expert", years: "5 yrs", icon: "Github", color: "#181717" },
      { name: "VS Code", level: "Expert", years: "5 yrs", icon: "Terminal", color: "#007ACC" },
      { name: "Linux / Bash", level: "Advanced", years: "4 yrs", icon: "Monitor", color: "#FCC624" },
      { name: "Postman", level: "Expert", years: "4 yrs", icon: "Send", color: "#FF6C37" },
      { name: "Vercel & Netlify", level: "Expert", years: "4 yrs", icon: "Globe", color: "#000000" }
    ]
  }
];

export const projectsData = [
  {
    "id": "eyeproduction-denimcrafts-ai-studio",
    "slug": "eyeproduction-denimcrafts-ai-studio",
    "title": "Eye Production & DenimCrafts AI Studio",
    "category": "AI & Data",
    "shortDescription": "State-of-the-art AI studio and generative image engine tailored for denim, fashion manufacturing, and visual asset production.",
    "featured": true,
    "thumbnail": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "AI Studio",
      "Generative AI",
      "Computer Vision",
      "React",
      "Python"
    ],
    "liveUrl": "https://eyeproductiondenimcrafts.ai.studio/",
    "githubUrl": "https://github.com/tzkusman/",
    "overview": "A flagship generative AI suite engineered for the fashion and denim industry. Allows designers and manufacturers to generate high-fidelity garment renders, simulate washes, test fabric textures, and create virtual apparel models instantaneously.",
    "problem": "Traditional physical denim sample production takes 3 to 6 weeks per iteration, costing thousands of dollars in fabric and chemical washing trials.",
    "solution": "Built a customized web platform integrating cutting-edge diffusion models, prompt engineering pipelines, and real-time GPU image generation, accelerating design turnaround from weeks to seconds.",
    "keyFeatures": [
      "Custom Generative AI model pipelines optimized for textile textures and washes",
      "Instant high-resolution photo-realistic render generation",
      "Interactive studio canvas with real-time prompt adjustments and asset export",
      "Enterprise cloud infrastructure capable of processing high-volume studio workloads",
      "Seamless integration with manufacturing bill-of-materials and technical specs"
    ],
    "techStack": [
      "React 19",
      "Python",
      "Generative AI",
      "FastAPI",
      "Tailwind CSS",
      "Vite",
      "Cloud GPUs"
    ],
    "gallery": [
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    "id": "denimcrafts-enterprise-jobs-portal",
    "slug": "denimcrafts-enterprise-jobs-portal",
    "title": "DenimCrafts Enterprise Jobs & ERP Portal",
    "category": "Database",
    "shortDescription": "Industrial enterprise ERP and job scheduling portal built on Oracle APEX and cloud relational databases for garment manufacturing operations.",
    "featured": true,
    "thumbnail": "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "Oracle APEX",
      "SQL",
      "Enterprise ERP",
      "Database Architecture",
      "Workflow Automation"
    ],
    "liveUrl": "http://72.255.9.39:8086/ords/r/denimcraft/denimjobs/login",
    "githubUrl": "https://github.com/tzkusman/",
    "overview": "A mission-critical enterprise production platform managing live factory floor scheduling, job orders, worker assignments, batch tracking, and logistics auditing across manufacturing units.",
    "problem": "Decentralized spreadsheets and paper work orders caused scheduling conflicts, inventory discrepancies, and delays in batch tracking.",
    "solution": "Engineered an industrial-grade Oracle APEX portal with robust PL/SQL procedures, relational schema constraints, automated role authorization, and real-time dashboard telemetry.",
    "keyFeatures": [
      "Secure role-based authentication and operational privilege management",
      "Real-time factory production line order scheduling and status tracking",
      "Comprehensive reporting on worker allocation, machine capacity, and raw material usage",
      "Direct integration with cloud databases via Oracle REST Data Services (ORDS)",
      "High reliability with audit logging and transactional consistency"
    ],
    "techStack": [
      "Oracle APEX",
      "Oracle Database",
      "PL/SQL",
      "ORDS",
      "Enterprise Cloud Hosting",
      "JavaScript"
    ],
    "gallery": [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    "id": "bleach-resistant-store",
    "slug": "bleach-resistant-store",
    "title": "Bleach Resistant Apparel E-Commerce",
    "category": "Web Development",
    "shortDescription": "High-conversion e-commerce storefront for industrial-grade bleach resistant salon and professional apparel with custom checkout and catalog.",
    "featured": true,
    "thumbnail": "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "Next.js",
      "Shopify",
      "Tailwind CSS",
      "Stripe",
      "E-Commerce"
    ],
    "liveUrl": "https://www.bleachresistant.com",
    "githubUrl": "https://github.com/tzkusman/bleach-resistant",
    "overview": "Direct-to-consumer e-commerce brand for salon professionals. Features fluid product filtering, custom colorway swatches, dynamic cart drawers, and frictionless mobile checkout.",
    "problem": "The previous store had poor mobile responsiveness, slow image loading, and low conversion on checkout pages.",
    "solution": "Delivered a headless, blazing-fast storefront leveraging responsive Tailwind styling, image CDN pipelines, and streamlined cart actions yielding sub-second paint times.",
    "keyFeatures": [
      "High-speed responsive product catalog with instant search & filtering",
      "Automated stock notifications and size guide interactive modals",
      "Secure payments and one-click checkout integration",
      "Optimized Core Web Vitals resulting in 99+ mobile Lighthouse scores",
      "Integrated analytics and conversion pixel tracking"
    ],
    "techStack": [
      "React",
      "Next.js",
      "Tailwind CSS",
      "Shopify Storefront API",
      "Vercel"
    ],
    "gallery": [
      "https://images.unsplash.com/photo-1557821552-17105176677c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    "id": "ai-resume-builder-ats",
    "slug": "ai-resume-builder-ats",
    "title": "AI-Powered ATS Resume Builder",
    "category": "AI & Data",
    "shortDescription": "Intelligent ATS resume builder with real-time scoring, keyword optimization, multi-template PDF exports, and AI tailoring.",
    "featured": true,
    "thumbnail": "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "React",
      "TypeScript",
      "Prisma",
      "PostgreSQL",
      "AI & NLP"
    ],
    "liveUrl": "https://resume-builder-pd3c.vercel.app",
    "githubUrl": "https://github.com/tzkusman/ResumeBuilder",
    "overview": "A modern SaaS platform that analyzes job descriptions, scores candidate resumes against Applicant Tracking System (ATS) parsers, and dynamically generates optimized CVs and cover letters.",
    "problem": "Job seekers frequently get rejected by automated ATS screeners due to missing keywords and poor PDF formatting.",
    "solution": "Engineered a full-stack platform with Prisma PostgreSQL database, dynamic template renderers, keyword density scanners, and instant vector/PDF export.",
    "keyFeatures": [
      "Real-time ATS parsing score calculation and improvement recommendations",
      "Multi-template designer with professional typographic presets",
      "Cover letter AI generator matching resume content with target job descriptions",
      "Full database persistence powered by Prisma ORM and PostgreSQL",
      "Export directly to clean PDF formats"
    ],
    "techStack": [
      "React",
      "TypeScript",
      "Prisma ORM",
      "PostgreSQL",
      "Tailwind CSS",
      "Vercel"
    ],
    "gallery": [
      "https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    "id": "denivo-premium-clothing",
    "slug": "denivo-premium-clothing",
    "title": "Denivo Premium Luxury Clothing (Zarq)",
    "category": "Web Development",
    "shortDescription": "Editorial luxury streetwear and couture brand platform with fluid micro-animations, product catalogues, and responsive styling.",
    "featured": false,
    "thumbnail": "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "React",
      "Vite",
      "Tailwind CSS",
      "Luxury UI",
      "E-Commerce"
    ],
    "liveUrl": "https://zarq-lovat.vercel.app",
    "githubUrl": "https://github.com/tzkusman/denivo-premium-clothing",
    "overview": "An immersive digital showcase designed for Denivo couture. Emphasizes visual storytelling, high-resolution lookbooks, and luxury minimalism with dark aesthetics.",
    "problem": "Standard e-commerce templates failed to capture the haute-couture identity and tactile luxury of the brand.",
    "solution": "Designed and implemented bespoke React components with smooth hover interactions, lookbook carousels, and responsive layouts.",
    "keyFeatures": [
      "Editorial editorial typography and curated dark mode palettes",
      "Interactive collection lookbooks with high-resolution imagery",
      "Ultra-fluid transitions and responsive drawer navigation",
      "Optimized client-side routing with zero layout shift"
    ],
    "techStack": [
      "React 19",
      "Vite",
      "Tailwind CSS",
      "Lucide React",
      "Vercel"
    ],
    "gallery": [
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    "id": "aa-linkers-inventory-portal",
    "slug": "aa-linkers-inventory-portal",
    "title": "AA-Linkers B2B Supply & Inventory Portal",
    "category": "Cloud & DevOps",
    "shortDescription": "B2B dynamic inventory tracking, wholesale supplier orders, and supply chain telemetry management dashboard.",
    "featured": false,
    "thumbnail": "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "React",
      "Node.js",
      "Express",
      "Inventory",
      "B2B Dashboard"
    ],
    "liveUrl": "https://aa-linkers.vercel.app",
    "githubUrl": "https://github.com/tzkusman/AA-LINKERS",
    "overview": "A comprehensive B2B portal for industrial hardware and parts distribution. Enables wholesalers to view stock levels, request quotations, track dispatches, and manage accounts.",
    "problem": "Manual email order processing led to inventory miscounts and slow quote turnarounds.",
    "solution": "Delivered a centralized dashboard connecting suppliers and commercial clients with real-time stock status and automated quote calculations.",
    "keyFeatures": [
      "Dynamic catalog with multi-tier bulk pricing calculations",
      "Automated PDF quote generator and dispatch tracking",
      "Client account portal with order history and billing statements",
      "Fast API backend with cached database queries"
    ],
    "techStack": [
      "React",
      "Node.js",
      "Express",
      "Tailwind CSS",
      "Vercel"
    ],
    "gallery": [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80"
    ]
  },
  {
    "id": "fitness-analytics-platform",
    "slug": "fitness-analytics-platform",
    "title": "Fitness & Workout Tracker Platform",
    "category": "Web Development",
    "shortDescription": "Interactive health & fitness tracking web app with exercise routines, progress visualizations, and calorie analytics.",
    "featured": false,
    "thumbnail": "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80",
    "tags": [
      "React",
      "Charts.js",
      "Tailwind CSS",
      "Health Tech",
      "Mobile-Friendly"
    ],
    "liveUrl": "https://fitness-ruby-rho.vercel.app",
    "githubUrl": "https://github.com/tzkusman/",
    "overview": "A modern health application designed for athlete tracking, daily calorie logging, workout scheduling, and visual progress charts.",
    "problem": "Users needed a lightweight, clutter-free alternative to bloated fitness apps that load quickly on mobile browsers.",
    "solution": "Crafted a mobile-first responsive PWA with offline caching, local data synchronization, and sleek visual analytics.",
    "keyFeatures": [
      "Interactive progress graphs tracking weight, reps, and calories",
      "Customizable workout split generator and timer",
      "Responsive mobile layout designed for gym floor use",
      "Zero telemetry tracking ensuring user privacy"
    ],
    "techStack": [
      "React",
      "Tailwind CSS",
      "Vite",
      "Charts.js",
      "Vercel"
    ],
    "gallery": [
      "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=1200&q=80"
    ]
  }
];

export const servicesData = [
  {
    id: "web-development",
    title: "Web Development",
    shortDesc: "Modern, responsive, and blazing-fast web applications built with React, Vite, and cutting-edge frontend tooling.",
    features: ["Single Page Applications (SPA)", "Progressive Web Apps (PWA)", "API Integrations", "Speed & Core Web Vitals optimization"],
    icon: "Globe"
  },
  {
    id: "full-stack-apps",
    title: "Full-Stack Applications",
    shortDesc: "End-to-end software development uniting elegant client interfaces with bulletproof server architectures.",
    features: ["Node.js & Python backends", "RESTful & GraphQL APIs", "Microservices architecture", "Authentication & Role Security"],
    icon: "Layers"
  },
  {
    id: "mobile-friendly",
    title: "Mobile-Friendly Websites",
    shortDesc: "Flawless responsiveness across smartphones, tablets, laptops, and ultra-wide displays with fluid typography.",
    features: ["Mobile-first design", "Touch gesture optimization", "Cross-browser consistency", "Adaptive image delivery"],
    icon: "Smartphone"
  },
  {
    id: "ui-ux-design",
    title: "UI/UX Design",
    shortDesc: "User-centered design systems, high-fidelity prototypes in Figma, and editorial digital interfaces.",
    features: ["Wireframing & Prototyping", "Design tokens & Component kits", "Accessibility compliance (WCAG)", "Interaction micro-animations"],
    icon: "Palette"
  },
  {
    id: "api-development",
    title: "API Development & Integration",
    shortDesc: "Robust, documented, and secure APIs engineered for high concurrency, low latency, and third-party consumers.",
    features: ["Swagger/OpenAPI documentation", "Rate limiting & Throttling", "Webhook systems", "Payment & CRM integrations"],
    icon: "Code"
  },
  {
    id: "database-design",
    title: "Database Design & Optimization",
    shortDesc: "Scalable relational and NoSQL database schemas built for rapid queries, data integrity, and easy backups.",
    features: ["PostgreSQL & MySQL schemas", "MongoDB collection modeling", "Indexing & Query profiling", "Redis caching layers"],
    icon: "Database"
  },
  {
    id: "cloud-devops",
    title: "Cloud & DevOps",
    shortDesc: "Scalable cloud infrastructure on AWS, automated CI/CD deployment pipelines, and Docker containerization.",
    features: ["AWS infrastructure setup", "Docker containerization", "Kubernetes cluster management", "Automated GitHub Actions CI/CD"],
    icon: "Cloud"
  },
  {
    id: "cybersecurity",
    title: "Cybersecurity & Hardening",
    shortDesc: "Vulnerability assessments, secure coding audits, OWASP top 10 prevention, and hardened auth mechanisms.",
    features: ["OAuth2 & JWT implementations", "Security header configurations", "Input sanitization & XSS/CSRF defense", "Data encryption in transit & rest"],
    icon: "ShieldCheck"
  },
  {
    id: "it-consulting",
    title: "IT Consulting & Architecture",
    shortDesc: "Strategic guidance on tech stack selection, system modernization, and technical feasibility.",
    features: ["Architecture reviews", "Legacy code refactoring roadmaps", "Cloud migration planning", "Team mentoring & Best practices"],
    icon: "Compass"
  },
  {
    id: "automation-ai",
    title: "Automation & AI Integrations",
    shortDesc: "Harness modern LLMs, vector search, and robotic process automations to eliminate manual business overhead.",
    features: ["Custom ChatGPT / Claude bots", "Retrieval Augmented Generation (RAG)", "Automated background workers", "Data extraction scripts"],
    icon: "Bot"
  }
];

export const blogArticlesData = [
  {
    id: "getting-started-with-nextjs-14",
    slug: "getting-started-with-nextjs-14",
    title: "Architecting Modern React Applications with Vite & Next.js",
    category: "Development",
    date: "Oct 10, 2026",
    readTime: "6 min read",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    excerpt: "A deep dive into component design patterns, state management strategies, and achieving sub-second paint times on modern web stacks.",
    content: [
      "In modern web development, speed and maintainability aren't luxuries—they are core requirements. As frontend systems scale, choosing the right combination of modular architecture and build tooling dictates the longevity of your codebase.",
      "Vite has fundamentally transformed local development with native ES modules (ESM), providing instantaneous Hot Module Replacement (HMR). Pairing Vite with React 19 provides unprecedented developer ergonomics.",
      "Key Architectural Best Practices:",
      "1. Keep components single-purpose and isolated.",
      "2. Centralize configuration tokens and content models to prevent deep-tree prop-drilling.",
      "3. Respect accessibility and keyboard navigation from day zero.",
      "By adhering to these principles, your applications remain robust as teams and requirements grow."
    ],
    tags: ["React", "Vite", "Architecture", "JavaScript"]
  },
  {
    id: "deploying-a-mern-app",
    slug: "deploying-a-mern-app",
    title: "Deploying a Production MERN Stack with Zero Downtime",
    category: "Cloud",
    date: "Sep 28, 2026",
    readTime: "8 min read",
    thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80",
    excerpt: "Step-by-step roadmap for containerizing Node.js and MongoDB applications, setting up reverse proxies, and continuous deployments.",
    content: [
      "Deploying to production requires more than pushing code to a server. Ensuring high availability, SSL renewal, automated backups, and rolling deployments prevents costly business downtime.",
      "In this guide, we explore how to package a Node.js microservice into a multi-stage Docker container, minimizing final image size while excluding unnecessary build dependencies.",
      "We configure Nginx as a reverse proxy, set up rate limiting, and wire GitHub Actions to trigger automated smoke tests before promoting images to our cluster."
    ],
    tags: ["MERN", "Docker", "DevOps", "AWS"]
  },
  {
    id: "introduction-to-docker",
    slug: "introduction-to-docker",
    title: "Containerization for Developers: A Practical Docker Guide",
    category: "DevOps",
    date: "Sep 15, 2026",
    readTime: "5 min read",
    thumbnail: "https://images.unsplash.com/photo-1605745341112-85968b19335b?auto=format&fit=crop&w=800&q=80",
    excerpt: "Demystifying containers, Dockerfiles, docker-compose networks, and production volume persistency for software engineers.",
    content: [
      "'It works on my machine' is a phrase that has haunted engineering teams for decades. Docker completely eliminates this parity issue by bundling application code with its exact runtime environment.",
      "Understanding the difference between images and containers is fundamental. Images are read-only blueprints, while containers are the isolated, runnable instances created from those blueprints.",
      "By utilizing docker-compose for multi-service local testing, developers can spin up databases, caches, and API workers with a single command."
    ],
    tags: ["Docker", "Containers", "DevOps", "Linux"]
  },
  {
    id: "machine-learning-basics",
    slug: "machine-learning-basics",
    title: "Pragmatic Machine Learning: Embedding AI into Web Apps",
    category: "AI & Data",
    date: "Aug 30, 2026",
    readTime: "7 min read",
    thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    excerpt: "How web developers can integrate LLMs, function calling, and vector search to create genuinely useful generative features.",
    content: [
      "Artificial Intelligence is no longer confined to academic research labs. Today's web engineers can integrate sophisticated cognitive capabilities directly into everyday web applications.",
      "Vector embeddings represent text as high-dimensional numerical coordinates. Similar concepts cluster together, enabling semantic search that transcends simple keyword matching.",
      "We review practical patterns for streaming responses, error boundaries around model rate limits, and caching common completions to optimize latency and costs."
    ],
    tags: ["AI", "LLM", "Python", "Vector DB"]
  },
  {
    id: "cybersecurity-best-practices",
    slug: "cybersecurity-best-practices",
    title: "Essential Web App Security: OWASP Top 10 Defenses",
    category: "Security",
    date: "Aug 12, 2026",
    readTime: "9 min read",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    excerpt: "Essential defenses against SQL injection, Cross-Site Scripting (XSS), broken authentication, and insecure direct object references.",
    content: [
      "Security is not a feature you bolt on right before launching; it is an ongoing mindset integrated into every pull request.",
      "We examine how Content Security Policy (CSP) headers mitigate XSS risks, why strict cookie flags (HttpOnly, SameSite, Secure) protect session keys, and how prepared statements eliminate injection attacks.",
      "A checklist is provided to run security audits on your staging servers before every major release."
    ],
    tags: ["Security", "OWASP", "Authentication", "Best Practices"]
  },
  {
    id: "building-a-portfolio-website",
    slug: "building-a-portfolio-website",
    title: "Crafting the Spartan Impex Digital Flagship: Design System Architecture",
    category: "Development",
    date: "Jul 24, 2026",
    readTime: "6 min read",
    thumbnail: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
    excerpt: "The engineering thinking behind deep navy palettes, electric cyan neon glows, cobalt depth accents, and responsive component modularity.",
    content: [
      "Why do so many digital brand identities fall flat? Off-the-shelf templates fail to capture the power, security, and precision demanded by top-tier modern enterprises.",
      "By adopting a high-contrast cyber palette—grounded in deep navy (#071525), electric cyan (#00E5FF), cobalt blue (#1E50C8), and chrome silver (#A8BCCF)—we forge an atmosphere of technical supremacy and credibility.",
      "In this article, we break down how token-based design systems with Tailwind CSS allow rapid style iterations without ballooning CSS bundle sizes."
    ],
    tags: ["Design System", "CSS", "UI/UX", "Portfolio"]
  }
];


export const pricingPlansData = [
  {
    "id": "starter-architecture",
    "slug": "starter-architecture",
    "name": "Starter Architecture",
    "price": 14999,
    "originalPrice": 24999,
    "badge": "Quick Launch",
    "description": "Ideal for startups and businesses needing a high-speed, modern website or technical architecture audit.",
    "features": [
      "Full Codebase & Architecture Security Review",
      "1 Production-Ready Web Page or Core Feature",
      "Lighthouse 95+ Core Web Vitals Optimization",
      "Responsive Mobile & Desktop Design System",
      "7 Days Direct Slack / WhatsApp Developer Support"
    ],
    "deliverables": [
      "Full Source Code",
      "Deployment on Vercel",
      "Performance Audit Report"
    ],
    "popular": false,
    "active": true,
    "sortOrder": 1
  },
  {
    "id": "business-fullstack",
    "slug": "business-fullstack",
    "name": "Business Full-Stack Platform",
    "price": 49999,
    "originalPrice": 69999,
    "badge": "Most Popular",
    "description": "Complete full-stack web application with Prisma database backend, custom admin panel, and payment gateway.",
    "features": [
      "Complete React 19 Frontend + Tailwind UI Theme",
      "Express.js & Prisma PostgreSQL Database Backend",
      "Secure Admin Control Panel with CRUD Access",
      "Razorpay / Stripe Payment Gateway Integration",
      "Automated CI/CD Pipeline & Vercel Production Deploy",
      "30 Days Free Maintenance & SLA Guarantee"
    ],
    "deliverables": [
      "Full-Stack Repository",
      "Prisma Database Setup",
      "Admin Dashboard Access",
      "API Documentation"
    ],
    "popular": true,
    "active": true,
    "sortOrder": 2
  },
  {
    "id": "enterprise-custom",
    "slug": "enterprise-custom",
    "name": "Enterprise Custom Solution",
    "price": 129999,
    "originalPrice": 179999,
    "badge": "Enterprise Grade",
    "description": "Tailored enterprise ERP, Oracle APEX cloud database, custom AI studio pipelines, and dedicated engineering leadership.",
    "features": [
      "Custom Enterprise ERP / Cloud Database Architecture",
      "Bespoke Generative AI Studio & Workflow Pipelines",
      "High-Concurrency Microservices with 99.9% Uptime SLA",
      "Custom API Integrations & Webhook Ingestion Engine",
      "Enterprise Security Hardening & Penetration Testing",
      "Dedicated 24/7 Priority Support & Onboarding"
    ],
    "deliverables": [
      "Enterprise System Architecture",
      "Dedicated Team Allocation",
      "Custom AI Model Fine-tuning",
      "Full SLA Contract"
    ],
    "popular": false,
    "active": true,
    "sortOrder": 3
  }
];
