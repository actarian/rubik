(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var _dom = _interopRequireDefault(require("./shared/dom"));

var _drag = _interopRequireDefault(require("./shared/drag.listener"));

var _RoundBoxGeometry = require("./shared/RoundBoxGeometry");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

THREE.Euler.prototype.add = function (euler) {
  this.set(this.x + euler.x, this.y + euler.y, this.z + euler.z, this.order);
  return this;
};

var USE_ORTHO = false;
var SHOW_HELPERS = false;

var Rubik =
/*#__PURE__*/
function () {
  function Rubik() {
    _classCallCheck(this, Rubik);

    this.mouse = {
      x: 0,
      y: 0
    };
    this.parallax = {
      x: 0,
      y: 0
    };
    this.size = {
      width: 0,
      height: 0,
      aspect: 0
    };
  }

  _createClass(Rubik, [{
    key: "init",
    value: function init() {
      var _this = this;

      var body = document.querySelector('body');
      var section = document.querySelector('.rubik');
      var container = section.querySelector('.rubik__container'); // const shadow = section.querySelector('.rubik__shadow');

      var title = section.querySelector('.rubik__headline');

      _dom.default.detect(body);

      body.classList.add('ready');
      var rubikTextureSrc = container.getAttribute('texture');
      var loader = new THREE.TextureLoader();
      loader.crossOrigin = '';
      loader.load(rubikTextureSrc, function (texture) {
        // texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        // texture.repeat.set(2, 2);
        _this.rubikTexture = texture;

        _this.createScene();
      });
      this.body = body;
      this.section = section;
      this.container = container; // this.shadow = shadow;

      this.title = title;
      this.loader = loader;
    }
  }, {
    key: "createScene",
    value: function createScene() {
      var renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
      });
      renderer.shadowMap.enabled = true;
      renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer = renderer; // container.innerHTML = '';

      this.container.appendChild(renderer.domElement);
      var scene = new THREE.Scene();
      scene.fog = new THREE.FogExp2(0x000000, 0.1); // new THREE.Fog(0x000000, 0, 10);

      this.scene = scene;
      var camera;

      if (USE_ORTHO) {
        var width = 10;
        var height = width / this.container.offsetWidth * this.container.offsetHeight;
        camera = new THREE.OrthographicCamera(-width, width, height, -height, 0.01, 1000);
      } else {
        camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.01, 1000);
      } // const camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.01, 1000);


      camera.position.set(0, 5.0, 12.0);
      camera.up = new THREE.Vector3(0, 0, -1);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      this.camera = camera;
      var ambient = new THREE.AmbientLight(0x222222);
      scene.add(ambient);
      this.ambient = ambient;
      var light1;
      light1 = new THREE.DirectionalLight(0xffffff, 4.0); // light1.castShadow = true;
      // light1.shadowCameraVisible = true;
      // light1.mapSize.width = 2048;
      // light1.mapSize.height = 2048;

      scene.add(light1);
      this.light1 = light1;

      if (SHOW_HELPERS) {
        var light1Helper = new THREE.DirectionalLightHelper(light1, 1);
        scene.add(light1Helper);
      }

      var light2 = new THREE.DirectionalLight(0xffffff, 4.0);
      scene.add(light2);
      this.light2 = light2;

      if (SHOW_HELPERS) {
        var light2Helper = new THREE.DirectionalLightHelper(light2, 1);
        scene.add(light2Helper);
      }

      var particleRef = new THREE.Vector3(0.0, 0.0, 1.0);
      this.particleRef = particleRef; // const shadow = this.addShadow(scene);

      var rubikRotation = new THREE.Euler(0.0, Math.PI * 1.2, 0.0, 'XYZ');
      var rubikDragRotation = new THREE.Euler(0, 0, 0, 'XYZ');
      var rubikStartDragRotation = new THREE.Euler(0, 0, 0, 'XYZ');
      var rubikSpeedRotation = new THREE.Euler(0, 0, 0, 'XYZ');
      var rubik = this.addRubik(scene, rubikRotation, this.rubikTexture);
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

      var dragListener = new _drag.default(this.container, function (e) {
        rubikStartDragRotation.copy(rubikDragRotation);
      }, function (e) {
        rubikDragRotation.copy(rubikStartDragRotation).add(new THREE.Euler(0, Math.PI * e.strength.x, 0, 'XYZ'));
        rubikSpeedRotation.set(0, 0.1, 0, 'XYZ');
      }, function (e) {
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
  }, {
    key: "enter",
    value: function enter() {}
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

  }, {
    key: "randomRotateRubikRows",
    value: function randomRotateRubikRows(rows) {
      var _this2 = this;

      // console.log(rows);
      var dir = Math.random() > 0.5 ? 1 : -1;
      var row = rows[Math.floor(Math.random() * rows.length)];
      var rotation = row.rotation;
      TweenMax.to(rotation, 0.5, {
        y: rotation.y + dir * Math.PI / 2,
        delay: 1,
        ease: Sine.easeInOut,
        onComplete: function onComplete() {
          _this2.randomRotateRubikRows(rows);
        }
      });
    }
  }, {
    key: "addRubik",
    value: function addRubik(parent, rotation, texture) {
      var _this3 = this;

      var group = new THREE.Group();
      var step = 3;
      var count = step * step * step;
      var size = 1;
      var factor = 4;
      var duration = 1.4;
      var delay = 0.01;
      var rows = new Array(step).fill(null).map(function (dymmy, i) {
        var row = new THREE.Group();
        var d = (step - size) / 2;
        var position = new THREE.Vector3(0, i - d, 0);
        row.position.set(position.x, position.y, position.z);
        group.add(row);
        return row;
      });
      var cubes = new Array(count).fill(null).map(function (dummy, i) {
        var x = Math.floor(i / (step * step));
        var y = Math.floor(i / step) % step;
        var z = i % step;
        var d = (step - size) / 2;
        var row = rows[y]; // const position = new THREE.Vector3(x - d, y - d, z - d);

        var positionCube = new THREE.Vector3(x - d, 0, z - d); // console.log(x, y, z, positionCube);

        var cube = _this3.addCube(row, positionCube, texture, i, factor, duration, delay);

        return cube;
      });
      group.rows = rows;
      group.cubes = cubes;
      group.rotation.set(rotation.x, rotation.y, rotation.z);
      parent.add(group);
      return group;
    }
  }, {
    key: "addCube",
    value: function addCube(parent, position, texture, i, factor, duration, delay) {
      var geometry = (0, _RoundBoxGeometry.RoundBoxGeometry)(1.0, 1.0, 1.0, 0.1, 2, 2, 2, 5);
      texture = texture.clone();
      texture.needsUpdate = true;
      texture.rotation = -0.02 + Math.random() * 0.04;
      var material = new THREE.MeshStandardMaterial({
        color: '#fefefe',
        roughness: 0.9,
        metalness: 0.1,
        roughnessMap: texture,
        map: texture,
        transparent: true,
        opacity: 0 // premultipliedAlpha: true,

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

      var mesh = new THREE.Mesh(geometry, material);
      mesh.castShadow = true;
      mesh.receiveShadow = false;
      mesh.position_ = position;
      mesh.position.set(position.x * factor, position.y * factor, position.z * factor);
      parent.add(mesh);
      return mesh;
    }
  }, {
    key: "rubikCubesAppearAnimation",
    value: function rubikCubesAppearAnimation(cubes, factor, duration, delay) {
      var _this4 = this;

      factor = factor || 4;
      duration = duration || 1.4;
      delay = delay || 0.01;
      cubes.forEach(function (cube, i) {
        var position = cube.position_;
        cube.position.set(position.x * factor, position.y * factor, position.z * factor);
        TweenMax.to(cube.position, duration, {
          x: position.x,
          y: position.y,
          z: position.z,
          delay: i * delay,
          ease: Elastic.easeOut
        });
        TweenMax.to(cube.material, duration * 0.2, {
          opacity: 1,
          delay: i * delay,
          ease: Sine.easeInOut
        });
      });
      setTimeout(function () {
        _this4.randomRotateRubikRows(rows);
      }, delay * cubes.length + duration);
    }
  }, {
    key: "rubikCubesWaveAnimation",
    value: function rubikCubesWaveAnimation(cubes, factor, duration, delay) {
      factor = factor || 1.5;
      duration = duration || 1.4;
      delay = delay || 0.01;
      cubes.forEach(function (cube, i) {
        var position = cube.position_;
        TweenMax.to(cube.position, 0.3, {
          x: position.x * factor,
          y: position.y * factor,
          z: position.z * factor,
          delay: i * delay,
          ease: Sine.easeOut,
          onComplete: function onComplete() {
            TweenMax.to(cube.position, duration, {
              x: position.x,
              y: position.y,
              z: position.z,
              ease: Elastic.easeOut
            });
          }
        });
      });
    }
  }, {
    key: "onClick",
    value: function onClick(e) {
      this.rubikCubesWaveAnimation(this.rubik.cubes);
    }
  }, {
    key: "onWindowResize",
    value: function onWindowResize() {
      var container = this.container,
          renderer = this.renderer,
          camera = this.camera;
      var size = this.size;
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
          var width = 10; // !!! 3 - 10

          var height = width / this.container.offsetWidth * this.container.offsetHeight;
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
  }, {
    key: "onMouseMove",
    value: function onMouseMove(e) {
      var w2 = window.innerWidth / 2;
      var h2 = window.innerHeight / 2;
      this.mouse = {
        x: (e.clientX - w2) / w2,
        y: (e.clientY - h2) / h2
      }; // console.log('onMouseMove', this.mouse);
    }
  }, {
    key: "doParallax",
    value: function doParallax() {
      // parallax
      var parallax = this.parallax;
      parallax.x += (this.mouse.x - parallax.x) / 8;
      parallax.y += (this.mouse.y - parallax.y) / 8;
      var size = this.size;
      var sx = size.width < 1024 ? 0 : -3;
      this.rubik.position.x = sx + parallax.x * 0.2;
      this.rubik.position.y = parallax.y * 0.2; //

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
  }, {
    key: "render",
    value: function render(delta) {
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
  }, {
    key: "play",
    value: function play() {
      var _this5 = this;

      var clock = new THREE.Clock();

      var loop = function loop(time) {
        var delta = clock.getDelta();

        _this5.render(delta);

        window.requestAnimationFrame(loop);
      };

      loop();
    }
  }]);

  return Rubik;
}();

var rubik = new Rubik();

window.onload = function () {
  rubik.init();
  setTimeout(function () {
    console.log(rubik.rubik);
    rubik.rubikCubesAppearAnimation(rubik.rubik.cubes);
  }, 1000);
};

},{"./shared/RoundBoxGeometry":2,"./shared/dom":3,"./shared/drag.listener":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RoundBoxGeometry = RoundBoxGeometry;

/* jshint esversion: 6 */

/* global window, document, TweenMax, ThreeJs */
function RoundBoxGeometry(width, height, depth, radius, widthSegments, heightSegments, depthSegments, radiusSegments) {
  width = width || 1;
  height = height || 1;
  depth = depth || 1;
  var minimum = Math.min(Math.min(width, height), depth);
  radius = radius || minimum * 0.25;
  radius = radius > minimum * 0.5 ? minimum * 0.5 : radius;
  widthSegments = Math.floor(widthSegments) || 1;
  heightSegments = Math.floor(heightSegments) || 1;
  depthSegments = Math.floor(depthSegments) || 1;
  radiusSegments = Math.floor(radiusSegments) || 1;
  var fullGeometry = new THREE.BufferGeometry();
  var fullPosition = [];
  var fullUvs = [];
  var fullIndex = [];
  var fullIndexStart = 0;
  var groupStart = 0;
  RoundBoxGeometryBendPlane_(width, height, radius, widthSegments, heightSegments, radiusSegments, depth * 0.5, 'y', 0, 0);
  RoundBoxGeometryBendPlane_(width, height, radius, widthSegments, heightSegments, radiusSegments, depth * 0.5, 'y', Math.PI, 1);
  RoundBoxGeometryBendPlane_(depth, height, radius, depthSegments, heightSegments, radiusSegments, width * 0.5, 'y', Math.PI * 0.5, 2);
  RoundBoxGeometryBendPlane_(depth, height, radius, depthSegments, heightSegments, radiusSegments, width * 0.5, 'y', Math.PI * -0.5, 3);
  RoundBoxGeometryBendPlane_(width, depth, radius, widthSegments, depthSegments, radiusSegments, height * 0.5, 'x', Math.PI * -0.5, 4);
  RoundBoxGeometryBendPlane_(width, depth, radius, widthSegments, depthSegments, radiusSegments, height * 0.5, 'x', Math.PI * 0.5, 5);
  fullGeometry.addAttribute("position", new THREE.BufferAttribute(new Float32Array(fullPosition), 3));
  fullGeometry.addAttribute("uv", new THREE.BufferAttribute(new Float32Array(fullUvs), 2));
  fullGeometry.setIndex(fullIndex);
  fullGeometry.computeVertexNormals();
  return fullGeometry;

  function RoundBoxGeometryBendPlane_(width, height, radius, widthSegments, heightSegments, smoothness, offset, axis, angle, materialIndex) {
    var halfWidth = width * 0.5;
    var halfHeight = height * 0.5;
    var widthChunk = width / (widthSegments + smoothness * 2);
    var heightChunk = height / (heightSegments + smoothness * 2);
    var planeGeom = new THREE.PlaneBufferGeometry(width, height, widthSegments + smoothness * 2, heightSegments + smoothness * 2);
    var v = new THREE.Vector3(); // current vertex

    var cv = new THREE.Vector3(); // control vertex for bending

    var cd = new THREE.Vector3(); // vector for distance

    var position = planeGeom.attributes.position;
    var uv = planeGeom.attributes.uv;
    var widthShrinkLimit = widthChunk * smoothness;
    var widthShrinkRatio = radius / widthShrinkLimit;
    var heightShrinkLimit = heightChunk * smoothness;
    var heightShrinkRatio = radius / heightShrinkLimit;
    var widthInflateRatio = (halfWidth - radius) / (halfWidth - widthShrinkLimit);
    var heightInflateRatio = (halfHeight - radius) / (halfHeight - heightShrinkLimit);

    for (var i = 0; i < position.count; i++) {
      v.fromBufferAttribute(position, i);

      if (Math.abs(v.x) >= halfWidth - widthShrinkLimit) {
        v.setX((halfWidth - (halfWidth - Math.abs(v.x)) * widthShrinkRatio) * Math.sign(v.x));
      } else {
        v.x *= widthInflateRatio;
      } // lr


      if (Math.abs(v.y) >= halfHeight - heightShrinkLimit) {
        v.setY((halfHeight - (halfHeight - Math.abs(v.y)) * heightShrinkRatio) * Math.sign(v.y));
      } else {
        v.y *= heightInflateRatio;
      } // tb
      //re-calculation of uvs


      uv.setXY(i, (v.x - -halfWidth) / width, 1 - (halfHeight - v.y) / height); // bending

      var widthExceeds = Math.abs(v.x) >= halfWidth - radius;
      var heightExceeds = Math.abs(v.y) >= halfHeight - radius;

      if (widthExceeds || heightExceeds) {
        cv.set(widthExceeds ? (halfWidth - radius) * Math.sign(v.x) : v.x, heightExceeds ? (halfHeight - radius) * Math.sign(v.y) : v.y, -radius);
        cd.subVectors(v, cv).normalize();
        v.copy(cv).addScaledVector(cd, radius);
      }

      position.setXYZ(i, v.x, v.y, v.z);
    }

    planeGeom.translate(0, 0, offset);

    switch (axis) {
      case 'y':
        planeGeom.rotateY(angle);
        break;

      case 'x':
        planeGeom.rotateX(angle);
    } // merge positions


    position.array.forEach(function (p) {
      fullPosition.push(p);
    }); // merge uvs

    uv.array.forEach(function (u) {
      fullUvs.push(u);
    }); // merge indices

    planeGeom.index.array.forEach(function (a) {
      fullIndex.push(a + fullIndexStart);
    });
    fullIndexStart += position.count; // set the groups

    fullGeometry.addGroup(groupStart, planeGeom.index.count, materialIndex);
    groupStart += planeGeom.index.count;
  }
}

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _utils = _interopRequireDefault(require("./utils"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Dom =
/*#__PURE__*/
function () {
  function Dom() {
    _classCallCheck(this, Dom);
  }

  _createClass(Dom, null, [{
    key: "detect",
    value: function detect(node) {
      var userAgent = navigator.userAgent.toLowerCase();
      var explorer = userAgent.indexOf('msie') > -1;
      var firefox = userAgent.indexOf('firefox') > -1;
      var opera = userAgent.toLowerCase().indexOf('op') > -1;
      var chrome = userAgent.indexOf('chrome') > -1;
      var safari = userAgent.indexOf('safari') > -1;

      if (chrome && safari) {
        safari = false;
      }

      if (chrome && opera) {
        chrome = false;
      }

      var android = userAgent.match(/android/i);
      var blackberry = userAgent.match(/blackberry/i);
      var ios = userAgent.match(/iphone|ipad|ipod/i);
      var operamini = userAgent.match(/opera mini/i);
      var iemobile = userAgent.match(/iemobile/i) || navigator.userAgent.match(/wpdesktop/i);
      var mobile = android || blackberry || ios || operamini || iemobile;
      var overscroll = navigator.platform === 'MacIntel' && typeof navigator.getBattery === 'function';
      var classList = {
        chrome: chrome,
        explorer: explorer,
        firefox: firefox,
        safari: safari,
        opera: opera,
        android: android,
        blackberry: blackberry,
        ios: ios,
        operamini: operamini,
        iemobile: iemobile,
        mobile: mobile,
        overscroll: overscroll
      };
      Object.assign(Dom, classList);
      Object.keys(classList).forEach(function (x) {
        if (classList[x]) {
          node.classList.add(x);
        }
      });

      var onTouchStart = function onTouchStart() {
        document.removeEventListener('touchstart', onTouchStart);
        Dom.touch = true;
        node.classList.add('touch');
      };

      document.addEventListener('touchstart', onTouchStart);

      var onMouseDown = function onMouseDown() {
        document.removeEventListener('mousedown', onMouseDown);
        Dom.mouse = true;
        node.classList.add('mouse');
      };

      document.addEventListener('mousedown', onMouseDown);

      var onScroll = function onScroll() {
        var now = _utils.default.now();

        if (Dom.lastScrollTime) {
          var diff = now - Dom.lastScrollTime;

          if (diff < 5) {
            document.removeEventListener('scroll', onScroll);
            Dom.fastscroll = true;
            node.classList.add('fastscroll');
            console.log('scroll', diff);
          }
        }

        Dom.lastScrollTime = now;
      };

      document.addEventListener('scroll', onScroll);
    }
  }, {
    key: "fragmentFirstElement",
    value: function fragmentFirstElement(fragment) {
      return Array.prototype.slice.call(fragment.children).find(function (x) {
        return x.nodeType === Node.ELEMENT_NODE;
      });
    }
  }, {
    key: "fragmentFromHTML",
    value: function fragmentFromHTML(html) {
      return document.createRange().createContextualFragment(html);
    }
  }, {
    key: "scrollTop",
    value: function scrollTop() {
      return document && document.defaultView ? document.defaultView.pageYOffset : 0;
    }
  }]);

  return Dom;
}();

exports.default = Dom;

},{"./utils":5}],4:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* jshint esversion: 6 */

/* global window, document, TweenMax, ThreeJs */
var DragListener =
/*#__PURE__*/
function () {
  function DragListener(target, downCallback, moveCallback, upCallback) {
    _classCallCheck(this, DragListener);

    this.target = target || document;

    this.downCallback = downCallback || function (e) {
      console.log('DragListener.downCallback not setted', e);
    };

    this.moveCallback = moveCallback || function (e) {
      console.log('DragListener.moveCallback not setted', e);
    };

    this.upCallback = upCallback || function (e) {
      console.log('DragListener.upCallback not setted', e);
    };

    this.dragging = false;
    this.init();
  }

  _createClass(DragListener, [{
    key: "init",
    value: function init() {
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseMove = this.onMouseMove.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
      this.onTouchStart = this.onTouchStart.bind(this);
      this.onTouchMove = this.onTouchMove.bind(this);
      this.onTouchEnd = this.onTouchEnd.bind(this);
      this.target.addEventListener('mousedown', this.onMouseDown, false);
      this.target.addEventListener('touchstart', this.onTouchStart, false);
    }
  }, {
    key: "onDown",
    value: function onDown(down) {
      this.down = down; // this.position ? { x: down.x - this.position.x, y: down.y - this.position.y } : down;

      this.strength = {
        x: 0,
        y: 0
      };
      this.distance = this.distance || {
        x: 0,
        y: 0
      };
      this.speed = {
        x: 0,
        y: 0
      };
      this.downCallback(this);
    }
  }, {
    key: "onDrag",
    value: function onDrag(position) {
      this.dragging = true;
      var target = this.target;
      var distance = {
        x: position.x - this.down.x,
        y: position.y - this.down.y
      };
      var strength = {
        x: distance.x / window.innerWidth * 2,
        y: distance.y / window.innerHeight * 2
      };
      var speed = {
        x: this.speed.x + (strength.x - this.strength.x) * 0.1,
        y: this.speed.y + (strength.y - this.strength.y) * 0.1
      };
      this.position = position;
      this.distance = distance;
      this.strength = strength;
      this.speed = speed;
      this.moveCallback({
        position: position,
        distance: distance,
        strength: strength,
        speed: speed,
        target: target
      });
    }
  }, {
    key: "onUp",
    value: function onUp() {
      this.dragging = false;
      this.upCallback(this);
    }
  }, {
    key: "onMouseDown",
    value: function onMouseDown(e) {
      this.target.removeEventListener('touchstart', this.onTouchStart);
      this.onDown({
        x: e.clientX,
        y: e.clientY
      });
      this.addMouseListeners();
    }
  }, {
    key: "onMouseMove",
    value: function onMouseMove(e) {
      this.onDrag({
        x: e.clientX,
        y: e.clientY
      });
    }
  }, {
    key: "onMouseUp",
    value: function onMouseUp(e) {
      this.removeMouseListeners();
      this.onDrag({
        x: e.clientX,
        y: e.clientY
      });
      this.onUp();
    }
  }, {
    key: "onTouchStart",
    value: function onTouchStart(e) {
      this.target.removeEventListener('mousedown', this.onMouseDown);

      if (e.touches.length > 1) {
        e.preventDefault();
        this.onDown({
          x: e.touches[0].pageX,
          y: e.touches[0].pageY
        });
        this.addTouchListeners();
      }
    }
  }, {
    key: "onTouchMove",
    value: function onTouchMove(e) {
      if (e.touches.length > 0) {
        e.preventDefault();
        this.onDrag({
          x: e.touches[0].pageX,
          y: e.touches[0].pageY
        });
      }
    }
  }, {
    key: "onTouchEnd",
    value: function onTouchEnd(e) {
      this.removeTouchListeners();
      this.onDrag(this.position);
      this.onUp();
    }
  }, {
    key: "addMouseListeners",
    value: function addMouseListeners() {
      document.addEventListener('mousemove', this.onMouseMove, false);
      document.addEventListener('mouseup', this.onMouseUp, false);
    }
  }, {
    key: "addTouchListeners",
    value: function addTouchListeners() {
      document.addEventListener('touchend', this.onTouchEnd, false);
      document.addEventListener('touchmove', this.onTouchMove, false);
    }
  }, {
    key: "removeMouseListeners",
    value: function removeMouseListeners() {
      document.removeEventListener('mousemove', this.onMouseMove);
      document.removeEventListener('mouseup', this.onMouseUp);
    }
  }, {
    key: "removeTouchListeners",
    value: function removeTouchListeners() {
      document.removeEventListener('touchend', this.onTouchEnd);
      document.removeEventListener('touchmove', this.onTouchMove);
    }
  }]);

  return DragListener;
}();

exports.default = DragListener;

},{}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

/* jshint esversion: 6 */

/* global window, document */
var Utils =
/*#__PURE__*/
function () {
  function Utils() {
    _classCallCheck(this, Utils);
  }

  _createClass(Utils, null, [{
    key: "now",
    value: function now() {
      return Date.now ? Date.now() : new Date().getTime();
    }
  }, {
    key: "performanceNow",
    value: function performanceNow() {
      return performance ? performance.timing.navigationStart + performance.now() : Utils.now();
    }
  }, {
    key: "throttle",
    value: function throttle(callback, wait, options) {
      var context = null,
          result = null,
          args = null,
          timeout = null;
      var previous = 0;

      if (!options) {
        options = {};
      }

      var later = function later() {
        previous = options.leading === false ? 0 : Utils.now();
        timeout = null;
        result = callback.apply(context, args);

        if (!timeout) {
          context = args = null;
        }
      };

      return function () {
        context = this;
        args = arguments;
        var now = Utils.now();

        if (!previous && options.leading === false) {
          previous = now;
        }

        var remaining = wait - (now - previous);

        if (remaining <= 0 || remaining > wait) {
          if (timeout) {
            clearTimeout(timeout);
            timeout = null;
          }

          previous = now;
          result = callback.apply(context, args);

          if (!timeout) {
            context = args = null;
          }
        } else if (!timeout && options.trailing !== false) {
          timeout = setTimeout(later, remaining);
        }

        return result;
      };
    }
  }, {
    key: "debounce",
    value: function debounce(callback) {
      var _this = this,
          _arguments = arguments;

      var wait = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 10;
      var immediate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : true;
      var timeout;
      return function () {
        var context = _this,
            args = _arguments;

        var later = function later() {
          timeout = null;

          if (!immediate) {
            callback.apply(context, args);
          }
        };

        var callNow = immediate && !timeout;

        if (timeout) {
          clearTimeout(timeout);
        }

        timeout = setTimeout(later, wait);

        if (callNow) {
          callback.apply(context, args);
        }
      };
    }
  }]);

  return Utils;
}();

exports.default = Utils;

},{}]},{},[1]);
//# sourceMappingURL=rubik.js.map
