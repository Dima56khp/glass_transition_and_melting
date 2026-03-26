// Массив для хранения полимерных цепочек
let chains = [];
// Температура (будет меняться ползунком)
let temperature = -50;
// Тип материала: true = термопласт, false = реактопласт
let isThermoplastic = true;

function setup() {
    const cnv = createCanvas(800, 400);
    cnv.parent('canvas-host');

    for (let i = 0; i < 50; i++) {
        chains.push(new PolymerChain());
    }

    const sliderWrap = document.getElementById('slider-wrap');
    const lab = document.createElement('label');
    lab.setAttribute('for', 'temp-slider');
    lab.textContent = 'Температура (°C)';
    sliderWrap.appendChild(lab);

    const tempSlider = createSlider(-50, 250, -50);
    tempSlider.id('temp-slider');
    tempSlider.parent('slider-wrap');
    tempSlider.input(() => {
        temperature = tempSlider.value();
    });

    const matButton = createButton('Термопласт / Реактопласт');
    matButton.parent('button-wrap');
    matButton.mousePressed(() => {
        isThermoplastic = !isThermoplastic;
    });
}

function draw() {
    // Заливаем фон светло-голубым
    background(230, 240, 250);
    
    // Отображаем все полимерные цепочки
    for(let chain of chains) {
        chain.update();
        chain.display();
    }
    
    updateControlPanel();
}

function updateControlPanel() {
    const tempEl = document.getElementById('line-temp');
    const matEl = document.getElementById('line-material');
    const stateEl = document.getElementById('line-state');
    if (!tempEl || !matEl || !stateEl) return;

    tempEl.textContent = 'Температура: ' + temperature + '°C';
    matEl.textContent =
        'Материал: ' +
        (isThermoplastic ? 'Термопласт (полиэтилен)' : 'Реактопласт (эпоксидка)');

    let state = '';
    let stateColor;

    if (temperature < 20) {
        state = 'Стеклообразное состояние: цепи застывшие';
        stateColor = [100, 150, 255];
    } else if (temperature < 150) {
        if (!isThermoplastic && temperature > 80) {
            state = 'Разложение (не плавится!)';
            stateColor = [255, 100, 100];
        } else {
            state = 'Высокоэластическое состояние: цепи подвижны';
            stateColor = [255, 200, 100];
        }
    } else {
        if (isThermoplastic) {
            state = 'Вязкотекучее состояние: цепи скользят';
            stateColor = [255, 100, 100];
        } else {
            state = 'Разложение (реактопласт не плавится!)';
            stateColor = [150, 150, 150];
        }
    }

    stateEl.textContent = state;
    stateEl.style.backgroundColor =
        'rgb(' + stateColor[0] + ',' + stateColor[1] + ',' + stateColor[2] + ')';
}

// Класс для полимерной цепочки
class PolymerChain {
    constructor() {
        // Случайная начальная позиция
        this.x = random(width);
        this.y = random(height);
        // Длина цепочки (10-15 сегментов)
        this.length = floor(random(10, 15));
        // Цвет цепочки
        this.color = [random(100, 200), random(100, 200), random(100, 200)];
        // Углы для сегментов цепочки
        this.angles = [];
        for(let i = 0; i < this.length; i++) {
            this.angles.push(random(TWO_PI)); // Случайный начальный угол
        }
    }
    
    update() {
        // Для реактопластов ограничиваем движение при высоких температурах
        if(!isThermoplastic && temperature > 80) {
            return; // Реактопласт не движется при высоких температурах
        }
        
        // Определяем уровень движения в зависимости от температуры
        let movementLevel = 0;
        
        if(temperature < 20) {
            movementLevel = 0; // Нет движения
        } else if(temperature < 100) {
            movementLevel = map(temperature, 20, 100, 0.01, 0.05); // Мало движения 

        } else {
            movementLevel = map(temperature, 100, 250, 0.05, 0.2); // Сильное движение
        }
        
        // Обновляем углы сегментов (создаем дрожание)
        for(let i = 0; i < this.angles.length; i++) {
            this.angles[i] += random(-movementLevel, movementLevel);
        }
    }
    
    display() {
        // Начинаем рисовать цепочку
        stroke(this.color[0], this.color[1], this.color[2]);
        strokeWeight(2);
        noFill();
        
        // Толщина линии зависит от температуры
        if(temperature > 150 && isThermoplastic) {
            strokeWeight(1); // Тонкие линии при плавлении
        } else {
            strokeWeight(2); // Нормальные линии
        }
        
        // Рисуем цепочку как последовательность сегментов
        beginShape();
        let currentX = this.x;
        let currentY = this.y;
        vertex(currentX, currentY); // Начальная точка
        
        // Рисуем каждый сегмент цепочки
        for(let i = 0; i < this.length; i++) {
            // Длина сегмента
            let segmentLength = 15;
            
            // Для плавления термопластов увеличиваем длину сегментов
            if(temperature > 150 && isThermoplastic) {
                segmentLength = 25;
            }
            
            // Вычисляем следующую точку
            currentX += cos(this.angles[i]) * segmentLength;
            currentY += sin(this.angles[i]) * segmentLength;
            
            // Добавляем точку к форме
            vertex(currentX, currentY);
        }
        endShape();
    }
}