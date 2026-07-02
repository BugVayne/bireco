/**
 * ============================================================
 * Clear Metrics — бэкенд на Google Apps Script
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
 *  DEBUG             — 'true' включает подробный лог по каждому шагу
 *                      обработки заявки (Apps Script -> Executions/Logs) и
 *                      добавляет поле debug с текстом ошибки в JSON-ответ.
 *                      Меняется без передеплоя — действует на следующий же
 *                      запрос. Не оставляйте включённым в проде надолго:
 *                      поле debug может попасть в консоль браузера.
 *
 * Защита:
 *  - Админка: после входа выдаётся сессия на 2 часа (продлевается при
 *    активности); пароль не гоняется с каждым запросом.
 *  - Форма: не больше 5 заявок в час с одного email и не больше 50 в час
 *    всего (на случай спама с разными адресами) — поверх reCAPTCHA и honeypot.
 */

var SESSION_TTL_SEC = 7200;     // сессия админки: 2 часа
var LEAD_LIMIT_PER_EMAIL = 5;   // заявок в час с одного email
var LEAD_LIMIT_TOTAL = 50;      // заявок в час со всех адресов суммарно

var LOGIN_LIMIT_ATTEMPTS = 10;    // неудачных попыток входа в админку в окне
var LOGIN_LIMIT_WINDOW_SEC = 900; // окно блокировки: 15 минут

var NEWS_SHEET = 'News';
var LEADS_SHEET = 'Leads';

var NEWS_HEADERS = ['id', 'date', 'title_en', 'title_ru', 'summary_en', 'summary_ru', 'body_en', 'body_ru', 'image'];
var LEADS_HEADERS = ['timestamp', 'name', 'email', 'phone', 'message', 'service', 'lang', 'profile', 'cv'];

var CV_MAX_BYTES = 5 * 1024 * 1024;        // лимит размера резюме
var CV_ALLOWED_EXT = ['pdf', 'doc', 'docx'];
var CV_FOLDER_NAME = 'Website CV uploads'; // папка на Drive по умолчанию

var IMAGE_MAX_BYTES = 5 * 1024 * 1024;              // лимит размера картинки новости
var IMAGE_ALLOWED_EXT = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
var IMAGE_FOLDER_NAME = 'Website news images';      // папка на Drive по умолчанию

/* ---------------- Вспомогательные ---------------- */

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function isDebug() {
  return PropertiesService.getScriptProperties().getProperty('DEBUG') === 'true';
}

// Подробный лог (виден в Apps Script: View -> Executions / Logs),
// пишется только при включённом DEBUG, чтобы не шуметь в проде.
function dlog(msg) {
  if (isDebug()) Logger.log(msg);
}

function errInfo(err) {
  return (err && err.message) ? err.message : String(err);
}

// Ответ с ошибкой: при DEBUG=true добавляет поле debug с реальным текстом
// исключения, чтобы не лезть в логи Apps Script ради одной строки.
function errorResponse(error, err) {
  var obj = { ok: false, error: error };
  if (err !== undefined && isDebug()) obj.debug = errInfo(err);
  return jsonResponse(obj);
}

// Сравнение строк за постоянное время (не зависящее от того, на каком
// символе нашлось расхождение) — защита пароля админки от timing-атак.
function timingSafeEqual(a, b) {
  a = String(a == null ? '' : a);
  b = String(b == null ? '' : b);
  var len = Math.max(a.length, b.length);
  var mismatch = a.length === b.length ? 0 : 1;
  for (var i = 0; i < len; i++) {
    var ca = i < a.length ? a.charCodeAt(i) : 0;
    var cb = i < b.length ? b.charCodeAt(i) : 0;
    mismatch |= (ca ^ cb);
  }
  return mismatch === 0;
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

  // Подстраховка: если что-то внутри бросит необработанное исключение,
  // Apps Script вместо нашего JSON вернёт свою HTML-страницу ошибки —
  // на фронте это ломает r.json() и выглядит как "что-то пошло не так"
  // без единой зацепки. Ловим здесь, логируем и всегда отвечаем JSON-ом.
  try {
    dlog('doPost: action=' + data.action + (data.action === 'admin' ? ' op=' + data.op : ''));
    if (data.action === 'lead') return handleLead(data);
    if (data.action === 'admin') return handleAdmin(data);
    return jsonResponse({ ok: false, error: 'unknown action' });
  } catch (err) {
    Logger.log('doPost: unhandled error: ' + errInfo(err) + (err && err.stack ? '\n' + err.stack : ''));
    return errorResponse('server error', err);
  }
}

/* ---------------- Заявка с формы ---------------- */

function handleLead(data) {
  dlog('handleLead: start, hasCv=' + !!data.cvData + ' service=' + data.service);

  // 1. Honeypot: скрытое поле должно быть пустым у людей
  if (data.website) {
    dlog('handleLead: honeypot tripped, silently accepting');
    // Бота молча "принимаем", но ничего не сохраняем
    return jsonResponse({ ok: true });
  }

  // 2. Проверка обязательных полей и формата (дублирует клиентскую,
  //    т.к. клиентскую валидацию легко обойти). Телефон обязателен.
  if (!data.name || !data.email || !data.phone) {
    dlog('handleLead: missing fields');
    return jsonResponse({ ok: false, error: 'missing fields' });
  }
  var phoneDigits = String(data.phone).replace(/\D/g, '');
  if (phoneDigits.length < 7 || phoneDigits.length > 15) {
    dlog('handleLead: invalid phone, digits=' + phoneDigits.length);
    return jsonResponse({ ok: false, error: 'invalid phone' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(data.email).trim())) {
    dlog('handleLead: invalid email');
    return jsonResponse({ ok: false, error: 'invalid email' });
  }

  // 3. Лимит частоты: не больше N заявок в час с одного email и суммарно
  var cache = CacheService.getScriptCache();
  var emailKey = 'lead:' + String(data.email).trim().toLowerCase();
  var emailCount = Number(cache.get(emailKey) || 0);
  var totalCount = Number(cache.get('lead:total') || 0);
  if (emailCount >= LEAD_LIMIT_PER_EMAIL || totalCount >= LEAD_LIMIT_TOTAL) {
    dlog('handleLead: rate limited, emailCount=' + emailCount + ' totalCount=' + totalCount);
    return jsonResponse({ ok: false, error: 'rate limited' });
  }

  // 4. Проверка reCAPTCHA (если настроен секретный ключ).
  //    Если API недоступен или вернул не-200/не-JSON — считаем капчу
  //    непройденной (fail closed), а не пропускаем заявку молча.
  var secret = PropertiesService.getScriptProperties().getProperty('RECAPTCHA_SECRET');
  if (secret) {
    if (!data.captcha) {
      dlog('handleLead: captcha required but missing');
      return jsonResponse({ ok: false, error: 'captcha required' });
    }
    var resp = UrlFetchApp.fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'post',
      payload: { secret: secret, response: data.captcha },
      muteHttpExceptions: true,
    });
    var verdict = null;
    if (resp.getResponseCode() === 200) {
      try {
        verdict = JSON.parse(resp.getContentText());
      } catch (err) {
        dlog('handleLead: captcha response not JSON: ' + errInfo(err));
        verdict = null;
      }
    } else {
      dlog('handleLead: captcha API HTTP ' + resp.getResponseCode());
    }
    if (!verdict || !verdict.success) {
      dlog('handleLead: captcha failed, verdict=' + JSON.stringify(verdict));
      return jsonResponse({ ok: false, error: 'captcha failed' });
    }
  } else {
    dlog('handleLead: RECAPTCHA_SECRET not set, skipping captcha check');
  }

  cache.put(emailKey, String(emailCount + 1), 3600);
  cache.put('lead:total', String(totalCount + 1), 3600);

  var notify = PropertiesService.getScriptProperties().getProperty('NOTIFY_EMAIL');

  // 5. Резюме: сохраняем файл на Drive, получаем ссылку
  var profile = String(data.profile || '').slice(0, 500);
  var cvUrl = '';
  if (data.cvData) {
    try {
      cvUrl = saveCv(data, notify);
      dlog('handleLead: cv saved, url=' + cvUrl);
    } catch (err) {
      Logger.log('handleLead: saveCv failed: ' + errInfo(err) + (err && err.stack ? '\n' + err.stack : ''));
      return errorResponse('cv error', err);
    }
  }

  // 6. Сохранение в таблицу
  try {
    var sheet = getSheet(LEADS_SHEET, LEADS_HEADERS);
    withLock(function () {
      sheet.appendRow([
        new Date(),
        String(data.name).slice(0, 200),
        String(data.email).slice(0, 200),
        String(data.phone || '').slice(0, 50),
        String(data.message || '').slice(0, 5000),
        String(data.service || '').slice(0, 200),
        String(data.lang || ''),
        profile,
        cvUrl,
      ]);
    });
    dlog('handleLead: lead row appended');
  } catch (err) {
    Logger.log('handleLead: sheet append failed: ' + errInfo(err) + (err && err.stack ? '\n' + err.stack : ''));
    return errorResponse('save error', err);
  }

  // 7. Уведомление на почту (если настроено)
  if (notify) {
    try {
      MailApp.sendEmail(
        notify,
        'Новая заявка с сайта: ' + (data.service || 'общая'),
        'Имя: ' + data.name + '\nEmail: ' + data.email + '\nТелефон: ' + (data.phone || '-') +
        '\nСервис: ' + (data.service || '-') +
        (profile ? '\nПрофиль: ' + profile : '') +
        (cvUrl ? '\nРезюме: ' + cvUrl : '') +
        '\n\nСообщение:\n' + (data.message || '-')
      );
      dlog('handleLead: notify email sent');
    } catch (err) {
      // Заявка уже сохранена — ошибку почты не считаем фатальной
      dlog('handleLead: notify email failed (non-fatal): ' + errInfo(err));
    }
  }

  return jsonResponse({ ok: true });
}

/* ---------------- Сохранение резюме на Google Drive ---------------- */

function saveCv(data, notifyEmail) {
  var name = String(data.cvName || 'cv');
  var ext = (name.split('.').pop() || '').toLowerCase();
  dlog('saveCv: name=' + name + ' ext=' + ext + ' type=' + data.cvType + ' b64len=' + (data.cvData ? data.cvData.length : 0));
  if (CV_ALLOWED_EXT.indexOf(ext) === -1) throw new Error('bad type: ' + ext);

  var bytes;
  try {
    bytes = Utilities.base64Decode(data.cvData);
  } catch (err) {
    throw new Error('bad base64: ' + errInfo(err));
  }
  dlog('saveCv: decoded bytes=' + bytes.length);
  if (bytes.length > CV_MAX_BYTES) throw new Error('too big: ' + bytes.length + ' bytes');

  var safeName = name.replace(/[^\w.\- ]+/g, '_').slice(0, 120);
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  var blob = Utilities.newBlob(bytes, data.cvType || 'application/octet-stream', stamp + '_' + safeName);

  var folder = getCvFolder();
  dlog('saveCv: target folder id=' + folder.getId() + ' name=' + folder.getName());
  var file = folder.createFile(blob);
  dlog('saveCv: file created id=' + file.getId());
  // Файл остаётся приватным; при необходимости даём доступ получателю уведомлений
  if (notifyEmail) {
    try {
      file.addViewer(notifyEmail);
    } catch (e) {
      dlog('saveCv: addViewer failed (non-fatal): ' + errInfo(e));
    }
  }
  return file.getUrl();
}

function getCvFolder() {
  var id = PropertiesService.getScriptProperties().getProperty('CV_FOLDER_ID');
  if (id) {
    dlog('getCvFolder: using CV_FOLDER_ID=' + id);
    return DriveApp.getFolderById(id);
  }
  dlog('getCvFolder: CV_FOLDER_ID not set, looking up by name "' + CV_FOLDER_NAME + '"');
  var it = DriveApp.getFoldersByName(CV_FOLDER_NAME);
  if (it.hasNext()) return it.next();
  dlog('getCvFolder: folder not found, creating it');
  return DriveApp.createFolder(CV_FOLDER_NAME);
}

/* ---------------- Загрузка картинки новости на Google Drive ---------------- */

function saveNewsImage(data) {
  var name = String(data.imageName || 'image');
  var ext = (name.split('.').pop() || '').toLowerCase();
  dlog('saveNewsImage: name=' + name + ' ext=' + ext + ' type=' + data.imageType + ' b64len=' + (data.imageData ? data.imageData.length : 0));
  if (IMAGE_ALLOWED_EXT.indexOf(ext) === -1) throw new Error('bad type: ' + ext);

  var bytes;
  try {
    bytes = Utilities.base64Decode(data.imageData);
  } catch (err) {
    throw new Error('bad base64: ' + errInfo(err));
  }
  dlog('saveNewsImage: decoded bytes=' + bytes.length);
  if (bytes.length > IMAGE_MAX_BYTES) throw new Error('too big: ' + bytes.length + ' bytes');

  var safeName = name.replace(/[^\w.\- ]+/g, '_').slice(0, 120);
  var stamp = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyyMMdd-HHmmss');
  var blob = Utilities.newBlob(bytes, data.imageType || 'application/octet-stream', stamp + '_' + safeName);

  var folder = getImageFolder();
  dlog('saveNewsImage: target folder id=' + folder.getId() + ' name=' + folder.getName());
  var file = folder.createFile(blob);
  // Картинка используется в <img src> на публичном сайте — файл должен быть доступен по ссылке.
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  dlog('saveNewsImage: file created id=' + file.getId());
  return 'https://lh3.googleusercontent.com/d/' + file.getId();
}

// Достаёт id файла из ссылки вида https://lh3.googleusercontent.com/d/<id>,
// которую сами же выдаём в saveNewsImage(). Не трогаем чужие/внешние ссылки.
function extractDriveImageId(url) {
  var m = /^https:\/\/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/.exec(String(url || ''));
  return m ? m[1] : null;
}

// Убирает в корзину Drive картинку новости, которую мы сами туда когда-то положили
// (при замене на другую или при удалении новости) — иначе файлы копятся без дела.
// Корзина хранит файл ещё ~30 дней, так что случайную замену можно откатить вручную.
function trashOwnedImage(url) {
  var id = extractDriveImageId(url);
  if (!id) return;
  try {
    DriveApp.getFileById(id).setTrashed(true);
    dlog('trashOwnedImage: trashed ' + id);
  } catch (err) {
    dlog('trashOwnedImage: failed for ' + id + ': ' + errInfo(err));
  }
}

function getImageFolder() {
  var id = PropertiesService.getScriptProperties().getProperty('IMAGE_FOLDER_ID');
  if (id) {
    dlog('getImageFolder: using IMAGE_FOLDER_ID=' + id);
    return DriveApp.getFolderById(id);
  }
  dlog('getImageFolder: IMAGE_FOLDER_ID not set, looking up by name "' + IMAGE_FOLDER_NAME + '"');
  var it = DriveApp.getFoldersByName(IMAGE_FOLDER_NAME);
  if (it.hasNext()) return it.next();
  dlog('getImageFolder: folder not found, creating it');
  return DriveApp.createFolder(IMAGE_FOLDER_NAME);
}

/* ---------------- Блокировка одновременных записей ---------------- */

function withLock(fn) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

/* ---------------- Админка новостей ---------------- */

function handleAdmin(data) {
  var cache = CacheService.getScriptCache();

  // Вход: проверяем пароль и выдаём сессию с ограниченным сроком жизни.
  // Защита от подбора пароля: после LOGIN_LIMIT_ATTEMPTS неудачных попыток
  // вход блокируется на LOGIN_LIMIT_WINDOW_SEC (окно продлевается каждой
  // новой неудачной попыткой, пока их не прекратят).
  if (data.op === 'login') {
    var failKey = 'admin:loginFails';
    var fails = Number(cache.get(failKey) || 0);
    if (fails >= LOGIN_LIMIT_ATTEMPTS) {
      return jsonResponse({ ok: false, error: 'too many attempts' });
    }
    var adminToken = PropertiesService.getScriptProperties().getProperty('ADMIN_TOKEN');
    if (!adminToken || !timingSafeEqual(data.token, adminToken)) {
      cache.put(failKey, String(fails + 1), LOGIN_LIMIT_WINDOW_SEC);
      return jsonResponse({ ok: false, error: 'unauthorized' });
    }
    cache.remove(failKey);
    var sid = Utilities.getUuid();
    cache.put('sess:' + sid, '1', SESSION_TTL_SEC);
    return jsonResponse({ ok: true, session: sid, ttl: SESSION_TTL_SEC });
  }

  // Все остальные операции — только с живой сессией.
  // Активность продлевает сессию ещё на SESSION_TTL_SEC.
  var sid = String(data.session || '');
  if (!sid || !cache.get('sess:' + sid)) {
    return jsonResponse({ ok: false, error: 'session expired' });
  }
  cache.put('sess:' + sid, '1', SESSION_TTL_SEC);

  var sheet = getSheet(NEWS_SHEET, NEWS_HEADERS);

  if (data.op === 'list') {
    return jsonResponse({ ok: true, items: readNews() });
  }

  if (data.op === 'add') {
    var item = data.item || {};
    var id = 'n' + new Date().getTime();
    var imageUrl;
    try {
      imageUrl = item.imageData ? saveNewsImage(item) : (item.image || '');
    } catch (err) {
      return jsonResponse({ ok: false, error: 'image error: ' + errInfo(err) });
    }
    withLock(function () {
      sheet.appendRow([
        id,
        item.date || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd'),
        item.title_en || '', item.title_ru || '',
        item.summary_en || '', item.summary_ru || '',
        item.body_en || '', item.body_ru || '',
        imageUrl,
      ]);
    });
    return jsonResponse({ ok: true, id: id });
  }

  if (data.op === 'update') {
    var item = data.item || {};
    var imageUrl;
    try {
      imageUrl = item.imageData ? saveNewsImage(item) : (item.image || '');
    } catch (err) {
      return jsonResponse({ ok: false, error: 'image error: ' + errInfo(err) });
    }
    return withLock(function () {
      var rowIndex = findNewsRow(sheet, item.id);
      if (rowIndex === -1) return jsonResponse({ ok: false, error: 'not found' });
      var imageCol = NEWS_HEADERS.indexOf('image') + 1;
      var oldImage = sheet.getRange(rowIndex, imageCol).getValue();
      sheet.getRange(rowIndex, 1, 1, NEWS_HEADERS.length).setValues([[
        item.id,
        item.date || '',
        item.title_en || '', item.title_ru || '',
        item.summary_en || '', item.summary_ru || '',
        item.body_en || '', item.body_ru || '',
        imageUrl,
      ]]);
      // Если картинку заменили или убрали — старый файл в Drive больше не нужен.
      if (oldImage && oldImage !== imageUrl) trashOwnedImage(oldImage);
      return jsonResponse({ ok: true });
    });
  }

  if (data.op === 'delete') {
    return withLock(function () {
      var rowIndex = findNewsRow(sheet, data.id);
      if (rowIndex === -1) return jsonResponse({ ok: false, error: 'not found' });
      var imageCol = NEWS_HEADERS.indexOf('image') + 1;
      var oldImage = sheet.getRange(rowIndex, imageCol).getValue();
      sheet.deleteRow(rowIndex);
      if (oldImage) trashOwnedImage(oldImage);
      return jsonResponse({ ok: true });
    });
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
