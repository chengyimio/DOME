// 創建一個狀態對象來管理所有可變狀態
const state = {
    // 基本參數
    angle: 0,
    radius: 40,
    outerRadius: 45,
    innerRadius: 60,

    // 音頻分析器
    mic: null,
    fft: null,
    amplitude: null,

    // 錄音狀態
    isRecording: false,
    isPlaying: false,
    recordStartTime: 0,
    recordDuration: 0,

    // 按鈕
    recordButton: null,
    micStarted: false,

    // 可變參數
    solidCircleCount: 5,
    orbitingCircleCount: 5,
    segmentCount: 32,
    orbitRadiusMultiplier: 1,

    // 放射狀線條的旋轉角度
    radiatingAngle: 0,

    // 顏色控制
    colorAngle: 0,

    // 形狀變化相關變數
    shapeEdges: Array(5).fill(0),
    currentShapeIndex: 0,
    shapeChangeTimer: 0,

    // 保存最後的音頻數據
    lastDecibels: 0,
    lastCircleCount: 5
};

// 常量
export const SHAPE_CHANGE_INTERVAL = 1000;

export default state;