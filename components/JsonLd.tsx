type JsonLdProps = {
  data: Record<string, unknown> | null;
  nonce?: string;
};

export default function JsonLd({ data, nonce }: JsonLdProps) {
  if (!data) return null;

  return (
    <script
      nonce={nonce}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
