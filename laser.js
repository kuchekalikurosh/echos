class laser{
  constructor(laserSpeed, laserDamage, x, y, x2, y2) {
    this.speed = laserSpeed;
    this.damage = laserDamage;
    this.x = x;
    this.y = y;
    this.angle = atan2((y2 - y), (x2 -x));
    
    this.vx = this.speed * cos(this.angle);
    this.vy = this.speed * sin(this.angle); 
  }
  move(){
    this.x += this.vx;
    this.y += this.vy;
  }
  show(){
    stroke('cyan');
    strokeWeight(4);
    point(this.x, this.y);
  }
}