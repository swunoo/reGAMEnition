
function preload(){
  // Pre-loading images
  carImg = loadImage('../images/CarOptions/car03.png');
  truckImg01 = loadImage('../images/Obstacles/t01.png');
  truckImg02 = loadImage('../images/Obstacles/t02.png');
  truckImg03 = loadImage('../images/Obstacles/t03.png');
  pedestImg01 = loadImage('../images/Obstacles/p01.png');
  bikeImg01 = loadImage('../images/Obstacles/b01.png');
  explosionImg = loadImage('../images/damage.png');
  bushImg = loadImage('../images/Obstacles/others/o01.png');
}

function startCarGame(){
  
  if(video) video.hide();  

  noStroke();
  createCanvas(500, 500);
  platform = new Platform();
  car = new Car();
  obs = new Obs();

  // if(detect) classifyVideo();
}

function Car(){
  this.pos = createVector(carX,carY);
  
  this.build = function(){
    if(this.pos.x<=0 || this.pos.x>=width)this.pos.x = carX;
    
    image(carImg, this.pos.x, this.pos.y, carWidth, carHeight);
  }
  
  // For moving on the x-axis.
  this.move = function(mag){
      this.pos.x += mag;
  }

  this.collided = function(){
    playAudio('explosion01');
    image(explosionImg, car.pos.x, car.pos.y, carHeight, carHeight);
    
    // Stopping the game:
    //game = false;
    //noLoop();
  }
}

function Platform(){
  this.colorArr = [255,'#FF0000'];
  this. speed = 0;
  
  this.move = function(){
    if(this.speed < 0)this.speed=0;
    for(let i = 0; i<20; i++){
      // Platform blocks
      fill(this.colorArr[i%2]);
      rect(100,i*30 + dist,10,30);
      rect(390,i*30 + dist,10,30);
      fill(255);
      rect(247,i*30 + dist,6,15);
      millage += (this.speed*0.1);
    }
    if(dist > 0){
      dist = -120;
      // Kinda a 'magic number', maybe it is related to max_i being 20. 
      // Change it if you'd like to see why.
    }
    else if(dist <= 0){
      dist += this.speed;
    }
  }
}

function Obs () {
  
  this.offset = 0; // To build newObs based on millage.

  // Sees if any collision occured.
  this.collision = function(x1, x2){
    return (this.obsRx <= x1 && x1 <= this.obsRx+this.obsRw) || (this.obsRx <= x2 && x2 <= this.obsRx+this.obsRw);
}
  // Obstacles. Simple change the inner arrays for different images. Format is: ['imageVar', 'width', 'height'].
  this.obsArr = [
    [truckImg01,35,80], [truckImg02,40,100], [truckImg03,50,120], [pedestImg01,20,30], [bikeImg01,30,60]];
  
  
  this.newObs = function () {
      this.obsRx = random(110,360); 
      index = Math.floor(random(0,5));
      this.randObs = this.obsArr[index][0];
      this.obsRw = this.obsArr[index][1];
      this.obsRh = this.obsArr[index][2];
      this.offset = -millage;
      this.randSpeed = random(1,10); // Not working yet.
  }
  this.newObs(); // Calling once initialized.
  
  this.build = function () {
    this.obsRy = millage + this.offset; // 'Moves' the obstacle based on millage.
    if(this.obsRy >= 500){
      // If it went off-screen, a newObs is built.
      this.newObs();
    }else{
      image(this.randObs,this.obsRx, this.obsRy, this.obsRw, this.obsRh);
    }
  }
}

function driveByVideo(videoRes){
  if(videoRes === 'Up'){
    platform.speed += 0.1;
  }else if(videoRes === 'Down'){
    platform.speed -= 0.1;
  }else if(videoRes === 'Left'){
    car.move(5); //Mirrored
  }else if(videoRes === 'Right'){
    car.move(-5); //Mirrored
  }else{
    return;
  }
}