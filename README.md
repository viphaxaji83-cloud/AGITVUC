# AGITVUC

Лендинг о контрактной службе для студентов. Проект собран на Astro и Tailwind CSS, генерируется как статический сайт и содержит светлую/темную тему с переключателем в шапке.

## Что есть на странице

- Hero-блок с фоновым изображением и CTA.
- Блок с каруселью ключевых условий.
- Блок «Преимущества» с компактными карточками.
- Блок «Возможности для студентов».
- Блок с этапами процесса.
- FAQ.
- Контактная форма.
- Светлая и темная темы, выбор сохраняется в `localStorage`.

## Стек

- Astro 4
- TypeScript
- Tailwind CSS
- Статическая сборка в `dist/`

## Быстрый старт

```bash
npm install
npm run dev
```

Локальный адрес по умолчанию:

```text
http://localhost:4321/
```

## Команды

```bash
npm run dev      # dev-сервер
npm run build    # production-сборка в dist/
npm run preview  # предпросмотр production-сборки
```

## Структура проекта

```text
src/
  components/
    Header.astro          # шапка, навигация, переключатель темы
    Hero.astro            # первый экран
    Benefits.astro        # карусель и текстовый блок
    EducationBlock.astro  # блок «Преимущества»
    FinanceBlock.astro    # блок «Возможности для студентов»
    ProcessSteps.astro    # этапы процесса
    FAQ.astro             # вопросы и ответы
    ContactForm.astro     # форма заявки
    Footer.astro          # футер
    ui/                   # базовые UI-компоненты
  data/
    site.ts               # навигация, общие данные сайта
    contacts.ts           # контакты и шаги процесса
    faq.ts                # FAQ
    directions.ts         # страницы направлений
  layouts/
    BaseLayout.astro      # HTML-обертка, meta, ранняя установка темы
  pages/
    index.astro           # главная страница
    api/contact.ts        # demo API для формы
  styles/
    global.css            # глобальные стили, темы, фон секций
public/
  fonts/
  hero-bpla-training-v4.webp
  favicon.svg
  og-image.svg
```

## Где менять контент

Основные блоки главной страницы сейчас редактируются в компонентах:

- `src/components/Benefits.astro` — карточки карусели и текст под ней.
- `src/components/EducationBlock.astro` — карточки блока «Преимущества».
- `src/components/FinanceBlock.astro` — карточки блока «Возможности для студентов».
- `src/components/ProcessSteps.astro` — вывод шагов из `src/data/contacts.ts`.
- `src/components/FAQ.astro` — вывод вопросов из `src/data/faq.ts`.
- `src/components/ContactForm.astro` — поля формы и контактный блок.
- `src/data/site.ts` — пункты меню и базовые данные сайта.

## Темная тема

Тема задается через атрибут на `html`:

```html
<html data-theme="light">
```

Переключатель в `Header.astro` меняет значение на `light` или `dark` и сохраняет выбор в `localStorage` по ключу `agitvuc-theme`. Основные стили тем находятся в `src/styles/global.css`.

## Форма

Форма отправляет данные в `src/pages/api/contact.ts`. Сейчас это демонстрационный endpoint: он валидирует обязательные поля и возвращает успешный JSON-ответ. Для реальной отправки нужно подключить CRM, почту, Telegram-бота или другой backend-сервис.

## Сборка

Перед публикацией проверьте сборку:

```bash
npm run build
```

Готовые файлы появятся в:

```text
dist/
```

## Публикация

Проект можно разместить на любом статическом хостинге: GitHub Pages, Netlify, Vercel, Timeweb Cloud, обычный nginx и т.д. Для статического размещения достаточно содержимого папки `dist/`.
