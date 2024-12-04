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
      if (selectedPlayerOption == "Juggernaut") userPlayer.speed += 0.2; // Very slow increase
      else if (selectedPlayerOption == "Speedster") userPlayer.speed += 0.75; // Faster increase
      else if (selectedPlayerOption == "Default") userPlayer.speed += 0.5; // Normal increase
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
    if (selectedPlayerOption == "Juggernaut") userPlayer.health += 50; // Large increase
    else if (selectedPlayerOption == "Speedster") userPlayer.health += 20; // Smaller increase
    else if (selectedPlayerOption == "Default") userPlayer.health += 35; // Moderate increase
  }
    if (this.type == "damage") {
    let damageIncrement = 0;
    if (selectedWeaponOption == "Sniper") damageIncrement = 15;
    else if (selectedWeaponOption == "Assault Rifle") damageIncrement = 10;
    else if (selectedWeaponOption == "Sub Machine Gun") damageIncrement = 5;

    // Scale damage power-ups more in later rounds
    laserDamage += damageIncrement + Math.floor(rounds / 10);
  }

  }
}
