import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../data/products'
import { heroSlides } from '../data/site'

const INTERVAL_MS = 4000

export function HeroSlider() {
  const slides = heroSlides.filter((slide) => products.some((product) => product.space === slide.space))
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused || slides.length < 2) return
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length)
    }, INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [paused, slides.length])

  return (
    <section
      className="hero page-wrap"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Featured collections"
    >
      <div className="hero-frame">
        {slides.map((slide, slideIndex) => {
          const active = slideIndex === index
          return (
            <article
              key={slide.id}
              className={`hero-slide is-${slide.align} is-${slide.id}${active ? ' is-active' : ''}`}
              aria-hidden={!active}
            >
              <img src={slide.image} alt={slide.alt} width={1600} height={820} />
              <Link className="hero-copy" to={slide.href}>
                <h1>{slide.title}</h1>
                <p className="hero-lead">
                  Explore a curated collection of modern furniture designed to bring warmth, balance and simplicity into
                  your home.
                </p>
                <span className="hero-cta">{slide.cta}</span>
              </Link>
            </article>
          )
        })}
      </div>
    </section>
  )
}
