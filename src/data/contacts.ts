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
  phone: '8 (8772) 57-04-71',
  phoneHref: 'tel:+78772570471',
  email: 'prorector_sbvr@mkgtu.ru',
  address: 'г. Майкоп, ул. Первомайская д. 191',
  workingHours: 'ПН-ПТ, 09:00 - 18:00 (ПО МСК)',
  responsibleUnit:
    'Управление по молодёжной политике и воспитательной деятельности МГТУ',
  officialDocsUrl: '#',
  officialDocsLabel: 'Раздел официальных документов',
  socials: [
    { label: 'Сайт университета', href: '#' },
    { label: 'Канал отдела', href: '#' },
  ],
};
