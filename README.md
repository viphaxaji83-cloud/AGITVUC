# Контрактная служба для студентов — лендинг

Информационный одностраничный лендинг университета: спокойный, технологичный, без давления и без неподтверждённых обещаний. Все ключевые сведения вынесены в data-файлы и подлежат проверке по официальным документам.

Стек: **Astro + TypeScript + Tailwind CSS**, минимум клиентского JS, статическая генерация.

---

## Быстрый старт

```bash
npm install
npm run dev
```

Затем откройте `http://localhost:4321/`.

### Команды

| Команда           | Что делает                                              |
| ----------------- | ------------------------------------------------------- |
| `npm install`     | Установить зависимости                                  |
| `npm run dev`     | Локальный dev-сервер с hot reload                       |
| `npm run build`   | Сборка статики в `./dist/`                              |
| `npm run preview` | Предпросмотр продакшен-сборки                           |

---

## Структура проекта

```
src/
  components/
    Header.astro          — шапка, навигация, мобильное меню (островной JS)
    Hero.astro            — hero-блок с CTA
    Benefits.astro        — карточки «почему интересно»
    Directions.astro      — карточки направлений
    EducationBlock.astro  — образовательные сценарии
    FinanceBlock.astro    — финансовые условия
    SupportBlock.astro    — социальная поддержка
    ProcessSteps.astro    — пошаговая схема
    FAQ.astro             — аккордеон на нативном <details>
    ContactForm.astro     — форма заявки + островной JS отправки
    Footer.astro          — подвал
    DirectionPage.astro   — общий шаблон страницы направления
    ui/
      Button.astro
      Card.astro
      Container.astro
      DisclaimerNote.astro
      Icon.astro
      SectionTitle.astro
  data/
    site.ts               — название, навигация, общий disclaimer
    benefits.ts           — карточки преимуществ
    directions.ts         — направления (slug, описание, доступность)
    faq.ts                — вопросы и аккуратные ответы
    contacts.ts           — телефон, email, адрес, шаги процесса
    finance.ts            — финансовые карточки (суммы → null = «уточняется»)
    support.ts            — темы соц. поддержки и образования
  layouts/
    BaseLayout.astro      — HTML, SEO, OG
  pages/
    index.astro
    404.astro
    api/
      contact.ts          — заглушка API формы
    directions/
      bpla.astro
      communications.astro
      engineering.astro
      it.astro
      medicine.astro
      logistics.astro
      maintenance.astro
  styles/
    global.css            — Tailwind + базовые стили + утилиты
public/
  favicon.svg
  og-image.svg
  robots.txt
```

---

## Где менять контент

Контент намеренно отделён от компонентов. Чаще всего нужно править файлы в `src/data/`.

| Что меняем                                       | Где редактировать                          |
| ------------------------------------------------ | ------------------------------------------ |
| Название проекта, навигация, общий дисклеймер    | `src/data/site.ts`                         |
| Контакты, адрес, шаги процесса                   | `src/data/contacts.ts`                     |
| Список преимуществ                               | `src/data/benefits.ts`                     |
| Список направлений и тексты карточек             | `src/data/directions.ts`                   |
| Финансовые карточки и точные суммы               | `src/data/finance.ts`                      |
| Темы соцподдержки, темы образования              | `src/data/support.ts`                      |
| FAQ                                              | `src/data/faq.ts`                          |
| Глобальные SEO-метаданные                        | `src/layouts/BaseLayout.astro`             |
| Дизайн-токены (цвета, шрифт, тени)               | `tailwind.config.mjs`                      |
| Базовый CSS, селекторы анимаций                  | `src/styles/global.css`                    |

### Важно про конкретные суммы

Поле `amount` в `src/data/finance.ts` намеренно `null`. Когда юристы/документы подтвердят конкретные значения, можно подставить строку — например, `'от 100 000 ₽'` — и она автоматически появится на сайте вместо «Уточняется на консультации». Все спорные сведения должны опираться на официальные документы — см. `TODO.md`.

---

## Подключение реального backend для формы

Сейчас форма отправляет POST в [src/pages/api/contact.ts](src/pages/api/contact.ts) — это заглушка. Эндпоинт:

- валидирует обязательные поля и согласие на обработку ПДн;
- логирует payload в dev-режиме;
- возвращает `{ ok: true }`.

Чтобы подключить настоящую интеграцию (CRM, SMTP, очередь и т.д.):

1. Включите серверный режим Astro (`output: 'server'` или `'hybrid'`) в `astro.config.mjs` и добавьте подходящий адаптер (Node, Vercel, Cloudflare и пр.).
2. В функции `POST` отправьте `payload` в нужный сервис.
3. Добавьте антиспам (rate-limit, honeypot, токен) и логирование.
4. Обновите политику обработки ПДн и ссылку на неё в `ContactForm.astro`.

---

## Производительность и доступность

- Минимум клиентского JS: только мобильное меню, аккордеон FAQ работает на нативном `<details>`, отправка формы — небольшой островной скрипт.
- Шрифт — system font stack, без подключения тяжёлых веб-шрифтов.
- Все анимации — CSS, отключаются через `prefers-reduced-motion`.
- Иконки — встроенные SVG (без иконочных шрифтов и больших библиотек).
- Skip-link «Перейти к основному содержимому», semantic HTML, корректные `alt`/`aria-label`, видимый focus-ring.
- SEO: `<title>`, `<meta description>`, Open Graph, Twitter, canonical, sitemap (`@astrojs/sitemap`), `lang="ru"`.

Lighthouse-ориентир: Performance 95+, Accessibility 95+, Best Practices 95+, SEO 95+.

---

## Расширение: добавить новое направление

1. Добавьте новую запись в `src/data/directions.ts` (укажите уникальный `slug`, иконку из перечня в `Icon.astro`, описание).
2. Создайте файл `src/pages/directions/<slug>.astro` по образцу существующих:

   ```astro
   ---
   import DirectionPage from '../../components/DirectionPage.astro';
   ---
   <DirectionPage slug="<slug>" />
   ```

3. Карточка автоматически появится на главной и в подвале.

---

## Лицензия и использование

Проект — шаблон информационного раздела. Перед публикацией обязательно сверьте все формулировки с юридической службой и обновите данные из `TODO.md`.
