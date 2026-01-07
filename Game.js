const bridge = vkBridge.default;
bridge.send("VKWebAppInit");

const size = 5;
let score = 0;
let selectedCells = [];
let placedCell = null; // Хранит координаты временно поставленной буквы
let gameState = 'PLACE'; // PLACE - ставим букву, SELECT - выбираем слово

const board = [
    ['', '', '', '', ''],
    ['', '', '', '', ''],
    ['Б', 'А', 'Л', 'Д', 'А'],
    ['', '', '', '', ''],
    ['', '', '', '', '']
];

function initGame() {
    renderGrid();
    bridge.send("VKWebAppGetUserInfo").then(data => {
        document.getElementById('user-info').textContent = `Игрок: ${data.first_name}`;
    });
}

function renderGrid() {
    const grid = document.getElementById('grid');
    grid.innerHTML = '';
    
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            if (placedCell && placedCell.r === r && placedCell.c === c) {
                cell.classList.add('placed'); // Подсветка новой буквы
                cell.textContent = placedCell.char;
            } else {
                cell.textContent = board[r][c];
            }
            
            // Проверка, выделена ли клетка для слова
            if (selectedCells.some(s => s.r === r && s.c === c)) {
                cell.classList.add('selected');
            }

            cell.onclick = () => handleCellClick(r, c);
            grid.appendChild(cell);
        }
    }
}

function handleCellClick(r, c) {
    if (gameState === 'PLACE') {
        if (board[r][c] === '') {
            const char = prompt("Введите одну букву:");
            if (char && char.length === 1) {
                placedCell = { r, c, char: char.toUpperCase() };
                gameState = 'SELECT';
                updateStatus("Теперь выделите слово (включая новую букву)");
                renderGrid();
            }
        }
    } else if (gameState === 'SELECT') {
        const char = (placedCell.r === r && placedCell.c === c) ? placedCell.char : board[r][c];
        
        if (char === '') return;

        // Логика выделения слова (соседние клетки)
        const last = selectedCells[selectedCells.length - 1];
        if (!last || (Math.abs(last.r - r) + Math.abs(last.c - c) === 1)) {
            if (!selectedCells.some(s => s.r === r && s.c === c)) {
                selectedCells.push({ r, c, char });
                renderGrid();
            }
        }
        document.querySelector('#current-word span').textContent = selectedCells.map(s => s.char).join('');
    }
}

function submitWord() {
    const word = selectedCells.map(i => i.char).join('');
    const includesNewLetter = selectedCells.some(s => s.r === placedCell.r && s.c === placedCell.c);

    if (!includesNewLetter) {
        alert("Слово должно содержать новую букву!");
        return;
    }

    // Сохраняем букву на поле навсегда
    board[placedCell.r][placedCell.c] = placedCell.char;
    score += word.length;
    document.getElementById('score').textContent = `Счёт: ${score}`;
    
    resetTurn();
    alert(`Слово "${word}" принято!`);
}

function resetTurn() {
    placedCell = null;
    selectedCells = [];
    gameState = 'PLACE';
    updateStatus("Поставьте букву на пустую клетку");
    document.querySelector('#current-word span').textContent = '---';
    renderGrid();
}

function updateStatus(text) {
    // Можно добавить элемент в HTML для вывода подсказок
    console.log(text);
}

initGame();
