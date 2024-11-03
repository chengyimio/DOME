import state from './state.js';
import { SHAPE_CHANGE_INTERVAL } from './state.js';
import {
    updateSingleShape,
    getCurrentColor,
    drawPolygon,
    levelToDecibels,
    calculateCircleCount,
    startAudio
} from './functions.js';

export function setup() {
    createCanvas(300, 300);
    colorMode(HSB, 360, 100, 100, 1.0);
    noFill();
    
    state.shapeEdges.fill(0);
    
    state.recordButton = createButton('Start Mic');
    state.recordButton.position(10, 10);
    state.recordButton.mousePressed(startAudio);
}

export function draw() {
    background(220);
    translate(width/2, height/2);
    
    if (state.isPlaying && millis() - state.shapeChangeTimer > SHAPE_CHANGE_INTERVAL) {
        updateSingleShape();
        state.shapeChangeTimer = millis();
    }
    
    let decibels = 0;
    let currentCircleCount = 5;
    
    if (state.isPlaying && state.micStarted && state.amplitude) {
        let level = state.amplitude.getLevel();
        decibels = levelToDecibels(level);
        decibels = constrain(decibels, 0, 100);
        currentCircleCount = calculateCircleCount();
        state.lastDecibels = decibels;
        state.lastCircleCount = currentCircleCount;
    } else {
        decibels = state.lastDecibels;
        currentCircleCount = state.lastCircleCount;
    }
    
    let mappedRadius = map(decibels, 0, 100, state.innerRadius, state.innerRadius * 3);
    
    // 設置所有線條的統一顏色
    let currentColor = getCurrentColor();
    stroke(currentColor);
    
    // 放射狀線條
    push();
    strokeWeight(0.5);
    rotate(-state.radiatingAngle);
    for(let i = 0; i < 36; i++) {
        rotate(TWO_PI/36);
        line(0, 0, state.radius, 0);
    }
    pop();
    
    if (state.isPlaying) {
        state.radiatingAngle += 0.01;
    }
    
    // 五個形狀
    push();
    strokeWeight(1);
    rotate(state.angle);
    for(let i = 0; i < 5; i++) {
        push();
        rotate(TWO_PI * i / 5);
        translate(40, 0);
        if (i === state.currentShapeIndex && state.isPlaying) {
            strokeWeight(2);
        }
        drawPolygon(0, 0, 100, state.shapeEdges[i]);
        pop();
    }
    pop();
    
    // 外圈軌道
    strokeWeight(6);
    ellipse(0, 0, state.outerRadius * 2, state.outerRadius * 2);
    
    // 動態數量的小圓點
    let darkerColor = getCurrentColor(70);
    fill(darkerColor);
    for(let i = 0; i < currentCircleCount; i++) {
        let sphereAngle = state.angle * 3 + (TWO_PI * i / currentCircleCount);
        let x = cos(sphereAngle) * mappedRadius;
        let y = sin(sphereAngle) * mappedRadius;
        
        strokeWeight(1);
        circle(x, y, 15);
    }
    noFill();
    
    if (state.isPlaying) {
        state.angle += 0.01;
        state.colorAngle = (state.colorAngle + 0.5) % 360;
    }
    
    // 顯示資訊
    push();
    translate(-width/2 + 80, -height/2 + 25);
    fill(0);
    noStroke();
    textSize(16);
    if (state.isRecording) {
        text("Recording Time: " + nf((millis() - state.recordStartTime)/1000, 0, 1) + "s", 10, 0);
        text("Volume: " + nf(decibels, 0, 1) + " dB", 10, 20);
        text("Circles: " + currentCircleCount, 10, 40);
    }
    pop();
}