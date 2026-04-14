/**
 * news.js — Логика страницы новостей
 *
 * Скрытый доступ к админ-панели:
 *   → 5 быстрых кликов на логотип в футере (в течение 2 секунд)
 *
 * Данные хранятся в localStorage.
 * Медиафайлы конвертируются в base64 и тоже сохраняются.
 */

// ── СОСТОЯНИЕ ──────────────────────────────────────────────
const STATE = {
    isAdmin: false,
    news: [],
    currentFilter: 'all',
    currentMediaBase64: null,
    currentMediaType: null,   // 'image' | 'video'
};

const STORAGE_KEY = 'igu_news';

const CATEGORY_MAP = {
    announcement: { label: 'Объявление', cls: 'category-label-announcement' },
    achievement:  { label: 'Достижение', cls: 'category-label-achievement'  },
    event:        { label: 'Событие',    cls: 'category-label-event'         },
};

// ── ЗАГРУЗКА / СОХРАНЕНИЕ ───────────────────────────────────
function loadNews() {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        STATE.news = raw ? JSON.parse(raw) : getSampleNews();
    } catch {
        STATE.news = getSampleNews();
    }
}

function saveNews() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE.news));
}

// Пример новостей для первого запуска
function getSampleNews() {
    return [
        {
            id: uid(),
            title: 'Начало нового учебного года',
            category: 'announcement',
            text: 'Уважаемые студенты и преподаватели!\n\nРады сообщить, что новый учебный год начинается 1 сентября. Расписание занятий будет опубликовано на сайте. Ждём всех на торжественной линейке в 9:00 во внутреннем дворе колледжа.',
            media: null,
            mediaType: null,
            date: '2026-09-01',
        },
        {
            id: uid(),
            title: 'Наши студенты победили на олимпиаде',
            category: 'achievement',
            text: 'Студенты специальности «Программное обеспечение» заняли первое место на республиканской олимпиаде по информационным технологиям.\n\nПоздравляем победителей и их наставников! Это большая гордость для всего колледжа.',
            media: null,
            mediaType: null,
            date: '2026-08-15',
        },
        {
            id: uid(),
            title: 'День открытых дверей — 20 апреля',
            category: 'event',
            text: 'Приглашаем всех абитуриентов и их родителей на день открытых дверей.\n\nВы сможете познакомиться с преподавателями, посетить учебные лаборатории и задать любые вопросы о поступлении. Ждём вас 20 апреля с 10:00 до 14:00.',
            media: null,
            mediaType: null,
            date: '2026-04-10',
        },
    ];
}

// ── УТИЛИТЫ ─────────────────────────────────────────────────
function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function formatDate(dateStr) {
    const d = new Date(dateStr);
    if (isNaN(d)) return '';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function showToast(msg) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.textContent = msg;
    document.body.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 400);
    }, 2800);
}

// ── РЕНДЕР КАРТОЧЕК ─────────────────────────────────────────
function renderNews() {
    const grid  = document.getElementById('newsGrid');
    const empty = document.getElementById('newsEmpty');
    grid.innerHTML = '';

    const filtered = STATE.currentFilter === 'all'
        ? STATE.news
        : STATE.news.filter(n => n.category === STATE.currentFilter);

    if (filtered.length === 0) {
        empty.style.display = 'block';
        return;
    }
    empty.style.display = 'none';

    // Сортируем по дате (новые сначала)
    const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

    sorted.forEach((item, i) => {
        const card = document.createElement('div');
        card.className = 'news-card';
        card.style.animationDelay = `${i * 0.07}s`;
        card.dataset.id = item.id;

        const cat = CATEGORY_MAP[item.category] || CATEGORY_MAP.announcement;

        // Медиа превью
        let mediaHTML = '';
        if (item.media) {
            if (item.mediaType === 'video') {
                mediaHTML = `<div class="card-media"><video src="${item.media}" muted preload="metadata"></video></div>`;
            } else {
                mediaHTML = `<div class="card-media"><img src="${item.media}" alt="${item.title}" loading="lazy"></div>`;
            }
        } else {
            mediaHTML = `<div class="card-media"><span class="card-media-placeholder">📰</span></div>`;
        }

        // Кнопка редактирования (только для admin)
        const editBtn = STATE.isAdmin
            ? `<button class="card-edit-btn" data-edit="${item.id}" title="Редактировать">✏️</button>`
            : '';

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

        // Клик по карточке → открыть модальное окно просмотра
        card.addEventListener('click', (e) => {
            if (e.target.closest('.card-edit-btn')) return;
            openNewsModal(item);
        });

        // Клик по кнопке редактирования
        if (STATE.isAdmin) {
            card.querySelector('.card-edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                openAdminModal(item.id);
            });
        }

        grid.appendChild(card);
    });
}

// ── МОДАЛЬНОЕ ОКНО: ПРОСМОТР ─────────────────────────────────
function openNewsModal(item) {
    const overlay = document.getElementById('newsModal');
    const cat = CATEGORY_MAP[item.category] || CATEGORY_MAP.announcement;

    document.getElementById('modalCategory').textContent = cat.label;
    document.getElementById('modalCategory').className   = `modal-category ${cat.cls}`;
    document.getElementById('modalDate').textContent     = formatDate(item.date);
    document.getElementById('modalTitle').textContent    = item.title;
    document.getElementById('modalText').textContent     = item.text;

    const mediaEl = document.getElementById('modalMedia');
    mediaEl.innerHTML = '';
    if (item.media) {
        if (item.mediaType === 'video') {
            mediaEl.innerHTML = `<video src="${item.media}" controls></video>`;
        } else {
            mediaEl.innerHTML = `<img src="${item.media}" alt="${item.title}">`;
        }
    }

    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
}

function closeNewsModal() {
    const overlay = document.getElementById('newsModal');
    overlay.classList.remove('open');
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
    document.body.style.overflow = '';
}

// ── МОДАЛЬНОЕ ОКНО: ADMIN ФОРМА ──────────────────────────────
function openAdminModal(editId = null) {
    const overlay   = document.getElementById('adminModal');
    const formTitle = document.getElementById('adminFormTitle');
    const deleteBtn = document.getElementById('deleteBtn');
    const editingId = document.getElementById('editingId');

    // Сброс формы
    document.getElementById('inputTitle').value    = '';
    document.getElementById('inputCategory').value = 'announcement';
    document.getElementById('inputText').value     = '';
    clearMediaPreview();

    if (editId) {
        const item = STATE.news.find(n => n.id === editId);
        if (!item) return;

        formTitle.textContent              = 'Редактировать новость';
        editingId.value                    = editId;
        document.getElementById('inputTitle').value    = item.title;
        document.getElementById('inputCategory').value = item.category;
        document.getElementById('inputText').value     = item.text;
        deleteBtn.style.display            = 'inline-flex';

        if (item.media) {
            STATE.currentMediaBase64 = item.media;
            STATE.currentMediaType   = item.mediaType;
            showMediaPreview(item.media, item.mediaType);
        }
    } else {
        formTitle.textContent  = 'Добавить новость';
        editingId.value        = '';
        deleteBtn.style.display = 'none';
    }

    overlay.style.display = 'flex';
    requestAnimationFrame(() => overlay.classList.add('open'));
    document.body.style.overflow = 'hidden';
}

function closeAdminModal() {
    const overlay = document.getElementById('adminModal');
    overlay.classList.remove('open');
    setTimeout(() => { overlay.style.display = 'none'; }, 300);
    document.body.style.overflow = '';
    clearMediaPreview();
}

// ── МЕДИА ЗАГРУЗКА ───────────────────────────────────────────
function handleFileSelect(file) {
    if (!file) return;

    const maxMB = 50;
    if (file.size > maxMB * 1024 * 1024) {
        showToast(`Файл слишком большой. Максимум ${maxMB} МБ.`);
        return;
    }

    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
        showToast('Поддерживаются только изображения и видео.');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        STATE.currentMediaBase64 = e.target.result;
        STATE.currentMediaType   = isVideo ? 'video' : 'image';
        showMediaPreview(e.target.result, STATE.currentMediaType);
    };
    reader.readAsDataURL(file);
}

function showMediaPreview(src, type) {
    const placeholder = document.getElementById('uploadPlaceholder');
    const preview     = document.getElementById('mediaPreview');

    placeholder.style.display = 'none';
    preview.style.display     = 'block';

    preview.innerHTML = type === 'video'
        ? `<video src="${src}" controls></video>
           <button class="media-preview-remove" id="removeMedia">✕</button>`
        : `<img src="${src}" alt="preview">
           <button class="media-preview-remove" id="removeMedia">✕</button>`;

    document.getElementById('removeMedia').addEventListener('click', clearMediaPreview);
}

function clearMediaPreview() {
    STATE.currentMediaBase64 = null;
    STATE.currentMediaType   = null;

    const placeholder = document.getElementById('uploadPlaceholder');
    const preview     = document.getElementById('mediaPreview');
    if (!placeholder || !preview) return;

    placeholder.style.display = 'block';
    preview.style.display     = 'none';
    preview.innerHTML         = '';

    const fileInput = document.getElementById('inputMedia');
    if (fileInput) fileInput.value = '';
}

// ── СОХРАНЕНИЕ НОВОСТИ ───────────────────────────────────────
function saveNewsItem() {
    const title    = document.getElementById('inputTitle').value.trim();
    const category = document.getElementById('inputCategory').value;
    const text     = document.getElementById('inputText').value.trim();
    const editId   = document.getElementById('editingId').value;

    if (!title) { showToast('Введите заголовок'); return; }
    if (!text)  { showToast('Введите текст новости'); return; }

    const btn = document.getElementById('saveBtn');
    btn.classList.add('loading');

    setTimeout(() => {
        if (editId) {
            const idx = STATE.news.findIndex(n => n.id === editId);
            if (idx !== -1) {
                STATE.news[idx] = {
                    ...STATE.news[idx],
                    title,
                    category,
                    text,
                    media:     STATE.currentMediaBase64 || STATE.news[idx].media,
                    mediaType: STATE.currentMediaType   || STATE.news[idx].mediaType,
                };
            }
            showToast('Новость обновлена ✓');
        } else {
            STATE.news.unshift({
                id:        uid(),
                title,
                category,
                text,
                media:     STATE.currentMediaBase64,
                mediaType: STATE.currentMediaType,
                date:      new Date().toISOString().slice(0, 10),
            });
            showToast('Новость добавлена ✓');
        }

        saveNews();
        renderNews();
        closeAdminModal();
        btn.classList.remove('loading');
    }, 300);
}

// ── УДАЛЕНИЕ НОВОСТИ ─────────────────────────────────────────
function deleteNewsItem() {
    const editId = document.getElementById('editingId').value;
    if (!editId) return;

    if (!confirm('Удалить эту новость?')) return;

    STATE.news = STATE.news.filter(n => n.id !== editId);
    saveNews();
    renderNews();
    closeAdminModal();
    showToast('Новость удалена');
}

// ── СКРЫТЫЙ ВХОД В ADMIN ─────────────────────────────────────
// 5 кликов по логотипу в футере за 2 секунды
function initAdminAccess() {
    const logo = document.getElementById('footerLogoAdmin');
    if (!logo) return;

    let clickCount = 0;
    let clickTimer = null;

    logo.addEventListener('click', () => {
        clickCount++;

        if (clickCount === 1) {
            clickTimer = setTimeout(() => { clickCount = 0; }, 2000);
        }

        if (clickCount >= 5) {
            clearTimeout(clickTimer);
            clickCount = 0;
            toggleAdminMode();
        }
    });
}

function toggleAdminMode() {
    STATE.isAdmin = !STATE.isAdmin;

    const fab = document.getElementById('adminFab');
    fab.style.display = STATE.isAdmin ? 'block' : 'none';

    renderNews(); // перерисовать с/без кнопок редактирования

    if (STATE.isAdmin) {
        showToast('🔑 Режим редактирования включён');
    } else {
        showToast('Режим редактирования выключен');
    }
}

// ── ФИЛЬТРЫ ──────────────────────────────────────────────────
function initFilters() {
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            STATE.currentFilter = btn.dataset.filter;
            renderNews();
        });
    });
}

// ── DRAG & DROP ───────────────────────────────────────────────
function initDragDrop() {
    const area = document.getElementById('mediaUploadArea');
    if (!area) return;

    area.addEventListener('click', () => document.getElementById('inputMedia').click());

    area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('drag-over');
    });

    area.addEventListener('dragleave', () => area.classList.remove('drag-over'));

    area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        handleFileSelect(file);
    });

    document.getElementById('inputMedia').addEventListener('change', (e) => {
        handleFileSelect(e.target.files[0]);
    });
}

// ── ЗАКРЫТИЕ МОДАЛОК ─────────────────────────────────────────
function initModalClose() {
    document.getElementById('modalClose').addEventListener('click', closeNewsModal);
    document.getElementById('adminModalClose').addEventListener('click', closeAdminModal);
    document.getElementById('saveBtn').addEventListener('click', saveNewsItem);
    document.getElementById('deleteBtn').addEventListener('click', deleteNewsItem);
    document.getElementById('addNewsBtn').addEventListener('click', () => openAdminModal());

    // Клик на фон — закрыть
    document.getElementById('newsModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('newsModal')) closeNewsModal();
    });
    document.getElementById('adminModal').addEventListener('click', (e) => {
        if (e.target === document.getElementById('adminModal')) closeAdminModal();
    });

    // ESC
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeNewsModal();
            closeAdminModal();
        }
    });
}

// ── ИНИЦИАЛИЗАЦИЯ ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    loadNews();
    renderNews();
    initFilters();
    initModalClose();
    initDragDrop();
    initAdminAccess();
});