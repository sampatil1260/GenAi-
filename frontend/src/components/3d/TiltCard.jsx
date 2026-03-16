import React, { useRef, useCallback } from "react";
import { gsap } from "gsap";

/**
 * TiltCard — 3D hover tilt effect with GSAP.
 * Wraps any children in a perspective container that tilts toward the cursor.
 *
 * Props:
 *  - tiltIntensity (number, default 12) — max tilt angle in degrees
 *  - glowColor (string, default "rgba(124,92,252,0.4)") — glow border color
 *  - className — additional classes
 *  - children
 */
export default function TiltCard({
  children,
  tiltIntensity = 12,
  glowColor = "rgba(124,92,252,0.4)",
  className = "",
  ...props
}) {
  const cardRef = useRef(null);
  const glowRef = useRef(null);

  const handleMouseMove = useCallback(
    (e) => {
      const card = cardRef.current;
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -tiltIntensity;
      const rotateY = ((x - centerX) / centerX) * tiltIntensity;

      gsap.to(card, {
        rotateX,
        rotateY,
        transformPerspective: 800,
        duration: 0.4,
        ease: "power2.out",
      });

      // Move glow highlight
      if (glowRef.current) {
        gsap.to(glowRef.current, {
          x: x - rect.width / 2,
          y: y - rect.height / 2,
          duration: 0.3,
          ease: "power2.out",
        });
      }
    },
    [tiltIntensity]
  );

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    gsap.to(card, {
      rotateX: 0,
      rotateY: 0,
      duration: 0.6,
      ease: "elastic.out(1, 0.5)",
    });
  }, []);

  return (
    <div
      className={`tilt-card-wrapper ${className}`}
      style={{ perspective: "800px" }}
      {...props}
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="tilt-card-inner relative"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {/* Glow highlight that follows cursor inside card */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute inset-0 z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle 200px, ${glowColor}, transparent)`,
            borderRadius: "inherit",
            filter: "blur(40px)",
          }}
        />
        {/* Glowing border effect */}
        <div
          className="pointer-events-none absolute -inset-px rounded-[inherit] z-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: `linear-gradient(135deg, ${glowColor}, transparent 50%, ${glowColor})`,
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMaskComposite: "xor",
            padding: "1px",
          }}
        />
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
