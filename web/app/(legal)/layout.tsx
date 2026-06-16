import "../../styles/landing.css";
import "../../styles/legal.css";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <div className="legal-root">{children}</div>;
}
