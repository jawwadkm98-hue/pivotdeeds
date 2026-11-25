import Link from "next/link";
import { PIPELINE } from "@/lib/constants";
import { formatTimestamp } from "@/lib/format";

export function RecordBrowser({
  kind,
  title,
  query,
  status,
  page,
  pages,
  total,
  rows,
}: {
  kind: string;
  title: string;
  query: string;
  status: string;
  page: number;
  pages: number;
  total: number;
  rows: { id: number; created_at: string; name: string; email: string; status: string; detail: string }[];
}) {
  const href = (nextPage = 1, nextStatus = status) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (nextStatus) params.set("status", nextStatus);
    if (nextPage > 1) params.set("page", String(nextPage));
    const text = params.toString();
    return text ? `/admin/${kind}?${text}` : `/admin/${kind}`;
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="kicker">Inbox</p>
          <h1 className="mt-2 font-serif text-4xl font-medium">{title}</h1>
        </div>
        <a className="btn btn-primary" href={`/admin/export?type=${kind}`}>
          Export CSV
        </a>
      </div>
      <form action={`/admin/${kind}`} className="mt-6 grid gap-3 sm:grid-cols-[1fr_12rem_auto]">
        <input className="control mt-0" name="q" defaultValue={query} placeholder="Search name, email, phone, city" aria-label="Search" />
        <select className="control mt-0" name="status" defaultValue={status} aria-label="Status">
          <option value="">All statuses</option>
          {PIPELINE.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
        <button className="btn btn-secondary" type="submit">
          Filter
        </button>
      </form>
      <p className="mt-4 text-sm text-moss">{total === 0 ? "No records" : `${total} record${total === 1 ? "" : "s"}`}</p>
      <div className="mt-4 overflow-x-auto rounded-3xl border border-sand">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-paper text-moss">
            <tr>
              <th className="px-4 py-3 font-semibold">When</th>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Email</th>
              <th className="px-4 py-3 font-semibold">Detail</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-sand">
                <td className="px-4 py-3 whitespace-nowrap">{formatTimestamp(row.created_at)}</td>
                <td className="px-4 py-3">
                  <Link className="font-semibold underline decoration-brass/70 underline-offset-4" href={`/admin/${kind}/${row.id}`}>
                    {row.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{row.email}</td>
                <td className="px-4 py-3">{row.detail}</td>
                <td className="px-4 py-3 capitalize">{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pages > 1 ? (
        <nav className="mt-4 flex gap-3" aria-label="Pages">
          {page > 1 ? (
            <Link className="btn btn-secondary" href={href(page - 1)}>
              Previous
            </Link>
          ) : null}
          {page < pages ? (
            <Link className="btn btn-secondary" href={href(page + 1)}>
              Next
            </Link>
          ) : null}
        </nav>
      ) : null}
    </div>
  );
}
