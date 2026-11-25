import Link from "next/link";
import { logout } from "@/lib/actions";
import { formatMoney, formatTimestamp } from "@/lib/format";
import {
  leadCounts,
  searchBuyers,
  searchMessages,
  searchSellers,
  type BuyerSignup,
  type ContactMessage,
  type SellerLead,
} from "@/lib/leads";

type Tab = "sellers" | "buyers" | "messages";

function hrefFor(tab: Tab, query: string, page = 1): string {
  const params = new URLSearchParams();
  params.set("tab", tab);
  if (query) params.set("q", query);
  if (page > 1) params.set("page", String(page));
  return `/admin?${params.toString()}`;
}

function rangeLabel(page: number, count: number, total: number): string {
  if (total === 0) return "No records";
  const start = (page - 1) * 25 + 1;
  const end = start + count - 1;
  return `Showing ${start}–${end} of ${total}`;
}

export function AdminDashboard({ tab, query, page }: { tab: Tab; query: string; page: number }) {
  const counts = leadCounts();
  const sellers = tab === "sellers" ? searchSellers(query, page) : null;
  const buyers = tab === "buyers" ? searchBuyers(query, page) : null;
  const messages = tab === "messages" ? searchMessages(query, page) : null;
  const current = sellers ?? buyers ?? messages;
  const exportType = tab === "buyers" ? "buyers" : tab === "messages" ? "messages" : "sellers";

  const tabs: { id: Tab; label: string; count: number }[] = [
    { id: "sellers", label: "Seller leads", count: counts.sellers },
    { id: "buyers", label: "Cash buyers", count: counts.buyers },
    { id: "messages", label: "Messages", count: counts.messages },
  ];

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10 sm:px-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Private</p>
          <h1 className="mt-2 font-serif text-4xl font-medium tracking-[-0.03em]">Lead inbox</h1>
          <p className="mt-2 text-sm text-moss">Stored in the local SQLite database. Export a CSV before you move servers.</p>
        </div>
        <form action={logout}>
          <button className="btn btn-secondary" type="submit">
            Log out
          </button>
        </form>
      </div>

      <div className="mt-8 flex flex-wrap gap-2" role="tablist" aria-label="Lead types">
        {tabs.map((item) => {
          const active = item.id === tab;
          return (
            <Link
              key={item.id}
              href={hrefFor(item.id, query)}
              role="tab"
              aria-selected={active}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${active ? "bg-pine text-cream" : "bg-paper text-ink"}`}
            >
              {item.label} ({item.count})
            </Link>
          );
        })}
      </div>

      <form action="/admin" className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input type="hidden" name="tab" value={tab} />
        <label className="sr-only" htmlFor="q">
          Search records
        </label>
        <input id="q" name="q" defaultValue={query} placeholder="Search name, email, phone, city" className="control mt-0 sm:max-w-md" />
        <button className="btn btn-secondary" type="submit">
          Search
        </button>
        <a className="btn btn-primary" href={`/admin/export?type=${exportType}`}>
          Export CSV
        </a>
      </form>

      <p className="mt-6 text-sm text-moss">{current ? rangeLabel(current.page, current.rows.length, current.total) : ""}</p>

      {tab === "sellers" && sellers ? <SellerResults page={sellers} /> : null}
      {tab === "buyers" && buyers ? <BuyerResults page={buyers} /> : null}
      {tab === "messages" && messages ? <MessageResults page={messages} /> : null}

      {current && current.pages > 1 ? (
        <nav className="mt-6 flex gap-3 text-sm" aria-label="Pages">
          {current.page > 1 ? (
            <Link className="btn btn-secondary" href={hrefFor(tab, query, current.page - 1)}>
              Previous
            </Link>
          ) : null}
          {current.page < current.pages ? (
            <Link className="btn btn-secondary" href={hrefFor(tab, query, current.page + 1)}>
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="mt-6 rounded-3xl border border-dashed border-sand bg-paper p-8 text-moss">{text}</p>;
}

function SellerResults({ page }: { page: { rows: SellerLead[] } }) {
  if (page.rows.length === 0) {
    return <Empty text="No seller leads match. New requests from the sell form will show up here." />;
  }
  return (
    <>
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-sand text-moss">
              <th className="py-2 pr-3 font-medium">When</th>
              <th className="py-2 pr-3 font-medium">Contact</th>
              <th className="py-2 pr-3 font-medium">Property</th>
              <th className="py-2 pr-3 font-medium">Details</th>
            </tr>
          </thead>
          <tbody>
            {page.rows.map((row) => (
              <tr key={row.id} className="border-b border-sand align-top">
                <td className="py-3 pr-3 whitespace-nowrap">
                  #{row.id}
                  <div>{formatTimestamp(row.created_at)}</div>
                </td>
                <td className="py-3 pr-3">
                  <div className="font-semibold">{row.name}</div>
                  <div>{row.phone}</div>
                  <a className="underline" href={`mailto:${row.email}`}>
                    {row.email}
                  </a>
                </td>
                <td className="py-3 pr-3">
                  {row.address}
                  <div>
                    {row.city}, {row.state} {row.zip}
                  </div>
                  <div className="text-moss">
                    {row.property_type} · {row.condition}
                  </div>
                </td>
                <td className="py-3">
                  <div>{row.timeline}</div>
                  <div>{formatMoney(row.asking_price)}</div>
                  {row.reason ? <div>{row.reason}</div> : null}
                  {row.notes ? <p className="mt-1 whitespace-pre-wrap text-moss">{row.notes}</p> : null}
                  <p className="mt-1 text-xs text-moss">IP {row.ip || "unknown"}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-4 space-y-3 md:hidden">
        {page.rows.map((row) => (
          <li key={row.id} className="rounded-3xl border border-sand bg-paper p-4 text-sm">
            <p className="text-xs text-moss">
              #{row.id} · {formatTimestamp(row.created_at)}
            </p>
            <p className="mt-1 font-semibold">{row.name}</p>
            <p>{row.phone}</p>
            <p className="break-all">{row.email}</p>
            <p className="mt-2">
              {row.address}, {row.city}, {row.state} {row.zip}
            </p>
            <p className="text-moss">
              {row.property_type} · {row.condition} · {row.timeline}
            </p>
            <p>{formatMoney(row.asking_price)}{row.reason ? ` · ${row.reason}` : ""}</p>
            {row.notes ? <p className="mt-2 whitespace-pre-wrap">{row.notes}</p> : null}
          </li>
        ))}
      </ul>
    </>
  );
}

function BuyerResults({ page }: { page: { rows: BuyerSignup[] } }) {
  if (page.rows.length === 0) return <Empty text="No buyers match. Signups from the buyers form will show up here." />;
  return (
    <>
      <div className="mt-4 hidden overflow-x-auto md:block">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-sand text-moss">
              <th className="py-2 pr-3 font-medium">When</th>
              <th className="py-2 pr-3 font-medium">Contact</th>
              <th className="py-2 pr-3 font-medium">Buy box</th>
            </tr>
          </thead>
          <tbody>
            {page.rows.map((row) => (
              <tr key={row.id} className="border-b border-sand align-top">
                <td className="py-3 pr-3 whitespace-nowrap">
                  #{row.id}
                  <div>{formatTimestamp(row.created_at)}</div>
                </td>
                <td className="py-3 pr-3">
                  <div className="font-semibold">{row.name}</div>
                  {row.company ? <div>{row.company}</div> : null}
                  <div>{row.phone}</div>
                  <a className="underline" href={`mailto:${row.email}`}>
                    {row.email}
                  </a>
                </td>
                <td className="py-3">
                  <div>{row.markets}</div>
                  <div className="text-moss">
                    {row.property_types} · {row.price_range}
                  </div>
                  <div>Proof of funds: {row.proof_of_funds}</div>
                  <p className="mt-1 whitespace-pre-wrap">{row.buy_box}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <ul className="mt-4 space-y-3 md:hidden">
        {page.rows.map((row) => (
          <li key={row.id} className="rounded-3xl border border-sand bg-paper p-4 text-sm">
            <p className="text-xs text-moss">
              #{row.id} · {formatTimestamp(row.created_at)}
            </p>
            <p className="mt-1 font-semibold">{row.name}</p>
            {row.company ? <p>{row.company}</p> : null}
            <p>{row.phone}</p>
            <p className="break-all">{row.email}</p>
            <p className="mt-2">{row.markets}</p>
            <p className="text-moss">
              {row.property_types} · {row.price_range} · Funds: {row.proof_of_funds}
            </p>
            <p className="mt-2 whitespace-pre-wrap">{row.buy_box}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function MessageResults({ page }: { page: { rows: ContactMessage[] } }) {
  if (page.rows.length === 0) return <Empty text="No messages match. Contact-form notes will show up here." />;
  return (
    <ul className="mt-4 space-y-3">
      {page.rows.map((row) => (
        <li key={row.id} className="rounded-3xl border border-sand bg-paper p-4 text-sm">
          <p className="text-xs text-moss">
            #{row.id} · {formatTimestamp(row.created_at)}
          </p>
          <p className="mt-1 font-semibold">{row.name}</p>
          <p className="break-all">{row.email}</p>
          {row.phone ? <p>{row.phone}</p> : null}
          <p className="mt-2 whitespace-pre-wrap">{row.message}</p>
        </li>
      ))}
    </ul>
  );
}
