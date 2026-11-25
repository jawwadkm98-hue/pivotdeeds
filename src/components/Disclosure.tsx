import { disclosures } from "@/content/legal";

export function Disclosure({
  level = 2,
  className = "",
}: {
  level?: 2 | 3;
  className?: string;
}) {
  const Heading = level === 2 ? "h2" : "h3";
  return (
    <section aria-label="Important disclosures" className={className}>
      <Heading className="font-serif text-xl font-medium tracking-[-0.03em]">Important disclosures</Heading>
      {disclosures.map((item) => (
        <p key={item.id} className="mt-3 text-sm leading-relaxed">
          {item.text}
        </p>
      ))}
    </section>
  );
}
