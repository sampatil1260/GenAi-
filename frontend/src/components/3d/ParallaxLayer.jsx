import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";

/**
 * ParallaxLayer — shifts children based on mouse position for depth effect.
 * Props:
 *  - depth (number, default 20) — max shift in px
 *  - className — extra classes
 *  - children
 */
export default function ParallaxLayer({ depth = 20, className = "", children }) {
  const layerRef = useRef(null);
  const [enabled, setEnabled] = useState(true);

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

    const handleMouseMove = (e) => {
      if (!layerRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * depth * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * depth * 2;
      gsap.to(layerRef.current, {
        x,
        y,
        duration: 0.8,
        ease: "power2.out",
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [depth, enabled]);

  return (
    <div ref={layerRef} className={className} style={{ willChange: "transform" }}>
      {children}
    </div>
  );
}
