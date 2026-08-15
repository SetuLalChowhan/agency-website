import { notFound } from "next/navigation";
import { COLLECTIONS } from "@/lib/collections";
import { ContentManager } from "@/components/ContentManager";

export const dynamic = "force-dynamic";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ collection: string }>;
}) {
  const { collection } = await params;
  const config = COLLECTIONS[collection];
  if (!config) notFound();
  return <ContentManager config={config} />;
}
