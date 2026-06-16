import { RequestForm } from "@/components/RequestForm";

export const metadata = { title: "Контакты — LampTek" };

export default function Contacts() {
  return (
    <div className="container-lt py-12">
      <div className="eyebrow">Контакты</div>
      <h1 className="mt-2 font-display text-3xl font-bold">Связаться с нами</h1>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <div className="space-y-4 text-muted">
          <p><span className="text-chalk">Телефон:</span> +7 (___) ___-__-__</p>
          <p><span className="text-chalk">Email:</span> info@lamptek.ru</p>
          <p><span className="text-chalk">Адрес:</span> уточняется</p>
          <p>Работаем с проектными организациями, ЖКХ, промышленными и сетевыми компаниями. Готовим расчёт под объект.</p>
        </div>
        <RequestForm />
      </div>
    </div>
  );
}
