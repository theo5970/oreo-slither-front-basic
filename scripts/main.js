/*
 * 기본적인 기능을 구현했습니다.
 * 업데이트, 렌더링, 카메라 등등
 * 
 * 먹이 먹는거는 다음에
*/

// 캔버스
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const player = new Snake(0, 0);

const minMoveSpeed = 200;
const maxMoveSpeed = 800;

// 마우스
let mousePosition = { x: 10, y: 10 };
let isMousePressed = false;

// 업데이트 시간
let lastFrameTime = Date.now();
let deltaTime = 0;

// 카메라 관련
let cameraTransform = undefined;
let zoom = 2;

// 마우스 입력 처리
canvas.onmousedown = function () {  // 눌렀을 때
    isMousePressed = true;
}

canvas.onmouseup = function () {    // 뗐을 때
    isMousePressed = false;
}

canvas.onmousewheel = function (e) {
    if (e.wheelDelta > 0) {
        // Zoom-In
        zoom -= 0.1;
        if (zoom < 0.4) zoom = 0.4;
    } else {
        // Zoom-Out
        zoom += 0.1;
        if (zoom > 2.5) zoom = 2.5;
    }
}

function HandleMouseMove(event) {
    mousePosition.x = event.offsetX;
    mousePosition.y = event.offsetY;
}

canvas.onmousemove = HandleMouseMove;

// 게임 업데이트
function GameLoop() {
    let currentFrameTime = Date.now();
    deltaTime = (currentFrameTime - lastFrameTime) * 0.001; // deltaTime: (현재 프레임 시간) - (이전 프레임 시간)

    UpdateCamera();
    Update();
    Render();
    lastFrameTime = currentFrameTime;

    window.requestAnimationFrame(GameLoop);
}
window.requestAnimationFrame(GameLoop);

// 업데이트 (시간, 카메라)
function UpdateCamera() {
    ctx.canvas.width = window.innerWidth;
    ctx.canvas.height = window.innerHeight;

    let inverseZoom = 1.0 / zoom;

    // 변환 초기화
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 카메라를 플레이어 중앙으로 이동
    ctx.translate((-player.x * inverseZoom) + (ctx.canvas.width * 0.5), (-player.y * inverseZoom) + (ctx.canvas.height * 0.5));
    ctx.scale(inverseZoom, inverseZoom);
}

// 업데이트 (게임)
function Update() {
    let transform = ctx.getTransform();
    let target = TransformPoint(InverseTransform(transform), mousePosition);    // 마우스 위치를 월드 좌표계로 변환

    let dx = target.x - player.x;
    let dy = target.y - player.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    dx /= distance;
    dy /= distance;

    let speed = minMoveSpeed;
    if (isMousePressed) {   // 마우스 누르면 속도 빨라지게 (slither.io 설정 반영)
        speed = maxMoveSpeed;
    }

    if (distance > 100) {
        player.Move(speed * dx * deltaTime, speed * dy * deltaTime);
    }
    player.Update();
}

// 그리기 (렌더링)
function Render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 카메라 작동 확인용 사각형
    DrawRectangle(0, 0, 100, 100, 'blue');
    DrawRectangle(500, 500, 100, 100, 'red');

    DrawSnake(player);
    DrawFPS();
}

// 뱀 그리기 (+ 추후에 최적화 필요)
function DrawSnake(snake) {
    for (let i = snake.positions.length - 1; i >= 0; i--) {
        const bonePosition = snake.positions[i];

        const h = 300 * (i / snake.positions.length);
        const color = 'hsl(' + h + 'deg, 100%, 60%)';   // 무지개 색상으로 알록달록하게~
        DrawCircle(bonePosition.x, bonePosition.y, snake.radius, color); 
    }
}
// 사각형 그리기
function DrawRectangle(x, y, width, height, color) {
    ctx.save();
    ctx.fillStyle = color;

    ctx.translate(x, y);
    ctx.fillRect(-width * 0.5, -height * 0.5, width, height);

    ctx.restore();
}

// 원 그리기
function DrawCircle(x, y, radius, color) {
    ctx.save();
    ctx.fillStyle = color;

    ctx.translate(x, y);
    ctx.beginPath();
    ctx.arc(-radius, -radius, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.restore();
}

/*
 * FPS 표시 (디버깅용)
*/
let lastFPSDrawTime = 0;
let fpsAverage = 0;
const fpsHistoryCount = 10;
const fpsHistory = new Array(fpsHistoryCount).fill(0);

function DrawFPS() {
    // 최근 10개의 FPS 저장
    for (let i = 1; i < fpsHistoryCount; i++) {
        fpsHistory[i - 1] = fpsHistory[i];
    }
    fpsHistory[fpsHistoryCount - 1] = 1.0 / deltaTime;

    // 0.5초마다 드로우할 FPS 업데이트
    lastFPSDrawTime += deltaTime;
    if (lastFPSDrawTime > 0.5) {
        lastFPSDrawTime = 0;

        // FPS 평균 계산
        fpsAverage = 0;
        fpsHistory.forEach(fps => fpsAverage += fps);
        fpsAverage /= fpsHistoryCount;
    }

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 변환 리셋

    ctx.textAlign = 'right';
    ctx.font = 'normal 16px serif';
    ctx.fillText('FPS: ' + Math.floor(fpsAverage), ctx.canvas.width - 32, 32);
    ctx.restore();
}