import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container-lt flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="font-display text-5xl font-extrabold text-glow">404</div>
      <p className="mt-3 text-muted">Страница не найдена.</p>
      <Link href="/" className="btn-ghost mt-6">На главную</Link>
    </div>
  );
}
