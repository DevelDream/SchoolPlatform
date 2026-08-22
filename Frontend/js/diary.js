class DiaryRenderer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.currentMonth = new Date().getMonth() + 1;
        this.currentYear = new Date().getFullYear();
    }

    async render() {
        try {
            const data = await api.getMonthData(this.currentYear, this.currentMonth);
            this.days = data;
            this.createGrid();
        } catch (error) {
            this.container.innerHTML = `<p style="color:red;">Ошибка: ${error.message}</p>`;
        }
    }

    createGrid() {
        this.container.innerHTML = `
            <div class="diary-header">
                <button onclick="diary.prevMonth()">←</button>
                <h2>${this.getMonthName()} ${this.currentYear}</h2>
                <button onclick="diary.nextMonth()">→</button>
            </div>
            <div class="weekdays">
                ${['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => `<div class="weekday">${d}</div>`).join('')}
            </div>
            <div class="days-grid">
                ${this.renderDays()}
            </div>
        `;

        document.querySelectorAll('.day-slot').forEach(el => {
            el.addEventListener('click', () => {
                const date = el.dataset.date;
                this.showDayDetails(date);
            });
        });
    }

    renderDays() {
        const firstDay = new Date(this.currentYear, this.currentMonth - 1, 1);
        const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;

        let html = '';
        for (let i = 0; i < startOffset; i++) {
            html += `<div class="empty-slot"></div>`;
        }

        this.days.forEach(day => {
            const color = this.getColor(day.successRate);
            const dateStr = day.date.split('T')[0];
            html += `
                <div class="day-slot" 
                     style="background-color: ${color}"
                     data-date="${dateStr}">
                    <span class="day-number">${new Date(day.date).getDate()}</span>
                    <span class="day-success">${day.successRate}%</span>
                </div>
            `;
        });

        return html;
    }

    getColor(success) {
        if (success > 80) return '#4CAF50';
        if (success > 40) return '#FFC107';
        return '#F44336';
    }

    async showDayDetails(dateStr) {
        try {
            const data = await api.getDayData(dateStr);
            const modal = document.getElementById('dayModal');
            modal.style.display = 'block';

            document.getElementById('modalDate').textContent =
                new Date(data.date).toLocaleDateString('ru-RU', {
                    day: 'numeric', month: 'long', year: 'numeric'
                });

            document.getElementById('modalSuccess').textContent =
                `Успешность: ${data.successRate}%`;

            const chartContainer = document.getElementById('chartContainer');
            chartContainer.innerHTML = data.subjects.map(subj => `
                <div class="chart-bar-wrapper">
                    <div class="chart-bar" 
                         style="height: ${Math.abs(subj.impact) + 20}px; background: ${subj.impact > 0 ? '#4CAF50' : '#F44336'};">
                        <span class="bar-label">${subj.score}</span>
                    </div>
                    <span class="bar-subject">${subj.subject}</span>
                </div>
            `).join('');

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

    getMonthName() {
        const names = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
            'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
        return names[this.currentMonth - 1];
    }

    prevMonth() {
        this.currentMonth--;
        if (this.currentMonth < 1) {
            this.currentMonth = 12;
            this.currentYear--;
        }
        this.render();
    }

    nextMonth() {
        this.currentMonth++;
        if (this.currentMonth > 12) {
            this.currentMonth = 1;
            this.currentYear++;
        }
        this.render();
    }
}

let diary;