import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addPet, addVisit, createOwner, getOwner, getPetTypes, searchOwners, updateOwner, updatePet } from "./petclinic";
import type { OwnerDraft, OwnerId, PetDraft, PetId, VisitDraft } from "./types";

export const useOwnerSearch = (lastName: string) =>
  useQuery({ queryKey: ["owners", lastName], queryFn: () => searchOwners(lastName), placeholderData: keepPreviousData });

export const useOwner = (id: OwnerId | null) =>
  useQuery({
    queryKey: ["owner", id],
    queryFn: () => (id === null ? Promise.reject(new Error("No owner selected")) : getOwner(id)),
    enabled: id !== null,
  });

export const usePetTypes = () => useQuery({ queryKey: ["petTypes"], queryFn: getPetTypes, staleTime: Infinity });

/** After any write, refetch owner data: the owner payload embeds pets and visits, so one source of truth. */
function useWrite<V, R>(fn: (v: V) => Promise<R>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      await Promise.all([qc.invalidateQueries({ queryKey: ["owners"] }), qc.invalidateQueries({ queryKey: ["owner"] })]);
    },
  });
}

export const useCreateOwner = () => useWrite((d: OwnerDraft) => createOwner(d));
export const useUpdateOwner = (id: OwnerId) => useWrite((d: OwnerDraft) => updateOwner(id, d));
export const useAddPet = (id: OwnerId) => useWrite((d: PetDraft) => addPet(id, d));
export const useUpdatePet = (o: OwnerId, p: PetId) => useWrite((d: PetDraft) => updatePet(o, p, d));
export const useAddVisit = (o: OwnerId, p: PetId) => useWrite((d: VisitDraft) => addVisit(o, p, d));
