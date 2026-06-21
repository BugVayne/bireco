// Логика главной страницы: меню, сервисы, лента новостей, форма заявки, видео.

(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var esc = window.NewsAPI.escapeHtml;

  /* ---------- Мобильное меню ---------- */
  var burger = document.getElementById("burgerBtn");
  var nav = document.getElementById("mainNav");
  if (burger && nav) {
    burger.addEventListener("click", function () {
      nav.classList.toggle("open");
      burger.classList.toggle("open");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        nav.classList.remove("open");
        burger.classList.remove("open");
      }
    });
  }

  /* ---------- Подсветка активного пункта меню при скролле ---------- */
  var sections = ["insights", "services", "industries", "careers", "about"];
  function highlightNav() {
    var fromTop = window.scrollY + 120;
    var current = "";
    sections.forEach(function (id) {
      var el = document.getElementById(id);
      if (el && el.offsetTop <= fromTop) current = id;
    });
    document.querySelectorAll(".main-nav a").forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + current);
    });
  }
  window.addEventListener("scroll", highlightNav, { passive: true });

  /* ---------- Футер ---------- */
  var yearEl = document.getElementById("footerYear");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
  var emailEl = document.getElementById("footerEmail");
  if (emailEl && cfg.CONTACT_EMAIL) {
    emailEl.textContent = cfg.CONTACT_EMAIL;
    emailEl.href = "mailto:" + cfg.CONTACT_EMAIL;
  }
  var liEl = document.getElementById("footerLinkedin");
  if (liEl && cfg.LINKEDIN_URL) liEl.href = cfg.LINKEDIN_URL;

  /* ---------- Scroll reveal (плавное появление при прокрутке) ---------- */
  var revealObserver = null;
  if ("IntersectionObserver" in window) {
    revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
  }

  function observeReveals(root) {
    var els = (root || document).querySelectorAll(".reveal:not(.visible)");
    els.forEach(function (el) {
      if (revealObserver) revealObserver.observe(el);
      else el.classList.add("visible");
    });
  }

  /* ---------- Сжатие шапки при прокрутке ---------- */
  var header = document.querySelector(".site-header");
  function onScrollHeader() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });

  /* ---------- Анимированная прокрутка по якорям навигации ---------- */
  function animateScrollTo(targetY) {
    targetY = Math.max(0, Math.min(targetY, document.documentElement.scrollHeight - window.innerHeight));
    if (reducedMotion) {
      window.scrollTo(0, targetY);
      return;
    }
    var startY = window.scrollY;
    var dist = targetY - startY;
    if (Math.abs(dist) < 2) return;
    // Длительность зависит от расстояния: короткие переходы быстрые, длинные — до ~1.1с
    var dur = Math.min(1100, Math.max(500, Math.abs(dist) * 0.45));
    var start = null;
    function easeInOutCubic(t) {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      window.scrollTo(0, startY + dist * easeInOutCubic(p));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  function scrollToSection(target) {
    var headerH = header ? header.offsetHeight : 0;
    var y = target.getBoundingClientRect().top + window.scrollY - headerH - 14;
    animateScrollTo(y);
  }

  // Перехватываем клики по всем внутристраничным якорям (меню, футер)
  document.addEventListener("click", function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute("href").slice(1);
    var target = id && document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    scrollToSection(target);
    history.pushState(null, "", "#" + id);
  });

  /* ---------- Сервисы: структура из презентации ----------
     Одна сторона — название на цветном фоне, другая — краткое
     описание с кнопками Read more / I am interested.            */
  var grid = document.getElementById("servicesGrid");

  function renderServices() {
    if (!grid) return;
    var lang = window.currentLang || "en";
    var expandedIds = {};
    grid.querySelectorAll(".service-row.expanded").forEach(function (row) {
      expandedIds[row.getAttribute("data-id")] = true;
    });

    grid.innerHTML = (window.SERVICES || [])
      .map(function (s, i) {
        var num = (i + 1 < 10 ? "0" : "") + (i + 1);
        var expanded = expandedIds[s.id] ? " expanded" : "";
        return (
          '<article class="service-row reveal' + (i % 2 ? " flip" : "") + expanded + '" data-id="' + s.id + '" style="--tint:' + s.tint + ";--tint-dark:" + s.tint + 'd9">' +
          '<div class="service-banner">' +
          '<span class="service-num" aria-hidden="true">' + num + "</span>" +
          '<span class="service-icon">' + s.icon + "</span>" +
          "<h3>" + esc(s.title[lang]) + "</h3>" +
          '<span class="pulse-bars" aria-hidden="true"><span></span><span></span><span></span><span></span></span>' +
          "</div>" +
          '<div class="service-info">' +
          '<p class="service-short">' + esc(s.short[lang]) + "</p>" +
          '<div class="service-full-wrap"><div>' +
          '<p class="service-full">' + esc(s.full[lang]) + "</p>" +
          "</div></div>" +
          '<div class="service-actions">' +
          '<button class="btn btn-primary" data-open-form data-service="' + esc(s.title.en) + '">' + esc(window.t("services.interested")) + "</button>" +
          '<button class="btn-link read-more-btn" data-action="toggle" aria-expanded="' + (expanded ? "true" : "false") + '">' +
          '<span class="rm-label">' + esc(window.t(expanded ? "services.readLess" : "services.readMore")) + '</span> <span class="arr">›</span>' +
          "</button>" +
          "</div></div></article>"
        );
      })
      .join("");
    observeReveals(grid);
  }

  if (grid) {
    grid.addEventListener("click", function (e) {
      var toggleBtn = e.target.closest('[data-action="toggle"]');
      if (!toggleBtn) return;
      var row = toggleBtn.closest(".service-row");
      var expanded = row.classList.toggle("expanded");
      toggleBtn.setAttribute("aria-expanded", expanded ? "true" : "false");
      toggleBtn.querySelector(".rm-label").textContent = window.t(expanded ? "services.readLess" : "services.readMore");
    });
  }

  /* ---------- Анимированные счётчики (About) ---------- */
  function animateCounter(el) {
    var target = parseInt(el.getAttribute("data-count"), 10);
    var suffix = el.getAttribute("data-suffix") || "";
    var start = null;
    var dur = 1400;
    function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  if ("IntersectionObserver" in window) {
    var counterObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    document.querySelectorAll("[data-count]").forEach(function (el) {
      counterObserver.observe(el);
    });
  }

  /* ---------- Лента новостей (Insights) ---------- */
  var track = document.getElementById("newsTrack");

  function renderNewsCards(items) {
    if (!track) return;
    if (!items.length) {
      track.innerHTML = '<div class="news-status">' + esc(window.t("insights.empty")) + "</div>";
      return;
    }
    track.innerHTML = items
      .slice(0, 10)
      .map(function (n, i) {
        var img = n.image
          ? '<img class="news-img" src="' + esc(n.image) + '" alt="" loading="lazy" />'
          : "";
        return (
          '<article class="news-card reveal" style="--reveal-delay:' + Math.min(i * 0.08, 0.4) + 's">' +
          img +
          '<span class="news-date">' + esc(window.NewsAPI.formatDate(n.date)) + "</span>" +
          "<h3>" + esc(window.NewsAPI.loc(n, "title")) + "</h3>" +
          "<p>" + esc(window.NewsAPI.loc(n, "summary")) + "</p>" +
          '<a class="arrow-link" href="news.html#' + encodeURIComponent(n.id) + '">' + esc(window.t("insights.readMore")) + ' <span class="arr">›</span></a>' +
          "</article>"
        );
      })
      .join("");
    observeReveals(track);
    updateCarouselButtons();
  }

  function loadNews() {
    window.NewsAPI.fetchNews()
      .then(renderNewsCards)
      .catch(function () {
        if (track) track.innerHTML = '<div class="news-status">' + esc(window.t("insights.loadError")) + "</div>";
      });
  }

  var prevBtn = document.getElementById("newsPrev");
  var nextBtn = document.getElementById("newsNext");

  function scrollStep() {
    var card = track && track.querySelector(".news-card");
    return card ? card.offsetWidth + 22 : 340;
  }
  function updateCarouselButtons() {
    if (!track || !prevBtn || !nextBtn) return;
    prevBtn.disabled = track.scrollLeft <= 4;
    nextBtn.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
  }
  if (prevBtn && nextBtn && track) {
    prevBtn.addEventListener("click", function () { pauseAutoplay(); track.scrollBy({ left: -scrollStep(), behavior: "smooth" }); });
    nextBtn.addEventListener("click", function () { pauseAutoplay(); track.scrollBy({ left: scrollStep(), behavior: "smooth" }); });
    track.addEventListener("scroll", updateCarouselButtons, { passive: true });
    window.addEventListener("resize", updateCarouselButtons);
  }

  /* Автопрокрутка ленты: листает раз в 5 секунд, останавливается
     при наведении и после ручного взаимодействия */
  var autoplayTimer = null;
  var autoplayPausedUntil = 0;
  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function pauseAutoplay() {
    autoplayPausedUntil = Date.now() + 15000;
  }

  function startAutoplay() {
    if (reducedMotion || !track || autoplayTimer) return;
    autoplayTimer = setInterval(function () {
      if (Date.now() < autoplayPausedUntil) return;
      if (track.matches(":hover")) return;
      var atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
      if (atEnd) track.scrollTo({ left: 0, behavior: "smooth" });
      else track.scrollBy({ left: scrollStep(), behavior: "smooth" });
    }, 5000);
  }
  if (track) {
    track.addEventListener("pointerdown", pauseAutoplay, { passive: true });
    startAutoplay();
  }

  /* ---------- Контактные формы (модальная для сервисов + встроенная в hero) ---------- */

  // Один загрузчик reCAPTCHA на несколько виджетов (модал + hero)
  var recaptchaReady = false;
  var recaptchaQueue = [];
  var recaptchaScriptAdded = false;

  function whenRecaptchaReady(cb) {
    if (!cfg.RECAPTCHA_SITE_KEY) return;
    if (recaptchaReady) { cb(); return; }
    recaptchaQueue.push(cb);
    if (recaptchaScriptAdded) return;
    recaptchaScriptAdded = true;
    window.__onRecaptchaLoad = function () {
      recaptchaReady = true;
      recaptchaQueue.forEach(function (fn) { fn(); });
      recaptchaQueue = [];
    };
    var s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js?onload=__onRecaptchaLoad&render=explicit&hl=" + (window.currentLang || "en");
    s.async = true;
    document.head.appendChild(s);
  }

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function setFieldInvalid(input, invalid) {
    var field = input.closest(".form-field");
    field.classList.toggle("invalid", invalid);
    input.setAttribute("aria-invalid", invalid ? "true" : "false");
    var err = field.querySelector(".field-error");
    if (err) {
      if (!err.id) err.id = (input.id || input.name) + "-err";
      if (invalid) input.setAttribute("aria-describedby", err.id);
      else input.removeAttribute("aria-describedby");
    }
  }

  // Проверка одного поля. Телефон — мягко: 7–15 цифр в любом формате
  // (+, пробелы, скобки, дефисы допустимы), чтобы не отсекать валидные
  // международные номера.
  function fieldIsBad(input) {
    var v = input.value.trim();
    var nm = input.getAttribute("name");
    if (nm === "email") return !EMAIL_RE.test(v);
    if (nm === "phone") {
      var digits = v.replace(/\D/g, "");
      return digits.length < 7 || digits.length > 15;
    }
    return !v; // name и прочие обязательные — просто непустые
  }

  function validateField(input) {
    var bad = fieldIsBad(input);
    setFieldInvalid(input, bad);
    return !bad;
  }

  var REQUIRED_FIELDS = ["name", "email", "phone"];

  function validateForm(formEl) {
    var ok = true;
    REQUIRED_FIELDS.forEach(function (nm) {
      var inp = formEl.querySelector('[name="' + nm + '"]');
      if (inp && !validateField(inp)) ok = false;
    });
    return ok;
  }

  // Универсальная обвязка формы заявки.
  // opts: { form, statusEl, submitBtn, captchaContainerId, captchaNoteEl, getService, onSuccess }
  function setupContactForm(opts) {
    var widgetId = null;
    var captchaRequested = false;

    function ensureCaptcha() {
      if (!cfg.RECAPTCHA_SITE_KEY) {
        if (opts.captchaNoteEl && !cfg.APPS_SCRIPT_URL) opts.captchaNoteEl.hidden = false;
        return;
      }
      if (captchaRequested) return;
      captchaRequested = true;
      whenRecaptchaReady(function () {
        widgetId = grecaptcha.render(opts.captchaContainerId, { sitekey: cfg.RECAPTCHA_SITE_KEY });
      });
    }

    // Валидация на лету: проверяем поле при потере фокуса, ошибку убираем по мере ввода
    REQUIRED_FIELDS.forEach(function (nm) {
      var inp = opts.form.querySelector('[name="' + nm + '"]');
      if (!inp) return;
      inp.addEventListener("blur", function () { validateField(inp); });
      inp.addEventListener("input", function () {
        if (inp.closest(".form-field").classList.contains("invalid")) validateField(inp);
      });
    });

    // Счётчик символов в сообщении
    var msg = opts.form.querySelector('[name="message"]');
    var counter = opts.form.querySelector(".char-counter");
    if (msg && counter) {
      var max = parseInt(msg.getAttribute("maxlength"), 10) || 5000;
      var ccNow = counter.querySelector(".cc-now");
      var updateCounter = function () {
        if (ccNow) ccNow.textContent = msg.value.length;
        counter.classList.toggle("limit", msg.value.length >= max);
      };
      msg.addEventListener("input", updateCounter);
      updateCounter();
    }

    function showSuccess() {
      if (opts.stageEl && opts.successEl) {
        opts.stageEl.hidden = true;
        opts.successEl.hidden = false;
      }
    }

    // Сброс формы к исходному виду (для повторного открытия модалки)
    function resetForm() {
      opts.form.reset();
      opts.form.querySelectorAll(".form-field.invalid").forEach(function (f) {
        f.classList.remove("invalid");
      });
      if (msg && counter) msg.dispatchEvent(new Event("input"));
      opts.statusEl.className = "form-status";
      opts.statusEl.textContent = "";
      if (opts.stageEl && opts.successEl) {
        opts.stageEl.hidden = false;
        opts.successEl.hidden = true;
      }
    }

    opts.form.addEventListener("submit", function (e) {
      e.preventDefault();
      var statusEl = opts.statusEl;
      var submitBtn = opts.submitBtn;
      if (!validateForm(opts.form)) return;

      statusEl.className = "form-status";
      statusEl.textContent = "";

      var captchaToken = "";
      if (widgetId !== null && window.grecaptcha) {
        captchaToken = grecaptcha.getResponse(widgetId);
        if (!captchaToken) {
          statusEl.className = "form-status error";
          statusEl.textContent = window.t("form.captchaRequired");
          return;
        }
      }

      var payload = {
        action: "lead",
        name: opts.form.querySelector('[name="name"]').value.trim(),
        email: opts.form.querySelector('[name="email"]').value.trim(),
        phone: opts.form.querySelector('[name="phone"]').value.trim(),
        message: (opts.form.querySelector('[name="message"]').value || "").trim(),
        service: opts.getService ? opts.getService() : "",
        lang: window.currentLang || "en",
        website: opts.form.querySelector('[name="website"]').value, // honeypot
        captcha: captchaToken,
      };

      if (!cfg.APPS_SCRIPT_URL) {
        statusEl.className = "form-status error";
        statusEl.textContent = window.t("form.demoNote");
        return;
      }

      submitBtn.disabled = true;
      submitBtn.firstElementChild.textContent = window.t("form.sending");

      // text/plain — чтобы запрос к Apps Script прошёл без CORS preflight
      fetch(cfg.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(payload),
      })
        .then(function (r) { return r.json(); })
        .then(function (data) {
          if (!data.ok) throw new Error(data.error || "server error");
          opts.form.reset();
          if (msg && counter) msg.dispatchEvent(new Event("input"));
          if (widgetId !== null && window.grecaptcha) grecaptcha.reset(widgetId);
          showSuccess();
          if (opts.onSuccess) opts.onSuccess();
        })
        .catch(function (err) {
          statusEl.className = "form-status error";
          statusEl.textContent = window.t(
            err && err.message === "rate limited" ? "form.tooMany" : "form.error"
          );
        })
        .finally(function () {
          submitBtn.disabled = false;
          submitBtn.firstElementChild.textContent = window.t("form.submit");
        });
    });

    return { ensureCaptcha: ensureCaptcha, reset: resetForm };
  }

  /* Модальная форма — для кнопок "I am interested" и "Send your CV" */
  var modal = document.getElementById("contactModal");
  var serviceTag = document.getElementById("formServiceTag");
  var currentService = "";
  var lastTrigger = null;

  var modalForm = setupContactForm({
    form: document.getElementById("contactForm"),
    statusEl: document.getElementById("formStatus"),
    submitBtn: document.getElementById("contactSubmitBtn"),
    captchaContainerId: "recaptchaContainer",
    captchaNoteEl: document.getElementById("captchaNote"),
    stageEl: document.getElementById("modalStage"),
    successEl: document.getElementById("modalSuccess"),
    getService: function () { return currentService; },
    onSuccess: function () { setTimeout(closeForm, 3500); },
  });

  function openForm(service) {
    currentService = service || "";
    lastTrigger = document.activeElement; // куда вернуть фокус после закрытия
    modalForm.reset();
    if (serviceTag) {
      serviceTag.hidden = !currentService;
      serviceTag.textContent = currentService ? window.t("form.service") + ": " + currentService : "";
    }
    modalForm.ensureCaptcha();
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
    setTimeout(function () { var f = document.getElementById("cfName"); if (f) f.focus(); }, 60);
  }

  function closeForm() {
    if (!modal.classList.contains("open")) return;
    modal.classList.remove("open");
    document.body.style.overflow = "";
    if (lastTrigger && typeof lastTrigger.focus === "function") lastTrigger.focus();
    lastTrigger = null;
  }

  document.addEventListener("click", function (e) {
    var opener = e.target.closest("[data-open-form]");
    if (opener) {
      e.preventDefault();
      openForm(opener.getAttribute("data-service"));
    }
  });
  document.getElementById("contactModalClose").addEventListener("click", closeForm);

  // Закрытие по клику на фон — только если нажатие НАЧАЛОСЬ на фоне.
  // Иначе при выделении текста в поле и отпускании мыши вне формы она закрывалась.
  var modalDownOnBackdrop = false;
  modal.addEventListener("mousedown", function (e) { modalDownOnBackdrop = (e.target === modal); });
  modal.addEventListener("mouseup", function (e) {
    if (modalDownOnBackdrop && e.target === modal) closeForm();
    modalDownOnBackdrop = false;
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { closeForm(); closeVideo(); }
  });

  /* Встроенная форма в hero — видна сразу, поэтому капчу грузим на загрузке */
  var heroFormEl = document.getElementById("heroForm");
  if (heroFormEl) {
    var heroForm = setupContactForm({
      form: heroFormEl,
      statusEl: document.getElementById("heroStatus"),
      submitBtn: document.getElementById("heroSubmitBtn"),
      captchaContainerId: "heroRecaptcha",
      captchaNoteEl: document.getElementById("heroCaptchaNote"),
      stageEl: document.getElementById("heroStage"),
      successEl: document.getElementById("heroSuccess"),
      getService: function () { return ""; },
      onSuccess: function () {},
    });
    heroForm.ensureCaptcha();
  }

  /* ---------- Видео "Watch overview" ---------- */
  var videoModal = document.getElementById("videoModal");
  var videoFrame = document.getElementById("videoFrame");

  function closeVideo() {
    if (!videoModal) return;
    videoModal.classList.remove("open");
    videoFrame.src = "about:blank";
    document.body.style.overflow = "";
  }

  var watchBtn = document.getElementById("watchOverviewBtn");
  if (watchBtn) {
    watchBtn.addEventListener("click", function () {
      if (cfg.OVERVIEW_VIDEO_URL) {
        videoFrame.src = cfg.OVERVIEW_VIDEO_URL;
        videoModal.classList.add("open");
        document.body.style.overflow = "hidden";
      } else {
        // Видео пока нет — прокручиваем к сервисам
        scrollToSection(document.getElementById("services"));
      }
    });
  }
  if (videoModal) {
    document.getElementById("videoModalClose").addEventListener("click", closeVideo);
    var videoDownOnBackdrop = false;
    videoModal.addEventListener("mousedown", function (e) { videoDownOnBackdrop = (e.target === videoModal); });
    videoModal.addEventListener("mouseup", function (e) {
      if (videoDownOnBackdrop && e.target === videoModal) closeVideo();
      videoDownOnBackdrop = false;
    });
  }

  /* ---------- Перерисовка при смене языка ---------- */
  document.addEventListener("langchange", function () {
    renderServices();
    window.NewsAPI.fetchNews().then(renderNewsCards).catch(function () {});
  });

  // Первичный рендер (langchange уже мог отработать до подключения этого скрипта)
  renderServices();
  loadNews();
  highlightNav();
  onScrollHeader();
  observeReveals(document);
})();
