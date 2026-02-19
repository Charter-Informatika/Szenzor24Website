import React from "react";

export interface InfoIconProps {
  /**
   * The text or react node that will be shown inside the tooltip.
   * Can be a string, JSX, or any other renderable content.
   */
  description: React.ReactNode;
  /**
   * Optional additional class names for the outer container.
   */
  className?: string;
  /**
   * Tooltip position relative to the icon. Currently supports
   * "top" (default), "right", "bottom" and "left".
   */
  position?: "top" | "right" | "bottom" | "left";
}

// ensure undefined is not part of the key type for the lookup object
const positionClasses: Record<NonNullable<InfoIconProps["position"]>, string> = {
  top: "bottom-full left-1/2 transform -translate-x-1/2 mb-2",
  right: "top-1/2 left-full transform -translate-y-1/2 ml-2",
  bottom: "top-full left-1/2 transform -translate-x-1/2 mt-2",
  left: "top-1/2 right-full transform -translate-y-1/2 mr-2",
};

/**
 * A tiny "i" icon that reveals a short description when hovered/focused.
 *
 * Usage:
 * ```tsx
 * <InfoIcon description="Ez egy kis magyarázat" />
 * ```
 *
 * It uses Tailwind utility classes and does not add any dependencies.
 */
export const InfoIcon: React.FC<InfoIconProps> = ({
  description,
  className = "",
  position = "top",
}) => {
  const posClass = positionClasses[position] || positionClasses.top;
  return (
    <div className={`relative inline-block ${className} group`}> 
      {/* icon itself (just a letter i) */}
      <span
        aria-label="információ"
        role="button"
        tabIndex={0}
        className="flex items-center justify-center w-4 h-4 text-xs font-bold text-white bg-blue-500 rounded-full cursor-pointer"
      >
        i
      </span>
      {/* tooltip box */}
      <div
        className={`pointer-events-none absolute z-10 hidden max-w-xs rounded bg-gray-800 p-2 text-xs text-white opacity-0 transition-opacity duration-150 group-hover:block group-focus-within:block group-hover:opacity-100 group-focus-within:opacity-100 ${posClass}`}
      >
        {description}
      </div>
    </div>
  );
};

export default InfoIcon;
