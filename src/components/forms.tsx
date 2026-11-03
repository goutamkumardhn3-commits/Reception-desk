import { useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import { usePetTypes } from "../api/hooks";
import { messageOf } from "../api/client";
import type { OwnerDraft, Pet, PetDraft, VisitDraft } from "../api/types";
import { localToday, validateOwner, validatePet, validateVisit, type Errors, type PetInput } from "../lib/validation";

function Field({ label, error, children }: { label: string; error: string | undefined; children: ReactNode }) {
  return (
    <label className="field">
      <span>{label}</span>
      {children}
      {error && <span className="err" role="alert">{error}</span>}
    </label>
  );
}

/** Shared submit state: pending flag plus a server error that the form shows inline. */
function useSubmit() {
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  async function run(fn: () => Promise<void>) {
    setSaving(true);
    setServerError(null);
    try { await fn(); } catch (e) { setServerError(messageOf(e)); } finally { setSaving(false); }
  }
  return { saving, serverError, run };
}

function Actions({ saving, label, error, onCancel }: { saving: boolean; label: string; error: string | null; onCancel: () => void }) {
  return (
    <>
      {error && <p className="err" role="alert">{error}</p>}
      <div className="bar">
        <button className="btn" disabled={saving}>{saving ? "Saving…" : label}</button>
        <button type="button" className="btn ghost" onClick={onCancel}>Cancel</button>
      </div>
    </>
  );
}

const OWNER_FIELDS = [
  ["firstName", "First name"], ["lastName", "Last name"], ["address", "Address"], ["city", "City"], ["telephone", "Telephone"],
] as const satisfies readonly (readonly [keyof OwnerDraft, string])[];

interface OwnerFormProps { title: string; initial?: OwnerDraft; onSave: (d: OwnerDraft) => Promise<void>; onCancel: () => void }

export function OwnerForm({ title, initial, onSave, onCancel }: OwnerFormProps) {
  const [draft, setDraft] = useState<OwnerDraft>({
    firstName: initial?.firstName ?? "", lastName: initial?.lastName ?? "", address: initial?.address ?? "",
    city: initial?.city ?? "", telephone: initial?.telephone ?? "",
  });
  const [errors, setErrors] = useState<Errors<OwnerDraft>>({});
  const { saving, serverError, run } = useSubmit();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = validateOwner(draft);
    if (!r.ok) return setErrors(r.errors);
    setErrors({});
    void run(() => onSave(r.value));
  };
  return (
    <form className="card" onSubmit={submit} noValidate>
      <h3>{title}</h3>
      <div className="grid">
        {OWNER_FIELDS.map(([key, label]) => (
          <Field key={key} label={label} error={errors[key]}>
            <input value={draft[key]} inputMode={key === "telephone" ? "numeric" : undefined}
              onChange={(e: ChangeEvent<HTMLInputElement>) => setDraft({ ...draft, [key]: e.target.value })} />
          </Field>
        ))}
      </div>
      <Actions saving={saving} label="Save owner" error={serverError} onCancel={onCancel} />
    </form>
  );
}

interface PetFormProps { title: string; initial?: Pet; onSave: (d: PetDraft) => Promise<void>; onCancel: () => void }

export function PetForm({ title, initial, onSave, onCancel }: PetFormProps) {
  const types = usePetTypes();
  const [input, setInput] = useState<PetInput>({
    name: initial?.name ?? "", birthDate: initial?.birthDate ?? "", typeId: initial ? String(initial.type.id) : "",
  });
  const [errors, setErrors] = useState<Errors<PetInput>>({});
  const { saving, serverError, run } = useSubmit();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = validatePet(input, types.data ?? [], localToday());
    if (!r.ok) return setErrors(r.errors);
    setErrors({});
    void run(() => onSave(r.value));
  };
  return (
    <form className="card" onSubmit={submit} noValidate>
      <h3>{title}</h3>
      <div className="grid">
        <Field label="Name" error={errors.name}>
          <input value={input.name} onChange={(e) => setInput({ ...input, name: e.target.value })} />
        </Field>
        <Field label="Birth date" error={errors.birthDate}>
          <input type="date" value={input.birthDate} max={localToday()} onChange={(e) => setInput({ ...input, birthDate: e.target.value })} />
        </Field>
        <Field label="Type" error={errors.typeId ?? (types.isError ? "Pet types failed to load" : undefined)}>
          <select value={input.typeId} onChange={(e) => setInput({ ...input, typeId: e.target.value })}>
            <option value="">Choose…</option>
            {(types.data ?? []).map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
        </Field>
      </div>
      <Actions saving={saving} label="Save pet" error={serverError} onCancel={onCancel} />
    </form>
  );
}

export function VisitForm({ onSave }: { onSave: (d: VisitDraft) => Promise<void> }) {
  const [draft, setDraft] = useState<VisitDraft>({ date: localToday(), description: "" });
  const [errors, setErrors] = useState<Errors<VisitDraft>>({});
  const { saving, serverError, run } = useSubmit();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = validateVisit(draft);
    if (!r.ok) return setErrors(r.errors);
    setErrors({});
    void run(async () => { await onSave(r.value); setDraft({ ...draft, description: "" }); });
  };
  return (
    <form onSubmit={submit} noValidate className="visit-form">
      <div className="visit-grid">
        <Field label="Visit date" error={errors.date}>
          <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
        </Field>
        <Field label="Reason" error={errors.description}>
          <input value={draft.description} placeholder="e.g. Annual vaccination" onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
        </Field>
        <button className="btn" disabled={saving}>{saving ? "Saving…" : "Register visit"}</button>
      </div>
      {serverError && <p className="err" role="alert">{serverError}</p>}
    </form>
  );
}
