export const dynamic = "force-dynamic";

import OrderDetailClient from "./OrderDetailClient";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  return <OrderDetailClient orderId={id} />;
}
