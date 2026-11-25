import Link from "next/link";
import { formatTimestamp } from "@/lib/format";
import { countInquiries, listingStatusCounts } from "@/lib/inventory";
import { countLeadStatus, recentLeads } from "@/lib/leads";

export default async function OverviewPage() {
  const [sellers, buyers, messages, inquiries, listings, recentSellers, recentBuyers, recentMessages] = await Promise.all([
    countLeadStatus("sellers", "new"),
    countLeadStatus("buyers", "new"),
    countLeadStatus("messages", "new"),
    countInquiries("new"),
    listingStatusCounts(),
    recentLeads("sellers"),
    recentLeads("buyers"),
    recentLeads("messages"),
  ]);
  const cards = [
    ["New seller leads", sellers, "/admin/sellers?status=new"],
    ["New buyer signups", buyers, "/admin/buyers?status=new"],
    ["New messages", messages, "/admin/messages?status=new"],
    ["New inquiries", inquiries, "/admin/inquiries?status=new"],
  ] as const;
  const activity = [
    ...recentSellers.map((row) => ({ ...row, href: `/admin/sellers/${row.id}`, kind: "Seller lead" })),
    ...recentBuyers.map((row) => ({ ...row, href: `/admin/buyers/${row.id}`, kind: "Buyer" })),
    ...recentMessages.map((row) => ({ ...row, href: `/admin/messages/${row.id}`, kind: "Message" })),
  ]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 8);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-8">
      <p className="kicker">Overview</p>
      <h1 className="mt-2 font-serif text-4xl font-medium">Dashboard</h1>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, count, href]) => (
          <Link key={label} href={href} className="lift rounded-3xl border border-sand bg-paper p-5">
            <p className="text-sm text-moss">{label}</p>
            <p className="mt-2 font-serif text-4xl text-brass">{count}</p>
          </Link>
        ))}
      </div>
      <h2 className="mt-10 font-serif text-2xl">Listings</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-4">
        {(["available", "under contract", "sold", "unpublished"] as const).map((status) => (
          <div key={status} className="rounded-3xl border border-sand bg-paper p-4">
            <p className="text-sm capitalize text-moss">{status}</p>
            <p className="mt-1 font-serif text-3xl">{listings[status] ?? 0}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-10 font-serif text-2xl">Recent activity</h2>
      <ul className="mt-4 divide-y divide-sand rounded-3xl border border-sand">
        {activity.length === 0 ? <li className="px-4 py-6 text-sm text-moss">No leads yet.</li> : null}
        {activity.map((item) => (
          <li key={`${item.kind}-${item.id}`}>
            <Link href={item.href} className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-paper">
              <span>
                <span className="text-brass">{item.kind}</span> · {item.name}
              </span>
              <span className="text-moss">{formatTimestamp(item.created_at)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
