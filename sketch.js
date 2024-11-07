let userPlayer = new Player(100, 5);
let enemies = [];
let lasers= [];
let music1;
let shoot1;
var amountOfE = 5;
var lastShotTime = 0;
var shotDelay = 125;
var invis = false;
var isShooting = false;
var gameOver = false;
var score = 0;
var title1;

function preload() {
    music1 = loadSound('main.mp4');
    shoot1 = loadSound('shoot1.mp3');
}

function setup() {
  createCanvas(1000, 1000);
  music1.loop();
  title = true;
  for(var i = 0; i < amountOfE; i++) {
    enemies[i] = new Enemy(100, userPlayer.speed - 4, 25);
  }
}

function draw(){
  titleScreen();
  if(!title){
  background(0)
  displayHealth();
  displayScore(score);
  userPlayer.move(userPlayer.keyz);
  userPlayer.show();
  checkCollisions();
  if(gameOver){
    displayGameOverScreen();
    return;
  }
  if(enemies.length > 0){
    if(isShooting && millis() - lastShotTime > shotDelay) {
      shootLaser();
      lastShotTime = millis();
  }
  for(var i = 0; i < enemies.length; i++) {
    if(enemies[i].moveable){
      enemies[i].moveToPlayer(userPlayer, true);
    }
    enemies[i].show();
    if(checkPlayerEnemyCollision(userPlayer, enemies[i]) && invis == false){
      console.log("damage: " + enemies[i].attackDamage);
      userPlayer.health = Math.max(0, userPlayer.health - enemies[i].attackDamage);
      invis = true;
      setTimeout(() => invis = false, 2000);
    }
    if(userPlayer.health <= 0){
        gameOver = true;
    }
    if(lasers.length > 0) {
      for(var k = 0 ; k < lasers.length; k++){
        lasers[k].show();
        lasers[k].move();
        for (let j = 0; j < enemies.length; j++) {
        if (checkLaserEnemyCollision(lasers[k], enemies[j])) {
          console.log("Laser hit enemy!");
          enemies[j].health -= lasers[k].damage;
          lasers.splice(k, 1); // Remove laser on hit
          if(enemies[j].health == 0){
            enemies.splice(j, 1);
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
    if(enemies.length == 0) {
      amountOfE += 5;
      for(var t = 0; t < amountOfE; t++){
        enemies[t] = new Enemy(100, userPlayer.speed - 4, 5);
      }
    }
  }
}

function shootLaser(){
  var s = dist(userPlayer.x, userPlayer.y, enemies[0].x, enemies[0].y);
      var p = 0;
      for(var i = 1; i < enemies.length; i++){
        var temp = dist(userPlayer.x, userPlayer.y, enemies[i].x, enemies[i].y);
        if(temp < s){
         s = temp ;
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

function separateEnemies(enemy1, enemy2){
  var dx = enemy1.x - enemy2.x;
  var dy = enemy1.y - enemy2.y;
  
  var d = sqrt(dx * dx + dy * dy);
  if(d == 0) return;
  dx /= d;
  dy /= d;
  
  var overlap = (enemy1.L / 2 + enemy2.L /2) - d;
  enemy1.x += dx * overlap / 2;
  enemy1.y += dy * overlap / 2;
  enemy2.x -= dx * overlap / 2;
  enemy2.y -= dy * overlap / 2;
}

function checkPlayerEnemyCollision(player, enemy) {
  let playerRadius = userPlayer.r/ 2; 
  let enemyCx = enemy.x + enemy.L / 2;
  let enemyCy = enemy.y + enemy.L / 2;
  let distX = abs(userPlayer.x - enemyCx);
  let distY = abs(userPlayer.y - enemyCy);

  if (distX > (enemy.L / 2 + playerRadius) || distY > (enemy.L / 2 + playerRadius)) {
    return false; // No collision
  }
  return true; // Collision detected
}

function checkLaserEnemyCollision(laser, enemy) {
  return laser.x > enemy.x && laser.x < enemy.x + enemy.L &&
         laser.y > enemy.y && laser.y < enemy.y + enemy.L;
}

//movement and shoot button inputs
function keyPressed() {
  if(key == 'w') {userPlayer.keyz[0] = true;}
  if(key == 's') {userPlayer.keyz[1] = true;}
  if(key == 'd') {userPlayer.keyz[2] = true;}
  if(key == 'a') {userPlayer.keyz[3] = true;}
  if(key == 'j' && !gameOver) {isShooting = true;}
  if(key == 'j' && gameOver){
    resetGame();
  }
  if(key == 'j' && title) {
    console.log("hit!");
    title = false;
    }
}

function keyReleased() {
  if(key == 'w') userPlayer.keyz[0] = false;
  if(key == 's') userPlayer.keyz[1] = false;
  if(key == 'd') userPlayer.keyz[2] = false;
  if(key == 'a') userPlayer.keyz[3] = false;
  if(key == 'j') isShooting= false;
    
}

function displayGameOverScreen() {
  textAlign(CENTER, CENTER);
  textSize(50);
  fill(255, 0, 0);
  text("Game Over", width / 2, height / 2);
  textSize(20);
  fill(255);
  text("Press J to Restart", width / 2, height / 2 + 60);
}

function displayHealth() {
  noStroke();
  text("Health " + userPlayer.health, 50, 50);
  textSize(50);
}

function displayScore(currentS) {
  noStroke();
  text("Score: " + currentS, 50, 125);
  textSize(32);
}

function titleScreen() {
  if(title) {
    textAlign(CENTER, CENTER);
    textSize(50);
    fill(0, 0, 0);
    text("Game", width / 2, height / 2);
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
  title = true;
}