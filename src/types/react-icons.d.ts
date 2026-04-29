import type { IconBaseProps } from "react-icons/lib/iconBase";
import type * as React from "react";

declare module "react-icons/lib/iconBase" {
  export type IconType = (props: IconBaseProps) => React.ReactElement;
}
