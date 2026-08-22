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
                await this.renderProfile(content);
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

    async renderProfile(container) {
        try {
            const data = await api.getProfile();
            const levelMap = {
                0: '📕 Двоечник',
                1: '📘 Троечник',
                2: '✨ Отличник'
            };

            container.innerHTML = `
                <div class="profile-card">
                    <div class="profile-header">
                        <img src="${data.avatarUrl}" alt="Avatar" class="avatar">
                        <h2>${data.name}</h2>
                        <p class="class-badge">${data.class} класс</p>
                    </div>
                    <div class="profile-info">
                        <div class="info-section">
                            <h3>Интересы</h3>
                            <div class="tags">
                                ${data.interests.map(i => `<span class="tag">${i}</span>`).join('')}
                            </div>
                        </div>
                        <div class="info-section">
                            <h3>Кружки</h3>
                            <div class="tags">
                                ${data.clubs.map(c => `<span class="tag">${c}</span>`).join('')}
                            </div>
                        </div>
                        <div class="info-section">
                            <h3>Уровень</h3>
                            <p>${levelMap[data.level] || 'Неизвестно'}</p>
                        </div>
                    </div>
                    <button class="edit-btn" onclick="app.editProfile()">✏️ Редактировать</button>
                </div>
            `;
        } catch (error) {
            container.innerHTML = `<p style="color:red;">Ошибка: ${error.message}</p>`;
        }
    }

    async renderDiary(container) {
        container.innerHTML = `<div id="diaryContainer"></div>`;
        diary = new DiaryRenderer('diaryContainer');
        await diary.render();
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
            container.innerHTML = `<p style="color:red;">Ошибка: ${error.message}</p>`;
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

    editProfile() {
        const name = prompt('Введите новое имя:');
        if (name) {
            api.updateProfile({ name })
                .then(() => {
                    alert('Профиль обновлен!');
                    this.loadPage('profile');
                })
                .catch(error => alert('Ошибка: ' + error.message));
        }
    }

    renderSettings(container) {
        container.innerHTML = `
            <div class="settings-card">
                <h2>Настройки</h2>
                <div class="settings-group">
                    <h3>Тема</h3>
                    <button onclick="document.body.classList.toggle('dark-theme')">
                        Переключить тему
                    </button>
                </div>
                <div class="settings-group">
                    <h3>API</h3>
                    <p>Текущий порт: ${API_BASE}</p>
                    <button onclick="app.changeUserId()">
                        Сменить пользователя
                    </button>
                </div>
            </div>
        `;
    }

    changeUserId() {
        const newId = prompt('Введите новый GUID пользователя:');
        if (newId) {
            api.setUserId(newId);
            alert('Пользователь сменен!');
            this.loadPage('profile');
        }
    }
}

let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new App();
});