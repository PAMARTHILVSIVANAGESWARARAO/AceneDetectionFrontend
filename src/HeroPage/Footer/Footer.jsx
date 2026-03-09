import React from 'react'
import './Footer.css'

const quickLinks = [
  { label: 'Register', href: '/register' },
  { label: 'Login', href: '/login' },
]

const socialLinks = [
  { label: 'Instagram', href: '#', icon: 'bi bi-instagram' },
  { label: 'LinkedIn', href: '#', icon: 'bi bi-linkedin' },
  { label: 'Twitter', href: '#', icon: 'bi bi-twitter-x' },
  { label: 'YouTube', href: '#', icon: 'bi bi-youtube' },
]

const Footer = () => {
  return (
    <footer className='footer-gif-bg hidden! md:flex!'>
      <div className='footer-overlay bg-white/2 backdrop-blur-md p-6 rounded-lg shadow-lg'>
        <div className='footer-top'>
          <div className='footer-brand'>
            <h3>Acne Detection</h3>
            <h4 className='footer-subheading'>Thanks For Exploring Us</h4>
            <p>
              Leveraging advanced AI technology to provide accurate acne analysis,
              personalized insights, and smarter skincare decisions for healthier,
              clearer skin.
            </p>
          </div>

          <nav className='footer-links text-xl font-black ' aria-label='Quick links'>
            {quickLinks.map((link) => (
              <a key={link.label} href={link.href}>
                {link.label}
              </a>
            ))}
          </nav>

          <div className="footer-social hidden! md:flex!" aria-label="Social links">
  {socialLinks.map((link) => (
    <a key={link.label} href={link.href} aria-label={link.label}>
      <i className={link.icon} />
    </a>
  ))}
</div>
        </div>

        <div className='footer-bottom'>
          <span>
            © {new Date().getFullYear()} Acne Detection. All rights reserved.
          </span>
        </div>
      </div>
    </footer>
  )
}

export default Footer