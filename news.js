const STATE = {
  isAdmin: false,
  news: [],
  currentFilter: "all",
  currentPage: 1,
  totalPages: 1,
  currentMediaBase64: null,
  currentMediaType: null,
};

const NEWS_PER_PAGE = 5;

const CATEGORY_MAP = {
  announcement: { label: "Объявление", cls: "category-label-announcement" },
  achievement: { label: "Достижение", cls: "category-label-achievement" },
  event: { label: "Событие", cls: "category-label-event" },
};

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    credentials: "same-origin",
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || "request_failed");
  }
  return data;
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
}

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 400);
  }, 2800);
}

async function loadAuthState() {
  const auth = await api("/api/auth/me");
  STATE.isAdmin = !!auth.authenticated;
  syncAdminControls();
}

async function loadNewsFromApi() {
  const query = new URLSearchParams({
    category: STATE.currentFilter,
    page: String(STATE.currentPage),
    limit: String(NEWS_PER_PAGE),
  });

  const payload = await api(`/api/news?${query.toString()}`);
  STATE.news = payload.items || [];
  STATE.totalPages = payload.pagination?.totalPages || 1;
  STATE.currentPage = payload.pagination?.currentPage || 1;
}

function renderPagination() {
  const pagination = document.getElementById("newsPagination");
  pagination.innerHTML = "";

  if (STATE.totalPages <= 1) {
    pagination.style.display = "none";
    return;
  }

  pagination.style.display = "flex";
  for (let page = 1; page <= STATE.totalPages; page++) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = `page-btn ${page === STATE.currentPage ? "active" : ""}`;
    btn.textContent = page;
    btn.addEventListener("click", async () => {
      STATE.currentPage = page;
      await refreshNews();
    });
    pagination.appendChild(btn);
  }
}

function renderNews() {
  const grid = document.getElementById("newsGrid");
  const empty = document.getElementById("newsEmpty");
  grid.innerHTML = "";

  if (STATE.news.length === 0) {
    empty.style.display = "block";
    renderPagination();
    return;
  }
  empty.style.display = "none";

  STATE.news.forEach((item, i) => {
    const card = document.createElement("div");
    card.className = "news-card";
    card.style.animationDelay = `${i * 0.07}s`;
    card.dataset.id = item.id;

    const cat = CATEGORY_MAP[item.category] || CATEGORY_MAP.announcement;
    const mediaHTML = item.media
      ? item.mediaType === "video"
        ? `<div class="card-media"><video src="${item.media}" muted preload="metadata"></video></div>`
        : `<div class="card-media"><img src="${item.media}" alt="${item.title}" loading="lazy"></div>`
      : `<div class="card-media"><span class="card-media-placeholder">📰</span></div>`;

    const editBtn = STATE.isAdmin
      ? `<button class="card-edit-btn" data-edit="${item.id}" title="Редактировать">✏️</button>`
      : "";

    card.innerHTML = `
      ${editBtn}
      ${mediaHTML}
      <div class="card-body">
        <div class="card-meta">
          <span class="card-category ${cat.cls}">${cat.label}</span>
          <span class="card-date">${formatDate(item.date)}</span>
        </div>
        <h3 class="card-title">${item.title}</h3>
        <p class="card-excerpt">${item.text}</p>
        <span class="card-read-more">Читать далее →</span>
      </div>
    `;

    card.addEventListener("click", (e) => {
      if (e.target.closest(".card-edit-btn")) return;
      openNewsModal(item);
    });

    if (STATE.isAdmin) {
      card.querySelector(".card-edit-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        openAdminModal(item.id);
      });
    }

    grid.appendChild(card);
  });

  renderPagination();
}

function openNewsModal(item) {
  const overlay = document.getElementById("newsModal");
  const cat = CATEGORY_MAP[item.category] || CATEGORY_MAP.announcement;

  document.getElementById("modalCategory").textContent = cat.label;
  document.getElementById("modalCategory").className = `modal-category ${cat.cls}`;
  document.getElementById("modalDate").textContent = formatDate(item.date);
  document.getElementById("modalTitle").textContent = item.title;
  document.getElementById("modalText").textContent = item.text;

  const mediaEl = document.getElementById("modalMedia");
  mediaEl.innerHTML = "";
  if (item.media) {
    mediaEl.innerHTML =
      item.mediaType === "video"
        ? `<video src="${item.media}" controls></video>`
        : `<img src="${item.media}" alt="${item.title}">`;
  }

  overlay.style.display = "flex";
  requestAnimationFrame(() => overlay.classList.add("open"));
  document.body.style.overflow = "hidden";
}

function closeNewsModal() {
  const overlay = document.getElementById("newsModal");
  overlay.classList.remove("open");
  setTimeout(() => {
    overlay.style.display = "none";
  }, 300);
  document.body.style.overflow = "";
}

function assertAdminAccess() {
  if (!STATE.isAdmin) {
    showToast("Доступ разрешен только редактору.");
    return false;
  }
  return true;
}

function openAdminModal(editId = null) {
  if (!assertAdminAccess()) return;

  const overlay = document.getElementById("adminModal");
  const formTitle = document.getElementById("adminFormTitle");
  const deleteBtn = document.getElementById("deleteBtn");
  const editingId = document.getElementById("editingId");

  document.getElementById("inputTitle").value = "";
  document.getElementById("inputCategory").value = "announcement";
  document.getElementById("inputText").value = "";
  clearMediaPreview();

  if (editId) {
    const item = STATE.news.find((n) => n.id === editId);
    if (!item) return;

    formTitle.textContent = "Редактировать новость";
    editingId.value = editId;
    document.getElementById("inputTitle").value = item.title;
    document.getElementById("inputCategory").value = item.category;
    document.getElementById("inputText").value = item.text;
    deleteBtn.style.display = "inline-flex";

    if (item.media) {
      STATE.currentMediaBase64 = item.media;
      STATE.currentMediaType = item.mediaType;
      showMediaPreview(item.media, item.mediaType);
    }
  } else {
    formTitle.textContent = "Добавить новость";
    editingId.value = "";
    deleteBtn.style.display = "none";
  }

  overlay.style.display = "flex";
  requestAnimationFrame(() => overlay.classList.add("open"));
  document.body.style.overflow = "hidden";
}

function closeAdminModal() {
  const overlay = document.getElementById("adminModal");
  overlay.classList.remove("open");
  setTimeout(() => {
    overlay.style.display = "none";
  }, 300);
  document.body.style.overflow = "";
  clearMediaPreview();
}

function handleFileSelect(file) {
  if (!file || !assertAdminAccess()) return;

  const maxMB = 50;
  if (file.size > maxMB * 1024 * 1024) {
    showToast(`Файл слишком большой. Максимум ${maxMB} МБ.`);
    return;
  }

  const isVideo = file.type.startsWith("video/");
  const isImage = file.type.startsWith("image/");
  if (!isVideo && !isImage) {
    showToast("Поддерживаются только изображения и видео.");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    STATE.currentMediaBase64 = e.target.result;
    STATE.currentMediaType = isVideo ? "video" : "image";
    showMediaPreview(e.target.result, STATE.currentMediaType);
  };
  reader.readAsDataURL(file);
}

function showMediaPreview(src, type) {
  const placeholder = document.getElementById("uploadPlaceholder");
  const preview = document.getElementById("mediaPreview");
  placeholder.style.display = "none";
  preview.style.display = "block";
  preview.innerHTML =
    type === "video"
      ? `<video src="${src}" controls></video><button class="media-preview-remove" id="removeMedia">✕</button>`
      : `<img src="${src}" alt="preview"><button class="media-preview-remove" id="removeMedia">✕</button>`;

  document.getElementById("removeMedia").addEventListener("click", clearMediaPreview);
}

function clearMediaPreview() {
  STATE.currentMediaBase64 = null;
  STATE.currentMediaType = null;

  const placeholder = document.getElementById("uploadPlaceholder");
  const preview = document.getElementById("mediaPreview");
  if (!placeholder || !preview) return;

  placeholder.style.display = "block";
  preview.style.display = "none";
  preview.innerHTML = "";

  const fileInput = document.getElementById("inputMedia");
  if (fileInput) fileInput.value = "";
}

function saveNewsItem() {
  if (!assertAdminAccess()) return;

  const title = document.getElementById("inputTitle").value.trim();
  const category = document.getElementById("inputCategory").value;
  const text = document.getElementById("inputText").value.trim();
  const editId = document.getElementById("editingId").value;

  if (!title) {
    showToast("Введите заголовок");
    return;
  }
  if (!text) {
    showToast("Введите текст новости");
    return;
  }

  const btn = document.getElementById("saveBtn");
  btn.classList.add("loading");

  const existing = editId ? STATE.news.find((n) => n.id === editId) : null;
  const payload = {
    title,
    category,
    text,
    media: STATE.currentMediaBase64 || existing?.media || null,
    mediaType: STATE.currentMediaType || existing?.mediaType || null,
  };

  const request = editId
    ? api(`/api/news/${editId}`, { method: "PUT", body: JSON.stringify(payload) })
    : api("/api/news", { method: "POST", body: JSON.stringify(payload) });

  request
    .then(async () => {
      showToast(editId ? "Новость обновлена" : "Новость добавлена");
      STATE.currentPage = 1;
      await refreshNews();
      closeAdminModal();
    })
    .catch((err) => {
      if (err.message === "forbidden") {
        showToast("Недостаточно прав редактора");
        STATE.isAdmin = false;
        syncAdminControls();
        return;
      }
      showToast("Ошибка сохранения новости");
    })
    .finally(() => {
      btn.classList.remove("loading");
    });
}

function deleteNewsItem() {
  if (!assertAdminAccess()) return;

  const editId = document.getElementById("editingId").value;
  if (!editId) return;
  if (!confirm("Удалить эту новость?")) return;

  api(`/api/news/${editId}`, { method: "DELETE" })
    .then(async () => {
      showToast("Новость удалена");
      await refreshNews();
      closeAdminModal();
    })
    .catch((err) => {
      if (err.message === "forbidden") {
        showToast("Недостаточно прав редактора");
        STATE.isAdmin = false;
        syncAdminControls();
        return;
      }
      showToast("Ошибка удаления новости");
    });
}

function syncAdminControls() {
  const fab = document.getElementById("adminFab");
  const loginBtn = document.getElementById("editorAccessBtn");
  const logoutBtn = document.getElementById("editorLogoutBtn");

  fab.style.display = STATE.isAdmin ? "block" : "none";
  loginBtn.style.display = STATE.isAdmin ? "none" : "inline-flex";
  logoutBtn.style.display = STATE.isAdmin ? "inline-flex" : "none";
}

function initAdminAccess() {
  const loginBtn = document.getElementById("editorAccessBtn");
  const logoutBtn = document.getElementById("editorLogoutBtn");

  loginBtn.addEventListener("click", async () => {
    const username = window.prompt("Логин редактора:");
    if (!username) return;
    const password = window.prompt("Пароль редактора:");
    if (!password) return;

    try {
      await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      STATE.isAdmin = true;
      syncAdminControls();
      await refreshNews();
      showToast("Режим редакции включен");
    } catch {
      showToast("Неверный логин или пароль");
    }
  });

  logoutBtn.addEventListener("click", async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    STATE.isAdmin = false;
    syncAdminControls();
    await refreshNews();
    closeAdminModal();
    showToast("Вы вышли из режима редакции");
  });
}

function initFilters() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      STATE.currentFilter = btn.dataset.filter;
      STATE.currentPage = 1;
      refreshNews();
    });
  });
}

function initDragDrop() {
  const area = document.getElementById("mediaUploadArea");
  if (!area) return;

  area.addEventListener("click", () => {
    if (!assertAdminAccess()) return;
    document.getElementById("inputMedia").click();
  });

  area.addEventListener("dragover", (e) => {
    if (!STATE.isAdmin) return;
    e.preventDefault();
    area.classList.add("drag-over");
  });

  area.addEventListener("dragleave", () => area.classList.remove("drag-over"));

  area.addEventListener("drop", (e) => {
    if (!STATE.isAdmin) return;
    e.preventDefault();
    area.classList.remove("drag-over");
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  });

  document.getElementById("inputMedia").addEventListener("change", (e) => {
    handleFileSelect(e.target.files[0]);
  });
}

function initModalClose() {
  document.getElementById("modalClose").addEventListener("click", closeNewsModal);
  document.getElementById("adminModalClose").addEventListener("click", closeAdminModal);
  document.getElementById("saveBtn").addEventListener("click", saveNewsItem);
  document.getElementById("deleteBtn").addEventListener("click", deleteNewsItem);
  document.getElementById("addNewsBtn").addEventListener("click", () => openAdminModal());

  document.getElementById("newsModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("newsModal")) closeNewsModal();
  });
  document.getElementById("adminModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("adminModal")) closeAdminModal();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeNewsModal();
      closeAdminModal();
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initAdminAccess();
  initFilters();
  initModalClose();
  initDragDrop();
  loadAuthState()
    .then(() => refreshNews())
    .catch(() => {
      STATE.isAdmin = false;
      syncAdminControls();
      showToast("Ошибка подключения к серверу");
    });
});

async function refreshNews() {
  try {
    await loadNewsFromApi();
    renderNews();
  } catch {
    STATE.news = [];
    STATE.totalPages = 1;
    renderNews();
    showToast("Не удалось загрузить новости");
  }
}