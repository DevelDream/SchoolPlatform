// profile.js — ПОЛНАЯ РАБОЧАЯ ВЕРСИЯ (с transform)

class ProfileRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.userData = null;

        this.isEditingAbout = false;
        this.isEditingInterests = false;
        this.isEditingClubs = false;

        this.isEditMode = false;
        this.isClassicMode = false;

        // Mouse Drag
        this.draggedElement = null;
        this.dragOffsetX = 0;
        this.dragOffsetY = 0;
        this.isDragging = false;

        this.layouts = {
            classic: {},
            user: {}
        };
    }

    async render() {
        try {
            this.userData = await api.getProfile();
            this.container.innerHTML = this.createProfileHTML(this.userData);

            this.loadLayouts();
            this.applyLayout();
            this.updateLayoutButton();

            this.attachEventListeners();

        } catch (error) {
            this.container.innerHTML = `<p style="color:#dc3545;">❌ Ошибка: ${error.message}</p>`;
        }
    }

    createProfileHTML(user) {
        const interests = user.interests || [];
        const clubs = user.clubs || [];
        const aboutViewers = user.aboutViewers || [];
        const interestsViewers = user.interestsViewers || [];
        const clubsViewers = user.clubsViewers || [];

        return `
            <div class="profile-page" id="profilePage">

                <!-- АВАТАР + ИМЯ -->
                <div class="profile-header-card draggable-element" data-element="header" id="element-header">
                    <div class="avatar-section">
                        <img src="${user.avatarUrl}" alt="Аватар" class="profile-avatar" id="profileAvatar">
                        <button class="change-avatar-btn" id="changeAvatarBtn">📷 Сменить</button>
                        <input type="file" id="avatarInput" accept="image/png" style="display:none;">
                    </div>
                    <div class="user-info">
                        <h1 class="user-name">${user.name}</h1>
                        <p class="user-school">🏫 ${user.class} класс • ${user.schoolName || 'Школа №7'}</p>
                    </div>
                    <div class="drag-handle">↕</div>
                </div>

                <!-- О СЕБЕ -->
                <div class="info-card about-section draggable-element" data-element="about" id="element-about">
                    <div class="section-header">
                        <h3>📝 О себе</h3>
                        <div class="section-header-actions">
                            <button class="edit-about-btn" id="editAboutBtn" title="Редактировать">✏️</button>
                        </div>
                    </div>
                    <div class="about-content" id="aboutContent">
                        <p id="aboutText">${user.about || 'Пока ничего не рассказано о себе...'}</p>
                    </div>
                    <textarea id="aboutEditor" style="display:none; width:100%; min-height:100px; border-radius:8px; padding:12px; font-size:14px; border:1px solid #333; background:#222; color:#ccc; font-family:inherit; resize:vertical;">${user.about || ''}</textarea>

                    <div class="visibility-section">
                        <div class="visibility-controls">
                            <button class="visibility-btn ${user.aboutVisibility === 'public' ? 'active' : ''}" data-type="about" data-mode="public">🌍 Публично</button>
                            <button class="visibility-btn ${user.aboutVisibility === 'private' ? 'active' : ''}" data-type="about" data-mode="private">🔒 Скрыто ото всех</button>
                            <button class="visibility-btn ${user.aboutVisibility === 'selected' ? 'active' : ''}" data-type="about" data-mode="selected">👥 Только для избранных</button>
                        </div>
                        <div class="viewers-list" id="aboutViewersList" style="${user.aboutVisibility === 'selected' ? '' : 'display:none;'}">
                            <span class="viewers-label">Кто может видеть:</span>
                            <div class="viewers-tags" id="aboutViewersTags">
                                ${aboutViewers.map(login => `
                                    <span class="viewer-tag">
                                        ${login}
                                        <button class="remove-viewer" data-login="${login}" data-type="about">×</button>
                                    </span>
                                `).join('')}
                            </div>
                            <div class="viewer-add">
                                <input type="text" class="viewer-input" id="aboutViewerInput" placeholder="Введите логин">
                                <button class="add-viewer-btn" data-type="about">➕ Добавить</button>
                            </div>
                        </div>
                    </div>
                    <div class="drag-handle">↕</div>
                </div>

                <!-- ИНТЕРЕСЫ -->
                <div class="info-card draggable-element" data-element="interests" id="element-interests">
                    <div class="section-header">
                        <h3>🎯 Интересы</h3>
                        <div class="section-header-actions">
                            <button class="edit-interests-btn" id="editInterestsBtn" title="Редактировать">✏️</button>
                        </div>
                    </div>
                    <div class="interests-content" id="interestsContent">
                        <div class="tags" id="interestsTags">
                            ${interests.length > 0 ? interests.map(i => `<span class="tag">${i}</span>`).join('') : '<span style="color:#666;font-size:14px;">Нет интересов</span>'}
                        </div>
                    </div>
                    <div id="interestsEditor" style="display:none; margin-top:8px;">
                        <input type="text" id="interestsInput" placeholder="Введите интерес" class="privacy-input" style="margin-bottom:8px;">
                        <button class="add-item-btn" id="addInterestBtn">➕ Добавить</button>
                        <div style="margin-top:8px;">
                            <button class="save-editor-btn" id="saveInterestsBtn">💾 Сохранить</button>
                            <button class="cancel-editor-btn" id="cancelInterestsBtn">❌ Отменить</button>
                        </div>
                    </div>

                    <div class="visibility-section">
                        <div class="visibility-controls">
                            <button class="visibility-btn ${user.interestsVisibility === 'public' ? 'active' : ''}" data-type="interests" data-mode="public">🌍 Публично</button>
                            <button class="visibility-btn ${user.interestsVisibility === 'private' ? 'active' : ''}" data-type="interests" data-mode="private">🔒 Скрыто ото всех</button>
                            <button class="visibility-btn ${user.interestsVisibility === 'selected' ? 'active' : ''}" data-type="interests" data-mode="selected">👥 Только для избранных</button>
                        </div>
                        <div class="viewers-list" id="interestsViewersList" style="${user.interestsVisibility === 'selected' ? '' : 'display:none;'}">
                            <span class="viewers-label">Кто может видеть:</span>
                            <div class="viewers-tags" id="interestsViewersTags">
                                ${interestsViewers.map(login => `
                                    <span class="viewer-tag">
                                        ${login}
                                        <button class="remove-viewer" data-login="${login}" data-type="interests">×</button>
                                    </span>
                                `).join('')}
                            </div>
                            <div class="viewer-add">
                                <input type="text" class="viewer-input" id="interestsViewerInput" placeholder="Введите логин">
                                <button class="add-viewer-btn" data-type="interests">➕ Добавить</button>
                            </div>
                        </div>
                    </div>
                    <div class="drag-handle">↕</div>
                </div>

                <!-- КРУЖКИ -->
                <div class="info-card draggable-element" data-element="clubs" id="element-clubs">
                    <div class="section-header">
                        <h3>🏫 Кружки</h3>
                        <div class="section-header-actions">
                            <button class="edit-clubs-btn" id="editClubsBtn" title="Редактировать">✏️</button>
                        </div>
                    </div>
                    <div class="clubs-content" id="clubsContent">
                        <div class="tags" id="clubsTags">
                            ${clubs.length > 0 ? clubs.map(c => `<span class="tag">${c}</span>`).join('') : '<span style="color:#666;font-size:14px;">Нет кружков</span>'}
                        </div>
                    </div>
                    <div id="clubsEditor" style="display:none; margin-top:8px;">
                        <input type="text" id="clubsInput" placeholder="Введите кружок" class="privacy-input" style="margin-bottom:8px;">
                        <button class="add-item-btn" id="addClubBtn">➕ Добавить</button>
                        <div style="margin-top:8px;">
                            <button class="save-editor-btn" id="saveClubsBtn">💾 Сохранить</button>
                            <button class="cancel-editor-btn" id="cancelClubsBtn">❌ Отменить</button>
                        </div>
                    </div>

                    <div class="visibility-section">
                        <div class="visibility-controls">
                            <button class="visibility-btn ${user.clubsVisibility === 'public' ? 'active' : ''}" data-type="clubs" data-mode="public">🌍 Публично</button>
                            <button class="visibility-btn ${user.clubsVisibility === 'private' ? 'active' : ''}" data-type="clubs" data-mode="private">🔒 Скрыто ото всех</button>
                            <button class="visibility-btn ${user.clubsVisibility === 'selected' ? 'active' : ''}" data-type="clubs" data-mode="selected">👥 Только для избранных</button>
                        </div>
                        <div class="viewers-list" id="clubsViewersList" style="${user.clubsVisibility === 'selected' ? '' : 'display:none;'}">
                            <span class="viewers-label">Кто может видеть:</span>
                            <div class="viewers-tags" id="clubsViewersTags">
                                ${clubsViewers.map(login => `
                                    <span class="viewer-tag">
                                        ${login}
                                        <button class="remove-viewer" data-login="${login}" data-type="clubs">×</button>
                                    </span>
                                `).join('')}
                            </div>
                            <div class="viewer-add">
                                <input type="text" class="viewer-input" id="clubsViewerInput" placeholder="Введите логин">
                                <button class="add-viewer-btn" data-type="clubs">➕ Добавить</button>
                            </div>
                        </div>
                    </div>
                    <div class="drag-handle">↕</div>
                </div>

                <!-- КНОПКА ПЕРЕКЛЮЧЕНИЯ РЕЖИМА ИНТЕРФЕЙСА -->
                <div class="interface-edit-section">
                    <button class="edit-layout-btn" id="editLayoutBtn">
                        🏛️ Расположение классического интерфейса
                    </button>
                </div>
            </div>
        `;
    }

    // ============================================================
    //  LAYOUT
    // ============================================================
    loadLayouts() {
        const saved = localStorage.getItem('edusync_layouts');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                this.layouts.classic = parsed.classic || {};
                this.layouts.user = parsed.user || {};
            } catch (e) { console.warn('Ошибка загрузки layout:', e); }
        }
        if (Object.keys(this.layouts.classic).length === 0) this.saveClassicLayout();
    }

    saveClassicLayout() {
        const elements = document.querySelectorAll('.draggable-element');
        const parent = document.getElementById('profilePage');
        if (!parent) return;
        elements.forEach(el => {
            const id = el.id || el.dataset.element;
            if (id) {
                const rect = el.getBoundingClientRect();
                const parentRect = parent.getBoundingClientRect();
                this.layouts.classic[id] = {
                    x: rect.left - parentRect.left,
                    y: rect.top - parentRect.top,
                    width: rect.width,
                    height: rect.height,
                    order: Array.from(parent.children).indexOf(el)
                };
            }
        });
        this.saveLayouts();
    }

    saveUserLayout() {
        const elements = document.querySelectorAll('.draggable-element');
        const parent = document.getElementById('profilePage');
        if (!parent) return;
        elements.forEach(el => {
            const id = el.id || el.dataset.element;
            if (id) {
                const rect = el.getBoundingClientRect();
                const parentRect = parent.getBoundingClientRect();
                this.layouts.user[id] = {
                    x: parseFloat(el.style.left) || 0,
                    y: parseFloat(el.style.top) || 0,
                    width: rect.width,
                    height: rect.height,
                    order: Array.from(parent.children).indexOf(el)
                };
            }
        });
        this.saveLayouts();
        console.log('💾 Пользовательское расположение сохранено');
    }

    saveLayouts() {
        localStorage.setItem('edusync_layouts', JSON.stringify(this.layouts));
    }

    hasUserLayout() {
        return Object.keys(this.layouts.user).length > 0;
    }

    applyLayout() {
        const type = this.isClassicMode ? 'classic' : 'user';
        const layout = this.layouts[type];
        if (!layout) return;

        const elements = document.querySelectorAll('.draggable-element');
        const parent = document.getElementById('profilePage');
        if (!parent) return;

        const sorted = Array.from(elements).sort((a, b) => {
            const aId = a.id || a.dataset.element;
            const bId = b.id || b.dataset.element;
            return (layout[aId]?.order || 0) - (layout[bId]?.order || 0);
        });
        sorted.forEach(el => parent.appendChild(el));

        elements.forEach(el => {
            const id = el.id || el.dataset.element;
            const pos = layout[id];
            if (pos) {
                el.style.position = 'relative';
                el.style.left = (pos.x || 0) + 'px';
                el.style.top = (pos.y || 0) + 'px';
                el.style.width = (pos.width || 'auto') + 'px';
                el.style.height = (pos.height || 'auto') + 'px';
            }
        });
    }

    updateLayoutButton() {
        const btn = document.getElementById('editLayoutBtn');
        if (!btn) return;
        btn.textContent = this.isClassicMode
            ? '📐 Расположение по пользовательскому интерфейсу'
            : '🏛️ Расположение классического интерфейса';
    }

    toggleLayoutMode() {
        this.isClassicMode = !this.isClassicMode;
        if (this.isClassicMode) {
            this.applyLayout();
            console.log('🏛️ Классический интерфейс');
        } else {
            if (!this.hasUserLayout()) {
                this.layouts.user = JSON.parse(JSON.stringify(this.layouts.classic));
                this.saveLayouts();
            }
            this.applyLayout();
            console.log('📐 Пользовательский интерфейс');
        }
        this.updateLayoutButton();
    }

    // ============================================================
    //  РЕЖИМ РЕДАКТИРОВАНИЯ (✏️)
    // ============================================================
    toggleEditMode() {
        this.isEditMode = !this.isEditMode;

        const elements = document.querySelectorAll('.draggable-element');
        const handles = document.querySelectorAll('.drag-handle');
        const grid = document.getElementById('editGrid');
        const exitBtn = document.getElementById('exitEditBtn');

        console.log('🔍 Найдено элементов:', elements.length);
        console.log('🔍 Найдено ручек:', handles.length);

        if (this.isEditMode) {
            // ВКЛЮЧАЕМ
            elements.forEach(el => el.classList.add('editing'));
            handles.forEach(h => h.style.display = 'flex');

            if (grid) { grid.style.display = 'block'; grid.classList.add('active'); }
            if (exitBtn) exitBtn.style.display = 'block';
            document.body.style.overflow = 'hidden';

            this.enableDragging();
            // ДОБАВЛЯЕМ ПРОВЕРКУ
            console.log('🔍 Ручки после enableDragging:', document.querySelectorAll('.drag-handle').length);
            document.querySelectorAll('.drag-handle').forEach(h => {
                console.log('Ручка:', h, 'слушатели:', h._listeners);
            });
            console.log('✏️ Режим редактирования включён');
        } else {
            // ВЫКЛЮЧАЕМ
            elements.forEach(el => el.classList.remove('editing'));
            handles.forEach(h => h.style.display = 'none');

            if (grid) { grid.classList.remove('active'); grid.style.display = 'none'; }
            if (exitBtn) exitBtn.style.display = 'none';
            document.body.style.overflow = '';

            this.disableDragging();
            this.saveUserLayout();

            console.log('🔒 Режим редактирования выключен');
        }
    }

    // ============================================================
    //  MOUSE DRAG & DROP (с transform)
    // ============================================================
    // ============================================================
    //  MOUSE DRAG & DROP (ПРОСТОЕ И НАДЁЖНОЕ РЕШЕНИЕ)
    // ============================================================
    enableDragging() {
        const handles = document.querySelectorAll('.drag-handle');
        console.log('🔧 enableDragging вызван, найдено ручек:', handles.length);

        // Удаляем старые обработчики, чтобы не было дублирования
        this.disableDragging();

        // Создаём привязку к this
        this._boundOnMouseDown = this._onMouseDown.bind(this);

        handles.forEach(handle => {
            handle.addEventListener('mousedown', this._boundOnMouseDown);
            handle.style.cursor = 'grab';
        });

        // Сохраняем ссылки на обработчики для удаления
        this._boundOnMouseMove = this._onMouseMove.bind(this);
        this._boundOnMouseUp = this._onMouseUp.bind(this);
    }

    disableDragging() {
        const handles = document.querySelectorAll('.drag-handle');
        handles.forEach(handle => {
            if (this._boundOnMouseDown) {
                handle.removeEventListener('mousedown', this._boundOnMouseDown);
            }
            handle.style.cursor = '';
        });
        if (this._boundOnMouseMove) {
            document.removeEventListener('mousemove', this._boundOnMouseMove);
        }
        if (this._boundOnMouseUp) {
            document.removeEventListener('mouseup', this._boundOnMouseUp);
        }
        this.isDragging = false;
        this.draggedElement = null;
    }

    _onMouseDown(e) {
        e.preventDefault();
        console.log('🖱️ mousedown сработал!');

        const handle = e.target.closest('.drag-handle');
        if (!handle) {
            console.log('❌ Ручка не найдена');
            return;
        }

        this.draggedElement = handle.closest('.draggable-element');
        if (!this.draggedElement) {
            console.log('❌ Блок не найден');
            return;
        }

        this.isDragging = true;
        const rect = this.draggedElement.getBoundingClientRect();
        this.dragOffsetX = e.clientX - rect.left;
        this.dragOffsetY = e.clientY - rect.top;

        this.draggedElement.style.cursor = 'grabbing';
        this.draggedElement.classList.add('dragging');
        this.draggedElement.style.zIndex = '1000';

        document.addEventListener('mousemove', this._boundOnMouseMove);
        document.addEventListener('mouseup', this._boundOnMouseUp);

        console.log('🖱️ Начало перетаскивания:', this.draggedElement.id || this.draggedElement.dataset.element);
    }

    _onMouseMove(e) {
        if (!this.isDragging || !this.draggedElement) return;

        const parent = this.draggedElement.parentElement;
        if (!parent) return;

        const parentRect = parent.getBoundingClientRect();
        const elRect = this.draggedElement.getBoundingClientRect();

        let x = e.clientX - parentRect.left - this.dragOffsetX;
        let y = e.clientY - parentRect.top - this.dragOffsetY;

        x = Math.max(0, Math.min(x, parentRect.width - elRect.width));
        y = Math.max(0, Math.min(y, parentRect.height - elRect.height));

        this.draggedElement.style.transform = `translate(${x}px, ${y}px)`;
        this.draggedElement.style.position = 'relative';
    }

    _onMouseUp(e) {
        if (this.isDragging && this.draggedElement) {
            this.draggedElement.style.cursor = '';
            this.draggedElement.classList.remove('dragging');
            this.draggedElement.style.zIndex = '';
            console.log('🖱️ Перетаскивание завершено');

            const id = this.draggedElement.id || this.draggedElement.dataset.element;
            if (id) {
                const transform = this.draggedElement.style.transform;
                const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
                if (match) {
                    const x = parseFloat(match[1]);
                    const y = parseFloat(match[2]);
                    const rect = this.draggedElement.getBoundingClientRect();

                    if (!this.layouts.user[id]) this.layouts.user[id] = {};
                    this.layouts.user[id].x = x;
                    this.layouts.user[id].y = y;
                    this.layouts.user[id].width = rect.width;
                    this.layouts.user[id].height = rect.height;
                    this.saveLayouts();
                    console.log(`💾 Позиция сохранена для: ${id} (${x}, ${y})`);
                }
            }
        }
        this.isDragging = false;
        this.draggedElement = null;

        document.removeEventListener('mousemove', this._boundOnMouseMove);
        document.removeEventListener('mouseup', this._boundOnMouseUp);
    }

    // ============================================================
    //  ОБЫЧНЫЕ ОБРАБОТЧИКИ
    // ============================================================
    attachEventListeners() {
        // --- АВАТАРКА ---
        const changeBtn = document.getElementById('changeAvatarBtn');
        const avatarInput = document.getElementById('avatarInput');
        const avatarImg = document.getElementById('profileAvatar');
        if (changeBtn && avatarInput) {
            changeBtn.addEventListener('click', () => avatarInput.click());
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file && file.type === 'image/png') {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                        avatarImg.src = ev.target.result;
                        this.updateAvatar(ev.target.result);
                    };
                    reader.readAsDataURL(file);
                } else {
                    alert('Пожалуйста, выберите PNG изображение');
                }
            });
        }

        // --- О СЕБЕ ---
        const editAboutBtn = document.getElementById('editAboutBtn');
        const aboutText = document.getElementById('aboutText');
        const aboutEditor = document.getElementById('aboutEditor');
        if (editAboutBtn && aboutText && aboutEditor) {
            editAboutBtn.addEventListener('click', () => {
                if (aboutEditor.style.display === 'none') {
                    aboutEditor.style.display = 'block';
                    aboutText.style.display = 'none';
                    aboutEditor.value = aboutText.textContent.trim() === 'Пока ничего не рассказано о себе...' ? '' : aboutText.textContent;
                    aboutEditor.focus();
                    editAboutBtn.textContent = '💾';
                } else {
                    const newText = aboutEditor.value.trim() || 'Пока ничего не рассказано о себе...';
                    aboutText.textContent = newText;
                    aboutEditor.style.display = 'none';
                    aboutText.style.display = 'block';
                    editAboutBtn.textContent = '✏️';
                    this.updateAbout(newText);
                }
            });
        }

        // --- ВИДИМОСТЬ ---
        document.querySelectorAll('.visibility-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const mode = btn.dataset.mode;
                document.querySelectorAll(`.visibility-btn[data-type="${type}"]`).forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const listId = type === 'about' ? 'aboutViewersList' :
                    type === 'interests' ? 'interestsViewersList' : 'clubsViewersList';
                const list = document.getElementById(listId);
                if (list) list.style.display = mode === 'selected' ? '' : 'none';
                this.updateVisibility(type, mode);
            });
        });

        // --- ДОБАВЛЕНИЕ / УДАЛЕНИЕ ПРОСМОТРЩИКОВ ---
        document.querySelectorAll('.add-viewer-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                const input = document.getElementById(
                    type === 'about' ? 'aboutViewerInput' :
                        type === 'interests' ? 'interestsViewerInput' : 'clubsViewerInput'
                );
                const login = input?.value.trim();
                if (login) {
                    this.addViewer(type, login);
                    input.value = '';
                }
            });
        });

        document.querySelectorAll('.remove-viewer').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeViewer(btn.dataset.type, btn.dataset.login);
            });
        });

        // --- ИНТЕРЕСЫ ---
        const editInterestsBtn = document.getElementById('editInterestsBtn');
        const interestsContent = document.getElementById('interestsContent');
        const interestsEditor = document.getElementById('interestsEditor');
        const interestsInput = document.getElementById('interestsInput');
        const addInterestBtn = document.getElementById('addInterestBtn');
        const saveInterestsBtn = document.getElementById('saveInterestsBtn');
        const cancelInterestsBtn = document.getElementById('cancelInterestsBtn');

        if (editInterestsBtn) {
            editInterestsBtn.addEventListener('click', () => {
                interestsContent.style.display = 'none';
                interestsEditor.style.display = 'block';
                editInterestsBtn.textContent = '💾';
                this.isEditingInterests = true;
            });
        }
        if (addInterestBtn && interestsInput) {
            addInterestBtn.addEventListener('click', () => {
                const val = interestsInput.value.trim();
                if (val) {
                    const tags = document.getElementById('interestsTags');
                    const span = document.createElement('span');
                    span.className = 'tag';
                    span.textContent = val;
                    tags.appendChild(span);
                    interestsInput.value = '';
                }
            });
            interestsInput.addEventListener('keypress', e => { if (e.key === 'Enter') addInterestBtn.click(); });
        }
        if (saveInterestsBtn) {
            saveInterestsBtn.addEventListener('click', () => {
                const tags = document.querySelectorAll('#interestsTags .tag');
                const interests = Array.from(tags).map(t => t.textContent);
                this.updateInterests(interests);
                interestsContent.style.display = 'block';
                interestsEditor.style.display = 'none';
                editInterestsBtn.textContent = '✏️';
                this.isEditingInterests = false;
            });
        }
        if (cancelInterestsBtn) {
            cancelInterestsBtn.addEventListener('click', () => {
                interestsContent.style.display = 'block';
                interestsEditor.style.display = 'none';
                editInterestsBtn.textContent = '✏️';
                this.isEditingInterests = false;
                this.render();
            });
        }

        // --- КРУЖКИ ---
        const editClubsBtn = document.getElementById('editClubsBtn');
        const clubsContent = document.getElementById('clubsContent');
        const clubsEditor = document.getElementById('clubsEditor');
        const clubsInput = document.getElementById('clubsInput');
        const addClubBtn = document.getElementById('addClubBtn');
        const saveClubsBtn = document.getElementById('saveClubsBtn');
        const cancelClubsBtn = document.getElementById('cancelClubsBtn');

        if (editClubsBtn) {
            editClubsBtn.addEventListener('click', () => {
                clubsContent.style.display = 'none';
                clubsEditor.style.display = 'block';
                editClubsBtn.textContent = '💾';
                this.isEditingClubs = true;
            });
        }
        if (addClubBtn && clubsInput) {
            addClubBtn.addEventListener('click', () => {
                const val = clubsInput.value.trim();
                if (val) {
                    const tags = document.getElementById('clubsTags');
                    const span = document.createElement('span');
                    span.className = 'tag';
                    span.textContent = val;
                    tags.appendChild(span);
                    clubsInput.value = '';
                }
            });
            clubsInput.addEventListener('keypress', e => { if (e.key === 'Enter') addClubBtn.click(); });
        }
        if (saveClubsBtn) {
            saveClubsBtn.addEventListener('click', () => {
                const tags = document.querySelectorAll('#clubsTags .tag');
                const clubs = Array.from(tags).map(t => t.textContent);
                this.updateClubs(clubs);
                clubsContent.style.display = 'block';
                clubsEditor.style.display = 'none';
                editClubsBtn.textContent = '✏️';
                this.isEditingClubs = false;
            });
        }
        if (cancelClubsBtn) {
            cancelClubsBtn.addEventListener('click', () => {
                clubsContent.style.display = 'block';
                clubsEditor.style.display = 'none';
                editClubsBtn.textContent = '✏️';
                this.isEditingClubs = false;
                this.render();
            });
        }

        // --- ПЕРЕКЛЮЧЕНИЕ ЛЕЙАУТА ---
        const layoutBtn = document.getElementById('editLayoutBtn');
        if (layoutBtn) {
            layoutBtn.addEventListener('click', () => this.toggleLayoutMode());
        }
    }

    // ============================================================
    //  API ВЫЗОВЫ
    // ============================================================
    async updateAvatar(base64Image) {
        try {
            const res = await fetch(`${API_BASE}/user/${api.userId}/avatar`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ avatar: base64Image })
            });
            if (!res.ok) throw new Error('Ошибка обновления аватарки');
            console.log('✅ Аватарка обновлена');
        } catch (e) { console.error(e); alert('Не удалось обновить аватарку'); }
    }

    async updateAbout(text) {
        try {
            const res = await fetch(`${API_BASE}/user/${api.userId}/about`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ about: text })
            });
            if (!res.ok) throw new Error('Ошибка обновления');
            console.log('✅ "О себе" обновлено');
        } catch (e) { console.error(e); }
    }

    async updateInterests(interests) {
        try {
            const res = await fetch(`${API_BASE}/user/${api.userId}/interests`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ interests })
            });
            if (!res.ok) throw new Error('Ошибка обновления');
            console.log('✅ Интересы обновлены');
        } catch (e) { console.error(e); }
    }

    async updateClubs(clubs) {
        try {
            const res = await fetch(`${API_BASE}/user/${api.userId}/clubs`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clubs })
            });
            if (!res.ok) throw new Error('Ошибка обновления');
            console.log('✅ Кружки обновлены');
        } catch (e) { console.error(e); }
    }

    async updateVisibility(type, mode) {
        try {
            const res = await fetch(`${API_BASE}/user/${api.userId}/visibility`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, mode })
            });
            if (!res.ok) throw new Error('Ошибка обновления');
            console.log(`✅ Видимость ${type} обновлена: ${mode}`);
        } catch (e) { console.error(e); }
    }

    async addViewer(type, login) {
        try {
            const res = await fetch(`${API_BASE}/user/${api.userId}/viewer/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, login })
            });
            if (!res.ok) throw new Error('Ошибка добавления');
            console.log(`✅ Просмотрщик ${login} добавлен для ${type}`);
            this.render();
        } catch (e) { console.error(e); }
    }

    async removeViewer(type, login) {
        try {
            const res = await fetch(`${API_BASE}/user/${api.userId}/viewer/remove`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, login })
            });
            if (!res.ok) throw new Error('Ошибка удаления');
            console.log(`✅ Просмотрщик ${login} удален для ${type}`);
            this.render();
        } catch (e) { console.error(e); }
    }
}