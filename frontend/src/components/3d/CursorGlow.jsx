import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * CursorGlow — a radial glow that follows the cursor across the page.
 * Now includes a continuous idle animation (gentle orbit) so the glow
 * is always alive, even when the cursor isn't moving.
 *
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
  const cursorPos = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const animationRef = useRef(null);

  useEffect(() => {
    // Track cursor position
    const handleMouseMove = (e) => {
      cursorPos.current.x = e.clientX;
      cursorPos.current.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Continuous animation loop — always running
    let startTime = Date.now();
    const animate = () => {
      if (!glowRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const t = (Date.now() - startTime) / 1000;

      // Continuous idle orbit (subtle circular motion around cursor)
      const idleX = Math.sin(t * 0.5) * 30;
      const idleY = Math.cos(t * 0.3) * 20;
      // Gentle pulse in size
      const pulse = 1 + Math.sin(t * 0.8) * 0.05;

      const targetX = cursorPos.current.x - size / 2 + idleX;
      const targetY = cursorPos.current.y - size / 2 + idleY;

      gsap.to(glowRef.current, {
        x: targetX,
        y: targetY,
        scale: pulse,
        duration: 0.8,
        ease: "power2.out",
        overwrite: "auto",
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
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
