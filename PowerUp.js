class PowerUp {
    constructor(type, x, y) {
      this.type = type; // Power type: "speed", "ammo", "health", "damage"
      this.x = x;
      this.y = y;
      this.size = 30; // Size of the power-up
    }
  
    show() {
      // Display power-up label
      push();
      noStroke();
      textAlign(CENTER);
      textSize(16);
      fill(255); // White text
      text(this.type.charAt(0).toUpperCase() + this.type.slice(1), this.x, this.y - 40);
  
      // Display power-up visual
      noStroke();
      fill(255, 200, 0); // Default color
      if (this.type == "speed") fill(0, 255, 0); // Green for speed
      if (this.type == "ammo") fill(0, 0, 255); // Blue for ammo
      if (this.type == "health") fill(255, 0, 0); // Red for health
      if (this.type == "damage") fill(255, 100, 0); // Orange for damage
  
      ellipse(this.x, this.y, this.size);
      pop();
    }
  
    applyEffect(player, lasers) {
      if (this.type == "speed") {
        if (player.type == "Juggernaut") player.speed += 0.1; // Very slow increase
        else if (player.type == "Speedster") player.speed += 0.5; // Faster increase
        else if (player.type == "Default") player.speed += 0.25; // Normal increase
      }
      if (this.type == "ammo"){
         if(selectedWeaponOption == "Sniper"){
        userPlayer.ammo += 25;
      }else if (selectedWeaponOption == "Assault Rifle") {
        userPlayer.ammo += 150;
      }else if (selectedWeaponOption == "Sub Machine Gun"){
        userPlayer.ammo += 300;  
      }
      } // Increase player ammo
      if (this.type === "health") {
      if (player.type == "Juggernaut") player.health += 50; // Large increase
      else if (player.type == "Speedster") player.health += 20; // Smaller increase
      else if (player.type == "Default") player.health += 35; // Moderate increase
    }
      if (this.type === "damage") {
      let damageIncrement = 0;
      if (selectedWeaponOption === "Sniper") damageIncrement = 15;
      else if (selectedWeaponOption === "Assault Rifle") damageIncrement = 10;
      else if (selectedWeaponOption === "Sub Machine Gun") damageIncrement = 5;
  
      // Scale damage power-ups more in later rounds
      player.damage += damageIncrement + Math.floor(rounds / 10);
    }
  
    }
  }
  