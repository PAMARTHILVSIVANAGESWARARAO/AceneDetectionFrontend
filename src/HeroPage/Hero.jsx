import React, { useEffect, useRef, useState } from "react";
import { animate } from "animejs";
import Home from "./Home/Home";
import About from "./About/About";
import Analytics from "./Analytics/Analytics";
import Contact from "./Contact/Contact";
import Footer from "./Footer/Footer";
const Hero = () => {
  const [active, setActive] = useState("home");
  const underlineRef = useRef(null);
  const navRefs = useRef({});
  const titleUnderline1 = useRef(null);
  const titleUnderline2 = useRef(null);

  const handleNavClick = (section) => (event) => {
    event.preventDefault();
    setActive(section);
  };

  useEffect(() => {
    const current = navRefs.current[active];
    const underline = underlineRef.current;

    if (current && underline) {
      const { offsetLeft, offsetWidth } = current;

      animate(underline, {
        left: offsetLeft,
        width: offsetWidth,
        duration: 500,
        easing: "easeInOutQuad"
      });
    }

    if (titleUnderline1.current && titleUnderline2.current) {
      animate(titleUnderline1.current, {
        width: [0, 75],
        easing: "easeOutExpo",
        duration: 600
      });
      animate(titleUnderline2.current, {
        width: [0, 35],
        delay: 100,
        easing: "easeOutExpo",
        duration: 600
      });
    }
  }, [active]);

  const getTitle = () => {
    if (active === "home") return "AcnePilot";
    if (active === "about") return "About Us";
    if (active === "analytics") return "Analytics";
    if (active === "contact") return "Contact Us";
    
    return "Logo";
  };

  const renderActiveSection = () => {
    if (active === "home") {
      return (
        <section id="home" className="min-h-screen flex items-center justify-center lg:pb-0">
          <Home />
        </section>
      );
    }

    if (active === "about") {
      return (
        <section id="about" className="min-h-screen flex items-center justify-center lg:pb-0">
          <About />
        </section>
      );
    }

    if (active === "analytics") {
      return (
        <section
          id="analytics"
          className="min-h-screen flex items-center justify-center lg:pb-0"
        >
          <Analytics />
        </section>
      );
    }

    return (
      <section
        id="contact"
        className="min-h-screen flex items-center justify-center lg:pb-0"
      >
        <Contact/>
      </section>
    );
  };

  return (
    <div className="m-0 p-0 h-screen  relative">

      {/* ================= DESKTOP NAVBAR ================= */}
      <nav className="hidden lg:block fixed top-0 left-0 w-full z-50 bg-transparent">
        <div className="relative flex justify-between items-center px-10 py-6">
          <div className="relative inline-block">
            <h1 className="title">
              {getTitle()}
            </h1>

            <span
              ref={titleUnderline1}
              className="absolute left-0 top-full h-1 bg-[#00BBA7] rounded-sm"
              style={{ width: "70%" }}
            />
            <span
              ref={titleUnderline2}
              className="absolute left-0 top-full mt-2 h-1 bg-[#00BBA7] rounded-sm"
              style={{ width: "35%" }}
            />
          </div>

          <div className="relative">
            <ul className="flex gap-10 text-lg font-semibold relative">
              <li>
                <a
                  href="#home"
                  onClick={handleNavClick("home")}
                  ref={(el) => (navRefs.current.home = el)}
                  className="hover:text-teal-700 transition-colors duration-300"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={handleNavClick("about")}
                  ref={(el) => (navRefs.current.about = el)}
                  className="hover:text-teal-500 transition-colors duration-300"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#analytics"
                  onClick={handleNavClick("analytics")}
                  ref={(el) => (navRefs.current.analytics = el)}
                  className="hover:text-teal-500 transition-colors duration-300"
                >
                  Analytics
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  onClick={handleNavClick("contact")}
                  ref={(el) => (navRefs.current.contact = el)}
                  className="hover:text-teal-500 transition-colors duration-300"
                >
                  Contact Us
                </a>
              </li>
            </ul>

            <span
              ref={underlineRef}
              className="absolute -bottom-1 h-0.5 bg-teal-500"
              style={{ left: 0, width: 0 }}
            />
          </div>
        </div>
      </nav>

      {/* ================= MOBILE / TABLET BOTTOM BAR ================= */}
      <nav
        style={{
          background:
            "linear-gradient(135deg, #0f766e 0%, #0d9488 50%, #14b8a6 100%)",
          boxShadow:
            "0 -2px 20px rgba(13, 148, 136, 0.4), 0 8px 32px rgba(15, 118, 110, 0.5), inset 0 1px 0 rgba(255,255,255,0.2)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          border: "1px solid rgba(94, 234, 212, 0.25)",
        }}
        className="lg:hidden fixed bottom-3 left-1/2 -translate-x-1/2 w-[86%] max-w-xs rounded-2xl px-1.5 py-1 z-50"
      >
  <ul className="flex justify-between items-center">

    {/* HOME */}
    <li className="flex-1 flex justify-center">
      <a
        href="#home"
        onClick={handleNavClick("home")}
        style={active === "home" ? {
          background: "linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)",
          boxShadow: "0 2px 12px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.8)"
        } : {}}
        className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
          active === "home" ? "text-teal-700 scale-105" : "text-white/85 hover:text-white hover:bg-white/10"
        }`}
      >
        <i className="bi bi-house-door-fill text-base"></i>
        <span className="text-[10px] font-semibold tracking-wide">Home</span>
      </a>
    </li>

    {/* ABOUT */}
    <li className="flex-1 flex justify-center">
      <a
        href="#about"
        onClick={handleNavClick("about")}
        style={active === "about" ? {
          background: "linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)",
          boxShadow: "0 2px 12px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.8)"
        } : {}}
        className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
          active === "about" ? "text-teal-700 scale-105" : "text-white/85 hover:text-white hover:bg-white/10"
        }`}
      >
        <i className="bi bi-person-fill text-base"></i>
        <span className="text-[10px] font-semibold tracking-wide">About</span>
      </a>
    </li>

    {/* ANALYTICS */}
    <li className="flex-1 flex justify-center">
      <a
        href="#analytics"
        onClick={handleNavClick("analytics")}
        style={active === "analytics" ? {
          background: "linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)",
          boxShadow: "0 2px 12px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.8)"
        } : {}}
        className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
          active === "analytics" ? "text-teal-700 scale-105" : "text-white/85 hover:text-white hover:bg-white/10"
        }`}
      >
        <i className="bi bi-bar-chart-fill text-base"></i>
        <span className="text-[10px] font-semibold tracking-wide">Analytics</span>
      </a>
    </li>

    {/* CONTACT */}
    <li className="flex-1 flex justify-center">
      <a
        href="#contact"
        onClick={handleNavClick("contact")}
        style={active === "contact" ? {
          background: "linear-gradient(135deg, #ffffff 0%, #f0fdfa 100%)",
          boxShadow: "0 2px 12px rgba(255,255,255,0.3), inset 0 1px 0 rgba(255,255,255,0.8)"
        } : {}}
        className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-300 ${
          active === "contact" ? "text-teal-700 scale-105" : "text-white/85 hover:text-white hover:bg-white/10"
        }`}
      >
        <i className="bi bi-envelope-fill text-base"></i>
        <span className="text-[10px] font-semibold tracking-wide">Contact</span>
      </a>
    </li>

  </ul>
</nav>

      {renderActiveSection()}
      <Footer />
    </div>
  );
};

export default Hero;
