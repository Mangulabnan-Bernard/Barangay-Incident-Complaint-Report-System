import { redirect } from "next/navigation";
import { getSession } from "@/lib/current-user";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { NavProvider } from "@/components/nav-context";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }

  return (
    <NavProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar role={session.role} />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header name={session.name} role={session.role} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </NavProvider>
  );
}
