export interface NavItem {
  label: string;
  href: string;
}

export interface SiteConfig {
  name: string;
  shortName: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  url: string;
  locale: string;
  university: string;
  department: string;
  nav: NavItem[];
  legalDisclaimer: string;
}

export const site: SiteConfig = {
  name: 'Контрактная служба для студентов',
  shortName: 'КСС',
  description:
    'Информационный раздел университета об условиях контрактной службы, доступных направлениях, образовательных сценариях и порядке официальной консультации.',
  ogTitle:
    'Контрактная служба для студентов — информация и консультация университета',
  ogDescription:
    'Узнайте об условиях, направлениях и порядке официальной консультации. Информация требует подтверждения по официальным документам.',
  url: 'https://example.university',
  locale: 'ru_RU',
  university: 'Университет',
  department: 'Отдел по работе со студентами',
  nav: [
    { label: 'О проекте', href: '#hero' },
    { label: 'Преимущества', href: '#benefits' },
    { label: 'Направления', href: '#directions' },
    { label: 'Обучение', href: '#education' },
    { label: 'Условия', href: '#finance' },
    { label: 'Вопросы', href: '#faq' },
    { label: 'Контакты', href: '#contacts' },
  ],
  legalDisclaimer:
    'Информация на сайте носит справочный характер. Точные условия, выплаты, льготы и правовые последствия определяются действующим законодательством, ведомственными документами и условиями контракта. Все сведения требуют подтверждения по официальным источникам и уточняются на консультации.',
};
