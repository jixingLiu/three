var Colors = {
    red: 0xf25346,
    white: 0xd8d0d1,
    brown: 0x59332e,
    pink: 0xF5986E,
    brownDark: 0x23190f,
    blue: 0x68c3c0
};
function init() {
    initScene();
    initLight();
    createPlane();
    createSea();
    createSky();
    document.addEventListener('mousemove', handleMouseMove, false);
    loop();
    renderer.render(scene, camera)
}
var scene, camera;
function initScene() {
    width = document.getElementById('canvas-frame').clientWidth;
    height = document.getElementById('canvas-frame').clientHeight;
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.shadowMapEnabled = true;
    renderer.setSize(width, height);
    document.getElementById('canvas-frame').appendChild(renderer.domElement);
    renderer.setClearColor(0xEEEEEE);

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(65, width / height, 1, 10000);
    camera.position.set(-30, 50, 50);
    camera.lookAt(scene.position);
}
var hemisphereLight, shadowLight;
function initLight() {
    hemisphereLight = new THREE.HemisphereLight(0xaaaaaa, 0x000000, .9);
    // 第一个参数是关系颜色，第二个参数是光源强度
    shadowLight = new THREE.DirectionalLight(0xffffff, .9);
    // 设置光源的方向。  
    shadowLight.position.set(150, 350, 350);
    // 开启光源投影
    shadowLight.castShadow = true;
    // 定义可见域的投射阴影
    shadowLight.shadow.camera.left = -400;
    shadowLight.shadow.camera.right = 400;
    shadowLight.shadow.camera.top = 400;
    shadowLight.shadow.camera.bottom = -400;
    shadowLight.shadow.camera.near = 1;
    shadowLight.shadow.camera.far = 1000;

    // 定义阴影的分辨率；虽然分辨率越高越好，但是需要付出更加昂贵的代价维持高性能的表现。
    shadowLight.shadow.mapSize.width = 2048;
    shadowLight.shadow.mapSize.height = 2048;
    scene.add(hemisphereLight);
    scene.add(shadowLight);
}

Sea = function () {
    var geom = new THREE.CylinderGeometry(600, 600, 800, 40, 10);
    geom.rotateX(-Math.PI / 2);
    // geom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    var mat = new THREE.MeshPhongMaterial({
        color: Colors.blue,
        transparent: true,
        opacity: .6,
        shading: THREE.FlatShading
    });
    this.mesh = new THREE.Mesh(geom, mat);
    this.mesh.receiveShadow = true;
}
var sea;
function createSea() {
    sea = new Sea();
    sea.mesh.position.y = -600;
    scene.add(sea.mesh);
}

Cloud = function () {
    // 创建一个空的容器放置不同形状的云
    this.mesh = new THREE.Object3D();
    var geom = new THREE.BoxGeometry(20, 20, 20);
    // 创建材质；一个简单的白色材质就可以达到效果
    var mat = new THREE.MeshPhongMaterial({
        color: Colors.white,
    });
    // 随机多次复制几何体
    var nBlocs = 3 + Math.floor(Math.random() * 3);
    for (var i = 0; i < nBlocs; i++) {
        // 通过复制几何体创建网格
        var m = new THREE.Mesh(geom, mat);
        // 随机设置每个正方体的位置和旋转角度
        m.position.x = i * 15;
        m.position.y = Math.random() * 10;
        m.position.z = Math.random() * 10;
        m.rotation.z = Math.random() * Math.PI * 2;
        m.rotation.y = Math.random() * Math.PI * 2;

        // 随机设置正方体的大小
        var s = .1 + Math.random() * .9;
        m.scale.set(s, s, s);

        // 允许每个正方体生成投影和接收阴影
        m.castShadow = true;
        m.receiveShadow = true;
        this.mesh.add(m);
    }
}
Sky = function () {
    // 创建一个空的容器
    this.mesh = new THREE.Object3D();
    // 选取若干朵云散布在天空中
    this.nClouds = 20;
    // 把云均匀地散布
    // 我们需要根据统一的角度放置它们
    var stepAngle = Math.PI * 2 / this.nClouds;
    // 创建云对象
    for (var i = 0; i < this.nClouds; i++) {
        var c = new Cloud();
        // 设置每朵云的旋转角度和位置
        // 因此我们使用了一点三角函数
        var a = stepAngle * i; //这是云的最终角度
        var h = 750 + Math.random() * 200; // 这是轴的中心和云本身之间的距离

        // 三角函数！！！希望你还记得数学学过的东西 :)
        // 假如你不记得:
        // 我们简单地把极坐标转换成笛卡坐标
        c.mesh.position.y = Math.sin(a) * h;
        c.mesh.position.x = Math.cos(a) * h;
        // 根据云的位置旋转它
        c.mesh.rotation.z = a + Math.PI / 2;
        // 为了有更好的效果，我们把云放置在场景中的随机深度位置
        c.mesh.position.z = -400 - Math.random() * 400;
        // 而且我们为每朵云设置一个随机大小
        var s = 1 + Math.random() * 2;
        c.mesh.scale.set(s, s, s);
        // 不要忘记将每朵云的网格添加到场景中
        this.mesh.add(c.mesh);
    }
}
// 现在我们实例化天空对象，而且将它放置在屏幕中间稍微偏下的位置。
var sky;
function createSky() {
    sky = new Sky();
    sky.mesh.position.y = -600;
    scene.add(sky.mesh);
}

var AirPlane = function () {
    this.mesh = new THREE.Object3D();
    // 创建机舱
    var geomCockpit = new THREE.BoxGeometry(60, 50, 50, 1, 1, 1);
    var matCockpit = new THREE.MeshPhongMaterial({
        color: Colors.red,
        shading: THREE.FlatShading
    });
    var cockpit = new THREE.Mesh(geomCockpit, matCockpit);
    cockpit.castShadow = true;
    cockpit.receiveShadow = true;
    this.mesh.add(cockpit);

    // 创建引擎
    var geomEngine = new THREE.BoxGeometry(20, 50, 50, 1, 1, 1);
    var matEngine = new THREE.MeshPhongMaterial({
        color: Colors.white,
        shading: THREE.FlatShading
    });
    var engine = new THREE.Mesh(geomEngine, matEngine);
    engine.position.x = 40;
    engine.castShadow = true;
    engine.receiveShadow = true;
    this.mesh.add(engine);

    // 创建机尾
    var geomTailPlane = new THREE.BoxGeometry(15, 20, 5, 1, 1, 1);
    var matTailPlane = new THREE.MeshPhongMaterial({
        color: Colors.red,
        shading: THREE.FlatShading
    });
    var tailPlane = new THREE.Mesh(geomTailPlane, matTailPlane);
    tailPlane.position.set(-35, 25, 0);
    tailPlane.castShadow = true;
    tailPlane.receiveShadow = true;
    this.mesh.add(tailPlane);

    // 创建机翼
    var geomSideWing = new THREE.BoxGeometry(40, 8, 150, 1, 1, 1);
    var matSideWing = new THREE.MeshPhongMaterial({
        color: Colors.red,
        shading: THREE.FlatShading
    });
    var sideWing = new THREE.Mesh(geomSideWing, matSideWing);
    sideWing.castShadow = true;
    sideWing.receiveShadow = true;
    this.mesh.add(sideWing);

    // 创建螺旋桨
    var geomPropeller = new THREE.BoxGeometry(20, 10, 10, 1, 1, 1);
    var matPropeller = new THREE.MeshPhongMaterial({
        color: Colors.brown,
        shading: THREE.FlatShading
    });
    this.propeller = new THREE.Mesh(geomPropeller, matPropeller);
    this.propeller.castShadow = true;
    this.propeller.receiveShadow = true;

    // 创建螺旋桨的桨叶
    var geomBlade = new THREE.BoxGeometry(1, 100, 20, 1, 1, 1);
    var matBlade = new THREE.MeshPhongMaterial({
        color: Colors.brownDark,
        shading: THREE.FlatShading
    });

    var blade = new THREE.Mesh(geomBlade, matBlade);
    blade.position.set(8, 0, 0);
    blade.castShadow = true;
    blade.receiveShadow = true;
    this.propeller.add(blade);
    this.propeller.position.set(50, 0, 0);
    this.mesh.add(this.propeller);
};
var airplane;
function createPlane() {
    airplane = new AirPlane();
    airplane.mesh.scale.set(.25, .25, .25);
    airplane.mesh.position.y = 50;
    airplane.mesh.position.z = 10;
    scene.add(airplane.mesh);
}

var mousePos = { x: 0, y: 0 };
// mousemove 事件处理函数
function handleMouseMove(event) {
    // 这里我把接收到的鼠标位置的值转换成归一化值，在-1与1之间变化
    // 这是x轴的公式:
    var tx = -1 + (event.clientX / width) * 2;
    // 对于 y 轴，我们需要一个逆公式
    // 因为 2D 的 y 轴与 3D 的 y 轴方向相反
    var ty = 1 - (event.clientY / height) * 2;
    mousePos = { x: tx, y: ty };
}

function loop() {
    sea.mesh.rotation.z += .005;
    sky.mesh.rotation.z += .01;

    // 更新每帧的飞机
    updatePlane();
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
}
function updatePlane() {

    //让我们在x轴上-100至100之间和y轴25至175之间移动飞机
    //根据鼠标的位置在-1与1之间的范围，我们使用的 normalize 函数实现（如下）
    var targetX = normalize(mousePos.x, -1, 1, -100, 100);
    var targetY = normalize(mousePos.y, -1, 1, 25, 175);
    //更新飞机的位置
    airplane.mesh.position.y = targetY;
    airplane.mesh.position.x = targetX;
    airplane.propeller.rotation.x += 0.3;
}
function normalize(v, vmin, vmax, tmin, tmax) {
    var nv = Math.max(Math.min(v, vmax), vmin);
    var dv = vmax - vmin;
    var pc = (nv - vmin) / dv;
    var dt = tmax - tmin;
    var tv = tmin + (pc * dt);
    return tv;
}