import type { IPContent } from "@/lib/types";
import { labubu } from "./labubu";
import { molly } from "./molly";
import { skullpanda } from "./skullpanda";
import { dimoo } from "./dimoo";
import { hirono } from "./hirono";
import { crybaby } from "./crybaby";
import { twinkleTwinkle } from "./twinkle-twinkle";
import { pucky } from "./pucky";
import { hacipupu } from "./hacipupu";
import { peachRiot } from "./peach-riot";
import { kubo } from "./kubo";
import { nyota } from "./nyota";
import { chaka, zsiga, polar, pinoJelly, inosoul, tinyTiny, duckoo, merodi, sweetBean, moons1001, supertutu } from "./rising";

/**
 * 手写故事的 IP，展示顺序即数组顺序。官网新出现的 IP 会先被自动收录（见 ./auto.ts），
 * 补写故事后：新建内容文件加入此数组，并在 scripts/ips.mjs 登记，再运行 pnpm data:update。
 */
export const IPS: IPContent[] = [
  labubu,
  molly,
  skullpanda,
  dimoo,
  hirono,
  crybaby,
  twinkleTwinkle,
  pucky,
  hacipupu,
  peachRiot,
  kubo,
  nyota,
  chaka,
  zsiga,
  polar,
  pinoJelly,
  inosoul,
  tinyTiny,
  duckoo,
  merodi,
  sweetBean,
  moons1001,
  supertutu,
];
