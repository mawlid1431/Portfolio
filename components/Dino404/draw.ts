export const GW = 800;
export const GH = 260;
export const GROUND = GH - 52;
export const PX = 4;
export const GRAVITY = 0.88;
export const JUMP_V = -15.5;

export const BODY_PX: Array<[number, number, number, number]> = [
  [3, 0, 8, 1],
  [2, 1, 9, 1],
  [2, 2, 10, 1],
  [2, 3, 10, 1],
  [2, 4, 10, 1],
  [0, 5, 12, 1],
  [0, 6, 12, 1],
  [0, 7, 8, 1],
  [1, 8, 11, 1],
  [1, 9, 11, 1],
  [1, 10, 11, 1],
  [2, 11, 9, 1],
  [2, 12, 7, 1],
  [2, 13, 5, 1],
  [0, 14, 11, 1],
  [0, 15, 11, 1],
  [0, 16, 11, 1],
  [0, 17, 11, 1],
  [0, 18, 9, 1],
  [0, 19, 9, 1],
];

export function drawDino(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  col: string,
  bgCol: string,
  dead: boolean,
  onGround: boolean,
  rf: number,
) {
  ctx.fillStyle = col;
  BODY_PX.forEach(([c, r, w, h]) => ctx.fillRect(x + c * PX, y + r * PX, w * PX, h * PX));
  ctx.fillRect(x + 11 * PX, y + 15 * PX, 2 * PX, PX);
  ctx.fillRect(x + 12 * PX, y + 16 * PX, 2 * PX, PX);
  ctx.fillRect(x + 13 * PX, y + 17 * PX, PX, PX);

  ctx.fillStyle = bgCol;
  if (dead) {
    ctx.fillRect(x + 7 * PX, y + 2 * PX, PX, PX);
    ctx.fillRect(x + 8 * PX, y + 3 * PX, PX, PX);
    ctx.fillRect(x + 8 * PX + 1, y + 2 * PX + 1, PX - 2, PX - 2);
    ctx.fillRect(x + 7 * PX + 1, y + 3 * PX + 1, PX - 2, PX - 2);
  } else {
    ctx.fillRect(x + 7 * PX, y + 2 * PX, 2 * PX, 2 * PX);
  }

  ctx.fillStyle = col;
  if (!onGround) {
    ctx.fillRect(x + 3 * PX, y + 20 * PX, 3 * PX, PX);
    ctx.fillRect(x + 6 * PX, y + 20 * PX, 3 * PX, PX);
    ctx.fillRect(x + 3 * PX, y + 21 * PX, 2 * PX, PX);
    ctx.fillRect(x + 6 * PX, y + 21 * PX, 2 * PX, PX);
  } else {
    const f = Math.floor(rf / 6) % 2;
    if (f === 0) {
      ctx.fillRect(x + 2 * PX, y + 20 * PX, 3 * PX, PX);
      ctx.fillRect(x + 5 * PX, y + 20 * PX, 2 * PX, PX);
      ctx.fillRect(x + 2 * PX, y + 21 * PX, 2 * PX, 2 * PX);
      ctx.fillRect(x + 5 * PX, y + 21 * PX, PX, PX);
      ctx.fillRect(x + 2 * PX, y + 22 * PX, 3 * PX, PX);
    } else {
      ctx.fillRect(x + 2 * PX, y + 20 * PX, 2 * PX, PX);
      ctx.fillRect(x + 5 * PX, y + 20 * PX, 3 * PX, PX);
      ctx.fillRect(x + 3 * PX, y + 21 * PX, PX, PX);
      ctx.fillRect(x + 5 * PX, y + 21 * PX, 2 * PX, 2 * PX);
      ctx.fillRect(x + 5 * PX, y + 22 * PX, 3 * PX, PX);
    }
  }
}

export function drawCactus(
  ctx: CanvasRenderingContext2D,
  x: number,
  col: string,
  v: number,
) {
  ctx.fillStyle = col;
  if (v === 0) {
    ctx.fillRect(x + 2 * PX, GROUND - 14 * PX, 3 * PX, 14 * PX);
    ctx.fillRect(x - 2 * PX, GROUND - 10 * PX, 2 * PX, 5 * PX);
    ctx.fillRect(x - 2 * PX, GROUND - 10 * PX, 7 * PX, 2 * PX);
    ctx.fillRect(x + 5 * PX, GROUND - 9 * PX, 2 * PX, 4 * PX);
    ctx.fillRect(x + 2 * PX, GROUND - 9 * PX, 6 * PX, 2 * PX);
  } else if (v === 1) {
    [0, 28].forEach((ox) => {
      ctx.fillRect(x + ox + 2 * PX, GROUND - 12 * PX, 3 * PX, 12 * PX);
      ctx.fillRect(x + ox, GROUND - 8 * PX, 2 * PX, 4 * PX);
      ctx.fillRect(x + ox, GROUND - 8 * PX, 7 * PX, 2 * PX);
    });
  } else {
    [0, 18, 36].forEach((ox) => {
      ctx.fillRect(x + ox + PX, GROUND - 8 * PX, 2 * PX, 8 * PX);
      ctx.fillRect(x + ox, GROUND - 6 * PX, PX, 3 * PX);
      ctx.fillRect(x + ox, GROUND - 6 * PX, 4 * PX, PX);
    });
  }
}

export function drawBird(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  col: string,
  rf: number,
) {
  ctx.fillStyle = col;
  const P = 3;
  const w = Math.floor(rf / 8) % 2;
  ctx.fillRect(x, y, 4 * P, 2 * P);
  ctx.fillRect(x - P, w ? y + 2 * P : y - 2 * P, 3 * P, P);
  ctx.fillRect(x + 4 * P, w ? y + 2 * P : y - 2 * P, 3 * P, P);
  ctx.fillRect(x - 2 * P, y + P, 2 * P, P);
}

export function drawCloud(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  col: string,
) {
  ctx.fillStyle = col;
  const P = 4;
  const cells: Array<[number, number]> = [
    [0, 2],
    [1, 2],
    [2, 2],
    [3, 2],
    [4, 2],
    [5, 2],
    [6, 2],
    [1, 1],
    [2, 1],
    [3, 1],
    [4, 1],
    [5, 1],
    [0, 0],
    [1, 0],
    [2, 0],
    [3, 0],
    [4, 0],
    [5, 0],
    [6, 0],
  ];
  cells.forEach(([c, r]) => ctx.fillRect(x + c * P, y + r * P, P, P));
}
