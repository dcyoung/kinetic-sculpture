const ROTATION_SPEED_RAD_PER_SEC = Math.PI / 4;

function polar2Cart(r: number, thetaRad: number): Array<number> {
    return [r * Math.cos(thetaRad), r * Math.sin(thetaRad)];
}

function linspace(start: number, stop: number, num: number, endpoint: boolean = true): Array<number> {
    const div = endpoint ? (num - 1) : num;
    const step = (stop - start) / div;
    return Array.from({ length: num }, (_, i) => start + step * i);
}

function getAngleAtTime(t_sec: number): number {
    const periodSec = 2 * Math.PI / ROTATION_SPEED_RAD_PER_SEC;
    return ROTATION_SPEED_RAD_PER_SEC * (t_sec % periodSec);
}

function getRadiusAtT(thetaAtTZero: number, t_sec: number): number {
    const offsetRad = getAngleAtTime(t_sec);
    const thetaAtT = thetaAtTZero - offsetRad;
    return 1.5 + Math.sin(thetaAtT);
}

export { ROTATION_SPEED_RAD_PER_SEC, polar2Cart, linspace, getAngleAtTime, getRadiusAtT };