// Define main game variables and load assets
let userPlayer;
let c = new Player(100, 5); // Cursor-like object for selection screens
let enemies = [];
let lasers = [];
let music1;
let shoot1;
var amountOfE = 5; // Initial number of enemies
var lastShotTime = 0; // Time since last shot was fired
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
var laserDamage;
var laserFireRate; // Minimum delay between shots
var canvasS = 750;
function preload() {
    music1 = loadSound('main.mp4');
    shoot1 = loadSound('shoot1.mp3');
}

function setup() {
  createCanvas(canvasS, canvasS); // Set canvas size
  music1.loop(); // Start background music loop
  // Initialize enemies
  for (var i = 0; i < amountOfE; i++) {
    enemies[i] = new Enemy(100, 1, 25);
  }
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
    if (isShooting && millis() - lastShotTime>laserFireRate) {
      shootLaser();
      lastShotTime = millis();
    }
    for (var i = 0; i < enemies.length; i++){
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
        laserHandler();
      }
    }
  }
  // Spawn more enemies if all are defeated
  if (enemies.length == 0) {
    amountOfE += 5;
    for (var t = 0; t < amountOfE; t++) {
      enemies[t] = new Enemy(100, 1 , 5);
    }
  }
}

function laserHandler(){
  for (var k = 0; k < lasers.length; k++) {
      lasers[k].show();
      lasers[k].move();
      for (let j = 0; j < enemies.length; j++) {
        if (checkLaserEnemyCollision(lasers[k], enemies[j])) {
          console.log("Laser hit enemy!");
          enemies[j].health -= lasers[k].damage;
        if(selectedWeaponOption != "Sniper"){
          lasers.splice(k, 1);
        }  // Remove laser on hit
        if (enemies[j].health <= 0) {
          enemies.splice(j, 1); // Remove enemy on death
          score += 1;
        }
        k--; // Adjust index after removal
        break;
      }
    }
    bulletOutofBounds(lasers);
  }
}

function bulletOutofBounds(l){
  for (var i; i< l.length; i++){
    if(l[i].x < 0 || l[i].x > canvasS || l[i].y < 0 || l[i].y > canvasS){
       l.splice(i, 1);
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
  let l = new laser(15, laserDamage, userPlayer.x, userPlayer.y, enemies[p].x + enemies[p].L / 2, enemies[p].y + enemies[p].L / 2);
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
            if ((pSelection && highlightedPlayerOption) || (wSelection && highlightedWeaponOption)) {
                handleSelection();
            }
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
      }else if (selectedWeaponOption){
        laserDamage = 25;
        laserFireRate = 125;
      }else if(selectedWeaponOption == "Sub Machine Gun"){
        laserDamage = 12.5;
        laserFireRate = 50;
      }
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
    enemies[i] = new Enemy(100, 1, 5);
  }
  gameOver = false;
  gameS = false;
  title = true;
  selectedWeaponOption = " ";
  selectedPlayerOption = " ";
}