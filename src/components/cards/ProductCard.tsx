import Link from "next/link";
import { ViewTransition } from "react";
import clsx from "clsx";
import { Img } from "@/components/ui/Img";
import { FavoriteButton } from "@/components/favorites/FavoriteButton";
import { SecretVeil } from "@/components/product/SecretVeil";
import type { Product } from "@/lib/types";

type Props = {
  product: Product;
  /** 副标题（系列名 / IP 名） */
  caption?: string;
  morph?: boolean;
  className?: string;
  sizes?: string;
  /** 隐藏款以剪影呈现，悬停 / 点击揭晓 */
  veil?: boolean;
  rounded?: string;
};

export function ProductCard({ product, caption, morph = false, className, sizes, veil = false, rounded = "rounded-[1.4rem]" }: Props) {
  const img = (
    <Img
      asset={product.image}
      alt=""
      fill
      sizes={sizes ?? "(min-width:1280px) 20vw, (min-width:768px) 30vw, 50vw"}
      className="transition-transform duration-[1.1s] ease-[var(--ease-soft)] group-hover:scale-[1.06]"
    />
  );
  const media = veil && product.isSecret ? <SecretVeil>{img}</SecretVeil> : img;
  return (
    <Link href={`/products/${product.slug}`} transitionTypes={["nav-forward"]} className={clsx("group block", className)}>
      <div className={clsx("relative aspect-square overflow-hidden", rounded)} style={{ backgroundColor: product.image.color }}>
        {morph ? (
          <ViewTransition name={`product-${product.slug}`} share="morph" default="none">
            <div className="absolute inset-0">{media}</div>
          </ViewTransition>
        ) : (
          media
        )}
        {product.isSecret && (
          <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-2.5 py-1 text-[10.5px] font-bold tracking-[0.12em] text-white backdrop-blur-md">
            SECRET
          </span>
        )}
        <div className="absolute right-2.5 top-2.5 translate-y-1 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
          <FavoriteButton
            item={{
              kind: "product",
              key: product.slug,
              title: product.name,
              subtitle: caption,
              href: `/products/${product.slug}`,
              image: product.image.src,
              color: product.image.color,
            }}
          />
        </div>
      </div>
      <div className="mt-3 px-0.5">
        <h3 className="line-clamp-1 text-[15px] font-semibold tracking-[-0.01em] text-[var(--t-ink)]">
          {product.isSecret && veil ? "隐藏款" : product.name}
        </h3>
        {caption && <p className="mt-0.5 line-clamp-1 text-[12.5px] text-[var(--t-ink)] opacity-70">{caption}</p>}
      </div>
    </Link>
  );
}
