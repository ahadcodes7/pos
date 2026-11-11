import { useState } from "react";
import CardView from "./CardView";
import TableView from "./TableView";
import type { ViewMode } from "./sale-data";

export default function CreateSaleInvoice() {
  const [viewMode, setViewMode] = useState<ViewMode>("card");

  return (
    <div className="h-full flex flex-col">
      {/* View Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === "card" ? (
          <CardView viewMode={viewMode} setViewMode={setViewMode} />
        ) : (
          <TableView viewMode={viewMode} setViewMode={setViewMode} />
        )}
      </div>
    </div>
  );
}
