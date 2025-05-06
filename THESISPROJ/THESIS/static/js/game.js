let animationInterval = null;

// === Step 1: Get URL Params ===
const urlParams = new URLSearchParams(window.location.search);
let selectedMap = urlParams.get('map') || 'multiplication';
let selectedStage = parseInt(urlParams.get('stage'), 10) || 1;
let selectedStageKey = 'stage' + selectedStage;

// === Default Difficulty per Map ===
let mapDifficulty = {
  multiplication: 'easy',
  addition: 'easy',
  subtraction: 'easy',
  division: 'easy',
  counting: 'easy',
  comparison: 'easy',
  numerals: 'easy',
  placevalue: 'easy',
};

// === Load Difficulty ===
let currentDifficulty = loadDifficultyForMap(selectedMap);

// === INITIAL LOAD ===
window.addEventListener('DOMContentLoaded', () => {
  loadProgress();
  initMapAndStage();
  updateHealthBars();
  
  console.log(`Selected Map: ${selectedMap}`);
  console.log(`Selected Stage: ${selectedStageKey}`);
  console.log(`Current Difficulty: ${currentDifficulty}`);
  
  fetchNewQuestion();  // Now call this after ensuring progress is loaded
});

// === Progress Functions ===
function loadProgress() {
  const savedProgress = JSON.parse(localStorage.getItem('gameProgress'));

  if (savedProgress) {
    if (!urlParams.get('map')) {
      selectedMap = savedProgress.selectedMap;
    }

    if (!urlParams.get('stage')) {
      selectedStageKey = savedProgress.selectedStageKey;
    }

    mapDifficulty = savedProgress.mapDifficulty;

    // Log the previous map's answer counts before switching to a new one
    if (savedProgress[selectedMap]) {
      console.log(`📝 Loaded previous progress for ${selectedMap}: Correct Answers: ${savedProgress[selectedMap].correctAnswersCount}, Wrong Answers: ${savedProgress[selectedMap].wrongAnswersCount}, Total Questions Answered: ${savedProgress[selectedMap].totalQuestionsAnswered}`);

      // Load counts for the current map
      correctAnswersCount = savedProgress[selectedMap].correctAnswersCount || 0;
      wrongAnswersCount = savedProgress[selectedMap].wrongAnswersCount || 0;
      totalQuestionsAnswered = savedProgress[selectedMap].totalQuestionsAnswered || 0;
    }
  }
}


// === Saving Progress ===
function saveProgress() {
  const savedProgress = JSON.parse(localStorage.getItem('gameProgress')) || {};

  // Save counts per map
  if (!savedProgress[selectedMap]) {
    savedProgress[selectedMap] = {
      correctAnswersCount: 0,
      wrongAnswersCount: 0,
      totalQuestionsAnswered: 0
    };
  }

  // Update the progress for the current map
  savedProgress[selectedMap].correctAnswersCount = correctAnswersCount;
  savedProgress[selectedMap].wrongAnswersCount = wrongAnswersCount;
  savedProgress[selectedMap].totalQuestionsAnswered = totalQuestionsAnswered;

  // Log the progress for the current map
  console.log(`💾 Progress saved for ${selectedMap}: Correct Answers: ${correctAnswersCount}, Wrong Answers: ${wrongAnswersCount}, Total Questions Answered: ${totalQuestionsAnswered}`);

  // Save map-specific progress
  localStorage.setItem('gameProgress', JSON.stringify(savedProgress));
}


function switchMap(newMap) {
  // Before switching, save the current map progress
  saveProgress();

  // Log the switch
  console.log(`🔄 Switching from ${selectedMap} to ${newMap}`);

  // Now switch to the new map and load the new progress
  selectedMap = newMap;
  loadProgress();  // Load progress for the new map
  fetchNewQuestion();  // Get a new question for the new map
}







function loadDifficultyForMap(mapName) {
  let savedDifficulty = localStorage.getItem(`${mapName}-difficulty`);
  if (!savedDifficulty) {
    savedDifficulty = mapDifficulty[mapName];  // Default difficulty per map
    localStorage.setItem(`${mapName}-difficulty`, savedDifficulty);
  }
  console.log(`✅ Loaded difficulty for ${mapName}: ${savedDifficulty}`);
  return savedDifficulty;
}

// === Difficulty Evaluation ===
function evaluateDifficulty(correctAnswers, totalQuestionsAnswered) {
  if (totalQuestionsAnswered >= 10) {
    console.log(`Evaluating difficulty... Correct: ${correctAnswers}, Total: ${totalQuestionsAnswered}`);

    if (correctAnswers >= 8) {
      console.log("✅ Increasing difficulty");
      return getNextDifficulty(currentDifficulty);  // Increase difficulty
    }
    if (correctAnswers >= 5) {
      console.log("✅ Staying at current difficulty");
      return currentDifficulty; // Stay the same
    }
    console.log("✅ Decreasing difficulty");
    return getPreviousDifficulty(currentDifficulty); // Decrease difficulty
  }
  return currentDifficulty;  // If we haven't reached 10 questions, return current difficulty
}


function getNextDifficulty(currentDifficulty) {
  if (!['easy', 'normal', 'hard', 'extreme'].includes(currentDifficulty)) {
    console.error("Invalid currentDifficulty:", currentDifficulty);
    return 'easy';  // Default to 'easy' if the difficulty is invalid
  }
  const levels = ['easy', 'normal', 'hard', 'extreme'];
  const index = levels.indexOf(currentDifficulty);
  return levels[Math.min(index + 1, levels.length - 1)];
}

function getPreviousDifficulty(currentDifficulty) {
  if (!['easy', 'normal', 'hard', 'extreme'].includes(currentDifficulty)) {
    console.error("Invalid currentDifficulty:", currentDifficulty);
    return 'easy';  // Default to 'easy' if the difficulty is invalid
  }
  const levels = ['easy', 'normal', 'hard', 'extreme'];
  const index = levels.indexOf(currentDifficulty);
  return levels[Math.max(index - 1, 0)];
}

// === Question Fetching ===
function fetchNewQuestion() {
  const qText = document.getElementById('question-text');
  const cAns = document.getElementById('correct-answer');
  const fb = document.getElementById('feedback');

  currentDifficulty = loadDifficultyForMap(selectedMap);

  if (!questions[selectedMap] || !questions[selectedMap][selectedStageKey]) {
    console.error("❌ No questions available for the selected map or stage.");
    return;
  }

  const stageQuestions = questions[selectedMap][selectedStageKey][currentDifficulty];
  if (stageQuestions && stageQuestions.length > 0) {
    const randomIndex = Math.floor(Math.random() * stageQuestions.length);
    const selectedQuestion = stageQuestions[randomIndex];

    qText.innerText = selectedQuestion.question_text;
    cAns.value = selectedQuestion.correct_answer;
    fb.innerText = ''; // Clear feedback

    // Call autoResizeFont AFTER setting the question text
    setTimeout(() => {
      autoResizeFont(qText);
    }, 0);

  } else {
    console.error("❌ No questions available for this difficulty.");
    qText.innerText = 'No question available.';
    cAns.value = '';
    fb.innerText = '';
  }
}

function autoResizeFont(element) {
  let fontSize = 7; // Start with a base font size (in vh)
  element.style.fontSize = fontSize + 'vh'; // Set the initial font size

  // Shrink font until it fits or until minimum size (e.g., 2vh)
  while (element.scrollHeight > element.offsetHeight && fontSize > 2) {
    fontSize -= 0.5;  // Decrease font size by 0.5vh
    element.style.fontSize = fontSize + 'vh';  // Apply the new font size
  }
}

// === Answer Handling ===
let correctAnswersCount = 0;
let wrongAnswersCount = 0;
let totalQuestionsAnswered = 0;


function handleAttack() {
  const input = document.getElementById('number-input').value.trim();
  const answer = document.getElementById('correct-answer').value.trim();
  const feedbackMessage = document.getElementById('feedback-message');

  if (input === '') {
    displayFeedback('Please enter a number!');
    return;
  }

  const isCorrect = parseFloat(input) === parseFloat(answer);

  // Call handleAnswer to show the speech bubble based on whether the answer is correct or not
  handleAnswer(input, answer);

  // Update progress whether the answer is correct or not
  totalQuestionsAnswered++;

  // Handle correct answer
  if (isCorrect) {
    fireballAttack(() => {
      // Fireball has completed; decrease freeze turns only after fireball animation
      decreaseFreezeTurns();
    });
    correctAnswersCount++;
    console.log(`✅ Answered ${totalQuestionsAnswered} questions. Correct: ${correctAnswersCount}, Wrong: ${wrongAnswersCount}`);

    // Apply correct class and display feedback
    feedbackMessage.textContent = "✅ Correct!";
    feedbackMessage.classList.remove('wrong');
    feedbackMessage.classList.add('correct');
    feedbackMessage.style.display = 'inline-block'; // Make feedback message visible
    feedbackMessage.classList.add('fade-in'); // Add fade-in class to animate

  } else {
    wrongAnswersCount++;

    if (freezeTurns <= 0) {
      monsterAttack(); // Monster attack happens if no freeze
    } else {
      console.log("❄️ Monster is frozen — no damage to player.");
    }

    // ** Immediately decrease freeze turns when the answer is incorrect **
    decreaseFreezeTurns();

    // Apply wrong class and display feedback
    feedbackMessage.textContent = "❌ Incorrect answer!";
    feedbackMessage.classList.remove('correct');
    feedbackMessage.classList.add('wrong');
    feedbackMessage.style.display = 'inline-block'; // Make feedback message visible
    feedbackMessage.classList.add('fade-in'); // Add fade-in class to animate
  }

  // Hide feedback message after 4 seconds
  setTimeout(() => {
    feedbackMessage.classList.remove('fade-in'); // Remove fade-in class
    feedbackMessage.classList.add('fade-out'); // Add fade-out class for animation

    // Wait for fade-out to finish, then hide the element
    setTimeout(() => {
      feedbackMessage.style.display = 'none'; // Hide feedback message
    }, 500); // Adjust this time to match the fade-out duration
  }, 3000); // 4000ms = 4 seconds

  if (wrongAnswersCount >= 1) {
    wrongAnswersCount = 0;
  }

  // Update difficulty after 10 questions answered, based on correct answers
  if (totalQuestionsAnswered >= 10) {
    currentDifficulty = evaluateDifficulty(correctAnswersCount, totalQuestionsAnswered);
    updateDifficulty(); // Save updated difficulty to localStorage
    resetCounters(); // Reset counters for the next round
  }

  // Save progress after each question
  saveProgress();
  fetchNewQuestion(); // Always fetch a new question after answering
  document.getElementById('number-input').value = '';  // Clear input
}




// Helper function to handle freeze turn decrement
function decreaseFreezeTurns() {
  if (freezeTurns > 0) {
    freezeTurns--;
    updateFreezeTurnsDisplay(); // Update the display to show remaining freeze turns

    // If freeze turns reach 0, remove the effect
    if (freezeTurns === 0) {
      setTimeout(() => {
        removeFreezeEffect();
        freezeTurnsDisplay.style.display = 'none';
        console.log("⏹ Freeze effect has ended.");
      }, 1100);
    }
  }
}









// === Difficulty Update Function ===
function updateDifficulty() {
  localStorage.setItem(`${selectedMap}-difficulty`, currentDifficulty);  
  console.log(`Difficulty for ${selectedMap} updated to: ${currentDifficulty}`);
}

// === Reset Counters ===
function resetCounters() {
  const savedProgress = JSON.parse(localStorage.getItem('gameProgress')) || {};

  // Initialize selected map if it doesn't exist in saved progress
  if (!savedProgress[selectedMap]) {
    savedProgress[selectedMap] = {
      correctAnswersCount: 0,
      wrongAnswersCount: 0,
      totalQuestionsAnswered: 0
    };
  }

  // Reset the counters for the selected map
  savedProgress[selectedMap].correctAnswersCount = 0;
  savedProgress[selectedMap].wrongAnswersCount = 0;
  savedProgress[selectedMap].totalQuestionsAnswered = 0;

  // Save the reset progress back to localStorage
  localStorage.setItem('gameProgress', JSON.stringify(savedProgress));

  // Also reset the in-game variables
  correctAnswersCount = 0; // Reset correct answers count
  wrongAnswersCount = 0; // Reset wrong answers count
  totalQuestionsAnswered = 0; // Reset total questions answered
  console.log(`✅ Counters reset for ${selectedMap}`);
}











// === Difficulty Update ===
function getMapDifficulty(mapName) {
  return localStorage.getItem(`${mapName}-difficulty`) || 'easy';
}

function updateMapDifficulty(mapName, difficulty) {
  localStorage.setItem(`${mapName}-difficulty`, difficulty);
  console.log(`✅ Difficulty for ${mapName} updated to: ${difficulty}`);
}













// === Step 4: Initialize mapDifficulty  is defined ===

let currentQuestionIndex = 0;
let correctCount = 0;
let totalQuestions = 0;

// Backgrounds per map
const mapBackgrounds = {
  multiplication: 'Multiplication Mirage.png',
  addition:       'Additroplois Village.png',
  subtraction:    'Subtraction Sands.png',
  division:       'Divide & Conquer River.png',
  counting:       'Counting Springs.png',
  comparison:     'Cliffs of Comparison.png',
  numerals:       'Numeral Ruins.png',
  placevalue:     'Place Value Town.png',
};

const mapPlatforms = {
  multiplication: 'Multiplication Mirage.png',
  addition:       'Additroplois Village.png',
  subtraction:    'Subtraction Sands.png',
  division:       'Divide & Conquer River.png',
  counting:       'Counting Springs.png',
  comparison:     'Cliffs of Comparison.png',
  numerals:       'Numeral Ruins.png',
  placevalue:     'Place Value Town.png',
};





// Monsters per map & stage
const mapStages = {
  multiplication: {
    1: [
      { name: 'Multiplication-Mob-1', displayName: "OASIS OGRES", maxHp: 1, image: 'Multiplication-Mob-1.png' },
      { name: 'Multiplication-Mob-2', displayName: "PRODUCT PIRANHAS", maxHp: 1, image: 'Multiplication-Mob-2.png' },//3
      { name: 'Multiplication-Mob-3', displayName: "MULTIPLEX MONKEY", maxHp: 1, image: 'Multiplication-Mob-3.png' },//4
      { name: 'Multiplication-Boss-1', displayName: "THE PRODUCT GOLEM", maxHp: 1, image: 'Multiplication-Boss-1.png' }//5
    ],
    2: [
      { name: 'Multiplication-Mob-4', displayName: "TIME TURTLE", maxHp: 2, image: 'Multiplication-Mob-4.png' },
      { name: 'Multiplication-Mob-5', displayName: "SERPENT SOLVER", maxHp: 4, image: 'Multiplication-Mob-5.png' },
      { name: 'Multiplication-Mob-6', displayName: "CRUNCH CROCODILE", maxHp: 5, image: 'Multiplication-Mob-6.png' },
      { name: 'Multiplication-Boss-2', displayName: "THE MULTI REX", maxHp: 7, image: 'Multiplication-Boss-2.png' }
    ],
    3: [
      { name: 'Multiplication-Mob-7', displayName: "ECHO ELEPANT", maxHp: 2, image: 'Multiplication-Mob-7.png' },
      { name: 'Multiplication-Mob-8', displayName: "MULTI MAGPIE", maxHp: 4, image: 'Multiplication-Mob-8.png' },
      { name: 'Multiplication-Mob-9', displayName: "WHIRL WHALE", maxHp: 6, image: 'Multiplication-Mob-9.png' },
      { name: 'Multiplication-Boss-3', displayName: "THE EQUATION BEAST", maxHp: 7, image: 'Multiplication-Boss-3.png' }
    ]
  },
  division: {
    1: [
      { name: 'Division-Mob-1', displayName: "DIVIDE GATOR", maxHp: 3, image: 'Division-Mob-1.png' },
      { name: 'Division-Mob-2', displayName: "RATIO LOBSTER", maxHp: 5, image: 'Division-Mob-2.png' },
      { name: 'Division-Mob-3', displayName: "SILK STRANGLERS", maxHp: 6, image: 'Division-Mob-3.png' },
      { name: 'Division-Boss-1', displayName: "THE FRACTION HOUSE", maxHp: 7, image: 'Division-Boss-1.png' }
    ],
    2: [
      { name: 'Division-Mob-4', displayName: "SPLIT PHANTOMS", maxHp: 2, image: 'Division-Mob-4.png' },
      { name: 'Division-Mob-5', displayName: "GROWTH GUARD", maxHp: 4, image: 'Division-Mob-5.png' },
      { name: 'Division-Mob-6', displayName: "TENTACLE TERROR", maxHp: 5, image: 'Division-Mob-6.png' },
      { name: 'Division-Boss-2', displayName: "THE TIDAL DRAGON", maxHp: 7, image: 'Division-Boss-2.png' }
    ],
    3: [
      { name: 'Division-Mob-7', displayName: "DEEP SEA SERPENT", maxHp: 3, image: 'Division-Mob-7.png' },
      { name: 'Division-Mob-8', displayName: "DIVIDE DEMON", maxHp: 5, image: 'Division-Mob-8.png' },
      { name: 'Division-Mob-9', displayName: "SWAMP STOMPER", maxHp: 6, image: 'Division-Mob-9.png' },
      { name: 'Division-Boss-3', displayName: "THE MURKY MAJESTY", maxHp: 7, image: 'Division-Boss-3.png' }
    ]
  },
  addition: {
    1: [
      { name: 'Addition-Mob-1', displayName: "JUNGLE VIPER", maxHp: 2, image: 'Addition-Mob-1.png' },
      { name: 'Addition-Mob-2', displayName: "MARCHING ANT", maxHp: 4, image: 'Addition-Mob-2.png' },
      { name: 'Addition-Mob-3', displayName: "MOSSBACK TURTLE", maxHp: 5, image: 'Addition-Mob-3.png' },
      { name: 'Addition-Boss-1', displayName: "THE ADD CHIEFTAIN", maxHp: 7, image: 'Addition-Boss-1.png' }
    ],
    2: [
      { name: 'Addition-Mob-4', displayName: "TRIBE WARRIOR", maxHp: 3, image: 'Addition-Mob-4.png' },
      { name: 'Addition-Mob-5', displayName: "CROWING CONDOR", maxHp: 5, image: 'Addition-Mob-5.png' },
      { name: 'Addition-Mob-6', displayName: "TREEMANCER", maxHp: 6, image: 'Addition-Mob-6.png' },
      { name: 'Addition-Boss-2', displayName: "THE SUM TITAN", maxHp: 7, image: 'Addition-Boss-2.png' }
    ],
    3: [
      { name: 'Addition-Mob-7', displayName: "JUNGLE CUB", maxHp: 2, image: 'Addition-Mob-7.png' },
      { name: 'Addition-Mob-8', displayName: "SCALY STRIKER", maxHp: 4, image: 'Addition-Mob-8.png' },
      { name: 'Addition-Mob-9', displayName: "TREETOP TALONS", maxHp: 5, image: 'Addition-Mob-9.png' },
      { name: 'Addition-Boss-3', displayName: "THE TOTEM FURIES", maxHp: 7, image: 'Addition-Boss-3.png' }
    ]
  },
  subtraction: {
    1: [
      { name: 'Subtraction-Mob-1', displayName: "MUMMY REBIRTH", maxHp: 3, image: 'Subtraction-Mob-1.png' },
      { name: 'Subtraction-Mob-2', displayName: "ANUBIS CHOSEN", maxHp: 4, image: 'Subtraction-Mob-2.png' },
      { name: 'Subtraction-Mob-3', displayName: "TART TERRITOR", maxHp: 6, image: 'Subtraction-Mob-3.png' },
      { name: 'Subtraction-Boss-1', displayName: "THE SOARING SENTINEL", maxHp: 7, image: 'Subtraction-Boss-1.png' }
    ],
    2: [
      { name: 'Subtraction-Mob-4', displayName: "DUNE DRAINER", maxHp: 4, image: 'Subtraction-Mob-4.png' },
      { name: 'Subtraction-Mob-5', displayName: "SCARAB SENTINELS", maxHp: 5, image: 'Subtraction-Mob-5.png' },
      { name: 'Subtraction-Mob-6', displayName: "SAND SCORPIONS", maxHp: 6, image: 'Subtraction-Mob-6.png' },
      { name: 'Subtraction-Boss-2', displayName: "THE PYRAMID SPHINX", maxHp: 7, image: 'Subtraction-Boss-2.png' }
    ],
    3: [
      { name: 'Subtraction-Mob-7', displayName: "TOMB STALKER", maxHp: 2, image: 'Subtraction-Mob-7.png' },
      { name: 'Subtraction-Mob-8', displayName: "ANCIENT WARDEN", maxHp: 5, image: 'Subtraction-Mob-8.png' },
      { name: 'Subtraction-Mob-9', displayName: "SAND JINN", maxHp: 6, image: 'Subtraction-Mob-9.png' },
      { name: 'Subtraction-Boss-3', displayName: "THE ANCIENT RULER", maxHp: 7, image: 'Subtraction-Boss-3.png' }
    ]
  },
  counting: {
    1: [
      { name: 'Counting-Mob-1', displayName: "COLORFUL BIRD", maxHp: 3, image: 'Counting-Mob-1.png' },
      { name: 'Counting-Mob-2', displayName: "AURORA TREE", maxHp: 5, image: 'Counting-Mob-2.png' },
      { name: 'Counting-Mob-3', displayName: "PRISMATIC FROG", maxHp: 5, image: 'Counting-Mob-3.png' },
      { name: 'Counting-Boss-1', displayName: "THE JUMP JESTER", maxHp: 7, image: 'Counting-Boss-1.png' }
    ],
    2: [
      { name: 'Counting-Mob-4', displayName: "COLORFALL UNICORN", maxHp: 4, image: 'Counting-Mob-4.png' },
      { name: 'Counting-Mob-5', displayName: "SPECTRAL LILY", maxHp: 5, image: 'Counting-Mob-5.png' },
      { name: 'Counting-Mob-6', displayName: "CHROMA FLORA", maxHp: 6, image: 'Counting-Mob-6.png' },
      { name: 'Counting-Boss-2', displayName: "THE RAINBOW WISHER", maxHp: 7, image: 'Counting-Boss-2.png' }
    ],
    3: [
      { name: 'Counting-Mob-7', displayName: "SPECTRAL FINNED", maxHp: 4, image: 'Counting-Mob-7.png' },
      { name: 'Counting-Mob-8', displayName: "SPECTRAL PIXIE", maxHp: 3, image: 'Counting-Mob-8.png' },
      { name: 'Counting-Mob-9', displayName: "COLORSPROUT", maxHp: 5, image: 'Counting-Mob-9.png' },
      { name: 'Counting-Boss-3', displayName: "THE PRISMATIC HEXER", maxHp: 7, image: 'Counting-Boss-3.png' }
    ]
  },
  comparison: {
    1: [
      { name: 'Comparison-Mob-1', displayName: "CAVERN GREMLINS", maxHp: 2, image: 'Comparison-Mob-1.png' },
      { name: 'Comparison-Mob-2', displayName: "IRONCLAD ANTS", maxHp: 4, image: 'Comparison-Mob-2.png' },
      { name: 'Comparison-Mob-3', displayName: "TREEHOPPERS", maxHp: 6, image: 'Comparison-Mob-3.png' },
      { name: 'Comparison-Boss-1', displayName: "THE CAVERN FLYERS", maxHp: 7, image: 'Comparison-Boss-1.png' }
    ],
    2: [
      { name: 'Comparison-Mob-4', displayName: "TWISTED BRANCHES", maxHp: 2, image: 'Comparison-Mob-4.png' },
      { name: 'Comparison-Mob-5', displayName: "FLUTTERBLOODS", maxHp: 4, image: 'Comparison-Mob-5.png' },
      { name: 'Comparison-Mob-6', displayName: "STARDUST OWLS", maxHp: 3, image: 'Comparison-Mob-6.png' },
      { name: 'Comparison-Boss-2', displayName: "THE SKYCLAW HAWKS", maxHp: 7, image: 'Comparison-Boss-2.png' }
    ],
    3: [
      { name: 'Comparison-Mob-7', displayName: "EQUALIZER", maxHp: 2, image: 'Comparison-Mob-7.png' },
      { name: 'Comparison-Mob-8', displayName: "MISTY WOOLS", maxHp: 4, image: 'Comparison-Mob-8.png' },
      { name: 'Comparison-Mob-9', displayName: "FLITFURY GNATS", maxHp: 5, image: 'Comparison-Mob-9.png' },
      { name: 'Comparison-Boss-3', displayName: "THE VOLCA GOLEM", maxHp: 7, image: 'Comparison-Boss-3.png' }
    ]
  },
  numerals: {
    1: [
      { name: 'Numerals-Mob-1', displayName: "CRYPT DEFENDERS", maxHp: 3, image: 'Numerals-Mob-1.png' },
      { name: 'Numerals-Mob-2', displayName: "WRAITHBONE", maxHp: 4, image: 'Numerals-Mob-2.png' },
      { name: 'Numerals-Mob-3', displayName: "BOWMASTER CENTAUR", maxHp: 5, image: 'Numerals-Mob-3.png' },
      { name: 'Numerals-Boss-1', displayName: "THE SWORDHALL KNIGHT", maxHp: 7, image: 'Numerals-Boss-1.png' }
    ],
    2: [
      { name: 'Numerals-Mob-4', displayName: "IRONHORN WARRIOR", maxHp: 2, image: 'Numerals-Mob-4.png' },
      { name: 'Numerals-Mob-5', displayName: "SIREN'S MARKSMAN", maxHp: 4, image: 'Numerals-Mob-5.png' },
      { name: 'Numerals-Mob-6', displayName: "WINGED EQUUS", maxHp: 5, image: 'Numerals-Mob-6.png' },
      { name: 'Numerals-Boss-2', displayName: "THE CHIMERA KING", maxHp: 7, image: 'Numerals-Boss-2.png' }
    ],
    3: [
      { name: 'Numerals-Mob-7', displayName: "FERAL TIGER", maxHp: 3, image: 'Numerals-Mob-7.png' },
      { name: 'Numerals-Mob-8', displayName: "FLAMEWING EAGLE", maxHp: 5, image: 'Numerals-Mob-8.png' },
      { name: 'Numerals-Mob-9', displayName: "STONEFIST GOLEM", maxHp: 6, image: 'Numerals-Mob-9.png' },
      { name: 'Numerals-Boss-3', displayName: "THE THREEFURY KNIGHT", maxHp: 7, image: 'Numerals-Boss-3.png' }
    ]
  },
  placevalue: {
    1: [
      { name: 'PlaceValue-Mob-1', displayName: "CROP CRUSHER", maxHp: 3, image: 'PlaceValue-Mob-1.png' },
      { name: 'PlaceValue-Mob-2', displayName: "BARNHOG BEAST", maxHp: 5, image: 'PlaceValue-Mob-2.png' },
      { name: 'PlaceValue-Mob-3', displayName: "SHEEP TRIO", maxHp: 5, image: 'PlaceValue-Mob-3.png' },
      { name: 'PlaceValue-Boss-1', displayName: "THE CORNFIELD SENTINEL", maxHp: 7, image: 'PlaceValue-Boss-1.png' }
    ],
    2: [
      { name: 'PlaceValue-Mob-4', displayName: "WOLFSTORM", maxHp: 3, image: 'PlaceValue-Mob-4.png' },
      { name: 'PlaceValue-Mob-5', displayName: "INFERNO HORSE", maxHp: 4, image: 'PlaceValue-Mob-5.png' },
      { name: 'PlaceValue-Mob-6', displayName: "RAGING TUSK", maxHp: 5, image: 'PlaceValue-Mob-6.png' },
      { name: 'PlaceValue-Boss-2', displayName: "THE WINDMILL HAVEN", maxHp: 7, image: 'PlaceValue-Boss-2.png' }
    ],
    3: [
      { name: 'PlaceValue-Mob-7', displayName: "MUDHAVEN BEAST", maxHp: 4, image: 'PlaceValue-Mob-7.png' },
      { name: 'PlaceValue-Mob-8', displayName: "FALLOW SENTRY", maxHp: 6, image: 'PlaceValue-Mob-8.png' },
      { name: 'PlaceValue-Mob-9', displayName: "HARVEST SCARECROW", maxHp: 5, image: 'PlaceValue-Mob-9.png' },
      { name: 'PlaceValue-Boss-3', displayName: "THE CINDERSCORCH", maxHp: 7, image: 'PlaceValue-Boss-3.png' }
    ]
  }
};

const rewardMap = {
  multiplication: {
    1: "reward-multiplication-badge",
    2: "reward-multiplication-title",
    3: "reward-multiplication-border"
  },
  addition: {
    1: "reward-addition-badge",
    2: "reward-addition-title",
    3: "reward-addition-border"
  },
  subtraction: {
    1: "reward-subtraction-badge",
    2: "reward-subtraction-title",
    3: "reward-subtraction-border"
  },
  division: {
    1: "reward-division-badge",
    2: "reward-division-title",
    3: "reward-division-border"
  },
  counting: {
    1: "reward-counting-badge",
    2: "reward-counting-title",
    3: "reward-counting-border"
  },
  comparison: {
    1: "reward-comparison-badge",
    2: "reward-comparison-title",
    3: "reward-comparison-border"
  },
  numerals: {
    1: "reward-numerals-badge",
    2: "reward-numerals-title",
    3: "reward-numerals-border"
  },
  placevalue: {
    1: "reward-placevalue-badge",
    2: "reward-placevalue-title",
    3: "reward-placevalue-border"
  }
};

const rewardData = {
  multiplication: {
    badge: "/static/images/gameimg/rewardimg/badge/badge-1.png",
    title: "/static/images/gameimg/rewardimg/title/title-1.png",
    border: "/static/images/gameimg/rewardimg/border/border-1.png"
  },
  addition: {
    badge: "/static/images/gameimg/rewardimg/badge/badge-2.png",
    title: "/static/images/gameimg/rewardimg/title/title-2.png",
    border: "/static/images/gameimg/rewardimg/border/border-2.png"
  },
  subtraction: {
    badge: "/static/images/gameimg/rewardimg/badge/badge-3.png",
    title: "/static/images/gameimg/rewardimg/title/title-3.png",
    border: "/static/images/gameimg/rewardimg/border/border-3.png"
  },
  division: {
    badge: "/static/images/gameimg/rewardimg/badge/badge-4.png",
    title: "/static/images/gameimg/rewardimg/title/title-4.png",
    border: "/static/images/gameimg/rewardimg/border/border-4.png"
  },
  counting: {
    badge: "/static/images/gameimg/rewardimg/badge/badge-5.png",
    title: "/static/images/gameimg/rewardimg/title/title-5.png",
    border: "/static/images/gameimg/rewardimg/border/border-5.png"
  },
  comparison: {
    badge: "/static/images/gameimg/rewardimg/badge/badge-6.png",
    title: "/static/images/gameimg/rewardimg/title/title-6.png",
    border: "/static/images/gameimg/rewardimg/border/border-6.png"
  },
  numerals: {
    badge: "/static/images/gameimg/rewardimg/badge/badge-7.png",
    title: "/static/images/gameimg/rewardimg/title/title-7.png",
    border: "/static/images/gameimg/rewardimg/border/border-7.png"
  },
  placevalue: {
    badge: "/static/images/gameimg/rewardimg/badge/badge-8.png",
    title: "/static/images/gameimg/rewardimg/title/title-8.png",
    border: "/static/images/gameimg/rewardimg/border/border-8.png"
  }
};

// Define skins
const skins = [
  {
    id: 'default-skin', // <- ito ang tama at consistent
    name: 'Default Skin',
    src: '/static/images/anim/sprite/idle.png',
    attackSrc: '/static/images/anim/sprite/attack.png',
  },
  {
    id: 'multiplication-stage3-skin',
    name: 'Multiplication Skin',
    src: '/static/images/anim/sprite/idle1.png',
    attackSrc: '/static/images/anim/sprite/attack1.png',
  },
  {
    id: 'addition-stage3-skin',
    name: 'Addition Skin',
    src: '/static/images/anim/sprite/idle2.png',
    attackSrc: '/static/images/anim/sprite/attack2.png',
  },
  {
    id: 'subtraction-stage3-skin',
    name: 'Subtraction Skin',
    src: '/static/images/anim/sprite/idle3.png',
    attackSrc: '/static/images/anim/sprite/attack3.png',
  },
  {
    id: 'division-stage3-skin',
    name: 'Division Skin',
    src: '/static/images/anim/sprite/idle4.png',
    attackSrc: '/static/images/anim/sprite/attack4.png',
  },
  {
    id: 'counting-stage3-skin',
    name: 'Counting Skin',
    src: '/static/images/anim/sprite/idle5.png',
    attackSrc: '/static/images/anim/sprite/attack5.png',
  },

  {
    id: 'comparison-stage3-skin',
    name: 'Comparison Skin',
    src: '/static/images/anim/sprite/idle6.png',
    attackSrc: '/static/images/anim/sprite/attack6.png',
  },
  {
    id: 'numerals-stage3-skin',
    name: 'Numerals Skin',
    src: '/static/images/anim/sprite/idle7.png',
    attackSrc: '/static/images/anim/sprite/attack7.png',
  },
  {
    id: 'placevalue-stage3-skin',
    name: 'Place Value Skin',
    src: '/static/images/anim/sprite/idle8.png',
    attackSrc: '/static/images/anim/sprite/attack8.png',
  },
];




// Global state for current stage
let currentMonsterIndex = 0;
let monstersInStage     = [];

// Determine the folder based on selected map
const folder = selectedMap.charAt(0).toUpperCase() + selectedMap.slice(1);

function initMapAndStage() {
  // 1) Set the background image based on selected map
  const bgEl = document.getElementById('game-bg');
  const bgFile = mapBackgrounds[selectedMap];
  if (bgFile) {
    bgEl.style.backgroundImage = `url('/static/images/gameimg/gamebg/${bgFile}')`;
  } else {
    console.error(`Background image not found for map: ${selectedMap}`);
  }

  // 2) Set the platform image based on selected map
  const platformImage = mapPlatforms[selectedMap];
  const platformImgEl = document.getElementById('platform-image');
  if (platformImage && platformImgEl) {
    platformImgEl.src = `/static/images/gameimg/Platforms/${platformImage}?t=${Date.now()}`;
    
    // Dynamically assign a platform class based on the selected map
    const platformClass = `platform-${selectedMap.toLowerCase()}`;
    platformImgEl.className = platformClass;  // Adding class to platform

  } else {
    console.error(`Platform image not found for map: ${selectedMap}`);
  }

  // 3) Load the list of monsters for this map and stage
  monstersInStage = (mapStages[selectedMap] || {})[selectedStage] || [];

  // 4) If no monsters are found → game over
  if (!monstersInStage.length) {
    return showGameOverScreen();
  }

  // 5) Spawn the first monster in the list
  spawnMonster(0);

  // Log initialization
  console.log('Map and stage initialized for map:', selectedMap, 'stage:', selectedStage);
}






function spawnMonster(idx, shouldFetchQuestion = false) {
  const m = monstersInStage[idx];
  if (!m) return showVictoryScreen();

  currentMonsterHealth = m.maxHp;
  maxMonsterHealth = m.maxHp;

  const monsterImg = document.getElementById('monster-sprite');
  const monsterNameEl = document.querySelector('.monster-name');
  if (!monsterImg) {
    console.error('#monster-sprite missing');
    return;
  }

  const monsterSrc = `/static/images/gameimg/mnstr/${folder}/${m.image}?t=${Date.now()}`;
  console.log("Monster image source:", monsterSrc);

  monsterImg.src = monsterSrc;
  monsterImg.className = 'monster';
  const specific = `monster-${m.name.toLowerCase().replace(/\s+/g, '-')}`;
  monsterImg.classList.add(specific);

  monsterImg.style.height = m.height || 'auto';
  monsterImg.style.bottom = m.bottom || '0';
  monsterImg.style.left = m.left || '0';

  if (monsterNameEl) {
    monsterNameEl.textContent = m.displayName || m.name.replace(/-/g, ' ');
  }

  // Log the current difficulty before fetching a new question
  console.log('Current difficulty before question fetch:', currentDifficulty);

  // Start spawn animation (fade-in and shake effect)
  if (!isMonsterSpawnAnimationInProgress) {
    isMonsterSpawnAnimationInProgress = true;

    monsterImg.classList.remove('monster-spawn');
    void monsterImg.offsetWidth; // Force reflow
    monsterImg.classList.add('monster-spawn');

    monsterImg.addEventListener('animationend', function clearSpawn() {
      monsterImg.classList.remove('monster-spawn');
      isMonsterSpawnAnimationInProgress = false;
      monsterImg.removeEventListener('animationend', clearSpawn);

      // Update health bars after monster spawns
      updateHealthBars();

      // Add fade-in effect for new question
      const qText = document.getElementById('question-text');
      qText.classList.remove('fade-in');
      qText.classList.add('fade-out'); // Fade out current question

      setTimeout(() => {
        // ✅ Only fetch a question if instructed
        if (shouldFetchQuestion) {
          fetchNewQuestion();
        }

        // Apply fade-in effect for the new question
        qText.classList.remove('fade-out');
        qText.classList.add('fade-in');
      }, 500); // Wait for fade-out to complete before transitioning
    });
  } else {
    console.log("Spawn in progress, skipping spawn for now.");
  }
}













function triggerMonsterDeathAnimation() {
  const monsterImg = document.getElementById('monster-sprite');
  if (!monsterImg) return;

  // Start death animationplayer
  monsterImg.classList.add('monster-death');
  
  // Set death animation flag
  isMonsterDeathAnimationInProgress = true;

  // Reset after death animation
  monsterImg.addEventListener('animationend', function clearDeath() {
    monsterImg.classList.remove('monster-death');
    isMonsterDeathAnimationInProgress = false; // End death animation
    monsterImg.removeEventListener('animationend', clearDeath);

    // Proceed to next monster after death animation
    nextMonster();
  });
}


// Go to next monster
function nextMonster() {
  currentMonsterIndex++;
  if (currentMonsterIndex >= monstersInStage.length) {
    return showVictoryScreen();
  }
  spawnMonster(currentMonsterIndex);
}


function startMonsterDeathAnimation() {
  isMonsterDeathAnimationInProgress = true;

  // Your death animation code here
  
  // Once death animation is finished, reset the flag
  setTimeout(() => {
    isMonsterDeathAnimationInProgress = false;
  }, deathAnimationDuration); // Use the actual duration of the death animation
}
function startMonsterSpawnAnimation() {
  isMonsterSpawnAnimationInProgress = true;

  // Your spawn animation code here
  
  // Once spawn animation is finished, reset the flag
  setTimeout(() => {
    isMonsterSpawnAnimationInProgress = false;
  }, spawnAnimationDuration); // Use the actual duration of the spawn animation
}


// ======= HEALTH BAR LOGIC =======
    function getHpImagePath(currentHp, maxHp, isPlayer = true) {
      const hpRatio = currentHp / maxHp;
      const scaledHp = Math.round(hpRatio * maxHp);
      const clampedHp = Math.max(0, Math.min(scaledHp, maxHp));
      const prefix = isPlayer ? 'player-hp-' : 'monster-hp-';
    
      // Get the base URL from the hidden div
      const baseUrl = document.getElementById("hp-bar-path").dataset.baseUrl;
      return `${baseUrl}${prefix}${clampedHp}.png`;
    }
    

  const maxPlayerHealth    = 5;
  let   currentPlayerHealth = maxPlayerHealth;
  const playerHealthBar    = document.getElementById('player-health');

  let   maxMonsterHealth   = 3;  // ← let so we can reassign per monster
  let   currentMonsterHealth = maxMonsterHealth;
  const monsterHealthBar   = document.getElementById('monster-health');

  function renderHpBar(bar, curr, max, isPlayer = true) {
    bar.innerHTML = '';
    const img = document.createElement('img');
    img.src       = getHpImagePath(curr, max, isPlayer);
    img.alt       = 'HP Bar';
    img.className = 'hp-bar-image';
    bar.appendChild(img);
  }
  function updateHealthBars() {
    renderHpBar(playerHealthBar, currentPlayerHealth, maxPlayerHealth, true);
    renderHpBar(monsterHealthBar, currentMonsterHealth, maxMonsterHealth, false);
  }
  updateHealthBars();


  // ======= PLAYER HEALTH =======
  function playerHeal(amount) {
    currentPlayerHealth = Math.min(currentPlayerHealth + amount, maxPlayerHealth);
    updateHealthBars();
  }
  function playerTakeDamage() {
    const monsterContainer = document.querySelector('.monster');
    const player = document.querySelector('.player');
  
    // ❄️ No damage if monster is frozen
    if (monsterContainer.classList.contains('frozen')) {
      console.log('❄️ Monster is frozen — no damage or animation.');
      return;
    }
  
    // 🔥 Apply damage animation
    player.classList.add('player-damaged', 'shake');
    setTimeout(() => {
      player.classList.remove('player-damaged', 'shake');
    }, 600);
  
    // ❤️ Deduct HP
    if (currentPlayerHealth > 0) {
      currentPlayerHealth--;
      updateHealthBars();
      console.log('💔 Player HP →', currentPlayerHealth);
    }
  
    checkGameOver();
  }
  
  
  

  function monsterTakeDamage() {
  const monsterImg = document.getElementById('monster-sprite');
  if (currentMonsterHealth > 0) {
    currentMonsterHealth--;
    updateHealthBars();

    if (currentMonsterHealth <= 0) {
      // Cancel freeze effect if active
      if (freezePotionUsed) {
        freezePotionUsed = false;
        freezeTurns = 1;
        removeFreezeEffect();
        freezeTurnsDisplay.style.display = 'none';
      }

      if (!monsterImg) return;

      // 1) Trigger death animation
      monsterImg.classList.add('monster-death');
      console.log("Death animation added");

      // 2) Wait for animation to complete
      monsterImg.addEventListener('animationend', function onDeath() {
        console.log("Death animation ended");
        monsterImg.removeEventListener('animationend', onDeath);

        // 3) Keep the monster there for 2s, but fade it out smoothly
        setTimeout(() => {
          
          // Add fade out effect
          monsterImg.style.transition = 'opacity 0.5s ease';
          monsterImg.style.opacity = '0';

          // After fade completes (0.5s), spawn the next monster
          setTimeout(() => {
            monsterImg.classList.remove('monster-death');
            monsterImg.style.opacity = '';
            monsterImg.style.transition = '';
            monsterImg.style.transform = '';

            nextMonster();
          }, 500); // Wait for fade-out to finish
        }, 100); // Wait 2 seconds before fade
      });
    }
  }
  checkGameOver();
}



// ======= GAME OVER =======
function checkGameOver() {
  if (currentPlayerHealth <= 0) {
    setTimeout(() => {
      showGameOverScreen(); // This will show your custom Game Over screen
    }, 1000); // Delay to allow any final animation to finish
  }
}



















// Function to fetch new question based on current map and difficulty


// Initial load to fetch first question after progress load















  function displayFeedback(msg) {
    const fb = document.getElementById('feedback');
    fb.innerText = msg;
    fb.style.display = 'block';
    setTimeout(() => fb.style.display = 'none', 2000);
  }


  // ======= INPUT PAD =======
  function addToInput(v) {
    document.getElementById('number-input').value += v;
  }
  function backspace() {
    const f = document.getElementById('number-input');
    f.value = f.value.slice(0, -1);
  }


  function showVictoryScreen() {
    const gameContainer = document.querySelector('.ground');
    if (!gameContainer) {
      console.error('Game container not found!');
      return;
    }
  
    const victoryScreen = document.getElementById('victory-screen');
    const victoryBox = victoryScreen.querySelector('.victory-box');
    const continueBtn = document.getElementById('continue-btn');
    const retryBtn = document.getElementById('retry-btn');
    const homeBtn = document.getElementById('home-btn');
  
    document.querySelectorAll('.monster, .monster-spawn, .monster-death').forEach(el => el.remove());
    gameContainer.classList.add('paused');
    victoryScreen.style.visibility = 'visible';
    victoryScreen.classList.add('visible');
    victoryBox.classList.add('box-animation');
  
    const urlParams = new URLSearchParams(window.location.search);
    const selectedMap = urlParams.get('map') || 'multiplication';
    const selectedStage = parseInt(urlParams.get('stage'));
  
    const rewardCategories = rewardMap[selectedMap];
    const reward = rewardData[selectedMap];
  
    if (rewardCategories && reward) {
      const badgeElement = document.getElementById(rewardCategories[1]);
      const titleElement = document.getElementById(rewardCategories[2]);
      const borderElement = document.getElementById(rewardCategories[3]);
  
      if (badgeElement) badgeElement.classList.add('hidden');
      if (titleElement) titleElement.classList.add('hidden');
      if (borderElement) borderElement.classList.add('hidden');
      //================CONNECTION > DATABASE==========================//
      const rewardClaimed = localStorage.getItem(`${selectedMap}-stage${selectedStage}-claimed`);
      const existingStatus = document.getElementById('reward-claimed-text');
      if (existingStatus) existingStatus.remove();
  
      if (!rewardClaimed) {
        let rewardItem = null;
  
        if (selectedStage === 1 && badgeElement) {
          badgeElement.src = reward.badge;
          badgeElement.classList.remove('hidden');
          badgeElement.style.display = 'block';
          rewardItem = { map: selectedMap, stage: selectedStage, type: 'badge', image: reward.badge };
        } else if (selectedStage === 2 && titleElement) {
          titleElement.src = reward.title;
          titleElement.classList.remove('hidden');
          titleElement.style.display = 'block';
          rewardItem = { map: selectedMap, stage: selectedStage, type: 'title', image: reward.title };
        } else if (selectedStage === 3 && borderElement) {
          borderElement.src = reward.border;
          borderElement.classList.remove('hidden');
          borderElement.style.display = 'block';
          rewardItem = { map: selectedMap, stage: selectedStage, type: 'border', image: reward.border };
        }
      //================CONNECTION > DATABASE==========================//
        localStorage.setItem(`${selectedMap}-stage${selectedStage}-claimed`, 'true');
  
        // ✅ PUSH to collectedRewards (no duplicates)
        if (rewardItem) {
              //================CONNECTION > DATABASE==========================//
          const collectedRewards = JSON.parse(localStorage.getItem('collectedRewards')) || [];
          const alreadyExists = collectedRewards.some(item =>
            item.map === rewardItem.map &&
            item.stage === rewardItem.stage &&
            item.type === rewardItem.type
          );
          if (!alreadyExists) {
            collectedRewards.push(rewardItem);
                //================CONNECTION > DATABASE==========================//
            localStorage.setItem('collectedRewards', JSON.stringify(collectedRewards));
          }
        }
      } else {
        const rewardStatusText = document.createElement('div');
        rewardStatusText.id = "reward-claimed-text";
        rewardStatusText.className = "reward-claimed-text";
        rewardStatusText.textContent = "🎉 Reward Claimed!";
        victoryBox.appendChild(rewardStatusText);
      }
    }
  
    if (selectedMap) {
      const starsEarned = 1;
          //================CONNECTION > DATABASE==========================//
          if (starsEarned > currentStars) {
            saveStarsToDatabase(selectedMap, starsEarned);
          }          
    }
  
    if (selectedMap && selectedStage) {
      const starsEarnedStage = 1;
      updateStageProgress(selectedMap, selectedStage, starsEarnedStage);
      updateRoadmapStars(`${selectedMap}-${selectedStage}`);
    }
  
    function closeVictoryScreen() {
      victoryScreen.style.visibility = 'hidden';
      victoryScreen.classList.remove('visible');
      gameContainer.classList.remove('paused');
      victoryBox.classList.remove('box-animation');
    }
  
    continueBtn.onclick = () => {
      const nextMapUrl = getNextMap(selectedMap, selectedStage);
      if (nextMapUrl) {
        window.location.href = `/stages?${nextMapUrl}`;
      }
      closeVictoryScreen();
    };
  
    retryBtn.onclick = () => {
      window.location.reload();
      closeVictoryScreen();
    };
  
    const routePathsElement = document.getElementById('route-paths');
    const routePaths = {
      roadmap: routePathsElement.getAttribute('data-roadmap'),
      dashboard: routePathsElement.getAttribute('data-dashboard')
    };
  
    homeBtn.onclick = () => {
      window.location.href = routePaths.dashboard;
      closeVictoryScreen();
    };
  
    console.log("Victory Screen Loaded:");
    console.log("Map:", selectedMap);
    console.log("Stage:", selectedStage);
    if (reward) {
      console.log("Badge:", reward.badge);
      console.log("Title:", reward.title);
      console.log("Border:", reward.border);
    }
  }
  
  
  
  
  function saveStarsToDatabase(stage, stars) {
    fetch('/update-star', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            stage: stage,
            stars: stars
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to save stars to database');
        }
        return response.json();
    })
    .then(data => {
        console.log('✅ Stars saved to DB:', data);
    })
    .catch(error => {
        console.error('❌ Error saving stars:', error);
    });
}

  
  
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////
  
  
  
  
  
function getNextMap(currentMap, currentStage) {
  const mapOrder = ['multiplication', 'addition', 'subtraction', 'division', 'counting', 'comparison', 'numerals', 'placevalue'];

  const currentMapIndex = mapOrder.indexOf(currentMap);
  if (currentMapIndex === -1) {
    console.error('Current map not found!');
    return;
  }

  return `map=${currentMap}&stage=${currentStage}`;
}

// Increment stars in the database instead of localStorage
function incrementStageProgress(stageKey) {
  const starsToAdd = 1;

  fetch('/update-star', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      stage: stageKey,
      stars: starsToAdd  // Add 1 star at a time
    })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      // Update roadmap display based on new data
      SERVER_PROGRESS[stageKey] = Math.min((SERVER_PROGRESS[stageKey] || 0) + 1, 3);
      updateRoadmapStars(stageKey);
    } else {
      console.error("❌ Failed to update stars:", data.error);
    }
  })
  .catch(err => {
    console.error("❌ Error updating stars:", err);
  });
}

// No longer needed, but kept if you still use SERVER_PROGRESS elsewhere
function updateRoadmapStars(stageKeyJustCompleted) {
  const stageStars = SERVER_PROGRESS[stageKeyJustCompleted];
  if (!stageStars) return;

  const roadmapItem = document.querySelector(`.stage-item[data-stage-key="${stageKeyJustCompleted}"]`);
  if (roadmapItem) {
    const starWrapper = roadmapItem.querySelector('.star-wrapper');
    const starImgs = starWrapper.querySelectorAll('.progress-star');

    starImgs.forEach((img, index) => {
      img.src = index < stageStars ? window.STAR_IMAGES.filled : window.STAR_IMAGES.empty;
    });
  }
}

function calculateStars() {
  if (currentPlayerHealth === 0) {
    return 0;
  } else {
    return 1; // Always 1 star when the stage is completed
  }
}










// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //

// Show the game over screen
function showGameOverScreen() {
  const gameContainer = document.querySelector('.ground');
  if (!gameContainer) {
    console.error('Game container not found!');
    return;
  }

  const gameoverScreen = document.getElementById('gameover-screen');
  const gameoverBox = gameoverScreen.querySelector('.gameover-box');
  const gameoverButtons = document.querySelector('.gameover-buttons');
  const retryBtn = gameoverButtons.querySelector('#retry-btn');
  const homeBtn = gameoverButtons.querySelector('#home-btn');

  // Remove monsters
  document.querySelectorAll('.monster, .monster-spawn, .monster-death').forEach(el => el.remove());

  // Pause game
  gameContainer.classList.add('paused');

  // Show game over screen
  gameoverScreen.style.visibility = 'visible';
  gameoverScreen.classList.add('visible');
  gameoverBox.classList.add('box-animation');

  // Button events
  retryBtn.onclick = () => {
    window.location.reload();
  };

  const routePaths = document.getElementById("route-paths").dataset;

  homeBtn.onclick = () => {
    window.location.href = routePaths.dashboard;
  };
}




// Function for monster's attack animation
function monsterAttack() {
  const monster = document.querySelector('.monster');
  const player = document.querySelector('.player');

  // Add the attack animation class to the monster
  monster.classList.add("monster-attack");

  // After the attack animation ends, apply the damage
  setTimeout(() => {
    monster.classList.remove("monster-attack");

    // ✅ Apply damage and animation in one function
    setTimeout(() => {
      playerTakeDamage();
    }, 0);
  }, 800);

  checkGameOver();
}


// ========== UPDATE POTION UI ==========
function updatePotionUI() {
  const freezePotion = document.querySelector('.freeze-potion');
  const freezeQuantity = document.getElementById('freeze-quantity');
  freezeQuantity.innerText = freezePotions;
  if (freezePotions <= 0) freezePotion.classList.add('potion-depleted');
  else freezePotion.classList.remove('potion-depleted');

  const healthPotion = document.querySelector('.health-potion');
  const healthQuantity = document.getElementById('health-quantity');
  healthQuantity.innerText = healthPotions;
  if (healthPotions <= 0) healthPotion.classList.add('potion-depleted');
  else healthPotion.classList.remove('potion-depleted');

  const thunderPotion = document.querySelector('.thunder-potion');
  const thunderQuantity = document.getElementById('thunder-quantity');
  thunderQuantity.innerText = thunderPotions;
  if (thunderPotions <= 0) thunderPotion.classList.add('potion-depleted');
  else thunderPotion.classList.remove('potion-depleted');
}


function fireballAttack() {
  if (sessionStorage.getItem('fireballTriggered')) return;

  const paths = document.getElementById("attack-image-paths").dataset;
  const attackEffects = [paths.add, paths.sub, paths.mul, paths.div];
  const selectedAttack = attackEffects[Math.floor(Math.random() * attackEffects.length)];

  const fireball = document.createElement("img");
  fireball.src = selectedAttack;
  fireball.classList.add("fireball");

  const groundContainer = document.querySelector(".ground");
  const player = document.querySelector(".player");
  const monster = document.querySelector(".monster");

  fireball.style.left = `${player.offsetLeft + player.offsetWidth}px`;
  fireball.style.bottom = "120px";

  // 🧪 Charging effect
  player.classList.add("charging");

  setTimeout(() => {
    const equippedSkinId = localStorage.getItem('equippedCharacterId');
    const skin = skins.find(s => s.id === equippedSkinId) || skins[0];
    player.src = skin.attackSrc;
    player.style.height = "35vh";
    player.style.width = "auto";

    // 🔥 Fireball appears
    groundContainer.appendChild(fireball);
    sessionStorage.setItem('fireballTriggered', true);

    // 💢 Monster takes visual damage
    setTimeout(() => {
      monster.classList.add("damaged");
      setTimeout(() => {
        monster.classList.remove("damaged");
      }, 600);
    }, 770);

    // 🌀 Shake effect
    setTimeout(() => {
      monster.classList.add("shake");
      setTimeout(() => {
        monster.classList.remove("shake");
      }, 600);
    }, 1100);

    // 💀 Apply damage + wait for animation to end
    setTimeout(() => {
      const damage = 1;
      currentMonsterHealth -= damage;
      updateHealthBars();

      if (currentMonsterHealth <= 0) {
        console.log("Death animation added"); // Add log when death animation starts
        isMonsterDeathAnimationInProgress = true;
        monster.classList.add("monster-death");

        // ✔️ Wait for death animation to finish
        const onDeath = () => {
          console.log("Death animation ended (fireball)"); // Log when death animation ends
          monster.removeEventListener("animationend", onDeath);
          monster.classList.remove("monster-death");
          currentMonsterIndex++;
          spawnMonster(currentMonsterIndex, true);
          isMonsterDeathAnimationInProgress = false;
        };

        monster.addEventListener("animationend", onDeath);
      }
    }, 1400);

    // 🧼 Remove fireball
    setTimeout(() => {
      fireball.remove();
      sessionStorage.removeItem('fireballTriggered');
    }, 1000);

    // 🟢 Reset to idle
    setTimeout(() => {
      player.src = skin.src;
      player.style.height = "35vh";
      player.style.width = "auto";
      player.classList.remove("charging");

      // Remove freeze effect after fireball hits the monster
      if (freezeTurns > 0) {
        freezeTurns--;
        if (freezeTurns === 0) {
          setTimeout(() => {
            removeFreezeEffect();
            freezeTurnsDisplay.style.display = 'none';
            console.log("⏹ Freeze effect has ended.");
          }, 100);
        }
        updateFreezeTurnsDisplay();
      }
    }, 700);
  }, 600);
}





document.addEventListener("DOMContentLoaded", function() {
  const spawn = document.getElementById("player-spawn");
  const player = document.getElementById("player-idle");

  // Check if elements exist before proceeding
  if (!spawn || !player) {
      console.error("Player elements not found in the DOM");
      return;
  }

  // Get the equipped skin (or default to the first skin)
  const equippedSkinId = localStorage.getItem('equippedCharacterId');
  console.log("Equipped skin ID:", equippedSkinId);

  const skin = skins.find(s => s.id === equippedSkinId) || skins[0]; // Default to the first skin if none is found
  console.log("Using skin:", skin);

  // Set the idle and spawn images based on the equipped skin
  player.src = skin.src;  // Set the idle image
  spawn.src = skin.src;   // Set the spawn image

  setTimeout(() => {
      // Hide the spawn image after the spawn effect duration
      spawn.classList.add("hidden");

      // Instantly show the player (idle state) without animation delay
      player.classList.remove("hidden");
  }, 1000); // Adjust this delay if needed
});



window.addEventListener("DOMContentLoaded", () => {
  const monster = document.querySelector(".monster");
});




document.addEventListener('DOMContentLoaded', function () {
  const player = document.querySelector(".player");

  // Get equipped skin ID from localStorage
  const equippedSkinId = localStorage.getItem('equippedCharacterId');
  if (equippedSkinId) {
      // Find the skin by its ID in the skins array
      const skin = skins.find(s => s.id === equippedSkinId);
      if (skin) {
          player.src = skin.src; // Update the player's image
      }
  } else {
      // Fallback to default idle skin if no equipped skin found
      player.src = "/static/images/anim/sprite/idle.png";
  }
});




// ==================================START OF POTION SCRIPT ======================================= //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //

// Potion counts
let healthPotions = 1;
let thunderPotions = Infinity;
let freezePotions = 3;

let isMonsterSpawnAnimationInProgress = false;
let isMonsterDeathAnimationInProgress = false;

// Potion usage locks
let isHealthPotionInUse = false;
let isThunderPotionInUse = false;
let isFreezePotionInUse = false;

// Freeze-related variables
let freezePotionUsed = false;
let freezeTurns = 0;
const freezeTurnsDisplay = document.getElementById('freeze-turn');
const monsterContainer = document.querySelector('.monster');
freezeTurnsDisplay.style.display = 'none';



// ========== HEALTH POTION ========== //
function useHealthPotion() {
  if (isHealthPotionInUse) return; // lock

  if (currentPlayerHealth >= maxPlayerHealth) {
    showFeedback("🧪 Full health already!");
    return;
  }

  if (healthPotions <= 0) {
    showFeedback("No Health Potions!");
    return;
  }

  isHealthPotionInUse = true;
  healthPotions--;
  updatePotionUI();

  playerHeal(3); // Heal the player
  showFeedback("🧪 Health Potion used!");

  // Add healing effect to the player image
  const playerImg = document.querySelector('.player');
  playerImg.classList.add('heal'); // Trigger the healing animation

  // Remove the heal class after the animation ends to reset the effect
  setTimeout(() => {
    playerImg.classList.remove('heal');
  }, 500); // Match the duration of your animation (2s)

  setTimeout(() => {
    isHealthPotionInUse = false; // Unlock after short delay
  }, 200);
}

function useFreezePotion() {
  // Prevent if a potion is in use, or spawn/death animation is in progress
  if (isFreezePotionInUse || isMonsterSpawnAnimationInProgress || isMonsterDeathAnimationInProgress) {
    showFeedback("❌ You can't use the Freeze Potion during monster animation!");
    return;
  }

  if (freezeTurns > 0) {
    showFeedback(`❄️ You still have ${freezeTurns} Freeze Turns left!`);
    return;
  }

  if (freezePotions <= 0) {
    showFeedback('❄️ You have no Freeze Potions left!');
    return;
  }

  isFreezePotionInUse = true;
  freezePotions--;
  freezePotionUsed = true;
  freezeTurns = 1;
  updatePotionUI();
  updateFreezeTurnsDisplay();
  freezeTurnsDisplay.style.display = 'block';

  // Apply the freeze effect after checking for spawn/death animations
  setTimeout(() => {
    if (!isMonsterSpawnAnimationInProgress && !isMonsterDeathAnimationInProgress) {
      applyFreezeEffect(); // Freeze the monster if no animation is in progress
    } else {
      showFeedback("❌ Can't freeze during spawn or death animation!"); // Feedback if freeze is used during animation
    }

    // Reset the Freeze Potion use state after a short delay
    setTimeout(() => {
      isFreezePotionInUse = false; // Unlock potion after short delay
    }, 400);
  }, 400);
}

function applyFreezeEffect() {
  // Freeze the monster only if it's not already frozen
  if (!monsterContainer.classList.contains('frozen')) {
    monsterContainer.classList.add('frozen');
  }
}

function removeFreezeEffect() {
  monsterContainer.classList.remove('frozen');
}


function updateFreezeTurnsDisplay() {
  freezeTurnsDisplay.innerText = `❄️ Freeze Turns Left: ${freezeTurns}`;
}


// ========== DAMAGE PLAYER (checks if frozen) ==========






// ========== THUNDER POTION ==========
const frames = document.querySelectorAll('.sprite-lightning');
let currentFrame = 0;
const monsterElement = document.querySelector('.monster');

function resetFrames() {
  frames.forEach(f => f.classList.remove('active'));
  monsterElement.classList.remove('red');
}

function changeFrame() {
  resetFrames();
  frames[currentFrame].classList.add('active');
  currentFrame++;
  if (currentFrame >= frames.length) {
    clearInterval(animationInterval);
    currentFrame = 0;
    resetFrames();
    monsterElement.classList.add('red');
    setTimeout(() => monsterElement.classList.remove('red'), 70);
  }
}

function useThunderPotion() {
  // Prevent using Thunder Potion if any animation is in progress
  if (isThunderPotionInUse || isMonsterSpawnAnimationInProgress || isMonsterDeathAnimationInProgress) {
    showFeedback("❌ Thunder Potion is on cooldown!");
    return;
  }

  if (thunderPotions <= 0) {
    const feedback = document.getElementById('feedback');
    feedback.innerText = '⚡ You have no Thunder Potions left!';
    setTimeout(() => {
      feedback.innerText = '';
    }, 2000);
    return;
  }

  if (currentMonsterHealth <= 0) {
    console.log("❌ Monster is already defeated. Thunder Potion cannot be used.");
    return;
  }

  isThunderPotionInUse = true;
  thunderPotions--;
  updatePotionUI();

  setTimeout(() => {
    if (currentMonsterHealth > 0) {
      // Handle the Thunder Potion animation and damage
      if (animationInterval !== null) {
        clearInterval(animationInterval);
        resetFrames();
      }

      console.log("Thunder Potion used!");
      animationInterval = setInterval(changeFrame, 80); // faster lightning animation

      setTimeout(() => {
        const monster = document.querySelector(".monster");

        if (!monster.classList.contains('frozen')) {
          monster.classList.add("damaged");
          setTimeout(() => {
            monster.classList.remove("damaged");
            if (currentMonsterHealth > 0) {
              monsterTakeDamage();
            }
            setTimeout(() => {
              isThunderPotionInUse = false;
            }, 150);
          }, 320);
        } else {
          console.log("❄️ Monster is frozen — no damage animation.");
          if (currentMonsterHealth > 0) {
            monsterTakeDamage();
          }
          setTimeout(() => {
            isThunderPotionInUse = false;
          }, 150);
        }
      }, 520);
    } else {
      console.log("❌ Monster is already defeated. Thunder Potion cannot be used.");
      setTimeout(() => {
        isThunderPotionInUse = false;
      }, 150);
    }
  }, 600);
}
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ===================================END OF POTION SCRIPT ======================================== //


// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //
// ================================================================================================ //

// ===== SETTINGS MENU HANDLING =====
function openSettings() {
  document.getElementById("settingsMenu").classList.remove("hidden");
  document.getElementById("gameMenu").classList.add("hidden");
}

function closeSettings() {
  currentLanguageIndex = savedLanguageIndex; // Revert to last applied language
  updateLanguageText(); // Update the display to show correct language
  document.getElementById("settingsMenu").classList.add("hidden");
  document.getElementById("gameMenu").classList.remove("hidden");
}


// ===== VOLUME CONTROL =====
const volumeSlider = document.getElementById("volume");

function updateVolumeFill() {
  const value = volumeSlider.value;
  const percentage = (value / volumeSlider.max) * 100;
  volumeSlider.style.background = `linear-gradient(to right, #4a90e2 ${percentage}%, #d3d3d3 ${percentage}%)`;
}

volumeSlider.addEventListener('input', updateVolumeFill);
updateVolumeFill(); // Initialize on load

// ===== MUTE FUNCTIONALITY =====
let isMuted = false;
let previousVolume = 50;

function toggleMuteCheckbox() {
  const muteCheckbox = document.getElementById("muteCheckbox");

  if (muteCheckbox.checked) {
    previousVolume = volumeSlider.value;
    volumeSlider.value = 0;
    isMuted = true;
  } else {
    volumeSlider.value = previousVolume;
    isMuted = false;
  }

  updateVolumeFill();
}

// Apply settings without closing the menu
function applySettings() {
  const volume = volumeSlider.value;
  const selectedLanguage = languages[currentLanguageIndex];

  console.log("Volume:", volume);
  console.log("Language:", selectedLanguage);

  savedLanguageIndex = currentLanguageIndex; // Save the selected language
  updateAllGameTexts(); // Apply language to game texts
}


// ===== GAME CONTROL =====
function restartGame() {
  location.reload();
}

function goToMainMenu() {
  const routePaths = document.getElementById("route-paths").dataset;
  window.location.href = routePaths.dashboard;
}


// ===== MENU OVERLAY HANDLING =====
function toggleMenu() {
  const overlay = document.getElementById("menuOverlay");
  const menuButton = document.getElementById("menuButton");

  overlay.classList.toggle("hidden");
  menuButton.style.display = overlay.classList.contains("hidden") ? "block" : "none";
}

// Function to close the menu and resume the game
function closeOverlayAndResume() {
  const overlay = document.getElementById("menuOverlay");
  const gameMenu = document.getElementById("gameMenu");
  const menuButton = document.getElementById("menuButton");

  overlay.classList.add("hidden");
  gameMenu.classList.remove("hidden");
  menuButton.style.display = "block";
}

// New function for resume functionality (same as closeOverlayAndResume)
function resumeGame() {
  closeOverlayAndResume(); // Reusing the function to close the menu and show the game menu
}

// ===== ESC KEY FUNCTIONALITY =====
document.addEventListener('keydown', function(event) {
  if (event.key === "Escape") {
    resumeGame(); // Trigger the resumeGame function when ESC is pressed
  }
});

// ===== LANGUAGE CHANGE FUNCTIONALITY =====
// Change language based on direction
function changeLanguage(direction) {
  if (direction === 'prev') {
    currentLanguageIndex = (currentLanguageIndex - 1 + languages.length) % languages.length;
  } else if (direction === 'next') {
    currentLanguageIndex = (currentLanguageIndex + 1) % languages.length;
  }

  updateLanguageText();
}

// Update the display text for the language
function updateLanguageText() {
  const languageText = document.getElementById('languageText');
  languageText.textContent = languages[currentLanguageIndex];
}

// Update all text elements in the game
function updateAllGameTexts() {
  const language = languages[currentLanguageIndex];
  
  // Update specific buttons or elements
  document.querySelectorAll('[data-lang]').forEach(element => {
    const key = element.getAttribute('data-lang');
    if (languageData[language] && languageData[language][key]) {
      element.textContent = languageData[language][key];
    }
  });
}

let languages = ['English', 'Tagalog'];
let currentLanguageIndex = 0;
let savedLanguageIndex = 0; // <-- This stores the last applied language


// Language texts (You can expand this object as needed)
const languageData = {
  English: {
    resume: 'Resume',
    restart: 'Restart',
    settings: 'Settings',
    quit: 'Quit',
    volumeLabel: 'Volume',
    muteLabel: 'Mute',
    languageLabel: 'Language',
    apply: 'Apply',
    back: 'Back',
  },
  Tagalog: {
    resume: 'Magpatuloy',
    restart: 'Magsimula Muli',
    settings: 'Mga Setting',
    quit: 'Mag-quit',
    volumeLabel: 'Bolyum',
    muteLabel: 'I-mute',
    languageLabel: 'Wika',
    apply: 'I-apply',
    back: 'Bumalik',
  },
};









  document.querySelectorAll('.freeze-potion, .health-potion, .thunder-potion').forEach(potion => {
    potion.addEventListener('click', () => {
      potion.classList.remove('potion-clicked');
      void potion.offsetWidth; // Force reflow to restart animation
      potion.classList.add('potion-clicked');

      setTimeout(() => {
        potion.classList.remove('potion-clicked');
      }, 300); // Match with pop animation duration
    });
  });



      

  function addToInput(value) {
    const inputField = document.getElementById('number-input');
    inputField.value += value;
  }

  function backspace() {
    const inputField = document.getElementById('number-input');
    if (inputField.selectionStart !== inputField.selectionEnd) {
      inputField.value = '';
    } else {
      inputField.value = inputField.value.slice(0, -1);
    }
  }



  document.addEventListener('keydown', function(event) {
    const inputField = document.getElementById('number-input');
    if (event.ctrlKey) {
      if (event.key.toLowerCase() === 'a') {
        event.preventDefault();
        inputField.select();
      }
      return;
    }

    if (event.repeat) return;

    if (event.key === 'Backspace') {
      event.preventDefault();
      backspace();
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      handleAttack();
      return;
    }

    if (event.key.length === 1) {
      if ((event.key >= '0' && event.key <= '9') || event.key === '.') {
        event.preventDefault();
        addToInput(event.key);
      } else {
        event.preventDefault();
      }
    }
  });

// Function to handle showing feedback
let feedbackTimeout; // Global variable to store the timeout ID

function showFeedback(message, duration = 3000) { // Default duration set to 3000ms (3 seconds)
  const feedback = document.getElementById('feedback');

  // Clear previous feedback message if it's still displayed
  if (feedbackTimeout) {
    clearTimeout(feedbackTimeout); // Clear the previous timeout
    feedback.innerText = ''; // Clear previous feedback message immediately
  }

  // Display the new feedback message
  feedback.innerText = message;

  // Set the timeout to clear the feedback after the specified duration
  feedbackTimeout = setTimeout(() => {
    feedback.innerText = ''; // Clear feedback after duration
  }, duration);
}


const correctSuggestions = [
  "Wooooo! You did it! Counticus is impressed with your magical math powers!",
  "Bravo, young wizard! You're on your way to becoming a true math master!",
  "Hooray! Your math skills are growing stronger with each answer!",
  "Boom! Counticus is cheering for you! Keep casting those correct answers!",
  "Superb work, math wizard! You’ve unlocked a new level of awesome!",
  "Yes! You’ve mastered this spell! Now let's conquer the next challenge!",
  "Magic at work! Counticus says ‘Well done!’ Keep going!",
  "Perfect spell cast! Keep it up and you'll be a math legend!",
  "Amazing! Counticus is giving you a big thumbs up!",
  "Fantastic! Your magic powers are unstoppable! Ready for more?",
  "Yay! Another win! Keep your wand at the ready for the next adventure!",
  "You're on fire! Counticus says ‘Great job! Keep shining, wizard!’",
  "Excellent! You’ve done it like a true wizard-in-training!",
  "Awesome! Counticus believes you're one step closer to being a math hero!",
  "Look at you go! You've mastered the art of numbers!"
];


const wrongSuggestions = [
  "Oops! Looks like the spell needs a little more practice. Let’s try again!",
  "Hmm, not quite, young wizard. Try breaking the problem down and casting your answer again.",
  "Oh no! Looks like the numbers got tricky! Maybe Counticus can offer a helping spell?",
  "Close, but no magic yet! Counticus says to check your math signs and give it another shot!",
  "Don’t worry! Every mistake is a step toward becoming a math wizard! Try again with a fresh spell!",
  "It’s okay! Mistakes are part of the learning process. Counticus is here to help!",
  "Whoops! Take a deep breath, check your work, and try a new approach with Counticus' guidance.",
  "Hmm, something’s a bit off. Try breaking it down into smaller steps and ask Counticus for help!",
  "Oh no, but don't worry! Let’s take a deep breath and try again — Counticus will show the way!",
  "Close! Check your math signs carefully, and ask Counticus to guide you through it!",
  "Don’t give up, young wizard! You’ve got this! Try again and let Counticus help you along the way!",
  "It’s okay to make mistakes, but you’re getting better every time! Ready to try again?",
  "Hmm, not quite, but you’re getting close! Counticus suggests trying a different approach!",
  "Uh-oh, looks like we missed a step. Let’s try counting on our fingers or asking Counticus!",
  "Not the right spell just yet, but Counticus believes in your math magic! Try again!",
  "Take your time and check the numbers again — Counticus is cheering you on!"
];


// Show the speech bubble with the appropriate suggestion
let speechBubbleTimeout; // Global variable to store the timeout ID

function showSpeechBubble(isCorrect) {
  const bubble = document.getElementById('speech-bubble');
  const suggestions = isCorrect ? correctSuggestions : wrongSuggestions;
  const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];

  // Dynamic title based on correctness
  const title = isCorrect ? 
    "<strong>Well done, math wizard!</strong>" : 
    "<strong>Hmm, need a little help?</strong>";

  // Combine title and suggestion text with added margin at the bottom for spacing
  bubble.innerHTML = `
    <p>${title}</p>
    <p>${randomSuggestion}</p>
  `;
  
  // Add margin to the bottom of the paragraphs
  const paragraphs = bubble.getElementsByTagName('p');
  for (let p of paragraphs) {
    p.style.marginBottom = '1.5vh'; // Space between title and suggestion
  }

  bubble.style.display = 'block'; // Show the bubble

  // Clear any existing timeout before setting a new one
  if (speechBubbleTimeout) {
    clearTimeout(speechBubbleTimeout);
  }

  // Set a new timeout to hide the bubble after 5 seconds
  speechBubbleTimeout = setTimeout(() => {
    bubble.style.display = 'none'; // Hide the bubble after 5 seconds
  }, 5000); // 5 seconds
}



// Example of how you would use it when the user answers a question
  function handleAnswer(input, correctAnswer) {
    const isCorrect = input === correctAnswer;
    // Show the speech bubble with the appropriate suggestion
    showSpeechBubble(isCorrect);

    // Your other game logic, such as updating score, etc.
  }

// Ensure that the bubble is initially hidden when the game starts
window.onload = function() {
  const bubble = document.getElementById('speech-bubble');
  bubble.style.display = 'none'; // Initially hide the speech bubble
};



