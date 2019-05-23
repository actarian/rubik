/* jshint esversion: 6 */
/* global window, document, TweenMax, ThreeJs */

export function RoundBoxGeometry(width, height, depth, radius, widthSegments, heightSegments, depthSegments, radiusSegments) {
	width = width || 1;
	height = height || 1;
	depth = depth || 1;
	const minimum = Math.min(Math.min(width, height), depth);
	radius = radius || minimum * 0.25;
	radius = radius > minimum * 0.5 ? minimum * 0.5 : radius;
	widthSegments = Math.floor(widthSegments) || 1;
	heightSegments = Math.floor(heightSegments) || 1;
	depthSegments = Math.floor(depthSegments) || 1;
	radiusSegments = Math.floor(radiusSegments) || 1;
	const fullGeometry = new THREE.BufferGeometry();
	const fullPosition = [];
	const fullUvs = [];
	const fullIndex = [];
	let fullIndexStart = 0;
	let groupStart = 0;
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
		const halfWidth = width * 0.5;
		const halfHeight = height * 0.5;
		const widthChunk = width / (widthSegments + smoothness * 2);
		const heightChunk = height / (heightSegments + smoothness * 2);
		const planeGeom = new THREE.PlaneBufferGeometry(width, height, widthSegments + smoothness * 2, heightSegments + smoothness * 2);
		const v = new THREE.Vector3(); // current vertex
		const cv = new THREE.Vector3(); // control vertex for bending
		const cd = new THREE.Vector3(); // vector for distance
		const position = planeGeom.attributes.position;
		const uv = planeGeom.attributes.uv;
		const widthShrinkLimit = widthChunk * smoothness;
		const widthShrinkRatio = radius / widthShrinkLimit;
		const heightShrinkLimit = heightChunk * smoothness;
		const heightShrinkRatio = radius / heightShrinkLimit;
		const widthInflateRatio = (halfWidth - radius) / (halfWidth - widthShrinkLimit);
		const heightInflateRatio = (halfHeight - radius) / (halfHeight - heightShrinkLimit);
		for (let i = 0; i < position.count; i++) {
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
			uv.setXY(
				i,
				(v.x - (-halfWidth)) / width,
				1 - (halfHeight - v.y) / height
			);
			// bending
			const widthExceeds = Math.abs(v.x) >= halfWidth - radius;
			const heightExceeds = Math.abs(v.y) >= halfHeight - radius;
			if (widthExceeds || heightExceeds) {
				cv.set(
					widthExceeds ? (halfWidth - radius) * Math.sign(v.x) : v.x,
					heightExceeds ? (halfHeight - radius) * Math.sign(v.y) : v.y,
					-radius);
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
		}
		// merge positions
		position.array.forEach(function(p) {
			fullPosition.push(p);
		});
		// merge uvs
		uv.array.forEach(function(u) {
			fullUvs.push(u);
		});
		// merge indices
		planeGeom.index.array.forEach(function(a) {
			fullIndex.push(a + fullIndexStart);
		});
		fullIndexStart += position.count;
		// set the groups
		fullGeometry.addGroup(groupStart, planeGeom.index.count, materialIndex);
		groupStart += planeGeom.index.count;
	}
}

export function RoundBoxGeometry_(width, height, depth, radius, widthSegments, heightSegments, depthSegments, smoothness) {

	width = width || 1;
	height = height || 1;
	depth = depth || 1;
	radius = radius || (Math.min(Math.min(width, height), depth) * 0.25);
	widthSegments = Math.floor(widthSegments) || 1;
	heightSegments = Math.floor(heightSegments) || 1;
	depthSegments = Math.floor(depthSegments) || 1;
	smoothness = Math.max(3, Math.floor(smoothness) || 3);

	const halfWidth = width * 0.5 - radius;
	const halfHeight = height * 0.5 - radius;
	const halfDepth = depth * 0.5 - radius;

	const geometry = new THREE.Geometry();

	// corners - 4 eighths of a sphere
	const corner1 = new THREE.SphereGeometry(radius, smoothness, smoothness, 0, Math.PI * 0.5, 0, Math.PI * 0.5);
	corner1.translate(-halfWidth, halfHeight, halfDepth);
	const corner2 = new THREE.SphereGeometry(radius, smoothness, smoothness, Math.PI * 0.5, Math.PI * 0.5, 0, Math.PI * 0.5);
	corner2.translate(halfWidth, halfHeight, halfDepth);
	const corner3 = new THREE.SphereGeometry(radius, smoothness, smoothness, 0, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 0.5);
	corner3.translate(-halfWidth, -halfHeight, halfDepth);
	const corner4 = new THREE.SphereGeometry(radius, smoothness, smoothness, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 0.5, Math.PI * 0.5);
	corner4.translate(halfWidth, -halfHeight, halfDepth);

	geometry.merge(corner1);
	geometry.merge(corner2);
	geometry.merge(corner3);
	geometry.merge(corner4);

	// edges - 2 fourths for each dimension
	// width
	const edge = new THREE.CylinderGeometry(radius, radius, width - radius * 2, smoothness, widthSegments, true, 0, Math.PI * 0.5);
	edge.rotateZ(Math.PI * 0.5);
	edge.translate(0, halfHeight, halfDepth);
	const edge2 = new THREE.CylinderGeometry(radius, radius, width - radius * 2, smoothness, widthSegments, true, Math.PI * 1.5, Math.PI * 0.5);
	edge2.rotateZ(Math.PI * 0.5);
	edge2.translate(0, -halfHeight, halfDepth);

	// height
	const edge3 = new THREE.CylinderGeometry(radius, radius, height - radius * 2, smoothness, heightSegments, true, 0, Math.PI * 0.5);
	edge3.translate(halfWidth, 0, halfDepth);
	const edge4 = new THREE.CylinderGeometry(radius, radius, height - radius * 2, smoothness, heightSegments, true, Math.PI * 1.5, Math.PI * 0.5);
	edge4.translate(-halfWidth, 0, halfDepth);

	// depth
	const edge5 = new THREE.CylinderGeometry(radius, radius, depth - radius * 2, smoothness, depthSegments, true, 0, Math.PI * 0.5);
	edge5.rotateX(-Math.PI * 0.5);
	edge5.translate(halfWidth, halfHeight, 0);
	const edge6 = new THREE.CylinderGeometry(radius, radius, depth - radius * 2, smoothness, depthSegments, true, Math.PI * 0.5, Math.PI * 0.5);
	edge6.rotateX(-Math.PI * 0.5);
	edge6.translate(halfWidth, -halfHeight, 0);

	edge.merge(edge2);
	edge.merge(edge3);
	edge.merge(edge4);
	edge.merge(edge5);
	edge.merge(edge6);

	// sides
	// front
	const side = new THREE.PlaneGeometry(width - radius * 2, height - radius * 2, widthSegments, heightSegments);
	side.translate(0, 0, depth * 0.5);

	// right
	const side2 = new THREE.PlaneGeometry(depth - radius * 2, height - radius * 2, depthSegments, heightSegments);
	side2.rotateY(Math.PI * 0.5);
	side2.translate(width * 0.5, 0, 0);

	side.merge(side2);

	geometry.merge(edge);
	geometry.merge(side);

	// duplicate and flip
	const secondHalf = geometry.clone();
	secondHalf.rotateY(Math.PI);
	geometry.merge(secondHalf);

	// top
	const top = new THREE.PlaneGeometry(width - radius * 2, depth - radius * 2, widthSegments, depthSegments);
	top.rotateX(-Math.PI * 0.5);
	top.translate(0, height * 0.5, 0);

	// bottom
	const bottom = new THREE.PlaneGeometry(width - radius * 2, depth - radius * 2, widthSegments, depthSegments);
	bottom.rotateX(Math.PI * 0.5);
	bottom.translate(0, -height * 0.5, 0);

	geometry.merge(top);
	geometry.merge(bottom);
	geometry.mergeVertices();
	return geometry;
}
