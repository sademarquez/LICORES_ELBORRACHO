import * as THREE from 'three';

export function init3DBackground() {
    // Ya no se necesita la verificación 'typeof THREE', el import se encarga de ello.
    let scene, camera, renderer, particles;
    const container = document.getElementById('bg3d');
    if (!container) return;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    const particlesGeometry = new THREE.BufferGeometry();
    const count = 5000;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 15;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
        size: 0.025,
        sizeAttenuation: true,
        color: '#D4AF37',
        transparent: true,
        opacity: 0.7
    });
    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);
    camera.position.z = 5;

    const clock = new THREE.Clock();

    function animate() {
        if (particles) particles.rotation.y = clock.getElapsedTime() * 0.05;
        if (renderer) renderer.render(scene, camera);
        window.requestAnimationFrame(animate);
    }

    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    window.addEventListener('resize', onWindowResize, false);
    animate();
    console.log('[3D Background] Inicializado correctamente.');
}
