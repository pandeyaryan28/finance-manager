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
    
    // Liquid effect
    float noise = sin(vUv.x * 12.0 + uTime) * cos(vUv.y * 12.0 + uTime) * 0.08;
    float alpha = 1.0 - smoothstep(uProgress - 0.25 + noise, uProgress + noise, dist);
    
    // Luxury dark color with slight blue tint
    vec3 color = vec3(0.02, 0.02, 0.05);
    
    gl_FragColor = vec4(color, alpha);
  }
`;

function TransitionPlane({ onComplete }: { onComplete: () => void }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const pathname = usePathname();
    const [progress, setProgress] = useState(0);

    const uniforms = useMemo(() => ({
        uProgress: { value: 1.5 },
        uTime: { value: 0 },
    }), []);

    useEffect(() => {
        // Trigger transition on path change
        let start = 0;
        const duration = 1.0;
        uniforms.uProgress.value = 1.5; // Start fully covered

        const animate = (time: number) => {
            if (!start) start = time;
            const elapsed = (time - start) / 1000;
            const p = Math.min(elapsed / duration, 1);

            // Reverse easing for reveal
            const easedP = 1 - (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

            uniforms.uProgress.value = easedP * 1.5;
            if (p < 1) {
                requestAnimationFrame(animate);
            } else {
                onComplete();
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
            <Canvas camera={{ position: [0, 0, 1] }} style={{ pointerEvents: 'none' }}>
                <TransitionPlane onComplete={() => setIsVisible(false)} />
            </Canvas>
        </div>
    );
}
