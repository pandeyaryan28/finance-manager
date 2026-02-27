"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

gsap.registerPlugin(ScrollTrigger);

const MotionContext = createContext<{ lenis: Lenis | null }>({ lenis: null });

export const useMotion = () => useContext(MotionContext);

import PageTransitionShader from "./PageTransitionShader";

export default function MotionProvider({ children }: { children: React.ReactNode }) {
    const [lenis, setLenis] = useState<Lenis | null>(null);
    const [isContentVisible, setIsContentVisible] = useState(false);
    const cursorRef = useRef<HTMLDivElement>(null);
    const followerRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        const lenisInstance = new Lenis({
            duration: 1.2,
            easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: "vertical",
            gestureOrientation: "vertical",
            smoothWheel: true,
        });

        lenisInstance.on("scroll", ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenisInstance.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
        setLenis(lenisInstance);

        return () => {
            lenisInstance.destroy();
            gsap.ticker.remove(lenisInstance.raf);
        };
    }, []);

    // Optimized Custom Cursor Logic
    useEffect(() => {
        const xTo = gsap.quickTo(cursorRef.current, "x", { duration: 0.1, ease: "power3" });
        const yTo = gsap.quickTo(cursorRef.current, "y", { duration: 0.1, ease: "power3" });
        const xFollowerTo = gsap.quickTo(followerRef.current, "x", { duration: 0.3, ease: "power3" });
        const yFollowerTo = gsap.quickTo(followerRef.current, "y", { duration: 0.3, ease: "power3" });

        const moveCursor = (e: MouseEvent) => {
            const { clientX, clientY, target } = e;
            xTo(clientX);
            yTo(clientY);
            xFollowerTo(clientX);
            yFollowerTo(clientY);

            // Hover effect for interactive elements
            if ((target as HTMLElement).closest('button, a, .glass')) {
                gsap.to(followerRef.current, { width: 80, height: 80, borderColor: "white", duration: 0.3 });
            } else {
                gsap.to(followerRef.current, { width: 40, height: 40, borderColor: "rgba(255,255,255,0.2)", duration: 0.3 });
            }
        };

        window.addEventListener("mousemove", moveCursor);
        return () => window.removeEventListener("mousemove", moveCursor);
    }, []);

    // Handle Reveal
    useEffect(() => {
        setIsContentVisible(false);
        const timer = setTimeout(() => setIsContentVisible(true), 600); // Sync with transition half-way
        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <MotionContext.Provider value={{ lenis }}>
            <PageTransitionShader />
            <div className="noise" />
            <div ref={cursorRef} className="custom-cursor hidden md:block" />
            <div ref={followerRef} className="custom-cursor-follower hidden md:box-border md:block" />
            <div className={`transitioning-content ${isContentVisible ? "show" : ""}`}>
                {children}
            </div>
        </MotionContext.Provider>
    );
}
