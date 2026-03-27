import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

/**
 * ParallaxLayer — shifts children based on a combination of:
 *   1. Continuous idle sway (sine/cosine) — always running
 *   2. Cursor position — secondary influence when moving
 *
 * Props:
 *  - depth (number, default 20) — max shift in px
 *  - className — extra classes
 *  - children
 */
export default function ParallaxLayer({ depth = 20, className = "", children }) {
  const layerRef = useRef(null);
  const [enabled, setEnabled] = useState(true);
  const cursorOffset = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);

  // Disable on mobile / touch devices
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setEnabled(!mq.matches);
    const handler = (e) => setEnabled(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Track cursor for secondary influence
    const handleMouseMove = (e) => {
      cursorOffset.current.x = (e.clientX / window.innerWidth - 0.5) * depth * 2;
      cursorOffset.current.y = (e.clientY / window.innerHeight - 0.5) * depth * 2;
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Continuous animation loop
    const startTime = Date.now();
    const animate = () => {
      if (!layerRef.current) {
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      const t = (Date.now() - startTime) / 1000;

      // Continuous idle sway
      const idleX = Math.sin(t * 0.2) * depth * 0.3;
      const idleY = Math.cos(t * 0.15) * depth * 0.25;

      // Combine idle motion with cursor influence
      const finalX = idleX + cursorOffset.current.x * 0.6;
      const finalY = idleY + cursorOffset.current.y * 0.6;

      gsap.to(layerRef.current, {
        x: finalX,
        y: finalY,
        duration: 1.0,
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
  }, [depth, enabled]);

  return (
    <div ref={layerRef} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
