let video, features, knn;

/* For Car */
// Variables for sizes:
let carWidth = 50, carHeight = 75, carX = 250, carY = 380;

// Variables for Logic
let recordsNum = 0;
let platform, car, obs; // Objects
let carImg, truckImg01, truckImg02, truckImg03, pedestImg01, pedestImg02, bikeImg01, treeImg01, explosion, bushImg; //  Images
let dist = -100;  //  Where the platform blocks will start
let millage = 0;  //  Increasing with dist

// Variables for Recognition
let classifier; 
//let audioResult = '';
// let video, features, knn;
let gameScr = false;
let newModel = true;
let detect = true;
let modelReady = false;
let resReceived = false;
let resArr = ['Background-Noise', 'Up', 'Down', 'Left',  'Right'];

/* For Snake */
let snake, food;

/* DOM with ARROWKEYS */

let cardNum = 0;
document.querySelector('.gestureGame').style.border = '3px solid white';

// setTimeout(() => {
//   video = createCapture(VIDEO);
// video.hide();
// }, 1000);


setInterval(() => {
  resReceived = false;
}, 1000);

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

function scrollByVideo(videoRes){
  if(resReceived) return;
  else{
    if(videoRes === 'Background-Noise' || videoRes === 'Down') return;
      else if(videoRes === 'Up'){
        document.querySelectorAll('.gameOption')[cardNum].click();
      } else if (videoRes === 'Left'){
        document.querySelectorAll('.gameOption')[cardNum].style.border = 'none';
        if(cardNum === 0) cardNum = 7;
        cardNum--;
        document.querySelectorAll('.gameOption')[cardNum].style.border = '3px solid white';
      } else if (videoRes === 'Right'){
        document.querySelectorAll('.gameOption')[cardNum].style.border = 'none';
        if(cardNum === 6) cardNum = -1;
        cardNum++;
        document.querySelectorAll('.gameOption')[cardNum].style.border = '3px solid white';
      }
      resReceived = true;
  }
}


/* DOM LINKING */

function showGameMenu(){}

function playSnake(){
  document.querySelector('.gameScr').style.display = 'none';
  startSnakeGame();
  // if(newModel){
  //   startSnakeGame();
  // } else {
  //   useModel('snake');
  // }
}
function playCar(){
  document.querySelector('.gameScr').style.display = 'none';
  startCarGame();
}

function noDetection(){
  if(!modelReady) return;

  detect = false;
  createCanvas(900,600);
  document.querySelector('.trainingScr').style.display = 'flex';
  document.querySelector('.btnScr').style.display = 'none';
  document.querySelector('.gameScr').style.display = 'flex';

}

// Video recognition
features = ml5.featureExtractor('MobileNet', ()=>{
  console.log("model is ready");
  modelReady = true;
});
knn = ml5.KNNClassifier();

function startTraining(){
  if(!modelReady) return;

    video = createCapture(VIDEO);
    video.size(900,600);
    video.hide();
    createCanvas(900,600);

    document.querySelector('.trainingScr').style.display = 'flex';
    document.querySelector('.btnScr').style.display = 'none';
    document.querySelector('.videoCtrl').style.display = 'flex';
    document.querySelectorAll('.videoBtn')
      .forEach(element => element.addEventListener('click', (e)=>{
        record(e.target.innerHTML);
      }));
  
    document.querySelector('.trainingScr button').addEventListener('click', (e)=>{
      //knn.save('model.json');
      
      gameScr = true;
      document.querySelector('.videoCtrl').style.display = 'none';
      document.querySelector('.videoPanel').style.marginLeft = '15vw';
      document.querySelector('.gameScr').style.display = 'flex';
      classifyVideo();
    })
  }

  const recordNumEach = document.querySelector('#recordNumEach');

  function record(label){
    //Wait for 2 seconds -> record every 0.1 sec for 3 sec.
    document.querySelector('#recordTypeEach').innerHTML = label;
    setTimeout(() => {
      let t = setInterval(()=>{
        const logits = features.infer(video);
        knn.addExample(logits, label);

        document.querySelector(`#${label}`).innerHTML = (Number)(document.querySelector(`#${label}`).innerHTML) + 1;
        document.querySelector('#recordNumEach').innerHTML =  document.querySelector(`#${label}`).innerHTML;

      }, 300);
      setTimeout(() => {
        clearInterval(t);
      }, 3000);
    }, 2000);
  }

  function useDefaultModel(){
    if(!modelReady) return;

    newModel = false;

    video = createCapture(VIDEO);
    video.size(900,600);
    video.hide();
    createCanvas(900,600);

    document.querySelector('.btnScr').style.display = 'none';
    document.querySelector('.gameScr').style.display = 'flex';
    document.querySelector('.trainingScr').style.display = 'flex';
    
    knn.load("model.json", function() {
      console.log('model is loaded');
      classifyVideo();
    })
  }



  
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
    
      //  Enabling ontinuous keys:
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
        
        if((snake.x <= 0 || snake.x + snake.xLen >= 390)
          || (snake.y <= 0 || snake.y + snake.yLen >= 390)){
            snake.collided();
          }
    } else if(video && !gameScr){
        image(video, 0,0,900,600);
    }
}

  
// Video Recognition
function classifyVideo(){
    const logits = features.infer(video);
    knn.classify(logits, gotResults);
}

function gotResults(err,res){
if(err) console.error(err);
else{
    if(newModel){
        console.log(res.label);
        if(car) driveByVideo(res.label);
        else if (snake) contByVideo(res.label);
        else scrollByVideo(res.label);
    }else{
        console.log(resArr[res.label]);
        if(car) driveByVideo(resArr[res.label]);
        else if (snake) contByVideo(resArr[res.label]);
        else scrollByVideo(resArr[res.label]);
    }
    classifyVideo();
}
}



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
    } else {
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