class Enemy{
  constructor(enemyHealth, enemySpeed, 
        enemyAttackDamage, color) {
    console.log(enemyHealth, enemySpeed, enemyAttackDamage);
            this.health = enemyHealth;
            this.speed = enemySpeed;
            this.attackDamage = enemyAttackDamage;
            this.color = color;
            this.x = random(0, 1000);
            this.y = random(0, 1000);
            this.L = 25;
            this.moveable = true;
    }
    moveToPlayer(Player, moveable){
      if(this.x + this.L >= Player.x && this.x <= Player.r + Player.x && this.y + this.L >= Player.y && this.y <= Player.r + Player.x){
        this.movable = false;
      }
      if(this.moveable == true) {
        if(Player.y < this.y) {
            this.y -= this.speed;
        }
        if(Player.y > this.y) {
            this.y += this.speed;
        }
        if(Player.x > this.x) {
            this.x += this.speed;
        }
        if(Player.x < this.x ) {
            this.x -= this.speed;
        }
      }
    }
    show(){
      noStroke()
      fill(color)
      rect(this.x,this.y,this.L, this.L);
    }
}