import Image, { type ImageProps } from "next/image";
import clsx from "clsx";
import type { ImageAsset } from "@/lib/types";

type Props = Omit<ImageProps, "src" | "width" | "height" | "placeholder" | "blurDataURL" | "alt"> & {
  asset: ImageAsset;
  alt: string;
  /** 填充父容器（父容器需 relative + 尺寸） */
  fill?: boolean;
};

/** 带模糊占位与主色底的图片 */
export function Img({ asset, alt, fill, className, style, sizes, quality = 80, ...rest }: Props) {
  const common = {
    src: asset.src,
    alt,
    placeholder: "blur" as const,
    blurDataURL: asset.blur,
    quality,
    sizes: sizes ?? (fill ? "100vw" : undefined),
    style: { backgroundColor: asset.color, ...style },
    className: clsx(fill && "object-cover", className),
    ...rest,
  };
  return fill ? (
    <Image {...common} alt={alt} fill />
  ) : (
    <Image {...common} alt={alt} width={asset.w} height={asset.h} />
  );
}
