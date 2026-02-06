import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-black">
            <Navbar />
            <Sidebar />
            <main className="lg:pl-64 pt-16">
                <div className="p-6 lg:p-8">{children}</div>
            </main>
        </div>
    );
}
