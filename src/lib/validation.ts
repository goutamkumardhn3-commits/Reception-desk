import type { OwnerDraft, PetDraft, PetType, VisitDraft } from "../api/types";

export type Errors<I> = Partial<Record<keyof I, string>>;
export type Validated<T, I = T> = { ok: true; value: T } | { ok: false; errors: Errors<I> };

/** Raw form input for a pet: the select gives us a string id, not a PetType yet. */
export interface PetInput { name: string; birthDate: string; typeId: string }

export const localToday = (): string => new Date().toLocaleDateString("en-CA");

function finish<T, I>(errors: Errors<I>, value: T): Validated<T, I> {
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, value };
}

export function validateOwner(d: OwnerDraft): Validated<OwnerDraft> {
  const v: OwnerDraft = {
    firstName: d.firstName.trim(), lastName: d.lastName.trim(),
    address: d.address.trim(), city: d.city.trim(), telephone: d.telephone.trim(),
  };
  const e: Errors<OwnerDraft> = {};
  if (!v.firstName) e.firstName = "Enter a first name";
  if (!v.lastName) e.lastName = "Enter a last name";
  if (!v.address) e.address = "Enter an address";
  if (!v.city) e.city = "Enter a city";
  if (!/^\d{1,10}$/.test(v.telephone)) e.telephone = "Use digits only, up to 10";
  return finish(e, v);
}

export function validatePet(i: PetInput, types: readonly PetType[], today: string): Validated<PetDraft, PetInput> {
  const e: Errors<PetInput> = {};
  const name = i.name.trim();
  const type = types.find((t) => String(t.id) === i.typeId);
  if (!name) e.name = "Enter a name";
  if (!i.birthDate) e.birthDate = "Enter a birth date";
  else if (i.birthDate > today) e.birthDate = "Birth date can’t be in the future";
  if (!type) e.typeId = "Choose a type";
  return type ? finish(e, { name, birthDate: i.birthDate, type }) : { ok: false, errors: e };
}

export function validateVisit(d: VisitDraft): Validated<VisitDraft> {
  const e: Errors<VisitDraft> = {};
  const description = d.description.trim();
  if (!d.date) e.date = "Enter a date";
  if (!description) e.description = "Describe the reason for the visit";
  return finish(e, { date: d.date, description });
}
