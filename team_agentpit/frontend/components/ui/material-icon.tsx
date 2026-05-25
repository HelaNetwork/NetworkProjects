import { cn } from "@/lib/utils";

type MaterialIconProps = {
  name: string;
  className?: string;
  fill?: boolean;
};

export function MaterialIcon({
  name,
  className,
  fill = false,
}: MaterialIconProps) {
  return (
    <span
      className={cn("material-symbols-outlined", className)}
      style={{ fontVariationSettings: fill ? '"FILL" 1' : undefined }}
    >
      {name}
    </span>
  );
}
