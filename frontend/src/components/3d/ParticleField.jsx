import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 120;

function Particles() {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(() => {
    return Array.from({ length: PARTICLE_COUNT }, () => ({
      x: (Math.random() - 0.5) * 16,
      y: (Math.random() - 0.5) * 10,
      z: (Math.random() - 0.5) * 8 - 2,
      speedX: (Math.random() - 0.5) * 0.002,
      speedY: (Math.random() - 0.5) * 0.002,
      scale: 0.02 + Math.random() * 0.04,
    }));
  }, []);

  useFrame(() => {
    if (!meshRef.current) return;
    particles.forEach((p, i) => {
      p.x += p.speedX;
      p.y += p.speedY;

      // Wrap around
      if (p.x > 8) p.x = -8;
      if (p.x < -8) p.x = 8;
      if (p.y > 5) p.y = -5;
      if (p.y < -5) p.y = 5;

      dummy.position.set(p.x, p.y, p.z);
      dummy.scale.setScalar(p.scale);
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
 * Renders slowly drifting luminous particles.
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
        <Particles />
      </Canvas>
    </div>
  );
}
