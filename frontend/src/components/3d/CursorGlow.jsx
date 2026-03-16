import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * CursorGlow — a radial glow that follows the cursor across the page.
 * Props:
 *  - size (number) — diameter in px (default 500)
 *  - color (string) — glow color (default "rgba(124,92,252,0.12)")
 *  - className — extra classes on the container
 */
export default function CursorGlow({
  size = 500,
  color = "rgba(124,92,252,0.12)",
  className = "",
}) {
  const glowRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!glowRef.current) return;
      gsap.to(glowRef.current, {
        x: e.clientX - size / 2,
        y: e.clientY - size / 2,
        duration: 0.6,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [size]);

  return (
    <div
      ref={glowRef}
      className={`fixed top-0 left-0 pointer-events-none z-50 mix-blend-screen ${className}`}
      style={{
        width: size,
        height: size,
        background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
        borderRadius: "50%",
        willChange: "transform",
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}
