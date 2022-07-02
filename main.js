

/* I. VARIABLES */

/* I. (1) variables for video recognition */

let video, features, knn;
let classifier; 
let resArr = ['Background-Noise', 'Up', 'Down', 'Left',  'Right'];  // Because using default model gives indices.

/* I. (2) variables for game objects */

// objects & images for car game
let platform, car, obs; 
let carImg, truckImg01, truckImg02, truckImg03, pedestImg01, pedestImg02, bikeImg01, treeImg01, explosion, bushImg; //  Images

// custom variables for car game
let carWidth = 50, carHeight = 75, carX = 250, carY = 380;
let dist = -100;  //  Where the platform blocks will start
let millage = 0;  //  Increasing with dist

// for snake game
let snake, food;  

/* I. (3) variables for DOM interactions */

let recordsNum = 0; //  number of images recorded for each label (up/down, etc.)
let cardNum = 0;    //  index of currently selected game.


/* I. (4) default values for App Logic */

let gameScr = false;      //  if gameScr is on.
let newModel = true;      //  if user trains a new model.
let detect = true;        //  if image detection is on.
let modelReady = false;   //  if the ml5 model is loaded.
let resReceived = false;  //  if a DOM manipulation gesture is received (will only accept one per second).

/* ----------------------------------------------------------- */

/* II. INITIALIZATION */

// the first game being selected by default.
document.querySelector('.gestureGame').style.border = '3px solid white';

// initial number of images record for image recognition.
const recordNumEach = document.querySelector('#recordNumEach');

// to accept only one recognition-response per second when controlling the DOM.
setInterval(() => {
  resReceived = false;
}, 1000);

// readying ml5.
features = ml5.featureExtractor('MobileNet', ()=>{
  console.log("model is ready");
  modelReady = true;
});
knn = ml5.KNNClassifier();

/* ----------------------------------------------------------- */

/* III. FUNCTIONS */

/* III (1) DOM onclick events */

//  "no-detection" option on the btnScr
function noDetection(){
  if(!modelReady) return;
  detect = false;
  createCanvas(900,600);
  toggleScr();
}

//  "default model" option on the btnScr
function useDefaultModel(){
  if(!modelReady) return;

  newModel = false;

  video = createCapture(VIDEO);
  video.size(900,600);
  video.hide();
  createCanvas(900,600);

  toggleScr();
  
  knn.load("model.json", function() {
    console.log('model is loaded');
    classifyVideo();
  })
}

//  "new model" option on the btnScr
function startTraining(){
  if(!modelReady) return;

  video = createCapture(VIDEO);
  video.size(900,600);
  video.hide();
  createCanvas(900,600);

  document.querySelector('.trainingScr').style.display = 'flex';
  document.querySelector('.btnScr').style.display = 'none';
  document.querySelector('.videoCtrl').style.display = 'flex';

  //  clicking on label buttons to record.
  document.querySelectorAll('.videoBtn')
    .forEach(element => element.addEventListener('click', (e)=>{
      record(e.target.innerHTML);
    }));

  //  clicking on "Let's Go!" and completing the training.
  document.querySelector('.trainingScr button').addEventListener('click', (e)=>{
    // knn.save('model.json');  // UNCOMMENT THIS TO SAVE THE MODEL.
    gameScr = true;
    document.querySelector('.videoCtrl').style.display = 'none';
    document.querySelector('.videoPanel').style.marginLeft = '15vw';
    document.querySelector('.gameScr').style.display = 'flex';
    classifyVideo();
    })
  }

//  HELPER FUNCTION for recording images.
function record(label){
  //Wait for 2 seconds, and then record every 0.1 sec for 3 sec.
  document.querySelector('#recordTypeEach').innerHTML = label;
  setTimeout(() => {
    let t = setInterval(()=>{
      const logits = features.infer(video);
      knn.addExample(logits, label);

      document.querySelector(`#${label}`).innerHTML = (Number)(document.querySelector(`#${label}`).innerHTML) + 1;
      document.querySelector('#recordNumEach').innerHTML =  document.querySelector(`#${label}`).innerHTML;
    }, 100);
    setTimeout(() => {
      clearInterval(t);
    }, 3000);
  }, 2000);
}

//  clicking on gesture games.
function playGame(gameName){
  document.querySelector('.gameScr').style.display = 'none';
  if (gameName === 'snake') startSnakeGame();
    else if (gameName === 'car') startCarGame();
}

/* III (2) DOM manipulations */

//  via video recognition
function scrollByVideo(videoRes){
  if(resReceived) return;
  else{
    if(videoRes === 'Background-Noise' || videoRes === 'Down' || videoRes === 'Up') return;
      // else if(videoRes === 'Up'){
      //   document.querySelectorAll('.gameOption')[cardNum].click();
      // } 
      else if (videoRes === 'Right'){
        document.querySelectorAll('.gameOption')[cardNum].style.border = 'none';
        if(cardNum === 0) cardNum = 7;
        cardNum--;
        document.querySelectorAll('.gameOption')[cardNum].style.border = '3px solid white';
      } else if (videoRes === 'Left'){
        document.querySelectorAll('.gameOption')[cardNum].style.border = 'none';
        if(cardNum === 6) cardNum = -1;
        cardNum++;
        document.querySelectorAll('.gameOption')[cardNum].style.border = '3px solid white';
      }
      resReceived = true;
  }
}

window.addEventListener('keydown',(e)=>{
  console.log(e.key);
    if (e.key === 'Enter'){
      document.querySelectorAll('.gameOption')[cardNum].click();
    }
})


// HELPER FUNCTION for toggling screens
function toggleScr(){
  document.querySelector('.btnScr').style.display = 'none';
  document.querySelector('.trainingScr').style.display = 'flex';
  document.querySelector('.gameScr').style.display = 'flex';
}

/* III. (3) Video Classification */

function classifyVideo(){
  const logits = features.infer(video);
  knn.classify(logits, gotResults);
}

function gotResults(err,res){
if(err) console.error(err);
else{
  let cmd = newModel? res.label : resArr[res.label];  //  because default model gives indices.
  console.log(cmd);
  if(car) driveByVideo(cmd);
      else if (snake) contByVideo(cmd);
      else scrollByVideo(cmd);
  classifyVideo();
}
}

/* ----------------------------------------------------------- */

/* IV. p5.js FUNCTIONS */

// LOOPING _ drawing on the canvas
function draw() {
  if(car){
    background(200);

    //  Either side of the platform
    fill('#72CC50');
    rect(0,0,100,500);
    rect(400,0,100,500);
    
    //  Objects to move.
    platform.move();
    car.build();
    obs.build();
  
    //  Enabling continuous keys:
     keyPressed();
  
    //  Gameplay
    if(car.pos.x < 110 || car.pos.x > (390-carWidth)){
      // Hitting the Platforms
     car.collided();
    }else if((obs.obsRy >= carY && obs.obsRy <= carY + carHeight) || (obs.obsRy + obs.obsRh >= carY && obs.obsRy+obs.obsRh <= carY + carHeight)){
      // Hitting the obstacles
      if(obs.collision(car.pos.x+5, car.pos.x+45)){
        // 5 is to compensate for the png's padding.
        car.collided();
      }
    }
    //  Shows millage
    textSize(20);
    text((millage*0.01).toFixed(1),5,70);

  } else if(snake){
      background('#72CC50');

      snake.show();
      food.show();
      
      //  Gameplay
      if((snake.x <= 0 || snake.x + snake.xLen >= 390)
        || (snake.y <= 0 || snake.y + snake.yLen >= 390)){
          snake.collided();
        }
  } else if(video && !gameScr){
      //  On the videopanel of trainingScr.
      image(video, 0,0,900,600);
  }
}

// LOOPING _ keypress events
function keyPressed(){
  if(car){
      if (keyCode === LEFT_ARROW && keyIsPressed){
          car.move(-5);
        } else if (keyCode === RIGHT_ARROW && keyIsPressed){
          car.move(5);
        }else if (keyCode === UP_ARROW && keyIsPressed){
          playAudio('accel');
          platform.speed += 1;
        }else if (keyCode === DOWN_ARROW && keyIsPressed){
          playAudio('decel');
          platform.speed -= 1;
        }
  } else if (snake) {
      if (keyCode === LEFT_ARROW){
          if(snake.xAxis) snake.dir = -10;
          else{
            snake.posChangeX = -10;
            turnSnakeY();
          }
      } else if (keyCode === RIGHT_ARROW){
          if(snake.xAxis) snake.dir = 10;
          else{
            turnSnakeY();
          }
      } else if (keyCode === UP_ARROW){
          if(!snake.xAxis){
            snake.dir = -10;
          } else {
            snake.posChangeY = -10;
            turnSnakeX();
          }
      } else if (keyCode === DOWN_ARROW){
          if(!snake.xAxis){
            snake.dir = 10;
          } else {
            turnSnakeX();
          }
      }
  } 
}

/* ----------------------------------------------------------- */

/* V. EXTRAS */

// CONTROL THE DOM VIA ARROW KEYS
// window.addEventListener('keydown',(e)=>{
//   if(e.key === 'ArrowRight'){
//     document.querySelectorAll('.gameOption')[cardNum].style.border = 'none';
//     if(cardNum === 6) cardNum = -1;
//     cardNum++;
//     document.querySelectorAll('.gameOption')[cardNum].style.border = '3px solid white';
//   } else if (e.key === 'ArrowLeft'){
//     document.querySelectorAll('.gameOption')[cardNum].style.border = 'none';
//     if(cardNum === 0) cardNum = 7;
//     cardNum--;
//     document.querySelectorAll('.gameOption')[cardNum].style.border = '3px solid white';
//   } else if (e.key === 'ArrowUp'){
//     document.querySelectorAll('.gameOption')[cardNum].click();
//   }
  
// })

/* ----------------------------------------------------------- */







  