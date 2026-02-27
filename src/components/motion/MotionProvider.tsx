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
            <div className={`transitioning-content ${isContentVisible ? "show" : ""}`}>
                {children}
            </div>
        </MotionContext.Provider>
    );
}
