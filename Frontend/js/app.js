// app.js — ПОЛНАЯ ВЕРСИЯ (ИСПРАВЛЕННАЯ)

class App {
    constructor() {
        this.currentPage = 'profile';
        this.isEditMode = false;
        this.hasUnsavedChanges = false;
        this.currentLayoutType = 'classic';
        this.loadPage('profile');
    }

    async loadPage(page) {
        if (this.isEditMode) {
            const saveResult = await this.showSaveDialog();
            if (saveResult === 'cancel') {
                return;
            }
            this.isEditMode = false;
            this.hasUnsavedChanges = false;

            const elements = document.querySelectorAll('.draggable-element');
            const grid = document.getElementById('editGrid');
            const exitBtn = document.getElementById('exitEditBtn');
            const layoutBtn = document.getElementById('editLayoutBtn');

            elements.forEach(el => el.classList.remove('editing'));
            if (grid) { grid.classList.remove('active'); grid.style.display = 'none'; }
            if (exitBtn) exitBtn.style.display = 'none';
            if (layoutBtn) layoutBtn.style.display = 'none';
            document.body.style.overflow = '';
        }

        this.currentPage = page;
        const content = document.getElementById('contentArea');
        const title = document.getElementById('pageTitle');

        document.querySelectorAll('.menu-link').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.page === page) {
                link.classList.add('active');
            }
        });

        switch (page) {
            case 'profile':
                title.textContent = 'Профиль';
                window.profileRenderer = new ProfileRenderer('contentArea');
                await window.profileRenderer.render();

                setTimeout(() => {
                    this.applySavedLayout();
                    this.updateLayoutButton();
                }, 50);
                break;
            case 'diary':
                title.textContent = 'Дневник';
                await this.renderDiary(content);
                break;
            case 'class':
                title.textContent = 'Класс';
                await this.renderClass(content);
                break;
            case 'settings':
                title.textContent = 'Настройки';
                this.renderSettings(content);
                break;
        }
    }

    // ========================================
    // ДИАЛОГ СОХРАНЕНИЯ
    // ========================================
    showSaveDialog() {
        return new Promise((resolve) => {
            const hasCustom = localStorage.getItem('edusync_has_custom') === 'true';

            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0,0,0,0.7);
                z-index: 1000000;
                display: flex;
                align-items: center;
                justify-content: center;
                backdrop-filter: blur(4px);
            `;

            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: #2d2d2d;
                border-radius: 16px;
                padding: 30px 40px;
                max-width: 450px;
                width: 90%;
                box-shadow: 0 20px 60px rgba(0,0,0,0.5);
                border: 1px solid #444;
            `;

            dialog.innerHTML = `
                <h2 style="color: #eee; margin: 0 0 10px 0; font-size: 22px;">💾 Сохранить изменения?</h2>
                <p style="color: #aaa; margin: 0 0 20px 0; font-size: 15px; line-height: 1.5;">
                    ${hasCustom
                    ? 'Вы внесли изменения в интерфейс. Хотите сохранить их или вернуться к предыдущей версии?'
                    : 'Вы внесли изменения в интерфейс. Хотите сохранить их как кастомный интерфейс?'}
                </p>
                <div style="display: flex; gap: 12px; justify-content: flex-end;">
                    <button id="saveBtn" style="
                        background: #4CAF50;
                        color: #fff;
                        border: none;
                        padding: 10px 28px;
                        border-radius: 8px;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                    ">💾 Сохранить</button>
                    <button id="dontSaveBtn" style="
                        background: ${hasCustom ? '#ff9800' : '#dc3545'};
                        color: #fff;
                        border: none;
                        padding: 10px 28px;
                        border-radius: 8px;
                        font-size: 15px;
                        font-weight: 600;
                        cursor: pointer;
                    ">${hasCustom ? '↩️ Вернуться к предыдущей' : '❌ Не сохранять'}</button>
                </div>
            `;

            overlay.appendChild(dialog);
            document.body.appendChild(overlay);

            document.getElementById('saveBtn').onclick = () => {
                this.saveCustomLayout();
                overlay.remove();
                resolve('save');
            };

            document.getElementById('dontSaveBtn').onclick = () => {
                if (hasCustom) {
                    this.loadCustomLayout();
                    overlay.remove();
                    resolve('dont_save');
                } else {
                    this.applyClassicLayout();
                    overlay.remove();
                    resolve('dont_save');
                }
            };

            overlay.onclick = (e) => {
                if (e.target === overlay) {
                    overlay.remove();
                    resolve('cancel');
                }
            };
        });
    }

    // ========================================
    // УПРАВЛЕНИЕ КНОПКОЙ "РАСПОЛОЖЕНИЕ"
    // ========================================
    updateLayoutButton() {
        const layoutBtn = document.getElementById('editLayoutBtn');
        if (!layoutBtn) return;

        const isClassic = this.currentLayoutType === 'classic';

        if (isClassic) {
            layoutBtn.textContent = '📐 Расположение по пользовательскому интерфейсу';
            layoutBtn.dataset.target = 'custom';
        } else {
            layoutBtn.textContent = '🏛️ Расположение классического интерфейса';
            layoutBtn.dataset.target = 'classic';
        }
    }

    // ========================================
    // ПЕРЕКЛЮЧЕНИЕ МЕЖДУ ИНТЕРФЕЙСАМИ
    // ========================================
    toggleLayoutMode() {
        const hasCustom = localStorage.getItem('edusync_has_custom') === 'true';
        const isClassic = this.currentLayoutType === 'classic';

        if (isClassic) {
            if (hasCustom) {
                this.loadCustomLayout();
                this.currentLayoutType = 'custom';
                console.log('📐 Переключено на кастомный интерфейс');
            } else {
                this.saveCustomLayout();
                this.currentLayoutType = 'custom';
                console.log('📐 Создан и применён кастомный интерфейс');
            }
        } else {
            this.applyClassicLayout();
            this.currentLayoutType = 'classic';
            console.log('🏛️ Переключено на классический интерфейс');
        }

        this.updateLayoutButton();
    }

    // ========================================
    // ПРИМЕНЕНИЕ КЛАССИЧЕСКОГО (БЕЗ УДАЛЕНИЯ КАСТОМНОГО)
    // ========================================
    applyClassicLayout() {
        console.log('🏛️ Применение классического интерфейса...');

        const elements = document.querySelectorAll('.draggable-element');
        const parent = document.getElementById('profilePage');

        if (!parent) {
            console.warn('⚠️ profilePage не найден');
            return;
        }

        const parentRect = parent.getBoundingClientRect();
        const containerWidth = parentRect.width;

        const elementData = [];
        elements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const width = rect.width;
            const centerX = (containerWidth - width) / 2;
            elementData.push({
                el: el,
                width: width,
                centerX: Math.max(0, centerX)
            });
        });

        elementData.forEach((data, index) => {
            const el = data.el;
            el.style.transform = '';
            el.style.position = '';
            el.style.left = '';
            el.style.top = '';
            el.style.width = '';
            el.style.height = '';

            const yOffset = index * 30;
            el.style.transform = `translate(${data.centerX}px, ${yOffset}px)`;
            el.style.position = 'relative';
        });

        this.currentLayoutType = 'classic';
        console.log('✅ Применён классический интерфейс (кастомный сохранён)');
    }

    // ========================================
    // ПОЛНОЕ ВОССТАНОВЛЕНИЕ (УДАЛЯЕТ КАСТОМНЫЙ) — ДЛЯ КНОПКИ В НАСТРОЙКАХ
    // ========================================
    restoreClassicLayout() {
        console.log('🏛️ ПОЛНОЕ восстановление классического интерфейса...');

        localStorage.removeItem('edusync_custom_layout');
        localStorage.removeItem('edusync_has_custom');

        this.applyClassicLayout();
        this.currentLayoutType = 'classic';

        this.updateLayoutButton();
        console.log('✅ Классический интерфейс восстановлен, кастомный удалён!');
    }

    // ========================================
    // СОХРАНЕНИЕ КАСТОМНОГО
    // ========================================
    saveCustomLayout() {
        console.log('💾 Сохранение кастомного интерфейса...');

        const elements = document.querySelectorAll('.draggable-element');
        const positions = {};

        elements.forEach(el => {
            const id = el.id || el.dataset.element;
            const transform = el.style.transform;
            const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
            if (match && id) {
                positions[id] = {
                    x: parseFloat(match[1]) || 0,
                    y: parseFloat(match[2]) || 0
                };
            }
        });

        localStorage.setItem('edusync_custom_layout', JSON.stringify(positions));
        localStorage.setItem('edusync_has_custom', 'true');
        this.currentLayoutType = 'custom';

        this.updateLayoutButton();
        console.log('✅ Кастомный интерфейс сохранён!');
    }

    // ========================================
    // ЗАГРУЗКА КАСТОМНОГО
    // ========================================
    loadCustomLayout() {
        const saved = localStorage.getItem('edusync_custom_layout');
        if (saved) {
            try {
                const positions = JSON.parse(saved);
                const elements = document.querySelectorAll('.draggable-element');
                let applied = false;

                elements.forEach(el => {
                    const id = el.id || el.dataset.element;
                    if (id && positions[id]) {
                        el.style.transform = `translate(${positions[id].x}px, ${positions[id].y}px)`;
                        el.style.position = 'relative';
                        applied = true;
                    }
                });

                if (applied) {
                    console.log('📐 Загружен кастомный интерфейс');
                    this.currentLayoutType = 'custom';
                    this.updateLayoutButton();
                    return true;
                }
            } catch (e) {
                console.warn('Ошибка загрузки кастомного интерфейса:', e);
            }
        }
        return false;
    }

    // ========================================
    // ПРИМЕНЕНИЕ СОХРАНЁННОГО
    // ========================================
    applySavedLayout() {
        const hasCustom = localStorage.getItem('edusync_has_custom') === 'true';

        if (hasCustom) {
            const loaded = this.loadCustomLayout();
            if (loaded) {
                this.currentLayoutType = 'custom';
                console.log('📐 Применён кастомный интерфейс');
                this.updateLayoutButton();
                return;
            }
        }

        this.applyClassicLayout();
        this.currentLayoutType = 'classic';
        console.log('🏛️ Применён классический интерфейс');
        this.updateLayoutButton();
    }

    // ========================================
    // РЕНДЕР СТРАНИЦ
    // ========================================
    async renderDiary(container) {
        try {
            container.innerHTML = `<div id="diaryContainer">Загрузка...</div>`;
            window.diary = new DiaryRenderer('diaryContainer');
            await window.diary.render();
        } catch (error) {
            container.innerHTML = `<p style="color:#dc3545;">❌ Ошибка: ${error.message}</p>`;
        }
    }

    async renderClass(container) {
        try {
            const students = await api.getStudents(7, 'А');
            container.innerHTML = `
                <div class="class-header">
                    <h2>7А класс</h2>
                    <p>${students.length} учеников</p>
                </div>
                <div class="students-grid">
                    ${students.map(s => `
                        <div class="student-card" data-id="${s.id}">
                            <img src="${s.avatarUrl}" alt="${s.name}">
                            <h3>${s.name}</h3>
                            <div class="subjects">
                                <span class="strong">⭐ ${s.strongSubjects.join(', ')}</span>
                                <span class="weak">⚠️ ${s.weakSubjects.join(', ')}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            container.querySelectorAll('.student-card').forEach(card => {
                card.addEventListener('click', async () => {
                    const id = card.dataset.id;
                    await this.showStudentDetails(id);
                });
            });
        } catch (error) {
            container.innerHTML = `<p style="color:#dc3545;">❌ Ошибка: ${error.message}</p>`;
        }
    }

    async showStudentDetails(id) {
        try {
            const data = await api.getStudentDetails(id);
            alert(`📚 ${data.name}\nКласс: ${data.classNumber}${data.classLetter}\n\nПредметы:\n${data.subjects.map(s => `${s.subject}: средний балл ${s.average.toFixed(1)}`).join('\n')}`);
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }

    renderSettings(container) {
        container.innerHTML = `
            <div class="settings-card">
                <h2>⚙️ Настройки</h2>
                <div class="settings-group">
                    <h3>🌗 Тема</h3>
                    <button onclick="document.body.classList.toggle('dark-theme')">
                        Переключить тему
                    </button>
                </div>
                <div class="settings-group">
                    <h3>👤 Пользователь</h3>
                    <p>Текущий ID: ${api.userId}</p>
                    <button onclick="window.app.changeUser()">
                        Сменить пользователя
                    </button>
                </div>
                <div class="settings-group">
                    <h3>🎨 Интерфейс</h3>
                    <button id="resetClassicBtn" style="background:#dc3545; color:#fff; border:none; padding:10px 20px; border-radius:8px; cursor:pointer;">
                        🏛️ Сбросить к классическому (удалить кастомный)
                    </button>
                </div>
            </div>
        `;

        const resetBtn = document.getElementById('resetClassicBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                if (window.app) {
                    window.app.restoreClassicLayout();
                    window.app.loadPage('profile');
                }
            });
        }
    }

    changeUser() {
        const newId = prompt('Введите новый GUID пользователя:');
        if (newId) {
            api.setUserId(newId);
            alert('✅ Пользователь сменен!');
            this.loadPage('profile');
        }
    }
}

let app;

// ========================================
// ПЕРЕТАСКИВАНИЕ
// ========================================

function enableDragAndDrop() {
    console.log('🔄 enableDragAndDrop вызван');

    const elements = document.querySelectorAll('.draggable-element');
    if (elements.length === 0) {
        console.log('⚠️ Элементы не найдены, ждём...');
        setTimeout(enableDragAndDrop, 300);
        return;
    }

    console.log('🔧 Найдено элементов:', elements.length);

    let draggedEl = null;
    let startX = 0;
    let startY = 0;
    let currentX = 0;
    let currentY = 0;

    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);

    elements.forEach(el => {
        if (el._dragHandler) {
            el.removeEventListener('mousedown', el._dragHandler);
        }

        const handler = function (e) {
            if (e.target.closest('button') || e.target.closest('input') || e.target.closest('textarea')) {
                return;
            }

            const isEditMode = document.querySelector('.draggable-element.editing') !== null;
            if (!isEditMode) return;

            e.preventDefault();
            draggedEl = this;

            const transform = draggedEl.style.transform;
            const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
            if (match) {
                currentX = parseFloat(match[1]) || 0;
                currentY = parseFloat(match[2]) || 0;
            } else {
                currentX = 0;
                currentY = 0;
            }

            startX = e.clientX;
            startY = e.clientY;

            draggedEl.style.cursor = 'grabbing';
            draggedEl.classList.add('dragging');
            draggedEl.style.zIndex = '9999';
            draggedEl.style.outline = '3px solid #4CAF50';
            draggedEl.style.outlineOffset = '3px';
            draggedEl.style.boxShadow = '0 0 30px rgba(76, 175, 80, 0.3)';

            if (window.app) {
                window.app.hasUnsavedChanges = true;
            }

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
            console.log('🖱️ Перетаскивание начато:', draggedEl.id || draggedEl.dataset.element);
        };

        el._dragHandler = handler;
        el.addEventListener('mousedown', handler);
    });

    function onMove(e) {
        if (!draggedEl) return;

        const isEditMode = document.querySelector('.draggable-element.editing') !== null;
        if (!isEditMode) {
            finishDrag();
            return;
        }

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;

        const newX = currentX + deltaX;
        const newY = currentY + deltaY;

        draggedEl.style.transform = `translate(${newX}px, ${newY}px)`;
        draggedEl.style.position = 'relative';
    }

    function onUp(e) {
        finishDrag();
    }

    function finishDrag() {
        if (draggedEl) {
            draggedEl.style.cursor = '';
            draggedEl.classList.remove('dragging');
            draggedEl.style.zIndex = '';
            draggedEl.style.outline = '';
            draggedEl.style.outlineOffset = '';
            draggedEl.style.boxShadow = '';
            console.log('🖱️ Перетаскивание завершено');
        }
        draggedEl = null;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
    }
}

// ========================================
// РЕЖИМ РЕДАКТИРОВАНИЯ
// ========================================

function toggleEditModeGlobal() {
    console.log('🔄 toggleEditModeGlobal вызван');

    const elements = document.querySelectorAll('.draggable-element');
    const grid = document.getElementById('editGrid');
    const exitBtn = document.getElementById('exitEditBtn');
    const layoutBtn = document.getElementById('editLayoutBtn');

    const isEditMode = document.querySelector('.draggable-element.editing') !== null;

    if (isEditMode) {
        if (window.app && window.app.hasUnsavedChanges) {
            window.app.showSaveDialog().then(function (result) {
                if (result === 'cancel') return;
                finishTurnOff();
            });
            return;
        }
        finishTurnOff();
    } else {
        elements.forEach(el => el.classList.add('editing'));
        if (grid) { grid.style.display = 'block'; grid.classList.add('active'); }
        if (exitBtn) exitBtn.style.display = 'block';
        if (layoutBtn) layoutBtn.style.display = 'block';
        document.body.style.overflow = 'hidden';

        window.app.isEditMode = true;
        window.app.hasUnsavedChanges = false;
        console.log('✏️ Режим редактирования включён');

        setTimeout(enableDragAndDrop, 50);
    }

    function finishTurnOff() {
        elements.forEach(el => el.classList.remove('editing'));
        if (grid) { grid.classList.remove('active'); grid.style.display = 'none'; }
        if (exitBtn) exitBtn.style.display = 'none';
        if (layoutBtn) layoutBtn.style.display = 'none';
        document.body.style.overflow = '';

        window.app.isEditMode = false;
        window.app.hasUnsavedChanges = false;
        console.log('🔒 Режим редактирования выключен');
    }
}

window.toggleEditModeGlobal = toggleEditModeGlobal;

// ========================================
// ИНИЦИАЛИЗАЦИЯ
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    window.app = new App();

    const layoutBtn = document.getElementById('editLayoutBtn');
    if (layoutBtn) {
        layoutBtn.style.display = 'none';
        layoutBtn.addEventListener('click', function () {
            if (window.app) {
                window.app.toggleLayoutMode();
            }
        });
    }

    console.log('✅ app.js загружен!');
});