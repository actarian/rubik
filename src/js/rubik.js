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

class Rubik {

	constructor() {
		this.mouse = { x: 0, y: 0 };
		this.parallax = { x: 0, y: 0 };
		this.cities = [
			[43.9096538, 12.8399805], // pesaro
			[41.8519772, 12.2347364], // rome
			[51.5287718, -0.2416791], // london
			[55.6713812, 12.4537393], // copenaghen
			[40.6976637, -74.1197623], // new york
			[19.3911668, -99.4238221], // mexico city
			[39.9390731, 116.11726], // beijing
			[31.2243084, 120.9162376], // shangai
		];
	}

	init() {
		const body = document.querySelector('body');
		const section = document.querySelector('.rubik');
		const container = section.querySelector('.rubik__container');
		const shadow = section.querySelector('.rubik__shadow');
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
		this.shadow = shadow;
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
			camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.01, 1000);
		}
		/*
		 */
		// const camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.01, 1000);
		camera.position.set(0, 5.0, 10.0);
		camera.up = new THREE.Vector3(0, 0, -1);
		camera.lookAt(new THREE.Vector3(0, 0, 0));
		this.camera = camera;

		const ambient = new THREE.AmbientLight(0x222222);
		scene.add(ambient);
		this.ambient = ambient;

		let directional1;
		directional1 = new THREE.DirectionalLight(0xffffff, 10.0);
		directional1.position.set(0, 6.0, -20);
		// directional1.castShadow = true;
		// directional1.shadowCameraVisible = true;
		// directional1.mapSize.width = 2048;
		// directional1.mapSize.height = 2048;
		scene.add(directional1);
		this.directional1 = directional1;

		const directional2 = new THREE.DirectionalLight(0xffffff, 10.0);
		directional2.position.set(0, -6.0, 20);
		scene.add(directional2);
		this.directional2 = directional2;

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

		const particles = this.addParticles(rubik);
		this.particles = particles;

		const dragListener = new DragListener(this.container, (e) => {
			rubikStartDragRotation.copy(rubikDragRotation);
		}, (e) => {
			rubikDragRotation.copy(rubikStartDragRotation).add(new THREE.Euler(0, Math.PI * e.strength.x, 0, 'XYZ'));
			rubikSpeedRotation.set(0, 0, 0, 'XYZ');
		}, (e) => {
			rubikSpeedRotation.set(0, Math.PI * e.speed.x, 0, 'XYZ');
		});
		this.dragListener = dragListener;
		this.onWindowResize = this.onWindowResize.bind(this);
		this.onMouseMove = this.onMouseMove.bind(this);
		window.addEventListener('resize', this.onWindowResize, false);
		document.addEventListener('mousemove', this.onMouseMove, false);
		this.section.classList.add('init');

		this.play();
		this.onWindowResize();
	}

	createSprite() {
		const canvas = document.createElement('canvas');
		canvas.width = 128;
		canvas.height = 128;
		const ctx = canvas.getContext('2d');
		const gradient = ctx.createRadialGradient(
			canvas.width / 2,
			canvas.height / 2,
			0,
			canvas.width / 2,
			canvas.height / 2,
			canvas.width / 2
		);
		gradient.addColorStop(0, 'rgba(255,255,255,1)');
		gradient.addColorStop(0.2, 'rgba(255,255,255,1)');
		gradient.addColorStop(0.22, 'rgba(255,255,255,.2)');
		gradient.addColorStop(1, 'rgba(255,255,255,0)');
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		return canvas;
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
		const size = 1;
		const rows = new Array(step).fill(null).map((dymmy, i) => {
			const row = new THREE.Group();
			const d = (step - size) / 2;
			const position = new THREE.Vector3(0, i - d, 0);
			row.position.set(position.x, position.y, position.z);
			group.add(row);
			return row;
		});
		const cubes = new Array(step * step * step).fill(null).map((dummy, i) => {
			const x = Math.floor(i / (step * step));
			const y = Math.floor(i / step) % step;
			const z = i % step;
			const d = (step - size) / 2;
			const row = rows[y];
			// const position = new THREE.Vector3(x - d, y - d, z - d);
			const positionCube = new THREE.Vector3(x - d, 0, z - d);
			// console.log(x, y, z, positionCube);
			return this.addCube(row, positionCube, texture);
		});
		rubik.rows = rows;
		rubik.cubes = cubes;
		group.rotation.set(rotation.x, rotation.y, rotation.z);
		parent.add(group);
		this.randomRotateRubikRows(rows);
		return group;
	}

	addCube(parent, position, texture) {
		// const geometry = new THREE.SphereGeometry(0.5, 48, 48);
		const geometry = RoundBoxGeometry(1.0, 1.0, 1.0, 0.05, 2, 2, 2, 5);

		// const geometry2 = new THREE.IcosahedronGeometry(0.5, 4);
		// console.log(geometry2.vertices.length, geometry.vertices.length);
		const material = new THREE.MeshStandardMaterial({
			color: '#fff',
			roughness: 0.65,
			metalness: 0.6,
			map: texture,
		});

		const materials = [
			material,
			material,
			material,
			material,
			material,
			material
		];

		const mesh = new THREE.Mesh(geometry, materials);
		mesh.castShadow = true;
		mesh.receiveShadow = false;
		mesh.position.set(position.x, position.y, position.z);
		parent.add(mesh);
		return mesh;
	}

	addParticles(parent) {
		const texture = new THREE.CanvasTexture(this.createSprite());
		const geometry = new THREE.Geometry();
		const material = new THREE.PointsMaterial({
			size: 0.07,
			map: texture,
			vertexColors: THREE.VertexColors,
			blending: THREE.AdditiveBlending,
			depthTest: false,
			transparent: true
		});
		const particles = new THREE.Points(geometry, material);
		const points = this.cities.map((x) => {
			return this.calcPosFromLatLonRad(x[0], x[1], 0.5);
		}).forEach((point, i) => {
			const vertex = new THREE.Vector3();
			vertex.x = point.x;
			vertex.y = point.y;
			vertex.z = point.z;
			geometry.vertices.push(vertex);
			geometry.colors.push(new THREE.Color(0, 0, 0));
		});
		geometry.mergeVertices();
		geometry.verticesNeedUpdate = true;
		particles.geometry = geometry;
		parent.add(particles);
		return particles;
	}

	onWindowResize() {
		const container = this.container,
			renderer = this.renderer,
			camera = this.camera;
		const size = {
			width: 0,
			height: 0,
			aspect: 0,
		};
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
			}
			camera.updateProjectionMatrix();
		}
		if (size.width < 1024) {
			this.rubik.position.x = 0;
		} else {
			this.rubik.position.x = -3;
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
		//
		const titleXy = {
			x: -50 + 0.5 * -parallax.x,
			y: -50 + 0.5 * -parallax.y,
		};
		TweenMax.set(this.title, {
			transform: 'translateX(' + titleXy.x + '%) translateY(' + titleXy.y + '%)'
		});
		const shadowXy = {
			x: -50 + 3 * -parallax.x,
			y: -50 + 3 * -parallax.y,
		};
		TweenMax.set(this.shadow, {
			transform: 'translateX(' + shadowXy.x + '%) translateY(' + shadowXy.y + '%)'
		});
		this.directional1.position.set(parallax.x * 0.3, 2 + parallax.y * 0.3, 0.5);
		this.directional2.position.set(parallax.x * 0.3, -2 + parallax.y * 0.3, 0);
	}

	render(delta) {
		if (!this.dragListener.dragging) {
			this.rubikRotation.y += this.rubikSpeedRotation.y;
			this.rubikSpeedRotation.y += (0.002 - this.rubikSpeedRotation.y) / 50;
		}
		this.rubik.rotation.copy(this.rubikRotation).add(this.rubikDragRotation);
		this.particles.geometry.vertices.forEach((vertex, i) => {
			const local = this.rubik.localToWorld(vertex.clone());
			const distance = local.distanceTo(this.particleRef);
			const s = Math.max(0, Math.min(1, (1 - distance))) * 5;
			this.particles.geometry.colors[i] = new THREE.Color(s, s, s);
			this.particles.geometry.colorsNeedUpdate = true;
		});
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

	calcPosFromLatLonRad(lat, lon, radius) {
		const phi = (90 - lat) * (Math.PI / 180);
		const theta = (lon + 180) * (Math.PI / 180);
		const x = -((radius) * Math.sin(phi) * Math.cos(theta));
		const z = ((radius) * Math.sin(phi) * Math.sin(theta));
		const y = ((radius) * Math.cos(phi));
		return new THREE.Vector3(x, y, z);
	}

}

var rubik = new Rubik();

window.onload = () => {
	rubik.init();
};
