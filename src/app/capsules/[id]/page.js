import CapsuleDetailClient from "./CapsuleDetailClient";

export default async function CapsuleDetailPage({ params }) {
  const { id } = await params;

  return <CapsuleDetailClient capsuleId={id} />;
}
