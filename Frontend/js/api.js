// api.js — БЕЗ IMPORT

const API_BASE = 'http://localhost:5069/api';

class ApiClient {
    constructor() {
        // ФИКСИРОВАННЫЙ GUID ИВАНА ПЕТРОВА
        this.userId = '11111111-1111-1111-1111-111111111111';
    }

    async getProfile() {
        const response = await fetch(`${API_BASE}/user/${this.userId}`);
        if (!response.ok) throw new Error('Ошибка загрузки профиля');
        return response.json();
    }

    async updateProfile(data) {
        const response = await fetch(`${API_BASE}/user/${this.userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        return response.json();
    }

    async getMonthData(year, month) {
        const response = await fetch(
            `${API_BASE}/diary/month?userId=${this.userId}&year=${year}&month=${month}`
        );
        if (!response.ok) throw new Error('Ошибка загрузки дневника');
        return response.json();
    }

    async getDayData(date) {
        const response = await fetch(
            `${API_BASE}/diary/day?userId=${this.userId}&date=${date}`
        );
        if (!response.ok) throw new Error('Ошибка загрузки дня');
        return response.json();
    }

    async getStudents(classNumber, classLetter) {
        const response = await fetch(
            `${API_BASE}/class/students?classNumber=${classNumber}&classLetter=${classLetter}`
        );
        if (!response.ok) throw new Error('Ошибка загрузки класса');
        return response.json();
    }

    async getStudentDetails(studentId) {
        const response = await fetch(`${API_BASE}/class/student/${studentId}`);
        if (!response.ok) throw new Error('Ошибка загрузки ученика');
        return response.json();
    }

    setUserId(id) {
        this.userId = id;
    }
}

// СОЗДАЕМ ГЛОБАЛЬНЫЙ ЭКЗЕМПЛЯР
const api = new ApiClient();