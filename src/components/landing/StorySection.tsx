"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function StorySection() {
    const containerRef = useRef<HTMLDivElement>(null);
    const textRef = useRef<HTMLHeadingElement>(null);
    const cardsRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Pinning the section
            ScrollTrigger.create({
                trigger: containerRef.current,
                start: "top top",
                end: "+=200%",
                pin: true,
                scrub: 1,
            });

            // Animate text
            gsap.fromTo(
                textRef.current,
                { opacity: 0, y: 100, scale: 0.8 },
                {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top center",
                        end: "top top",
                        scrub: 1,
                    },
                }
            );

            // Animate cards
            const cards = cardsRef.current?.children;
            if (cards) {
                gsap.fromTo(
                    cards,
                    { opacity: 0, x: 100 },
                    {
                        opacity: 1,
                        x: 0,
                        stagger: 0.2,
                        scrollTrigger: {
                            trigger: containerRef.current,
                            start: "top top",
                            end: "bottom top",
                            scrub: 1,
                        },
                    }
                );
            }
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={containerRef} className="h-screen flex flex-col items-center justify-center relative overflow-hidden bg-black/50">
            <h2 ref={textRef} className="text-7xl font-bold text-center text-luxury mb-12">
                Redefining Your <br /> Financial Horizon
            </h2>

            <div ref={cardsRef} className="flex gap-8 px-8 max-w-6xl">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="glass p-8 rounded-[2rem] flex-1 h-64 flex flex-col justify-end">
                        <div className="w-12 h-12 bg-white rounded-full mb-4 opacity-20" />
                        <h4 className="text-xl font-bold mb-2">Strategy {i}</h4>
                        <p className="text-sm text-dim">Precision-crafted algorithms for maximum velocity.</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
