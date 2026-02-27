"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { usePathname } from "next/navigation";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uProgress;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    float dist = distance(vUv, vec2(0.5));
    float circle = 1.0 - smoothstep(uProgress - 0.1, uProgress, dist);
    
    // Liquid effect
    float noise = sin(vUv.x * 10.0 + uTime) * cos(vUv.y * 10.0 + uTime) * 0.05;
    float alpha = 1.0 - smoothstep(uProgress - 0.2 + noise, uProgress + noise, dist);
    
    gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
  }
`;

function TransitionPlane({ onComplete }: { onComplete: () => void }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const pathname = usePathname();
    const [progress, setProgress] = useState(0);

    const uniforms = useMemo(() => ({
        uProgress: { value: 0 },
        uTime: { value: 0 },
    }), []);

    useEffect(() => {
        // Trigger transition on path change
        let start = 0;
        const duration = 1.5;
        const animate = (time: number) => {
            if (!start) start = time;
            const elapsed = (time - start) / 1000;
            const p = Math.min(elapsed / duration, 1);

            // Simple easing: cubic in-out
            const easedP = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;

            uniforms.uProgress.value = easedP * 1.5; // Multiply to ensure it covers full screen
            if (p < 1) {
                requestAnimationFrame(animate);
            } else {
                setTimeout(onComplete, 200);
            }
        };

        requestAnimationFrame(animate);
    }, [pathname]);

    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
        }
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
                transparent
            />
        </mesh>
    );
}

export default function PageTransitionShader() {
    const [isVisible, setIsVisible] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        setIsVisible(true);
    }, [pathname]);

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[10000] pointer-events-none">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <TransitionPlane onComplete={() => setIsVisible(false)} />
            </Canvas>
        </div>
    );
}
