import React, { useEffect, useRef } from "react"
import { animate, stagger, createTimeline } from "animejs"

const About = () => {
  const topOneRef = useRef(null)
  const topTwoRef = useRef(null)
  const cardRefs = useRef([])
  const heroTitleRef = useRef(null)
  const dotRefs = useRef([])
  const lineRef = useRef(null)
  const bgBlobsRef = useRef([])
  const containerRef = useRef(null)

  useEffect(() => {
    // Animate background blobs
    bgBlobsRef.current.forEach((blob, i) => {
      if (!blob) return
      animate(blob, {
        translateX: [
          { to: i % 2 === 0 ? 30 : -30 },
          { to: i % 2 === 0 ? -20 : 20 },
          { to: 0 },
        ],
        translateY: [
          { to: -20 },
          { to: 30 },
          { to: 0 },
        ],
        scale: [
          { to: 1.08 },
          { to: 0.95 },
          { to: 1 },
        ],
        duration: 8000 + i * 1200,
        easing: "easeInOutSine",
        loop: true,
        delay: i * 600,
      })
    })

    // Hero badge entrance
    if (heroTitleRef.current) {
      animate(heroTitleRef.current, {
        translateY: [-40, 0],
        opacity: [0, 1],
        duration: 800,
        easing: "easeOutExpo",
      })
    }

    // Animated timeline line
    if (lineRef.current) {
      animate(lineRef.current, {
        scaleY: [0, 1],
        opacity: [0, 1],
        duration: 1200,
        delay: 300,
        easing: "easeOutExpo",
      })
    }

    // Step dots pulse + entrance
    dotRefs.current.forEach((dot, i) => {
      if (!dot) return
      animate(dot, {
        scale: [0, 1.2, 1],
        opacity: [0, 1],
        duration: 700,
        delay: 400 + i * 250,
        easing: "easeOutBack",
      })
    })

    // Card 1 — slide from left
    if (topOneRef.current) {
      animate(topOneRef.current, {
        translateX: [-100, 0],
        opacity: [0, 1],
        duration: 900,
        delay: 500,
        easing: "easeOutExpo",
      })
    }

    // Card 2 — slide from right
    if (topTwoRef.current) {
      animate(topTwoRef.current, {
        translateX: [100, 0],
        opacity: [0, 1],
        duration: 900,
        delay: 750,
        easing: "easeOutExpo",
      })
    }

    // Bottom cards — stagger rise
    cardRefs.current.forEach((card, index) => {
      if (!card) return
      animate(card, {
        translateY: [60, 0],
        opacity: [0, 1],
        scale: [0.94, 1],
        duration: 900,
        delay: 900 + index * 180,
        easing: "easeOutExpo",
      })
    })
  }, [])

  // Hover tilt effect
  const handleCardHover = (e, entering) => {
    animate(e.currentTarget, {
      scale: entering ? 1.03 : 1,
      translateY: entering ? -6 : 0,
      duration: 350,
      easing: "easeOutExpo",
    })
  }

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #f0fdfa 0%, #f8fafc 50%, #f0f9ff 100%)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Playfair+Display:wght@700;800&display=swap');

        .card-shimmer::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(20,184,166,0.06) 0%, transparent 60%);
          border-radius: inherit;
          pointer-events: none;
        }

        .number-ring {
          position: relative;
        }
        .number-ring::after {
          content: '';
          position: absolute;
          inset: -4px;
          border-radius: 50%;
          border: 2px dashed rgba(20,184,166,0.35);
          animation: spin 12s linear infinite;
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .gradient-text {
          background: linear-gradient(135deg, #0f766e, #14b8a6, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .glow-border {
          box-shadow: 0 0 0 1px rgba(20,184,166,0.2), 0 4px 24px rgba(20,184,166,0.08), 0 1px 3px rgba(0,0,0,0.06);
        }

        .bottom-card-number {
          position: absolute;
          top: -18px;
          left: 20px;
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #0f766e, #14b8a6);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 4px 14px rgba(20,184,166,0.45);
          z-index: 10;
        }

        @media (max-width: 768px) {
          .step-row { flex-direction: column !important; }
          .step-row-reverse { flex-direction: column !important; }
          .step-number { align-self: flex-start !important; }
        }
      
      `}</style>

      {/* Ambient blobs */}
      {[
        { top: "-8%", left: "-6%", w: 420, h: 420, color: "rgba(20,184,166,0.12)" },
        { top: "30%", right: "-5%", w: 360, h: 360, color: "rgba(14,165,233,0.1)" },
        { bottom: "5%", left: "20%", w: 300, h: 300, color: "rgba(15,118,110,0.08)" },
      ].map((b, i) => (
        <div
          key={i}
          ref={(el) => (bgBlobsRef.current[i] = el)}
          style={{
            position: "absolute",
            top: b.top,
            left: b.left,
            right: b.right,
            bottom: b.bottom,
            width: b.w,
            height: b.h,
            borderRadius: "50%",
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            filter: "blur(40px)",
            pointerEvents: "none",
          }}
        />
      ))}

      {/* Subtle dot-grid overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(20,184,166,0.15) 1px, transparent 1px)",
          backgroundSize: "32px 32px",
          pointerEvents: "none",
          opacity: 0.6,
        }}
      />

      <div className="relative w-full max-w-5xl mx-auto px-8 py-20">

        {/* Hero badge */}
        <div
          ref={heroTitleRef}
          style={{ opacity: 0, textAlign: "center", marginBottom: "64px" }}
        >
          <span
            style={{
              display: "inline-block",
              background: "rgba(20,184,166,0.1)",
              border: "1px solid rgba(20,184,166,0.3)",
              borderRadius: "999px",
              padding: "6px 20px",
              fontSize: "12px",
              fontWeight: 600,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: "#0f766e",
              marginBottom: "18px",
            }}
          >
            How It Works
          </span>
          <h1
            className="gradient-text"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: "clamp(2rem, 4vw, 3.2rem)",
              fontWeight: 800,
              lineHeight: 1.15,
              margin: 0,
            }}
          >
            Intelligent Skincare,<br />Beautifully Personalized
          </h1>
        </div>

        {/* Step 1 */}
        <div className="flex flex-wrap items-center gap-6 mb-8">
          <div
            ref={(el) => (dotRefs.current[0] = el)}
            className="number-ring"
            style={{
              opacity: 0,
              minWidth: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0f766e, #14b8a6)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 700,
              boxShadow: "0 8px 24px rgba(20,184,166,0.35)",
              flexShrink: 0,
            }}
          >
            1
          </div>

          <div
            ref={topOneRef}
            className="card-shimmer glow-border"
            style={{
              opacity: 0,
              position: "relative",
              flex: 1,
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(12px)",
              borderRadius: 18,
              padding: "22px 30px",
              border: "1px solid rgba(20,184,166,0.25)",
              cursor: "default",
            }}
            onMouseEnter={(e) => handleCardHover(e, true)}
            onMouseLeave={(e) => handleCardHover(e, false)}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#14b8a6", marginBottom: 8 }}>Overview</div>
            <p style={{ margin: 0, color: "#334155", fontSize: 15.5, lineHeight: 1.7 }}>
              AcneAI is an intelligent dermatology-focused platform that provides AI-powered acne severity analysis and personalized treatment guidance.
            </p>
          </div>
        </div>

        {/* Connector line */}
        <div style={{ display: "flex", justifyContent: "flex-start", paddingLeft: 27, marginBottom: 8 }}>
          <div
            ref={lineRef}
            style={{
              opacity: 0,
              width: 2,
              height: 40,
              background: "linear-gradient(to bottom, #14b8a6, #0ea5e9)",
              borderRadius: 4,
              transformOrigin: "top center",
            }}
          />
        </div>

        {/* Step 2 */}
        <div className="flex flex-wrap items-center justify-end gap-6 mb-14">
          <div
            ref={topTwoRef}
            className="card-shimmer glow-border"
            style={{
              opacity: 0,
              position: "relative",
              flex: 1,
              background: "rgba(255,255,255,0.85)",
              backdropFilter: "blur(12px)",
              borderRadius: 18,
              padding: "22px 30px",
              border: "1px solid rgba(20,184,166,0.25)",
              cursor: "default",
            }}
            onMouseEnter={(e) => handleCardHover(e, true)}
            onMouseLeave={(e) => handleCardHover(e, false)}
          >
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#14b8a6", marginBottom: 8 }}>Our System</div>
            <p style={{ margin: 0, color: "#334155", fontSize: 15.5, lineHeight: 1.7 }}>
              Our system combines secure authentication, machine learning image analysis, and adaptive daily treatment plans to create a complete digital skincare journey.
            </p>
          </div>

          <div
            ref={(el) => (dotRefs.current[1] = el)}
            className="number-ring"
            style={{
              opacity: 0,
              minWidth: 56,
              height: 56,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #0f766e, #14b8a6)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 700,
              boxShadow: "0 8px 24px rgba(20,184,166,0.35)",
              flexShrink: 0,
            }}
          >
            2
          </div>
        </div>

        {/* Section label */}
        <div style={{ textAlign: "center", marginBottom: 36 }}>
          <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#94a3b8" }}>
            The Journey
          </span>
        </div>

        {/* Bottom cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-2">
          {[
            {
              num: 3,
              label: "Analysis",
              icon: "🔬",
              text: "Users complete a detailed health questionnaire and upload acne images to receive accurate severity evaluation.",
            },
            {
              num: 4,
              label: "Treatment",
              icon: "💊",
              text: "Treatment plans are generated based on individual skin type, severity level, and daily feedback from the user.",
            },
            {
              num: 5,
              label: "Adaptation",
              icon: "📈",
              text: "The platform continuously adapts routines to ensure safe, structured, and progressive skincare improvement.",
            },
          ].map((item, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              className="card-shimmer"
              style={{
                opacity: 0,
                position: "relative",
                background: "rgba(255,255,255,0.88)",
                backdropFilter: "blur(14px)",
                borderRadius: 20,
                padding: "36px 24px 24px",
                border: "1px solid rgba(20,184,166,0.2)",
                boxShadow: "0 4px 32px rgba(20,184,166,0.08), 0 1px 4px rgba(0,0,0,0.05)",
                cursor: "default",
                overflow: "visible",
                marginTop: 12,
              }}
              onMouseEnter={(e) => handleCardHover(e, true)}
              onMouseLeave={(e) => handleCardHover(e, false)}
            >
              {/* Accent top bar */}
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, #0f766e, #14b8a6, #0ea5e9)`,
                  borderRadius: "20px 20px 0 0",
                  overflow: "hidden",
                }}
              />

              <div className="bottom-card-number">{item.num}</div>

              <div style={{ marginTop: 16, marginBottom: 10, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 22 }}>{item.icon}</span>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#14b8a6" }}>
                  {item.label}
                </span>
              </div>

              <p style={{ margin: 0, color: "#475569", fontSize: 14.5, lineHeight: 1.75 }}>
                {item.text}
              </p>

              {/* Corner decoration */}
              <div
                style={{
                  position: "absolute",
                  bottom: -16,
                  right: -16,
                  width: 64,
                  height: 64,
                  borderRadius: "50%",
                  background: "rgba(20,184,166,0.07)",
                }}
              />
            </div>
          ))}
        </div>

        {/* Footer strip */}
        <div
          style={{
            marginTop: 60,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 8,
            opacity: 0.5,
          }}
        >
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              style={{
                width: i === 2 ? 24 : 6,
                height: 6,
                borderRadius: 999,
                background: "#14b8a6",
                transition: "width 0.3s",
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export default About