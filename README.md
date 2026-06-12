# ClearMetrics — сайт BI-консалтинга

Статический сайт (HTML/CSS/JS, без сборки) + бесплатный бэкенд на Google Apps Script:
заявки с формы и новости хранятся в Google Таблице, новости добавляются через
страницу-админку `admin.html`.

## Структура

```
index.html            — главная (Hero, Insights, Services, Industries, Careers, About Us)
news.html             — все новости развёрнуто
admin.html            — админка новостей (вход по паролю)
css/styles.css        — стили
js/config.js          — НАСТРОЙКИ (URL бэкенда, ключ reCAPTCHA, контакты)
js/i18n.js            — переводы EN/RU и переключатель языка
js/services-data.js   — тексты сервисов (EN/RU) + демо-новости
js/news-api.js        — загрузка новостей
js/main.js            — логика главной (карусель, форма, видео)
js/news-page.js       — логика страницы новостей
js/admin.js           — логика админки
apps-script/Code.gs   — код бэкенда для Google Apps Script
```

Пока бэкенд не настроен, сайт показывает демо-новости из `js/services-data.js`,
а форма выводит подсказку вместо отправки — локально всё можно посмотреть сразу.

## Шаг 1. Google Таблица + Apps Script (15 минут)

1. Создайте новую Google Таблицу: https://sheets.new
   Листы `News` и `Leads` создадутся автоматически при первом обращении.
2. В таблице: **Расширения → Apps Script**.
3. Удалите содержимое `Code.gs` и вставьте код из `apps-script/Code.gs` этого проекта.
4. Слева **⚙ Project Settings → Script Properties → Add script property**:
   - `ADMIN_TOKEN` — придумайте длинный пароль для админки (например, 20+ символов);
   - `RECAPTCHA_SECRET` — секретный ключ reCAPTCHA (см. Шаг 2; можно добавить позже);
   - `NOTIFY_EMAIL` — (необязательно) почта для уведомлений о новых заявках.
5. **Deploy → New deployment → ⚙ Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Нажмите Deploy, разрешите доступ, скопируйте **URL веб-приложения** (`https://script.google.com/macros/s/…/exec`).
6. Вставьте этот URL в `js/config.js` → `APPS_SCRIPT_URL`.

> Важно: после любого изменения кода в Apps Script делайте
> **Deploy → Manage deployments → ✏ → New version**, иначе изменения не применятся.

## Шаг 2. reCAPTCHA (5 минут)

1. Откройте https://www.google.com/recaptcha/admin/create
2. Тип: **reCAPTCHA v2 → "I'm not a robot" Checkbox**.
3. Домены: добавьте домен сайта (и `localhost` для тестирования).
4. **Ключ сайта (site key)** → в `js/config.js` → `RECAPTCHA_SITE_KEY`.
5. **Секретный ключ (secret key)** → в Script Properties → `RECAPTCHA_SECRET` (Шаг 1.4).

Без ключей форма работает, но без капчи (остаётся honeypot-защита от простых ботов).

## Шаг 3. Публикация сайта (настроено)

Сайт публикуется автоматически через GitHub Pages:

- Репозиторий: https://github.com/BugVayne/bireco
- Каждый `git push` в ветку `main` запускает workflow `.github/workflows/deploy.yml`,
  который выкладывает сайт на **https://bugvayne.github.io/bireco/**
- Статус деплоя: вкладка **Actions** в репозитории.

Откат к предыдущей версии: `git revert <commit>` + `git push` (или Re-run старого
workflow в Actions).

При переезде на собственный домен: обновите URL в `sitemap.xml`, `robots.txt`
и мета-тегах (`og:url`, `og:image`, `canonical`) в `index.html` / `news.html`,
а также добавьте домен в настройки reCAPTCHA (Шаг 2.3).

## Как добавлять новости

1. Откройте `https://ваш-сайт/admin.html`.
2. Введите пароль (`ADMIN_TOKEN` из Шага 1.4).
3. Заполните форму (дата, заголовки и тексты на EN и RU, ссылка на картинку) → **Сохранить**.
4. Новость сразу появится в ленте на главной и на странице «Все новости».

Альтернатива: новости можно править прямо в Google Таблице на листе `News`
(колонки: `id, date, title_en, title_ru, summary_en, summary_ru, body_en, body_ru, image`).
Дату указывайте в формате `ГГГГ-ММ-ДД`.

Картинки для новостей: загрузите файл на любой хостинг изображений
(или в папку сайта) и вставьте прямую ссылку в поле `image`.

## Заявки с формы

Каждая отправка формы «I am interested» попадает в лист `Leads`
(время, имя, email, телефон, сообщение, сервис, язык).
Если задан `NOTIFY_EMAIL`, на него приходит письмо о каждой заявке.

Защита от спама: reCAPTCHA v2 (проверяется на сервере) + скрытое honeypot-поле.

## Что поменять под себя

- **Название и логотип**: «ClearMetrics» в `index.html`, `news.html`, `admin.html` (поиск по тексту), логотип — блок `.logo`.
- **Контакты в футере**: `js/config.js` → `CONTACT_EMAIL`, `LINKEDIN_URL`.
- **Видео для "Watch overview"**: `js/config.js` → `OVERVIEW_VIDEO_URL`
  (embed-ссылка YouTube вида `https://www.youtube.com/embed/XXXX`).
  Пока пусто — кнопка прокручивает к сервисам.
- **Тексты сервисов**: `js/services-data.js` (EN и RU).
- **Тексты разделов** (hero, Industries, Careers, About): `js/i18n.js`.
- **Цвета**: переменные в начале `css/styles.css` (`--navy`, `--blue`, …).
