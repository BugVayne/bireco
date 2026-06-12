// Загрузка новостей: из Google Apps Script, либо демо-данные, если бэкенд не настроен.

window.NewsAPI = (function () {
  var cache = null;

  function normalize(item) {
    return {
      id: String(item.id || ""),
      date: String(item.date || ""),
      title_en: item.title_en || "",
      title_ru: item.title_ru || "",
      summary_en: item.summary_en || "",
      summary_ru: item.summary_ru || "",
      body_en: item.body_en || "",
      body_ru: item.body_ru || "",
      image: item.image || "",
    };
  }

  function sortByDateDesc(list) {
    return list.slice().sort(function (a, b) {
      return (b.date || "").localeCompare(a.date || "");
    });
  }

  function fetchNews() {
    if (cache) return Promise.resolve(cache);

    var url = (window.SITE_CONFIG && window.SITE_CONFIG.APPS_SCRIPT_URL) || "";
    if (!url) {
      cache = sortByDateDesc((window.SAMPLE_NEWS || []).map(normalize));
      return Promise.resolve(cache);
    }

    return fetch(url + "?action=news")
      .then(function (r) {
        if (!r.ok) throw new Error("HTTP " + r.status);
        return r.json();
      })
      .then(function (data) {
        var items = (data && data.items) || [];
        cache = sortByDateDesc(items.map(normalize));
        return cache;
      });
  }

  // Локализованные поля новости для текущего языка (с фолбэком на другой язык)
  function loc(item, field) {
    var lang = window.currentLang || "en";
    var other = lang === "en" ? "ru" : "en";
    return item[field + "_" + lang] || item[field + "_" + other] || "";
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso + (iso.length === 10 ? "T00:00:00" : ""));
    if (isNaN(d.getTime())) return iso;
    var lang = window.currentLang || "en";
    return d.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  return { fetchNews: fetchNews, loc: loc, formatDate: formatDate, escapeHtml: escapeHtml };
})();
