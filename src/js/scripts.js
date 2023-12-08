import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

const sigma = 10;
const rho = 28;
const beta = 8 / 3;

let x = 0.1;
let y = 0;
let z = 0;

const dt = 0.005;
const points = [];


const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000

);

const orbit = new OrbitControls(camera, renderer.domElement);




camera.position.set(0, 0, 50);
orbit.update();

const material = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 20, });
const geometry = new THREE.BufferGeometry();

function updateLorenz() {
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;
  
    x += dx;
    y += dy;
    z += dz;
  
    // Store the new point
    points.push(new THREE.Vector3(x, y, z));
  
    // Limit the number of points to avoid memory issues
    if (points.length > 5000) {
      points.shift();
    }
  
    // Update the geometry with the new points
    geometry.setFromPoints(points);
  }
const line = new THREE.LineSegments(geometry, material);
scene.add(line);

function animate() {
    requestAnimationFrame(animate);

    // Update the Lorenz attractor
    updateLorenz();
    renderer.render(scene, camera);
}


renderer.setAnimationLoop(animate);
