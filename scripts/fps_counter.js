/*
 * FPS 카운터 (디버깅용)
*/
class FPSCounter {
    /** 
    * @param {number} averageUpdateInterval FPS 평균 업데이트 주기 
    */
    constructor(averageUpdateInterval) {
        this.lastFPSTime = 0;
        this._fpsAverage = 0;
        this.fpsHistory = new Array(10).fill(0);
        this.averageUpdateInterval = averageUpdateInterval || 1.0;
    }

    get fpsAverage() {
        return this._fpsAverage;
    }

    /**
     * 
     * @param {number} deltaTime 이전 프레임에서 현재 프레임까지의 시간 (초 단위)
     */
    Update(deltaTime) {
        // 최근 10개의 FPS 저장
        for (let i = 1; i < this.fpsHistory.length; i++) {
            this.fpsHistory[i - 1] = this.fpsHistory[i];
        }
        this.fpsHistory[this.fpsHistory.length - 1] = 1.0 / deltaTime;

        // 0.5초마다 FPS 평균값 업데이트
        this.lastFPSTime += deltaTime;
        if (this.lastFPSTime > this.averageUpdateInterval) {
            this.lastFPSTime = 0;

            this._fpsAverage = 0;
            this.fpsHistory.forEach(fps => this._fpsAverage += fps);
            this._fpsAverage /= this.fpsHistory.length;
        }
    }
}