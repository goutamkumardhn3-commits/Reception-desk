import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { App } from "./App";

const pet = { id: 1, ownerId: 1, name: "Leo", birthDate: "2020-09-07", type: { id: 1, name: "cat" }, visits: [{ id: 1, date: "2026-03-14", description: "Annual vaccination" }] };
const owner = { id: 1, firstName: "George", lastName: "Franklin", address: "110 W. Liberty St.", city: "Madison", telephone: "6085551023", pets: [pet] };

function fakeFetch(url: string): Promise<Response> {
  const json = (b: unknown, status = 200) => Promise.resolve(new Response(JSON.stringify(b), { status }));
  if (url.includes("/owners?lastName=zzz")) return json({ title: "Not found" }, 404);
  if (url.includes("/owners?")) return json([owner]);
  if (url.endsWith("/owners/1")) return json(owner);
  if (url.endsWith("/pettypes")) return json([{ id: 1, name: "cat" }]);
  return json({}, 500);
}

function renderApp() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(<QueryClientProvider client={client}><App /></QueryClientProvider>);
}

afterEach(() => { cleanup(); vi.unstubAllGlobals(); });

describe("Reception desk", () => {
  it("finds an owner, opens a pet and shows previous visits", async () => {
    vi.stubGlobal("fetch", vi.fn(fakeFetch));
    renderApp();
    fireEvent.click(await screen.findByRole("button", { name: /George Franklin/ }));
    fireEvent.click(await screen.findByRole("button", { name: /^Leo/ }));
    expect(await screen.findByText("Annual vaccination")).toBeTruthy();
  });

  it("treats a 404 search as an empty result and offers to create an owner", async () => {
    vi.stubGlobal("fetch", vi.fn(fakeFetch));
    renderApp();
    fireEvent.change(screen.getByLabelText("Find owner by last name"), { target: { value: "zzz" } });
    expect(await screen.findByText(/No owner matches/, undefined, { timeout: 2000 })).toBeTruthy();
  });
});
