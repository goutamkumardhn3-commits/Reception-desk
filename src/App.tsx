import { useEffect, useState } from "react";
import { useCreateOwner, useOwner } from "./api/hooks";
import type { OwnerId, PetId } from "./api/types";
import { Sidebar } from "./components/Sidebar";
import { OwnerForm } from "./components/forms";
import { Workspace, type Panel } from "./components/Workspace";

export function App() {
  const [query, setQuery] = useState("");
  const [ownerId, setOwnerId] = useState<OwnerId | null>(null);
  const [petId, setPetId] = useState<PetId | null>(null);
  const [panel, setPanel] = useState<Panel>("none");
  const [toast, setToast] = useState<string | null>(null);
  const owner = useOwner(ownerId);
  const createOwner = useCreateOwner();

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const select = (id: OwnerId) => { setOwnerId(id); setPetId(null); setPanel("none"); };
  const startNew = () => { setOwnerId(null); setPetId(null); setPanel("newOwner"); };

  return (
    <div className="app">
      <Sidebar query={query} onQuery={setQuery} selected={ownerId} onSelect={select} onNew={startNew} />
      <main className="main">
        {panel === "newOwner" && (
          <OwnerForm title="New owner" onCancel={() => setPanel("none")}
            onSave={async (d) => {
              const o = await createOwner.mutateAsync(d);
              setQuery(""); setOwnerId(o.id); setPetId(null); setPanel("addPet");
              setToast("Owner created. Add their first pet.");
            }} />
        )}
        {ownerId === null && panel !== "newOwner" && (
          <div className="empty"><h2>Who is at the desk?</h2>
            <p>Search by last name, or create a new owner if they haven’t been here before.</p></div>
        )}
        {ownerId !== null && owner.isPending && <p className="mute">Loading owner…</p>}
        {ownerId !== null && owner.isError && <p className="err" role="alert">{owner.error.message}</p>}
        {owner.data && ownerId !== null && (
          <Workspace owner={owner.data} petId={petId} panel={panel} onPanel={setPanel} onSelectPet={setPetId} onToast={setToast} />
        )}
      </main>
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
