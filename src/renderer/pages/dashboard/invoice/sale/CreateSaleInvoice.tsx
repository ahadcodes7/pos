import { useState } from "react";
import CardView from "./CardView";
import StagedView from "./StagedView";
import QuickEntryView from "./QuickEntryView";
import { useSaleDraft } from "./hooks/useSaleDraft";
import { viewModes, type ViewMode } from "./sale-data";
import { InvoiceToolbar } from "./components/InvoiceToolbar";

const VIEW_KEY = "nayahisab.sale.view";

// Storage can be unavailable (private mode, blocked site data); the view then defaults to "card".
function readView(): ViewMode {
  try {
    const saved = localStorage.getItem(VIEW_KEY);
    return viewModes.find((m) => m === saved) ?? "card";
  } catch {
    return "card";
  }
}

function saveView(view: ViewMode) {
  try {
    localStorage.setItem(VIEW_KEY, view);
  } catch {
    // Not remembering the view is harmless.
  }
}

/** Sale invoice: one shared draft, three ways to enter it. */
export default function CreateSaleInvoice() {
  const draft = useSaleDraft();
  const [view, setView] = useState<ViewMode>(readView);

  const changeView = (next: ViewMode) => {
    setView(next);
    saveView(next);
  };

  const { state, actions } = draft;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border/70 px-5 py-3">
        <InvoiceToolbar
          orders={state.orders}
          activeOrderId={state.activeOrderId}
          onSelectOrder={actions.setActiveOrder}
          onAddOrder={actions.addOrder}
          onDeleteOrder={actions.deleteOrder}
          view={view}
          onViewChange={changeView}
        />
      </div>
      {view === "card" && <CardView draft={draft} />}
      {view === "staged" && <StagedView draft={draft} />}
      {view === "grid" && <QuickEntryView draft={draft} />}
    </div>
  );
}
