import * as THREE from 'three';
import { OrbitControls } from 'OrbitControls';

// Parameters for the Lorenz attractor
const sigma = 10;
const rho = 28;
const beta = 8 / 3;

let x = 0.1;
let y = 0;
let z = 0;

const dt = 0.01; // Time step for Lorenz attractor
const lorenzPoints = [];

// Wave equation parameters
const waveSpeed = 1.0; // Speed of the wave
const nx = 100; // Number of grid points in x
const ny = 100; // Number of grid points in y
const dx = 1.0; // Grid spacing in x
const dy = 1.0; // Grid spacing in y

// Initialize the wave grid
let u = Array.from({ length: nx }, () => Array(ny).fill(0));
let uPrev = Array.from({ length: nx }, () => Array(ny).fill(0));
let uNext = Array.from({ length: nx }, () => Array(ny).fill(0));

// Set initial conditions
for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
        if (i === nx / 2 && j === ny / 2) {
            u[i][j] = 10; // Initial displacement at the center
        }
    }
}

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
camera.position.set(0, 0, 150); // Adjust camera position to view both scenes
orbit.update();

// Create materials and geometries for both visualizations
const lorenzMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00, linewidth: 2 });
const lorenzGeometry = new THREE.BufferGeometry();
const lorenzLine = new THREE.LineSegments(lorenzGeometry, lorenzMaterial);
scene.add(lorenzLine);

const waveGeometry = new THREE.BufferGeometry();
const waveMaterial = new THREE.PointsMaterial({ size: 0.2 });
const wavePoints = new THREE.Points(waveGeometry, waveMaterial);
scene.add(wavePoints);

const colorArray = [];

function updateLorenz() {
    const dx = sigma * (y - x) * dt;
    const dy = (x * (rho - z) - y) * dt;
    const dz = (x * y - beta * z) * dt;

    x += dx;
    y += dy;
    z += dz;

    // Store the new point
    lorenzPoints.push(new THREE.Vector3(x - 80, y - 50, z - 50)); // Adjust position to be higher and more to the left

    // Limit the number of points to avoid memory issues
    if (lorenzPoints.length > 5000) {
        lorenzPoints.shift();
    }

    // Update the geometry with the new points
    lorenzGeometry.setFromPoints(lorenzPoints);
}

function updateWaveEquation() {
    // Compute the next state of the wave using the finite difference method
    for (let i = 1; i < nx - 1; i++) {
        for (let j = 1; j < ny - 1; j++) {
            const laplacian = (
                u[i + 1][j] + u[i - 1][j] +
                u[i][j + 1] + u[i][j - 1] -
                4 * u[i][j]
            ) / (dx * dx);

            uNext[i][j] = 2 * u[i][j] - uPrev[i][j] + waveSpeed * waveSpeed * laplacian * dt * dt;
        }
    }

    // Swap buffers
    [uPrev, u] = [u, uNext];

    // Convert the wave grid to points for visualization
    const wavePointsArray = [];
    const waveColors = [];
    for (let i = 0; i < nx; i++) {
        for (let j = 0; j < ny; j++) {
            wavePointsArray.push(new THREE.Vector3(i - nx / 2, j - ny / 2, u[i][j]));

            // Color points based on their value
            const color = new THREE.Color();
            color.setHSL(u[i][j] / 10, 1.0, 0.5); // Color based on value, adjust as needed
            waveColors.push(color);
        }
    }

    // Update the geometry with the new points and colors
    waveGeometry.setFromPoints(wavePointsArray);
    waveGeometry.setAttribute('color', new THREE.BufferAttribute(new Float32Array(waveColors.flatMap(c => [c.r, c.g, c.b])), 3));
    waveMaterial.vertexColors = true; // Enable vertex colors
}

function animate() {
    requestAnimationFrame(animate);

    // Update the Lorenz attractor
    updateLorenz();
    
    // Update the wave equation
    updateWaveEquation();

    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);
