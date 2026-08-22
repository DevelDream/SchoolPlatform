const API_BASE = 'http://localhost:5069/api';

class ApiClient {
    constructor() {
        // Реальный GUID из списка класса
        this.userId = '6f676f8e-c084-4865-ad70-2be95a68ae14';
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

const api = new ApiClient();