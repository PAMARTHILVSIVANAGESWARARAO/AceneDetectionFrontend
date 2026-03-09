import { useEffect, useRef } from "react";

export default function ElegantTealWave() {
  const topWaveRef = useRef(null);
  const middleWaveRef = useRef(null);
  const bottomWaveRef = useRef(null);
  const highlightWaveRef = useRef(null);
  const lineWaveRef = useRef(null);
  const bottomLineWaveRef = useRef(null);

  useEffect(() => {
    const width = 1200;
    let offset = 0;
    let animationFrameId;

    function animate() {
      const amplitude = 50;
      const frequency = 0.006;
      const baseHeight = 300;
      const stripThickness = 35;

      let topPath = `M0 ${baseHeight}`;
      let middlePath = `M0 ${baseHeight + stripThickness * 0.7}`;
      let bottomPath = `M0 ${baseHeight + stripThickness * 1.4}`;
      let highlightPath = `M0 ${baseHeight - 10}`;
      let linePath = `M0 ${baseHeight}`;
      let bottomLinePath = `M0 ${baseHeight + stripThickness * 1.4}`;

      for (let x = 0; x <= width; x += 12) {
        const slope = x * 0.6 - 280;
        const wave1 = Math.sin(x * frequency + offset) * amplitude;
        const wave2 = Math.cos(x * frequency * 1.2 + offset * 1.3) * amplitude * 0.4;
        
        const y = baseHeight + wave1 + wave2 + slope * 0.25;
        const y2 = y + stripThickness * 0.7 + wave2 * 0.3;
        const y3 = y2 + stripThickness * 0.7 + wave1 * 0.2;
        const yHighlight = y - 12 + wave1 * 0.3;

        topPath += ` L${x} ${y}`;
        middlePath += ` L${x} ${y2}`;
        bottomPath += ` L${x} ${y3}`;
        highlightPath += ` L${x} ${yHighlight}`;
        linePath += ` L${x} ${y}`;
        bottomLinePath += ` L${x} ${y3}`;
      }

      topPath += ` L${width} 0 L0 0 Z`;
      middlePath += ` L${width} 0 L0 0 Z`;
      bottomPath += ` L${width} 0 L0 0 Z`;
      highlightPath += ` L${width} 0 L0 0 Z`;

      if (topWaveRef.current) topWaveRef.current.setAttribute("d", topPath);
      if (middleWaveRef.current) middleWaveRef.current.setAttribute("d", middlePath);
      if (bottomWaveRef.current) bottomWaveRef.current.setAttribute("d", bottomPath);
      if (highlightWaveRef.current) highlightWaveRef.current.setAttribute("d", highlightPath);
      if (lineWaveRef.current) lineWaveRef.current.setAttribute("d", linePath);
      if (bottomLineWaveRef.current) bottomLineWaveRef.current.setAttribute("d", bottomLinePath);

      offset += 0.005;
      animationFrameId = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="w-screen h-screen overflow-hidden bg-linear-to-b from-[#F8FAFB] via-white to-[#F0F7FA]">
      <svg
        viewBox="0 0 1200 600"
        preserveAspectRatio="none"
        className="absolute w-full h-full"
      >
        <defs>
          {/* Primary teal gradient - Light to medium */}
          <linearGradient id="primaryTeal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="40%" stopColor="#E0F2F1" stopOpacity="0.85" />
            <stop offset="80%" stopColor="#B2DFDB" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#80CBC4" stopOpacity="0.6" />
          </linearGradient>

          {/* Soft wave gradient - Ethereal effect */}
          <linearGradient id="softTeal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#E0F2F1" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#B2DFDB" stopOpacity="0.3" />
          </linearGradient>

          {/* Highlight gradient - Pure brightness */}
          <linearGradient id="highlightTeal" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#E0F2F1" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#B2DFDB" stopOpacity="0.4" />
          </linearGradient>

          {/* Shimmer gradient */}
          <linearGradient id="shimmerEffect" x1="0%" y1="0%" x2="100%" y2="0%" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0">
              <animate attributeName="offset" values="0;1;0" dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.6">
              <animate attributeName="offset" values="0.5;1.5;0.5" dur="8s" repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0">
              <animate attributeName="offset" values="1;2;1" dur="8s" repeatCount="indefinite" />
            </stop>
          </linearGradient>

          {/* Radial glow */}
          <radialGradient id="radialGlow" cx="50%" cy="30%" r="70%" fx="50%" fy="30%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.4" />
            <stop offset="70%" stopColor="#B2DFDB" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#80CBC4" stopOpacity="0.1" />
          </radialGradient>

          {/* Soft blur filter */}
          <filter id="gentleBlur">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Background radial glow */}
        <rect width="1200" height="600" fill="url(#radialGlow)" />

        {/* Bottom wave - Softest layer */}
        <path
          ref={bottomWaveRef}
          fill="url(#softTeal)"
          fillOpacity="0.5"
          filter="url(#gentleBlur)"
        />
        
        {/* Middle wave - Primary gradient */}
        <path
          ref={middleWaveRef}
          fill="url(#primaryTeal)"
          fillOpacity="0.7"
        />
        
        {/* Top wave - Bright and crisp */}
        <path
          ref={topWaveRef}
          fill="url(#primaryTeal)"
          fillOpacity="0.9"
        />
        
        {/* Highlight wave - Extra brightness */}
        <path
          ref={highlightWaveRef}
          fill="url(#highlightTeal)"
          fillOpacity="0.4"
          filter="url(#gentleBlur)"
        />

        {/* Shimmer overlay */}
        <path
          ref={topWaveRef}
          fill="url(#shimmerEffect)"
          fillOpacity="0.3"
          style={{ mixBlendMode: "overlay" }}
        />
        
        {/* Main accent line - Bright white */}
        <path
          ref={lineWaveRef}
          fill="none"
          stroke="url(#highlightTeal)"
          strokeWidth="2"
          strokeOpacity="0.7"
          filter="url(#gentleBlur)"
        />
        
        {/* Secondary line - Soft teal */}
        <path
          ref={bottomLineWaveRef}
          fill="none"
          stroke="#B2DFDB"
          strokeWidth="1.5"
          strokeOpacity="0.5"
          strokeDasharray="6 6"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="0;20"
            dur="3s"
            repeatCount="indefinite"
          />
        </path>

        {/* Floating particles */}
        <g opacity="0.3">
          <circle cx="300" cy="200" r="2" fill="#FFFFFF">
            <animate attributeName="cy" values="200;190;200" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.3;0.6;0.3" dur="4s" repeatCount="indefinite" />
          </circle>
          <circle cx="600" cy="250" r="3" fill="#E0F2F1">
            <animate attributeName="cy" values="250;240;250" dur="5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.5;0.2" dur="5s" repeatCount="indefinite" />
          </circle>
          <circle cx="900" cy="180" r="2" fill="#B2DFDB">
            <animate attributeName="cy" values="180;170;180" dur="4.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.2;0.4;0.2" dur="4.5s" repeatCount="indefinite" />
          </circle>
        </g>
      </svg>
    </div>
  );
}