import { Image, useCanvas } from "@fcannizzaro/streamdeck-react";

export function ImageKey({ src }: { src: string }) {
  const { width, height } = useCanvas();

  return <Image src={src} width={width} height={height} fit="contain" />;
}
