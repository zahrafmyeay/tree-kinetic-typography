let bg;
let branches = [];
var desktop = true;
var sound;
const AUTO_GROW_DELAY = 3000; 
const AUTO_MOUSE_PRESS_INTERVAL = 300; 
let autoGrowTimeout;
let autoMousePressTimeout;
const MIN_DISTANCE = 50; 
let manualClick = false; 

// Word arrays
const leftWords = ["Be", "Useful", "as a Tree"];
const middleWords = ["Forest", "Begin with", "One Acorn"];
const rightWords = ["Plants", "a Tree", "Plants a Hope"];
const centerWords = ["Trees", "Represent", "Life & Growth"];

// Indonesia words
const leftWordsIndonesia = ["Berguna", "Seperti", "Pohon"];
const middleWordsIndonesia = ["Hutan", "Dimulai dari", "Satu Biji"];
const rightWordsIndonesia = ["Tanam", "Pohon", "Tanam Harapan"];
const centerWordsIndonesia = ["Pohon", "Simbolkan", "Kehidupan"];

let currentLanguage = 'English';
let wordIndex = 0; 
let leftBranchCount = 0; 
let middleBranchCount = 0;
let rightBranchCount = 0; 
let centerBranchCount = 0;
let falling = false; 

function preload() {
  font = loadFont("data/Nunito-VariableFont_wght.ttf");
  sound = loadSound("data/nature.mp3");
}

function setup() {
  bg = loadImage("data/background.jpg");
  createCanvas(windowWidth, windowHeight);
  getAudioContext().suspend();
  if (width < height) {
    desktop = false;
  }
  
  resetBranches();
  startAutoMousePress();
}

function draw() {
  image(bg, 0, 0, width, height, 0, 0, bg.width, bg.height, COVER);
  
  for (let branch of branches) {
    branch.show();
  }

  if (wordIndex >= getCurrentWords().length) {
    falling = true; 
  }

  if (falling) {
    for (let i = branches.length - 1; i >= 0; i--) {
      if (branches[i].level >= 1) { 
        branches[i].fall(i); 
      }
    }
  }
}

function mousePressed() {
  resetAutoGrow(); 

  if (falling) {
    resetBranches();
    falling = false; 
  } else {
    manualClick = true; 
    for (let branch of branches) {
      if (!branch.finished) {
        branch.branchOut();
        break; 
      }
    }

    if (getAudioContext().state !== 'running') {
      getAudioContext().resume();
      sound.play();
      sound.loop();
    }
  }

  setTimeout(() => {
    manualClick = false;
  }, 1000); 
}

function keyTyped() {
  if (key === " ") {
    toggleLanguage(); 

    // Stop the sound if playing
    if (sound.isPlaying()) {
      sound.stop();
      sound.noLoop();
    } else {
      sound.play();
      sound.loop();
    }

    resetBranches();
  }
}

function toggleLanguage() {
  if (currentLanguage === 'English') {
    currentLanguage = 'Indonesia';
  } else {
    currentLanguage = 'English';
  }
}

function resetBranches() {
  branches = [];
  wordIndex = 0; 
  leftBranchCount = middleBranchCount = rightBranchCount = centerBranchCount = 0; 

  let initialBranchLength = desktop ? 150 : 200 * (windowWidth / 800);
  // Create the initial branch without any text
  let initialBranch = new Branch(width / 2, height, -PI / 2, initialBranchLength, "", 0); 
  branches.push(initialBranch);
}


function getCurrentWords() {
  if (currentLanguage === 'English') {
    return [
      ...leftWords, ...middleWords, ...rightWords, ...centerWords
    ];
  } else {
    return [
      ...leftWordsIndonesia, ...middleWordsIndonesia, ...rightWordsIndonesia, ...centerWordsIndonesia
    ];
  }
}

function resetAutoGrow() {
  clearTimeout(autoGrowTimeout);
  clearInterval(autoMousePressTimeout); 
  autoGrowTimeout = setTimeout(() => {
    autoGrow();
  }, AUTO_GROW_DELAY);
 
  startAutoMousePress();
}

function startAutoMousePress() {
  setTimeout(() => {
    autoMousePressTimeout = setInterval(() => {
      if (!manualClick) { 
        mousePressed(); 
      }
    }, AUTO_MOUSE_PRESS_INTERVAL);
  }, AUTO_GROW_DELAY);
}

function autoGrow() {
  for (let branch of branches) {
    if (!branch.finished) {
      branch.branchOut();
      break; 
    }
  }
}

class Branch {
  constructor(x, y, angle, length, text, level) {
    this.x = x;
    this.y = y;
    this.angle = angle;
    this.length = length;
    this.finished = false; 
    this.text = text;
    this.level = level; 
    this.fallDelay = 0;
    this.fallStarted = false;
  }

  show() {
    stroke(255);
    strokeWeight(3);
    let xEnd = this.x + cos(this.angle) * this.length;
    let yEnd = this.y + sin(this.angle) * this.length;

    line(this.x, this.y, xEnd, yEnd);

    if (this.text) {
      strokeWeight(0.5);
      fill("white");
      textAlign(CENTER);
      let textSizeValue = this.length / (desktop ? 5 : 6);
      textSize(textSizeValue);

      let midX = (this.x + xEnd) / 2;
      let midY = (this.y + yEnd) / 2;

      push(); 
      translate(midX, midY); 
      rotate(this.angle);
      text(this.text, 0, 0); 
      pop();
    }
  }

  branchOut() {
    if (this.finished) { return; }
    
    let angleOffset = random(0, PI / 5);  
    let newLevel = this.level + 1; 

    let newX = this.x + cos(this.angle) * this.length;
    let newY = this.y + sin(this.angle) * this.length;

    // Adjust angle
    if (newX < 0 || newX > width || newY < 0 || newY > height) {
      if (newX < 0) {
        this.angle += PI / 4; // Rotate right
      } else if (newX > width) {
        this.angle -= PI / 4; // Rotate left
      }

      if (newY < 0) {
        this.angle += PI / 4; // Rotate down
      } else if (newY > height) {
        this.angle -= PI / 4; // Rotate up
      }

      newX = this.x + cos(this.angle) * this.length;
      newY = this.y + sin(this.angle) * this.length;
    }

    let newBranch;
    let branchLength = desktop ? 150 : 200 * (windowWidth / 800);
    if (wordIndex < leftWords.length) {
      newBranch = new Branch(newX, newY, this.angle - angleOffset, branchLength, getCurrentWords()[wordIndex], newLevel); 
      leftBranchCount++; 
    } else if (wordIndex < leftWords.length + middleWords.length) {
      let xStart, yStart, middleAngle;

      if (middleBranchCount === 0) {
        let rootBranch = branches[0];
        xStart = rootBranch.x + cos(rootBranch.angle) * rootBranch.length;
        yStart = rootBranch.y + sin(rootBranch.angle) * rootBranch.length;
      } else {
        let lastMiddleBranch = branches[branches.length - 1];
        xStart = lastMiddleBranch.x + cos(lastMiddleBranch.angle) * lastMiddleBranch.length;
        yStart = lastMiddleBranch.y + sin(lastMiddleBranch.angle) * lastMiddleBranch.length;
      }

      middleAngle = random(-PI / 2, 0); 
      newBranch = new Branch(xStart, yStart, this.angle + angleOffset, branchLength, getCurrentWords()[wordIndex], newLevel);
      middleBranchCount++;
    } else if (wordIndex < leftWords.length + middleWords.length + rightWords.length) {
      let xStart, yStart, rightAngle;

      if (rightBranchCount === 0) {
        let rootBranch = branches[0]; 
        xStart = rootBranch.x + cos(rootBranch.angle) * rootBranch.length;
        yStart = rootBranch.y + sin(rootBranch.angle) * rootBranch.length;
      } else {
        let lastRightBranch = branches[branches.length - 1]; 
        xStart = lastRightBranch.x + cos(lastRightBranch.angle) * lastRightBranch.length;
        yStart = lastRightBranch.y + sin(lastRightBranch.angle) * lastRightBranch.length;
      }

      rightAngle = random(-PI / 2, 0);
      newBranch = new Branch(xStart, yStart, rightAngle, branchLength, getCurrentWords()[wordIndex], newLevel); 
      rightBranchCount++;
    } else if (wordIndex < leftWords.length + middleWords.length + rightWords.length + centerWords.length) {
      let xStart, yStart, centerAngle;

      if (centerBranchCount === 0) {
        let rootBranch = branches[0]; 
        xStart = rootBranch.x + cos(rootBranch.angle) * rootBranch.length;
        yStart = rootBranch.y + sin(rootBranch.angle) * rootBranch.length;
      } else {
        let lastCenterBranch = branches[branches.length - 1];
        xStart = lastCenterBranch.x + cos(lastCenterBranch.angle) * lastCenterBranch.length;
        yStart = lastCenterBranch.y + sin(lastCenterBranch.angle) * lastCenterBranch.length;
      }

      centerAngle = random(-PI / 2, 0);
      newBranch = new Branch(xStart, yStart, centerAngle, branchLength, getCurrentWords()[wordIndex], newLevel); 
      centerBranchCount++; 
    }

    if (newBranch) {
      branches.push(newBranch);
      wordIndex++; 
    }

    this.finished = true;
  }

  fall(index) {
    if (!this.fallStarted) {
      this.fallDelay = index * 50; 
      this.fallStarted = true; 
    }

    if (this.fallDelay <= 0) {
      this.y += 5; 
    } else {
      this.fallDelay -= deltaTime; 
    }
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}
