// Define main game variables and load assets
let userPlayer;
let c = new Player(100, 5); // Cursor-like object for selection screens
let enemies = [];
let lasers = [];
let leaderboard = []; // Leaderboard array
let music1;
let shoot1;
var amountOfE = 5; // Initial number of enemies
var rounds = 1; // Number of total rounds to determine boss spawn
var lastShotTime = 0; // Time since last shot was fired
var invis = false; // Invisibility state to prevent constant damage
var isShooting = false; // Shooting state
var gameOver = false;
var score = 0;
var title = true; // Title screen state
var pSelection = false; // Player selection state
var wSelection = false; // Weapon selection state
var gameS = false; // Game screen state
var lScreen = false;
var selectedPlayerOption;
var selectedWeaponOption;
var highlightedWeaponOption;
var highlightedPlayerOption;
var confirmed = false; // Confirmation state for selections
var laserDamage;
var laserFireRate; // Minimum delay between shots
var canvasS = 750;
let powerUps = []; 
let activeKeys = {};
function preload() {
    music1 = loadSound('main.mp4');
    shoot1 = loadSound('shoot1.mp3');
}

function setup() {
  createCanvas(canvasS, canvasS); // Set canvas size
  if (music1.isLoaded()) {
    music1.loop(); 
  } else {
    music1.onended(() => music1.loop());
  }
  // Initialize enemies
  for (var i = 0; i < amountOfE; i++) {
    enemies[i] = new Enemy(100, 1, 5, 25, color('red'));
  }
  leaderboard = [500, 400, 250, 100, 50];
}

function draw() {
  // Handle game state transitions
  if (title) {
    titleScreen();
  } else if (pSelection) {
    playerSelectionScreen();
  } else if (wSelection) {
    setPlayerOptions();
    weaponSelectionScreen();
  } else if (gameS) {
    gameScreen();
  } else if (gameOver) {
    displayGameOverScreen();
  } else if (lScreen) {
    displayLeaderboardScreen();
  }
}
function gameScreen() {
  background(0); // Set background color
  displayHealth(); // Display player health
  displayScore(score); // Display score
  displayRound(rounds);
  userPlayer.move(userPlayer.keyz); // Move player based on key inputs
  userPlayer.show(); // Display player
  checkCollisions(); 
  if (enemies.length > 0) {
    if (isShooting && millis() - lastShotTime > laserFireRate) {
      shootLaser();
      lastShotTime = millis();
    }
    for (let i = 0; i < enemies.length; i++) {
      if (enemies[i].moveable) {
        enemies[i].moveToPlayer(userPlayer, true);
      }
      enemies[i].show();
      if (checkPlayerEnemyCollision(userPlayer, enemies[i]) && !invis) {
        console.log("Damage: " + enemies[i].attackDamage);
        userPlayer.health = Math.max(0, userPlayer.health - enemies[i].attackDamage);
        invis = true;
        setTimeout(() => (invis = false), 2000);
      }
      if (userPlayer.health <= 0) {
        gameS = false;
        gameOver = true;
      }
    }
    // Handle laser collisions and score update
    if (lasers.length > 0) {
      laserHandler();
    }
  }
  // Display and handle power-ups
  for (let i = powerUps.length - 1; i >= 0; i--) {
    powerUps[i].show();
    if (dist(userPlayer.x, userPlayer.y, powerUps[i].x, powerUps[i].y) < userPlayer.r / 2 + powerUps[i].size / 2) {
      console.log("Power-up collected:", powerUps[i].type);
      powerUps[i].applyEffect(userPlayer); // Apply effect to the player
      powerUps.splice(i, 1); // Remove power-up
    }
  }
  // Spawn new enemies if all enemies are defeated
  if (enemies.length === 0) {
    let baseEnemies = 5; // Base number of enemies
    let growthFactor = 1.25; // Exponential growth factor
    let maxEnemiesPerRound = 100; // Cap on the maximum number of enemies per round
    amountOfE = Math.min(
      maxEnemiesPerRound,
      Math.ceil(baseEnemies * Math.pow(growthFactor, rounds - 1))
    );
    rounds += 1;
    for (let t = 0; t < amountOfE; t++) {
      let enemyColor = color("red");
      if (rounds > 10) enemyColor = color("orange");
      if (rounds > 20) enemyColor = color("yellow");

      enemies.push(
        new Enemy(
          100 + rounds * 10,
          1 + rounds * 0.1,
          5 + rounds,
          25,
          enemyColor
        )
      );
    }
    if (rounds % 5 === 0) {
      enemies.push(
        new Enemy(
          1000 + rounds * 50,
          1.25 + rounds * 0.2,
          25,
          50,
          color("violet")
        )
      );
      console.log("Boss spawned!");
    }
    spawnPowerUps();
  }
}
function spawnPowerUps() {
  let types = ["speed", "ammo", "health", "damage"];
  let powerUpCount = 2; // Always spawn 2 power-ups per round

  // Ensure the total number of power-ups does not exceed 7
  while (powerUps.length < 7 && powerUpCount > 0) {
    let type;
    if (Math.random() < 0.6) {
      type = "ammo"; // 60% chance for ammo
    } else if (Math.random() < 0.8) {
      type = "damage"; // 20% chance for damage
    } else {
      type = random(["speed", "health"]); // 20% split between speed and health
    }

    let x = random(50, canvasS - 50); // Random position
    let y = random(50, canvasS - 50);

    powerUps.push(new PowerUp(type, x, y));
    powerUpCount--;
  }
}


function laserHandler() {
  for (let k = 0; k < lasers.length; k++) {
    lasers[k].show();
    lasers[k].move();
    for (let j = 0; j < enemies.length; j++) {
      if (checkLaserEnemyCollision(lasers[k], enemies[j])) {
        enemies[j].health -= lasers[k].damage;

        if (selectedWeaponOption !== "Sniper") {
          lasers.splice(k, 1); // Remove laser on hit
          k--; // Adjust index after removal
        }

        if (enemies[j].health <= 0) {
          enemies.splice(j, 1);
          score += 1;
        }
        break;
      }
    }

    bulletOutofBounds(lasers);
  }
}


function bulletOutofBounds(lasers) {
  for (let i = lasers.length - 1; i >= 0; i--) {
    if ( lasers[i].x < 0 || lasers[i].x > canvasS || lasers[i].y < 0 || lasers[i].y > canvasS) {
      lasers.splice(i, 1); // Remove laser
    }
  }
}


function setPlayerOptions(){
  if(selectedPlayerOption == "Juggernaut"){
    userPlayer = new Player(300, 2);
  }else if (selectedPlayerOption == "Speedster"){
    userPlayer = new Player(80, 10);
  }else if (selectedPlayerOption == "Default"){
    userPlayer = new Player(100 , 5);   
  }
}

function shootLaser() {
  if (userPlayer.ammo <= 0) {
    console.log("Out of ammo!"); // Debug message
    return; 
  }
  let closestEnemyIndex = 0;
  let shortestDistance = dist(userPlayer.x, userPlayer.y, enemies[0].x, enemies[0].y);
  for (let i = 1; i < enemies.length; i++) {
    let currentDistance = dist(userPlayer.x, userPlayer.y, enemies[i].x, enemies[i].y);
    if (currentDistance < shortestDistance) {
      shortestDistance = currentDistance;
      closestEnemyIndex = i;
    }
  }
  let targetEnemy = enemies[closestEnemyIndex];
  let l = new laser(15, laserDamage, userPlayer.x, userPlayer.y, targetEnemy.x + targetEnemy.L / 2, targetEnemy.y + targetEnemy.L / 2);
  lasers.push(l);
  userPlayer.ammo--; // Deduct ammo
  shoot1.play();
}

function checkCollisions(){
  for(var i = 0; i < enemies.length; i++){
    let enemy1 = enemies[i];
    enemy1.moveable = true;
    for(var j = i+1; j < enemies.length; j++){
      let enemy2 = enemies[j];
      if(enemy1.x < enemy2.x + enemy2.L && enemy1.x + enemy1.L > enemy2.x && enemy1.y < enemy2.y + enemy2.L && enemy1.y + enemy1.L > enemy2.y){
        enemy1.moveable = false;
        enemy2.moveable = false;
        separateEnemies(enemy1,enemy2);
      }
    }
  }
}

// Separate overlapping enemies to prevent them from stacking
function separateEnemies(enemy1, enemy2) {
  var dx = enemy1.x - enemy2.x;
  var dy = enemy1.y - enemy2.y;
  var d = sqrt(dx * dx + dy * dy);
  if (d == 0) return; // Avoid division by zero if exactly overlapped
  dx /= d; // Normalize distance
  dy /= d;
  var overlap = (enemy1.L / 2 + enemy2.L / 2) - d;
  enemy1.x += dx * overlap / 2; // Push away by half overlap
  enemy1.y += dy * overlap / 2;
  enemy2.x -= dx * overlap / 2;
  enemy2.y -= dy * overlap / 2;
}

function checkPlayerEnemyCollision(player, enemy) {
  let playerRadius = player.r / 2; // Assume player radius is half of player.r
  let enemyCx = enemy.x + enemy.L / 2; // Center x of enemy
  let enemyCy = enemy.y + enemy.L / 2; // Center y of enemy
  let distX = abs(player.x - enemyCx);
  let distY = abs(player.y - enemyCy);

  // Check for overlap
  if (distX > (enemy.L / 2 + playerRadius) || distY > (enemy.L / 2 + playerRadius)) {
    return false; // No collision
  }
  return true; // Collision detected
}
function checkLaserEnemyCollision(laser, enemy) {
  // Simple bounding box collision detection
  return laser.x > enemy.x && laser.x < enemy.x + enemy.L &&
         laser.y > enemy.y && laser.y < enemy.y + enemy.L;
}
function keyPressed(event) {
  // Add the pressed key to activeKeys
  activeKeys[key] = true;

  // Ignore Shift key or other modifier keys
  if (key === 'Shift' || key === 'Control' || key === 'Alt') {
    event.preventDefault();
    return;
  }

  const movementKeys = ['w', 's', 'd', 'a'];

  if (movementKeys.includes(key)) {
    const keyIndex = {'w': 0, 's': 1, 'd': 2, 'a': 3}[key];
    if (gameS) {
      userPlayer.keyz[keyIndex] = true;
    } else if (pSelection || wSelection) {
      c.keyz[keyIndex] = true;
    }
  }

  if (key === 'j') {
    if (title) {
      title = false;
      pSelection = true;
    } else if (pSelection && highlightedPlayerOption) {
      handleSelection();
    } else if (wSelection && highlightedWeaponOption) {
      handleSelection();
    } else if (gameOver) {
      gameOver = false;
      lScreen = true;
    } else if (lScreen) {
      resetGame();
    } else if (gameS) {
      isShooting = true;
    }
  }
}

function keyReleased(event) {
  // Remove the released key from activeKeys
  delete activeKeys[key];

  const movementKeys = ['w', 's', 'd', 'a'];

  if (movementKeys.includes(key)) {
    const keyIndex = {'w': 0, 's': 1, 'd': 2, 'a': 3}[key];
    if (gameS) {
      userPlayer.keyz[keyIndex] = false;
    } else if (pSelection || wSelection) {
      c.keyz[keyIndex] = false;
    }
  }

  if (key === 'j' && gameS) {
    isShooting = false;
  }
}


// Display game over screen
function displayGameOverScreen() {
  textAlign(CENTER, CENTER);
  textSize(50);
  fill(255, 0, 0);
  text("Game Over", width / 2, height / 2);
  textSize(20);
  fill(255);
  text("Press J to see leaderboard", width / 2, height / 2 + 60);
}

// Display player health
function displayHealth() {
  textAlign(LEFT); // Reset text alignment
  textSize(32);    // Reset text size
  noStroke();      // Avoid outlines
  fill(255);       // White text
  text("Health: " + userPlayer.health, 50, 50);
}
// Display score
function displayScore(score) {
  textAlign(LEFT); // Reset text alignment
  textSize(32);    // Reset text size
  noStroke();      // Avoid outlines
  fill(255);       // White text
  text("Score: " + score, 50, 125);
}
function displayRound(currentRound) {
  textAlign(LEFT); // Reset text alignment
  textSize(16);    // Reset text size
  noStroke();      // Avoid outlines
  fill(255);       // White text
  text("Round: " + currentRound, 50, 163);
  text("Ammo: " + userPlayer.ammo, 50, 200); // Display round and ammo below score and health
}
// Title screen function
function titleScreen() {
  background(0); // Black background
  fill(255); // White text
  textAlign(CENTER, CENTER);
  textSize(50);
  text("Echoes of Extinction", width / 2, height / 2);
  fill(255); // White text
  textAlign(CENTER, CENTER);
  textSize(25);
  text("Press J to Start", width / 2, height / 2 + 50);
}
// Player Selection Screen
function playerSelectionScreen() {
    background(200);
    textSize(32);
    textAlign(LEFT, CENTER);

    // Detect hovering over options based on cursor overlap
    let previousHighlight = highlightedPlayerOption; // Store previous highlighted option
    highlightedPlayerOption = null;
    if (checkSelection(c.x, c.y, c.r, 80, 170, 400, 70)) {
        highlightedPlayerOption = "Juggernaut";
    } else if (checkSelection(c.x, c.y, c.r, 80, 270, 400, 70)) {
        highlightedPlayerOption = "Speedster";
    } else if (checkSelection(c.x, c.y, c.r, 80, 370, 400, 70)) {
        highlightedPlayerOption = "Default";
    }
    if (highlightedPlayerOption !== previousHighlight) {
        confirmed = false;
    }
    // Draw options with dynamic highlighting
    drawOption(100, 200, "Juggernaut", "3x health, 2.5x slower", highlightedPlayerOption == "Juggernaut");
    drawOption(100, 300, "Speedster", "2x speed, 80% health", highlightedPlayerOption == "Speedster");
    drawOption(100, 400, "Default", "Default speed and health", highlightedPlayerOption == "Default");

    c.show(); // Display the cursor
    c.move(c.keyz); // Update cursor position based on input
}

// Weapon Selection Screen
function weaponSelectionScreen() {
    background(150);
    textSize(32);
    textAlign(LEFT, CENTER);

    let previousHighlight = highlightedWeaponOption; // Store previous highlighted option
    highlightedWeaponOption = null;
    if (checkSelection(c.x, c.y, c.r, 80, 170, 400, 70)) {
        highlightedWeaponOption = "Sniper";
      
    } else if (checkSelection(c.x, c.y, c.r, 80, 270, 400, 70)) {
        highlightedWeaponOption = "Assault Rifle";
    } else if (checkSelection(c.x, c.y, c.r, 80, 370, 400, 70)) {
        highlightedWeaponOption = "Sub Machine Gun";
    }
  
    if (highlightedWeaponOption !== previousHighlight) {
        confirmed = false;
    }
    // Draw options with dynamic highlighting
    drawOption(100, 200, "Sniper", "High damage, slow fire rate", highlightedWeaponOption == "Sniper");
    drawOption(100, 300, "Assault Rifle", "Default stats", highlightedWeaponOption == "Assault Rifle");
    drawOption(100, 400, "Sub Machine Gun", "Low damage, fast fire rate", highlightedWeaponOption == "Sub Machine Gun");

    c.show(); // Display the cursor
    c.move(c.keyz); // Update cursor position based on input
}

function drawOption(x, y, title, description, isHighlighted, isSelected){
  if (isHighlighted) fill(100, 200, 100); // Highlight color
    else fill(255); // Default color
    noStroke();
    rect(x - 20, y - 30, 400, 70); // Draw rectangle for the option
    fill(0); // Text color
    text(title, x, y); // Draw the title
    textSize(16);
    text(description, x, y + 25); // Draw the description
    textSize(32);
}

function confirmPlayerSelection(option) {
  if (!confirmed) {
    selectedPlayerOption = option;
    confirmed = true;
    console.log(option + " selected. Press 'j' again to confirm.");
  } else {
    pSelection = false;
    wSelection = true;
    confirmed = false;
  }
}

function confirmWeaponSelection(option) {
  if (!confirmed) {
    selectedWeaponOption = option;
    confirmed = true;
    console.log(option + " selected. Press 'j' again to confirm.");
  } else {
    wSelection = false;
    gameS = true;
    confirmed = false;
  }
}

function checkSelection(cx, cy, cr, rx, ry, rw, rh) {
    return cx > rx && cx < rx + rw &&
         cy > ry && cy < ry + rh;
}

function handleSelection() {
  if (pSelection && highlightedPlayerOption) {
    if(!confirmed) {
      selectedPlayerOption = highlightedPlayerOption;
      confirmed = true;
      console.log(selectedPlayerOption + " selected. Press 'j' again to confirm.");
    }else if (selectedPlayerOption == highlightedPlayerOption){
      pSelection = false;
      wSelection = true;
      confirmed = false;
      console.log("Moving to weapon selection.");
    }
  }else if (wSelection && highlightedWeaponOption) {
    
    if (!confirmed) {
      selectedWeaponOption = highlightedWeaponOption;
      confirmed = true;
      console.log(selectedWeaponOption + " selected. Press 'j' again to confirm.");
    }else if(selectedWeaponOption== highlightedWeaponOption) {
      wSelection = false;
      gameS = true;
      confirmed = false;
      console.log("Starting the game.");
      
      if(selectedWeaponOption == "Sniper"){
        laserDamage = 100;
        laserFireRate = 2000;
        userPlayer.ammo = 50;
      }else if (selectedWeaponOption){
        laserDamage = 25;
        laserFireRate = 200;
        userPlayer.ammo = 300;
      }else if(selectedWeaponOption == "Sub Machine Gun"){
        laserDamage = 12.5;
        laserFireRate = 12.5;
        userPlayer.ammo = 500;
      }
    }
  }
}

function resetGame() {
  enemies = [];
  amountOfE = 5;
  for(let i = 0; i < amountOfE; i++) {
    enemies[i] = new Enemy(100, 1, 5, 25, color('red'));
  }
  score = 0;
  rounds = 0;
  lScreen = false;
  gameOver = false;
  gameS = false;
  title = true;
  selectedWeaponOption = " ";
  selectedPlayerOption = " ";
}
function displayLeaderboardScreen() {
  background(0);
  fill(255);
  textSize(32);
  textAlign(CENTER, CENTER);
  leaderboard.push(score);
  leaderboard = [...new Set(leaderboard)].sort((a, b) => b - a); // Remove duplicates and sort
  if (leaderboard.length > 5) leaderboard.pop(); // Keep top 5 scores

  text("LEADERBOARD", width / 2, 50); // Title
  textSize(24);

  for (var i = 0; i < leaderboard.length; i++) {
    if (score === leaderboard[i]) {
      fill(255, 255, 0); // Highlight the player's score
      text(`${i + 1}. ${leaderboard[i]} (You)`, width / 2, 150 + i * 50);
    } else {
      fill(255); // Default color for other scores
      text(`${i + 1}. ${leaderboard[i]}`, width / 2, 150 + i * 50);
    }
  }

  fill(255); 
  textSize(20);
  text("Press 'J' to return to title screen", width / 2, height - 50);
}

// Fix the cyan text issue by ensuring proper styling before rendering text
function displayGameOverScreen() {
  noStroke(); // Avoid text outlines
  textAlign(CENTER, CENTER);
  textSize(50);
  fill(255, 0, 0); // Red text
  text("Game Over", width / 2, height / 2);
  
  textSize(20);
  fill(255); // White text
  text("Press J to see leaderboard", width / 2, height / 2 + 60);
}

// Fix the cyan text issue by ensuring proper styling before rendering text
function displayGameOverScreen() {
  noStroke(); // Avoid text outlines
  textAlign(CENTER, CENTER);
  textSize(50);
  fill(255, 0, 0); // Red text
  text("Game Over", width / 2, height / 2);
  
  textSize(20);
  fill(255); // White text
  text("Press J to see leaderboard", width / 2, height / 2 + 60);
} 