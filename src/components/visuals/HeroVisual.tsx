"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { MeshDistortMaterial, Sphere, Float, MeshWobbleMaterial, OrbitControls } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

function PulseSphere() {
    const mesh = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        const { clock } = state;
        if (mesh.current) {
            mesh.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.2);
            mesh.current.rotation.y = Math.cos(clock.getElapsedTime() * 0.3);
        }
    });

    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <Sphere ref={mesh} args={[1, 128, 128]}>
                <MeshDistortMaterial
                    color="#ffffff"
                    attach="material"
                    distort={0.4}
                    speed={1.5}
                    roughness={0}
                    metalness={1}
                    emissive="#111111"
                />
            </Sphere>
        </Float>
    );
}

function Grid() {
    return (
        <gridHelper
            args={[20, 20, "#222222", "#111111"]}
            position={[0, -2, 0]}
            rotation={[Math.PI / 4, 0, 0]}
        />
    );
}

export default function HeroVisual() {
    return (
        <div className="absolute inset-0 -z-10 bg-[#050505]">
            <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
                <ambientLight intensity={0.2} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#3b82f6" />
                <PulseSphere />
                <Grid />
                <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
            </Canvas>
        </div>
    );
}
