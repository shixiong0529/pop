import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-svh place-items-center bg-paper px-6 text-center">
      <div>
        <p className="font-display text-[clamp(6rem,22vw,16rem)] font-black leading-none tracking-[-0.06em] text-outline text-ink/25">404</p>
        <h1 className="mt-4 font-zh-serif text-3xl font-bold">这个展厅还没有开放</h1>
        <p className="mt-3 text-ink-mute">你要找的页面不存在，或者已经被移到别处。</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-white">
            回到首页
          </Link>
          <Link href="/ips" className="rounded-full px-6 py-3 text-sm font-semibold ring-1 ring-line">
            IP 系列馆
          </Link>
        </div>
      </div>
    </div>
  );
}
