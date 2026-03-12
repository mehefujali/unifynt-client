"use client";

import { useEffect, useRef } from "react";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    baseSize: number;
}

export const ParticleBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particles = useRef<Particle[]>([]);
    const mouse = useRef({ x: 0, y: 0, radius: 150 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationFrameId: number;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        const init = () => {
            particles.current = [];
            const particleCount = Math.floor((canvas.width * canvas.height) / 8000);
            for (let i = 0; i < Math.min(particleCount, 150); i++) {
                const size = Math.random() * 2 + 1;
                particles.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: size,
                    baseSize: size
                });
            }
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            ctx.fillStyle = "rgba(161, 161, 170, 0.3)"; // zinc-400 with opacity
            ctx.strokeStyle = "rgba(161, 161, 170, 0.1)"; // zinc-400 with very low opacity

            particles.current.forEach((p, i) => {
                // Move
                p.x += p.vx;
                p.y += p.vy;

                // Bounce off edges
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

                // Mouse interaction
                const dx = mouse.current.x - p.x;
                const dy = mouse.current.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.current.radius) {
                    const force = (mouse.current.radius - distance) / mouse.current.radius;
                    p.x -= dx * force * 0.02;
                    p.y -= dy * force * 0.02;
                    p.size = p.baseSize * (1 + force * 1.5);
                } else {
                    p.size = p.baseSize;
                }

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();

                // Draw lines
                for (let j = i + 1; j < particles.current.length; j++) {
                    const p2 = particles.current[j];
                    const dx2 = p.x - p2.x;
                    const dy2 = p.y - p2.y;
                    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                    if (dist2 < 120) {
                        ctx.lineWidth = 0.5 * (1 - dist2 / 120);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouse.current.x = e.clientX;
            mouse.current.y = e.clientY;
        };

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMouseMove);
        
        resize();
        draw();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 -z-10 pointer-events-none opacity-60"
        />
    );
};
