// js_youtube.js — адаптированная версия

document.addEventListener('DOMContentLoaded', function () {
    const sidebarToggleBtns = document.querySelectorAll(".sidebar-toggle");
    const sidebar = document.querySelector(".sidebar");
    const searchForm = document.querySelector(".search-form");
    const themeToggleBtn = document.querySelector(".theme-toggle");
    const themeIcon = themeToggleBtn?.querySelector(".theme-icon");
    const menuLinks = document.querySelectorAll(".menu-link");

    // Обновление иконки темы
    const updateThemeIcon = () => {
        if (!themeIcon) return;
        const isDark = document.body.classList.contains("dark-theme");
        themeIcon.textContent = sidebar.classList.contains("collapsed") ? (isDark ? "light_mode" : "dark_mode") : "dark_mode";
    };

    // Применение сохранённой темы
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const shouldUseDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

    document.body.classList.toggle("dark-theme", shouldUseDarkTheme);
    updateThemeIcon();

    // Переключение темы
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const isDark = document.body.classList.toggle("dark-theme");
            localStorage.setItem("theme", isDark ? "dark" : "light");
            updateThemeIcon();
        });
    }

    // Переключение сайдбара
    sidebarToggleBtns.forEach((btn) => {
        btn.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
            updateThemeIcon();
        });
    });

    // Раскрытие сайдбара при клике на поиск
    if (searchForm) {
        searchForm.addEventListener("click", () => {
            if (sidebar.classList.contains("collapsed")) {
                sidebar.classList.remove("collapsed");
                searchForm.querySelector("input")?.focus();
            }
        });
    }

    // По умолчанию на больших экранах сайдбар раскрыт
    if (window.innerWidth > 768) sidebar?.classList.remove("collapsed");

    // ========================================
    // НАВИГАЦИЯ ПО КНОПКАМ
    // ========================================

    function updateActiveLink(activeLink) {
        menuLinks.forEach(link => link.classList.remove('active'));
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    menuLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const page = this.dataset.page;
            if (page && window.app) {
                updateActiveLink(this);
                window.app.loadPage(page);
            }
        });
    });

    // Кнопка "Редактировать"
    const editToggleBtn = document.getElementById('editToggleBtn');
    if (editToggleBtn) {
        editToggleBtn.addEventListener('click', function (e) {
            e.preventDefault();
            if (window.toggleEditModeGlobal) {
                window.toggleEditModeGlobal();
            } else if (window.profileRenderer) {
                window.profileRenderer.toggleEditMode();
            }
        });
    }

    console.log('✅ js_youtube.js загружен!');
});