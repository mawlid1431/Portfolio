"use client";

import { useAnimationFrame } from "framer-motion";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type WavyTickerProps = {
  items: ReactNode[];
  interactionType?: "auto" | "scroll";
  speed?: number;
  scrollSpeed?: number;
  direction?: "left" | "right" | "up" | "down";
  slowdownOnHover?: number;
  waveStyle?: "straight" | "wavy";
  waveAmplitude?: number;
  waveFrequency?: number;
  itemSize?: number;
  gap?: number;
  padding?: number;
  verticalAlign?: "top" | "center" | "bottom";
  fadeEdges?: boolean;
  fadeDistance?: number;
  className?: string;
};

export default function WavyTicker({
  items,
  interactionType = "auto",
  speed = 50,
  scrollSpeed = 1,
  direction = "left",
  slowdownOnHover = 0.3,
  waveStyle = "wavy",
  waveAmplitude = 20,
  waveFrequency = 0.005,
  itemSize = 80,
  gap = 32,
  padding = 40,
  verticalAlign = "center",
  fadeEdges = true,
  fadeDistance = 15,
  className,
}: WavyTickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const targetScrollOffset = useRef(0);
  const [mounted, setMounted] = useState(false);
  const itemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [itemWidths, setItemWidths] = useState<number[]>([]);
  const [containerWidth, setContainerWidth] = useState(0);
  const [containerHeight, setContainerHeight] = useState(0);

  const isVertical = direction === "up" || direction === "down";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
        setContainerHeight(containerRef.current.offsetHeight);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (itemRefs.current.length > 0 && items.length > 0) {
      const widths = itemRefs.current
        .slice(0, items.length)
        .map((ref) => ref?.offsetWidth || itemSize);
      setItemWidths(widths);
    }
  }, [items, itemSize]);

  const calculatedHeight = useMemo(() => {
    const waveHeight = waveStyle === "wavy" ? waveAmplitude * 2 : 0;
    const baseHeight = itemSize + waveHeight + padding * 2;
    return Math.max(5, baseHeight);
  }, [itemSize, waveAmplitude, padding, waveStyle]);

  useEffect(() => {
    if (!mounted || interactionType !== "scroll") return;

    const handleScroll = () => {
      targetScrollOffset.current = window.scrollY * scrollSpeed;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [mounted, interactionType, scrollSpeed]);

  useAnimationFrame((_time, delta) => {
    if (!mounted) return;

    if (interactionType === "auto") {
      const effectiveSpeed = isHovered ? speed * slowdownOnHover : speed;
      setOffset((prev) => prev + (effectiveSpeed * delta) / 1000);
    } else {
      setScrollOffset((prev) => {
        const diff = targetScrollOffset.current - prev;
        return prev + diff * 0.1;
      });
    }
  });

  const handleMouseEnter = useCallback(() => {
    if (interactionType === "auto") setIsHovered(true);
  }, [interactionType]);

  const handleMouseLeave = useCallback(() => {
    if (interactionType === "auto") setIsHovered(false);
  }, [interactionType]);

  const verticalStyles = useMemo(() => {
    switch (verticalAlign) {
      case "top":
        return { top: padding, bottom: "auto" as const, transform: "" };
      case "bottom":
        return { top: "auto" as const, bottom: padding, transform: "" };
      default:
        return { top: "50%", bottom: "auto" as const, transform: "translateY(-50%)" };
    }
  }, [verticalAlign, padding]);

  if (!items || items.length === 0) {
    return (
      <div
        className={className}
        style={{
          width: "100%",
          height: Math.max(5, calculatedHeight),
          minHeight: 5,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: `${padding}px 0`,
        }}
      >
        <p style={{ color: "#999", fontSize: 14 }}>Add items to display</p>
      </div>
    );
  }

  const widthsToUse =
    itemWidths.length === items.length ? itemWidths : items.map(() => itemSize);
  const totalWidth = widthsToUse.reduce((sum, width) => sum + width + gap, 0);
  const totalHeight = items.length * (itemSize + gap);
  const viewportWidth = containerWidth || 1200;
  const viewportHeight = containerHeight || 800;

  const repeats = isVertical
    ? Math.max(3, Math.ceil(viewportHeight / totalHeight) + 2)
    : Math.max(3, Math.ceil(viewportWidth / totalWidth) + 2);

  const allItems = Array.from({ length: repeats }, () => items).flat();
  const allWidths = Array.from({ length: repeats }, () => widthsToUse).flat();

  const currentOffset = interactionType === "scroll" ? scrollOffset : offset;
  const loopLength = isVertical ? totalHeight : totalWidth;

  let finalOffset: number;
  if (direction === "left") {
    const wrappedOffset = ((currentOffset % loopLength) + loopLength) % loopLength;
    finalOffset = -wrappedOffset;
  } else if (direction === "right") {
    const wrappedOffset = ((currentOffset % loopLength) + loopLength) % loopLength;
    finalOffset = wrappedOffset - loopLength;
  } else if (direction === "up") {
    const wrappedOffset = ((currentOffset % loopLength) + loopLength) % loopLength;
    finalOffset = -wrappedOffset;
  } else {
    const wrappedOffset = ((currentOffset % loopLength) + loopLength) % loopLength;
    finalOffset = wrappedOffset - loopLength;
  }

  const fadeMask = fadeEdges
    ? isVertical
      ? {
          maskImage: `linear-gradient(to bottom, transparent 0%, black ${fadeDistance}%, black ${100 - fadeDistance}%, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to bottom, transparent 0%, black ${fadeDistance}%, black ${100 - fadeDistance}%, transparent 100%)`,
        }
      : {
          maskImage: `linear-gradient(to right, transparent 0%, black ${fadeDistance}%, black ${100 - fadeDistance}%, transparent 100%)`,
          WebkitMaskImage: `linear-gradient(to right, transparent 0%, black ${fadeDistance}%, black ${100 - fadeDistance}%, transparent 100%)`,
        }
    : undefined;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: "100%",
        height: isVertical ? "100%" : Math.max(5, calculatedHeight),
        minHeight: 5,
        overflow: "hidden",
        position: "relative",
        display: "flex",
        alignItems:
          verticalAlign === "top"
            ? "flex-start"
            : verticalAlign === "bottom"
              ? "flex-end"
              : "center",
        ...fadeMask,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div
        style={{
          display: "flex",
          flexDirection: isVertical ? "column" : "row",
          gap: `${gap}px`,
          position: "absolute",
          left: isVertical ? 0 : undefined,
          top: isVertical ? 0 : undefined,
          width: isVertical ? "100%" : undefined,
          ...(!isVertical && verticalStyles),
          transform: isVertical
            ? `translateY(${finalOffset}px)`
            : `translateX(${finalOffset}px) ${verticalStyles.transform}`,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {allItems.map((item, index) => {
          let position = 0;
          for (let i = 0; i < index; i++) {
            position += (isVertical ? itemSize : allWidths[i] ?? itemSize) + gap;
          }

          const itemWidth = allWidths[index] ?? itemSize;
          const waveOffset =
            waveStyle === "wavy"
              ? Math.sin((position + currentOffset) * waveFrequency) * waveAmplitude
              : 0;
          const isOriginalItem = index < items.length;

          return (
            <div
              key={`item-${index}`}
              ref={
                isOriginalItem
                  ? (el) => {
                      itemRefs.current[index] = el;
                    }
                  : undefined
              }
              style={{
                minWidth: isVertical ? "100%" : itemWidth,
                width: isVertical ? "100%" : undefined,
                height: itemSize,
                flexShrink: 0,
                transform: isVertical
                  ? `translateX(${waveOffset}px)`
                  : `translateY(${waveOffset}px)`,
                willChange: "transform",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {item}
            </div>
          );
        })}
      </div>
    </div>
  );
}
