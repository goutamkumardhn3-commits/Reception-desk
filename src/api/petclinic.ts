import { ApiError, request } from "./client";
import type { Owner, OwnerDraft, OwnerId, Pet, PetDraft, PetId, PetType, Visit, VisitDraft, VisitId } from "./types";

// Wire shapes mirror the OpenAPI spec. Brands are applied once, here, and nowhere else.
interface WireVisit { id: number; date: string; description: string }
interface WirePet { id: number; ownerId?: number; name: string; birthDate: string; type: PetType; visits?: WireVisit[] }
interface WireOwner { id: number; firstName: string; lastName: string; address: string; city: string; telephone: string; pets?: WirePet[] }

const toVisit = (v: WireVisit): Visit => ({ id: v.id as VisitId, date: v.date, description: v.description });
const toPet = (p: WirePet, ownerId: number): Pet => ({
  id: p.id as PetId,
  ownerId: (p.ownerId ?? ownerId) as OwnerId,
  name: p.name,
  birthDate: p.birthDate,
  type: p.type,
  visits: (p.visits ?? []).map(toVisit),
});
const toOwner = (o: WireOwner): Owner => ({
  id: o.id as OwnerId,
  firstName: o.firstName,
  lastName: o.lastName,
  address: o.address,
  city: o.city,
  telephone: o.telephone,
  pets: (o.pets ?? []).map((p) => toPet(p, o.id)),
});

export async function searchOwners(lastName: string): Promise<Owner[]> {
  try {
    const list = await request<WireOwner[]>(`/owners?lastName=${encodeURIComponent(lastName)}`);
    return list.map(toOwner);
  } catch (e) {
    // API quirk: "no match" is a 404, not an empty list. We normalise it here.
    if (e instanceof ApiError && e.status === 404) return [];
    throw e;
  }
}
export const getOwner = async (id: OwnerId): Promise<Owner> => toOwner(await request<WireOwner>(`/owners/${id}`));
export const createOwner = async (d: OwnerDraft): Promise<Owner> => toOwner(await request<WireOwner>("/owners", { method: "POST", body: d }));
export const updateOwner = (id: OwnerId, d: OwnerDraft): Promise<void> => request<void>(`/owners/${id}`, { method: "PUT", body: { id, ...d } });
export const getPetTypes = (): Promise<PetType[]> => request<PetType[]>("/pettypes");
export const addPet = async (ownerId: OwnerId, d: PetDraft): Promise<Pet> => toPet(await request<WirePet>(`/owners/${ownerId}/pets`, { method: "POST", body: d }), ownerId);
export const updatePet = (ownerId: OwnerId, petId: PetId, d: PetDraft): Promise<void> => request<void>(`/pets/${petId}`, { method: "PUT", body: { id: petId, ownerId, ...d } });
export const addVisit = async (ownerId: OwnerId, petId: PetId, d: VisitDraft): Promise<Visit> =>
  toVisit(await request<WireVisit>(`/owners/${ownerId}/pets/${petId}/visits`, { method: "POST", body: { ...d, petId } }));
