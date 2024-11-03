import state from './state.js';
import { SHAPE_CHANGE_INTERVAL } from './state.js';

// 獲取當前的顏色
export function getCurrentColor(brightness = 90) {
    return color(state.colorAngle, 80, brightness);
}

export function updateSingleShape() {
    if (!state.isPlaying) return;
    state.shapeEdges[state.currentShapeIndex] = random() < 0.33 ? 0 : floor(random(3, 9));
    state.currentShapeIndex = (state.currentShapeIndex + 1) % 5;
}

export function drawPolygon(x, y, radius, edges) {
    if (edges === 0) {
        ellipse(x, y, radius * 2, radius * 2);
    } else {
        beginShape();
        for (let i = 0; i < edges; i++) {
            let angle = TWO_PI * i / edges - PI/2;
            let px = x + cos(angle) * radius;
            let py = y + sin(angle) * radius;
            vertex(px, py);
        }
        endShape(CLOSE);
    }
}

export function startAudio() {
    userStartAudio();
    
    if (!state.micStarted) {
        state.mic = new p5.AudioIn();
        state.mic.start(() => {
            console.log('Mic started');
            state.micStarted = true;
            state.amplitude = new p5.Amplitude();
            state.amplitude.setInput(state.mic);
            state.fft = new p5.FFT(0.8, 256);
            state.fft.setInput(state.mic);
            
            state.recordButton.html('Record');
            state.recordButton.mousePressed(toggleRecording);
        });
    }
}

export function calculateCircleCount() {
    if (!state.fft) return 5;
    
    let spectrum = state.fft.analyze();
    let energy = 0;
    let totalWeight = 0;
    
    let fundamentalStart = Math.floor(85 / 344.53125 * 128);
    let fundamentalEnd = Math.floor(255 / 344.53125 * 128);
    
    let harmonicStart = fundamentalEnd;
    let harmonicEnd = Math.floor(3000 / 344.53125 * 128);
    
    for(let i = fundamentalStart; i < fundamentalEnd; i++) {
        energy += spectrum[i] * 2;
        totalWeight += 2;
    }
    
    for(let i = harmonicStart; i < Math.min(harmonicEnd, spectrum.length); i++) {
        energy += spectrum[i];
        totalWeight += 1;
    }
    
    energy = energy / totalWeight;
    let circleCount = Math.round(map(energy, 0, 255, 2, 7));
    return constrain(circleCount, 2, 6);
}

export function levelToDecibels(level) {
    if (level === 0) return 0;
    let db = 20 * Math.log10(level);
    return map(db, -60, 0, 0, 100);
}

export function toggleRecording() {
    state.isRecording = !state.isRecording;
    state.isPlaying = state.isRecording;
    
    if (state.isRecording) {
        state.recordStartTime = millis();
        state.recordButton.html('Stop');
        state.recordButton.style('background-color', '#ff0000');
        state.recordButton.style('color', '#ffffff');
        
        state.angle = 0;
        state.radiatingAngle = 0;
        state.currentShapeIndex = 0;
        state.shapeChangeTimer = millis();
        
    } else {
        state.recordDuration = (millis() - state.recordStartTime) / 1000;
        state.recordButton.html('Record');
        state.recordButton.style('background-color', '#ffffff');
        state.recordButton.style('color', '#000000');
        
        state.mic.stop();
        state.micStarted = false;
        
        if (state.amplitude) {
            let level = state.amplitude.getLevel();
            state.lastDecibels = levelToDecibels(level);
            state.lastCircleCount = calculateCircleCount();
        }
    }
}