"use client";

import type { ComponentType } from "react";
import dynamic from "next/dynamic";

const Spline = dynamic(
  () =>
    Promise.resolve(
      require(
        "../../node_modules/@splinetool/react-spline/dist/react-spline.js"
      ).default as ComponentType<Record<string, unknown>>
    ),
  { ssr: false }
);

type ConnectWalletSplineSceneProps = {
  className?: string;
};

export function ConnectWalletSplineScene({
  className = "",
}: ConnectWalletSplineSceneProps) {
  function handleWheel(event: React.WheelEvent<HTMLDivElement>) {
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <div
      onWheelCapture={handleWheel}
      className={`relative h-full min-h-[320px] w-full overflow-hidden bg-[#0A0B0D] [&_*]:bg-transparent [&_canvas]:!bg-[#0A0B0D] [&_div]:bg-transparent ${className}`}
    >
      <Spline
        scene="https://prod.spline.design/Gmmrw2nSQKfTGTSb/scene.splinecode"
        className="h-full w-full bg-transparent"
      />
    </div>
  );
}
