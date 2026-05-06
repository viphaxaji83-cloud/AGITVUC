export interface ContactInfo {
  phone: string;
  phoneHref: string;
  email: string;
  address: string;
  workingHours: string;
  responsibleUnit: string;
  officialDocsUrl: string;
  officialDocsLabel: string;
  socials: { label: string; href: string }[];
}

export const contacts: ContactInfo = {
  phone: '+7 (000) 000-00-00',
  phoneHref: 'tel:+70000000000',
  email: 'info@example.university',
  address: 'г. Город, ул. Университетская, д. 1, корпус N',
  workingHours: 'Пн–Пт, 09:00–18:00 (по местному времени)',
  responsibleUnit: 'Отдел по работе со студентами',
  officialDocsUrl: '#',
  officialDocsLabel: 'Раздел официальных документов',
  socials: [
    { label: 'Сайт университета', href: '#' },
    { label: 'Канал отдела', href: '#' },
  ],
};
