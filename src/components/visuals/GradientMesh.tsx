"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform vec2 uResolution;
  varying vec2 vUv;

  void main() {
    vec2 p = vUv * 2.0 - 1.0;
    p.x *= uResolution.x / uResolution.y;

    float d = length(p);
    
    vec3 color1 = vec3(0.02, 0.02, 0.05); // Deep Dark
    vec3 color2 = vec3(0.1, 0.1, 0.2);     // Subtle Blue
    vec3 color3 = vec3(0.05, 0.0, 0.1);    // Deep Purple

    float noise = sin(p.x * 2.0 + uTime * 0.2) * cos(p.y * 2.0 + uTime * 0.3) * 0.5 + 0.5;
    
    vec3 finalColor = mix(color1, color2, noise);
    finalColor = mix(finalColor, color3, sin(uTime * 0.1) * 0.5 + 0.5);
    
    // Vignette
    finalColor *= 1.0 - d * 0.5;

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

function Mesh() {
    const meshRef = useRef<THREE.Mesh>(null);
    const { size } = useThree();

    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uResolution: { value: new THREE.Vector2(size.width, size.height) },
        }),
        []
    );

    useFrame((state) => {
        if (meshRef.current) {
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uTime.value = state.clock.getElapsedTime();
            (meshRef.current.material as THREE.ShaderMaterial).uniforms.uResolution.value.set(size.width, size.height);
        }
    });

    return (
        <mesh ref={meshRef}>
            <planeGeometry args={[2, 2]} />
            <shaderMaterial
                vertexShader={vertexShader}
                fragmentShader={fragmentShader}
                uniforms={uniforms}
            />
        </mesh>
    );
}

export default function GradientMesh() {
    return (
        <div className="fixed inset-0 -z-20 pointer-events-none opacity-50">
            <Canvas camera={{ position: [0, 0, 1] }}>
                <Mesh />
            </Canvas>
        </div>
    );
}
