let animationInterval = null;

// ─── MAP & STAGE SETUP ───
// Read ?map and ?stage from URL
const urlParams     = new URLSearchParams(window.location.search);
const selectedMap   = urlParams.get('map')   || 'multiplication';
const selectedStage = parseInt(urlParams.get('stage'), 10) || 1;



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
      { name: 'Multiplication-Mob-2', displayName: "SANDY STOMPERS", maxHp: 1, image: 'Multiplication-Mob-2.png' },//3
      { name: 'Multiplication-Mob-3', displayName: "CACTUS CREEPERS", maxHp: 1, image: 'Multiplication-Mob-3.png' },//4
      { name: 'Multiplication-Boss-1', displayName: "SCORCH SCARAB", maxHp: 1, image: 'Multiplication-Boss-1.png' }//5
    ],
    2: [
      { name: 'Multiplication-Mob-4', displayName: "DUNE DWELLERS", maxHp: 2, image: 'Multiplication-Mob-4.png' },
      { name: 'Multiplication-Mob-5', displayName: "SUNBURST STALKERS", maxHp: 4, image: 'Multiplication-Mob-5.png' },//4
      { name: 'Multiplication-Mob-6', displayName: "SUNBURST STALKERS", maxHp: 3, image: 'Multiplication-Mob-6.png' },//
      { name: 'Multiplication-Boss-2', displayName: "PYRAMID PHANTOM", maxHp: 5, image: 'Multiplication-Boss-2.png' }
    ],
    3: [
      { name: 'Multiplication-Mob-7', displayName: "HEAT HOUNDS", maxHp: 2, image: 'Multiplication-Mob-7.png' },
      { name: 'Multiplication-Mob-8', displayName: "HEAT HOUNDS", maxHp: 4, image: 'Multiplication-Mob-8.png' },
      { name: 'Multiplication-Mob-9', displayName: "HEAT HOUNDS", maxHp: 3, image: 'Multiplication-Mob-9.png' },
      { name: 'Multiplication-Boss-3', displayName: "ANUBIS WRATH", maxHp: 5, image: 'Multiplication-Boss-3.png' }
    ]
  },
  division: {
    1: [
      { name: 'Division-Mob-1', displayName: "DIVINE DRAGONS", maxHp: 1, image: 'Division-Mob-1.png' },
      { name: 'Division-Mob-2', displayName: "SPLIT SPIRITS", maxHp: 3, image: 'Division-Mob-2.png' },
      { name: 'Division-Mob-3', displayName: "DIVIDED DEMONS", maxHp: 4, image: 'Division-Mob-3.png' },
      { name: 'Division-Boss-1', displayName: "DIVIDER PHANTOM", maxHp: 5, image: 'Division-Boss-1.png' }
    ],
    2: [
      { name: 'Division-Mob-4', displayName: "SPLIT PHANTOMS", maxHp: 2, image: 'Division-Mob-4.png' },
      { name: 'Division-Mob-5', displayName: "SHATTERED WOLVES", maxHp: 4, image: 'Division-Mob-5.png' },
      { name: 'Division-Mob-6', displayName: "DIVIDING DRAGONS", maxHp: 3, image: 'Division-Mob-6.png' },
      { name: 'Division-Boss-2', displayName: "SPLIT TITAN", maxHp: 5, image: 'Division-Boss-2.png' }
    ],
    3: [
      { name: 'Division-Mob-7', displayName: "SPLIT SHADOWS", maxHp: 2, image: 'Division-Mob-7.png' },
      { name: 'Division-Mob-8', displayName: "DIVIDED SPIRITS", maxHp: 3, image: 'Division-Mob-8.png' },
      { name: 'Division-Mob-9', displayName: "ECLIPSE WOLVES", maxHp: 4, image: 'Division-Mob-9.png' },
      { name: 'Division-Boss-3', displayName: "DIVISION MONSTER", maxHp: 5, image: 'Division-Boss-3.png' }
    ]
  },
  addition: {
    1: [
      { name: 'Addition-Mob-1', displayName: "SWEET SNOWMEN", maxHp: 1, image: 'Addition-Mob-1.png' },
      { name: 'Addition-Mob-2', displayName: "CHERRY PIXIES", maxHp: 3, image: 'Addition-Mob-2.png' },
      { name: 'Addition-Mob-3', displayName: "GLOWING GNOMES", maxHp: 4, image: 'Addition-Mob-3.png' },
      { name: 'Addition-Boss-1', displayName: "FROST GIANT", maxHp: 5, image: 'Addition-Boss-1.png' }
    ],
    2: [
      { name: 'Addition-Mob-4', displayName: "FLUFFY YETIS", maxHp: 1, image: 'Addition-Mob-4.png' },
      { name: 'Addition-Mob-5', displayName: "SNOWY MONSTERS", maxHp: 4, image: 'Addition-Mob-5.png' },
      { name: 'Addition-Mob-6', displayName: "WINTER WOLVES", maxHp: 3, image: 'Addition-Mob-6.png' },
      { name: 'Addition-Boss-2', displayName: "ICE BEHEMOTH", maxHp: 5, image: 'Addition-Boss-2.png' }
    ],
    3: [
      { name: 'Addition-Mob-7', displayName: "FROSTY DRAGONS1", maxHp: 2, image: 'Addition-Mob-7.png' },
      { name: 'Addition-Mob-8', displayName: "FROSTY DRAGONS2", maxHp: 3, image: 'Addition-Mob-8.png' },
      { name: 'Addition-Mob-9', displayName: "FROSTY DRAGONS3", maxHp: 4, image: 'Addition-Mob-9.png' },
      { name: 'Addition-Boss-3', displayName: "ICE TITAN", maxHp: 5, image: 'Addition-Boss-3.png' }
    ]
  },
  subtraction: {
    1: [
      { name: 'Subtraction-Mob-1', displayName: "FIRE SPIRITS", maxHp: 1, image: 'Subtraction-Mob-1.png' },
      { name: 'Subtraction-Mob-2', displayName: "BURNING PHANTOMS", maxHp: 3, image: 'Subtraction-Mob-2.png' },
      { name: 'Subtraction-Mob-3', displayName: "FLAMING HOUNDS", maxHp: 4, image: 'Subtraction-Mob-3.png' },
      { name: 'Subtraction-Boss-1', displayName: "LAVA BEAST", maxHp: 5, image: 'Subtraction-Boss-1.png' }
    ],
    2: [
      { name: 'Subtraction-Mob-4', displayName: "MAGMA TROLLS", maxHp: 1, image: 'Subtraction-Mob-4.png' },
      { name: 'Subtraction-Mob-5', displayName: "VOLCANIC DRAGONS", maxHp: 4, image: 'Subtraction-Mob-5.png' },
      { name: 'Subtraction-Mob-6', displayName: "FIRE GARGOYLES", maxHp: 3, image: 'Subtraction-Mob-6.png' },
      { name: 'Subtraction-Boss-2', displayName: "MOLTEN TITAN", maxHp: 5, image: 'Subtraction-Boss-2.png' }
    ],
    3: [
      { name: 'Subtraction-Mob-7', displayName: "FIRE DEMONS", maxHp: 2, image: 'Subtraction-Mob-7.png' },
      { name: 'Subtraction-Mob-8', displayName: "LAVA SPIRITS", maxHp: 3, image: 'Subtraction-Mob-8.png' },
      { name: 'Subtraction-Mob-9', displayName: "MAGMA WOLVES", maxHp: 4, image: 'Subtraction-Mob-9.png' },
      { name: 'Subtraction-Boss-3', displayName: "VOLCANIC LORD", maxHp: 5, image: 'Subtraction-Boss-3.png' }
    ]
  },
  counting: {
    1: [
      { name: 'Counting-Mob-1', displayName: "GOLDEN GNOMES", maxHp: 1, image: 'Counting-Mob-1.png' },
      { name: 'Counting-Mob-2', displayName: "HARMONY PHANTOMS", maxHp: 3, image: 'Counting-Mob-2.png' },
      { name: 'Counting-Mob-3', displayName: "DRAGONIC WOLVES", maxHp: 4, image: 'Counting-Mob-3.png' },
      { name: 'Counting-Boss-1', displayName: "TIME WIZARD", maxHp: 5, image: 'Counting-Boss-1.png' }
    ],
    2: [
      { name: 'Counting-Mob-4', displayName: "MYSTIC TROLLS", maxHp: 2, image: 'Counting-Mob-4.png' },
      { name: 'Counting-Mob-5', displayName: "LOST PHANTOMS", maxHp: 4, image: 'Counting-Mob-5.png' },
      { name: 'Counting-Mob-6', displayName: "SHADOW DEMONS", maxHp: 3, image: 'Counting-Mob-6.png' },
      { name: 'Counting-Boss-2', displayName: "LUNAR WITCH", maxHp: 5, image: 'Counting-Boss-2.png' }
    ],
    3: [
      { name: 'Counting-Mob-7', displayName: "THUNDER OWLS", maxHp: 1, image: 'Counting-Mob-7.png' },
      { name: 'Counting-Mob-8', displayName: "DARK SKELETONS", maxHp: 4, image: 'Counting-Mob-8.png' },
      { name: 'Counting-Mob-9', displayName: "SPIRIT PHANTOMS", maxHp: 3, image: 'Counting-Mob-9.png' },
      { name: 'Counting-Boss-3', displayName: "COSMIC DRAGON", maxHp: 5, image: 'Counting-Boss-3.png' }
    ]
  },
  comparison: {
    1: [
      { name: 'Comparison-Mob-1', displayName: "SHIMMERING GHOSTS", maxHp: 1, image: 'Comparison-Mob-1.png' },
      { name: 'Comparison-Mob-2', displayName: "MYSTIC WOLVES", maxHp: 3, image: 'Comparison-Mob-2.png' },
      { name: 'Comparison-Mob-3', displayName: "GLIMMERING VAMPIRES", maxHp: 4, image: 'Comparison-Mob-3.png' },
      { name: 'Comparison-Boss-1', displayName: "LUMINESCENT WIZARD", maxHp: 5, image: 'Comparison-Boss-1.png' }
    ],
    2: [
      { name: 'Comparison-Mob-4', displayName: "FROST PHANTOMS", maxHp: 2, image: 'Comparison-Mob-4.png' },
      { name: 'Comparison-Mob-5', displayName: "GHOSTLY VAMPIRES", maxHp: 4, image: 'Comparison-Mob-5.png' },
      { name: 'Comparison-Mob-6', displayName: "SHADOWS OF THE VOID", maxHp: 3, image: 'Comparison-Mob-6.png' },
      { name: 'Comparison-Boss-2', displayName: "LURKING WITCH", maxHp: 5, image: 'Comparison-Boss-2.png' }
    ],
    3: [
      { name: 'Comparison-Mob-7', displayName: "PHANTOM WOLVES", maxHp: 2, image: 'Comparison-Mob-7.png' },
      { name: 'Comparison-Mob-8', displayName: "SHADOW DEMONS", maxHp: 3, image: 'Comparison-Mob-8.png' },
      { name: 'Comparison-Mob-9', displayName: "SPOOKY GHOSTS", maxHp: 4, image: 'Comparison-Mob-9.png' },
      { name: 'Comparison-Boss-3', displayName: "WICKED WIZARD", maxHp: 5, image: 'Comparison-Boss-3.png' }
    ]
  },
  numerals: {
    1: [
      { name: 'Numerals-Mob-1', displayName: "TRICKSTER SPIRITS", maxHp: 1, image: 'Numerals-Mob-1.png' },
      { name: 'Numerals-Mob-2', displayName: "MYSTIC WOLVES", maxHp: 3, image: 'Numerals-Mob-2.png' },
      { name: 'Numerals-Mob-3', displayName: "WISE PHANTOMS", maxHp: 4, image: 'Numerals-Mob-3.png' },
      { name: 'Numerals-Boss-1', displayName: "NUMERAL DEMON", maxHp: 5, image: 'Numerals-Boss-1.png' }
    ],
    2: [
      { name: 'Numerals-Mob-4', displayName: "WIZARD DEMONS", maxHp: 2, image: 'Numerals-Mob-4.png' },
      { name: 'Numerals-Mob-5', displayName: "MAGICAL TROLLS", maxHp: 4, image: 'Numerals-Mob-5.png' },
      { name: 'Numerals-Mob-6', displayName: "SPELLBOUND GNOMES", maxHp: 3, image: 'Numerals-Mob-6.png' },
      { name: 'Numerals-Boss-2', displayName: "NUMERAL TITAN", maxHp: 5, image: 'Numerals-Boss-2.png' }
    ],
    3: [
      { name: 'Numerals-Mob-7', displayName: "FANTASY SPIRITS", maxHp: 2, image: 'Numerals-Mob-7.png' },
      { name: 'Numerals-Mob-8', displayName: "WIZARD BEASTS", maxHp: 3, image: 'Numerals-Mob-8.png' },
      { name: 'Numerals-Mob-9', displayName: "DRAGON MAGES", maxHp: 4, image: 'Numerals-Mob-9.png' },
      { name: 'Numerals-Boss-3', displayName: "NUMERAL BEAST", maxHp: 5, image: 'Numerals-Boss-3.png' }
    ]
  },
  placevalue: {
    1: [
      { name: 'PlaceValue-Mob-1', displayName: "WIZARD BEASTS", maxHp: 1, image: 'PlaceValue-Mob-1.png' },
      { name: 'PlaceValue-Mob-2', displayName: "SPELLBOUND WOLVES", maxHp: 3, image: 'PlaceValue-Mob-2.png' },
      { name: 'PlaceValue-Mob-3', displayName: "MAGICAL PHANTOMS", maxHp: 4, image: 'PlaceValue-Mob-3.png' },
      { name: 'PlaceValue-Boss-1', displayName: "NUMERAL KING", maxHp: 5, image: 'PlaceValue-Boss-1.png' }
    ],
    2: [
      { name: 'PlaceValue-Mob-4', displayName: "MYSTICAL DRAGONS", maxHp: 2, image: 'PlaceValue-Mob-4.png' },
      { name: 'PlaceValue-Mob-5', displayName: "MAGICAL WIZARDS", maxHp: 4, image: 'PlaceValue-Mob-5.png' },
      { name: 'PlaceValue-Mob-6', displayName: "FIRE PHANTOMS", maxHp: 3, image: 'PlaceValue-Mob-6.png' },
      { name: 'PlaceValue-Boss-2', displayName: "FANTASY LORD", maxHp: 5, image: 'PlaceValue-Boss-2.png' }
    ],
    3: [
      { name: 'PlaceValue-Mob-7', displayName: "SPELLBOUND WIZARDS", maxHp: 2, image: 'PlaceValue-Mob-7.png' },
      { name: 'PlaceValue-Mob-8', displayName: "WIZARD WOLVES", maxHp: 3, image: 'PlaceValue-Mob-8.png' },
      { name: 'PlaceValue-Mob-9', displayName: "MYTHICAL SPIRITS", maxHp: 4, image: 'PlaceValue-Mob-9.png' },
      { name: 'PlaceValue-Boss-3', displayName: "PLACE VALUE TITAN", maxHp: 5, image: 'PlaceValue-Boss-3.png' }
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
}





function spawnMonster(idx) {
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

  // Update monster image
  const monsterSrc = `/static/images/gameimg/mnstr/${folder}/${m.image}?t=${Date.now()}`;
  console.log("Monster image source:", monsterSrc); // Debugging line

  monsterImg.src = monsterSrc; // Dynamically set the image source

  // Update monster class
  monsterImg.className = 'monster';
  const specific = `monster-${m.name.toLowerCase().replace(/\s+/g, '-')}`;  // Replace spaces with hyphens
  monsterImg.classList.add(specific);

  // Apply specific size and position adjustments based on the monster class
  monsterImg.style.height = m.height || 'auto';  // Custom height if available
  monsterImg.style.bottom = m.bottom || '0';    // Custom bottom if available
  monsterImg.style.left = m.left || '0';        // Custom left if available

  // Update monster name
  if (monsterNameEl) {
    monsterNameEl.textContent = m.displayName || m.name.replace(/-/g, ' ');
  }

  // Set the spawn animation flag to true
  isMonsterSpawnAnimationInProgress = true;

  // Trigger spawn animation
  monsterImg.classList.remove('monster-spawn');  // Reset animation
  void monsterImg.offsetWidth;  // Force reflow
  monsterImg.classList.add('monster-spawn');

  // Remove animation after it's done
  monsterImg.addEventListener('animationend', function clearSpawn() {
    monsterImg.classList.remove('monster-spawn');
    
    // Set spawn animation flag to false after animation ends
    isMonsterSpawnAnimationInProgress = false;
    
    monsterImg.removeEventListener('animationend', clearSpawn);

    updateHealthBars();
    fetchNewQuestion();
  });
}


function triggerMonsterDeathAnimation() {
  const monsterImg = document.getElementById('monster-sprite');
  if (!monsterImg) return;

  // Start death animation
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
    if (freezePotionUsed && freezeTurns > 0) {
      freezeTurns--;
      updateFreezeTurnsDisplay();
    } else if (currentPlayerHealth > 0) {
      currentPlayerHealth--;
      updateHealthBars();
      console.log('💔 Player HP →', currentPlayerHealth);
    }
    if (freezeTurns <= 0) {
      freezePotionUsed = false;
      removeFreezeEffect();
      freezeTurnsDisplay.style.display = 'none';
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
        freezeTurns = 0;
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


  // ======= ATTACK & QUESTION =======
  function handleAttack() {
    const input  = document.getElementById('number-input').value.trim();
    const answer = document.getElementById('correct-answer').value.trim();
    if (!answer) {
    }
    if (input === '') {
      displayFeedback('Please enter a number!'); // Display feedback using your function
      return;
    }
    if (parseFloat(input) === parseFloat(answer)) {
      fireballAttack();
      fetchNewQuestion();
    } else {
      monsterAttack();
      displayFeedback('❌ Incorrect! Try again.');
    }
    document.getElementById('number-input').value = '';
  }

  function fetchNewQuestion() {
    fetch('/get-new-question')
      .then(r => r.json())
      .then(data => {
        const qText = document.getElementById('question-text');
        const cAns  = document.getElementById('correct-answer');
        const fb    = document.getElementById('feedback');
        if (data.question_text) {
          qText.innerText       = data.question_text;
          cAns.value            = data.correct_answer;
          fb.innerText          = '';
        } else {
          fb.innerText = 'No new question.';
        }
      })
      .catch(e => {
        console.error(e);
        document.getElementById('feedback').innerText = 'Error fetching question.';
      });
  }

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
      const currentStars = parseInt(localStorage.getItem(selectedMap)) || 0;
      if (starsEarned > currentStars) {
            //================CONNECTION > DATABASE==========================//
        localStorage.setItem(selectedMap, starsEarned);
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
  
  
  
  
  
  
  
  
  
  
  
  
  
function getNextMap(currentMap, currentStage) {
  const mapOrder = ['multiplication', 'addition', 'subtraction', 'division', 'counting', 'comparison', 'numerals', 'placevalue'];

  // Find the current map's index
  const currentMapIndex = mapOrder.indexOf(currentMap);

  if (currentMapIndex === -1) {
    console.error('Current map not found!');
    return;
  }

  // After stage 3, stay on the same map and stage (do not automatically switch map)
  return `map=${currentMap}&stage=${currentStage}`;
}

  
  
  
  
  
  
  function incrementStageProgress(stageKey) {
        //================CONNECTION > DATABASE==========================//
    let stageData = JSON.parse(localStorage.getItem(stageKey)) || { stars: 0, completed: false };
  
    if (stageData.stars < 3) {
        stageData.stars++;
    }
  
    if (stageData.stars === 3) {
        stageData.completed = true;
    }
      //================CONNECTION > DATABASE==========================//
    localStorage.setItem(stageKey, JSON.stringify(stageData));
    setStars(`.${stageKey}-stars`, stageKey);
  }
  


  


// STARS UPDATE SA ROADMAP  //

function updateStageProgress(selectedMap, selectedStage, starsEarned) {
  const stageKey = `${selectedMap}-${selectedStage}`;

  // Get existing progress from localStorage (if any)
  const currentProgress = JSON.parse(localStorage.getItem('stageProgress')) || {};

  // Check if the stage is completed and whether we earned more stars
  const existingStars = currentProgress[stageKey]?.stars || 0;

  if (starsEarned > existingStars) {
    currentProgress[stageKey] = {
      stars: starsEarned,
      completed: true
    };
        //================CONNECTION > DATABASE==========================//
    localStorage.setItem('stageProgress', JSON.stringify(currentProgress));
  }
}




function updateRoadmapStars(stageKeyJustCompleted) {
      //================CONNECTION > DATABASE==========================//
  const progress = JSON.parse(localStorage.getItem('stageProgress')) || {};
  const stageProgress = progress[stageKeyJustCompleted];

  if (!stageProgress) return;

  const roadmapItem = document.querySelector(`.stage-item[data-stage-key="${stageKeyJustCompleted}"]`);

  if (roadmapItem) {
    const starWrapper = roadmapItem.querySelector('.star-wrapper');
    const starImgs = starWrapper.querySelectorAll('.progress-star');
    
    starImgs.forEach((img, index) => {
      if (index < stageProgress.stars) {
        img.src = window.STAR_IMAGES.filled;  // 🔁 use global variable from HTML
      } else {
        img.src = window.STAR_IMAGES.empty;
      }
    });
  }
}




function calculateStars() {
  if (currentPlayerHealth === 0) {
    return 0;  // Game over, no stars awarded
  } else {
    return 1;  // Always 1 star when the stage is completed
  }
}




// ======= INITIAL LOAD =======
window.addEventListener('DOMContentLoaded', () => {
  updateRoadmapStars(); 
  initMapAndStage();
  updateHealthBars();
  fetchNewQuestion();
});

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

  const gameOverScreen = document.getElementById('game-over-screen');
  const retryBtn = document.getElementById('retry-btn');
  const homeBtn = document.getElementById('home-btn');

  // Remove monster elements
  document.querySelectorAll('.monster, .monster-spawn, .monster-death').forEach(el => el.remove());

  // Pause game
  gameContainer.classList.add('paused');

  // Show game over screen
  gameOverScreen.style.visibility = 'visible';
  gameOverScreen.classList.add('visible');

  // Close game over screen
  function closeGameOverScreen() {
    gameOverScreen.style.visibility = 'hidden';
    gameOverScreen.classList.remove('visible');
    gameContainer.classList.remove('paused');
  }

  // Route button actions
  retryBtn.onclick = () => {
    window.location.reload();
    closeGameOverScreen();
  };

  homeBtn.onclick = () => {
    window.location.href = routePaths.dashboard;
    closeGameOverScreen();
  };
}



// Function for monster's attack animation
function monsterAttack() {
  const monster = document.querySelector('.monster');
  const player = document.querySelector('.player');

  // Add the attack animation class to the monster
  monster.classList.add("monster-attack");

  // After the attack animation ends, apply the damage to the player
  setTimeout(() => {
    monster.classList.remove("monster-attack"); // Remove the animation class

    // ✅ Gamitin natin yung damagePlayer() function
    damagePlayer();
    
    // Optional: actual damage logic pa rin
    setTimeout(() => {
      playerTakeDamage(); // Call the function to apply damage to the player
    }, 600); // Match sa animation duration
  }, 800); // Match sa monster attack animation
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

  const attackEffects = [
    paths.add,
    paths.sub,
    paths.mul,
    paths.div,
  ];

  const selectedAttack = attackEffects[Math.floor(Math.random() * attackEffects.length)];

  const fireball = document.createElement("img");
  fireball.src = selectedAttack;
  fireball.classList.add("fireball");

  const groundContainer = document.querySelector(".ground");
  const player = document.querySelector(".player");
  const monster = document.querySelector(".monster");

  fireball.style.left = `${player.offsetLeft + player.offsetWidth}px`;
  fireball.style.bottom = "120px";

  // 🧪 1. Add CHARGING visual (optional class effect)
  player.classList.add("charging");

  setTimeout(() => {
    // 🔥 2. Start ATTACK (change the image)
    player.classList.remove("charging");
    player.src = "/static/images/anim/sprite/attack.png";
    player.style.height = "35vh";
    player.style.width = "auto";

    // 🟢 3. Reset to IDLE sprite
    setTimeout(() => {
      player.src = "/static/images/anim/sprite/idle.png";
      player.style.height = "35vh";
      player.style.width = "auto";
    }, 700); // duration of attack pose

    // 🟠 4. Fireball appears
    groundContainer.appendChild(fireball);
    sessionStorage.setItem('fireballTriggered', true);

    // 💢 5. Monster takes visual damage
    setTimeout(() => {
      monster.classList.add("damaged");
      setTimeout(() => {
        monster.classList.remove("damaged");
      }, 600);
    }, 770);

    // 🌀 6. Shake effect
    setTimeout(() => {
      monster.classList.add("shake");
      setTimeout(() => {
        monster.classList.remove("shake");
      }, 600);
    }, 1100);

    // 💀 7. Apply actual HP reduction
    setTimeout(() => {
      if (currentMonsterHealth > 0) {
        monsterTakeDamage();
      }
    }, 1400);

    // 🧼 8. Remove fireball and unlock attack
    setTimeout(() => {
      fireball.remove();
      sessionStorage.removeItem('fireballTriggered');
    }, 1000);

  }, 600); // charging time
}



window.addEventListener("DOMContentLoaded", () => {
  const spawn = document.getElementById("player-spawn");
  const player = document.querySelector(".player");

  // Initially show the spawn effect (player-spawn image)
  spawn.classList.remove("hidden");

  setTimeout(() => {
    // Hide the spawn image after the spawn effect duration
    spawn.classList.add("hidden");

    // Instantly show the player (idle state) without animation delay
    player.classList.remove("hidden");
  }, 1000); // Delay before the spawn image disappears (adjust if needed)
});


window.addEventListener("DOMContentLoaded", () => {
  const monster = document.querySelector(".monster");
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
let freezePotions = 1;

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
  freezeTurns = 3;
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

function damagePlayer() {
  const monsterContainer = document.querySelector('.monster');
  const player = document.querySelector('.player');

  if (!monsterContainer.classList.contains('frozen')) {
    player.classList.add('player-damaged', 'shake');
    setTimeout(() => {
      player.classList.remove('player-damaged', 'shake');
    }, 600);
  } else {
    console.log("❄️ Monster is frozen — no damage to player.");
  }
}



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
    showFeedback("❌ Thunder Potion is on cooldown! Please wait.");
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





