class Enemy {
  constructor(enemyHealth, enemySpeed, enemyAttackDamage, size, clr, isBoss = false) {
    this.health = enemyHealth;
    this.speed = enemySpeed;
    this.attackDamage = enemyAttackDamage;
    this.x = random(0, canvasS);
    this.y = random(0, canvasS);
    this.L = size; // Size of the enemy
    this.moveable = true;
    this.clr =clr; //color
    this.isBoss = isBoss; // Boss flag
  }

  moveToPlayer(player, moveable) {
    if (this.moveable) {
      if (player.y < this.y) this.y -= this.speed;
      if (player.y > this.y) this.y += this.speed;
      if (player.x > this.x) this.x += this.speed;
      if (player.x < this.x) this.x -= this.speed;
    }
  }

  show() {
    noStroke();
    fill(this.clr);
    rect(this.x, this.y, this.L, this.L); // Bosses and regular enemies use the same rendering for now
  }
}