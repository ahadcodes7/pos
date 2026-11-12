import * as React from "react";

import { cn } from "@/renderer/lib/utils";
import { fieldVariants } from "./field";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(fieldVariants, "flex field-sizing-content h-auto min-h-20 py-2.5", className)}
      {...props}
    />
  );
}

export { Textarea };
