"use client";

import {
  motion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

type Screen = "mobile" | "tablet" | "desktop";

const SPRING = { stiffness: 90, damping: 25, mass: 0.6 };

const LAYOUT = {
  desktop: {
    leftFont: "55px",
    textWidth: "250px",
    centerFont: "56px",
    playSize: 60,
    gap: "20px",
    startWidth: "15vw",
    startHeight: "5vh",
  },
  tablet: {
    leftFont: "40px",
    textWidth: "160px",
    centerFont: "42px",
    playSize: 52,
    gap: "16px",
    startWidth: "15vw",
    startHeight: "5vh",
  },
  mobile: {
    leftFont: "22px",
    textWidth: "100px",
    centerFont: "26px",
    playSize: 42,
    gap: "10px",
    startWidth: "15vw",
    startHeight: "5vh",
  },
} as const;

type Props = {
  videoSrc: string;
  posterSrc?: string;
  leftText?: string;
  rightText?: string;
  buttonText?: string;
};

export default function ScrollZoomReveal({
  videoSrc,
  posterSrc,
  leftText = "Malitos",
  rightText = "Showreel",
  buttonText = "Play showreel",
}: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [screen, setScreen] = useState<Screen>("desktop");
  const [playing, setPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const layout = LAYOUT[screen];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const rawWidth = useTransform(
    scrollYProgress,
    [0, 1],
    [layout.startWidth, "100vw"],
  );
  const rawHeight = useTransform(
    scrollYProgress,
    [0, 1],
    [layout.startHeight, "100vh"],
  );
  const rawRadius = useTransform(scrollYProgress, [0, 1], [50, 0]);

  const width = useSpring(rawWidth, SPRING);
  const height = useSpring(rawHeight, SPRING);
  const borderRadius = useSpring(rawRadius, SPRING);

  const centerTextOpacity = useTransform(scrollYProgress, [0.45, 0.6], [0, 1]);
  const centerTextY = useTransform(scrollYProgress, [0.45, 0.6], [60, 0]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReducedMotion(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    const onResize = () => {
      const w = window.innerWidth;
      if (w <= 810) setScreen("mobile");
      else if (w <= 1799) setScreen("tablet");
      else setScreen("desktop");
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void video.play();
      video.muted = false;
      setPlaying(true);
    } else {
      video.pause();
      video.muted = true;
      setPlaying(false);
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = true;
    void video.play().catch(() => {
      /* autoplay blocked until user taps play */
    });
  }, [videoSrc]);

  if (reducedMotion) {
    return (
      <section className="relative py-16" aria-label="About showreel">
        <div
          className="mx-auto flex max-w-6xl items-center justify-center px-5"
          style={{ gap: layout.gap }}
        >
          <p
            className="shrink-0 whitespace-nowrap font-medium text-cream"
            style={{
              width: layout.textWidth,
              textAlign: "right",
              fontSize: layout.leftFont,
            }}
          >
            {leftText}
          </p>
          <div className="relative h-[50vh] w-[50vw] shrink-0 overflow-hidden rounded-[25px]">
            <video
              ref={videoRef}
              src={videoSrc}
              poster={posterSrc}
              className="absolute left-1/2 top-1/2 h-[100vh] w-[100vw] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover opacity-100"
              muted
              loop
              playsInline
              preload="metadata"
            />
          </div>
          <p
            className="shrink-0 whitespace-nowrap font-medium text-cream"
            style={{
              width: layout.textWidth,
              textAlign: "left",
              fontSize: layout.leftFont,
            }}
          >
            {rightText}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: "400vh" }}
      aria-label="About showreel"
    >
      <div
        className="sticky top-0 flex h-screen items-center justify-center px-5"
        style={{ gap: layout.gap }}
      >
        <p
          className="shrink-0 whitespace-nowrap font-medium text-cream"
          style={{
            width: layout.textWidth,
            textAlign: "right",
            fontSize: layout.leftFont,
          }}
        >
          {leftText}
        </p>

        <motion.div
          className="relative shrink-0 overflow-hidden"
          style={{ width, height, borderRadius }}
        >
          <video
            ref={videoRef}
            src={videoSrc}
            poster={posterSrc}
            className="pointer-events-none absolute left-1/2 top-1/2 h-[100vh] w-[100vw] max-w-none -translate-x-1/2 -translate-y-1/2 object-cover opacity-100"
            muted
            loop
            playsInline
            preload="metadata"
          />

          <motion.button
            type="button"
            onClick={togglePlay}
            className="absolute left-1/2 top-1/2 flex -translate-x-1/2 items-center justify-center gap-2.5 border-0 bg-transparent p-0 font-medium text-cream"
            style={{
              opacity: centerTextOpacity,
              y: centerTextY,
              fontSize: layout.centerFont,
            }}
            aria-label={playing ? "Pause showreel" : buttonText}
          >
            <span className="whitespace-nowrap">
              {playing ? "Pause" : buttonText}
            </span>
            <span
              className="flex shrink-0 items-center justify-center rounded-full bg-black"
              style={{ width: layout.playSize, height: layout.playSize }}
            >
              {playing ? (
                <span className="flex gap-1">
                  <span className="block h-4 w-1 rounded-sm bg-white" />
                  <span className="block h-4 w-1 rounded-sm bg-white" />
                </span>
              ) : (
                <span
                  className="relative left-0.5 border-y-[7px] border-l-[14px] border-y-transparent border-l-white md:border-y-[10px] md:border-l-[20px]"
                  aria-hidden
                />
              )}
            </span>
          </motion.button>
        </motion.div>

        <p
          className="shrink-0 whitespace-nowrap font-medium text-cream"
          style={{
            width: layout.textWidth,
            textAlign: "left",
            fontSize: layout.leftFont,
          }}
        >
          {rightText}
        </p>
      </div>
    </section>
  );
}
