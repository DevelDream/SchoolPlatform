// app.js — ФИНАЛЬНАЯ ВЕРСИЯ (полная свобода перемещения)

class App {
    constructor() {
        this.currentPage = 'profile';
        this.initNavigation();
        this.loadPage('profile');
    }

    initNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const page = btn.dataset.page;
                this.loadPage(page);
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });
    }

    async loadPage(page) {
        this.currentPage = page;
        const content = document.getElementById('contentArea');
        const title = document.getElementById('pageTitle');

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
            diary = new DiaryRenderer('diaryContainer');
            await diary.render();
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

let diary;
let app;

// ========================================
// ПЕРЕТАСКИВАНИЕ (ПОЛНАЯ СВОБОДА)
// ========================================

function enableDragAndDrop() {
    console.log('🔄 enableDragAndDrop вызван');

    const handles = document.querySelectorAll('.drag-handle');
    if (handles.length === 0) {
        console.log('⚠️ Ручки не найдены, ждём...');
        setTimeout(enableDragAndDrop, 300);
        return;
    }

    console.log('🔧 Найдено ручек:', handles.length);

    handles.forEach(el => {
        const newEl = el.cloneNode(true);
        el.parentNode.replaceChild(newEl, el);
    });

    const newHandles = document.querySelectorAll('.drag-handle');
    let draggedEl = null;
    let offsetX = 0;
    let offsetY = 0;

    newHandles.forEach(handle => {
        handle.addEventListener('mousedown', function (e) {
            const isEditMode = document.querySelector('.draggable-element.editing') !== null;
            if (!isEditMode) {
                console.log('⚠️ Режим редактирования выключен — перетаскивание запрещено');
                return;
            }

            e.preventDefault();
            draggedEl = this.closest('.draggable-element');
            if (!draggedEl) return;

            const rect = draggedEl.getBoundingClientRect();
            offsetX = e.clientX - rect.left;
            offsetY = e.clientY - rect.top;

            draggedEl.style.cursor = 'grabbing';
            draggedEl.style.zIndex = '9999';
            draggedEl.classList.add('dragging');

            document.addEventListener('mousemove', onMove);
            document.addEventListener('mouseup', onUp);
            console.log('🖱️ Перетаскивание начато:', draggedEl.id || draggedEl.dataset.element);
        });
    });

    function onMove(e) {
        if (!draggedEl) return;

        const isEditMode = document.querySelector('.draggable-element.editing') !== null;
        if (!isEditMode) return;

        const parent = draggedEl.parentElement;
        if (!parent) return;

        const parentRect = parent.getBoundingClientRect();
        const elRect = draggedEl.getBoundingClientRect();

        // ПОЛНАЯ СВОБОДА ПЕРЕМЕЩЕНИЯ
        let x = e.clientX - parentRect.left - offsetX;
        let y = e.clientY - parentRect.top - offsetY;

        // ❌ НЕТ ОГРАНИЧЕНИЙ — можно двигать куда угодно
        // x = Math.max(0, Math.min(x, parentRect.width - elRect.width));
        // y = Math.max(0, Math.min(y, parentRect.height - elRect.height));

        draggedEl.style.transform = `translate(${x}px, ${y}px)`;
        draggedEl.style.position = 'relative';
    }

    function onUp(e) {
        if (draggedEl) {
            draggedEl.style.cursor = '';
            draggedEl.classList.remove('dragging');
            draggedEl.style.zIndex = '';
            console.log('🖱️ Перетаскивание завершено');
        }
        draggedEl = null;
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
    }
}

function toggleEditModeGlobal() {
    console.log('🔄 toggleEditModeGlobal вызван');

    const elements = document.querySelectorAll('.draggable-element');
    const handles = document.querySelectorAll('.drag-handle');
    const grid = document.getElementById('editGrid');
    const exitBtn = document.getElementById('exitEditBtn');

    const isEditMode = document.querySelector('.draggable-element.editing') !== null;

    if (isEditMode) {
        // ВЫКЛЮЧАЕМ
        elements.forEach(el => el.classList.remove('editing'));
        handles.forEach(h => h.style.display = 'none');
        if (grid) { grid.classList.remove('active'); grid.style.display = 'none'; }
        if (exitBtn) exitBtn.style.display = 'none';
        document.body.style.overflow = '';
        console.log('🔒 Режим редактирования выключен');
    } else {
        // ВКЛЮЧАЕМ
        elements.forEach(el => el.classList.add('editing'));
        handles.forEach(h => h.style.display = 'flex');
        if (grid) { grid.style.display = 'block'; grid.classList.add('active'); }
        if (exitBtn) exitBtn.style.display = 'block';
        document.body.style.overflow = 'hidden';
        console.log('✏️ Режим редактирования включён');

        setTimeout(enableDragAndDrop, 100);
    }
}

document.addEventListener('DOMContentLoaded', function () {
    app = new App();

    const toggleBtn = document.getElementById('editToggleBtn');
    if (toggleBtn) {
        toggleBtn.addEventListener('click', toggleEditModeGlobal);
        console.log('✅ Кнопка карандаша подключена');
    }

    const exitBtn = document.getElementById('exitEditBtn');
    if (exitBtn) {
        exitBtn.addEventListener('click', toggleEditModeGlobal);
    }
});

console.log('✅ app.js загружен!');