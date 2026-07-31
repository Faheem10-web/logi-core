import { useState, useEffect, useRef } from 'react'
import Lenis from 'lenis'
import heroBg from './assets/hero_bg.png'
import cargoShipImg from './assets/cargo_ship.png'
import cargoTruckImg from './assets/cargo_truck.png'
import airFreightImg from './assets/air_freight.png'
import avatar1Img from './assets/avatar1.png'
import avatar2Img from './assets/avatar2.png'
import avatar3Img from './assets/avatar3.png'
import footerBg from './assets/footer_bg.png'
import deliveryCourierImg from './assets/delivery_courier.png'
import './App.css'
import './Admin.css'
import { AdminLogin } from './components/AdminLogin'
import { AdminPanel } from './components/AdminPanel'
import { CookieConsent } from './components/common/CookieConsent'


// High Performance Count-Up Animated Number Component (Repeated animation on scroll)
function CounterNumber({ end, prefix = '', suffix = '', decimals = 0, duration = 1800 }) {
  const [count, setCount] = useState(0)
  const ref = useRef(null)
  const animRef = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let startTime = null
          const startValue = 0

          const animate = (currentTime) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)
            // Ease out cubic curve for smooth slowing near finish
            const easeProgress = 1 - Math.pow(1 - progress, 3)
            const currentVal = startValue + (end - startValue) * easeProgress
            setCount(currentVal)

            if (progress < 1) {
              animRef.current = requestAnimationFrame(animate)
            }
          }

          animRef.current = requestAnimationFrame(animate)
        } else {
          if (animRef.current) cancelAnimationFrame(animRef.current)
          setCount(0)
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(element)

    return () => {
      if (element) observer.unobserve(element)
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [end, duration])

  const formattedCount = decimals > 0 ? count.toFixed(decimals) : Math.floor(count)

  return (
    <span ref={ref} className="count-number-val">
      {prefix}{formattedCount}{suffix}
    </span>
  )
}

// Reusable Scroll Reveal Observer Wrapper (Repeated animation on scroll)
function ScrollReveal({ children, className = '', delay = 0 }) {
  const [isRevealed, setIsRevealed] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true)
        } else {
          setIsRevealed(false)
        }
      },
      { threshold: 0.12 }
    )

    observer.observe(element)

    return () => {
      if (element) observer.unobserve(element)
    }
  }, [])

  return (
    <div
      ref={ref}
      className={`scroll-reveal-item ${isRevealed ? 'revealed' : ''} ${className}`}
      style={{ transitionDelay: isRevealed ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}

const heroImages = [
  'https://res.cloudinary.com/ddluoarzr/image/upload/v1785520504/ChatGPT_Image_Jul_31_2026_11_24_45_PM_grbg0g.png',
  'https://i.pinimg.com/1200x/a3/f6/ac/a3f6acb5de01d7914c26292209872263.jpg',
  'https://i.pinimg.com/1200x/85/52/4c/85524cd181a0c5e3cabb9b04c5cd2a24.jpg',
]

function App() {
  const [activeNav, setActiveNav] = useState('Home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [heroSlideIndex, setHeroSlideIndex] = useState(0)
  const [openFooterCol, setOpenFooterCol] = useState({
    services: false,
    company: false,
    contact: false,
  })

  // Admin Panel Integration State
  const [isAdminOpen, setIsAdminOpen] = useState(
    window.location.hash === '#admin' || window.location.pathname.endsWith('/admin')
  )
  const [authToken, setAuthToken] = useState(
    localStorage.getItem('logicore_admin_token') || sessionStorage.getItem('logicore_admin_token') || null
  )

  // Live dynamic JSON states fetched from Express Backend API
  const [siteHero, setSiteHero] = useState(null)
  const [siteAbout, setSiteAbout] = useState(null)
  const [siteServices, setSiteServices] = useState(null)
  const [siteTestimonials, setSiteTestimonials] = useState(null)
  const [siteContact, setSiteContact] = useState(null)
  const [siteSettings, setSiteSettings] = useState(null)

  // Listen to URL changes for #admin or /admin
  useEffect(() => {
    const handleUrlCheck = () => {
      if (window.location.hash === '#admin' || window.location.pathname.endsWith('/admin')) {
        setIsAdminOpen(true)
      }
    }
    handleUrlCheck()
    window.addEventListener('hashchange', handleUrlCheck)
    window.addEventListener('popstate', handleUrlCheck)
    return () => {
      window.removeEventListener('hashchange', handleUrlCheck)
      window.removeEventListener('popstate', handleUrlCheck)
    }
  }, [])

  // Timestamp state for zero-cache 100% instant image re-rendering
  const [lastUpdateTs, setLastUpdateTs] = useState(Date.now())

  // Cache bust image URL helper
  const cacheBust = (url) => {
    if (!url) return ''
    const baseUrl = url.split('?v=')[0].split('&v=')[0]
    return baseUrl.includes('?') ? `${baseUrl}&v=${lastUpdateTs}` : `${baseUrl}?v=${lastUpdateTs}`
  }

  // Fetch live website JSON data from server API with no-store headers
  const fetchLiveSiteData = async () => {
    try {
      const ts = Date.now()
      const [hRes, aRes, sRes, tRes, cRes, setRes] = await Promise.all([
        fetch(`/api/hero?t=${ts}`, { cache: 'no-store' }),
        fetch(`/api/about?t=${ts}`, { cache: 'no-store' }),
        fetch(`/api/services?t=${ts}`, { cache: 'no-store' }),
        fetch(`/api/testimonials?t=${ts}`, { cache: 'no-store' }),
        fetch(`/api/contact?t=${ts}`, { cache: 'no-store' }),
        fetch(`/api/settings?t=${ts}`, { cache: 'no-store' }),
      ])
      if (hRes.ok) setSiteHero(await hRes.json())
      if (aRes.ok) setSiteAbout(await aRes.json())
      if (sRes.ok) setSiteServices(await sRes.json())
      if (tRes.ok) setSiteTestimonials(await tRes.json())
      if (cRes.ok) setSiteContact(await cRes.json())
      if (setRes.ok) setSiteSettings(await setRes.json())

      setLastUpdateTs(ts)
    } catch (e) {
      console.log('Using default static site data (API offline or initializing)')
    }
  }

  useEffect(() => {
    fetchLiveSiteData()
  }, [])

  const toggleFooterCol = (col) => {
    setOpenFooterCol((prev) => ({
      ...prev,
      [col]: !prev[col],
    }))
  }

  const navItems = ['Home', 'About', 'Services', 'Contact']
  const lenisRef = useRef(null)

  const activeHeroImages = (siteHero?.images || heroImages).filter((img) => img && typeof img === 'string' && img.trim() !== '')
  const currentHeroImages = activeHeroImages.length > 0 ? activeHeroImages : heroImages

  // Auto-play hero background image slider dynamically
  useEffect(() => {
    const duration = (siteHero?.imageDuration || 7) * 1000
    const timer = setInterval(() => {
      setHeroSlideIndex((prev) => (prev + 1) % currentHeroImages.length)
    }, duration)

    return () => clearInterval(timer)
  }, [siteHero, currentHeroImages.length])

  // Preload hero images for zero flicker performance
  useEffect(() => {
    currentHeroImages.forEach((src) => {
      const img = new Image()
      img.src = src
    })
  }, [currentHeroImages])

  // Smart Scroll Detection (Hide on scroll down, reveal on scroll up)
  const [scrollDirection, setScrollDirection] = useState('up')
  const [isScrolled, setIsScrolled] = useState(false)
  const lastScrollY = useRef(0)

  // Lenis Smooth Scroll Initialization (60FPS momentum scrolling)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.8,
    })

    lenisRef.current = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    // Synchronize Lenis scroll event with Navbar visibility states for smooth 60fps responsiveness
    const handleScroll = (e) => {
      const currentY = e?.scroll !== undefined ? e.scroll : window.scrollY

      if (currentY > 40) {
        setIsScrolled(true)
      } else {
        setIsScrolled(false)
      }

      const diff = currentY - lastScrollY.current
      if (currentY > 120 && diff > 6) {
        setScrollDirection('down')
      } else if (diff < -6 || currentY < 80) {
        setScrollDirection('up')
      }

      lastScrollY.current = currentY
    }

    lenis.on('scroll', handleScroll)

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  // Global helper to smoothly scroll to top 0 across Window, Body, Document & Lenis
  const scrollToTopGlobal = (smooth = true) => {
    if (smooth && lenisRef.current) {
      lenisRef.current.scrollTo(0, { duration: 0.8 })
    } else {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
      document.documentElement.scrollTop = 0
      document.body.scrollTop = 0
      if (lenisRef.current) {
        lenisRef.current.scrollTo(0, { immediate: true })
      }
      setTimeout(() => {
        window.scrollTo(0, 0)
        document.documentElement.scrollTop = 0
        document.body.scrollTop = 0
        if (lenisRef.current) {
          lenisRef.current.scrollTo(0, { immediate: true })
        }
      }, 10)
    }
  }

  // Lock body scroll when mobile menu drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  // Close mobile drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && mobileMenuOpen) {
        setMobileMenuOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [mobileMenuOpen])

  // Automatic smooth testimonial rotation
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % 3)
    }, 4500)

    return () => clearInterval(timer)
  }, [])

  // Navigation click handler with smooth scroll
  const handleNavClick = (item) => {
    if (activeNav === item) {
      scrollToTopGlobal(true)
    } else {
      setActiveNav(item)
      scrollToTopGlobal(false)
    }
    setMobileMenuOpen(false)
  }

  const testimonials = [
    {
      id: 1,
      name: 'Kathrine Katija',
      role: 'Marketing Manager, ABC Ad Services',
      headline: 'Our ad campaigns finally speak to the right audience with clarity resulting in high CTR and ROI.',
      subtext: 'Trust her work, that the words and strategy delivered completely transformed our brand presence. Their seamless logistics network and automated dispatch pipeline ensured zero delay across all our international supply chains.',
      avatar: avatar1Img,
      rating: 5,
    },
    {
      id: 2,
      name: 'Marcus Vance',
      role: 'Supply Chain Director, Global Trade Corp',
      headline: 'LOGICORE revolutionized our cross-border shipping speed with real-time tracking transparency.',
      subtext: 'Their dedicated road and ocean freight support eliminated port congestion delays and optimized our entire warehouse dispatch flow. LOGICORE provided end-to-end cargo visibility that scaled our operations effortlessly.',
      avatar: avatar2Img,
      rating: 5,
    },
    {
      id: 3,
      name: 'David Miller',
      role: 'VP of Operations, Apex Logistics',
      headline: 'Exceptional air freight turnaround time for our time-critical manufacturing components.',
      subtext: 'We achieved seamless global coverage across 40+ countries within the very first quarter of partnering with LOGICORE. Their air cargo speed, dedicated account management, and real-time tracking are second to none.',
      avatar: avatar3Img,
      rating: 5,
    },
  ]

  // Shared Header Component with Right Slide-out Mobile Drawer & Morphing Hamburger
  const renderHeader = () => (
    <>
      <header className={`header-wrapper ${isScrolled ? 'is-scrolled' : ''}`}>
        <div className="navbar-border-wrapper">
          <nav className="navbar" aria-label="Main Navigation">
            {/* LOGICORE Brand */}
            <a href="#" className="brand-container" onClick={(e) => { e.preventDefault(); handleNavClick('Home'); }}>
              <img
                key={`nav-logo-${lastUpdateTs}`}
                src={cacheBust(siteSettings?.logo || '/logo.png')}
                alt="LOGICORE Logo"
                className="brand-logo-img"
              />
            </a>

            {/* Desktop Navigation Links */}
            <ul className="nav-menu">
              {navItems.map((item) => (
                <li key={item} className="nav-item">
                  <a
                    href={`#${item.toLowerCase()}`}
                    className={`nav-link ${activeNav === item ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault()
                      handleNavClick(item)
                    }}
                  >
                    <span>{item}</span>
                  </a>
                </li>
              ))}
            </ul>

            {/* Right Action: Desktop CTA Button & Touch-Friendly Morphing Hamburger */}
            <div className="cta-wrapper">
              <a href="#quote" className="cta-button" onClick={(e) => { e.preventDefault(); handleNavClick('Contact'); }}>
                <span className="cta-content">
                  Get a Quote
                </span>
              </a>

              {/* Touch-Friendly White 3-Line Hamburger Button */}
              <button 
                className={`mobile-menu-btn ${mobileMenuOpen ? 'open' : ''}`} 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                aria-expanded={mobileMenuOpen}
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                  {mobileMenuOpen ? (
                    <path d="M18 6L6 18M6 6l12 12" />
                  ) : (
                    <>
                      <line x1="3" y1="6" x2="21" y2="6" />
                      <line x1="3" y1="12" x2="21" y2="12" />
                      <line x1="3" y1="18" x2="21" y2="18" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Backdrop Blur Overlay */}
      <div 
        className={`mobile-dropdown-backdrop ${mobileMenuOpen ? 'open' : ''}`}
        onClick={() => setMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Centered Floating Mobile Dropdown Menu Container */}
      <div 
        className={`mobile-dropdown-menu ${mobileMenuOpen ? 'open' : ''}`}
        aria-label="Mobile Navigation Menu"
      >
        <ul className="dropdown-nav-list">
          {navItems.map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                className={`dropdown-nav-link ${activeNav === item ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  handleNavClick(item)
                }}
              >
                <span>{item}</span>
                {activeNav === item && <span className="dropdown-active-dot" />}
              </a>
            </li>
          ))}
        </ul>

        <div className="dropdown-cta-wrapper">
          <a 
            href="#quote" 
            className="dropdown-cta-btn"
            onClick={(e) => { e.preventDefault(); handleNavClick('Contact'); }}
          >
            Get a Quote
          </a>
        </div>
      </div>
    </>
  )

  // Shared Footer Component
  const renderFooter = () => (
    <footer className="footer-section">
      <div className="footer-overlay" />

      <div className="footer-container">
        <ScrollReveal>
          {/* Top CTA Banner Row */}
          <div className="footer-cta-banner">
            <h2 className="footer-cta-title">
              EXPLORE OUR <span className="text-blue">REAL WORLD</span> <br />
              LOGISTIC SERVICES
            </h2>

            <a href="#quote" className="footer-cta-btn" onClick={(e) => { e.preventDefault(); handleNavClick('Contact'); }}>
              <span>Get a Quote</span>
              <span className="footer-btn-circle">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <path d="M7 17L17 7M17 7H7M17 7V17" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>
          </div>
        </ScrollReveal>

        {/* Horizontal Line Divider */}
        <div className="footer-divider-line" />

        <ScrollReveal delay={100}>
          {/* Main 4 Columns Grid */}
          <div className="footer-columns-grid">
            {/* Column 1: LOGICORE Brand & Newsletter */}
            <div className="footer-col brand-col">
              <a href="#" className="brand-container" onClick={(e) => { e.preventDefault(); handleNavClick('Home'); }}>
                <img
                  key={`footer-logo-${lastUpdateTs}`}
                  src={cacheBust(siteSettings?.logo || '/logo.png')}
                  alt="LOGICORE Logo"
                  className="brand-logo-img"
                />
              </a>

              <p className="footer-col-desc">
                LOGICORE is a trusted global logistics partner delivering fast, secure transportation across ocean, air, and land.
              </p>

              <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
                <input 
                  type="email" 
                  placeholder="jane@framer.com" 
                  className="newsletter-input" 
                  required
                />
                <button type="submit" className="newsletter-btn">
                  Submit
                </button>
              </form>
            </div>

            {/* Column 2: SERVICES */}
            <div className={`footer-col links-col border-left ${openFooterCol.services ? 'accordion-open' : ''}`}>
              <h4 className="footer-col-title" onClick={() => toggleFooterCol('services')}>
                <span>SERVICES</span>
                <span className="accordion-chevron">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </h4>
              <ul className="footer-links-list">
                <li><a href="#services" onClick={(e) => { e.preventDefault(); handleNavClick('Services'); }}>Freight Services</a></li>
                <li><a href="#services" onClick={(e) => { e.preventDefault(); handleNavClick('Services'); }}>Cargo Transportation</a></li>
                <li><a href="#services" onClick={(e) => { e.preventDefault(); handleNavClick('Services'); }}>Road Transport</a></li>
                <li><a href="#services" onClick={(e) => { e.preventDefault(); handleNavClick('Services'); }}>Global Shipping</a></li>
              </ul>
            </div>

            {/* Column 3: COMPANY */}
            <div className={`footer-col links-col border-left ${openFooterCol.company ? 'accordion-open' : ''}`}>
              <h4 className="footer-col-title" onClick={() => toggleFooterCol('company')}>
                <span>COMPANY</span>
                <span className="accordion-chevron">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </h4>
              <ul className="footer-links-list">
                <li><a href="#about" onClick={(e) => { e.preventDefault(); handleNavClick('About'); }}>About Us</a></li>
                <li><a href="#services" onClick={(e) => { e.preventDefault(); handleNavClick('Services'); }}>Services</a></li>
                <li><a href="#contact" onClick={(e) => { e.preventDefault(); handleNavClick('Contact'); }}>Contact</a></li>
                <li><a href="#careers">Careers</a></li>
              </ul>
            </div>

            {/* Column 4: CONTACT */}
            <div className={`footer-col contact-col border-left ${openFooterCol.contact ? 'accordion-open' : ''}`}>
              <h4 className="footer-col-title" onClick={() => toggleFooterCol('contact')}>
                <span>CONTACT</span>
                <span className="accordion-chevron">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </h4>
              <ul className="footer-contact-list">
                <li>
                  <span className="arrow-icon">›</span>
                  <span>+880 (1234) 5678</span>
                </li>
                <li>
                  <span className="arrow-icon">›</span>
                  <span>info.logicore@gmail.com</span>
                </li>
                <li>
                  <span className="arrow-icon">›</span>
                  <span>130/B Global Trade Market, New York, USA</span>
                </li>
              </ul>
            </div>
          </div>
        </ScrollReveal>

        {/* Bottom Copyright Row */}
        <div className="footer-bottom-row">
          <p className="copyright-text">
            {siteSettings?.copyright || '© Copyright Reserved by LOGICORE 2026'}
          </p>

          <div className="footer-legal-links">
            <a href="#terms">Terms &amp; Condition</a>
            <a href="#privacy">Privacy Policy</a>
          </div>

          <div className="footer-social-icons">
            <a href="#facebook" className="social-icon-circle" aria-label="Facebook">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
              </svg>
            </a>
            <a href="#whatsapp" className="social-icon-circle" aria-label="WhatsApp">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.891.524 3.66 1.434 5.176L2 22l4.954-1.383A9.957 9.957 0 0 0 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm0 18c-1.63 0-3.14-.438-4.444-1.203l-.319-.188-2.946.823.834-2.877-.206-.328A7.954 7.954 0 0 1 4 12c0-4.411 3.589-8 8-8s8 3.589 8 8-3.589 8-8 8z"/>
              </svg>
            </a>
            <a href="#linkedin" className="social-icon-circle" aria-label="LinkedIn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
                <rect x="2" y="9" width="4" height="12"/>
                <circle cx="4" cy="4" r="2"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )

  return (
    <div className="app-main-wrapper">
      {/* Global Viewport Fixed Navbar */}
      {renderHeader()}

      <div key={activeNav} className="page-transition-wrapper">
        {activeNav === 'Contact' ? (
          /* CONTACT PAGE ROUTE */
          <div className="contact-page-wrapper">
            {/* CONTACT HERO BANNER */}
            <section
              className="contact-page-hero"
              key={`contact-hero-${lastUpdateTs}`}
              style={{
                backgroundImage: `url(${cacheBust(siteContact?.bannerImage || 'https://cdn.prod.website-files.com/69b2a15200bc2cb1d23ead7e/69b2a15200bc2cb1d23eb0f6_About-one-banner-main-p-2000.avif')})`,
              }}
            >
              <div className="contact-hero-overlay" />

              <div className="contact-hero-container hero-fade-up">
                <h1 className="contact-hero-title">
                  Contact Us
                </h1>
                <div className="blue-title-accent" />

                <p className="contact-hero-desc">
                  Your trusted logistics partner, moving businesses forward.
                </p>
              </div>
            </section>

            {/* MAIN CONTACT SECTION */}
            <section className="contact-main-section">
              <div className="contact-main-container">
                <ScrollReveal>
                  <div className="contact-card-box">
                    
                    {/* Left Column: Contact Info */}
                    <div className="contact-info-col">
                      <h2 className="contact-info-title">
                        Contact Info!
                      </h2>
                      
                      <p className="contact-info-desc">
                        Get in touch with our global logistics team. We are available 24/7 to assist with your shipping, freight, and cargo inquiries.
                      </p>

                      <ul className="contact-details-list">
                        <li>
                          <span className="contact-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                              <polyline points="22,6 12,13 2,6" />
                            </svg>
                          </span>
                          <span>{siteContact?.email || 'info.logicore@gmail.com'}</span>
                        </li>
                        <li>
                          <span className="contact-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                              <circle cx="12" cy="10" r="3" />
                            </svg>
                          </span>
                          <span>{siteContact?.address || '130/B Global Trade Market, New York, USA'}</span>
                        </li>
                        <li>
                          <span className="contact-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                            </svg>
                          </span>
                          <span>{siteContact?.phone || '+880 (1234) 5678'}</span>
                        </li>
                      </ul>
                    </div>

                    {/* Right Column: Contact Form */}
                    <div className="contact-form-col">
                      <form className="contact-form-wrapper" onSubmit={(e) => e.preventDefault()}>
                        <div className="form-row-two">
                          <input type="text" placeholder="Your Name" className="contact-form-input" required />
                          <input type="tel" placeholder="Your Phon Number" className="contact-form-input" required />
                        </div>

                        <div className="form-row-one">
                          <input type="email" placeholder="Email Address" className="contact-form-input" required />
                        </div>

                        <div className="form-row-one">
                          <input type="text" placeholder="Shipping Location" className="contact-form-input" required />
                        </div>

                        <div className="form-row-one">
                          <textarea placeholder="Message" rows="5" className="contact-form-textarea" required></textarea>
                        </div>

                        <button type="submit" className="contact-submit-btn">
                          Send
                        </button>
                      </form>
                    </div>

                  </div>
                </ScrollReveal>
              </div>
            </section>

            {renderFooter()}
          </div>
        ) : activeNav === 'Services' ? (
          /* SERVICES PAGE ROUTE */
          <div className="services-page-wrapper">
            {/* SERVICES HERO BANNER */}
            <section
              className="services-page-hero"
              key={`services-hero-${lastUpdateTs}`}
              style={{
                backgroundImage: `url(${cacheBust(siteServices?.bannerImage || 'https://cdn.prod.website-files.com/69b2a15200bc2cb1d23ead7e/69b2a15200bc2cb1d23eb0f6_About-one-banner-main-p-2000.avif')})`,
              }}
            >
              <div className="services-hero-overlay" />

              <div className="services-hero-container hero-fade-up">
                <h1 className="services-hero-title">
                  Our Services
                </h1>
                <div className="blue-title-accent" />

                <p className="services-hero-desc">
                  Comprehensive logistics solutions designed to move your business forward.
                </p>
              </div>
            </section>

            {/* MAIN CORE SERVICES SECTION */}
            <section className="core-services-section">
              <div className="core-services-container">
                {/* Header */}
                <ScrollReveal>
                  <div className="core-services-header">
                    <span className="badge-pill">CORE SERVICES</span>
                    <h2 className="core-services-title">
                      RELIABLE GLOBAL FREIGHT <br />
                      &amp; <span className="text-blue">LOGISTICS</span> SERVICES
                    </h2>
                  </div>
                </ScrollReveal>

                {/* 01 / 02 / 03 Alternating Split List Cards */}
                <div className="services-split-list">
                  
                  {/* ITEM 01: OCEAN FREIGHT SOLUTIONS */}
                  <ScrollReveal delay={100}>
                    <div className="service-split-item">
                      <div className="service-split-image-wrapper">
                        <img
                          key={`srv-01-${lastUpdateTs}`}
                          src={cacheBust(siteServices?.services?.[0]?.image || cargoShipImg)}
                          alt={siteServices?.services?.[0]?.title || "Ocean Freight Solutions"}
                          className="service-split-img"
                        />
                      </div>

                      <button className="split-action-arrow-btn" aria-label="View Ocean Freight details">
                        <div className="split-action-arrow-inner">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>

                      <div className="service-split-card">
                        <div className="split-card-header">
                          <span className="split-badge-tag">FREIGHT</span>
                          <span className="split-watermark-num">01</span>
                        </div>

                        <h3 className="split-card-title">
                          {siteServices?.services?.[0]?.title || (
                            <>
                              OCEAN FREIGHT <br />
                              SOLUTIONS
                            </>
                          )}
                        </h3>

                        <div className="split-card-divider" />

                        <ul className="split-checklist">
                          <li>
                            <span className="check-icon-circle">✓</span>
                            <span>{siteServices?.services?.[0]?.description || 'Secure International Container Shipping'}</span>
                          </li>
                          <li>
                            <span className="check-icon-circle">✓</span>
                            <span>Cost-Effective Global Ocean Transport</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* ITEM 02: GLOBAL FREIGHT FORWARDING (Reversed Layout) */}
                  <ScrollReveal delay={200}>
                    <div className="service-split-item reverse-layout">
                      <div className="service-split-card">
                        <div className="split-card-header">
                          <span className="split-badge-tag">TRANSPORT</span>
                          <span className="split-watermark-num">02</span>
                        </div>

                        <h3 className="split-card-title">
                          {siteServices?.services?.[1]?.title || (
                            <>
                              GLOBAL FREIGHT <br />
                              FORWARDING
                            </>
                          )}
                        </h3>

                        <div className="split-card-divider" />

                        <ul className="split-checklist">
                          <li>
                            <span className="check-icon-circle">✓</span>
                            <span>{siteServices?.services?.[1]?.description || 'Worldwide Shipping Coordination'}</span>
                          </li>
                          <li>
                            <span className="check-icon-circle">✓</span>
                            <span>Fast Customs &amp; Documentation Support</span>
                          </li>
                        </ul>
                      </div>

                      <button className="split-action-arrow-btn" aria-label="View Global Freight Forwarding details">
                        <div className="split-action-arrow-inner">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>

                      <div className="service-split-image-wrapper">
                        <img
                          key={`srv-02-${lastUpdateTs}`}
                          src={cacheBust(siteServices?.services?.[1]?.image || cargoTruckImg)}
                          alt={siteServices?.services?.[1]?.title || "Global Freight Forwarding"}
                          className="service-split-img"
                        />
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* ITEM 03: EXPRESS CARGO DELIVERY */}
                  <ScrollReveal delay={300}>
                    <div className="service-split-item">
                      <div className="service-split-image-wrapper">
                        <img
                          key={`srv-03-${lastUpdateTs}`}
                          src={cacheBust(siteServices?.services?.[2]?.image || airFreightImg)}
                          alt={siteServices?.services?.[2]?.title || "Express Cargo Delivery"}
                          className="service-split-img"
                        />
                      </div>

                      <button className="split-action-arrow-btn" aria-label="View Express Cargo Delivery details">
                        <div className="split-action-arrow-inner">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M5 12h14M12 5l7 7-7 7" />
                          </svg>
                        </div>
                      </button>

                      <div className="service-split-card">
                        <div className="split-card-header">
                          <span className="split-badge-tag">LOGISTICS</span>
                          <span className="split-watermark-num">03</span>
                        </div>

                        <h3 className="split-card-title">
                          EXPRESS CARGO <br />
                          DELIVERY
                        </h3>

                        <div className="split-card-divider" />

                        <ul className="split-checklist">
                          <li>
                            <span className="check-icon-circle">✓</span>
                            <span>Fast &amp; Time-Critical Deliveries</span>
                          </li>
                          <li>
                            <span className="check-icon-circle">✓</span>
                            <span>Safe, Reliable &amp; On-Time Shipping</span>
                          </li>
                        </ul>
                      </div>
                    </div>
                  </ScrollReveal>

                </div>
              </div>
            </section>

            {renderFooter()}
          </div>
        ) : activeNav === 'About' ? (
          /* ABOUT PAGE ROUTE */
          <div className="about-page-wrapper">
            {/* ABOUT HERO BANNER */}
            <section
              className="about-hero-section"
              key={`about-hero-${lastUpdateTs}`}
              style={{
                backgroundImage: `url(${cacheBust(siteAbout?.bannerImage || 'https://cdn.prod.website-files.com/69b2a15200bc2cb1d23ead7e/69b2a15200bc2cb1d23eb0f6_About-one-banner-main-p-2000.avif')})`,
              }}
            >
              <div className="about-hero-overlay" />

              <div className="about-hero-container hero-fade-up">
                <div className="section-badge">
                  <span>ABOUT LOGICORE</span>
                  <span className="badge-line" />
                </div>

                <h1 className="about-hero-title">
                  Moving Global Logistics <br />
                  With Precision &amp; Trust
                </h1>

                <p className="about-hero-desc">
                  LogiCore is a global logistics partner delivering reliable, efficient and technology-driven transportation solutions across the world.
                </p>
              </div>
            </section>

            {/* ABOUT COMPANY SECTION */}
            <section className="about-company-section">
              <div className="about-company-container">
                <div className="about-company-grid">
                  {/* Left Content Column */}
                  <ScrollReveal className="about-company-left">
                    <div className="section-badge">
                      <span>ABOUT COMPANY</span>
                      <span className="badge-line" />
                    </div>

                    <h2 className="about-company-title">
                      Delivering Reliable Logistics Solutions With Global Transportation Expertise.
                    </h2>

                    <div className="blue-title-accent" />

                    <p className="about-text-p">
                      For years, we have been helping businesses streamline their supply chains through reliable freight transportation, secure cargo handling, and efficient logistics management.
                    </p>

                    <p className="about-text-p">
                      Our experienced team combines industry knowledge with advanced technology to deliver cost-effective shipping solutions tailored to every client's unique requirements.
                    </p>

                    {/* 3 Floating Stat Cards Row with Count Up Numbers */}
                    <div className="about-stats-row">
                      <div className="about-stat-box">
                        <div className="about-stat-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                        </div>
                        <div className="about-stat-num">
                          <CounterNumber end={15} suffix="+" />
                        </div>
                        <div className="about-stat-text">Years Experience</div>
                      </div>

                      <div className="about-stat-box">
                        <div className="about-stat-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="2" y1="12" x2="22" y2="12" />
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                          </svg>
                        </div>
                        <div className="about-stat-num">
                          <CounterNumber end={100} suffix="+" />
                        </div>
                        <div className="about-stat-text">Countries Served</div>
                      </div>

                      <div className="about-stat-box">
                        <div className="about-stat-icon">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                            <polyline points="9 12 11 14 15 10" />
                          </svg>
                        </div>
                        <div className="about-stat-num">
                          <CounterNumber end={99} suffix="%" />
                        </div>
                        <div className="about-stat-text">On-Time Delivery</div>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Right Image Column */}
                  <ScrollReveal delay={150} className="about-company-right">
                    <div className="about-image-wrapper">
                      <img src={cargoShipImg} alt="Global Ocean Logistics Vessel" className="about-ship-img" />
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </section>

            {/* OUR PURPOSE SECTION */}
            <section className="our-purpose-section">
              <div className="our-purpose-container">
                <ScrollReveal className="our-purpose-header">
                  <div className="section-badge">
                    <span>OUR PURPOSE</span>
                    <span className="badge-line" />
                  </div>
                  <h2 className="our-purpose-title">
                    Driven By Innovation. <br />
                    Built On Trust.
                  </h2>
                </ScrollReveal>

                <div className="purpose-cards-grid">
                  {/* Mission Card */}
                  <ScrollReveal delay={100}>
                    <div className="purpose-card">
                      <div className="purpose-icon-circle">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <circle cx="12" cy="12" r="6" />
                          <circle cx="12" cy="12" r="2" />
                        </svg>
                      </div>
                      <div className="purpose-card-content">
                        <h3 className="purpose-card-title">Our Mission</h3>
                        <p className="purpose-card-desc">
                          Deliver reliable, secure and technology-driven logistics solutions that help businesses move products faster across the globe.
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>

                  {/* Vision Card */}
                  <ScrollReveal delay={200}>
                    <div className="purpose-card">
                      <div className="purpose-icon-circle">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                        </svg>
                      </div>
                      <div className="purpose-card-content">
                        <h3 className="purpose-card-title">Our Vision</h3>
                        <p className="purpose-card-desc">
                          Become the world's most trusted logistics company by delivering smarter, faster and more sustainable transportation.
                        </p>
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </section>

            {renderFooter()}
          </div>
        ) : (
          /* HOME PAGE ROUTE - 100% PRESERVED VISUALS WITH HIGH-MOTION UX */
          <div className="home-page-wrapper">
            {/* SECTION 1: HERO SECTION WITH PREMIUM KEN BURNS AUTO SLIDER */}
            <section className="hero-container">
              {/* Background Slider Container */}
              <div className="hero-slider-bg-wrapper">
                {currentHeroImages.map((imgUrl, idx) => (
                  <div
                    key={`${imgUrl}-${idx}-${lastUpdateTs}`}
                    className={`hero-slide-bg ${idx === heroSlideIndex ? 'active' : ''}`}
                  >
                    <img
                      key={`${imgUrl}-${lastUpdateTs}`}
                      src={cacheBust(imgUrl)}
                      alt={`Hero Logistics Background ${idx + 1}`}
                      className="hero-slide-img"
                      loading={idx === 0 ? 'eager' : 'lazy'}
                    />
                  </div>
                ))}
              </div>

              {/* Unified Dark Gradient Overlay */}
              <div
                className="hero-overlay"
                style={{
                  background: `linear-gradient(rgba(5, 12, 24, ${siteHero?.overlayOpacity ?? 0.35}), rgba(5, 12, 24, ${siteHero?.overlayOpacity ?? 0.35}))`,
                }}
              />

              <main className="hero-content hero-fade-up">
                <h1 className="hero-headline">
                  {siteHero?.heading || 'Welcome to LOGICORE'}
                </h1>
                <p className="hero-subtitle">
                  {siteHero?.subtitle || 'Your trusted partner for global shipping solutions. We make international shipping simple and stress-free.'}
                </p>
              </main>

              <div style={{ height: '66px' }} />
            </section>

            {/* SECTION 2: COMPANY OVERVIEW SECTION */}
            <section className="overview-section">
              <div className="overview-container">
                <ScrollReveal>
                  <div className="overview-grid">
                    <div className="overview-image-wrapper image-left">
                      <img
                        key={`about-img-${lastUpdateTs}`}
                        src={cacheBust(siteAbout?.aboutImage || cargoShipImg)}
                        alt="Company Overview Photo"
                        className="overview-img"
                      />
                    </div>

                    <div className="overview-center">
                      <span className="badge-pill">COMPANY OVERVIEW</span>
                      <h2 className="overview-title">
                        {siteAbout?.heading || (
                          <>
                            DATA-DRIVEN LOGISTIC <br />
                            GLOBAL <span className="text-highlight">NETWORK</span>
                          </>
                        )}
                      </h2>
                      <p className="overview-description">
                        {siteAbout?.description || 'Transforming logistics through innovation. We leverage cross-unit synergy and reliable technology to deliver frictionless shipping services, focusing on high-impact solutions that drive your business forward.'}
                      </p>
                      <a href="#about" className="overview-cta-btn" onClick={(e) => { e.preventDefault(); handleNavClick('About'); }}>
                        <span>More About Us</span>
                        <span className="btn-circle-icon">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                            <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </span>
                      </a>
                    </div>

                    <div className="overview-image-wrapper image-right">
                      <img
                        key={`detail-img-${lastUpdateTs}`}
                        src={cacheBust(siteAbout?.detailImage || cargoTruckImg)}
                        alt="Logistics Fleet Photo"
                        className="overview-img"
                      />
                    </div>
                  </div>
                </ScrollReveal>

                <ScrollReveal delay={150}>
                  <div className="overview-stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon-wrapper">
                        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          <line x1="12" y1="2" x2="12" y2="0" />
                          <line x1="4.93" y1="4.93" x2="3.51" y2="3.51" />
                          <line x1="19.07" y1="4.93" x2="20.49" y2="3.51" />
                        </svg>
                      </div>
                      <div className="stat-text-group">
                        <span className="stat-number">
                          <CounterNumber end={99} suffix="%" />
                        </span>
                        <span className="stat-label">ON-TIME DELIVERY RATE</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon-wrapper">
                        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="6" r="3" />
                          <circle cx="6" cy="18" r="3" />
                          <circle cx="18" cy="18" r="3" />
                          <path d="M12 9v3M9.5 14.5L7.5 16.5M14.5 14.5l2 2" />
                          <path d="M3.5 21a3.5 3.5 0 0 1 5-2.5M15.5 18.5a3.5 3.5 0 0 1 5 2.5" />
                        </svg>
                      </div>
                      <div className="stat-text-group">
                        <span className="stat-number">
                          <CounterNumber end={500} suffix="+" />
                        </span>
                        <span className="stat-label">TRUSTED PARTNERS WORLDWIDE</span>
                      </div>
                    </div>

                    <div className="stat-card">
                      <div className="stat-icon-wrapper">
                        <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#0066FF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 4h4M1 9h5M1 14h2" />
                          <rect x="5" y="4" width="10" height="11" rx="1.5" />
                          <polygon points="15 7 19 7 22 10 22 15 15 15 15 7" />
                          <circle cx="8.5" cy="18.5" r="2" />
                          <circle cx="18.5" cy="18.5" r="2" />
                        </svg>
                      </div>
                      <div className="stat-text-group">
                        <span className="stat-number">
                          <CounterNumber end={2.5} prefix="+" suffix=" K" decimals={1} />
                        </span>
                        <span className="stat-label">MONTHLY ORDERS FULFILLED.</span>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {/* SECTION 3: OUR SERVICES SECTION */}
            <section className="services-section">
              <div className="services-container">
                <ScrollReveal>
                  <div className="services-header-row">
                    <div className="services-header-left">
                      <div className="section-badge">
                        <span>OUR SERVICES</span>
                        <span className="badge-line" />
                      </div>
                      <h2 className="services-title">
                        Transport &amp; Logistics Services
                      </h2>
                    </div>
                    
                    <a href="#services" className="view-all-btn" onClick={(e) => { e.preventDefault(); handleNavClick('Services'); }}>
                      <span>View All Services</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  </div>
                </ScrollReveal>

                <div className="services-grid">
                  <ScrollReveal delay={100}>
                    <div className="service-card-new" onClick={() => handleNavClick('Services')}>
                      <div className="service-card-top">
                        <h3 className="service-card-title-new">
                          FAST AND <br />
                          RELIABLE DELIVERY
                        </h3>
                        <div className="service-badge-icon" aria-label="View delivery service details">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                          </svg>
                        </div>
                      </div>

                      <div className="service-img-container">
                        <img src={deliveryCourierImg} alt="Fast and Reliable Delivery" className="service-img-new" />
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={200}>
                    <div className="service-card-new" onClick={() => handleNavClick('Services')}>
                      <div className="service-card-top">
                        <h3 className="service-card-title-new">
                          SECURE CARGO <br />
                          HANDLING
                        </h3>
                        <div className="service-badge-icon" aria-label="View cargo handling details">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                          </svg>
                        </div>
                      </div>

                      <div className="service-img-container">
                        <img src={cargoTruckImg} alt="Secure Cargo Handling" className="service-img-new" />
                      </div>
                    </div>
                  </ScrollReveal>

                  <ScrollReveal delay={300}>
                    <div className="service-card-new" onClick={() => handleNavClick('Services')}>
                      <div className="service-card-top">
                        <h3 className="service-card-title-new">
                          GLOBAL NETWORK <br />
                          COVERAGE
                        </h3>
                        <div className="service-badge-icon" aria-label="View global coverage details">
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M7 17L17 7M17 7H7M17 7V17" />
                          </svg>
                        </div>
                      </div>

                      <div className="service-img-container">
                        <img src={cargoShipImg} alt="Global Network Coverage" className="service-img-new" />
                      </div>
                    </div>
                  </ScrollReveal>
                </div>
              </div>
            </section>

            {/* SECTION 4: TESTIMONIALS SECTION */}
            <section className="testimonials-section">
              <div className="testimonials-container">
                <ScrollReveal className="testimonials-header">
                  <div className="section-badge">
                    <span>CLIENT TESTIMONIALS</span>
                    <span className="badge-line" />
                  </div>
                  <h2 className="testimonials-section-title">
                    Trusted by Businesses <br />
                    Around the World
                  </h2>
                </ScrollReveal>

                <ScrollReveal delay={150}>
                  <div className="testimonials-grid">
                    <div className="avatar-stack">
                      {testimonials.map((t, index) => (
                        <button
                          key={t.id}
                          className={`avatar-thumb-btn ${activeTestimonial === index ? 'active' : ''}`}
                          onClick={() => setActiveTestimonial(index)}
                          aria-label={`View testimonial from ${t.name}`}
                        >
                          <img src={t.avatar} alt={t.name} className="avatar-thumb-img" />
                        </button>
                      ))}
                    </div>

                    <div className="testimonial-card">
                      <div className="quote-watermark">“</div>

                      <div key={activeTestimonial} className="testimonial-animated-wrapper">
                        <div className="testimonial-content">
                          <h3 className="testimonial-headline">
                            "{testimonials[activeTestimonial].headline}"
                          </h3>
                          <p className="testimonial-subtext">
                            {testimonials[activeTestimonial].subtext}
                          </p>
                        </div>

                        <div className="testimonial-footer-group">
                          <div className="author-info">
                            <h4 className="author-name">{testimonials[activeTestimonial].name}</h4>
                            <p className="author-role">{testimonials[activeTestimonial].role}</p>
                          </div>

                          <div className="rating-stars" aria-label="5 out of 5 stars">
                            {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                              <span key={i} className="star-icon">★</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              </div>
            </section>

            {renderFooter()}
          </div>
        )}
      </div>

      {/* ADMIN PANEL & LOGIN MODAL OVERLAY */}
      {isAdminOpen && (!authToken ? (
        <AdminLogin onLoginSuccess={(token) => setAuthToken(token)} />
      ) : (
        <AdminPanel
          token={authToken}
          onLogout={() => {
            setAuthToken(null)
            localStorage.removeItem('logicore_admin_token')
            sessionStorage.removeItem('logicore_admin_token')
          }}
          onDataUpdated={fetchLiveSiteData}
          onCloseAdmin={() => setIsAdminOpen(false)}
        />
      ))}
      <CookieConsent />
    </div>
  )
}

export default App
