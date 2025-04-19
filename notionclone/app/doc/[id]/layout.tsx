import LiveBlocksProvider from "@/components/LiveBlocksProvider";
import RoomProvider from "@/components/RoomProvider";
import {auth} from "@clerk/nextjs/server";

async function DocLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { userId, redirectToSignIn } = await auth();

  const { id } = await params;
  if (!userId) return redirectToSignIn();
  return (
  <LiveBlocksProvider>
  <RoomProvider roomId={id}>{children}</RoomProvider>
  </LiveBlocksProvider>);
}
export default DocLayout;
