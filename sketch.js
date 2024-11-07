// Define main game variables and load assets
let userPlayer = new Player(100, 5);
let c = new Player(100, 5); // Cursor-like object for selection screens
let enemies = [];
let lasers = [];
let music1;
let shoot1;
var amountOfE = 5; // Initial number of enemies
var lastShotTime = 0; // Time since last shot was fired
var shotDelay = 125; // Minimum delay between shots
var invis = false; // Invisibility state to prevent constant damage
var isShooting = false; // Shooting state
var gameOver = false;
var score = 0;
var title = true; // Title screen state
var pSelection = false; // Player selection state
var wSelection = false; // Weapon selection state
var gameS = false; // Game screen state
var selectedPlayerOption;
var selectedWeaponOption;
var highlightedWeaponOption;
var highlightedPlayerOption;
var confirmed = false; // Confirmation state for selections

function preload() {
    music1 = loadSound('main.mp4');
    shoot1 = loadSound('shoot1.mp3');
}

function setup() {
  createCanvas(1000, 1000); // Set canvas size
  music1.loop(); // Start background music loop
  // Initialize enemies
  for (var i = 0; i < amountOfE; i++) {
    enemies[i] = new Enemy(100, userPlayer.speed - 4, 25);
  }
}

function draw() {
  // Handle game state transitions
  if (title) {
    titleScreen();
  } else if (pSelection) {
    playerSelectionScreen();
  } else if (wSelection) {
    weaponSelectionScreen();
  } else if (gameS) {
    gameScreen();
  }
}

function gameScreen() {
  background(0); // Set background color
  displayHealth(); // Display player health
  displayScore(score); // Display score
  userPlayer.move(userPlayer.keyz); // Move player based on key inputs
  userPlayer.show(); // Display player
  checkCollisions(); // Check for collisions
  if (gameOver) {
    displayGameOverScreen(); // Show game over screen
    return;
  }

  // Handle enemy and shooting logic
  if (enemies.length > 0) {
    if (isShooting && millis() - lastShotTime > shotDelay) {
      shootLaser();
      lastShotTime = millis();
    }
    for (var i = 0; i < enemies.length; i++) {
      if (enemies[i].moveable) {
        enemies[i].moveToPlayer(userPlayer, true);
      }
      enemies[i].show();
      if (checkPlayerEnemyCollision(userPlayer, enemies[i]) && !invis) {
        console.log("Damage: " + enemies[i].attackDamage);
        userPlayer.health = Math.max(0, userPlayer.health - enemies[i].attackDamage);
        invis = true;
        setTimeout(() => invis = false, 2000);
      }
      if (userPlayer.health <= 0) {
        gameOver = true;
      }
      // Handle laser collisions and score update
      if (lasers.length > 0) {
        for (var k = 0; k < lasers.length; k++) {
          lasers[k].show();
          lasers[k].move();
          for (let j = 0; j < enemies.length; j++) {
            if (checkLaserEnemyCollision(lasers[k], enemies[j])) {
              console.log("Laser hit enemy!");
              enemies[j].health -= lasers[k].damage;
              lasers.splice(k, 1); // Remove laser on hit
              if (enemies[j].health <= 0) {
                enemies.splice(j, 1); // Remove enemy on death
                score += 1;
              }
              k--; // Adjust index after removal
              break;
            }
          }
        }
      }
    }
  }
  // Spawn more enemies if all are defeated
  if (enemies.length == 0) {
    amountOfE += 5;
    for (var t = 0; t < amountOfE; t++) {
      enemies[t] = new Enemy(100, userPlayer.speed - 4, 5);
    }
  }
}

function shootLaser() {
  // Calculate closest enemy and shoot a laser
  var s = dist(userPlayer.x, userPlayer.y, enemies[0].x, enemies[0].y);
  var p = 0;
  for (var i = 1; i < enemies.length; i++) {
    var temp = dist(userPlayer.x, userPlayer.y, enemies[i].x, enemies[i].y);
    if (temp < s) {
      s = temp;
      p = i;
    }
  }
  let l = new laser(10, 50, userPlayer.x, userPlayer.y, enemies[p].x + enemies[p].L / 2, enemies[p].y + enemies[p].L / 2);
  lasers.push(l);
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

// Handle key presses for movement and interactions
function keyPressed() {
  // Update movement keys for game screen or cursor keys for selection screens
  if (key === 'w' || key === 's' || key === 'd' || key === 'a') {
    var keyIndex = {'w': 0, 's': 1, 'd': 2, 'a': 3}[key];
    if (gameS) {
      userPlayer.keyz[keyIndex] = true;
    } else if (pSelection || wSelection) {
      c.keyz[keyIndex] = true;
    }
  }
  
  // Handle the 'j' key for different game states
  if (key === 'j') {
    if (title) { // Transition from title to player selection
      title = false;
      pSelection = true;
    } else if (gameOver) { // Reset the game from the game over screen
      resetGame();
    } else if (gameS) { // Handle shooting in game screen
      isShooting = true;
    } else if (pSelection || wSelection) { // Handle selections in player or weapon selection screens
      handleSelection();
    }
  }
}

function keyReleased() {
  // Handle release of movement keys
  if (key === 'w' || key === 's' || key === 'd' || key === 'a') {
    var keyIndex = {'w': 0, 's': 1, 'd': 2, 'a': 3}[key];
    if (gameS) {
      userPlayer.keyz[keyIndex] = false;
    } else if (pSelection || wSelection) {
      c.keyz[keyIndex] = false;
    }
  }
  // Turn off shooting when 'j' is released in game screen
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
  text("Press J to Restart", width / 2, height / 2 + 60);
}

// Display player health
function displayHealth() {
  noStroke();
  fill(255); // White text color
  textSize(32);
  text("Health: " + userPlayer.health, 50, 50);
}
// Display score
function displayScore(currentS) {
  noStroke();
  text("Score: " + currentS, 50, 125);
  textSize(32);
}
// Title screen function
function titleScreen() {
  background(0); // Black background
  fill(255); // White text
  textAlign(CENTER, CENTER);
  textSize(50);
  text("Press J to Start", width / 2, height / 2);
}
// Player Selection Screen
function playerSelectionScreen() {
    background(200);
    textSize(32);
    textAlign(LEFT, CENTER);

    // Detect hovering over options based on cursor overlap
    highlightedPlayerOption = null;
    if (checkSelection(c.x, c.y, c.r, 100, 200, 500, 250)) {
        highlightedPlayerOption = "Juggernaut";
    } else if (checkSelection(c.x, c.y, c.r, 100, 300, 500, 350)) {
        highlightedPlayerOption = "Speedster";
    } else if (checkSelection(c.x, c.y, c.r, 100, 400, 500, 450)) {
        highlightedPlayerOption = "Default";
    }

    // Draw options with dynamic highlighting
    drawOption(100, 200, "Juggernaut", "3x health, 2x slower", highlightedPlayerOption === "Juggernaut");
    drawOption(100, 300, "Speedster", "2x speed, 80% health", highlightedPlayerOption === "Speedster");
    drawOption(100, 400, "Default", "Default speed and health", highlightedPlayerOption === "Default");

    c.show(); // Display the cursor
    c.move(c.keyz); // Update cursor position based on input
}

// Weapon Selection Screen
function weaponSelectionScreen() {
    background(150);
    textSize(32);
    textAlign(LEFT, CENTER);

    // Detect hovering over options based on cursor overlap
    highlightedWeaponOption = null;
    if (checkSelection(c.x, c.y, c.r, 100, 200, 500, 250)) {
        highlightedWeaponOption = "Sniper";
    } else if (checkSelection(c.x, c.y, c.r, 100, 300, 500, 350)) {
        highlightedWeaponOption = "Assault Rifle";
    } else if (checkSelection(c.x, c.y, c.r, 100, 400, 500, 450)) {
        highlightedWeaponOption = "Sub Machine Gun";
    }

    // Draw options with dynamic highlighting
    drawOption(100, 200, "Sniper", "High damage, slow fire rate", highlightedWeaponOption === "Sniper");
    drawOption(100, 300, "Assault Rifle", "Default stats", highlightedWeaponOption === "Assault Rifle");
    drawOption(100, 400, "Sub Machine Gun", "Low damage, fast fire rate", highlightedWeaponOption === "Sub Machine Gun");

    c.show(); // Display the cursor
    c.move(c.keyz); // Update cursor position based on input
}

function drawOption(x, y, title, description, isHighlighted, isSelected){
  if (isHighlighted) fill(100, 200, 100); // Highlight color
    else fill(255); // Default color

    rect(x - 20, y - 30, 400, 50); // Draw rectangle for the option
    fill(0); // Text color
    text(title, x, y); // Draw the title
    textSize(16);
    text(description, x, y + 20); // Draw the description
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
    // Check each edge of the rectangle to see if it is within the circle's radius
    let nearestX = max(rx, min(cx, rx + rw));
    let nearestY = max(ry, min(cy, ry + rh));
    let dX = cx - nearestX;
    let dY = cy - nearestY;
    return (dX * dX + dY * dY) < (cr * cr);
}

function handleSelection() {
  if (!confirmed) {
    if (pSelection && highlightedPlayerOption) {
      selectedPlayerOption = highlightedPlayerOption;
      confirmed = true;
      console.log(selectedPlayerOption + " selected. Press 'j' again to confirm.");
    } else if (wSelection && highlightedWeaponOption) {
      selectedWeaponOption = highlightedWeaponOption;
      confirmed = true;
      console.log(selectedWeaponOption + " selected. Press 'j' again to confirm.");
    }
  } else {
    if (pSelection) {
      pSelection = false;
      wSelection = true;
      confirmed = false;
      console.log("Moving to weapon selection.");
    } else if (wSelection) {
      wSelection = false;
      gameS = true;
      confirmed = false;
      console.log("Starting the game.");
    }
  }
}

function resetGame() {
  userPlayer.health = 100;
  userPlayer.x = 250;
  userPlayer.y = 250;
  enemies = [];
  amountOfE = 5;
  for(let i = 0; i < amountOfE; i++) {
    enemies[i] = new Enemy(100, userPlayer.speed - 4, 5);
  }
  gameOver = false;
  gameS = false;
  title = true;
  selectedWeaponOption = " ";
  selectedPlayerOption = " ";
}