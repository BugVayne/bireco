// Админка новостей: вход по паролю, список, добавление, редактирование, удаление.
// Все операции идут через Google Apps Script (см. apps-script/Code.gs и README.md).

(function () {
  "use strict";

  var cfg = window.SITE_CONFIG || {};
  var SESSION_KEY = "admin_session";

  var loginCard = document.getElementById("loginCard");
  var panel = document.getElementById("panel");
  var loginBtn = document.getElementById("loginBtn");
  var loginStatus = document.getElementById("loginStatus");
  var logoutBtn = document.getElementById("logoutBtn");
  var listEl = document.getElementById("newsAdminList");
  var form = document.getElementById("newsForm");
  var saveStatus = document.getElementById("saveStatus");
  var saveBtn = document.getElementById("saveBtn");
  var cancelEditBtn = document.getElementById("cancelEditBtn");
  var editorTitle = document.getElementById("editorTitle");

  var newsCache = [];

  var IMAGE_MAX_BYTES = 5 * 1024 * 1024;
  var IMAGE_ALLOWED_EXT = ["jpg", "jpeg", "png", "webp", "gif"];
  var IMAGE_MAX_DIM = 1600;      // изображения крупнее пересчитываем под эту сторону
  var IMAGE_JPEG_QUALITY = 0.82;
  var imageFileInput = document.getElementById("nfImageFile");
  var imageUrlInput = document.getElementById("nfImage");
  var imagePreview = document.getElementById("nfImagePreview");
  var pendingImageFile = null; // файл (после сжатия), который реально уйдёт на сервер

  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function readFileAsBase64(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        var res = String(reader.result);
        var comma = res.indexOf(",");
        resolve(comma >= 0 ? res.slice(comma + 1) : res);
      };
      reader.onerror = function () { reject(reader.error); };
      reader.readAsDataURL(file);
    });
  }

  // Пересчитывает картинку под maxDim по большей стороне и пережимает в JPEG
  // (кроме PNG — оставляем PNG ради прозрачности, и GIF — чтобы не сломать анимацию).
  // Если сжимать не нужно/нечем — возвращает исходный файл как есть.
  function resizeImage(file, maxDim, quality) {
    return new Promise(function (resolve) {
      if (file.type === "image/gif" || typeof HTMLCanvasElement === "undefined") {
        resolve(file);
        return;
      }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        var w = img.naturalWidth, h = img.naturalHeight;
        if (!w || !h || (w <= maxDim && h <= maxDim)) {
          resolve(file);
          return;
        }
        var scale = Math.min(maxDim / w, maxDim / h);
        var canvas = document.createElement("canvas");
        canvas.width = Math.round(w * scale);
        canvas.height = Math.round(h * scale);
        var ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        var outType = file.type === "image/png" ? "image/png" : "image/jpeg";
        canvas.toBlob(function (blob) {
          if (!blob) { resolve(file); return; }
          var newName = file.name.replace(/\.[^.]+$/, "") + (outType === "image/png" ? ".png" : ".jpg");
          resolve(new File([blob], newName, { type: outType }));
        }, outType, quality);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  imageFileInput.addEventListener("change", function () {
    var file = imageFileInput.files && imageFileInput.files[0];
    pendingImageFile = null;
    imagePreview.classList.add("hidden");
    if (!file) return;
    var ext = (file.name.split(".").pop() || "").toLowerCase();
    if (IMAGE_ALLOWED_EXT.indexOf(ext) === -1) {
      alert("Неподдерживаемый формат картинки: ." + ext);
      imageFileInput.value = "";
      return;
    }
    resizeImage(file, IMAGE_MAX_DIM, IMAGE_JPEG_QUALITY).then(function (resized) {
      if (resized.size > IMAGE_MAX_BYTES) {
        alert("Файл слишком большой даже после сжатия (максимум 5 МБ). Попробуйте другое изображение.");
        imageFileInput.value = "";
        return;
      }
      pendingImageFile = resized;
      imageUrlInput.value = "";
      imagePreview.src = URL.createObjectURL(resized);
      imagePreview.classList.remove("hidden");
    });
  });

  function getSession() { return sessionStorage.getItem(SESSION_KEY) || ""; }

  function apiRaw(payload) {
    if (!cfg.APPS_SCRIPT_URL) {
      return Promise.reject(new Error("В js/config.js не задан APPS_SCRIPT_URL — см. README.md"));
    }
    payload.action = "admin";
    return fetch(cfg.APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload),
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        if (!data.ok) throw new Error(data.error || "Ошибка сервера");
        return data;
      });
  }

  // Запрос с сессией; при истёкшей сессии возвращает на экран входа
  function api(payload) {
    payload.session = getSession();
    return apiRaw(payload).catch(function (err) {
      if (err.message === "session expired" || err.message === "unauthorized") {
        sessionStorage.removeItem(SESSION_KEY);
        panel.classList.add("hidden");
        logoutBtn.classList.add("hidden");
        loginCard.classList.remove("hidden");
        loginStatus.className = "admin-status error";
        loginStatus.textContent = "Сессия истекла — войдите снова.";
      }
      throw err;
    });
  }

  /* ---------- Вход ---------- */
  function showPanel() {
    loginCard.classList.add("hidden");
    panel.classList.remove("hidden");
    logoutBtn.classList.remove("hidden");
    loadList();
  }

  loginBtn.addEventListener("click", function () {
    var token = document.getElementById("adminToken").value.trim();
    if (!token) return;
    loginStatus.className = "admin-status";
    loginStatus.textContent = "Проверка…";
    loginBtn.disabled = true;
    apiRaw({ op: "login", token: token })
      .then(function (data) {
        sessionStorage.setItem(SESSION_KEY, data.session);
        document.getElementById("adminToken").value = "";
        loginStatus.textContent = "";
        showPanel();
      })
      .catch(function (err) {
        loginStatus.className = "admin-status error";
        if (err.message === "unauthorized") loginStatus.textContent = "Неверный пароль.";
        else if (err.message === "too many attempts") loginStatus.textContent = "Слишком много попыток входа. Подождите и попробуйте снова.";
        else loginStatus.textContent = err.message;
      })
      .finally(function () { loginBtn.disabled = false; });
  });

  document.getElementById("adminToken").addEventListener("keydown", function (e) {
    if (e.key === "Enter") loginBtn.click();
  });

  logoutBtn.addEventListener("click", function () {
    sessionStorage.removeItem(SESSION_KEY);
    location.reload();
  });

  /* ---------- Список новостей ---------- */
  function loadList() {
    listEl.innerHTML = '<div class="admin-status">Загрузка…</div>';
    api({ op: "list" })
      .then(function (data) {
        newsCache = data.items || [];
        renderList();
      })
      .catch(function (err) {
        listEl.innerHTML = '<div class="admin-status error">' + esc(err.message) + "</div>";
      });
  }

  function renderList() {
    if (!newsCache.length) {
      listEl.innerHTML = '<div class="admin-status">Новостей пока нет. Добавьте первую через форму выше.</div>';
      return;
    }
    var sorted = newsCache.slice().sort(function (a, b) {
      return String(b.date).localeCompare(String(a.date));
    });
    listEl.innerHTML = sorted
      .map(function (n) {
        return (
          '<div class="admin-news-item">' +
          "<div><h3>" + esc(n.title_ru || n.title_en) + "</h3>" +
          '<div class="meta">' + esc(n.date) + " · id: " + esc(n.id) + "</div></div>" +
          '<div class="admin-news-actions">' +
          '<button class="btn btn-outline btn-sm" data-edit="' + esc(n.id) + '">Изменить</button>' +
          '<button class="btn btn-danger btn-sm" data-delete="' + esc(n.id) + '">Удалить</button>' +
          "</div></div>"
        );
      })
      .join("");
  }

  listEl.addEventListener("click", function (e) {
    var editBtn = e.target.closest("[data-edit]");
    var delBtn = e.target.closest("[data-delete]");

    if (editBtn) {
      var item = newsCache.find(function (n) { return String(n.id) === editBtn.getAttribute("data-edit"); });
      if (!item) return;
      document.getElementById("nfId").value = item.id;
      document.getElementById("nfDate").value = item.date;
      document.getElementById("nfTitleEn").value = item.title_en || "";
      document.getElementById("nfTitleRu").value = item.title_ru || "";
      document.getElementById("nfSummaryEn").value = item.summary_en || "";
      document.getElementById("nfSummaryRu").value = item.summary_ru || "";
      document.getElementById("nfBodyEn").value = item.body_en || "";
      document.getElementById("nfBodyRu").value = item.body_ru || "";
      document.getElementById("nfImage").value = item.image || "";
      imageFileInput.value = "";
      pendingImageFile = null;
      if (item.image) {
        imagePreview.src = item.image;
        imagePreview.classList.remove("hidden");
      } else {
        imagePreview.classList.add("hidden");
      }
      editorTitle.textContent = "Редактировать новость";
      cancelEditBtn.classList.remove("hidden");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    if (delBtn) {
      var id = delBtn.getAttribute("data-delete");
      if (!confirm("Удалить эту новость? Действие необратимо.")) return;
      delBtn.disabled = true;
      api({ op: "delete", id: id })
        .then(loadList)
        .catch(function (err) { alert("Ошибка: " + err.message); delBtn.disabled = false; });
    }
  });

  /* ---------- Сохранение ---------- */
  function resetEditor() {
    form.reset();
    document.getElementById("nfId").value = "";
    imagePreview.classList.add("hidden");
    pendingImageFile = null;
    editorTitle.textContent = "Добавить новость";
    cancelEditBtn.classList.add("hidden");
  }

  cancelEditBtn.addEventListener("click", resetEditor);

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var id = document.getElementById("nfId").value;
    var item = {
      id: id,
      date: document.getElementById("nfDate").value,
      title_en: document.getElementById("nfTitleEn").value.trim(),
      title_ru: document.getElementById("nfTitleRu").value.trim(),
      summary_en: document.getElementById("nfSummaryEn").value.trim(),
      summary_ru: document.getElementById("nfSummaryRu").value.trim(),
      body_en: document.getElementById("nfBodyEn").value.trim(),
      body_ru: document.getElementById("nfBodyRu").value.trim(),
      image: document.getElementById("nfImage").value.trim(),
    };

    var imageFile = pendingImageFile;

    saveStatus.className = "admin-status";
    saveStatus.textContent = "Сохранение…";
    saveBtn.disabled = true;

    (imageFile
      ? readFileAsBase64(imageFile).then(function (b64) {
          item.imageData = b64;
          item.imageType = imageFile.type;
          item.imageName = imageFile.name;
        })
      : Promise.resolve()
    )
      .then(function () { return api({ op: id ? "update" : "add", item: item }); })
      .then(function () {
        saveStatus.className = "admin-status success";
        saveStatus.textContent = "Сохранено.";
        resetEditor();
        loadList();
        setTimeout(function () { saveStatus.textContent = ""; }, 3000);
      })
      .catch(function (err) {
        saveStatus.className = "admin-status error";
        saveStatus.textContent = "Ошибка: " + err.message;
      })
      .finally(function () { saveBtn.disabled = false; });
  });

  /* ---------- Автовход, если сессия ещё жива ---------- */
  if (getSession()) {
    api({ op: "list" })
      .then(function (data) {
        newsCache = data.items || [];
        showPanel();
        renderList();
      })
      .catch(function () {});
  }
})();
