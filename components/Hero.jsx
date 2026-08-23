"use client";
import { ChevronRight } from 'lucide-react';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ConnectButton from './ConnectButton';

// Register GSAP plugins
if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger, useGSAP);
}

const Hero = ({ authError }) => {
    const heroRef = useRef(null);
    const bgImageRef = useRef(null);
    const plane1 = useRef(null);
    const plane2 = useRef(null);
    const plane3 = useRef(null);
    const plane4 = useRef(null);

    // Keep animation physics state stable across re-renders
    const requestAnimationFrameId = useRef(null);
    const xForce = useRef(0);
    const yForce = useRef(0);
    const easing = 0.08;
    const speed = 0.01;

    const lerp = (start, target, amount) => start * (1 - amount) + target * amount;

    const animate = () => {
        xForce.current = lerp(xForce.current, 0, easing);
        yForce.current = lerp(yForce.current, 0, easing);

        if (bgImageRef.current) gsap.set(bgImageRef.current, { x: `+=${xForce.current * 0.15}`, y: `+=${yForce.current * 0.15}` });
        if (plane1.current) gsap.set(plane1.current, { x: `+=${xForce.current}`, y: `+=${yForce.current}` });
        if (plane2.current) gsap.set(plane2.current, { x: `+=${xForce.current * 0.5}`, y: `+=${yForce.current * 0.5}` });
        if (plane3.current) gsap.set(plane3.current, { x: `+=${xForce.current * 0.25}`, y: `+=${yForce.current * 0.25}` });
        if (plane4.current) gsap.set(plane4.current, { x: `+=${xForce.current * 0.35}`, y: `+=${yForce.current * 0.35}` });

        if (Math.abs(xForce.current) < 0.01) xForce.current = 0;
        if (Math.abs(yForce.current) < 0.01) yForce.current = 0;

        if (xForce.current !== 0 || yForce.current !== 0) {
            requestAnimationFrameId.current = requestAnimationFrame(animate);
        } else {
            if (requestAnimationFrameId.current) {
                cancelAnimationFrame(requestAnimationFrameId.current);
                requestAnimationFrameId.current = null;
            }
        }
    };

    const manageMouseMove = (e) => {
        const { movementX, movementY } = e;
        xForce.current += movementX * speed;
        yForce.current += movementY * speed;

        if (requestAnimationFrameId.current == null) {
            requestAnimationFrameId.current = requestAnimationFrame(animate);
        }
    };

    // Clean up animation frame on unmount
    useEffect(() => {
        return () => {
            if (requestAnimationFrameId.current) {
                cancelAnimationFrame(requestAnimationFrameId.current);
            }
        };
    }, []);

    // Scroll parallax animation for background image and cards
    useGSAP(() => {
        if (!heroRef.current) return;

        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: heroRef.current,
                start: "top top",
                end: "bottom top",
                scrub: 1,
            },
        });

        // Background image parallax translation on scroll
        if (bgImageRef.current) {
            timeline.to(bgImageRef.current, { yPercent: 22, ease: "none" }, 0);
        }

        // Floating metric cards parallax translation on scroll
        if (plane1.current) timeline.to(plane1.current, { y: -250, ease: "none" }, 0);
        if (plane2.current) timeline.to(plane2.current, { y: -180, ease: "none" }, 0);
        if (plane3.current) timeline.to(plane3.current, { y: -300, ease: "none" }, 0);
        if (plane4.current) timeline.to(plane4.current, { y: -220, ease: "none" }, 0);
    }, { scope: heroRef });

    const Text = ({ title, description }) => {
        return (
            <div className="rounded-md bg-white/1 p-[1.2vw] shadow-xl backdrop-blur-xs transition hover:scale-105">
                <div className="flex flex-col text-center gap-[0.1vw] items-center justify-center font-poppins">
                    <p className="text-lg font-medium uppercase text-white/90">
                        {title}
                    </p>
                    <p className="text-base text-[#00ffcc] font-">
                        {description}
                    </p>
                </div>
            </div>
        );
    };

    return (
        <div
            ref={heroRef}
            className="relative rounded-2xl overflow-hidden bg-slate-900"
        >
            {/* Parallax Background Layer */}
            <div
                ref={bgImageRef}
                className="absolute inset-0 -top-[15%] h-[135%] w-full bg-[length:120%] bg-center bg-no-repeat pointer-events-none will-change-transform scale-105"
                style={{ backgroundImage: "url('/background.jpg')" }}
            />

            {/* Subtle Overlay & Bottom Blend */}
            <div className="absolute inset-0 bg-black/5 pointer-events-none" />
            <div className="absolute blur-2xl -bottom-2 z-50 bg-gradient-to-t from-white to-transparent left-0 w-full h-[8vw] pointer-events-none" />
            <div className="absolute blur-xs bottom-0 left-0 z-50 w-full h-[12vw] bg-gradient-to-t from-white via-white/70 via-40% to-transparent pointer-events-none" />

            {/* Navigation Bar */}
            <header className="relative z-30 mx-[3vw] py-[1vw]">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 text-white">
                        <div>
                            <img src="/logo.png" alt="Logo" className="size-[3.5vw] min-w-8 min-h-8 brightness-110" />
                        </div>
                        <span className="text-xl font-comfortaa font-bold tracking-tight text-white drop-shadow-sm">
                            <span className="text-[#00ff88]">Sheet</span>
                            Search
                        </span>
                    </Link>

                    {/* Nav links */}
                    <nav className="hidden items-center font-poppins gap-8 text-base font-medium text-white/90 md:flex">
                        <a href="#purpose" className="transition hover:text-white hover:drop-shadow">
                            Purpose &amp; Features
                        </a>
                        <a href="#how-it-works" className="transition hover:text-white hover:drop-shadow">
                            How It Works
                        </a>
                        <a href="#permissions" className="transition hover:text-white hover:drop-shadow">
                            Google Scopes
                        </a>
                        <a href="#security" className="transition hover:text-white hover:drop-shadow">
                            Security &amp; Privacy
                        </a>
                        <a href="#faq" className="transition hover:text-white hover:drop-shadow">
                            FAQ
                        </a>
                    </nav>

                    {/* Auth Button */}
                    <div>
                        <a
                            href="/api/auth/login"
                            className="flex gap-[0.2vw] items-center justify-center font-poppins bg-white/10 px-[1.2vw] py-[0.6vw] text-lg rounded-full font- text-white shadow-xl transition-all duration-200 ease-in-out hover:bg-white/20 hover:shadow-2xl"
                        >
                            <span>Sign In</span>
                            <ChevronRight className="size-[1vw]" />
                        </a>
                    </div>
                </div>
            </header>

            {/* Hero Body with Mouse Interaction */}
            <section
                onMouseMove={manageMouseMove}
                className="relative min-h-screen z-20 mx-auto px-4 pt-[15vh] pb-24 text-center sm:px-6 lg:px-8"
            >
                {/* Main Headline */}
                <h1 className="mx-auto mt-[2vw] tracking-tight text-shadow-lg text-3xl font-poppins leading-tight text-white sm:text-5xl lg:text-[4.4vw]">
                    Search Across All Your <br />
                    <span className="font-comfortaa text-shadow-xl italic tracking-tighter">
                        Google Sheets
                    </span>{" "}
                    Instantly
                    <span className="ml-1 text-xs font-normal align-super text-white/80">
                        [1.0]
                    </span>
                </h1>

                {/* Subtitle Description */}
                <p className="mt-[1.5vw] w-full max-w-2xl text-xl text-wrap text-white/90 mx-auto">
                    SheetSearch is a dedicated web productivity application designed to
                    search across multiple Google Spreadsheets simultaneously. Quickly
                    locate any keyword, transaction, invoice number, customer record, or
                    SKU across all your spreadsheets in real time.
                </p>

                {/* Hero CTAs */}
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                    <ConnectButton />
                </div>

                {authError && (
                    <div className="mx-auto mt-6 max-w-md rounded-2xl bg-red-500/90 p-4 text-xs font-bold text-white shadow-2xl backdrop-blur-md ring-1 ring-red-300">
                        Sign-in error ({authError}). Please try again.
                    </div>
                )}

                {/* Floating Metric Cards positioned directly on the Hero section canvas */}
                {/* Top Left Floating Glass Card */}
                <div ref={plane3} className="absolute left-[9vw] top-[6vw] z-20 text-left">
                    <Text title="Search Coverage" description="100% All Drive Sheets" />
                </div>

                {/* Top Right Floating Glass Card */}
                <div ref={plane1} className="absolute right-[9vw] top-[8vw] z-20 text-left">
                    <Text title="Data Security" description="100% Read Only" />
                </div>

                {/* Bottom Left Floating Glass Card */}
                <div ref={plane2} className="absolute right-[14vw] bottom-[10vw] z-20 text-left">
                    <Text title="Query Speed" description="0.3s Per Query" />
                </div>

                {/* Bottom Right Floating Glass Card */}
                <div ref={plane4} className="absolute left-[14vw] bottom-[9vw] z-20 text-left">
                    <Text title="Deep Row Links" description="Direct Row Highlight" />
                </div>
            </section>
        </div>
    );
};

export default Hero;
