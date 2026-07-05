"use client";

import { useCallback, useEffect, useRef } from "react";
import {
  drawBird,
  drawCactus,
  drawCloud,
  drawDino,
  GH,
  GRAVITY,
  GROUND,
  GW,
  JUMP_V,
  PX,
} from "./draw";

type GameState = "idle" | "playing" | "dead";

type Cactus = { x: number; v: number };
type Bird = { x: number; y: number };
type Cloud = { x: number; y: number };

type GameData = {
  state: GameState;
  score: number;
  hi: number;
  speed: number;
  cacti: Cactus[];
  birds: Bird[];
  clouds: Cloud[];
  nextC: number;
  nextB: number;
};

type DinoData = {
  x: number;
  y: number;
  w: number;
  h: number;
  vy: number;
  onGround: boolean;
};

type Colors = {
  BG: string;
  DINO: string;
  OBS: string;
  GND: string;
  CLOUD: string;
  SCORE: string;
};

type Dino404GameProps = {
  bgColor?: string;
  dinoColor?: string;
  obstacleColor?: string;
  groundColor?: string;
  scoreColor?: string;
  showHint?: boolean;
  hintColor?: string;
  borderRadius?: number;
  borderColor?: string;
};

function overlaps(
  a: { x: number; y: number; w: number; h: number },
  b: { x: number; y: number; w: number; h: number },
) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

export default function Dino404Game({
  bgColor = "#212121",
  dinoColor = "#f5f5f5",
  obstacleColor = "#f5f5f5",
  groundColor = "rgba(245,245,245,0.28)",
  scoreColor = "#f5f5f5",
  showHint = true,
  hintColor = "rgba(245,245,245,0.22)",
  borderRadius = 4,
  borderColor = "rgba(245,245,245,0.08)",
}: Dino404GameProps) {
  const rafRef = useRef<number | null>(null);
  const frRef = useRef(0);
  const colRef = useRef<Colors>({
    BG: bgColor,
    DINO: dinoColor,
    OBS: obstacleColor,
    GND: groundColor,
    CLOUD: "rgba(245,245,245,0.06)",
    SCORE: scoreColor,
  });

  const gameRef = useRef<GameData>({
    state: "idle",
    score: 0,
    hi: 0,
    speed: 5,
    cacti: [],
    birds: [],
    clouds: [
      { x: 110, y: 32 },
      { x: 320, y: 22 },
      { x: 560, y: 44 },
      { x: 700, y: 28 },
    ],
    nextC: 120,
    nextB: 500,
  });

  const dinoRef = useRef<DinoData>({
    x: 80,
    y: GROUND,
    w: 13 * PX,
    h: 23 * PX,
    vy: 0,
    onGround: true,
  });

  colRef.current = {
    BG: bgColor,
    DINO: dinoColor,
    OBS: obstacleColor,
    GND: groundColor,
    CLOUD: "rgba(245,245,245,0.06)",
    SCORE: scoreColor,
  };

  const jump = useCallback(() => {
    const g = gameRef.current;
    const d = dinoRef.current;

    if (g.state === "idle" || g.state === "dead") {
      Object.assign(g, {
        state: "playing" as const,
        score: 0,
        speed: 5,
        cacti: [],
        birds: [],
        nextC: 120,
        nextB: 500,
      });
      Object.assign(d, { y: GROUND, vy: 0, onGround: true });
    }

    if (d.onGround && g.state === "playing") {
      d.vy = JUMP_V;
      d.onGround = false;
    }
  }, []);

  const startLoop = useCallback(
    (canvas: HTMLCanvasElement | null) => {
      if (!canvas) {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        return;
      }

      const maybeContext = canvas.getContext("2d");
      if (!maybeContext) return;
      const context: CanvasRenderingContext2D = maybeContext;

      try {
        gameRef.current.hi =
          parseFloat(sessionStorage.getItem("__d404hi__") || "0") || 0;
      } catch {
        // sessionStorage unavailable
      }

      function tick() {
        const g = gameRef.current;
        const d = dinoRef.current;
        frRef.current++;

        if (g.state !== "playing") return;

        g.score += g.speed * 0.055;
        if (g.score > g.hi) g.hi = g.score;
        g.speed = Math.min(12, 5 + Math.floor(g.score / 500) * 0.4);

        if (!d.onGround) {
          d.vy += GRAVITY;
          d.y += d.vy;
          if (d.y >= GROUND) {
            d.y = GROUND;
            d.vy = 0;
            d.onGround = true;
          }
        }

        g.clouds.forEach((c) => {
          c.x -= g.speed * 0.14;
          if (c.x < -100) c.x = GW + 80;
        });

        g.nextC -= g.speed;
        if (g.nextC <= 0) {
          g.cacti.push({ x: GW + 20, v: Math.floor(Math.random() * 3) });
          g.nextC = 130 + Math.random() * 200;
        }

        g.cacti.forEach((c) => {
          c.x -= g.speed;
        });
        g.cacti = g.cacti.filter((c) => c.x > -90);

        if (g.score > 300) {
          g.nextB -= g.speed;
          if (g.nextB <= 0) {
            const ys = [GROUND - 55, GROUND - 82, GROUND - 110];
            g.birds.push({
              x: GW + 20,
              y: ys[Math.floor(Math.random() * ys.length)] ?? GROUND - 55,
            });
            g.nextB = 300 + Math.random() * 400;
          }
        }

        g.birds.forEach((b) => {
          b.x -= g.speed * 1.1;
        });
        g.birds = g.birds.filter((b) => b.x > -60);

        const dH = { x: d.x + 8, y: d.y - d.h + 12, w: d.w - 18, h: d.h - 16 };

        for (const c of g.cacti) {
          if (overlaps(dH, { x: c.x + 4, y: GROUND - 54, w: 24, h: 54 })) {
            g.state = "dead";
            try {
              sessionStorage.setItem("__d404hi__", String(g.hi));
            } catch {
              // sessionStorage unavailable
            }
            break;
          }
        }

        if (g.state === "playing") {
          for (const b of g.birds) {
            if (overlaps(dH, { x: b.x - 4, y: b.y - 4, w: 26, h: 18 })) {
              g.state = "dead";
              try {
                sessionStorage.setItem("__d404hi__", String(g.hi));
              } catch {
                // sessionStorage unavailable
              }
              break;
            }
          }
        }
      }

      function frame() {
        const g = gameRef.current;
        const d = dinoRef.current;
        const C = colRef.current;

        tick();

        context.fillStyle = C.BG;
        context.fillRect(0, 0, GW, GH);

        g.clouds.forEach((c) => drawCloud(context, c.x, c.y, C.CLOUD));

        context.fillStyle = C.GND;
        context.fillRect(0, GROUND, GW, 2);

        context.fillStyle = C.CLOUD;
        for (let i = 0; i < 22; i++) {
          const gx = (i * 42 + frRef.current * g.speed * 0.45) % GW;
          context.fillRect(gx, GROUND + 5 + (i % 3) * 3, i % 3 === 0 ? 3 : 2, 2);
        }

        g.cacti.forEach((c) => drawCactus(context, c.x, C.OBS, c.v));
        g.birds.forEach((b) => drawBird(context, b.x, b.y, C.OBS, frRef.current));
        drawDino(
          context,
          d.x,
          d.y - d.h,
          C.DINO,
          C.BG,
          g.state === "dead",
          d.onGround,
          frRef.current,
        );

        context.save();
        context.font = "700 14px ui-monospace, monospace";
        context.textAlign = "right";
        context.textBaseline = "top";
        context.fillStyle = C.SCORE;
        context.fillText(String(Math.floor(g.score)).padStart(5, "0"), GW - 14, 12);
        context.globalAlpha = 0.3;
        context.fillText(`HI ${String(Math.floor(g.hi)).padStart(5, "0")}`, GW - 116, 12);
        context.restore();

        if (g.state === "idle") {
          context.save();
          context.fillStyle = C.SCORE;
          context.globalAlpha = 0.45 + 0.45 * Math.sin(Date.now() / 520);
          context.font = "700 12px ui-monospace, monospace";
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillText("PRESS SPACE OR TAP TO PLAY", GW / 2, GROUND - 72);
          context.restore();
        }

        if (g.state === "dead") {
          context.save();
          context.fillStyle = C.SCORE;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.font = "700 16px ui-monospace, monospace";
          context.fillText("GAME OVER", GW / 2, GROUND - 84);
          context.globalAlpha = 0.38;
          context.font = "400 10px ui-monospace, monospace";
          context.fillText("PRESS SPACE OR TAP TO RETRY", GW / 2, GROUND - 56);
          if (g.score >= g.hi && g.score > 0) {
            context.globalAlpha = 0.65;
            context.font = "700 10px ui-monospace, monospace";
            context.fillText("NEW BEST!", GW / 2, GROUND - 36);
          }
          context.restore();
        }

        rafRef.current = requestAnimationFrame(frame);
      }

      rafRef.current = requestAnimationFrame(frame);
    },
    [],
  );

  const handleTouch = useCallback(
    (e: React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      jump();
    },
    [jump],
  );

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [jump]);

  useEffect(() => {
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="flex h-full w-full flex-col items-stretch">
      <canvas
        ref={startLoop}
        width={GW}
        height={GH}
        onClick={jump}
        onTouchStart={handleTouch}
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          cursor: "pointer",
          borderRadius,
          border: `1px solid ${borderColor}`,
        }}
      />
      {showHint && (
        <p className="mt-2.5 text-center text-xs uppercase tracking-[0.15em] text-cream-dim">
          Space · ↑ · Click · Tap — to jump
        </p>
      )}
    </div>
  );
}
