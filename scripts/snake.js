class Snake {
    constructor(x, y) {
        this.positions = [];
        this.radius = 40;       // 반지름
        this.spacing = 10;      // 관절 사이 간격

        let newX = y;
        for (let i = 0; i < 300; i++) {
            newX -= this.radius * 2;
            this.positions.push({ x: newX, y: y });
        }
    }

    get x() {
        return this.positions[0].x;
    }

    get y() {
        return this.positions[0].y;
    }

    // (dx, dy) 만큼 이동
    Move(dx, dy) {
        const headPosition = this.positions[0];
        headPosition.x += dx;
        headPosition.y += dy;
    }

    // 업데이트
    // 코드 출처 : https://jsfiddle.net/rzx9hmro/1/
    Update() {
        // 각 관절마다 각도 차이 구해서 적용
        for (let i = 1; i < this.positions.length; i++) {
            const currentPosition = this.positions[i];
            const previousPosition = this.positions[i - 1];

            // 이전 관절에서 현재 관절을 가리키는 벡터
            const delta = {
                x: currentPosition.x - previousPosition.x,
                y: currentPosition.y - previousPosition.y
            };

            const angle = Math.atan2(delta.y, delta.x); // 벡터 각도 구하기, atan2는 tan의 역함수

            // 관절 위치 업데이트
            currentPosition.x = previousPosition.x + this.spacing * Math.cos(angle);
            currentPosition.y = previousPosition.y + this.spacing * Math.sin(angle);
        }
    }
}