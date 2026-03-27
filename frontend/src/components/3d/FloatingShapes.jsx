import React, { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

/* Shared cursor state for cursor influence */
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

/** A single rotating wireframe shape with continuous + cursor animation */
function Shape({ geometry, position, color, speed = 0.3, floatSpeed = 1, index = 0 }) {
  const meshRef = useRef();
  const phase = useMemo(() => index * 1.3, [index]);

  useFrame(({ clock }, delta) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();

    // Continuous rotation (always running)
    meshRef.current.rotation.x += delta * speed * 0.5;
    meshRef.current.rotation.y += delta * speed;

    // Continuous floating orbit
    const floatX = Math.sin(t * 0.4 + phase) * 0.3;
    const floatY = Math.cos(t * 0.3 + phase) * 0.25;
    const floatZ = Math.sin(t * 0.2 + phase) * 0.15;

    // Cursor influence — subtle parallax
    const cursorPushX = cursorState.x * 0.2;
    const cursorPushY = cursorState.y * 0.15;

    meshRef.current.position.x = position[0] + floatX + cursorPushX;
    meshRef.current.position.y = position[1] + floatY + cursorPushY;
    meshRef.current.position.z = position[2] + floatZ;

    // Subtle scale pulse
    const pulse = 1 + Math.sin(t * 0.6 + phase) * 0.06;
    meshRef.current.scale.setScalar(pulse);
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
 * Now with continuous animation + cursor parallax influence.
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
        <CursorListener />
        {shapes.map((s) => (
          <Shape
            key={s.key}
            index={s.key}
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
