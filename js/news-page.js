// Страница всех новостей: развёрнутый список + прокрутка к новости из якоря (#id).

(function () {
  "use strict";

  var esc = window.NewsAPI.escapeHtml;
  var list = document.getElementById("newsList");

  var burger = document.getElementById("burgerBtn");
  var nav = document.getElementById("mainNav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      nav.classList.toggle("open");
      burger.classList.toggle("open");
    });
  }
  var yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  function render(items) {
    if (!items.length) {
      list.innerHTML = '<div class="news-status">' + esc(window.t("insights.empty")) + "</div>";
      return;
    }
    list.innerHTML = items
      .map(function (n) {
        var img = n.image
          ? '<img class="news-img" src="' + esc(n.image) + '" alt="" loading="lazy" />'
          : "";
        return (
          '<article class="news-article" id="' + esc(n.id) + '">' +
          '<span class="news-date">' + esc(window.NewsAPI.formatDate(n.date)) + "</span>" +
          "<h2>" + esc(window.NewsAPI.loc(n, "title")) + "</h2>" +
          img +
          '<div class="news-body">' + esc(window.NewsAPI.loc(n, "body")) + "</div>" +
          "</article>"
        );
      })
      .join("");

    // Прокрутка к новости, если пришли по ссылке "Подробнее" с главной
    var hash = decodeURIComponent(location.hash.replace("#", ""));
    if (hash) {
      var target = document.getElementById(hash);
      if (target) setTimeout(function () { target.scrollIntoView({ behavior: "smooth", block: "start" }); }, 80);
    }
  }

  function load() {
    window.NewsAPI.fetchNews()
      .then(render)
      .catch(function () {
        list.innerHTML = '<div class="news-status">' + esc(window.t("insights.loadError")) + "</div>";
      });
  }

  document.addEventListener("langchange", load);
  load();
})();
