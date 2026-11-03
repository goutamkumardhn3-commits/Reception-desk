import { describe, expect, it } from "vitest";
import { validateOwner, validatePet, validateVisit } from "./validation";

const owner = { firstName: " Ana ", lastName: "Roy", address: "1 Main St", city: "Pune", telephone: "6085551023" };

describe("validateOwner", () => {
  it("trims and accepts a valid owner", () => {
    const r = validateOwner(owner);
    expect(r.ok && r.value.firstName).toBe("Ana");
  });
  it("rejects non-numeric or long telephones", () => {
    for (const telephone of ["abc", "12345678901", ""]) {
      const r = validateOwner({ ...owner, telephone });
      expect(!r.ok && r.errors.telephone).toBeTruthy();
    }
  });
});

describe("validatePet", () => {
  const types = [{ id: 1, name: "cat" }];
  it("resolves the type id to a PetType", () => {
    const r = validatePet({ name: "Leo", birthDate: "2020-01-01", typeId: "1" }, types, "2026-11-02");
    expect(r.ok && r.value.type.name).toBe("cat");
  });
  it("rejects future birth dates and unknown types", () => {
    const r = validatePet({ name: "Leo", birthDate: "2030-01-01", typeId: "9" }, types, "2026-11-02");
    expect(!r.ok && r.errors.birthDate && r.errors.typeId).toBeTruthy();
  });
});

describe("validateVisit", () => {
  it("requires a description", () => {
    expect(validateVisit({ date: "2026-11-02", description: "  " }).ok).toBe(false);
  });
});
