// script.js - объединенный файл для сайта C++ PRO

// ==================== СИСТЕМА ВКЛАДОК ====================
function initTabs() {
    const navLinks = document.querySelectorAll('.nav-link');
    const tabs = document.querySelectorAll('.tab-content');

    // Сначала скрываем все вкладки кроме активной
    tabs.forEach(tab => {
        if (!tab.classList.contains('active')) {
            tab.style.display = 'none';
        }
    });

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Убираем активный класс у всех ссылок
            navLinks.forEach(l => l.style.color = '#ffffff');
            // Добавляем активный класс нажатой ссылке
            link.style.color = '#00d8ff';

            const tabId = link.dataset.tab;
            
            // Скрываем все вкладки
            tabs.forEach(tab => {
                tab.style.display = 'none';
                tab.classList.remove('active');
            });
            
            // Показываем выбранную вкладку
            const activeTab = document.getElementById(tabId);
            if (activeTab) {
                activeTab.style.display = 'block';
                activeTab.classList.add('active');
                
                // Плавная прокрутка к секции
                activeTab.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==================== AI АССИСТЕНТ ====================
function initAssistant() {
    const chatMessages = document.getElementById('chatMessages');
    const userInput = document.getElementById('userInput');
    const sendBtn = document.getElementById('sendBtn');
    const suggestionBtns = document.querySelectorAll('.suggestion-btn');

    // Отправка сообщения по клику
    sendBtn.addEventListener('click', function() {
        const message = userInput.value.trim();
        if (!message) return;

        // Добавляем сообщение пользователя
        addMessage('user', message);
        userInput.value = '';
        sendBtn.disabled = true;

        // Показываем индикатор набора
        const typingIndicator = addTypingIndicator();

        // Используем настоящий AI вместо имитации
        getAIResponse(message)
            .then(aiResponse => {
                // Убираем индикатор
                typingIndicator.remove();
                // Добавляем ответ от AI
                addMessage('assistant', aiResponse);
            })
            .catch(error => {
                // Убираем индикатор
                typingIndicator.remove();
                // Добавляем сообщение об ошибке
                addMessage('assistant', `Ошибка: ${error.message}. Попробуйте еще раз.`);
            })
            .finally(() => {
                sendBtn.disabled = false;
            });
    });
    
    // Отправка сообщения по Enter
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendBtn.click();
        }
    });

    // Кнопки-подсказки
    suggestionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            userInput.value = btn.dataset.question;
            sendBtn.click();
        });
    });

    // Функция добавления сообщения в чат
    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.textContent = text;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    // Индикатор набора текста
    function addTypingIndicator() {
        const indicator = document.createElement('div');
        indicator.className = 'message assistant-message';
        indicator.textContent = 'Ассистент печатает...';
        indicator.style.color = '#8b949e';
        indicator.style.fontStyle = 'italic';
        chatMessages.appendChild(indicator);
        chatMessages.scrollTop = chatMessages.scrollHeight;
        return indicator;
    }

    // Функция AI ответа с исправленным try/catch
    async function getAIResponse(message) {
        try {
            const response = await fetch('/.netlify/functions/ai-assistant', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message })
            });

            if (!response.ok) {
                throw new Error(`Network error: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }

            return data.response;
        } catch (error) {
            console.error('Error:', error);
            throw error; // Пробрасываем ошибку дальше
        }
    }
}

// ==================== ПЛАВНАЯ ПРОКРУТКА ====================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==================== ФИКСИРОВАННАЯ НАВИГАЦИЯ ====================
function initNavbarScroll() {
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(0, 0, 0, 0.95)';
        } else {
            navbar.style.background = '#000000';
        }
    });
}

// ==================== ПЕРЕХОДЫ МЕЖДУ УРОКАМИ ====================
function initLessonNavigation() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.lesson-item')) {
            const lessonItem = e.target.closest('.lesson-item');
            lessonItem.style.opacity = '0.7';
            setTimeout(() => {
                lessonItem.style.opacity = '1';
            }, 300);
        }
    });
}

// ==================== ИНИЦИАЛИЗАЦИЯ ВСЕГО ПРИ ЗАГРУЗКЕ ====================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 C++ PRO сайт загружается...');
    
    initTabs();
    initAssistant();
    initSmoothScroll();
    initNavbarScroll();
    initLessonNavigation();
    
    console.log('✅ Все системы запущены!');
});