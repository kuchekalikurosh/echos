class Player{
    constructor(playerHealth, playerSpeed) {
            this.health = playerHealth;
            this.speed = playerSpeed;
            this.x = 500;
            this.y = 500;
            this.r = 25; 
            this.keyz = [false, false, false, false, false];
            this.invis = false;
    }
  
    move(keyzz){
        if(keyzz[0]) {
          if(this.y>0){
            this.y -= this.speed;
          }else{
            this.y += this.speed * 2;
          }
        }
        if(keyzz[1]) {
          if(this.y < 750){
            this.y += this.speed;
          }else{
            this.y -= this.speed * 2;
          }
        }
        if(keyzz[2]) {
          if(this.x < 750){
            this.x += this.speed;
          }else {
            this.x -= this.speed * 2;
          }
        }
        if(keyzz[3]) {
          if(this.x > 0){
            this.x -= this.speed;
          }else {
            this.x += this.speed * 2;
          }
        }
      
      
      // loop checks if enemy object hits player object
      // if true, reduce health
      // otherwise, keep playing
      for (let enemy of enemies) {
        if (checkPlayerEnemyCollision(this, enemy)) {
          if (!this.invis ) {
            console.log("Health: " + this.health);
            this.invis = true;
            setTimeout(() => this.invis = false, 1000);
          }
          if (this.health <= 0) {
            gameOver = true;
          }
          return;
        }
      }
    
    }
  
    show(){
      fill('green');
      ellipse(this.x,this.y,this.r, this.r);
    }
  
}