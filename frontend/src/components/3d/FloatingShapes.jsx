import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/** A single rotating wireframe shape */
function Shape({ geometry, position, color, speed = 0.3, floatSpeed = 1 }) {
  const meshRef = useRef();

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * speed * 0.5;
      meshRef.current.rotation.y += delta * speed;
    }
  });

  return (
    <Float speed={floatSpeed} rotationIntensity={0.3} floatIntensity={0.8}>
      <mesh ref={meshRef} position={position} geometry={geometry}>
        <meshBasicMaterial color={color} wireframe transparent opacity={0.25} />
      </mesh>
    </Float>
  );
}

/**
 * FloatingShapes — full-screen R3F canvas with rotating wireframe geometries.
 * Props:
 *  - count (number) — how many shapes
 *  - className — container class
 */
export default function FloatingShapes({ count = 6, className = "" }) {
  const shapes = useMemo(() => {
    const geometries = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
      new THREE.TorusGeometry(0.8, 0.3, 8, 16),
      new THREE.TetrahedronGeometry(1, 0),
      new THREE.DodecahedronGeometry(0.9, 0),
    ];
    const colors = ["#7c5cfc", "#3b82f6", "#06b6d4", "#8b5cf6", "#6366f1"];

    return Array.from({ length: count }, (_, i) => ({
      geometry: geometries[i % geometries.length],
      position: [
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 2,
      ],
      color: colors[i % colors.length],
      speed: 0.15 + Math.random() * 0.3,
      floatSpeed: 0.5 + Math.random() * 1.5,
      key: i,
    }));
  }, [count]);

  return (
    <div className={`absolute inset-0 pointer-events-none ${className}`}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        dpr={[1, 1.5]}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <ambientLight intensity={0.5} />
        {shapes.map((s) => (
          <Shape
            key={s.key}
            geometry={s.geometry}
            position={s.position}
            color={s.color}
            speed={s.speed}
            floatSpeed={s.floatSpeed}
          />
        ))}
      </Canvas>
    </div>
  );
}
