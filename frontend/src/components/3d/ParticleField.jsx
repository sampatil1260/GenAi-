import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 120;

/* Shared cursor state */
const cursorState = { x: 0, y: 0, targetX: 0, targetY: 0 };

function CursorListener() {
  useEffect(() => {
    const onMove = (e) => {
      cursorState.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      cursorState.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame(() => {
    cursorState.x += (cursorState.targetX - cursorState.x) * 0.04;
    cursorState.y += (cursorState.targetY - cursorState.y) * 0.04;
  });

  return null;
}

function Particles() {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
      baseX: (Math.random() - 0.5) * 16,
      baseY: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 8 - 2,
      speedX: (Math.random() - 0.5) * 0.002,
      speedY: (Math.random() - 0.5) * 0.002,
      scale: 0.02 + Math.random() * 0.04,
      // Unique per-particle float params
      floatPhase: Math.random() * Math.PI * 2,
      floatAmpX: 0.2 + Math.random() * 0.4,
      floatAmpY: 0.15 + Math.random() * 0.3,
      floatFreqX: 0.2 + Math.random() * 0.3,
      floatFreqY: 0.3 + Math.random() * 0.25,
      pulseFreq: 0.4 + Math.random() * 0.8,
    }));
  }, []);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      // Continuous drift
      p.baseX += p.speedX;
      p.baseY += p.speedY;

      // Wrap around
      if (p.baseX > 8) p.baseX = -8;
      if (p.baseX < -8) p.baseX = 8;
      if (p.baseY > 5) p.baseY = -5;
      if (p.baseY < -5) p.baseY = 5;

      // Sine/cosine floating motion (continuous)
      const floatX = Math.sin(t * p.floatFreqX + p.floatPhase) * p.floatAmpX;
      const floatY = Math.cos(t * p.floatFreqY + p.floatPhase) * p.floatAmpY;

      // Cursor influence
      const cx = cursorState.x * 0.25;
      const cy = cursorState.y * 0.25;

      // Scale pulse
      const pulse = 1 + Math.sin(t * p.pulseFreq + p.floatPhase) * 0.15;

      dummy.position.set(p.baseX + floatX + cx, p.baseY + floatY + cy, p.z);
      dummy.scale.setScalar(p.scale * pulse);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial color="#7c5cfc" transparent opacity={0.5} />
    </instancedMesh>
  );
}

/**
 * ParticleField — Instanced particle system as R3F background.
 * Continuously drifting + floating + pulsing, with cursor parallax.
 */
export default function ParticleField({ className = "" }) {
  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: false }}
      >
        <CursorListener />
        <Particles />
      </Canvas>
    </div>
  );
}
