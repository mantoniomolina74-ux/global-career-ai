import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white p-5 min-h-screen">
      <h1 className="text-xl font-bold mb-6">
        Global Career AI
      </h1>

      <nav className="flex flex-col gap-3 text-sm">
        <Link href="/dashboard">Dashboard</Link>
        <Link href="/perfil">Perfil</Link>
        <Link href="/applications">Postulaciones</Link>
        <Link href="/cv">CV</Link>
        <Link href="/empleos">Empleos</Link>
        <Link href="/insights">Insights IA</Link>
        <Link href="/visa">Visa Engine</Link>
      </nav>
    </aside>
  );
}