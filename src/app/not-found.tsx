import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-xl px-5 py-24 text-center sm:px-8">
      <p className="kicker">404</p>
      <h1 className="mt-3 font-serif text-4xl font-medium tracking-[-0.03em]">That page is not here.</h1>
      <p className="mt-4 text-moss">The address may have changed. You can still request an offer or join the buyers list.</p>
      <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link href="/" className="btn btn-secondary">
          Back home
        </Link>
        <Link href="/sell" className="btn btn-primary">
          Get a cash offer
        </Link>
      </div>
    </div>
  );
}
