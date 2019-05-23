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
    this.cities = [[43.9096538, 12.8399805], // pesaro
    [41.8519772, 12.2347364], // rome
    [51.5287718, -0.2416791], // london
    [55.6713812, 12.4537393], // copenaghen
    [40.6976637, -74.1197623], // new york
    [19.3911668, -99.4238221], // mexico city
    [39.9390731, 116.11726], // beijing
    [31.2243084, 120.9162376]];
  }

  _createClass(Rubik, [{
    key: "init",
    value: function init() {
      var _this = this;

      var body = document.querySelector('body');
      var section = document.querySelector('.rubik');
      var container = section.querySelector('.rubik__container');
      var shadow = section.querySelector('.rubik__shadow');
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
      this.container = container;
      this.shadow = shadow;
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
        camera = new THREE.PerspectiveCamera(35, window.innerWidth / window.innerHeight, 0.01, 1000);
      }
      /*
       */
      // const camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, 0.01, 1000);


      camera.position.set(0, 5.0, 10.0);
      camera.up = new THREE.Vector3(0, 0, -1);
      camera.lookAt(new THREE.Vector3(0, 0, 0));
      this.camera = camera;
      var ambient = new THREE.AmbientLight(0x222222);
      scene.add(ambient);
      this.ambient = ambient;
      var directional1;
      directional1 = new THREE.DirectionalLight(0xffffff, 10.0);
      directional1.position.set(0, 6.0, -20); // directional1.castShadow = true;
      // directional1.shadowCameraVisible = true;
      // directional1.mapSize.width = 2048;
      // directional1.mapSize.height = 2048;

      scene.add(directional1);
      this.directional1 = directional1;
      var directional2 = new THREE.DirectionalLight(0xffffff, 10.0);
      directional2.position.set(0, -6.0, 20);
      scene.add(directional2);
      this.directional2 = directional2;
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
      var particles = this.addParticles(rubik);
      this.particles = particles;
      var dragListener = new _drag.default(this.container, function (e) {
        rubikStartDragRotation.copy(rubikDragRotation);
      }, function (e) {
        rubikDragRotation.copy(rubikStartDragRotation).add(new THREE.Euler(0, Math.PI * e.strength.x, 0, 'XYZ'));
        rubikSpeedRotation.set(0, 0, 0, 'XYZ');
      }, function (e) {
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
  }, {
    key: "createSprite",
    value: function createSprite() {
      var canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      var ctx = canvas.getContext('2d');
      var gradient = ctx.createRadialGradient(canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2);
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
      var size = 1;
      var rows = new Array(step).fill(null).map(function (dymmy, i) {
        var row = new THREE.Group();
        var d = (step - size) / 2;
        var position = new THREE.Vector3(0, i - d, 0);
        row.position.set(position.x, position.y, position.z);
        group.add(row);
        return row;
      });
      var cubes = new Array(step * step * step).fill(null).map(function (dummy, i) {
        var x = Math.floor(i / (step * step));
        var y = Math.floor(i / step) % step;
        var z = i % step;
        var d = (step - size) / 2;
        var row = rows[y]; // const position = new THREE.Vector3(x - d, y - d, z - d);

        var positionCube = new THREE.Vector3(x - d, 0, z - d); // console.log(x, y, z, positionCube);

        return _this3.addCube(row, positionCube, texture);
      });
      rubik.rows = rows;
      rubik.cubes = cubes;
      group.rotation.set(rotation.x, rotation.y, rotation.z);
      parent.add(group);
      this.randomRotateRubikRows(rows);
      return group;
    }
  }, {
    key: "addCube",
    value: function addCube(parent, position, texture) {
      // const geometry = new THREE.SphereGeometry(0.5, 48, 48);
      var geometry = (0, _RoundBoxGeometry.RoundBoxGeometry)(1.0, 1.0, 1.0, 0.05, 2, 2, 2, 5); // const geometry2 = new THREE.IcosahedronGeometry(0.5, 4);
      // console.log(geometry2.vertices.length, geometry.vertices.length);

      var material = new THREE.MeshStandardMaterial({
        color: '#fff',
        roughness: 0.65,
        metalness: 0.6,
        map: texture
      });
      var materials = [material, material, material, material, material, material];
      var mesh = new THREE.Mesh(geometry, materials);
      mesh.castShadow = true;
      mesh.receiveShadow = false;
      mesh.position.set(position.x, position.y, position.z);
      parent.add(mesh);
      return mesh;
    }
  }, {
    key: "addParticles",
    value: function addParticles(parent) {
      var _this4 = this;

      var texture = new THREE.CanvasTexture(this.createSprite());
      var geometry = new THREE.Geometry();
      var material = new THREE.PointsMaterial({
        size: 0.07,
        map: texture,
        vertexColors: THREE.VertexColors,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        transparent: true
      });
      var particles = new THREE.Points(geometry, material);
      var points = this.cities.map(function (x) {
        return _this4.calcPosFromLatLonRad(x[0], x[1], 0.5);
      }).forEach(function (point, i) {
        var vertex = new THREE.Vector3();
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
  }, {
    key: "onWindowResize",
    value: function onWindowResize() {
      var container = this.container,
          renderer = this.renderer,
          camera = this.camera;
      var size = {
        width: 0,
        height: 0,
        aspect: 0
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
          var width = 10; // !!! 3 - 10

          var height = width / this.container.offsetWidth * this.container.offsetHeight;
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
      parallax.y += (this.mouse.y - parallax.y) / 8; //

      var titleXy = {
        x: -50 + 0.5 * -parallax.x,
        y: -50 + 0.5 * -parallax.y
      };
      TweenMax.set(this.title, {
        transform: 'translateX(' + titleXy.x + '%) translateY(' + titleXy.y + '%)'
      });
      var shadowXy = {
        x: -50 + 3 * -parallax.x,
        y: -50 + 3 * -parallax.y
      };
      TweenMax.set(this.shadow, {
        transform: 'translateX(' + shadowXy.x + '%) translateY(' + shadowXy.y + '%)'
      });
      this.directional1.position.set(parallax.x * 0.3, 2 + parallax.y * 0.3, 0.5);
      this.directional2.position.set(parallax.x * 0.3, -2 + parallax.y * 0.3, 0);
    }
  }, {
    key: "render",
    value: function render(delta) {
      var _this5 = this;

      if (!this.dragListener.dragging) {
        this.rubikRotation.y += this.rubikSpeedRotation.y;
        this.rubikSpeedRotation.y += (0.002 - this.rubikSpeedRotation.y) / 50;
      }

      this.rubik.rotation.copy(this.rubikRotation).add(this.rubikDragRotation);
      this.particles.geometry.vertices.forEach(function (vertex, i) {
        var local = _this5.rubik.localToWorld(vertex.clone());

        var distance = local.distanceTo(_this5.particleRef);
        var s = Math.max(0, Math.min(1, 1 - distance)) * 5;
        _this5.particles.geometry.colors[i] = new THREE.Color(s, s, s);
        _this5.particles.geometry.colorsNeedUpdate = true;
      });
      this.renderer.render(this.scene, this.camera);
      this.doParallax();
    }
  }, {
    key: "play",
    value: function play() {
      var _this6 = this;

      var clock = new THREE.Clock();

      var loop = function loop(time) {
        var delta = clock.getDelta();

        _this6.render(delta);

        window.requestAnimationFrame(loop);
      };

      loop();
    }
  }, {
    key: "calcPosFromLatLonRad",
    value: function calcPosFromLatLonRad(lat, lon, radius) {
      var phi = (90 - lat) * (Math.PI / 180);
      var theta = (lon + 180) * (Math.PI / 180);
      var x = -(radius * Math.sin(phi) * Math.cos(theta));
      var z = radius * Math.sin(phi) * Math.sin(theta);
      var y = radius * Math.cos(phi);
      return new THREE.Vector3(x, y, z);
    }
  }]);

  return Rubik;
}();

var rubik = new Rubik();

window.onload = function () {
  rubik.init();
};

},{"./shared/RoundBoxGeometry":2,"./shared/dom":3,"./shared/drag.listener":4}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.RoundBoxGeometry = RoundBoxGeometry;
exports.RoundBoxGeometry_ = RoundBoxGeometry_;

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

function RoundBoxGeometry_(width, height, depth, radius, widthSegments, heightSegments, depthSegments, smoothness) {
  width = width || 1;
  height = height || 1;
  depth = depth || 1;
  radius = radius || Math.min(Math.min(width, height), depth) * 0.25;
  widthSegments = Math.floor(widthSegments) || 1;
  heightSegments = Math.floor(heightSegments) || 1;
  depthSegments = Math.floor(depthSegments) || 1;
  smoothness = Math.max(3, Math.floor(smoothness) || 3);
  var halfWidth = width * 0.5 - radius;
  var halfHeight = height * 0.5 - radius;
  var halfDepth = depth * 0.5 - radius;
  var geometry = new THREE.Geometry(); // corners - 4 eighths of a sphere

  var corner1 = new THREE.SphereGeometry(radius, smoothness, smoothness, 0, Math.PI * 0.5, 0, Math.PI * 0.5);
  corner1.translate(-halfWidth, halfHeight, halfDepth);
  var corner2 = new THREE.SphereGeometry(radius, smoothness, smoothness, Math.PI * 0.5, Math.PI * 0.5, 0, Math.PI * 0.5);
  corner2.translate(halfWidth, halfHeight, halfDepth);
  var corner3 = new THREE.SphereGeometry(radius, smoothness, smoothness, 0, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 0.5);
  corner3.translate(-halfWidth, -halfHeight, halfDepth);
  var corner4 = new THREE.SphereGeometry(radius, smoothness, smoothness, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 0.5);
  corner4.translate(halfWidth, -halfHeight, halfDepth);
  geometry.merge(corner1);
  geometry.merge(corner2);
  geometry.merge(corner3);
  geometry.merge(corner4); // edges - 2 fourths for each dimension
  // width

  var edge = new THREE.CylinderGeometry(radius, radius, width - radius * 2, smoothness, widthSegments, true, 0, Math.PI * 0.5);
  edge.rotateZ(Math.PI * 0.5);
  edge.translate(0, halfHeight, halfDepth);
  var edge2 = new THREE.CylinderGeometry(radius, radius, width - radius * 2, smoothness, widthSegments, true, Math.PI * 1.5, Math.PI * 0.5);
  edge2.rotateZ(Math.PI * 0.5);
  edge2.translate(0, -halfHeight, halfDepth); // height

  var edge3 = new THREE.CylinderGeometry(radius, radius, height - radius * 2, smoothness, heightSegments, true, 0, Math.PI * 0.5);
  edge3.translate(halfWidth, 0, halfDepth);
  var edge4 = new THREE.CylinderGeometry(radius, radius, height - radius * 2, smoothness, heightSegments, true, Math.PI * 1.5, Math.PI * 0.5);
  edge4.translate(-halfWidth, 0, halfDepth); // depth

  var edge5 = new THREE.CylinderGeometry(radius, radius, depth - radius * 2, smoothness, depthSegments, true, 0, Math.PI * 0.5);
  edge5.rotateX(-Math.PI * 0.5);
  edge5.translate(halfWidth, halfHeight, 0);
  var edge6 = new THREE.CylinderGeometry(radius, radius, depth - radius * 2, smoothness, depthSegments, true, Math.PI * 0.5, Math.PI * 0.5);
  edge6.rotateX(-Math.PI * 0.5);
  edge6.translate(halfWidth, -halfHeight, 0);
  edge.merge(edge2);
  edge.merge(edge3);
  edge.merge(edge4);
  edge.merge(edge5);
  edge.merge(edge6); // sides
  // front

  var side = new THREE.PlaneGeometry(width - radius * 2, height - radius * 2, widthSegments, heightSegments);
  side.translate(0, 0, depth * 0.5); // right

  var side2 = new THREE.PlaneGeometry(depth - radius * 2, height - radius * 2, depthSegments, heightSegments);
  side2.rotateY(Math.PI * 0.5);
  side2.translate(width * 0.5, 0, 0);
  side.merge(side2);
  geometry.merge(edge);
  geometry.merge(side); // duplicate and flip

  var secondHalf = geometry.clone();
  secondHalf.rotateY(Math.PI);
  geometry.merge(secondHalf); // top

  var top = new THREE.PlaneGeometry(width - radius * 2, depth - radius * 2, widthSegments, depthSegments);
  top.rotateX(-Math.PI * 0.5);
  top.translate(0, height * 0.5, 0); // bottom

  var bottom = new THREE.PlaneGeometry(width - radius * 2, depth - radius * 2, widthSegments, depthSegments);
  bottom.rotateX(Math.PI * 0.5);
  bottom.translate(0, -height * 0.5, 0);
  geometry.merge(top);
  geometry.merge(bottom);
  geometry.mergeVertices();
  return geometry;
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
