import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { useTheme } from "@/renderer/context/theme-context";
import { Toaster as Sonner } from "sonner";

const Toaster = ({ ...props }) => {
  const { mode = "light" } = useTheme();

  return (
    <Sonner
      theme={mode}
      className="toaster group"
      icons={{
        success: (
          <CircleCheckIcon className="size-4 text-success" />
        ),
        info: <InfoIcon className="size-4 text-chart-2" />,
        warning: (
          <TriangleAlertIcon className="size-4 text-warning" />
        ),
        error: <OctagonXIcon className="size-4 text-destructive" />,
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
