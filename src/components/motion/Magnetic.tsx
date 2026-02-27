"use client";

import React, { useRef, useState, useEffect } from "react";
import gsap from "gsap";

export default function Magnetic({ children }: { children: React.ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const xTo = gsap.quickTo(ref.current, "x", { duration: 1, ease: "elastic.out(1, 0.3)" });
        const yTo = gsap.quickTo(ref.current, "y", { duration: 1, ease: "elastic.out(1, 0.3)" });

        const handleMouseMove = (e: MouseEvent) => {
            if (!ref.current) return;
            const { clientX, clientY } = e;
            const { width, height, left, top } = ref.current.getBoundingClientRect();
            const x = clientX - (left + width / 2);
            const y = clientY - (top + height / 2);

            // Calculate distance
            const distance = Math.sqrt(x * x + y * y);
            const triggerDistance = 100;

            if (distance < triggerDistance) {
                xTo(x * 0.35);
                yTo(y * 0.35);
            } else {
                xTo(0);
                yTo(0);
            }
        };

        const handleMouseLeave = () => {
            xTo(0);
            yTo(0);
        };

        window.addEventListener("mousemove", handleMouseMove);
        ref.current?.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            ref.current?.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <div ref={ref} className="inline-block transition-transform duration-300">
            {children}
        </div>
    );
}
