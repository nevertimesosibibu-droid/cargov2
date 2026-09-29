# Cargo 7 Client

Самостоятельное React-приложение для GitHub Pages: поиск посылки по коду, шкала доставки, запрос доплаты, Telegram и отзывы.

## Запуск

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Web App конфигурация Firebase уже добавлена в приложение. Для локального запуска копирование `.env` не требуется. База: `https://cargo-7ae7b-default-rtdb.firebaseio.com`.

## Данные

Используется Realtime Database, не Firestore:

- `shipments/{code}` — административные данные заказа.
- `publicTracking/{code}` — только статус, способ и срок доставки, пауза и запрос доплаты.
- `reviews/{id}` — приватные отзывы, видимые администратору.
- `publicReviews/{id}` — опубликованные отзывы для клиента.

Скопируйте `database.rules.json` в Rules Realtime Database и опубликуйте правила. Они уже разрешают администрирование подтверждённому пользователю `smixnevertime@gmail.com`. Публичная карточка содержит только разрешённые клиенту поля; трек-код имеет случайный длинный суффикс.

## GitHub Pages

Поместите содержимое этой папки в отдельный GitHub-репозиторий. В Settings → Pages выберите **GitHub Actions**. Firebase Web App config уже находится в исходниках, поэтому secrets для клиентского приложения не нужны. После push в `main` workflow соберёт сайт и опубликует Pages.

Статусы рассчитываются в браузере по времени создания, способу перевозки и сроку: авиа 5–12 дней, автобус 10–18. Это простой вариант для статического хостинга, без серверной функции: переходы не записываются в историю базы, а часы клиента можно изменить.# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend enabling type-aware lint rules by installing `oxlint-tsgolint` and editing `.oxlintrc.json`:

```json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["react", "typescript", "oxc"],
  "options": {
    "typeAware": true
  },
  "rules": {
    "react/rules-of-hooks": "error",
    "react/only-export-components": ["warn", { "allowConstantExport": true }]
  }
}
```

See the [Oxlint rules documentation](https://oxc.rs/docs/guide/usage/linter/rules) for the full list of rules and categories.
