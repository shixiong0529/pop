import clsx from "clsx";

/**
 * 泡泡头像：由注册时随机分配的种子（十六进制字符串）确定性地组合出一个卡通形象，
 * 同一个用户在任何地方看到的头像都一样，无需上传图片。
 */
const BODY = ["#FFB4A2", "#FFD6A5", "#FBEA8C", "#C5F0A4", "#9BE7F0", "#A9C8FF", "#C3B5FF", "#FFC2EC", "#F7B7C8", "#B7E6D4", "#FFCFA8", "#DCE8A6"];
const BG = ["#FFF1E6", "#FDE6EA", "#E6F2EC", "#E5ECFE", "#F3F0EA", "#FFF6D6", "#EEE8FF", "#E4F6F7"];
const INK = "#2A2A30";
const PINK = "#FF8597";
const POP = "#FF5B3A";

function bytes(seed: string) {
  const clean = (seed || "000000000000").replace(/[^0-9a-f]/gi, "").padEnd(12, "0");
  return Array.from({ length: 6 }, (_, i) => parseInt(clean.slice(i * 2, i * 2 + 2), 16));
}

function Ears({ kind, body }: { kind: number; body: string }) {
  switch (kind) {
    case 0: // 小熊
      return (
        <g>
          <circle cx="15" cy="23" r="7.5" fill={body} />
          <circle cx="49" cy="23" r="7.5" fill={body} />
          <circle cx="15" cy="23" r="3.6" fill={PINK} opacity="0.5" />
          <circle cx="49" cy="23" r="3.6" fill={PINK} opacity="0.5" />
        </g>
      );
    case 1: // 兔耳
      return (
        <g>
          <ellipse cx="23" cy="10" rx="5.2" ry="12.5" fill={body} transform="rotate(-12 23 10)" />
          <ellipse cx="41" cy="10" rx="5.2" ry="12.5" fill={body} transform="rotate(12 41 10)" />
          <ellipse cx="23" cy="11" rx="2.3" ry="8" fill={PINK} opacity="0.5" transform="rotate(-12 23 11)" />
          <ellipse cx="41" cy="11" rx="2.3" ry="8" fill={PINK} opacity="0.5" transform="rotate(12 41 11)" />
        </g>
      );
    case 2: // 猫耳
      return (
        <g strokeLinejoin="round">
          <path d="M13.5 31 L16.5 9.5 L30 21 Z" fill={body} stroke={body} strokeWidth="3" />
          <path d="M50.5 31 L47.5 9.5 L34 21 Z" fill={body} stroke={body} strokeWidth="3" />
          <path d="M17 25 L18.5 15 L25 21 Z" fill={PINK} opacity="0.5" />
          <path d="M47 25 L45.5 15 L39 21 Z" fill={PINK} opacity="0.5" />
        </g>
      );
    case 3: // 天线
      return (
        <g>
          <path d="M32 21 Q30 14 33 9" stroke={INK} strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <circle cx="33.5" cy="8" r="3.6" fill={POP} />
          <circle cx="32.4" cy="6.9" r="1.1" fill="#fff" opacity="0.8" />
        </g>
      );
    default: // 嫩芽
      return (
        <g>
          <path d="M32 21 L32 13" stroke="#4FA86B" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse cx="27.5" cy="11.5" rx="5" ry="2.8" fill="#6CC487" transform="rotate(-25 27.5 11.5)" />
          <ellipse cx="36.5" cy="11.5" rx="5" ry="2.8" fill="#86D49C" transform="rotate(25 36.5 11.5)" />
        </g>
      );
  }
}

function Eye({ kind, x, y }: { kind: number; x: number; y: number }) {
  switch (kind) {
    case 1: // 笑眼
      return <path d={`M${x - 3} ${y + 1} Q${x} ${y - 3.2} ${x + 3} ${y + 1}`} stroke={INK} strokeWidth="2.1" fill="none" strokeLinecap="round" />;
    case 2: // 星星眼
      return (
        <g>
          <circle cx={x} cy={y} r="3.6" fill={INK} />
          <circle cx={x + 1.2} cy={y - 1.3} r="1.3" fill="#fff" />
          <circle cx={x - 1.3} cy={y + 1.3} r="0.6" fill="#fff" />
        </g>
      );
    case 3: // 困困眼
      return <path d={`M${x - 3} ${y} Q${x} ${y + 2.6} ${x + 3} ${y}`} stroke={INK} strokeWidth="2.1" fill="none" strokeLinecap="round" />;
    default: // 豆豆眼
      return (
        <g>
          <circle cx={x} cy={y} r="2.8" fill={INK} />
          <circle cx={x + 0.9} cy={y - 0.9} r="0.9" fill="#fff" />
        </g>
      );
  }
}

function Mouth({ kind }: { kind: number }) {
  switch (kind) {
    case 1:
      return <ellipse cx="32" cy="45.5" rx="1.9" ry="2.3" fill={INK} />;
    case 2:
      return <path d="M28 44 Q30 46.6 32 44 Q34 46.6 36 44" stroke={INK} strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round" />;
    case 3: // 露出小牙的咧嘴笑
      return (
        <g>
          <path d="M27.5 43.4 Q32 49.6 36.5 43.4 Z" fill={INK} strokeLinejoin="round" />
          <path d="M30.6 43.4 L31.5 45.4 L32.4 43.4 Z M32.6 43.4 L33.4 45.1 L34.2 43.4 Z" fill="#fff" />
        </g>
      );
    case 4: // 吐舌头
      return (
        <g>
          <path d="M28 43.6 Q32 48.6 36 43.6" stroke={INK} strokeWidth="1.9" fill="none" strokeLinecap="round" />
          <path d="M31 45.6 Q32.6 49.4 34.2 45.4" fill={PINK} />
        </g>
      );
    default:
      return <path d="M28.6 44 Q32 47.6 35.4 44" stroke={INK} strokeWidth="2" fill="none" strokeLinecap="round" />;
  }
}

function Accessory({ kind }: { kind: number }) {
  if (kind === 1)
    return (
      <g transform="translate(46 16) rotate(18)">
        <path d="M0 0 L-6 -3.6 L-6 3.6 Z M0 0 L6 -3.6 L6 3.6 Z" fill={POP} strokeLinejoin="round" stroke={POP} strokeWidth="1.2" />
        <circle r="1.9" fill="#E8432A" />
      </g>
    );
  if (kind === 2)
    return <path d="M9 13 L10.4 16.6 L14 18 L10.4 19.4 L9 23 L7.6 19.4 L4 18 L7.6 16.6 Z" fill="#FFC93C" />;
  if (kind === 3)
    return (
      <g fill="#C0705A" opacity="0.55">
        <circle cx="18" cy="42" r="0.8" />
        <circle cx="20.5" cy="44" r="0.8" />
        <circle cx="21" cy="41.2" r="0.8" />
        <circle cx="46" cy="42" r="0.8" />
        <circle cx="43.5" cy="44" r="0.8" />
        <circle cx="43" cy="41.2" r="0.8" />
      </g>
    );
  return null;
}

export function BubbleAvatar({
  seed,
  size = 40,
  className,
  label,
}: {
  seed: string;
  size?: number;
  className?: string;
  /** 提供时作为图片的无障碍名称，否则视为装饰 */
  label?: string;
}) {
  const [b0, b1, b2, b3, b4, b5] = bytes(seed);
  const body = BODY[b0 % BODY.length];
  const bg = BG[b1 % BG.length];
  const eyes = b3 % 5;
  const accessory = b5 % 5;

  return (
    <span
      className={clsx("inline-block shrink-0 overflow-hidden rounded-full ring-1 ring-black/[0.06]", className)}
      style={{ width: size, height: size, background: bg }}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} className="block">
        {accessory === 2 && <Accessory kind={2} />}
        <Ears kind={b2 % 5} body={body} />
        <ellipse cx="32" cy="39" rx="20" ry="18" fill={body} />
        <ellipse cx="25" cy="30" rx="6" ry="3.4" fill="#fff" opacity="0.28" transform="rotate(-20 25 30)" />
        <ellipse cx="19.5" cy="43.5" rx="3.4" ry="2.1" fill={PINK} opacity={accessory === 3 ? 0.25 : 0.45} />
        <ellipse cx="44.5" cy="43.5" rx="3.4" ry="2.1" fill={PINK} opacity={accessory === 3 ? 0.25 : 0.45} />
        {eyes === 4 ? (
          <>
            <Eye kind={0} x={25} y={37} />
            <Eye kind={1} x={39} y={37} />
          </>
        ) : (
          <>
            <Eye kind={eyes} x={25} y={37} />
            <Eye kind={eyes} x={39} y={37} />
          </>
        )}
        <Mouth kind={b4 % 5} />
        {(accessory === 1 || accessory === 3) && <Accessory kind={accessory} />}
      </svg>
    </span>
  );
}
