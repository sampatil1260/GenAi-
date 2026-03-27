import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* ────────────────────────────────────────────────────────────────
   Shared cursor tracking — stores normalized mouse position
   used by all sub-components for cursor influence
   ──────────────────────────────────────────────────────────────── */
const mouseState = { x: 0, y: 0, targetX: 0, targetY: 0 };

function CursorTracker() {
  useEffect(() => {
    const handleMouseMove = (e) => {
      mouseState.targetX = (e.clientX / window.innerWidth) * 2 - 1;
      mouseState.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Smoothly interpolate toward target each frame
  useFrame(() => {
    mouseState.x += (mouseState.targetX - mouseState.x) * 0.05;
    mouseState.y += (mouseState.targetY - mouseState.y) * 0.05;
  });

  return null;
}

/* ────────────────────────────────────────────────────────────────
   Particles – continuously drifting spheres with sine-wave float
   + cursor repulsion influence
   ──────────────────────────────────────────────────────────────── */
const PARTICLE_COUNT = 80;

function ParticleSystem() {
  const meshRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);

  const particles = useMemo(
    () =>
      Array.from({ length: PARTICLE_COUNT }, (_, i) => ({
        baseX: (Math.random() - 0.5) * 14,
        baseY: (Math.random() - 0.5) * 10,
        z: (Math.random() - 0.5) * 6 - 2,
        speedX: (Math.random() - 0.5) * 0.003,
        speedY: (Math.random() - 0.5) * 0.003,
        scale: 0.015 + Math.random() * 0.04,
        // Unique per-particle oscillation parameters
        floatPhase: Math.random() * Math.PI * 2,
        floatAmpX: 0.3 + Math.random() * 0.5,
        floatAmpY: 0.2 + Math.random() * 0.4,
        floatFreqX: 0.3 + Math.random() * 0.4,
        floatFreqY: 0.4 + Math.random() * 0.3,
        pulseFreq: 0.5 + Math.random() * 1.0,
      })),
    []
  );

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    particles.forEach((p, i) => {
      // Continuous drift
      p.baseX += p.speedX;
      p.baseY += p.speedY;

      // Wrap around
      if (p.baseX > 7) p.baseX = -7;
      if (p.baseX < -7) p.baseX = 7;
      if (p.baseY > 5) p.baseY = -5;
      if (p.baseY < -5) p.baseY = 5;

      // Sine/cosine floating motion
      const floatX = Math.sin(t * p.floatFreqX + p.floatPhase) * p.floatAmpX;
      const floatY = Math.cos(t * p.floatFreqY + p.floatPhase) * p.floatAmpY;

      // Cursor influence — subtle push away from cursor
      const cursorInfluenceX = mouseState.x * 0.3;
      const cursorInfluenceY = mouseState.y * 0.3;

      const finalX = p.baseX + floatX + cursorInfluenceX;
      const finalY = p.baseY + floatY + cursorInfluenceY;

      // Subtle pulse scale
      const pulse = 1 + Math.sin(t * p.pulseFreq + p.floatPhase) * 0.15;

      dummy.position.set(finalX, finalY, p.z);
      dummy.scale.setScalar(p.scale * pulse);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, PARTICLE_COUNT]}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshBasicMaterial color="#7c5cfc" transparent opacity={0.35} />
    </instancedMesh>
  );
}

/* ────────────────────────────────────────────────────────────────
   Grid – continuously rotating 3D network + cursor tilt influence
   ──────────────────────────────────────────────────────────────── */
function AnimatedGrid() {
  const groupRef = useRef();

  useFrame(({ clock }) => {
    if (!groupRef.current) return;
    const t = clock.getElapsedTime();

    // Continuous rotation (always running)
    const baseRotX = Math.sin(t * 0.15) * 0.12;
    const baseRotY = t * 0.06;
    const baseRotZ = Math.cos(t * 0.1) * 0.04;

    // Cursor tilt influence (secondary layer)
    const cursorTiltX = mouseState.y * 0.08;
    const cursorTiltY = mouseState.x * 0.08;

    groupRef.current.rotation.x = baseRotX + cursorTiltX;
    groupRef.current.rotation.y = baseRotY + cursorTiltY;
    groupRef.current.rotation.z = baseRotZ;

    // Subtle breathing scale
    const breathe = 1 + Math.sin(t * 0.3) * 0.02;
    groupRef.current.scale.setScalar(breathe);
  });

  const lines = useMemo(() => {
    const result = [];
    const size = 8;
    const divisions = 12;
    const step = (size * 2) / divisions;
    const color = new THREE.Color("#7c5cfc");

    for (let i = 0; i <= divisions; i++) {
      const pos = -size + i * step;
      const xPoints = [new THREE.Vector3(pos, -size, 0), new THREE.Vector3(pos, size, 0)];
      result.push({ points: xPoints, color, key: `x${i}` });
      const yPoints = [new THREE.Vector3(-size, pos, 0), new THREE.Vector3(size, pos, 0)];
      result.push({ points: yPoints, color, key: `y${i}` });
    }
    return result;
  }, []);

  const nodes = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        pos: [
          (Math.random() - 0.5) * 12,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 3,
        ],
        floatSpeed: 0.5 + Math.random(),
        key: i,
      })),
    []
  );

  return (
    <group ref={groupRef} position={[0, 0, -3]}>
      {lines.map(({ points, color, key }) => (
        <line key={key}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={new Float32Array(points.flatMap((p) => [p.x, p.y, p.z]))}
              itemSize={3}
            />
          </bufferGeometry>
          <lineBasicMaterial color={color} transparent opacity={0.12} />
        </line>
      ))}
      {nodes.map((n) => (
        <Float key={n.key} speed={n.floatSpeed} floatIntensity={0.3}>
          <mesh position={n.pos}>
            <sphereGeometry args={[0.04, 6, 6]} />
            <meshBasicMaterial color="#38bdf8" transparent opacity={0.5} />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

/* ────────────────────────────────────────────────────────────────
   Gradient Blobs – continuously orbiting + cursor push
   ──────────────────────────────────────────────────────────────── */
function GradientBlobs() {
  const blob1 = useRef();
  const blob2 = useRef();
  const blob3 = useRef();

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    // Cursor influence offset
    const cx = mouseState.x * 0.4;
    const cy = mouseState.y * 0.4;

    if (blob1.current) {
      blob1.current.position.x = Math.sin(t * 0.3) * 2 + cx;
      blob1.current.position.y = Math.cos(t * 0.2) * 1.5 + cy;
      blob1.current.scale.setScalar(1 + Math.sin(t * 0.5) * 0.08);
    }
    if (blob2.current) {
      blob2.current.position.x = Math.cos(t * 0.25) * 2.5 - cx * 0.5;
      blob2.current.position.y = Math.sin(t * 0.35) * 1 - cy * 0.5;
      blob2.current.scale.setScalar(1 + Math.cos(t * 0.4) * 0.06);
    }
    if (blob3.current) {
      blob3.current.position.x = Math.sin(t * 0.2) * 1.5 + cx * 0.3;
      blob3.current.position.y = Math.cos(t * 0.3) * 2 + cy * 0.3;
      blob3.current.scale.setScalar(1 + Math.sin(t * 0.6 + 1) * 0.07);
    }
  });

  return (
    <group>
      <mesh ref={blob1} position={[-2, 1, -3]}>
        <sphereGeometry args={[1.5, 16, 16]} />
        <meshBasicMaterial color="#7c5cfc" transparent opacity={0.06} />
      </mesh>
      <mesh ref={blob2} position={[2, -1, -4]}>
        <sphereGeometry args={[1.2, 16, 16]} />
        <meshBasicMaterial color="#38bdf8" transparent opacity={0.05} />
      </mesh>
      <mesh ref={blob3} position={[0, 0, -3.5]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial color="#c084fc" transparent opacity={0.05} />
      </mesh>
    </group>
  );
}

/* ────────────────────────────────────────────────────────────────
   AnimatedBackground — main export
   variant: "particles" | "grid" | "gradient"
   ──────────────────────────────────────────────────────────────── */
export default function AnimatedBackground({ variant = "particles", className = "" }) {
  return (
    <div
      className={`fixed inset-0 pointer-events-none -z-10 ${className}`}
      style={{ isolation: "isolate" }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: false, powerPreference: "low-power" }}
      >
        <ambientLight intensity={0.3} />
        <CursorTracker />
        {variant === "particles" && <ParticleSystem />}
        {variant === "grid" && <AnimatedGrid />}
        {variant === "gradient" && <GradientBlobs />}
      </Canvas>
    </div>
  );
}
