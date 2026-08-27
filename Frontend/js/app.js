// app.js — БЕЗ IMPORT

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
                // ИСПОЛЬЗУЕМ ProfileRenderer
                const profileRenderer = new ProfileRenderer('contentArea');
                await profileRenderer.render();
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
    // ДНЕВНИК
    // ========================================
    async renderDiary(container) {
        try {
            container.innerHTML = `<div id="diaryContainer">Загрузка...</div>`;
            diary = new DiaryRenderer('diaryContainer');
            await diary.render();
        } catch (error) {
            container.innerHTML = `<p style="color:#dc3545;">❌ Ошибка: ${error.message}</p>`;
        }
    }

    // ========================================
    // КЛАСС
    // ========================================
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

    // ========================================
    // НАСТРОЙКИ
    // ========================================
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

// ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ
let diary;
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new App();

    // ДОБАВЛЯЕМ СЕТКУ ПРИ ЗАГРУЗКЕ
    document.addEventListener('DOMContentLoaded', function () {
        // Создаём сетку
        const grid = document.createElement('div');
        grid.id = 'editGrid';
        grid.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background-image: linear-gradient(rgba(100, 200, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 200, 255, 0.1) 1px, transparent 1px) !important;
        background-size: 60px 60px !important;
        z-index: 999999 !important;
        pointer-events: none !important;
        display: none !important;
    `;
        document.body.appendChild(grid);
        console.log('✅ Сетка создана автоматически');
    });
    // ========================================
    // СОЗДАНИЕ СЕТКИ ДЛЯ РЕЖИМА РЕДАКТИРОВАНИЯ
    // ========================================

    // Создаём сетку при загрузке
    (function createEditGrid() {
        // Проверяем, есть ли уже сетка
        if (document.getElementById('editGrid')) return;

        const grid = document.createElement('div');
        grid.id = 'editGrid';
        grid.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        background-image: linear-gradient(rgba(100, 200, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(100, 200, 255, 0.1) 1px, transparent 1px) !important;
        background-size: 60px 60px !important;
        z-index: 999999 !important;
        pointer-events: none !important;
        display: none !important;
    `;
        document.body.appendChild(grid);
        console.log('✅ Сетка создана');

        // Добавляем анимацию
        const styleSheet = document.createElement('style');
        styleSheet.textContent = `
        @keyframes gridMove {
            0% { transform: translateY(-50%) translateX(-50%); opacity: 0; }
            100% { transform: translateY(0) translateX(0); opacity: 1; }
        }
        #editGrid.animate-grid {
            animation: gridMove 15s linear infinite !important;
            display: block !important;
        }
    `;
        document.head.appendChild(styleSheet);
        console.log('✅ Анимация добавлена');
    })();

    // Функция для переключения сетки
    window.toggleGrid = function () {
        const g = document.getElementById('editGrid');
        if (!g) return;
        if (g.classList.contains('animate-grid')) {
            g.classList.remove('animate-grid');
            g.style.display = 'none';
            console.log('🔒 Сетка выключена');
        } else {
            g.style.display = 'block';
            g.classList.add('animate-grid');
            console.log('✏️ Сетка включена');
        }
    };
});