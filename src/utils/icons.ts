import type { IconBaseProps, IconType } from "react-icons/lib/iconBase";
import type * as React from "react";

export type IconComponent = React.ComponentType<IconBaseProps>;

export const toIconComponent = (Icon: IconType): IconComponent =>
  Icon as IconComponent;
