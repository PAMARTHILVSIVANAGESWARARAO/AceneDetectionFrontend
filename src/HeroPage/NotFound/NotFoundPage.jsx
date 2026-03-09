import React, { useEffect, useRef } from "react"
import { animate, createTimeline } from "animejs"
import NotFoundImageHero from "../../assets/404.png"

const NotFoundPage = () => {
  const containerRef = useRef(null)

  useEffect(() => {
    const tl = createTimeline({ defaults: { easing: "easeOutExpo" } })

    tl.add(".digit-left",  { translateX: [-120, 0], opacity: [0, 1], duration: 900 }, 0)
    tl.add(".digit-right", { translateX: [120, 0],  opacity: [0, 1], duration: 900 }, 0)
    tl.add(".robot-wrap",  { translateY: [-60, 0],  opacity: [0, 1], duration: 1000 }, 150)
    tl.add(".tagline",     { translateY: [20, 0],   opacity: [0, 1], duration: 700 }, 600)
    tl.add(".error-title", { translateY: [16, 0],   opacity: [0, 1], duration: 700 }, 700)
    tl.add(".cta-btn",     { scale: [0.7, 1],       opacity: [0, 1], duration: 600 }, 850)

    animate(".robot-wrap", {
      translateY: [0, -14],
      direction: "alternate",
      loop: true,
      duration: 2400,
      easing: "easeInOutSine",
    })

    animate(".blob", {
      translateX: (_, i) => [0, i % 2 === 0 ? 30 : -30],
      translateY: (_, i) => [0, i % 2 === 0 ? -20 : 20],
      direction: "alternate",
      loop: true,
      duration: (_, i) => 5000 + i * 1200,
      easing: "easeInOutSine",
    })

    animate(".cta-btn", {
      boxShadow: [
        "0 0 0 0px rgba(20,184,166,0.5)",
        "0 0 0 10px rgba(20,184,166,0)"
      ],
      direction: "alternate",
      loop: true,
      duration: 1600,
      easing: "easeOutCirc",
      delay: 1200,
    })

    animate(".sparkle", {
      rotate: [0, 360],
      loop: true,
      duration: 3000,
      easing: "linear",
    })
  }, [])

  const digitStyle = {
    fontFamily: "'Nunito', 'Poppins', sans-serif",
    fontSize: "clamp(120px, 18vw, 200px)",
    fontWeight: 900,
    lineHeight: 1,
    color: "transparent",
    WebkitTextStroke: "3px rgba(13,148,136,0.18)",
    userSelect: "none",
    letterSpacing: "-4px",
  }

  return (
    <div
      ref={containerRef}
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
        background: "linear-gradient(145deg, #f0fdfa 0%, #ccfbf1 35%, #e6fffa 70%, #f0fdfa 100%)",
        fontFamily: "'Nunito', 'Poppins', sans-serif",
      }}
    >
      {/* ambient blobs */}
      {[
        { w: 340, h: 240, top: "5%",   left: "-8%",  color: "#99f6e4", op: 0.45 },
        { w: 280, h: 200, top: "60%",  right: "-5%", color: "#5eead4", op: 0.35 },
        { w: 200, h: 180, bottom: "8%",left: "20%",  color: "#a7f3d0", op: 0.40 },
        { w: 180, h: 160, top: "15%",  right: "15%", color: "#2dd4bf", op: 0.20 },
      ].map((b, i) => (
        <div key={i} className="blob" style={{
          position: "absolute", width: b.w, height: b.h,
          borderRadius: "50%", filter: "blur(60px)", opacity: b.op,
          background: b.color, top: b.top, left: b.left,
          right: b.right, bottom: b.bottom, pointerEvents: "none",
        }} />
      ))}

      {/* floating dots */}
      {[
        { size: 8,  top: "20%", left: "18%",  color: "#14b8a6" },
        { size: 5,  top: "75%", left: "12%",  color: "#2dd4bf" },
        { size: 6,  top: "30%", right: "14%", color: "#0d9488" },
        { size: 10, top: "65%", right: "20%", color: "#99f6e4" },
        { size: 4,  top: "50%", left: "6%",   color: "#5eead4" },
        { size: 7,  top: "85%", right: "8%",  color: "#14b8a6" },
      ].map((d, i) => (
        <div key={i} className="blob" style={{
          position: "absolute", width: d.size, height: d.size,
          borderRadius: "50%", background: d.color,
          top: d.top, left: d.left, right: d.right,
          opacity: 0.7, pointerEvents: "none",
        }} />
      ))}

      {/* top label */}
      <p className="error-title" style={{
        opacity: 0, fontSize: 13, fontWeight: 700,
        letterSpacing: "0.25em", textTransform: "uppercase",
        color: "#0f766e", marginBottom: 12, zIndex: 10,
      }}>
        404 Error Page
      </p>

      {/* main row: 4 | image | 4 */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        gap: "clamp(8px, 3vw, 32px)", position: "relative", zIndex: 10,
      }}>

        {/* LEFT 4 */}
        <div className="digit-left" style={{ ...digitStyle, opacity: 0 }}>4</div>

        {/* IMAGE (your 404.png) */}
        <div className="robot-wrap" style={{
          opacity: 0, display: "flex", flexDirection: "column",
          alignItems: "center", position: "relative",
        }}>
          {/* glow platform under image */}
          <div style={{
            position: "absolute", bottom: -12, width: 180, height: 30,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(20,184,166,0.3) 0%, transparent 70%)",
            filter: "blur(8px)",
          }} />

          <img
            src={NotFoundImageHero}
            alt="404 Not Found"
            style={{
              width: "clamp(180px, 22vw, 260px)",
              height: "auto",
              filter: "drop-shadow(0 24px 48px rgba(13,148,136,0.35))",
              position: "relative",
              zIndex: 1,
            }}
          />

          {/* spinning sparkle */}
          <div className="sparkle" style={{
            position: "absolute", top: 20, right: -18,
            fontSize: 20, color: "#f97316",
          }}>✦</div>
        </div>

        {/* RIGHT 4 */}
        <div className="digit-right" style={{ ...digitStyle, opacity: 0 }}>4</div>
      </div>

      {/* tagline */}
      <p className="tagline" style={{
        opacity: 0, marginTop: 20,
        fontSize: "clamp(15px, 2.5vw, 18px)",
        fontWeight: 700, color: "#0f766e",
        letterSpacing: "0.04em", zIndex: 10,
      }}>
        uh-oh! Nothing here...
      </p>

      <p style={{
        marginTop: 8, fontSize: 14, color: "#5eead4",
        letterSpacing: "0.02em", zIndex: 10,
      }}>
        Looks like this page got lost in the void.
      </p>

      {/* CTA button */}
      <button
        className="cta-btn"
        onClick={() => (window.location.href = "/")}
        onMouseEnter={e => {
          e.currentTarget.style.background = "#0f766e"
          e.currentTarget.style.transform = "scale(1.05)"
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)"
          e.currentTarget.style.transform = "scale(1)"
        }}
        style={{
          opacity: 0, marginTop: 36, padding: "14px 44px",
          borderRadius: 50, border: "none", cursor: "pointer",
          background: "linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)",
          color: "white", fontSize: 13, fontWeight: 800,
          letterSpacing: "0.18em", textTransform: "uppercase",
          transition: "background 0.25s ease, transform 0.2s ease",
          zIndex: 10, boxShadow: "0 8px 32px rgba(13,148,136,0.35)",
        }}
      >
        Go Back Home
      </button>

      {/* ring decorations */}
      <div style={{
        position: "absolute", bottom: "6%", right: "6%",
        width: 80, height: 80, borderRadius: "50%",
        border: "3px solid rgba(20,184,166,0.2)", pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", top: "8%", left: "8%",
        width: 50, height: 50, borderRadius: "50%",
        border: "2px solid rgba(20,184,166,0.15)", pointerEvents: "none",
      }} />
    </div>
  )
}

export default NotFoundPage