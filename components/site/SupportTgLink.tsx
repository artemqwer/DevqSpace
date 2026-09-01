import { getSupportTgUrl } from "@/lib/settings";

// Кнопка «Написати в Telegram». Раніше в трьох місцях стояло href="https://t.me/"
// — це корінь Telegram, клієнт потрапляв у нікуди й ішов.
//
// Адреса береться з налаштувань адмінки, фолбек — юзернейм бота. Немає ні
// того, ні того — кнопки просто немає: краще ніякої, ніж у нікуди.
export async function SupportTgLink({
  label,
  className,
  children,
}: {
  label: string;
  className: string;
  children?: React.ReactNode;
}) {
  const url = await getSupportTgUrl();
  if (!url) return null;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
      {label}
    </a>
  );
}
