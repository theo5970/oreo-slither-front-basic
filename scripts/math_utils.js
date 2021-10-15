// Degress 각도를 Radians 각도로 변환
function Deg2Rad(degrees) {
    return degrees * (Math.PI / 180);
}

// Radians 각도를 Degrees 각도로 변환
function Rad2Deg(radians) {
    return radians * (180 / Math.PI);
}

// Transform의 역변환(=역행렬) 구하기
function InverseTransform(matrix) {
    let M = (matrix.a * matrix.d - matrix.b * matrix.c);

    return {
        a: matrix.d / M,
        b: -1 * matrix.b / M,
        c: -1 * matrix.c / M,
        d: matrix.a / M,
        e: (matrix.c * matrix.f - matrix.d * matrix.e) / M,
        f: (matrix.b * matrix.e - matrix.a * matrix.f) / M
    }
}

// 점 Point에 Transform 적용한 새로운 Point 반환.
function TransformPoint(matrix, point) {
    return {
        x: matrix.a * point.x + matrix.c * point.y + matrix.e,
        y: matrix.b * point.x + matrix.d * point.y + matrix.f
    };
}
