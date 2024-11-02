let angle = 0;
let radius = 40;
let outerRadius = 45;
let innerRadius = 60;
// 音頻分析器
let mic;
let fft;
let amplitude;
// 錄音狀態
let isRecording = false;
let recordStartTime;
let recordDuration = 0;
// 按鈕
let recordButton;
let micStarted = false;
// 可變參數
let solidCircleCount = 5;
let orbitingCircleCount = 5;
let segmentCount = 32;
let orbitRadiusMultiplier = 1;

function setup() {
  createCanvas(400, 400);
  noFill();
  
  // 初始化按鈕
  recordButton = createButton('Start Mic');
  recordButton.position(10, 10);
  recordButton.mousePressed(startAudio);
  
  // 初始化音頻
  mic = new p5.AudioIn();
  mic.getSources().then(sources => {
    console.log('Available audio sources:', sources);
  });
}

function startAudio() {
  userStartAudio();
  
  if (!micStarted) {
    mic.start(() => {
      console.log('Mic started');
      micStarted = true;
      amplitude = new p5.Amplitude();
      amplitude.setInput(mic);
      fft = new p5.FFT(0.8, 64); // 增加FFT的平滑度，使用64個頻帶
      fft.setInput(mic);
      
      // 更改按鈕為錄製按鈕
      recordButton.html('Record');
      recordButton.mousePressed(toggleRecording);
    });
  }
}

// 計算頻率能量並返回對應的圓點數量
function calculateCircleCount() {
  if (!fft) return 5; // 默認值
  
  let spectrum = fft.analyze();
  let bassEnergy = 0;
  let midEnergy = 0;
  let trebleEnergy = 0;
  
  // 分析不同頻段的能量
  // 低頻 (20-250Hz)
  for(let i = 0; i < 10; i++) {
    bassEnergy += spectrum[i];
  }
  bassEnergy = bassEnergy / 10;
  
  // 中頻 (250-2000Hz)
  for(let i = 10; i < 30; i++) {
    midEnergy += spectrum[i];
  }
  midEnergy = midEnergy / 20;
  
  // 高頻 (2000-20000Hz)
  for(let i = 30; i < spectrum.length; i++) {
    trebleEnergy += spectrum[i];
  }
  trebleEnergy = trebleEnergy / (spectrum.length - 30);
  
  // 計算總能量的平均值
  let avgEnergy = (bassEnergy + midEnergy + trebleEnergy) / 3;
  
  // 將能量映射到2-6的範圍
  let circleCount = Math.round(map(avgEnergy, 0, 255, 2, 6));
  return constrain(circleCount, 2, 6);
}

// 將音量級別轉換為 0-100 分貝值
function levelToDecibels(level) {
  if (level === 0) return 0;
  let db = 20 * Math.log10(level);
  return map(db, -60, 0, 0, 100);
}

function toggleRecording() {
  isRecording = !isRecording;
  if (isRecording) {
    recordStartTime = millis();
    recordButton.html('Stop');
    recordButton.style('background-color', '#ff0000');
    recordButton.style('color', '#ffffff');
  } else {
    recordDuration = (millis() - recordStartTime) / 1000;
    recordButton.html('Record');
    recordButton.style('background-color', '#ffffff');
    recordButton.style('color', '#000000');
  }
}

function draw() {
  background(220);
  translate(width/2, height/2);
  
  // 獲取分貝值和圓點數量
  let decibels = 0;
  let currentCircleCount = 5;
  
  if (micStarted && amplitude) {
    let level = amplitude.getLevel();
    decibels = levelToDecibels(level);
    decibels = constrain(decibels, 0, 100);
    currentCircleCount = calculateCircleCount();
  }
  
  // 將分貝值映射到軌道半徑
  let mappedRadius = map(decibels, 0, 100, innerRadius, innerRadius * 3);
  
  // 放射狀線條
  push();
  strokeWeight(0.5);
  for(let i = 0; i < 36; i++) {
    rotate(TWO_PI/36);
    line(0, 0, radius, 0);
  }
  pop();
  
  // 五個大圓形
  push();
  strokeWeight(1);
  rotate(angle);
  for(let i = 0; i < 5; i++) {
    push();
    rotate(TWO_PI * i / 5);
    translate(40, 0);
    ellipse(0, 0, 200, 200);
    pop();
  }
  pop();
  
  // 外圈軌道
  strokeWeight(6);
  ellipse(0, 0, outerRadius * 2, outerRadius * 2);
  
  // 動態數量的小圓點
  for(let i = 0; i < currentCircleCount; i++) {
    let sphereAngle = angle * 3 + (TWO_PI * i / currentCircleCount);
    let x = cos(sphereAngle) * mappedRadius;
    let y = sin(sphereAngle) * mappedRadius;
    
    fill(0);
    strokeWeight(1);
    circle(x, y, 15);
    noFill();
  }
  
  // 更新旋轉角度
  angle += 0.01;
  
  // 顯示資訊
  push();
  translate(-width/2 + 80, -height/2 + 25);
  fill(0);
  noStroke();
  textSize(16);
  if (isRecording) {
    text("Recording Time: " + nf((millis() - recordStartTime)/1000, 0, 1) + "s", 10, 0);
    text("Volume: " + nf(decibels, 0, 1) + " dB", 10, 20);
    text("Circles: " + currentCircleCount, 10, 40);
  }
  pop();
}