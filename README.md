# Сказка Востока

Мобильное web-приложение ресторана восточной кухни «Сказка Востока».
Одна кодовая база, четыре канала дистрибуции: Telegram Mini App, VK Mini App, MAX и браузер.

## Стек

- React 18 · Vite · TypeScript
- Tailwind CSS с CSS-переменными из дизайн-системы
- React Router v6 · Zustand · TanStack Query · react-hook-form · zod · framer-motion · lucide-react

## Запуск

```bash
npm install
npm run dev        # http://localhost:5173
```

## Скрипты

```bash
npm run dev        # dev-сервер
npm run build      # продакшн-сборка (tsc + vite build)
npm run preview    # превью сборки
npm run lint       # ESLint
npm run format     # Prettier
npm run typecheck  # tsc --noEmit
```

## Структура

```
src/
  api/          # axios-клиент + запросы
  mocks/        # моки под API (пока Contract не утверждён)
  components/
    ui/         # базовые компоненты из дизайн-системы
    layout/     # AppShell, BottomTabBar, ScreenHeader
    dish/       # DishCard, DishSheet, DishGrid
    cart/       # CartItem, CartSummary
    stories/    # StoriesBar, StoryViewer
    banner/     # BannerSlider
    chat/       # ChatMessage, ChatInput
  screens/      # экраны
  stores/       # Zustand-сторы (cart, user, ui)
  hooks/        # useEnvironment, useAuth, useCart
  providers/    # AuthProvider, EnvironmentProvider
  lib/          # formatPrice, formatWeight, analytics, deeplink
  types/        # общие типы (Dish, CartItem, Order, ...)
  assets/       # бандлящиеся ассеты (продуктовые фото)
```

## Дизайн-система

`design-system-bundle/` — экспорт из claude.ai/design: HTML-прототип, скрины,
чат с итерациями пользователя. Источник истины для визуала. CSS-токены
продублированы в `src/index.css` и прокинуты в Tailwind через `tailwind.config.ts`.

Логотип — `design-system-bundle/logo.svg` + реакт-компонент в
`src/components/ui/Logo.tsx`. Когда логотип слишком широкий — используется
текст «сказка / востока» в две строки шрифтом Alice.
