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

export interface ProcessStep {
  number: number;
  title: string;
  description: string;
}

export const processSteps: ProcessStep[] = [
  {
    number: 1,
    title: 'Оставить заявку',
    description:
      'Заполните короткую форму или напишите в отдел. Это просто запись на консультацию — никаких обязательств.',
  },
  {
    number: 2,
    title: 'Получить консультацию',
    description:
      'Сотрудник ответит на вопросы, объяснит условия и поможет понять, что именно стоит уточнять дальше.',
  },
  {
    number: 3,
    title: 'Проверить условия и документы',
    description:
      'Сверьте сведения с действующими нормативными актами и документами, предоставленными ответственным подразделением.',
  },
  {
    number: 4,
    title: 'Пройти отбор',
    description:
      'Состав отбора зависит от направления и требований. Этап включает собеседования, проверки и медицинское заключение, если применимо.',
  },
  {
    number: 5,
    title: 'Принять осознанное решение',
    description:
      'Это ваш выбор. Возьмите время, обсудите вопросы с близкими и убедитесь, что вы понимаете все условия.',
  },
  {
    number: 6,
    title: 'Подписать контракт при согласии',
    description:
      'Подписание происходит только при вашем согласии и наличии полной информации о правах и обязанностях.',
  },
  {
    number: 7,
    title: 'Пройти подготовку',
    description:
      'После заключения контракта начинается подготовка по выбранному направлению — теория и прикладные задачи.',
  },
];
