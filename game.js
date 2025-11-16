// --- Змінні Стану Гри ---
let currentTime = 0; // Час у хвилинах (0 = 00:00)
const maxTime = 360; // 360 хвилин = 6 годин (до 06:00 ранку)
let sanity = 100;  // Рівень глузду (виживання)
let difficulty = 'Normal'; 

// --- Інвентар та Аудіо Налаштування ---
const inventory = {
    flashlight: false, // Ліхтарик
    key: false,        // Ключ
    volume: 0.5        // Гучність звуків (від 0 до 1)
};

// --- Посилання на HTML-елементи ---
const storyText = document.getElementById('story-text');
const actionButtons = document.getElementById('action-buttons');
const timeDisplay = document.getElementById('time-display');

// --- Функція відтворення звуку ---
function playSound(file) {
    const audio = new Audio(`sounds/${file}.mp3`); 
    audio.volume = inventory.volume;
    audio.play().catch(e => console.error("Помилка відтворення звуку:", e)); 
}

// --- НОВА ФУНКЦІЯ: Активація флеш-ефекту ---
function triggerFlash() {
    const flashDiv = document.createElement('div');
    flashDiv.classList.add('flash-effect');
    document.body.appendChild(flashDiv);
    
    // Видаляємо елемент після завершення анімації
    setTimeout(() => {
        flashDiv.remove();
    }, 200);
}


// --- Функція оновлення відображення часу та стану (ОНОВЛЕНО) ---
function updateTimeDisplay() {
    const hours = Math.floor(currentTime / 60) % 24;
    const minutes = currentTime % 60;
    const timeString = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    
    // Формування тексту інвентарю
    let invText = '';
    if (inventory.flashlight) invText += '💡Ліхтарик ';
    if (inventory.key) invText += '🔑Ключ';
    
    timeDisplay.innerHTML = `Час: <strong>${timeString}</strong> | Глузд: <span style="color: ${sanity > 40 ? 'inherit' : '#ff5555'};"><strong>${sanity}%</strong></span> | Інвентар: ${invText || 'Пусто'}`;

    // --- ЛОГІКА АНІМАЦІЇ ТРЕМТІННЯ ---
    const body = document.body;
    if (sanity <= 30) {
        // Якщо глузд дуже низький, починаємо тремтіння
        body.classList.add('low-sanity');
    } else {
        // Якщо глузд нормальний, прибираємо тремтіння
        body.classList.remove('low-sanity');
    }
}

// --- Функція початку/перезапуску гри ---
function startGame(selectedDifficulty = 'Normal') {
    currentTime = 0;
    sanity = 100;
    difficulty = selectedDifficulty;
    
    if (difficulty === 'Easy') sanity = 120;
    if (difficulty === 'Hard') sanity = 80;
    
    inventory.flashlight = false;
    inventory.key = false;
    document.body.classList.remove('low-sanity'); // Скидаємо тремтіння
    
    actionButtons.innerHTML = ''; 
    storyText.innerHTML = `<p>Ви починаєте гру на рівні складності: <strong>${difficulty}</strong>. Будинок мовчить. Вам потрібно дочекатися 06:00.</p>`;
    updateTimeDisplay();
    actionButtons.innerHTML = '<button onclick="gameLoop()">Наступна Чверть Години</button>'; 
}

// --- Створення початкового екрану вибору складності ---
function createDifficultySelect() {
    storyText.innerHTML = '<h2>Оберіть Складність</h2><p>Це вплине на ваш початковий рівень глузду та шанси успіху в критичні моменти.</p>';
    actionButtons.innerHTML = 
        `<button onclick="startGame('Easy')">Легка (Глузд +20)</button>
         <button onclick="startGame('Normal')">Нормальна</button>
         <button onclick="startGame('Hard')">Складна (Глузд -20)</button>`;
}

// --- Головний Ігровий Цикл ---
function gameLoop() {
    if (sanity <= 0) {
        endGame('lost', 'Ваш розум не витримав жаху. Ви програли.');
        return;
    }
    if (currentTime >= maxTime) {
        endGame('won', 'Світанок прийшов! Ви дочекалися 06:00. Ви вижили!');
        return;
    }

    currentTime += 30; // Пройшло 30 хвилин
    updateTimeDisplay();
    actionButtons.innerHTML = '';
    
    const hour = Math.floor(currentTime / 60);
    const minute = currentTime % 60;

    // --- Події на основі Часу ---
    
    if (hour === 0 && minute === 30) {
        storyText.innerHTML += '<p><strong>00:30:</strong> Ви чуєте тихий, ледь помітний крок на першому поверсі.</p>';
        playSound('step');
        actionButtons.innerHTML = 
            `<button onclick="handleAction('hide')">Сховатися під ковдрою</button>
             <button onclick="handleAction('listen')">Прислухатися (Ризик)</button>`;

    } else if (hour === 1 && minute === 0) {
        storyText.innerHTML += '<p><strong>01:00:</strong> Ви вирішили встати, щоб розім\'яти ноги. На тумбочці ви знаходите **Ліхтарик**.</p>';
        inventory.flashlight = true;
        updateTimeDisplay();
        actionButtons.innerHTML = 
            `<button onclick="handleAction('check_phone')">Перевірити телефон</button>
             <button onclick="handleAction('use_flashlight')">Оглянути кімнату Ліхтариком</button>`;
        
    } else if (hour === 2 && minute === 30) {
        storyText.innerHTML += '<p><strong>02:30:</strong> Лунає дзвінок старого телефону. Він знаходиться на першому поверсі. Йти чи ігнорувати?</p>';
        playSound('ring');
        actionButtons.innerHTML = 
            `<button onclick="handleAction('answer_call')">Піти і відповісти (Великий Ризик)</button>
             <button onclick="handleAction('ignore_call')">Ігнорувати</button>`;

    } else if (hour === 3 && minute === 30) {
        storyText.innerHTML += '<p><strong>03:30:</strong> Ваші двері повільно, зі скрипом, починають відчинятися. Ви повинні діяти швидко!</p>';
        playSound('door_creak');
        
        let doorActions = '';
        if (inventory.key) {
            doorActions += `<button onclick="handleAction('lock_door')">Замкнути двері КЛЮЧЕМ (Безпечно)</button>`;
        }
        doorActions += `<button onclick="handleAction('push_door')">Штовхнути двері і бігти</button>`;
        
        actionButtons.innerHTML = doorActions;
        
    } else if (hour === 5 && minute === 0) {
        storyText.innerHTML += '<p><strong>05:00:</strong> Морок згущується. Прямо перед вами з\'явилася тінь, що стогне. Кричати чи мовчати?</p>';
        playSound('moan');
        actionButtons.innerHTML = 
            `<button onclick="handleAction('scream')">Кричати</button>
             <button onclick="handleAction('freeze')">Завмерти, мовчати (Ризик)</button>`;

    } else {
        storyText.innerHTML += `<p><strong>${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}</strong>. Наразі тихо. Ви продовжуєте чекати.</p>`;
        actionButtons.innerHTML = '<button onclick="gameLoop()">Продовжувати Чекати</button>';
    }
}

// --- Функція обробки дії гравця ---
function handleAction(action) {
    let outcome = '';
    let successChance = 0.5; 
    
    if (difficulty === 'Easy') successChance += 0.2; 
    if (difficulty === 'Hard') successChance -= 0.2;
    
    const random = Math.random(); 

    switch (action) {
        case 'hide':
            outcome = 'Ви ховаєтеся. Кроки стихають. Ви втрачаєте 5 одиниць глузду від страху.';
            sanity -= 5;
            break;
            
        case 'listen':
            if (random < successChance) {
                outcome = 'Ви чітко чуєте, що це був лише старий будинок, що осідає. Глузд +10.';
                sanity += 10;
            } else {
                outcome = 'Ви чуєте тихий, низький стогін... Він був дуже близько. Глузд -15.';
                sanity -= 15;
            }
            break;
            
        case 'use_flashlight':
            if (inventory.flashlight) {
                outcome = 'Ви різко вмикаєте ліхтарик. Світло відганяє тінь. Глузд +10.';
                sanity += 10;
                if (!inventory.key) {
                    inventory.key = true;
                    outcome += '<br>На світлі ви бачите, що з-під шафи випав **КЛЮЧ**!';
                }
                
            } else {
                outcome = 'У вас немає ліхтарика. Глузд -5.';
                sanity -= 5;
            }
            break;
            
        case 'check_phone':
            outcome = 'Телефон не має мережі. Марна спроба. Глузд -5.';
            sanity -= 5;
            break;
            
        case 'answer_call':
            if (random < 0.1) {
                outcome = 'Ви чуєте лише шум, але він заспокоює. Ви здобули Ключ.';
                inventory.key = true;
                sanity += 5;
            } else {
                outcome = 'На тому кінці ви чуєте щось жахливе. Провал. Глузд -50.';
                sanity -= 50;
                playSound('jump_scare');
                triggerFlash(); // <--- АКТИВАЦІЯ ФЛЕШУ!
            }
            break;

        case 'ignore_call':
            outcome = 'Ви вирішили ігнорувати дзвінок. Він триває, але ви залишаєтесь у безпеці. Глузд -5 (від нервів).';
            sanity -= 5;
            break;

        case 'lock_door':
            if (inventory.key) {
                outcome = 'Ви швидко вставляєте ключ і замикаєте двері. Чуєте лютий стукіт ззовні, але ви в безпеці. Глузд +20.';
                sanity += 20;
                playSound('lock');
            } else {
                 outcome = 'У вас немає ключа, двері виламують! Глузд -40.';
                 sanity -= 40;
                 playSound('jump_scare');
                 triggerFlash(); // <--- АКТИВАЦІЯ ФЛЕШУ!
            }
            break;
            
        case 'push_door':
            if (random < 0.3) { 
                outcome = 'Ви сильно штовхаєте, і двері зачиняються. Ви виграли час. Глузд +5.';
                sanity += 5;
            } else {
                outcome = 'Не вдалося, воно заблокувало двері. Ваше серце шалено б\'ється. Глузд -20.';
                sanity -= 20;
            }
            break;
            
        case 'scream':
            outcome = 'Крик злякав вас більше, ніж тінь. Тінь зникла, але ви виснажені. Глузд -10.';
            sanity -= 10;
            break;
            
        case 'freeze':
            if (random < successChance) {
                outcome = 'Ви завмерли, зливаючись із темрявою. Тінь проходить повз вас, не помічаючи. Глузд +15.';
                sanity += 15;
            } else {
                outcome = 'Ваше дихання видало вас. Воно дивиться прямо на вас. Глузд -30.';
                sanity -= 30;
                playSound('jump_scare');
                triggerFlash(); // <--- АКТИВАЦІЯ ФЛЕШУ!
            }
            break;

        default:
            outcome = 'Незрозуміла дія.';
    }
    
    // Обмеження глузду
    if (sanity > 100) sanity = 100;

    storyText.innerHTML += `<p><em>${outcome}</em></p>`;
    actionButtons.innerHTML = '<button onclick="gameLoop()">Наступна Чверть Години</button>'; 
}

// --- Функція закінчення гри (ОНОВЛЕНО) ---
function endGame(status, message) {
    let statusColor = status === 'won' ? '#32cd32' : '#ff3333';
    
    // Використовуємо клас typewriter для ефекту друку
    storyText.innerHTML = `<div class="typewriter"><h2 style="color: ${statusColor};">${message}</h2></div>`;
    
    actionButtons.innerHTML = '<button onclick="createDifficultySelect()">Грати Знову</button>';
    timeDisplay.textContent = 'Гра Закінчена';
    document.body.classList.remove('low-sanity'); // Скидаємо тремтіння
    
    // Видаляємо клас typewriter після завершення анімації, щоб не заважав
    setTimeout(() => {
        const typewriterDiv = document.querySelector('.typewriter');
        if (typewriterDiv) {
            typewriterDiv.querySelector('h2').style.borderRight = 'none'; // Видаляємо курсор
        }
    }, 4000); 
}

// Ініціалізація: показуємо екран вибору складності
createDifficultySelect();