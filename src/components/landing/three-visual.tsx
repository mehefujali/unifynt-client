"use client";

import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { shaderMaterial } from "@react-three/drei";
import * as THREE from "three";

/**
 * --- Unifynt Premium Smoke Shader (V5 - Ultra Impact) ---
 * Professional, high-visibility volumetric smoke on a light theme.
 */
const LightDomeSmokeMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0.5, 0.5),
    uColor1: new THREE.Color("#2B9EFF"), // Unifynt Primary
    uColor2: new THREE.Color("#f1f5f9"), // Ultra Light Slate for blend
    uAccent: new THREE.Color("#6366f1"), // Indigo accent
  },
  // Vertex Shader
  `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
  `,
  // Fragment Shader
  `
  uniform float uTime;
  uniform vec2 uMouse;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uAccent;
  varying vec2 vUv;

  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1; i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ; m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5; vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox; m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g; g.x  = a0.x  * x0.x  + h.x  * x0.y; g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  void main() {
    vec2 uv = vUv;
    vec2 center = vec2(0.5, 1.15); 
    
    vec2 pos = uv;
    pos.x *= 1.4;
    center.x *= 1.4;
    
    float distFromTopCenter = distance(pos, center);
    float distMouse = distance(uv, uMouse);
    float force = smoothstep(0.8, 0.0, distMouse);
    
    vec2 distortedUv = uv + normalize(uv - uMouse + 0.001) * force * 0.06;
    float t = uTime * 0.05; 
    
    float n1 = snoise(vec2(distortedUv.x * 1.5 + t, distortedUv.y * 1.5 - t));
    float n2 = snoise(vec2(distortedUv.x * 3.0 - t * 0.7, distortedUv.y * 3.0 + t * 0.4));
    float noise = (n1 + n2) * 0.5;
    noise = noise * 0.5 + 0.5;     
    
    float domeMask = smoothstep(1.6, 0.1, distFromTopCenter);
    float smoke = domeMask * (0.35 + 0.65 * noise);
    
    vec3 color = mix(uColor1, uAccent, n1 * 0.4 + 0.6 * noise);
    
    float edgeFade = smoothstep(1.8, 1.1, distFromTopCenter);
    float alpha = smoke * 0.85 * edgeFade; 
    
    gl_FragColor = vec4(color, alpha);
  }
  `
);

interface CustomSmokeMaterial extends THREE.ShaderMaterial {
  uniforms: {
    uTime: { value: number };
    uMouse: { value: THREE.Vector2 };
    uColor1: { value: THREE.Color };
    uColor2: { value: THREE.Color };
    uAccent: { value: THREE.Color };
  };
}

const SmokePlane = () => {
    const materialRef = useRef<CustomSmokeMaterial>(null);
    const material = useMemo(() => new LightDomeSmokeMaterial(), []);

    useFrame((state) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
            const targetX = (state.pointer.x + 1) / 2;
            const targetY = (state.pointer.y + 1) / 2;
            materialRef.current.uniforms.uMouse.value.lerp(new THREE.Vector2(targetX, targetY), 0.05);
        }
    });

    return (
        <mesh>
            <planeGeometry args={[25, 25]} />
            <primitive 
                object={material} 
                ref={materialRef} 
                attach="material"
                transparent
                depthWrite={false}
                blending={THREE.NormalBlending}
            />
        </mesh>
    );
};

export const ThreeHeroVisual = () => {
    return (
        <div className="absolute inset-0 z-0 w-full h-full pointer-events-none">
            <Canvas
                camera={{ position: [0, 0, 5], fov: 55 }}
                gl={{ antialias: true, alpha: true }}
                dpr={[1, 2]}
            >
                <SmokePlane />
            </Canvas>
            {/* Soft gradient blend */}
            <div className="absolute inset-1 w-full h-full bg-[radial-gradient(circle_at_top,transparent_0%,#ffffff_90%)] z-10 opacity-30" />
        </div>
    );
};