import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-[oklch(0.68_0.17_150)]" />
        ),
        info: <InfoIcon className="size-4 text-[oklch(0.65_0.16_190)]" />,
        warning: (
          <TriangleAlertIcon className="size-4 text-[oklch(0.8_0.15_85)]" />
        ),
        error: <OctagonXIcon className="size-4 text-[oklch(0.62_0.22_25)]" />,
        loading: (
          <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast:
            "border shadow-lg backdrop-blur-md rounded-lg px-4 py-3 text-sm flex items-start gap-3",

          success:
            "!bg-popover !text-popover-foreground !border-popover/75 !shadow-lg",

          info: "!bg-popover !text-popover-foreground !border-popover/75 !shadow-lg",

          warning:
            "!bg-popover !text-popover-foreground !border-popover/75 !shadow-lg",

          error:
            "!bg-popover !text-popover-foreground !border-popover/75 !shadow-lg",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
