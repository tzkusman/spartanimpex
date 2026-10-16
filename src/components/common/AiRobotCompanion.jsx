import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  MessageSquare, 
  X, 
  Volume2, 
  VolumeX, 
  Compass, 
  Layers, 
  Footprints,
  Languages,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Target,
  Pause,
  Play
} from 'lucide-react';
import robotImg from '../../assets/ai-robot.png';

export default function AiRobotCompanion() {
  const navigate = useNavigate();
  const robotRef = useRef(null);

  // Position & Movement states
  const [position, setPosition] = useState({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 180 : 800, 
    y: typeof window !== 'undefined' ? window.innerHeight - 240 : 600 
  });
  const [targetPos, setTargetPos] = useState(null);
  const [isWalking, setIsWalking] = useState(false);
  const [walkingDirection, setWalkingDirection] = useState('right'); // 'left' | 'right'
  const [lookAngle, setLookAngle] = useState({ rotateX: 0, rotateY: 0 });

  // Mode States (Follow is ON by default as requested!)
  const [followCursor, setFollowCursor] = useState(true);
  const [modeNotification, setModeNotification] = useState(null); // 'FOLLOW_ON' | 'FOLLOW_OFF'

  // Click Target Beacon
  const [beacon, setBeacon] = useState(null); // { x, y, label }

  // Expressions: 'happy', 'talking', 'walking', 'curious', 'excited', 'love', 'sleeping'
  const [expression, setExpression] = useState('happy');

  // Explanation Dialog Data
  const [speechTitle, setSpeechTitle] = useState("Sparky • Spartan AI Mascot");
  const [speechEn, setSpeechEn] = useState("👋 Hi! I am actively following your cursor! Click anywhere on the website to make me explain it. Double-tap me to pause follow!");
  const [speechHi, setSpeechHi] = useState("👋 नमस्ते! मैं आपके कर्सर के साथ चल रहा हूँ! किसी भी जगह क्लिक करें और मैं समझाऊंगा। मुझे रोकने के लिए मुझ पर डबल-टैप करें!");
  const [currentLang, setCurrentLang] = useState('en'); // 'en' | 'hi'
  const [dialogOpen, setDialogOpen] = useState(true);
  const [voiceEnabled, setVoiceEnabled] = useState(false);

  const mousePos = useRef({ 
    x: typeof window !== 'undefined' ? window.innerWidth - 250 : 600, 
    y: typeof window !== 'undefined' ? window.innerHeight - 300 : 500 
  });
  const lastTapRef = useRef(0);
  const idleTimer = useRef(null);
  const animationFrameRef = useRef(null);

  // Text-To-Speech helper
  const speakCurrent = (text) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text.replace(/[*#_~]/g, ''));
      utterance.pitch = 1.25;
      utterance.rate = 1.05;
      if (currentLang === 'hi') {
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'en-US';
      }
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.log('Speech synthesis error:', e);
    }
  };

  // 1. DOUBLE-TAP / DOUBLE-CLICK TOGGLE: Turn Follow ON / OFF
  const toggleFollowMode = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }

    setFollowCursor((prev) => {
      const nextState = !prev;

      if (nextState) {
        // RESUMED FOLLOW
        setModeNotification('FOLLOW_ON');
        setSpeechTitle("🚀 Follow Mode: Active");
        setSpeechEn("Follow mode resumed! Move your mouse and I'll walk with you. Double-tap me anytime to pause.");
        setSpeechHi("फॉलो मोड चालू! माउस घुमाइए, मैं आपके साथ चलूंगा। कभी भी डबल-टैप करके मुझे रोक सकते हैं।");
        setExpression('excited');
        setIsWalking(true);
        speakCurrent(currentLang === 'hi' ? "फॉलो मोड चालू हो गया है।" : "Follow mode activated!");
      } else {
        // PAUSED FOLLOW
        setModeNotification('FOLLOW_OFF');
        setSpeechTitle("⏸️ Standby Mode (Resting)");
        setSpeechEn("Follow mode paused! I will stay right here. Double-tap me to wake me up!");
        setSpeechHi("फॉलो मोड बंद! मैं यहीं रुक रहा हूँ। मुझे दोबारा चलाने के लिए मुझ पर डबल-टैप करें!");
        setExpression('sleeping');
        setIsWalking(false);
        setTargetPos(null);
        speakCurrent(currentLang === 'hi' ? "फॉलो मोड बंद कर दिया गया है।" : "Follow mode paused. Double-tap to wake me.");
      }

      setDialogOpen(true);
      setTimeout(() => setModeNotification(null), 3500);
      return nextState;
    });
  };

  // Universal Double-Tap (Touchpad, Mobile, and Mouse single/double click handler)
  const handleRobotTap = (e) => {
    e.stopPropagation();
    const now = Date.now();
    const timeDiff = now - lastTapRef.current;

    if (timeDiff < 380) {
      // DOUBLE TAP DETECTED!
      lastTapRef.current = 0;
      toggleFollowMode(e);
      return;
    }

    lastTapRef.current = now;

    // Single Click: Cycle cute expressions and show bubble
    setTimeout(() => {
      if (lastTapRef.current === now) {
        cycleExpression();
      }
    }, 280);
  };

  // 2. GLOBAL CLICK EXPLAINER (Clicking any section on the page)
  useEffect(() => {
    const handleGlobalClick = (e) => {
      // Don't intercept clicks inside the robot's own avatar or speech bubble
      if (robotRef.current && robotRef.current.contains(e.target)) return;

      const target = e.target;
      let title = "Website Element";
      let enText = "You clicked here! Let me explain this part of Spartan Impax:";
      let hiText = "आपने यहाँ क्लिक किया! Spartan Impax के इस हिस्से की जानकारी:";

      // Contextual Intelligence on clicked element
      if (target.closest('header, nav, .site-navbar')) {
        title = "🧭 Navigation Header";
        enText = "This is the luxury navigation bar. It provides instant access to Home, About Me, Skills, Projects, Services, and Contact.";
        hiText = "यह लक्ज़री नेविगेशन बार है। इससे आप होम, अबाउट, स्किल्स, प्रोजेक्ट्स, सर्विसेज और कॉन्टैक्ट पर तुरंत जा सकते हैं।";
      } else if (target.closest('.exploded-logo-card, [alt*="Exploded"]')) {
        title = "🔍 3D Exploded Logo";
        enText = "This is Spartan Impex's official 3D Isometric Exploded Logo! Notice the layered circuit board (PCB) and precision aluminum core.";
        hiText = "यह स्पार्टन इम्पैक्स का 3D एक्सप्लोडेड लोगो है! इसमें स्तरित सर्किट बोर्ड (PCB) और एल्युमिनियम कोर साफ दिखाई देता है।";
      } else if (target.closest('h1, .hero-section')) {
        title = "✨ Hero Introduction";
        enText = "Welcome to the Hero section! Spartan Impax showcases full-stack web engineering, resilient cloud systems, and editorial UI/UX design.";
        hiText = "हीरो सेक्शन में आपका स्वागत है! स्पार्टन इम्पैक्स फुल-स्टैक वेब, क्लाउड सिस्टम और प्रीमियम UI/UX डिजाइन पेश करता है।";
      } else if (target.closest('[href*="resume"], button:has-text("CV"), [data-action="cv"]')) {
        title = "📄 Curriculum Vitae";
        enText = "This button downloads Spartan Impax's official verified PDF resume detailing technical qualifications and credentials.";
        hiText = "यह बटन स्पार्टन इम्पैक्स का आधिकारिक वेरिफाइड रेज़्यूमे (CV) डाउनलोड करता है जिसमें सभी तकनीकी योग्यताएं दर्ज हैं।";
      } else if (target.closest('article, .project-card, [to^="/projects"]')) {
        title = "🚀 Project Showcase";
        enText = "A live production case study! Built with modern technologies like React, Node.js, and MongoDB with high-speed performance.";
        hiText = "यह एक लाइव प्रोजेक्ट केस स्टडी है! इसे रिएक्ट, नोड.जेएस और मोंगोडीबी जैसी आधुनिक तकनीकों से तैयार किया गया है।";
      } else if (target.closest('.expertise-card, [to="/services"]')) {
        title = "⚡ Core Capabilities";
        enText = "Highlights enterprise IT services—from custom full-stack web applications to automated Docker/Kubernetes cloud DevOps.";
        hiText = "यह हमारी आईटी सेवाओं को दर्शाता है—फुल-स्टैक वेब डेवलपमेंट से लेकर ऑटोमेटेड डॉकर/कुबेरनेट्स क्लाउड डेवऑप्स तक।";
      } else if (target.closest('form, input, textarea')) {
        title = "📩 Contact Inquiry Form";
        enText = "Direct client inquiry form with instant validation! Enter your project details to send a message directly to Spartan Impax.";
        hiText = "डायरेक्ट इंक्वायरी फॉर्म! अपने प्रोजेक्ट की जानकारी भरें और सीधे स्पार्टन इम्पैक्स से संपर्क करें।";
      } else if (target.closest('.skills-card, [role="tab"], button:has-text("Frontend"), button:has-text("Backend")')) {
        title = "🛠️ Tech Stack Matrix";
        enText = "Production-grade tools and technologies. You can filter by Frontend, Backend, Cloud, Databases, and UI Architecture!";
        hiText = "यह टेक्नोलॉजी स्टैक है। आप फ्रंटेंड, बैकएंड, क्लाउड और डेटाबेस के अनुसार फिल्टर करके देख सकते हैं!";
      } else if (target.closest('footer')) {
        title = "🏛️ Website Footer";
        enText = "The footer contains copyright verification, quick navigational shortcuts, and social links to connect with Spartan Impax.";
        hiText = "यह वेबसाइट का फुटर है। यहाँ कॉपीराइट, त्वरित लिंक्स और सोशल मीडिया कनेक्ट्स उपलब्ध हैं।";
      } else {
        const text = target.innerText?.trim();
        if (text && text.length > 2 && text.length < 80) {
          title = `💡 ${text.slice(0, 24)}...`;
          enText = `You clicked "${text}". This is an interactive component of the Spartan Impax portfolio designed with luxury light aesthetics.`;
          hiText = `आपने "${text}" चुना है। यह स्पार्टन इम्पैक्स पोर्टफोलियो का एक इंटरैक्टिव हिस्सा है।`;
        } else {
          title = "📍 Clicked Location";
          enText = "I walked right over to where you clicked! You can click any project, skill tab, or button to see what it does.";
          hiText = "मैं आपके क्लिक किए हुए स्थान पर आ गया हूँ! किसी भी प्रोजेक्ट, स्किल या बटन पर क्लिक करके उसकी जानकारी पाएं।";
        }
      }

      // 1. Show click beacon ripple at exact click coordinates
      setBeacon({ x: e.clientX, y: e.clientY, label: title });
      setTimeout(() => setBeacon(null), 2500);

      // 2. Set walk target to clicked spot
      const targetX = Math.max(20, Math.min(window.innerWidth - 180, e.clientX + (e.clientX > window.innerWidth / 2 ? -180 : 50)));
      const targetY = Math.max(30, Math.min(window.innerHeight - 250, e.clientY - 60));

      setWalkingDirection(targetX > position.x ? 'right' : 'left');
      setTargetPos({ x: targetX, y: targetY });
      setIsWalking(true);
      setExpression('walking');

      setSpeechTitle(title);
      setSpeechEn(enText);
      setSpeechHi(hiText);
      setDialogOpen(true);

      const toSpeak = currentLang === 'hi' ? hiText : enText;
      speakCurrent(toSpeak);
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, [position, voiceEnabled, currentLang]);

  // 3. REAL ROBOT WALKING & CURSOR COMPANION LOOP
  useEffect(() => {
    const updatePosition = () => {
      if (targetPos) {
        // Priority 1: Walking to a clicked element on the webpage
        setPosition((prev) => {
          const dx = targetPos.x - prev.x;
          const dy = targetPos.y - prev.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Reached clicked target
          if (dist < 10) {
            setIsWalking(false);
            setTargetPos(null);
            setExpression('talking');
            setTimeout(() => {
              setExpression('happy');
            }, 4500);
            return targetPos;
          }

          // Dynamic walk speed towards target
          const speed = Math.min(Math.max(dist * 0.12, 3), 16);
          const angle = Math.atan2(dy, dx);
          setWalkingDirection(dx > 0 ? 'right' : 'left');
          setIsWalking(true);

          return {
            x: prev.x + Math.cos(angle) * speed,
            y: prev.y + Math.sin(angle) * speed,
          };
        });
      } else if (followCursor) {
        // Priority 2: Real Robot Cursor Follow Mode
        setPosition((prev) => {
          // Keep a friendly companion offset so robot walks beside/behind cursor
          const offsetDirection = mousePos.current.x > prev.x ? -95 : 45;
          const targetX = Math.max(20, Math.min(window.innerWidth - 180, mousePos.current.x + offsetDirection));
          const targetY = Math.max(30, Math.min(window.innerHeight - 240, mousePos.current.y - 75));

          const dx = targetX - prev.x;
          const dy = targetY - prev.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          // Walking threshold
          if (dist > 35) {
            setIsWalking(true);
            setWalkingDirection(dx > 0 ? 'right' : 'left');
            if (expression !== 'talking' && expression !== 'love') {
              setExpression('walking');
            }

            // Variable physical walking speed with acceleration
            const speed = Math.min(Math.max(dist * 0.09, 3.2), 17);
            const angle = Math.atan2(dy, dx);

            return {
              x: prev.x + Math.cos(angle) * speed,
              y: prev.y + Math.sin(angle) * speed,
            };
          } else {
            // Near cursor: Stop walking and idle peacefully
            if (isWalking) {
              setIsWalking(false);
              if (expression === 'walking') {
                setExpression('happy');
              }
            }
            return prev;
          }
        });
      }

      animationFrameRef.current = requestAnimationFrame(updatePosition);
    };

    animationFrameRef.current = requestAnimationFrame(updatePosition);
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [targetPos, followCursor, isWalking, expression]);

  // 4. CURSOR TRACKING (3D Look-At Head Tilt)
  useEffect(() => {
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };

      if (robotRef.current) {
        const rect = robotRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 3;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;

        const rotateY = Math.max(-25, Math.min(25, (dx / window.innerWidth) * 45));
        const rotateX = Math.max(-20, Math.min(20, -(dy / window.innerHeight) * 35));
        setLookAngle({ rotateX, rotateY });
      }

      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => {
        if (!isWalking && !followCursor) {
          setExpression('sleeping');
        }
      }, 25000);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(idleTimer.current);
    };
  }, [isWalking, followCursor]);

  // Cycle expression on single click
  const cycleExpression = () => {
    const exprList = ['happy', 'excited', 'love', 'talking', 'curious'];
    const nextIdx = (exprList.indexOf(expression) + 1) % exprList.length;
    const nextExpr = exprList[nextIdx];
    setExpression(nextExpr);
    setDialogOpen(true);

    if (nextExpr === 'excited') {
      setSpeechEn("✨ I'm super excited! Let's explore Spartan Impax's latest IT solutions!");
      setSpeechHi("✨ मैं बहुत उत्साहित हूँ! चलिए स्पार्टन इम्पैक्स के नए प्रोजेक्ट्स देखें!");
    } else if (nextExpr === 'love') {
      setSpeechEn("💖 Thanks for visiting Spartan Impax! We craft software with passion!");
      setSpeechHi("💖 यहाँ आने के लिए धन्यवाद! हम दिल से बेहतरीन सॉफ्टवेयर बनाते हैं!");
    } else if (nextExpr === 'curious') {
      setSpeechEn("🤔 Wondering about custom web design or cloud architecture? Ask away!");
      setSpeechHi("🤔 क्या आप कस्टम वेबसाइट या क्लाउड सॉल्यूशंस के बारे में जानना चाहते हैं?");
    }
  };

  return (
    <>
      {/* 1. CLICK RADAR TARGET BEACON (Shown right where user clicks) */}
      {beacon && (
        <div
          className="fixed pointer-events-none z-[8999]"
          style={{ left: beacon.x, top: beacon.y }}
        >
          <div className="relative flex items-center justify-center">
            {/* Pulsing radar rings */}
            <span className="absolute w-12 h-12 rounded-full border-2 border-cyan-400 animate-[beaconPing_1.4s_ease-out_infinite]" />
            <span className="absolute w-6 h-6 rounded-full bg-cyan-400/40 animate-ping" />
            <span className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_12px_#00F0FF] z-10" />
            <span className="absolute -top-7 left-4 whitespace-nowrap text-[11px] font-mono px-2 py-0.5 rounded bg-charcoal/90 text-cyan-300 shadow-md">
              📍 {beacon.label}
            </span>
          </div>
        </div>
      )}

      {/* 2. MAIN ROBOT CONTAINER */}
      <aside
        ref={robotRef}
        data-cursor="robot"
        aria-label="Interactive AI Robot Companion"
        className="fixed z-[9000] pointer-events-auto select-none"
        style={{
          transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
          willChange: 'transform',
        }}
      >
        {/* Context Explanation Speech Bubble */}
        {dialogOpen && (
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 sm:left-auto sm:right-0 mb-4 w-76 sm:w-88 bg-white/98 backdrop-blur-md p-4 rounded-3xl border-2 border-champagne-300 shadow-luxury animate-fadeIn z-20">
            <header className="flex items-center justify-between pb-2 mb-2 border-b border-beige-border">
              <div className="flex items-center gap-2">
                <span className={`w-2.5 h-2.5 rounded-full ${followCursor ? 'bg-emerald-400 animate-pulse shadow-[0_0_8px_#10B981]' : 'bg-amber-400'}`} />
                <span className="font-serif font-bold text-xs text-charcoal">{speechTitle}</span>
              </div>
              <div className="flex items-center gap-1">
                {/* Language switch */}
                <button
                  type="button"
                  onClick={() => {
                    const nextLang = currentLang === 'en' ? 'hi' : 'en';
                    setCurrentLang(nextLang);
                    speakCurrent(nextLang === 'hi' ? speechHi : speechEn);
                  }}
                  className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-beige-light hover:bg-champagne-100 text-charcoal border border-beige-border transition-colors flex items-center gap-1"
                  title="Switch Language (English / हिंदी)"
                >
                  <Languages size={10} />
                  <span>{currentLang === 'en' ? 'हिन्दी' : 'EN'}</span>
                </button>

                {/* Voice speech toggle */}
                <button
                  type="button"
                  onClick={() => {
                    const newVoice = !voiceEnabled;
                    setVoiceEnabled(newVoice);
                    if (newVoice) speakCurrent(currentLang === 'hi' ? speechHi : speechEn);
                  }}
                  className={`p-1.5 rounded-full transition-colors ${
                    voiceEnabled ? 'text-cyan-600 bg-cyan-50' : 'text-warmgrey hover:text-charcoal'
                  }`}
                  title={voiceEnabled ? 'Mute voice' : 'Enable voice narration'}
                >
                  {voiceEnabled ? <Volume2 size={13} /> : <VolumeX size={13} />}
                </button>

                {/* Close bubble */}
                <button
                  type="button"
                  onClick={() => setDialogOpen(false)}
                  className="p-1 rounded-full text-warmgrey hover:text-charcoal hover:bg-ivory transition-colors"
                  title="Close explanation"
                >
                  <X size={13} />
                </button>
              </div>
            </header>

            {/* Explanation Body */}
            <p className="text-xs sm:text-sm text-charcoal-muted leading-relaxed font-normal mb-3">
              {currentLang === 'hi' ? speechHi : speechEn}
            </p>

            {/* Quick Action Navigation & Follow Switch */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-beige-border/60">
              <button
                type="button"
                onClick={() => {
                  navigate('/projects');
                  setDialogOpen(false);
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-ivory hover:bg-champagne-100 text-charcoal border border-beige-border font-medium transition-colors"
              >
                🚀 Projects
              </button>
              <button
                type="button"
                onClick={() => {
                  navigate('/contact');
                  setDialogOpen(false);
                }}
                className="text-[11px] px-2.5 py-1 rounded-full bg-champagne text-white hover:bg-champagne-600 font-medium transition-colors"
              >
                ✉️ Contact
              </button>
              
              {/* Follow Toggle Button */}
              <button
                type="button"
                onClick={toggleFollowMode}
                className={`text-[11px] px-2.5 py-1 rounded-full border font-medium transition-colors flex items-center gap-1 ${
                  followCursor 
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100' 
                    : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
                }`}
                title="Double tap the robot anytime to toggle follow mode!"
              >
                {followCursor ? (
                  <>
                    <Pause size={10} />
                    <span>Double-Tap: Pause</span>
                  </>
                ) : (
                  <>
                    <Play size={10} />
                    <span>Double-Tap: Resume</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Direction-Facing Wrapper (Preserves walking step animation) */}
        <div
          style={{
            transform: walkingDirection === 'left' ? 'scaleX(-1)' : 'scaleX(1)',
            transition: 'transform 0.16s ease-out',
          }}
        >
          {/* Walking / Hovering Motion Wrapper */}
          <div
            onClick={handleRobotTap}
            onDoubleClick={toggleFollowMode}
            className={`relative group cursor-pointer ${
              isWalking ? 'animate-robot-walk-bob' : 'animate-robot-hover'
            }`}
            title="Sparky AI: Double-tap me to STOP/START following! Click anywhere to explain!"
          >
            {/* Holographic Glowing Footstep Rings / Walking Thrusters */}
            <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-36 h-6 flex items-center justify-center pointer-events-none">
              <span className="w-28 h-4 bg-cyan-400/35 rounded-full blur-md" />
              {isWalking && (
                <>
                  <span className="absolute w-16 h-4 rounded-full border border-cyan-400 animate-step-ripple" />
                  <span className="absolute w-11 h-3 rounded-full border border-cyan-300 animate-step-ripple" style={{ animationDelay: '0.22s' }} />
                </>
              )}
            </div>

            {/* Mode Toggle Ripple Feedback */}
            {modeNotification && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                <span className={`w-24 h-24 rounded-full border-2 animate-mode-ring ${
                  modeNotification === 'FOLLOW_ON' ? 'border-emerald-400 bg-emerald-400/20' : 'border-amber-400 bg-amber-400/20'
                }`} />
              </div>
            )}

            {/* 3D Perspective Body Tilt */}
            <div
              className="w-36 sm:w-44 aspect-square relative flex items-center justify-center filter drop-shadow-2xl"
              style={{
                transform: `perspective(600px) rotateX(${lookAngle.rotateX}deg) rotateY(${lookAngle.rotateY}deg)`,
                transformStyle: 'preserve-3d',
                transition: 'transform 0.08s ease-out',
              }}
            >
              {/* Clean Transparent Cutout Robot Avatar */}
              <img
                src={robotImg}
                alt="Spartan AI Interactive Robot Mascot"
                className="w-full h-full object-contain filter contrast-[1.05] pointer-events-none"
              />

              {/* ========================================================================= */}
              {/* ULTRA-BOLD, HIGH-VISIBILITY GLOWING OLED VISOR SCREEN & FACIAL EXPRESSIONS */}
              {/* ========================================================================= */}
              <div 
                className="absolute top-[20.5%] left-[36.5%] w-[32%] h-[21%] pointer-events-none flex flex-col items-center justify-center z-10"
                style={{
                  transform: 'translateZ(18px)',
                }}
              >
                {/* 1. HAPPY EXPRESSION: Curved Glowing Eyes + Sweet Smile + Blink Animation */}
                {expression === 'happy' && (
                  <div className="w-full h-full flex flex-col items-center justify-center robot-cyan-glow animate-[visorBlink_4.5s_infinite]">
                    {/* Glowing Eyes */}
                    <div className="w-full flex justify-between px-2">
                      <svg width="22" height="14" viewBox="0 0 24 14" fill="none">
                        <path d="M2 11C6 2 18 2 22 11" stroke="#00F0FF" strokeWidth="4.5" strokeLinecap="round" />
                      </svg>
                      <svg width="22" height="14" viewBox="0 0 24 14" fill="none">
                        <path d="M2 11C6 2 18 2 22 11" stroke="#00F0FF" strokeWidth="4.5" strokeLinecap="round" />
                      </svg>
                    </div>
                    {/* Smiling Mouth */}
                    <svg width="18" height="9" viewBox="0 0 20 10" fill="none" className="mt-1">
                      <path d="M3 2C7 9.5 13 9.5 17 2" stroke="#00F0FF" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}

                {/* 2. TALKING / EXPLAINING EXPRESSION: Active Eyes + Equalizer Waveform Mouth */}
                {expression === 'talking' && (
                  <div className="w-full h-full flex flex-col items-center justify-center robot-cyan-glow">
                    {/* Alert Round Eyes */}
                    <div className="w-full flex justify-between px-2.5">
                      <div className="w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_12px_#00F0FF] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                      <div className="w-4 h-4 rounded-full bg-cyan-300 shadow-[0_0_12px_#00F0FF] flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-white" />
                      </div>
                    </div>
                    {/* Animated Equalizer Speech Bars */}
                    <div className="flex items-center gap-1.5 mt-2 h-4">
                      <span className="w-1.5 bg-cyan-300 rounded-full animate-soundwave-1 shadow-[0_0_6px_#00F0FF]" />
                      <span className="w-1.5 bg-cyan-200 rounded-full animate-soundwave-2 shadow-[0_0_8px_#00F0FF]" />
                      <span className="w-1.5 bg-cyan-200 rounded-full animate-soundwave-3 shadow-[0_0_8px_#00F0FF]" />
                      <span className="w-1.5 bg-cyan-300 rounded-full animate-soundwave-4 shadow-[0_0_6px_#00F0FF]" />
                    </div>
                  </div>
                )}

                {/* 3. WALKING EXPRESSION: Focused Eyes Looking Ahead in Direction of Walk */}
                {expression === 'walking' && (
                  <div className="w-full h-full flex flex-col items-center justify-center robot-cyan-glow">
                    <div className="w-full flex justify-between px-2">
                      <svg width="22" height="15" viewBox="0 0 22 15" fill="none">
                        <circle cx="11" cy="7.5" r="6.5" fill="#00F0FF" />
                        <circle cx="14" cy="7.5" r="3" fill="#FFFFFF" />
                      </svg>
                      <svg width="22" height="15" viewBox="0 0 22 15" fill="none">
                        <circle cx="11" cy="7.5" r="6.5" fill="#00F0FF" />
                        <circle cx="14" cy="7.5" r="3" fill="#FFFFFF" />
                      </svg>
                    </div>
                    {/* Determined mouth */}
                    <div className="w-5 h-1 bg-cyan-300 rounded-full mt-1.5 shadow-[0_0_6px_#00F0FF]" />
                  </div>
                )}

                {/* 4. EXCITED EXPRESSION: Glowing 5-Star Eyes + Open Smile */}
                {expression === 'excited' && (
                  <div className="w-full h-full flex flex-col items-center justify-center robot-cyan-glow animate-pulse">
                    <div className="w-full flex justify-between px-2 text-cyan-200 font-extrabold text-base">
                      <span>★</span>
                      <span>★</span>
                    </div>
                    <svg width="20" height="10" viewBox="0 0 20 10" fill="none" className="mt-0.5">
                      <path d="M2 2C6 10 14 10 18 2" stroke="#00F0FF" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}

                {/* 5. LOVE EXPRESSION: Glowing Neon Heart Eyes */}
                {expression === 'love' && (
                  <div className="w-full h-full flex flex-col items-center justify-center filter drop-shadow-[0_0_10px_#FF2A85]">
                    <div className="w-full flex justify-between px-2 text-pink-400 font-extrabold text-base animate-bounce">
                      <span>♥</span>
                      <span>♥</span>
                    </div>
                    <svg width="18" height="9" viewBox="0 0 20 10" fill="none" className="mt-0.5">
                      <path d="M3 2C7 9 13 9 17 2" stroke="#FF54A5" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                  </div>
                )}

                {/* 6. CURIOUS EXPRESSION: One Arched Brow + Questioning Look */}
                {expression === 'curious' && (
                  <div className="w-full h-full flex flex-col items-center justify-center robot-cyan-glow">
                    <div className="w-full flex justify-between px-2 items-center">
                      <div className="w-4 h-4 rounded-full border-2 border-cyan-300 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-200" />
                      </div>
                      <svg width="18" height="12" viewBox="0 0 20 14" fill="none">
                        <path d="M2 11C5 3 15 3 18 11" stroke="#00F0FF" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-cyan-300 mt-1" />
                  </div>
                )}

                {/* 7. SLEEPING EXPRESSION: Relaxed Lines + Floating Zzz */}
                {expression === 'sleeping' && (
                  <div className="w-full h-full flex flex-col items-center justify-center robot-cyan-glow opacity-85">
                    <div className="w-full flex justify-between px-3">
                      <span className="w-4 h-1.5 bg-cyan-400 rounded-full" />
                      <span className="w-4 h-1.5 bg-cyan-400 rounded-full" />
                    </div>
                    {/* Floating Zzz */}
                    <div className="relative w-full flex justify-end pr-2">
                      <span className="text-[11px] font-bold text-cyan-200 absolute -top-4 animate-[floatZzz_2s_infinite]">
                        z
                      </span>
                      <span className="text-[13px] font-extrabold text-cyan-100 absolute -top-8 animate-[floatZzz_2s_infinite_0.4s]">
                        Z
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Floating Guide Badge Above Robot */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white/95 px-3 py-0.5 rounded-full border border-champagne-300 shadow-md flex items-center gap-1.5 whitespace-nowrap">
              <span className={`w-2 h-2 rounded-full ${followCursor ? 'bg-emerald-500 animate-ping' : 'bg-amber-500'}`} />
              <span className="text-[10px] font-serif font-bold text-charcoal">
                {isWalking 
                  ? '🚶 Robot Walking...' 
                  : followCursor 
                    ? '🟢 Following • Double-Tap to Stop' 
                    : '⏸️ Resting • Double-Tap to Walk'}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
