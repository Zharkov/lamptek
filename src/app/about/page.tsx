export const metadata = { title: "О нас — LampTek" };

export default function About() {
  return (
    <div className="container-lt max-w-3xl py-12">
      <div className="eyebrow">О компании</div>
      <h1 className="mt-2 font-display text-3xl font-bold">LampTek</h1>
      <p className="mt-6 text-muted">
        Производитель светодиодных светильников для уличного, промышленного и офисного освещения,
        ЖКХ и прожекторных решений. Наша продукция работает на объектах крупных инфраструктурных
        и сетевых компаний.
      </p>
      <p className="mt-4 text-muted">
        Этот текст — заглушка. Замените его реальным описанием компании, истории и производственных
        мощностей через админ-панель или в коде страницы.
      </p>
    </div>
  );
}
