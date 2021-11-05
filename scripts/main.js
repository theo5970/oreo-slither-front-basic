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
let score = 0;
const foods = [];
for (let i = 0; i < 20000; i++) { // 테스트 먹이 추가
    const food = new Food();
    food.x = RandomRange(-15000, 15000);
    food.y = RandomRange(-15000, 15000);
    food.color = `hsl(${RandomRange(0, 360)}deg, 90%, 50%)`;
    food.radius = 10;
    foods.push(food);
}

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

let currentTransform;

// 업데이트 (게임)
function Update() {
    currentTransform = ctx.getTransform();
    let target = TransformPoint(InverseTransform(currentTransform), mousePosition);    // 마우스 위치를 월드 좌표계로 변환

    let dx = target.x - player.x;
    let dy = target.y - player.y;

    let distance = Math.sqrt(dx * dx + dy * dy);

    dx /= distance;
    dy /= distance;

    let speed = minMoveSpeed;
    if (isMousePressed) {   // 마우스 누르면 속도 빨라지게 (slither.io 설정 반영)
        speed = maxMoveSpeed;
    }

    player.Move(speed * dx * deltaTime, speed * dy * deltaTime);
    player.Update();

    CheckCollisions();
}

// 카메라에 표시되는 지 확인
function IsVisibleFromCamera(x, y) {
    const tp = TransformPoint(currentTransform, { x, y });

    const viewportWidth = ctx.canvas.width * zoom;
    const viewportHeight = ctx.canvas.height * zoom;
    return ((tp.x > 0 && tp.x < viewportWidth) && (tp.y > 0 && tp.y < viewportHeight));
}

// 먹이랑 지렁이 머리 충돌체크
function CheckCollisions() {
    for (let i = 0; i < foods.length; i++) {
        const food = foods[i];
        const distance = CalculateDistance(player.x, player.y, food.x, food.y);

        if (distance < player.radius + food.radius) {
            score += 10;
            foods.splice(i, 1);
            player.Grow();
            i--;
        }
    }
}

// 먹이 부족할 때 추가하기
function AddSomeFoods() {
    const countToAdd = 2000 - foods.length + 1;
    for (let i = 0; i < countToAdd; i++) {
        const food = new Food();
        food.x = RandomRange(-15000, 15000);
        food.y = RandomRange(-15000, 15000);
        food.color = `hsl(${RandomRange(0, 360)}deg, 90%, 50%)`;
        food.radius = 10;
        foods.push(food);
    }
}
setInterval(AddSomeFoods, 5000);

// 그리기 (렌더링)
function Render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 카메라 작동 확인용 사각형
    DrawRectangle(0, 0, 100, 100, 'blue');
    DrawRectangle(500, 500, 100, 100, 'red');

    DrawFoods();
    DrawSnake(player);
    DrawUI();
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


// 먹이 그리기
function DrawFoods() {       
    for (let i = 0; i < foods.length; i++) {
        const food = foods[i];

        if (IsVisibleFromCamera(food.x, food.y)) {
            DrawCircle(food.x, food.y, food.radius, food.color);
        }
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
 * FPS & 점수 표시 (디버깅용)
*/
const fpsCounter = new FPSCounter();

function DrawUI() {
    fpsCounter.Update(deltaTime);
    const fpsAverage = fpsCounter.fpsAverage;

    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0); // 변환 리셋

    ctx.fillStyle = 'white';
    ctx.textAlign = 'right';
    ctx.font = 'normal 16px serif';
    ctx.fillText('FPS: ' + Math.round(fpsAverage), ctx.canvas.width - 32, 32);

    ctx.textAlign = 'center';
    ctx.font = 'bold 48px serif';
    ctx.fillText(score, ctx.canvas.width / 2, 64);
    ctx.restore();
}