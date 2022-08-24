import * as THREE from 'three';
import { getRadiusAtT, polar2Cart } from './helpers';


class Ball extends THREE.Group {
    public readonly ball: THREE.Mesh;
    public readonly string: any; //THREE.Line;

    constructor(ballMaterial: THREE.Material) {
        super();
        this.ball = new THREE.Mesh(
            new THREE.SphereGeometry(.1, 32, 16),
            ballMaterial
        );
        this.add(this.ball);

        this.string = new THREE.Line(
            new THREE.BufferGeometry().setFromPoints([
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(0, 0, 0),
            ]),
            new THREE.LineBasicMaterial({ color: 0xffffff })
        )
        this.add(this.string);
    }

    animate(r: number): void {
        this.position.y = - (0.5 + r);

        this.string.geometry.attributes.position.array[4] = (0.5 + r);
        this.string.geometry.attributes.position.needsUpdate = true;
        this.string.geometry.computeBoundingBox();
        this.string.geometry.computeBoundingSphere();
    }
}

class PulleyWheel extends THREE.Group {
    public readonly startingThetaRad: number;
    public readonly wheel: THREE.Mesh;
    public readonly balls: Array<Ball>;

    constructor(wheelMaterial: THREE.Material, startingThetaRad: number, balls: Array<Ball>) {
        super();
        this.startingThetaRad = startingThetaRad;

        this.wheel = new THREE.Mesh(
            new THREE.CylinderGeometry(.1, .1, 0.25, 32),
            wheelMaterial
        );
        this.add(this.wheel);

        this.balls = balls;
        for (const ball of balls) {
            this.add(ball);
        }
    }

    animate(t_sec: number): void {
        const r = getRadiusAtT(this.startingThetaRad, t_sec);
        const [x, y] = polar2Cart(r, this.startingThetaRad);
        this.wheel.position.z = y;
        this.wheel.position.x = -x;

        for (const ball of this.balls) {
            ball.animate(r);
        }
    }
}

export { Ball, PulleyWheel };
