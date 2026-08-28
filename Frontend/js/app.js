// app.js — ИСПРАВЛЕННАЯ ВЕРСИЯ (с сохранением позиции)

class App {
    constructor() {
        this.currentPage = 'profile';
        this.loadPage('profile');
    }

    async loadPage(page) {
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
                    <button onclick="app.changeUser()">
                        Сменить пользователя
                    </button>
                </div>
            </div>
        `;
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
// ПЕРЕТАСКИВАНИЕ (С СОХРАНЕНИЕМ ПОЗИЦИИ)
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
    let offsetX = 0;
    let offsetY = 0;
    let currentX = 0;
    let currentY = 0;

    // Удаляем старые обработчики
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);

    elements.forEach(el => {
        // Удаляем старый обработчик, если есть
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

            // ПОЛУЧАЕМ ТЕКУЩУЮ ПОЗИЦИЮ ИЗ TRANSFORM
            const transform = draggedEl.style.transform;
            const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
            if (match) {
                currentX = parseFloat(match[1]) || 0;
                currentY = parseFloat(match[2]) || 0;
            } else {
                currentX = 0;
                currentY = 0;
            }

            const rect = draggedEl.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            draggedEl.style.cursor = 'grabbing';
            draggedEl.classList.add('dragging');
            draggedEl.style.zIndex = '9999';
            draggedEl.style.outline = '3px solid #4CAF50';
            draggedEl.style.outlineOffset = '3px';
            draggedEl.style.boxShadow = '0 0 30px rgba(76, 175, 80, 0.3)';

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
            console.log('🖱️ Перетаскивание начато:', draggedEl.id || draggedEl.dataset.element);
            console.log('  текущая позиция:', currentX, currentY);
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

        const parent = draggedEl.parentElement;
        if (!parent) return;

        const parentRect = parent.getBoundingClientRect();
        const elRect = draggedEl.getBoundingClientRect();

        // Вычисляем НОВОЕ смещение относительно НАЧАЛЬНОЙ позиции
        let deltaX = e.clientX - parentRect.left - offsetX;
        let deltaY = e.clientY - parentRect.top - offsetY;

        // Применяем transform с сохранением текущей позиции
        draggedEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
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

            // СОХРАНЯЕМ ПОЗИЦИЮ
            const id = draggedEl.id || draggedEl.dataset.element;
            const transform = draggedEl.style.transform;
            const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
            if (match && id) {
                const x = parseFloat(match[1]);
                const y = parseFloat(match[2]);
                console.log(`💾 Позиция ${id}: (${x}, ${y})`);
            }

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

    const isEditMode = document.querySelector('.draggable-element.editing') !== null;

    if (isEditMode) {
        elements.forEach(el => {
            el.classList.remove('editing');
        });
        if (grid) { grid.classList.remove('active'); grid.style.display = 'none'; }
        if (exitBtn) exitBtn.style.display = 'none';
        document.body.style.overflow = '';
        console.log('🔒 Режим редактирования выключен');
    } else {
        elements.forEach(el => {
            el.classList.add('editing');
        });
        if (grid) { grid.style.display = 'block'; grid.classList.add('active'); }
        if (exitBtn) exitBtn.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('✏️ Режим редактирования включён');

        setTimeout(enableDragAndDrop, 100);
    }
}

window.toggleEditModeGlobal = toggleEditModeGlobal;

// ========================================
// ИНИЦИАЛИЗАЦИЯ
// ========================================

document.addEventListener('DOMContentLoaded', function () {
    window.app = new App();
    console.log('✅ app.js загружен!');
});