"use client";
import Image, { ImageProps } from "next/image";
import { useState } from "react";

export default function ClientImage(props: ImageProps & { fallbackSrc?: string }) {
  const { fallbackSrc = "/robot.png", ...rest } = props;
  const [src, setSrc] = useState(props.src);

  return (
    <Image
      {...rest}
      src={src}
      onError={() => setSrc(fallbackSrc)}
    />
  );
} 