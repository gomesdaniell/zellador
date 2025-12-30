import AppSidebar from "../../components/AppSidebar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="appShell">
      <AppSidebar />
      <main className="appMain">
        <div className="appCard">
          {children}
        </div>
      </main>
    </div>
  );
}

