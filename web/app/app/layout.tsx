import ProtectedApp from "@/components/ProtectedApp";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedApp>{children}</ProtectedApp>;
}
