import { useOwnerSearch } from "../api/hooks";
import type { OwnerId } from "../api/types";
import { useDebounced } from "../lib/useDebounced";

interface Props { query: string; onQuery: (q: string) => void; selected: OwnerId | null; onSelect: (id: OwnerId) => void; onNew: () => void }

export function Sidebar({ query, onQuery, selected, onSelect, onNew }: Props) {
  const search = useOwnerSearch(useDebounced(query, 250).trim());
  const owners = search.data ?? [];
  return (
    <aside className="side">
      <header><h1>Reception desk</h1></header>
      <div className="pad">
        <label className="field"><span>Find owner by last name</span>
          <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Start typing, e.g. Davis" />
        </label>
        <div className="bar">
          <button className="btn sm" onClick={onNew}>New owner</button>
          <span className="sp" />
          <small className="mute" aria-live="polite">{search.isFetching ? "Searching…" : `${owners.length} found`}</small>
        </div>
      </div>
      <div className="list">
        {search.isError && <p className="err pad" role="alert">{search.error.message}</p>}
        {owners.map((o) => (
          <button key={o.id} className="row" aria-current={o.id === selected} onClick={() => onSelect(o.id)}>
            {o.firstName} {o.lastName}
            <small>{o.city} · {o.pets.length ? o.pets.map((p) => p.name).join(", ") : "no pets"}</small>
          </button>
        ))}
        {search.isSuccess && !owners.length && (
          <p className="pad mute">No owner matches “{query}”. <button className="btn sm ghost" onClick={onNew}>Create new owner</button></p>
        )}
      </div>
    </aside>
  );
}
