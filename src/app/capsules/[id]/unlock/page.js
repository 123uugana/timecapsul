import UnlockClient from "./UnlockClient";

export default async function UnlockPage({ params }) {
  const { id } = await params;

  return <UnlockClient capsuleId={id} />;
}
