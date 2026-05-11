export const dynamic = "force-dynamic";

import ShareClient from "./ShareClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  return <ShareClient linkId={id} />;
}
