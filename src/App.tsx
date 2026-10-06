import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import darkModeVideo from './assets/video/darkmode.mp4'
import lightModeVideo from './assets/video/lightmode.mp4'
import './App.css'
import {
  navItems,
  projects,
  services,
  skills,
} from './data/portfolio'

gsap.registerPlugin(ScrollTrigger)

function ScrollTypewriter({ text, className = '' }: { text: string; className?: string }) {
  const triggerRef = useRef<HTMLSpanElement | null>(null)
  const [displayText, setDisplayText] = useState(text.slice(0, 1))

  useEffect(() => {
    const element = triggerRef.current
    if (!element) return
    const section = element.closest<HTMLElement>('.about, .service-panel')
    const isAboutSection = section?.classList.contains('about') ?? false
    let lastLength = -1

    const syncTextToProgress = (progress: number) => {
      const nextLength = Math.max(1, Math.min(text.length, Math.ceil(progress * text.length)))
      if (nextLength === lastLength) return
      lastLength = nextLength
      setDisplayText(text.slice(0, nextLength))
    }

    const instance = ScrollTrigger.create({
      trigger: section ?? element,
      start: isAboutSection ? 'top 82%' : 'top 85%',
      end: 'top 55%',
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        syncTextToProgress(self.progress)
      },
      onRefresh: (self) => syncTextToProgress(self.progress),
    })

    syncTextToProgress(instance.progress)

    return () => {
      instance.kill()
    }
  }, [text])

  return (
    <span ref={triggerRef} className={`typewriter ${className}`.trim()}>
      <span className="typewriter__measure" aria-hidden="true">
        {text}
      </span>
      <span className="typewriter__visible" aria-label={text}>
        {displayText}
      </span>
    </span>
  )
}

function MagneticButton({
  children,
  href,
}: {
  children: React.ReactNode
  href: string
}) {
  const buttonRef = useRef<HTMLAnchorElement | null>(null)

  const handleMove = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const element = buttonRef.current
    if (!element) return

    const rect = element.getBoundingClientRect()
    const x = event.clientX - rect.left - rect.width / 2
    const y = event.clientY - rect.top - rect.height / 2

    gsap.to(element, {
      x: x * 0.18,
      y: y * 0.18,
      duration: 0.2,
      ease: 'power2.out',
    })
  }

  const reset = () => {
    gsap.to(buttonRef.current, { x: 0, y: 0, duration: 0.25, ease: 'power2.out' })
  }

  return (
    <a
      ref={buttonRef}
      href={href}
      className="magnetic-button"
      onMouseMove={handleMove}
      onMouseLeave={reset}
    >
      {children}
    </a>
  )
}

function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [status, setStatus] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsSubmitting(true)
    setStatus('')

    const form = event.currentTarget
    const formData = new FormData(form)
    const payload = {
      name: String(formData.get('name') ?? ''),
      email: String(formData.get('email') ?? ''),
      needs: String(formData.get('needs') ?? ''),
      _subject: `Portfolio inquiry from ${String(formData.get('name') ?? '')}`,
    }

    try {
      const response = await fetch('https://formsubmit.co/ajax/aaronkarldelacruz5@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(payload),
      })
      const result: { success?: boolean | string; message?: string } = await response.json()

      if (!response.ok || (result.success !== true && result.success !== 'true')) {
        throw new Error(result.message || 'The message could not be sent. Please try again.')
      }

      form.reset()
      setStatus('Message sent. Thank you for getting in touch!')
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : 'The message could not be sent. Please try again.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="contact-form-wrap">
      <p className="contact-form__intro">
        Tell me what you need and I&apos;ll get back to you at the email you provide.
      </p>
      <form className="contact-form" onSubmit={handleSubmit}>
        <label>
          Your name
          <input name="name" type="text" autoComplete="name" maxLength={120} required />
        </label>
        <label>
          Your email
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            required
          />
        </label>
        <label className="contact-form__message">
          What do you need?
          <textarea
            name="needs"
            rows={5}
            maxLength={5000}
            placeholder="Tell me about your project or how I can help..."
            required
          />
        </label>
        <button className="magnetic-button contact-form__submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send message'}
        </button>
        <p className="contact-form__status" role="status" aria-live="polite">
          {status}
        </p>
      </form>
    </div>
  )
}

function Preloader({ onComplete }: { onComplete: () => void }) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const timeline = gsap.timeline({
        onComplete: () => {
          setIsVisible(false)
          onComplete()
        },
      })

      timeline
        .to('.preloader__bar', {
          width: '100%',
          duration: 0.8,
          ease: 'power2.inOut',
        })
        .to(
          '.preloader__label',
          {
            y: -18,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.inOut',
          },
          '-=0.2',
        )
        .to(
          '.preloader',
          {
            clipPath: 'inset(0 0 100% 0)',
            duration: 1,
            ease: 'power2.inOut',
          },
          '-=0.1',
        )
    }, 1200)

    return () => window.clearTimeout(timer)
  }, [onComplete])

  if (!isVisible) return null

  return (
    <div className="preloader" aria-live="polite" aria-label="Loading portfolio">
      <div className="preloader__inner">
        <span className="preloader__label">LOADING</span>
        <div className="preloader__track" aria-hidden="true">
          <span className="preloader__bar" />
        </div>
      </div>
    </div>
  )
}

function CustomCursor() {
  const dotRef = useRef<HTMLDivElement | null>(null)
  const ringRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: fine)')
    if (!mediaQuery.matches) return

    const handleMove = (event: PointerEvent) => {
      gsap.to(dotRef.current, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.1,
        ease: 'power2.out',
      })
      gsap.to(ringRef.current, {
        x: event.clientX,
        y: event.clientY,
        duration: 0.2,
        ease: 'power2.out',
      })
    }

    const handleHover = (event: Event) => {
      const target = event.target as HTMLElement | null
      const interactive = !!target?.closest('a, button, .skill-card, .project-card, .service-panel')
      gsap.to(ringRef.current, {
        scale: interactive ? 1.8 : 1,
        duration: 0.2,
        ease: 'power2.out',
      })
    }

    window.addEventListener('pointermove', handleMove)
    document.addEventListener('pointerover', handleHover)
    document.addEventListener('pointerout', handleHover)

    return () => {
      window.removeEventListener('pointermove', handleMove)
      document.removeEventListener('pointerover', handleHover)
      document.removeEventListener('pointerout', handleHover)
    }
  }, [])

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={dotRef} className="cursor__dot" />
      <div ref={ringRef} className="cursor__ring" />
    </div>
  )
}

function App() {
  const appRef = useRef<HTMLDivElement | null>(null)
  const nameTypingTimelineRef = useRef<gsap.core.Timeline | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>(() =>
    window.localStorage.getItem('portfolio-theme') === 'light' ? 'light' : 'dark',
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem('portfolio-theme', theme)
  }, [theme])

  useEffect(() => {
    const lenis = new Lenis({
      duration: 0.9,
      smoothWheel: true,
      lerp: 0.12,
      wheelMultiplier: 1,
    })

    const tick = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    lenis.on('scroll', ScrollTrigger.update)

    const ctx = gsap.context(() => {
      const nameChars = gsap.utils.toArray<HTMLElement>('.hero__name-char')
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      gsap.set('.site-header', { autoAlpha: 0, pointerEvents: 'none' })

      if (prefersReducedMotion) {
        gsap.set(nameChars, { clearProps: 'all' })
      } else {
        nameTypingTimelineRef.current = gsap.timeline({ paused: true }).fromTo(
          nameChars,
          { autoAlpha: 0, yPercent: 110, rotateX: -45 },
          {
            autoAlpha: 1,
            yPercent: 0,
            rotateX: 0,
            stagger: 0.035,
            duration: 0.16,
            ease: 'none',
          },
        )
      }

      const introTimeline = gsap.timeline({
        scrollTrigger: {
          trigger: '.hero',
          start: 'top top',
          end: () => `+=${window.innerHeight * 1.2}`,
          pin: true,
          scrub: 0.35,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (prefersReducedMotion) return
            if (self.direction < 0) nameTypingTimelineRef.current?.reverse()
            if (self.direction > 0) nameTypingTimelineRef.current?.play()
          },
        },
      })

      introTimeline
        .to({}, { duration: 0.5 })
        .to('.hero__title', {
          autoAlpha: 0,
          yPercent: -12,
          duration: 0.24,
          ease: 'power2.in',
        })
        .to('.site-header', {
          autoAlpha: 1,
          pointerEvents: 'auto',
          duration: 0.18,
          ease: 'power1.out',
        })

      gsap.utils.toArray<HTMLElement>('.section-intro').forEach((intro) => {
        gsap.fromTo(
          intro,
          { opacity: 0.25, y: 36, clipPath: 'inset(0 0 18% 0)' },
          {
            opacity: 1,
            y: 0,
            clipPath: 'inset(0 0 0% 0)',
            scrollTrigger: {
              trigger: intro,
              start: 'top 88%',
              end: 'top 56%',
              scrub: 0.55,
            },
          },
        )
      })

      gsap.to('.about__image-frame', {
        clipPath: 'inset(0% 0% 0% 0%)',
        scale: 1,
        scrollTrigger: {
          trigger: '.about',
          start: 'top 78%',
          end: 'top 42%',
          scrub: 0.7,
        },
      })

      gsap.to('.about__label', {
        x: -30,
        opacity: 1,
        scrollTrigger: {
          trigger: '.about',
          start: 'top 70%',
          end: 'bottom 20%',
          scrub: 0.55,
        },
      })

      gsap.utils.toArray<HTMLElement>('.project-card').forEach((card, index) => {
        const media = card.querySelector('.project-card__media') as HTMLElement | null
        const copy = card.querySelector('.project-card__copy') as HTMLElement | null

        gsap.fromTo(
          media,
          {
            scale: 1.15,
            rotate: -2,
            filter: 'brightness(0.72)',
            clipPath: 'inset(0 0 16% 0)',
          },
          {
            scale: 1,
            rotate: 0,
            filter: 'brightness(1)',
            clipPath: 'inset(0 0 0% 0)',
            scrollTrigger: {
              trigger: card,
              start: 'top 70%',
              end: 'bottom 30%',
              scrub: 0.75,
            },
          },
        )

        gsap.fromTo(
          copy,
          { opacity: 0.2, x: index % 2 === 0 ? -42 : 42 },
          {
            opacity: 1,
            x: 0,
            scrollTrigger: {
              trigger: card,
              start: 'top 82%',
              end: 'top 48%',
              scrub: 0.65,
            },
          },
        )
      })

      gsap.utils.toArray<HTMLElement>('.service-panel').forEach((panel, index) => {
        gsap.fromTo(
          panel,
          { opacity: 0.35, y: 48 },
          {
            opacity: 1,
            y: 0,
            scrollTrigger: {
              trigger: panel,
              start: 'top 80%',
              end: 'bottom 20%',
              scrub: 0.55,
            },
          },
        )

        gsap.to(panel, {
          scale: 1.03,
          y: index * 8,
          scrollTrigger: {
            trigger: '.services',
            start: 'top 60%',
            end: 'bottom 30%',
            scrub: 0.8,
          },
        })
      })

      gsap.to('.contact__glow', {
        scale: 1.12,
        opacity: 1,
        scrollTrigger: {
          trigger: '.contact',
          start: 'top 80%',
          end: 'bottom 20%',
          scrub: 0.7,
        },
      })
    }, appRef)

    return () => {
      lenis.destroy()
      gsap.ticker.remove(tick)
      ctx.revert()
      nameTypingTimelineRef.current = null
    }
  }, [])

  const handlePreloaderComplete = useCallback(() => {
    nameTypingTimelineRef.current?.play(0)
  }, [])

  const toggleTheme = () => {
    setTheme((current) => current === 'dark' ? 'light' : 'dark')
  }

  const themeToggle = (
    <button
      className="theme-toggle"
      type="button"
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      aria-pressed={theme === 'light'}
      onClick={toggleTheme}
    >
      <span aria-hidden="true">{theme === 'dark' ? '☼' : '☾'}</span>
    </button>
  )

  return (
    <div ref={appRef} className="portfolio-shell" data-theme={theme}>
      <CustomCursor />
      <Preloader onComplete={handlePreloaderComplete} />

      <header className="site-header">
        <div className="brand">𝔸𝔸ℝ𝕆ℕ 𝕂𝔸ℝ𝕃 𝕌. 𝔻𝔼 𝕃𝔸 ℂℝ𝕌ℤ</div>
        <nav
          id="main-navigation"
          className={`site-nav${isMenuOpen ? ' site-nav--open' : ''}`}
          aria-label="Main navigation"
        >
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="site-nav__link"
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <button
          className={`menu-toggle${isMenuOpen ? ' menu-toggle--open' : ''}`}
          type="button"
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          aria-controls="main-navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
        </button>
        <MagneticButton href="#contact">Let&apos;s talk</MagneticButton>
        {themeToggle}
      </header>

      <main className="page-shell">
        <section id="hero" className="panel hero">
          <video
            key={theme}
            className="hero__background-video"
            src={theme === 'light' ? lightModeVideo : darkModeVideo}
            autoPlay
            muted
            loop
            playsInline
            aria-hidden="true"
          />
          <div className="hero__video-overlay" aria-hidden="true" />
          <div className="hero__theme-toggle">{themeToggle}</div>
          <div className="hero__content">
            <h1 className="hero__title" aria-label="Aaron Karl U. De La Cruz">
              {['𝔸𝔸ℝ𝕆ℕ 𝕂𝔸ℝ𝕃 𝕌.', '𝔻𝔼 𝕃𝔸 ℂℝ𝕌ℤ'].map((line) => (
                <span className="hero__name-line" key={line} aria-hidden="true">
                  {Array.from(line).map((char, index) => (
                    <span className="hero__name-char" key={`${line}-${index}`}>
                      {char === ' ' ? '\u00a0' : char}
                    </span>
                  ))}
                </span>
              ))}
            </h1>
          </div>
          <div className="scroll-indicator">SCROLL</div>
        </section>

        <section id="about" className="panel about">
          <div className="section-intro">
            <span className="section-kicker">ABOUT</span>
            <h2>Designing motion with intention.</h2>
          </div>
          <div className="about__content">
            <div className="about__image-frame">
              <img
                src="/images/aaron-karl-de-la-cruz.jpg"
                alt="Aaron Karl U. De La Cruz"
              />
              <span className="about__label">Since 2020</span>
            </div>
            <div className="about__copy">
              <p className="about__eyebrow">WHO I AM</p>
              <ScrollTypewriter className="about__typewriter" text="PROGRAMMING IS MY CRAFT." />
              <p>
                I am Aaron Karl U. De La Cruz, a programmer interested in creating useful,
                polished digital experiences through code and design.
              </p>
              <p>
                My work spans programming, UI / UX, networking, and AI, with a focus on clear
                interfaces and thoughtful interactions.
              </p>
            </div>
          </div>
        </section>

        <section id="skills" className="panel skills">
          <div className="section-intro centered">
            <span className="section-kicker">SKILLS</span>
            <h2>Tools I work with.</h2>
          </div>
          <div
            className="skills-marquee"
            role="region"
            aria-label="Skills ticker. Hover or focus to pause."
          >
            <div className="skills-marquee__track">
              {[0, 1].map((copy) => (
                <ul
                  className="skills-marquee__group"
                  key={copy}
                  aria-hidden={copy === 1}
                >
                  {skills.map((skill) => (
                    <li className="skills-marquee__item" key={`${copy}-${skill}`}>
                      {skill}
                    </li>
                  ))}
                </ul>
              ))}
            </div>
            <div className="skills-marquee__hint" aria-hidden="true">
              Hover to pause
            </div>
          </div>
        </section>

        <section id="projects" className="panel projects">
          <div className="section-intro">
            <span className="section-kicker">PROJECTS</span>
            <h2>Selected work shaped by narrative and performance.</h2>
          </div>

          <div className="projects__list">
            {projects.map((project, index) => (
              <article className="project-card" key={project.title}>
                <div className="project-card__media">
                  <img src={project.image} alt={project.title} />
                </div>
                <div className="project-card__copy">
                  <span className="project-card__category">0{index + 1} / {project.category}</span>
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-card__tech">
                    {project.technologies.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>
                  <MagneticButton href={project.link}>Open case study</MagneticButton>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="services" className="panel services">
          <div className="section-intro">
            <span className="section-kicker">SERVICES</span>
            <h2>Product craft from concept to launch.</h2>
          </div>
          <div className="services__stack">
            {services.map((service) => (
              <article className="service-panel" key={service.title}>
                <span className="service-panel__tag">{service.title}</span>
                <ScrollTypewriter text={service.title} className="service-panel__title" />
                <p>{service.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact" className="panel contact">
          <div className="contact__glow" aria-hidden="true" />
          <div className="contact__inner">
            <p className="section-kicker">CONTACT</p>
            <h2>
              LET&apos;S <span>BUILD</span>
              <br />
              SOMETHING
            </h2>
            <div className="contact__actions">
              <ContactForm />
              <a className="contact__email" href="mailto:aaronkarldelacruz5@gmail.com">
                aaronkarldelacruz5@gmail.com
              </a>
              <nav className="contact__socials" aria-label="Social profiles">
                <a className="contact__social-link" href="https://www.facebook.com/eyronkarldelacruz/" target="_blank" rel="noreferrer">
                  Facebook
                </a>
                <a className="contact__social-link" href="https://www.instagram.com/_muning_11/?hl=en" target="_blank" rel="noreferrer">
                  Instagram
                </a>
                <a className="contact__social-link" href="https://www.tiktok.com/@kotarages11" target="_blank" rel="noreferrer">
                  TikTok
                </a>
                <a
                  className="contact__social-link"
                  href="https://www.linkedin.com/in/aaron-karl-de-la-cruz-4112ba367/"
                  target="_blank"
                  rel="noreferrer"
                >
                  LinkedIn
                </a>
                <a className="contact__social-link" href="https://github.com/Eyrondelacruz" target="_blank" rel="noreferrer">
                  GitHub
                </a>
              </nav>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default App
