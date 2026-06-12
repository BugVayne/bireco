/**
 * ============================================================
 * ClearMetrics — бэкенд на Google Apps Script
 * ============================================================
 * Что делает:
 *  - GET  ?action=news  -> отдаёт новости из листа "News" (JSON)
 *  - POST action=lead   -> сохраняет заявку с сайта в лист "Leads"
 *                          (с проверкой reCAPTCHA и honeypot)
 *  - POST action=admin  -> управление новостями из admin.html
 *                          (по паролю ADMIN_TOKEN)
 *
 * Как развернуть — см. README.md в корне проекта.
 *
 * Настройки (Project Settings -> Script Properties):
 *  ADMIN_TOKEN       — пароль для админки новостей (придумайте свой)
 *  RECAPTCHA_SECRET  — секретный ключ reCAPTCHA v2 (необязательно,
 *                      без него проверка капчи пропускается)
 *  NOTIFY_EMAIL      — email для уведомлений о новых заявках (необязательно)
 */

var NEWS_SHEET = 'News';
var LEADS_SHEET = 'Leads';

var NEWS_HEADERS = ['id', 'date', 'title_en', 'title_ru', 'summary_en', 'summary_ru', 'body_en', 'body_ru', 'image'];
var LEADS_HEADERS = ['timestamp', 'name', 'email', 'phone', 'message', 'service', 'lang'];

/* ---------------- Вспомогательные ---------------- */

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function getSheet(name, headers) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function readNews() {
  var sheet = getSheet(NEWS_SHEET, NEWS_HEADERS);
  var values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  var headers = values[0];
  var items = [];
  for (var i = 1; i < values.length; i++) {
    var row = values[i];
    if (!row[0]) continue;
    var item = {};
    for (var j = 0; j < headers.length; j++) {
      var v = row[j];
      if (v instanceof Date) {
        v = Utilities.formatDate(v, Session.getScriptTimeZone(), 'yyyy-MM-dd');
      }
      item[headers[j]] = v == null ? '' : String(v);
    }
    items.push(item);
  }
  return items;
}

/* ---------------- GET: новости ---------------- */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) || 'news';
  if (action === 'news') {
    return jsonResponse({ ok: true, items: readNews() });
  }
  return jsonResponse({ ok: false, error: 'unknown action' });
}

/* ---------------- POST: заявки и админка ---------------- */

function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonResponse({ ok: false, error: 'bad request' });
  }

  if (data.action === 'lead') return handleLead(data);
  if (data.action === 'admin') return handleAdmin(data);
  return jsonResponse({ ok: false, error: 'unknown action' });
}

/* ---------------- Заявка с формы ---------------- */

function handleLead(data) {
  // 1. Honeypot: скрытое поле должно быть пустым у людей
  if (data.website) {
    // Бота молча "принимаем", но ничего не сохраняем
    return jsonResponse({ ok: true });
  }

  // 2. Проверка обязательных полей
  if (!data.name || !data.email || !data.phone) {
    return jsonResponse({ ok: false, error: 'missing fields' });
  }

  // 3. Проверка reCAPTCHA (если настроен секретный ключ)
  var secret = PropertiesService.getScriptProperties().getProperty('RECAPTCHA_SECRET');
  if (secret) {
    if (!data.captcha) return jsonResponse({ ok: false, error: 'captcha required' });
    var resp = UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'post',
      payload: { secret: secret, response: data.captcha },
      muteHttpExceptions: true,
    });
    var verdict = JSON.parse(resp.getContentText());
    if (!verdict.success) return jsonResponse({ ok: false, error: 'captcha failed' });
  }

  // 4. Сохранение в таблицу
  var sheet = getSheet(LEADS_SHEET, LEADS_HEADERS);
  sheet.appendRow([
    new Date(),
    String(data.name).slice(0, 200),
    String(data.email).slice(0, 200),
    String(data.phone).slice(0, 50),
    String(data.message || '').slice(0, 5000),
    String(data.service || '').slice(0, 200),
    String(data.lang || ''),
  ]);

  // 5. Уведомление на почту (если настроено)
  var notify = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');
  if (notify) {
    try {
      MailApp.sendEmail(
        notify,
        'Новая заявка с сайта: ' + (data.service || 'общая'),
        'Имя: ' + data.name + '\nEmail: ' + data.email + '\nТелефон: ' + data.phone +
        '\nСервис: ' + (data.service || '-') + '\n\nСообщение:\n' + (data.message || '-')
      );
    } catch (err) {
      // Заявка уже сохранена — ошибку почты не считаем фатальной
    }
  }

  return jsonResponse({ ok: true });
}

/* ---------------- Админка новостей ---------------- */

function handleAdmin(data) {
  var adminToken = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
  if (!adminToken || data.token !== adminToken) {
    return jsonResponse({ ok: false, error: 'unauthorized' });
  }

  var sheet = getSheet(NEWS_SHEET, NEWS_HEADERS);

  if (data.op === 'list') {
    return jsonResponse({ ok: true, items: readNews() });
  }

  if (data.op === 'add') {
    var item = data.item || {};
    var id = 'n' + new Date().getTime();
    sheet.appendRow([
      id,
      item.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
      item.title_en || '', item.title_ru || '',
      item.summary_en || '', item.summary_ru || '',
      item.body_en || '', item.body_ru || '',
      item.image || '',
    ]);
    return jsonResponse({ ok: true, id: id });
  }

  if (data.op === 'update') {
    var item = data.item || {};
    var rowIndex = findNewsRow(sheet, item.id);
    if (rowIndex === -1) return jsonResponse({ ok: false, error: 'not found' });
    sheet.getRange(rowIndex, 1, 1, NEWS_HEADERS.length).setValues([[
      item.id,
      item.date || '',
      item.title_en || '', item.title_ru || '',
      item.summary_en || '', item.summary_ru || '',
      item.body_en || '', item.body_ru || '',
      item.image || '',
    ]]);
    return jsonResponse({ ok: true });
  }

  if (data.op === 'delete') {
    var rowIndex = findNewsRow(sheet, data.id);
    if (rowIndex === -1) return jsonResponse({ ok: false, error: 'not found' });
    sheet.deleteRow(rowIndex);
    return jsonResponse({ ok: true });
  }

  return jsonResponse({ ok: false, error: 'unknown op' });
}

function findNewsRow(sheet, id) {
  if (!id) return -1;
  var ids = sheet.getRange(2, 1, Math.max(sheet.getLastRow() - 1, 1), 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2; // +2: заголовок + индекс с 1
  }
  return -1;
}
