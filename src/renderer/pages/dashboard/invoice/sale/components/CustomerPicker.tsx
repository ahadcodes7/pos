import { useState } from "react";
import { UserPlus } from "lucide-react";
import { AddCustomerDialog, SearchableSelect } from "@/renderer/components/common";
import type { NewCustomer } from "@/renderer/components/common/AddCustomerDialog";
import { Button } from "@/renderer/components/ui/button";
import { cn } from "@/renderer/lib/utils";
import { useInfiniteCustomers } from "../sale-data";

/** Customer select plus an "add customer" button that opens the dialog. */
export function CustomerPicker({
  customerId,
  onChange,
  className,
}: {
  customerId: string | null;
  onChange: (customerId: string | null) => void;
  className?: string;
}) {
  const [addOpen, setAddOpen] = useState(false);

  // NOTE: a customer created in the dialog is not stored anywhere yet, so it cannot be
  // selected (the draft only accepts known customers). Pre-existing behavior.
  const handleAdd = (customer: NewCustomer) => onChange(customer.id);

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <SearchableSelect
        value={customerId}
        onValueChange={(val) => onChange(val === null ? null : String(val))}
        placeholder="Select customer"
        fetchFn={useInfiniteCustomers}
        labelKey="name"
        valueKey="id"
        className="min-w-0 flex-1"
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="shrink-0"
        aria-label="Add customer"
        title="Add customer"
        onClick={() => setAddOpen(true)}
      >
        <UserPlus />
      </Button>
      <AddCustomerDialog open={addOpen} onOpenChange={setAddOpen} onAdd={handleAdd} />
    </div>
  );
}
