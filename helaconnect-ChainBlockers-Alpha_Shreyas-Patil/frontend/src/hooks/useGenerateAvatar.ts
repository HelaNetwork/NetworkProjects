import React from "react";

function useGenerateAvatar() {
  const generateAvatar = (seed?: string) => {
    // Use seed-based randomness so the same user always gets the same avatar
    const hash = seed
      ? seed.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
      : Math.random() * 100000;

    const rng = (offset = 0) => ((hash * 9301 + offset * 49297 + 233) % 1000) / 1000;

    const svgWidth = 64;
    const svgHeight = 64;

    const hue = Math.floor(rng(1) * 360);
    const sat = Math.floor(rng(2) * 60) + 40;
    const lig = Math.floor(rng(3) * 30) + 55;
    const faceColor = `hsl(${hue}, ${sat}%, ${lig}%)`;

    const eyeColor = '#1a1a1a';
    const mouthColor = '#1a1a1a';

    const eye1X = Math.floor(rng(4) * 12) + 20;
    const eye2X = Math.floor(rng(5) * 12) + 36;
    const eyeY = Math.floor(rng(6) * 8) + 24;

    const mouthShape = Math.floor(rng(7) * 5);
    let mouthPath: string;
    switch (mouthShape) {
      case 1: mouthPath = `M20 45 Q 32 30 44 45`; break;
      case 2: mouthPath = `M20 45 Q 32 50 44 45`; break;
      case 3: mouthPath = `M20 40 Q 32 30 44 40`; break;
      case 4: mouthPath = `M20 40 Q 32 25 44 40`; break;
      default: mouthPath = `M20 40 Q 32 40 44 40`;
    }

    const svgString = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" width="${svgWidth}" height="${svgHeight}">
  <circle cx="32" cy="32" r="30" fill="${faceColor}" />
  <circle cx="${eye1X}" cy="${eyeY}" r="4" fill="${eyeColor}" />
  <circle cx="${eye2X}" cy="${eyeY}" r="4" fill="${eyeColor}" />
  <path d="${mouthPath}" fill="none" stroke="${mouthColor}" strokeWidth="3" />
</svg>`;

    const base64String = btoa(svgString);
    return `data:image/svg+xml;base64,${base64String}`;
  };

  return { generateAvatar };
}

export default useGenerateAvatar;
