/** 规格信息列表 */
export function SpecList({ items }: { items: { k: string; v?: string | number | null }[] }) {
  const rows = items.filter((i) => i.v !== undefined && i.v !== null && i.v !== "");
  return (
    <dl className="divide-y divide-current/10 border-y border-current/10">
      {rows.map((r) => (
        <div key={r.k} className="grid grid-cols-[6.5rem_1fr] gap-4 py-3.5 text-[14px]">
          <dt className="opacity-70">{r.k}</dt>
          <dd className="font-medium leading-6">{r.v}</dd>
        </div>
      ))}
    </dl>
  );
}
