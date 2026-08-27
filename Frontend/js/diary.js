// diary.js — БЕЗ IMPORT

class DiaryRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentDate = new Date();
        this.updateWeekRange();
        this.days = [];
        this.isMonthView = false;
        this.weekProgress = []; // Для графика
    }

    updateWeekRange() {
        const dayOfWeek = this.currentDate.getDay();
        const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        this.weekStart = new Date(this.currentDate);
        this.weekStart.setDate(this.currentDate.getDate() - diff);
        this.weekStart.setHours(0, 0, 0, 0);

        this.weekEnd = new Date(this.weekStart);
        this.weekEnd.setDate(this.weekStart.getDate() + 6);
        this.weekEnd.setHours(23, 59, 59, 999);
    }

    formatDate(date) {
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    }

    async render() {
        try {
            // Загружаем прогресс за неделю
            await this.loadWeekProgress();

            if (this.isMonthView) {
                await this.renderMonthView();
            } else {
                await this.renderWeekView();
            }
        } catch (error) {
            this.container.innerHTML = `<p style="color:#dc3545;">❌ Ошибка: ${error.message}</p>`;
        }
    }

    // ========================================
    // ЗАГРУЗКА ПРОГРЕССА ЗА НЕДЕЛЮ
    // ========================================
    async loadWeekProgress() {
        try {
            // Получаем все дни недели
            const weekDays = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(this.weekStart);
                date.setDate(this.weekStart.getDate() + i);
                weekDays.push(date);
            }

            // Собираем данные по предметам за неделю
            const subjectProgress = {};

            for (const date of weekDays) {
                const dateStr = date.toISOString().split('T')[0];
                try {
                    const data = await api.getDayData(dateStr);
                    if (data && data.subjects) {
                        data.subjects.forEach(subj => {
                            if (!subjectProgress[subj.subject]) {
                                subjectProgress[subj.subject] = {
                                    total: 0,
                                    count: 0,
                                    scores: []
                                };
                            }
                            subjectProgress[subj.subject].total += subj.impact || 0;
                            subjectProgress[subj.subject].count++;
                            subjectProgress[subj.subject].scores.push(subj.score || 0);
                        });
                    }
                } catch {
                    // День без данных
                }
            }

            // Вычисляем средний прогресс по каждому предмету
            this.weekProgress = Object.entries(subjectProgress).map(([subject, data]) => {
                const avgImpact = data.count > 0 ? Math.round(data.total / data.count) : 0;
                const avgScore = data.count > 0 ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.count) : 0;
                return {
                    subject: subject,
                    impact: avgImpact,
                    score: avgScore,
                    count: data.count
                };
            }).sort((a, b) => b.impact - a.impact);

        } catch (error) {
            console.error('Ошибка загрузки прогресса недели:', error);
            this.weekProgress = [];
        }
    }

    // ========================================
    // НЕДЕЛЬНЫЙ ВИД
    // ========================================
    async renderWeekView() {
        this.updateWeekRange();

        const weekDays = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(this.weekStart);
            date.setDate(this.weekStart.getDate() + i);
            weekDays.push(date);
        }

        const dayPromises = weekDays.map(async (date) => {
            const dateStr = date.toISOString().split('T')[0];
            try {
                const data = await api.getDayData(dateStr);
                return {
                    date: date,
                    dateStr: dateStr,
                    successRate: data.successRate || 50,
                    subjects: data.subjects || []
                };
            } catch {
                return {
                    date: date,
                    dateStr: dateStr,
                    successRate: null,
                    subjects: []
                };
            }
        });

        this.days = await Promise.all(dayPromises);

        this.container.innerHTML = this.createWeekHTML();
        this.attachWeekEvents();
    }

    createWeekHTML() {
        const weekdays = ['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'];
        const today = new Date().toISOString().split('T')[0];

        return `
            <div class="diary-container">
                <!-- Верхняя панель -->
                <div class="diary-controls">
                    <button class="diary-nav-btn" id="prevWeekBtn">◀</button>
                    <div class="diary-week-label">
                        ${this.formatDate(this.weekStart)} — ${this.formatDate(this.weekEnd)}
                    </div>
                    <button class="diary-nav-btn" id="nextWeekBtn">▶</button>
                    <button class="diary-calendar-btn" id="showMonthBtn">📅</button>
                </div>

                <!-- Сетка дней -->
                <div class="diary-week-grid">
                    ${weekdays.map((dayName, index) => {
            const day = this.days[index];
            if (!day) return '';
            const dateStr = day.date.toISOString().split('T')[0];
            const isToday = dateStr === today;
            const hasData = day.successRate !== null;
            const color = hasData ? this.getColor(day.successRate) : '#2d2d2d';
            const dayNumber = day.date.getDate();

            return `
                            <div class="diary-day ${isToday ? 'today' : ''}" 
                                 data-date="${dateStr}"
                                 style="${hasData ? `--day-color: ${color};` : ''}">
                                <div class="day-name">${dayName}</div>
                                <div class="day-number">${dayNumber}</div>
                                ${hasData ? `<div class="day-success" style="color: ${color}">${day.successRate}%</div>` : ''}
                            </div>
                        `;
        }).join('')}
                </div>

                <!-- Легенда -->
                <div class="diary-legend">
                    <span><span class="legend-dot" style="background: #4CAF50;"></span> 80-100%</span>
                    <span><span class="legend-dot" style="background: #FFC107;"></span> 40-80%</span>
                    <span><span class="legend-dot" style="background: #F44336;"></span> 0-40%</span>
                </div>

                <!-- ГРАФИК ПРОГРЕССА ЗА НЕДЕЛЮ -->
                <div class="week-progress-section">
                    <h4>📊 Прогресс за неделю</h4>
                    <div class="week-progress-grid">
                        ${this.weekProgress.length > 0 ?
                this.weekProgress.map(p => `
                                <div class="progress-item">
                                    <div class="progress-label">
                                        <span>${p.subject}</span>
                                        <span>${p.impact}%</span>
                                    </div>
                                    <div class="progress-bar-container">
                                        <div class="progress-bar-fill ${p.impact >= 0 ? 'positive' : 'negative'}" 
                                             style="width: ${Math.abs(p.impact)}%; 
                                                    background: ${p.impact >= 0 ? '#4CAF50' : '#F44336'};">
                                        </div>
                                    </div>
                                    <div class="progress-detail">
                                        ${p.count > 0 ? `Оценок: ${p.count}, средний балл: ${p.score}` : 'Нет данных'}
                                    </div>
                                </div>
                            `).join('') :
                '<p class="no-data">Нет данных за эту неделю</p>'
            }
                    </div>
                </div>
            </div>
        `;
    }

    attachWeekEvents() {
        document.getElementById('prevWeekBtn')?.addEventListener('click', () => {
            this.currentDate.setDate(this.currentDate.getDate() - 7);
            this.render();
        });

        document.getElementById('nextWeekBtn')?.addEventListener('click', () => {
            this.currentDate.setDate(this.currentDate.getDate() + 7);
            this.render();
        });

        document.getElementById('showMonthBtn')?.addEventListener('click', () => {
            this.isMonthView = !this.isMonthView;
            this.render();
        });

        document.querySelectorAll('.diary-day').forEach(el => {
            el.addEventListener('click', () => {
                const date = el.dataset.date;
                if (date) {
                    this.showDayDetails(date);
                }
            });
        });
    }

    // ========================================
    // МЕСЯЧНЫЙ ВИД
    // ========================================
    async renderMonthView() {
        const month = this.currentDate.getMonth() + 1;
        const year = this.currentDate.getFullYear();
        const data = await api.getMonthData(year, month);
        this.days = data;

        this.container.innerHTML = this.createMonthHTML();
        this.attachMonthEvents();
    }

    createMonthHTML() {
        const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        const month = this.currentDate.getMonth();
        const year = this.currentDate.getFullYear();
        const firstDay = new Date(year, month, 1);
        const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        return `
            <div class="diary-container">
                <div class="diary-controls">
                    <button class="diary-nav-btn" id="prevMonthBtn">◀</button>
                    <div class="diary-week-label">
                        ${monthNames[month]} ${year}
                    </div>
                    <button class="diary-nav-btn" id="nextMonthBtn">▶</button>
                    <button class="diary-calendar-btn active" id="showMonthBtn">📅</button>
                </div>

                <div class="diary-week-grid">
                    ${['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map(d =>
            `<div class="day-name-header">${d}</div>`
        ).join('')}
                    ${Array.from({ length: startOffset }, () =>
            `<div class="empty-day"></div>`
        ).join('')}
                    ${this.days.map(day => {
            const date = new Date(day.date);
            const dateStr = day.date.split('T')[0];
            const color = this.getColor(day.successRate);
            return `
                            <div class="diary-day month-day" 
                                 data-date="${dateStr}"
                                 style="--day-color: ${color};">
                                <div class="day-number">${date.getDate()}</div>
                                <div class="day-success" style="color: ${color}">${day.successRate}%</div>
                            </div>
                        `;
        }).join('')}
                </div>

                <div class="diary-legend">
                    <span><span class="legend-dot" style="background: #4CAF50;"></span> 80-100%</span>
                    <span><span class="legend-dot" style="background: #FFC107;"></span> 40-80%</span>
                    <span><span class="legend-dot" style="background: #F44336;"></span> 0-40%</span>
                </div>
            </div>
        `;
    }

    attachMonthEvents() {
        document.getElementById('prevMonthBtn')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.render();
        });

        document.getElementById('nextMonthBtn')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.render();
        });

        document.getElementById('showMonthBtn')?.addEventListener('click', () => {
            this.isMonthView = false;
            this.render();
        });

        document.querySelectorAll('.diary-day').forEach(el => {
            el.addEventListener('click', () => {
                const date = el.dataset.date;
                if (date) {
                    this.showDayDetails(date);
                }
            });
        });
    }

    // ========================================
    // ДЕТАЛИ ДНЯ (МОДАЛЬНОЕ ОКНО)
    // ========================================
    async showDayDetails(dateStr) {
        try {
            const data = await api.getDayData(dateStr);
            const modal = document.getElementById('dayModal');
            modal.style.display = 'block';

            const dateObj = new Date(data.date);
            document.getElementById('modalDate').textContent =
                dateObj.toLocaleDateString('ru-RU', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                });

            document.getElementById('modalSuccess').textContent =
                `Успешность дня: ${data.successRate}%`;

            const chartContainer = document.getElementById('chartContainer');

            if (data.subjects && data.subjects.length > 0) {
                chartContainer.innerHTML = data.subjects.map(subj => {
                    // Определяем комментарий в зависимости от оценки
                    let comment = '';
                    let statusIcon = '';
                    if (subj.impact >= 20) {
                        comment = 'Отлично! 🎉';
                        statusIcon = '🌟';
                    } else if (subj.impact >= 10) {
                        comment = 'Хорошо! 👍';
                        statusIcon = '✅';
                    } else if (subj.impact >= 0) {
                        comment = 'Нормально 📘';
                        statusIcon = '📘';
                    } else if (subj.impact >= -20) {
                        comment = 'Нужно подтянуть ⚠️';
                        statusIcon = '⚠️';
                    } else {
                        comment = 'Критично! 🔥';
                        statusIcon = '🔥';
                    }

                    const barColor = subj.impact >= 0 ? '#4CAF50' : '#F44336';
                    const barHeight = Math.abs(subj.impact) + 20;

                    return `
                        <div class="chart-bar-wrapper">
                            <div class="chart-bar" 
                                 style="height: ${Math.min(barHeight, 100)}px; background: ${barColor};">
                                <span class="bar-label">${subj.score}</span>
                            </div>
                            <span class="bar-subject">${subj.subject}</span>
                            <div class="bar-impact ${subj.impact >= 0 ? 'positive' : 'negative'}">
                                ${statusIcon} ${subj.impact}%
                            </div>
                            <div class="bar-comment">${comment}</div>
                        </div>
                    `;
                }).join('');
            } else {
                chartContainer.innerHTML = `
                    <div class="no-data-message">
                        📭 В этот день нет оценок
                    </div>
                `;
            }

            // Закрытие модального окна
            document.querySelector('.close').onclick = () => {
                modal.style.display = 'none';
            };
            window.onclick = (event) => {
                if (event.target === modal) {
                    modal.style.display = 'none';
                }
            };
        } catch (error) {
            alert('Ошибка: ' + error.message);
        }
    }

    // ========================================
    // ВСПОМОГАТЕЛЬНЫЕ МЕТОДЫ
    // ========================================

    getColor(success) {
        if (success > 80) return '#4CAF50';
        if (success > 40) return '#FFC107';
        return '#F44336';
    }

    getMonthName() {
        const names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        return names[this.currentDate.getMonth()];
    }
}