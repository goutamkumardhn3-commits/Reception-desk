import { useAddPet, useAddVisit, useUpdateOwner, useUpdatePet } from "../api/hooks";
import type { Owner, Pet, PetId } from "../api/types";
import { OwnerForm, PetForm, VisitForm } from "./forms";

export type Panel = "none" | "newOwner" | "editOwner" | "addPet" | "editPet";

interface Props {
  owner: Owner;
  petId: PetId | null;
  panel: Panel;
  onPanel: (p: Panel) => void;
  onSelectPet: (id: PetId | null) => void;
  onToast: (msg: string) => void;
}

export function Workspace({ owner, petId, panel, onPanel, onSelectPet, onToast }: Props) {
  const updateOwner = useUpdateOwner(owner.id);
  const addPet = useAddPet(owner.id);
  const pet = owner.pets.find((p) => p.id === petId) ?? null;
  const close = () => onPanel("none");

  return (
    <>
      {panel === "editOwner" ? (
        <OwnerForm title="Edit owner" initial={owner} onCancel={close}
          onSave={async (d) => { await updateOwner.mutateAsync(d); close(); onToast("Owner updated"); }} />
      ) : (
        <section className="card">
          <div className="bar"><h2>{owner.firstName} {owner.lastName}</h2><span className="sp" />
            <button className="btn sm ghost" onClick={() => onPanel("editOwner")}>Edit owner</button></div>
          <dl className="grid kv">
            <div><dt>Address</dt><dd>{owner.address}</dd></div>
            <div><dt>City</dt><dd>{owner.city}</dd></div>
            <div><dt>Telephone</dt><dd>{owner.telephone}</dd></div>
          </dl>
        </section>
      )}

      <div className="cols">
        <section>
          <div className="bar"><h3>Pets</h3><span className="sp" /><button className="btn sm" onClick={() => onPanel("addPet")}>Add pet</button></div>
          {panel === "addPet" && (
            <PetForm title="New pet" onCancel={close}
              onSave={async (d) => { const p = await addPet.mutateAsync(d); onSelectPet(p.id); close(); onToast(`${p.name} added`); }} />
          )}
          {!owner.pets.length && panel !== "addPet" && <p className="mute">No pets registered yet.</p>}
          {owner.pets.map((p) => (
            <button key={p.id} className="pet" aria-current={p.id === petId} onClick={() => { onSelectPet(p.id); close(); }}>
              <strong>{p.name}</strong><span className="tag">{p.type.name}</span><span className="sp" />
              <small className="mute">{p.visits.length} {p.visits.length === 1 ? "visit" : "visits"}</small>
            </button>
          ))}
        </section>

        <section>
          {pet ? <PetDetail key={pet.id} owner={owner} pet={pet} editing={panel === "editPet"} onPanel={onPanel} onToast={onToast} />
               : <div className="card mute">Select a pet to see its visits and register a new one.</div>}
        </section>
      </div>
    </>
  );
}

function PetDetail({ owner, pet, editing, onPanel, onToast }: { owner: Owner; pet: Pet; editing: boolean; onPanel: (p: Panel) => void; onToast: (m: string) => void }) {
  const updatePet = useUpdatePet(owner.id, pet.id);
  const addVisit = useAddVisit(owner.id, pet.id);
  if (editing) {
    return <PetForm title={`Edit ${pet.name}`} initial={pet} onCancel={() => onPanel("none")}
      onSave={async (d) => { await updatePet.mutateAsync(d); onPanel("none"); onToast("Pet updated"); }} />;
  }
  const visits = [...pet.visits].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <div className="card">
      <div className="bar"><h3>{pet.name}</h3><span className="tag">{pet.type.name}</span><span className="sp" />
        <button className="btn sm ghost" onClick={() => onPanel("editPet")}>Edit pet</button></div>
      <p className="mute">Born {pet.birthDate}</p>
      <VisitForm onSave={async (d) => { await addVisit.mutateAsync(d); onToast("Visit registered"); }} />
      <h4>Previous visits</h4>
      {!visits.length && <p className="mute">No visits yet.</p>}
      {visits.map((v) => <div className="visit" key={v.id}><time>{v.date}</time><div>{v.description}</div></div>)}
    </div>
  );
}
