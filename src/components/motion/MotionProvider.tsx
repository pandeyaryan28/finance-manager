"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

gsap.registerPlugin(ScrollTrigger);

const MotionContext = createContext<{ lenis: Lenis | null }>({ lenis: null });

export const useMotion = () => useContext(MotionContext);

import PageTransitionShader from "./PageTransitionShader";

export default function MotionProvider({ children }: { children: React.ReactNode }) {
    const [lenis, setLenis] = useState<Lenis | null>(null);
    const cursorRef = useRef<HTMLDivElement>(null);
    const followerRef = useRef<HTMLDivElement>(null);

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
            xTo(e.clientX);
            yTo(e.clientY);
            xFollowerTo(e.clientX);
            yFollowerTo(e.clientY);
        };

        window.addEventListener("mousemove", moveCursor);
        return () => window.removeEventListener("mousemove", moveCursor);
    }, []);

    return (
        <MotionContext.Provider value={{ lenis }}>
            <PageTransitionShader />
            <div className="noise" />
            <div ref={cursorRef} className="custom-cursor hidden md:block" />
            <div ref={followerRef} className="custom-cursor-follower hidden md:block" />
            <AnimatePresence mode="wait">
                <motion.div
                    key="motion-content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </MotionContext.Provider>
    );
}
