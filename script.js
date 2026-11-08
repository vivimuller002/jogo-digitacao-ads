const phasesConfig = {
    1: {
        name: "Fase 1: Fundamentos Web",
        words: ["HTML", "CSS", "GIT", "INDEX", "LINK"],
        fallSpeed: 0.4,    // O bloco cai BEM mais devagar (antes era 1.0)
        spawnSpeed: 3500,  // Demora 3.5 segundos para surgir uma nova palavra (antes era 2.2s)
        targetScore: 60,
        color: "#00f0ff"
    },
    2: {
        name: "Fase 2: Banco de Dados",
        words: ["SQL", "DER", "DATABASE", "ARRAY", "LOGICA", "TABLE"],
        fallSpeed: 1.2,    // Aumenta o ritmo na fase 2
        spawnSpeed: 2000,
        targetScore: 150,
        color: "#ffaa00"
    },
    3: {
        name: "Fase 3: Programação Avançada",
        words: ["PYTHON", "VSCODE", "ALGORITMO", "COMPILER", "FUNCTION"],
        fallSpeed: 2.0,    // O desafio final
        spawnSpeed: 1200,
        targetScore: 250,
        color: "#39ff14"
    }
};

let currentPhase = 1;
let score = 0;
let lives = 3;
let activeWords = [];
let gameInterval;
let spawnInterval;
let gameState = "START";

const gameContainer = document.getElementById("game-container");
const inputField = document.getElementById("input-field");
const scoreDisplay = document.getElementById("score-display");
const phaseDisplay = document.getElementById("phase-display");
const livesDisplay = document.getElementById("lives-display");
const progressBar = document.getElementById("progress-bar");

const overlayScreen = document.getElementById("overlay-screen");
const overlayTitle = document.getElementById("overlay-title");
const overlayText = document.getElementById("overlay-text");
const overlayButton = document.getElementById("overlay-button");

function spawnWord() {
    if (lives <= 0 || gameState !== "PLAYING") return;
    
    const config = phasesConfig[currentPhase];
    const randomText = config.words[Math.floor(Math.random() * config.words.length)];
    
    const wordEl = document.createElement("div");
    wordEl.classList.add("word-block");
    wordEl.innerText = randomText;
    wordEl.style.borderColor = config.color;
    wordEl.style.boxShadow = `0 0 10px ${config.color}`;
    
    const xPos = Math.random() * (gameContainer.clientWidth - 140) + 70;
    wordEl.style.left = `${xPos}px`;
    wordEl.style.top = "0px";
    
    gameContainer.appendChild(wordEl);
    
    activeWords.push({
        element: wordEl,
        text: randomText.toLowerCase(),
        top: 0
    });
}

function updateGame() {
    if (gameState !== "PLAYING") return;
    const config = phasesConfig[currentPhase];

    for (let i = activeWords.length - 1; i >= 0; i--) {
        const word = activeWords[i];
        word.top += config.fallSpeed;
        word.element.style.top = `${word.top}px`;
        
        if (word.top > gameContainer.clientHeight - 40) {
            word.element.remove();
            activeWords.splice(i, 1);
            lives--;
            updateUI();
            
            if (lives <= 0) {
                triggerGameOver();
            }
        }
    }
}

function updateUI() {
    const config = phasesConfig[currentPhase];
    scoreDisplay.innerText = `PONTOS: ${score}`;
    phaseDisplay.innerText = `FASE: ${currentPhase}`;
    livesDisplay.innerText = `VIDAS: ${"❤".repeat(Math.max(0, lives))}`;
    
    let prevTarget = currentPhase === 1 ? 0 : phasesConfig[currentPhase - 1].targetScore;
    let currentProgress = ((score - prevTarget) / (config.targetScore - prevTarget)) * 100;
    progressBar.style.width = `${Math.min(100, Math.max(0, currentProgress))}%`;
    progressBar.style.background = config.color;
    progressBar.style.boxShadow = `0 0 8px ${config.color}`;
}

inputField.addEventListener("input", (e) => {
    if (gameState !== "PLAYING") return;

    const typedText = e.target.value.toLowerCase().trim();
    const matchedIndex = activeWords.findIndex(w => w.text === typedText);
    
    if (matchedIndex !== -1) {
        const wordToDestroy = activeWords[matchedIndex];
        wordToDestroy.element.style.borderColor = "#39ff14";
        wordToDestroy.element.style.boxShadow = "0 0 20px #39ff14";
        
        setTimeout(() => { wordToDestroy.element.remove(); }, 100);
        
        activeWords.splice(matchedIndex, 1);
        score += 10;
        inputField.value = "";
        updateUI();
        checkPhaseProgress();
    }
});

function checkPhaseProgress() {
    const currentTarget = phasesConfig[currentPhase].targetScore;

    if (score >= currentTarget) {
        clearInterval(spawnInterval);
        if (phasesConfig[currentPhase + 1]) {
            gameState = "PHASE_CLEAR";
            showOverlay("FASE CONCLUÍDA!", `Módulo de ${phasesConfig[currentPhase].name} concluído. Pronto para avançar?`, "Avançar Fase");
        } else {
            gameState = "WIN";
            showOverlay("VITÓRIA TOTAL! 🎉", `Parabéns! Você dominou o DevStorm e fez ${score} pontos.`, "Jogar de Novo");
        }
    }
}

function triggerGameOver() {
    gameState = "GAMEOVER";
    clearInterval(gameInterval);
    clearInterval(spawnInterval);
    showOverlay("FIM DE JOGO", `Suas vidas acabaram. Pontuação final: ${score}`, "Tentar Novamente");
}

function showOverlay(title, text, buttonLabel) {
    overlayTitle.innerText = title;
    overlayText.innerText = text;
    overlayButton.innerText = buttonLabel;

    if (gameState === "GAMEOVER") overlayTitle.style.color = "#ff007f";
    else if (gameState === "WIN") overlayTitle.style.color = "#39ff14";
    else overlayTitle.style.color = "#00f0ff";

    overlayScreen.style.display = "flex";
    inputField.disabled = true;
}

function handleOverlayAction() {
    if (gameState === "START" || gameState === "GAMEOVER" || gameState === "WIN") {
        currentPhase = 1;
        score = 0;
        lives = 3;
        startPhase();
    } else if (gameState === "PHASE_CLEAR") {
        currentPhase++;
        startPhase();
    }
}

function startPhase() {
    activeWords.forEach(w => w.element.remove());
    activeWords = [];

    const config = phasesConfig[currentPhase];
    gameContainer.style.borderColor = config.color;
    gameContainer.style.boxShadow = `0 0 15px ${config.color}33, inset 0 0 15px ${config.color}11`;

    gameState = "PLAYING";
    overlayScreen.style.display = "none";
    inputField.disabled = false;
    inputField.value = "";
    inputField.focus();

    updateUI();

    clearInterval(gameInterval);
    clearInterval(spawnInterval);

    gameInterval = setInterval(updateGame, 1000 / 60);
    spawnInterval = setInterval(spawnWord, config.spawnSpeed);
}

gameState = "START";
showOverlay("💡 DevStorm Acadêmico", "Treine seus reflexos digitando os termos de programação antes que caiam!", "Iniciar Jogo");
