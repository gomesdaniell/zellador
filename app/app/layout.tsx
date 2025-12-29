import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="container">
      <div style={{ display: "flex", gap: 14, alignItems: "flex-start" }}>
        <Sidebar />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          <Header />
          <section className="card">{children}</section>
        </div>
      </div>
    </main>
  );
}
