/* jshint esversion: 6 */
/* global window, document, TweenMax, ThreeJs */

import Dom from './shared/dom';
import DragListener from './shared/drag.listener';
import { RoundBoxGeometry } from './shared/RoundBoxGeometry';

THREE.Euler.prototype.add = function(euler) {
	this.set(this.x + euler.x, this.y + euler.y, this.z + euler.z, this.order);
	return this;
};

const USE_ORTHO = false;
const SHOW_HELPERS = false;

class Rubik {

	constructor() {
		this.mouse = { x: 0, y: 0 };
		this.parallax = { x: 0, y: 0 };
		this.size = { width: 0, height: 0, aspect: 0 };
	}

	init() {
		const body = document.querySelector('body');
		const section = document.querySelector('.rubik');
		const container = section.querySelector('.rubik__container');
		// const shadow = section.querySelector('.rubik__shadow');
		const title = section.querySelector('.rubik__headline');
		Dom.detect(body);
		body.classList.add('ready');
		const rubikTextureSrc = container.getAttribute('texture');
		const loader = new THREE.TextureLoader();
		loader.crossOrigin = '';
		loader.load(rubikTextureSrc, (texture) => {
			// texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
			// texture.repeat.set(2, 2);
			this.rubikTexture = texture;
			this.createScene();
		});
		this.body = body;
		this.section = section;
		this.container = container;
		// this.shadow = shadow;
		this.title = title;
		this.loader = loader;
	}

	createScene() {
		const renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true
		});
		renderer.shadowMap.enabled = true;
		renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer = renderer;
		// container.innerHTML = '';
		this.container.appendChild(renderer.domElement);
		const scene = new THREE.Scene();
		scene.fog = new THREE.FogExp2(0x000000, 0.1); // new THREE.Fog(0x000000, 0, 10);
		this.scene = scene;
		let camera;
		if (USE_ORTHO) {
			const width = 10;
			const height = width / this.container.offsetWidth * this.container.offsetHeight;
			camera = new THREE.OrthographicCamera(-width, width, height, -height, 0.01, 1000);
		} else {
			camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
		}
		// const camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.01, 1000);
		camera.position.set(0, 5.0, 12.0);
		camera.up = new THREE.Vector3(0, 0, -1);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		this.camera = camera;
		const ambient = new THREE.AmbientLight(0x222222);
		scene.add(ambient);
		this.ambient = ambient;
		let light1;
		light1 = new THREE.DirectionalLight(0xffffff, 4.0);
		// light1.castShadow = true;
		// light1.shadowCameraVisible = true;
		// light1.mapSize.width = 2048;
		// light1.mapSize.height = 2048;
		scene.add(light1);
		this.light1 = light1;
		if (SHOW_HELPERS) {
			const light1Helper = new THREE.DirectionalLightHelper(light1, 1);
			scene.add(light1Helper);
		}
		const light2 = new THREE.DirectionalLight(0xffffff, 4.0);
		scene.add(light2);
		this.light2 = light2;
		if (SHOW_HELPERS) {
			const light2Helper = new THREE.DirectionalLightHelper(light2, 1);
			scene.add(light2Helper);
		}
		const particleRef = new THREE.Vector3(0.0, 0.0, 1.0);
		this.particleRef = particleRef;
		// const shadow = this.addShadow(scene);
		const rubikRotation = new THREE.Euler(0.0, Math.PI * 1.2, 0.0, 'XYZ');
		const rubikDragRotation = new THREE.Euler(0, 0, 0, 'XYZ');
		const rubikStartDragRotation = new THREE.Euler(0, 0, 0, 'XYZ');
		const rubikSpeedRotation = new THREE.Euler(0, 0, 0, 'XYZ');
		const rubik = this.addRubik(scene, rubikRotation, this.rubikTexture);
		this.rubikRotation = rubikRotation;
		this.rubikDragRotation = rubikDragRotation;
		this.rubikStartDragRotation = rubikStartDragRotation;
		this.rubikSpeedRotation = rubikSpeedRotation;
		this.rubikRotation = rubikRotation;
		this.rubik = rubik;
		/*
		const particles = addParticles(rubik);
		this.particles = particles;
		*/
		const dragListener = new DragListener(this.container, (e) => {
			rubikStartDragRotation.copy(rubikDragRotation);
		}, (e) => {
			rubikDragRotation.copy(rubikStartDragRotation).add(new THREE.Euler(0, Math.PI * e.strength.x, 0, 'XYZ'));
			rubikSpeedRotation.set(0, 0.1, 0, 'XYZ');
		}, (e) => {
			rubikSpeedRotation.set(0, Math.PI * e.speed.x, 0, 'XYZ');
		});
		this.dragListener = dragListener;
		this.onWindowResize = this.onWindowResize.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		this.onClick = this.onClick.bind(this);
		window.addEventListener('resize', this.onWindowResize, false);
		document.addEventListener('mousemove', this.onMouseMove, false);
		this.container.addEventListener('click', this.onClick, false);
		this.section.classList.add('init');
		this.play();
		this.onWindowResize();
	}

	enter() {

	}

	/*
	addShadow(parent) {
		const geometry = new THREE.PlaneGeometry(100, 100);
		geometry.rotateX(-Math.PI / 4);
		const material = new THREE.ShadowMaterial();
		material.opacity = 0.2;
		const mesh = new THREE.Mesh(geometry, material);
		mesh.position.z = -0.6;
		mesh.receiveShadow = true;
		parent.add(mesh);
		return mesh;
	}
	*/

	randomRotateRubikRows(rows) {
		// console.log(rows);
		const dir = Math.random() > 0.5 ? 1 : -1;
		const row = rows[Math.floor(Math.random() * rows.length)];
		const rotation = row.rotation;
		TweenMax.to(rotation, 0.5, {
			y: rotation.y + dir * Math.PI / 2,
			delay: 1,
			ease: Sine.easeInOut,
			onComplete: () => {
				this.randomRotateRubikRows(rows);
			}
		});
	}

	addRubik(parent, rotation, texture) {
		const group = new THREE.Group();
		const step = 3;
		const count = step * step * step;
		const size = 1;
		const factor = 4;
		const duration = 1.4;
		const delay = 0.01;
		const rows = new Array(step).fill(null).map((dymmy, i) => {
			const row = new THREE.Group();
			const d = (step - size) / 2;
			const position = new THREE.Vector3(0, i - d, 0);
			row.position.set(position.x, position.y, position.z);
			group.add(row);
			return row;
		});
		const cubes = new Array(count).fill(null).map((dummy, i) => {
			const x = Math.floor(i / (step * step));
			const y = Math.floor(i / step) % step;
			const z = i % step;
			const d = (step - size) / 2;
			const row = rows[y];
			// const position = new THREE.Vector3(x - d, y - d, z - d);
			const positionCube = new THREE.Vector3(x - d, 0, z - d);
			// console.log(x, y, z, positionCube);
			const cube = this.addCube(row, positionCube, texture, i, factor, duration, delay);
			return cube;
		});
		group.rows = rows;
		group.cubes = cubes;
		group.rotation.set(rotation.x, rotation.y, rotation.z);
		parent.add(group);
		return group;
	}

	addCube(parent, position, texture, i, factor, duration, delay) {
		const geometry = RoundBoxGeometry(1.0, 1.0, 1.0, 0.1, 2, 2, 2, 5);
		texture = texture.clone();
		texture.needsUpdate = true;
		texture.rotation = -0.02 + Math.random() * 0.04;
		const material = new THREE.MeshStandardMaterial({
			color: '#fefefe',
			roughness: 0.9,
			metalness: 0.1,
			roughnessMap: texture,
			map: texture,
			transparent: true,
			opacity: 0,
			// premultipliedAlpha: true,
		});
		/*
		const materials = [
			material,
			material,
			material,
			material,
			material,
			material
		];
		*/
		const mesh = new THREE.Mesh(geometry, material);
		mesh.castShadow = true;
		mesh.receiveShadow = false;
		mesh.position_ = position;
		mesh.position.set(position.x * factor, position.y * factor, position.z * factor);
		parent.add(mesh);
		return mesh;
	}

	rubikCubesAppearAnimation(cubes, factor, duration, delay) {
		factor = factor || 4;
		duration = duration || 1.4;
		delay = delay || 0.01;
		cubes.forEach((cube, i) => {
			const position = cube.position_;
			cube.position.set(position.x * factor, position.y * factor, position.z * factor);
			TweenMax.to(cube.position, duration, {
				x: position.x,
				y: position.y,
				z: position.z,
				delay: i * delay,
				ease: Elastic.easeOut,
			});
			TweenMax.to(cube.material, duration * 0.2, {
				opacity: 1,
				delay: i * delay,
				ease: Sine.easeInOut,
			});
		});
		setTimeout(() => {
			this.randomRotateRubikRows(rows);
		}, delay * cubes.length + duration);
	}

	rubikCubesWaveAnimation(cubes, factor, duration, delay) {
		factor = factor || 1.5;
		duration = duration || 1.4;
		delay = delay || 0.01;
		cubes.forEach((cube, i) => {
			const position = cube.position_;
			TweenMax.to(cube.position, 0.3, {
				x: position.x * factor,
				y: position.y * factor,
				z: position.z * factor,
				delay: i * delay,
				ease: Sine.easeOut,
				onComplete: () => {
					TweenMax.to(cube.position, duration, {
						x: position.x,
						y: position.y,
						z: position.z,
						ease: Elastic.easeOut,
					});
				}
			});
		});
	}

	onClick(e) {
		this.rubikCubesWaveAnimation(this.rubik.cubes);
	}

	onWindowResize() {
		const container = this.container,
			renderer = this.renderer,
			camera = this.camera;
		const size = this.size;
		size.width = container.offsetWidth;
		/*
		TweenMax.set(container, {
			height: container.offsetWidth * 0.6
		});
		*/
		size.height = container.offsetHeight;
		size.aspect = size.width / size.height;
		if (renderer) {
			renderer.setSize(size.width, size.height);
		}
		if (camera) {
			if (USE_ORTHO) {
				const width = 10; // !!! 3 - 10
				const height = width / this.container.offsetWidth * this.container.offsetHeight;
				camera.left = -width;
				camera.right = width;
				camera.top = height;
				camera.bottom = -height;
			} else {
				camera.aspect = size.width / size.height;
				camera.zoom = 1.0;
			}
			camera.updateProjectionMatrix();
		}
	}

	onMouseMove(e) {
		const w2 = window.innerWidth / 2;
		const h2 = window.innerHeight / 2;
		this.mouse = {
			x: (e.clientX - w2) / w2,
			y: (e.clientY - h2) / h2,
		};
		// console.log('onMouseMove', this.mouse);
	}

	doParallax() {
		// parallax
		const parallax = this.parallax;
		parallax.x += (this.mouse.x - parallax.x) / 8;
		parallax.y += (this.mouse.y - parallax.y) / 8;
		const size = this.size;
		const sx = size.width < 1024 ? 0 : -3;
		this.rubik.position.x = sx + parallax.x * 0.2;
		this.rubik.position.y = parallax.y * 0.2;
		//
		/*
		const titleXy = {
			x: -50 + 0.5 * -parallax.x,
			y: -50 + 0.5 * -parallax.y,
		};
		TweenMax.set(this.title, {
			transform: 'translateX(' + titleXy.x + '%) translateY(' + titleXy.y + '%)'
		});
		*/
		/*
		const shadowXy = {
			x: -50 + 3 * -parallax.x,
			y: -50 + 3 * -parallax.y,
		};
		TweenMax.set(this.shadow, {
			transform: 'translateX(' + shadowXy.x + '%) translateY(' + shadowXy.y + '%)'
		});
		*/
		this.light1.position.set(parallax.x * 5.0, 6.0 + parallax.y * 2.0, 4.0);
		this.light2.position.set(parallax.x * -5.0, -6.0 - parallax.y * 2.0, 4.0);
	}

	render(delta) {
		if (!this.dragListener.dragging) {
			this.rubikRotation.y += this.rubikSpeedRotation.y;
			this.rubikSpeedRotation.y += (0.002 - this.rubikSpeedRotation.y) / 50;
		}
		this.rubik.rotation.copy(this.rubikRotation).add(this.rubikDragRotation);
		/*
		this.particles.geometry.vertices.forEach((vertex, i) => {
			const local = this.rubik.localToWorld(vertex.clone());
			const distance = local.distanceTo(this.particleRef);
			const s = Math.max(0, Math.min(1, (1 - distance))) * 5;
			this.particles.geometry.colors[i] = new THREE.Color(s, s, s);
			this.particles.geometry.colorsNeedUpdate = true;
		});
		*/
		this.renderer.render(this.scene, this.camera);
		this.doParallax();
	}

	play() {
		const clock = new THREE.Clock();
		const loop = (time) => {
			const delta = clock.getDelta();
			this.render(delta);
			window.requestAnimationFrame(loop);
		};
		loop();
	}

}

var rubik = new Rubik();

window.onload = () => {
	rubik.init();
	setTimeout(() => {
		console.log(rubik.rubik);
		rubik.rubikCubesAppearAnimation(rubik.rubik.cubes);
	}, 1000);
};
