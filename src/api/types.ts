// Branded ids: an OwnerId can never be passed where a PetId is expected.
declare const brand: unique symbol;
type Brand<T, B extends string> = T & { readonly [brand]: B };
export type OwnerId = Brand<number, "OwnerId">;
export type PetId = Brand<number, "PetId">;
export type VisitId = Brand<number, "VisitId">;

export interface PetType {
  readonly id: number;
  readonly name: string;
}
export interface Visit {
  readonly id: VisitId;
  readonly date: string; // YYYY-MM-DD
  readonly description: string;
}
export interface Pet {
  readonly id: PetId;
  readonly ownerId: OwnerId;
  readonly name: string;
  readonly birthDate: string; // YYYY-MM-DD
  readonly type: PetType;
  readonly visits: readonly Visit[];
}
export interface Owner {
  readonly id: OwnerId;
  readonly firstName: string;
  readonly lastName: string;
  readonly address: string;
  readonly city: string;
  readonly telephone: string;
  readonly pets: readonly Pet[];
}

// Drafts are what the receptionist types; the server adds ids.
export type OwnerDraft = Omit<Owner, "id" | "pets">;
export type PetDraft = Pick<Pet, "name" | "birthDate" | "type">;
export type VisitDraft = Pick<Visit, "date" | "description">;
