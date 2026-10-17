// 泡泡互动：时间与消息展示相关的小工具（按访问者本地时区显示）

const timeFmt = new Intl.DateTimeFormat("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
const fullFmt = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const WEEK = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

export const timeLabel = (ts: number) => timeFmt.format(ts);
export const fullTime = (ts: number) => fullFmt.format(ts);

export function dayKey(ts: number) {
  const d = new Date(ts);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export function dayLabel(ts: number, now = Date.now()) {
  const d = new Date(ts);
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((today.getTime() - new Date(d).setHours(0, 0, 0, 0)) / 86_400_000);
  if (diff === 0) return "今天";
  if (diff === 1) return "昨天";
  const md = `${d.getMonth() + 1}月${d.getDate()}日 ${WEEK[d.getDay()]}`;
  return d.getFullYear() === today.getFullYear() ? md : `${d.getFullYear()}年${md}`;
}

const segmenter = typeof Intl !== "undefined" && "Segmenter" in Intl ? new Intl.Segmenter("zh", { granularity: "grapheme" }) : null;
const EMOJI_ONLY = /^(?:\p{Extended_Pictographic}|\p{Emoji_Component}|‍|️|\s)+$/u;

/** 只含 1–3 个表情的消息放大显示，不加气泡 */
export function isBigEmoji(text: string) {
  if (!EMOJI_ONLY.test(text) || /^[\d#*\s]+$/.test(text)) return false;
  const count = segmenter ? [...segmenter.segment(text.replace(/\s/g, ""))].length : [...text].length;
  return count > 0 && count <= 3;
}

/** 按 Unicode 字符计数（与服务端一致，表情算 1 个） */
export const charCount = (text: string) => [...text].length;
