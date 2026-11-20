export type Screen = {
  title: string;
  alt: string;
  src: string;
  width: number;
  height: number;
};

export const workspace: Screen = {
  title: "Рабочая станция ShadxwRescue",
  alt: "Файловый менеджер, помощник и инструменты восстановления в ShadxwRescue",
  src: "/shadxwrescue/workspace.png", width: 1920, height: 1080,
};

export const tools: (Screen & { label: string; description: string })[] = [
  { title: "Осмотр накопителей", label: "Осмотр системы",
    description: "Накопители, разделы и поиск Windows", alt: "Список дисков с выбором режима подключения",
    src: "/shadxwrescue/storage.png", width: 1040, height: 580 },
  { title: "Файловый менеджер", label: "Спасение файлов",
    description: "Две панели для источника и назначения", alt: "Двухпанельный файловый менеджер",
    src: "/shadxwrescue/files.png", width: 1280, height: 720 },
  { title: "Мастер создания образа", label: "Повреждённый диск",
    description: "Сохранение читаемых областей в образ", alt: "Мастер GNU ddrescue с выбором параметров",
    src: "/shadxwrescue/ddrescue.png", width: 960, height: 540 },
];
