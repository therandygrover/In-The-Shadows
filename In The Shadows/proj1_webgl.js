/* 
 * Initializing GL object
 */
var gl;
function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;

	//Depth texture for shadows
	const ext = gl.getExtension('WEBGL_depth_texture');
	if (!ext) {
	    return alert('Unable to get extension: WEBGL_depth_texture');
	}
    } catch (e) {
    }
    if ( !gl ) alert("Could not initialise WebGL");
}


/*
 * Initializing object geometries
 */
var meshes, meshTransforms;
var currentMesh, currentTransform;
function initMesh() {
    // Load object meshes
    meshes = [
        new OBJ.Mesh(teapot_mesh_str),
        new OBJ.Mesh(bunny_mesh_str),
	new OBJ.Mesh(cube_mesh_str)
    ];
    OBJ.initMeshBuffers(gl, meshes[0]);
    OBJ.initMeshBuffers(gl, meshes[1]);
    OBJ.initMeshBuffers(gl, meshes[2]);

    currentMesh = meshes[0];

    meshTransforms = [mat4.create(), mat4.create(), mat4.create()];

    // Set per-object transforms to make them better fitting the viewport
    mat4.identity(meshTransforms[0]);
    mat4.rotateX(meshTransforms[0], -1.5708);
    mat4.scale(meshTransforms[0], [0.15, 0.15, 0.15]);        

    mat4.identity(meshTransforms[1]);
    mat4.translate(meshTransforms[1], [0.5, 0, 0]);
    
    mat4.identity(meshTransforms[2]);
    mat4.translate(meshTransforms[2], [0, 0, -3]);
    mat4.scale(meshTransforms[2], [3, 3, 1]);
    
    currentTransform = meshTransforms[0];
}

/*
 * Initializing shaders 
 */
var shaderPrograms;
var currentProgram;
var lightProgram;
function createShader(vs_id, fs_id) {
    var shaderProg = createShaderProg(vs_id, fs_id);

    shaderProg.vertexPositionAttribute = gl.getAttribLocation(shaderProg, "aVertexPosition");
    gl.enableVertexAttribArray(shaderProg.vertexPositionAttribute);
    shaderProg.vertexNormalAttribute = gl.getAttribLocation(shaderProg, "aVertexNormal");
    gl.enableVertexAttribArray(shaderProg.vertexNormalAttribute);        

    shaderProg.pMatrixUniform = gl.getUniformLocation(shaderProg, "uPMatrix");
    shaderProg.mvMatrixUniform = gl.getUniformLocation(shaderProg, "uMVMatrix");
    shaderProg.vMatrixUniform = gl.getUniformLocation(shaderProg, "uVMatrix");

    shaderProg.textureMatrixUniform = gl.getUniformLocation(shaderProg, "uTextureMatrix");
    shaderProg.worldMatrixUniform = gl.getUniformLocation(shaderProg, "uWorld");
    
    shaderProg.nMatrixUniform = gl.getUniformLocation(shaderProg, "uNMatrix");
    shaderProg.lightPosUniform = gl.getUniformLocation(shaderProg, "uLightPos");
    shaderProg.lightPowerUniform = gl.getUniformLocation(shaderProg, "uLightPower");
    shaderProg.kdUniform = gl.getUniformLocation(shaderProg, "uDiffuseColor");
    shaderProg.ksUniform = gl.getUniformLocation(shaderProg, "uSpecularColor");
    shaderProg.ambientUniform = gl.getUniformLocation(shaderProg, "uAmbient");    

    shaderProg.objColorUniform = gl.getUniformLocation(shaderProg, "uObjectColor");
    
    shaderProg.shadowMapUniform = gl.getUniformLocation(shaderProg, "uShadowMap");
    shaderProg.shadowMapUniform2 = gl.getUniformLocation(shaderProg, "uShadowMap2");
    shaderProg.shadowMapUniform3 = gl.getUniformLocation(shaderProg, "uShadowMap3");
    shaderProg.shadowMapUniform4 = gl.getUniformLocation(shaderProg, "uShadowMap4");
    shaderProg.shadowMapUniform5 = gl.getUniformLocation(shaderProg, "uShadowMap5");
    shaderProg.shadowMapUniform6 = gl.getUniformLocation(shaderProg, "uShadowMap6");
    
    shaderProg.shadowMapUniform7 = gl.getUniformLocation(shaderProg, "uShadowMap7");
    shaderProg.shadowMapUniform8 = gl.getUniformLocation(shaderProg, "uShadowMap8");
    shaderProg.shadowMapUniform9 = gl.getUniformLocation(shaderProg, "uShadowMap9");
    shaderProg.shadowMapUniform10 = gl.getUniformLocation(shaderProg, "uShadowMap10");
    shaderProg.shadowMapUniform11 = gl.getUniformLocation(shaderProg, "uShadowMap11");
    shaderProg.shadowMapUniform12 = gl.getUniformLocation(shaderProg, "uShadowMap12");
        
    shaderProg.shadowBoolUniform = gl.getUniformLocation(shaderProg, "uShadow");
    
    return shaderProg;
}

function initShaders() {
    shaderPrograms = [
        createShader("shader-vs", "shader-fs0"),
        createShader("shader-vs", "shader-fs1-1"),
        createShader("shader-vs", "shader-fs1-2"),
        createShader("shader-vs", "shader-fs1-3"),
        createShader("shader-vs", "shader-fs2"),
        createShader("shader-vs", "shader-fs3-1"),
        createShader("shader-vs", "shader-fs3-2"),
        createShader("shader-vs", "shader-fs4"),
	createShader("shader-vs", "shader-shadow"),
	createShader("shader-vs", "shader-normal"),
    ];
    currentProgram = shaderPrograms[0];

    //
    // Declaring shading model specific uniform variables
    //

    // Phong shading
    shaderPrograms[5].exponentUniform = gl.getUniformLocation(shaderPrograms[5], "uExponent");
    gl.useProgram(shaderPrograms[5]);
    gl.uniform1f(shaderPrograms[5].exponentUniform, 50.0);    

    // Blinn-Phong shading
    shaderPrograms[6].exponentUniform = gl.getUniformLocation(shaderPrograms[6], "uExponent");
    gl.useProgram(shaderPrograms[6]);
    gl.uniform1f(shaderPrograms[6].exponentUniform, 50.0);

    // Microfacet shading
    shaderPrograms[7].iorUniform = gl.getUniformLocation(shaderPrograms[7], "uIOR");
    shaderPrograms[7].betaUniform = gl.getUniformLocation(shaderPrograms[7], "uBeta");
    gl.useProgram(shaderPrograms[7]);
    gl.uniform1f(shaderPrograms[7].iorUniform, 5.0);
    gl.uniform1f(shaderPrograms[7].betaUniform, 0.2);

    // Initializing light source drawing shader
    lightProgram = createShaderProg("shader-vs-light", "shader-fs-light");
    lightProgram.vertexPositionAttribute = gl.getAttribLocation(lightProgram, "aVertexPosition");
    gl.enableVertexAttribArray(lightProgram.vertexPositionAttribute);
    lightProgram.pMatrixUniform = gl.getUniformLocation(lightProgram, "uPMatrix");
}


/*
 * Initializing buffers
 */
var lightPositionBuffer;
function initBuffers() {
    lightPositionBuffer = gl.createBuffer();
}



/*
 * Initializing textures
 */
var depthFramebuffers = [];
var depthTextures = [];
var colorTextures = [];

var shadowResolution = 2048;

function initTextures() {

    for (var i=11; i>=0; --i)
    {
	gl.activeTexture(gl.TEXTURE0+(2*i));
	depthTextures[i] = gl.createTexture();
	const depthTextureSize = shadowResolution;
	gl.bindTexture(gl.TEXTURE_2D, depthTextures[i]);
	gl.texImage2D(
	    gl.TEXTURE_2D,      // target
	    0,                  // mip level
	    gl.DEPTH_COMPONENT, // internal format
	    depthTextureSize,   // width
	    depthTextureSize,   // height
	    0,                  // border
	    gl.DEPTH_COMPONENT, // format
	    gl.UNSIGNED_INT,    // type
	    null);              // data
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	depthFramebuffers[i] = gl.createFramebuffer();
	gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffers[i]);
	gl.framebufferTexture2D(
	    gl.FRAMEBUFFER,       // target
	    gl.DEPTH_ATTACHMENT,  // attachment point
	    gl.TEXTURE_2D,        // texture target
	    depthTextures[i],         // texture
	    0);                   // mip level

	gl.activeTexture(gl.TEXTURE1+(2*i));
	colorTextures[i] = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, colorTextures[i]);
	gl.texImage2D(
	    gl.TEXTURE_2D,
	    0,
	    gl.RGBA,
	    depthTextureSize,
	    depthTextureSize,
	    0,
	    gl.RGBA,
	    gl.UNSIGNED_BYTE,
	    null,
	);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

	// attach it to the framebuffer
	gl.framebufferTexture2D(
	    gl.FRAMEBUFFER,        // target
	    gl.COLOR_ATTACHMENT0,  // attachment point
	    gl.TEXTURE_2D,         // texture target
	    colorTextures[i],         // texture
	    0);                    // mip level
    }
}


/*
 * Main rendering code 
 */

// Basic rendering parameters
var mvMatrix = mat4.create();                   // Model-view matrix for the main object
var pMatrix = mat4.create();                    // Projection matrix

// Lighting control
var lightMatrix = [];
lightMatrix[0] = mat4.create();                // Model-view matrix for the point light source
lightMatrix[1] = mat4.create();                // Model-view matrix for the point light source
lightMatrix[2] = mat4.create();                // Model-view matrix for the point light source
lightMatrix[3] = mat4.create();                // Model-view matrix for the point light source
lightMatrix[4] = mat4.create();                // Model-view matrix for the point light source
lightMatrix[5] = mat4.create();                // Model-view matrix for the point light source
lightMatrix[6] = mat4.create();                // Model-view matrix for the point light source
lightMatrix[7] = mat4.create();                // Model-view matrix for the point light source
lightMatrix[8] = mat4.create();                // Model-view matrix for the point light source
lightMatrix[9] = mat4.create();                // Model-view matrix for the point light source
lightMatrix[10] = mat4.create();                // Model-view matrix for the point light source
lightMatrix[11] = mat4.create();                // Model-view matrix for the point light source

var lightCount = 1;
var lights = [];
lights[0] = mat4.create();
lights[1] = mat4.create();

var forwardMatrix = mat4.create();
mat4.identity(forwardMatrix);
mat4.rotateY(forwardMatrix, 0);

var backMatrix = mat4.create();
mat4.identity(backMatrix);
mat4.rotateY(backMatrix, Math.PI);

var leftMatrix = mat4.create();
mat4.identity(leftMatrix);
mat4.rotateY(leftMatrix, Math.PI/2);

var rightMatrix = mat4.create();
mat4.identity(rightMatrix);
mat4.rotateY(rightMatrix, -Math.PI/2);

var upMatrix = mat4.create();
mat4.identity(upMatrix);
mat4.rotateX(upMatrix, Math.PI/2);

var downMatrix = mat4.create();
mat4.identity(downMatrix);
mat4.rotateX(downMatrix, -Math.PI/2);

var lightPos = vec3.create();                   // Camera-space position of the light source
var lightPos2 = vec3.create();
var lightPower = [];                           // "Power" of the light source
lightPower[0] = 15;
lightPower[1] = 0;

// Common parameters for shading models
var diffuseColor = [0.2392, 0.5216, 0.7765];    // Diffuse color
var ambientIntensity = 0.0;                     // Ambient
var specularColor = [1.0, 1.0, 1.0];   // Specular

// Animation related variables
var rotY = 0.0;                                 // object rotation
var rotY_light = 0.0;                           // light position rotation

function setUniforms(prog, world, cameraMatrix, lightPerspective, ambient, color) {
    gl.uniformMatrix4fv(prog.pMatrixUniform, false, pMatrix);
    gl.uniformMatrix4fv(prog.mvMatrixUniform, false, mvMatrix);
    var v = mat4.create();
    mat4.identity(v);
    mat4.multiply(v, cameraMatrix);
    gl.uniformMatrix4fv(prog.vMatrixUniform, false, v);

    //    var nMatrix = mat4.transpose(mat4.inverse(mvMatrix));
    var nMatrix = mat4.create();
    mat4.identity(nMatrix);
    mat4.multiply(nMatrix, mvMatrix);
    mat4.transpose(nMatrix);
    mat4.inverse(nMatrix);
    gl.uniformMatrix4fv(prog.nMatrixUniform, false, nMatrix);

    var l = vec3.create();
    vec3.set(lightLocation, l);
    //mat4.multiplyVec3(lights[0],l);
    mat4.multiplyVec3(cameraMatrix,l);

    var l2 = vec3.create();
    vec3.set(light2Location, l2);
    //mat4.multiplyVec3(lights[1],l2);
    mat4.multiplyVec3(cameraMatrix,l2);
    
    gl.uniform3fv(prog.lightPosUniform, [l[0], l[1], l[2],
					 l2[0], l2[1], l2[2]]);
    gl.uniform1fv(prog.lightPowerUniform, [lightPower[0], lightPower[1]]);
    //gl.uniform3fv(prog.kdUniform, diffuseColor);
    gl.uniform3fv(prog.objColorUniform, color);
    gl.uniform3fv(prog.kdUniform, [lightColors[0][0],lightColors[0][1],lightColors[0][2],
				   lightColors[1][0],lightColors[1][1],lightColors[1][2]]);
    gl.uniform3fv(prog.ksUniform, specularColor);
    gl.uniform1f(prog.ambientUniform, ambient);

    
    var textureProjectionMatrix = mat4.create();
    mat4.identity(textureProjectionMatrix);
    //mat4.perspective(35, 1, 0.5, 10.0, textureProjectionMatrix);
    mat4.multiply(textureProjectionMatrix, lightPerspective);

    //var textureWorldMatrix = mat4.lookAt([0,0,3], [0,0,0], [0,1,0]);
    var textureMatrices = [];

    for (var i=0; i<12; ++i)
    {
	var textureWorldMatrix = mat4.create();
	mat4.identity(textureWorldMatrix);
	mat4.multiply(textureWorldMatrix, lightMatrix[i]);
	//mat4.multiply(textureWorldMatrix, cameraMatrix);
	//mat4.inverse(textureWorldMatrix);
	
	var textureMatrix = mat4.create();
	mat4.identity(textureMatrix)
	mat4.translate(textureMatrix, [0.5, 0.5, 0.5]);
	mat4.scale(textureMatrix, [0.5, 0.5, 0.5]);
	mat4.multiply(textureMatrix, textureProjectionMatrix);    
	mat4.multiply(textureMatrix, mat4.inverse(textureWorldMatrix));    

	for (var x=0; x<16; ++x)
	{
	    textureMatrices[(16*i)+x] = textureMatrix[x];
	}
    }
    
    gl.uniformMatrix4fv(prog.textureMatrixUniform, false, textureMatrices);

    gl.uniformMatrix4fv(prog.worldMatrixUniform, false, world);
    
    gl.uniform1i(prog.shadowMapUniform, 0)
    gl.uniform1i(prog.shadowMapUniform2, 2)
    gl.uniform1i(prog.shadowMapUniform3, 4)
    gl.uniform1i(prog.shadowMapUniform4, 6)
    gl.uniform1i(prog.shadowMapUniform5, 8)
    gl.uniform1i(prog.shadowMapUniform6, 10)
    
    gl.uniform1i(prog.shadowMapUniform7, 12)
    gl.uniform1i(prog.shadowMapUniform8, 14)
    gl.uniform1i(prog.shadowMapUniform9, 16)
    gl.uniform1i(prog.shadowMapUniform10, 18)
    gl.uniform1i(prog.shadowMapUniform11, 20)
    gl.uniform1i(prog.shadowMapUniform12, 22)
        
    //gl.uniform1i(prog.shadowMapUniform2, [0,1])
    
    //if (mainCamera == 0)
    gl.uniform1i(prog.shadowBoolUniform, draw_shadows)
    //else
//	gl.uniform1i(prog.shadowBoolUniform, false)
}

var draw_shadows = true;
var draw_light = false;
function drawScene(camera, originX, originY, width, height) {
    gl.viewport(originX, originY, width, height);
    gl.clearColor(0,0,0,1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var lightPerspective = mat4.create();
    mat4.perspective(90, shadowResolution/shadowResolution, 2, 120.0, lightPerspective);
    
    if (camera == 0)
	mat4.perspective(75, width/height, 0.2, 2000.0, pMatrix);
    else
	mat4.set(lightPerspective, pMatrix);
    
    mat4.identity(lights[0]);
    mat4.translate(lights[0], lightLocation);
    
    mat4.identity(lights[1]);
    mat4.translate(lights[1], light2Location);

    for (var i=0; i<6; ++i)
    {
	mat4.set(lights[0], lightMatrix[i]);
    }
    mat4.multiply(lightMatrix[0], forwardMatrix);
    mat4.multiply(lightMatrix[1], backMatrix);
    mat4.multiply(lightMatrix[2], leftMatrix);
    mat4.multiply(lightMatrix[3], rightMatrix);
    mat4.multiply(lightMatrix[4], upMatrix);
    mat4.multiply(lightMatrix[5], downMatrix);

    for (var i=6; i<12; ++i)
    {
	mat4.set(lights[1], lightMatrix[i]);
    }
    mat4.multiply(lightMatrix[6], forwardMatrix);
    mat4.multiply(lightMatrix[7], backMatrix);
    mat4.multiply(lightMatrix[8], leftMatrix);
    mat4.multiply(lightMatrix[9], rightMatrix);
    mat4.multiply(lightMatrix[10], upMatrix);
    mat4.multiply(lightMatrix[11], downMatrix);
    
    vec3.set([0,0,0], lightPos);
    mat4.multiplyVec3(lights[0], lightPos);
    
    vec3.set([0,0,0], lightPos2);
    mat4.multiplyVec3(lights[1], lightPos2);

    var cameraMatrix = mat4.create();
    mat4.identity(cameraMatrix);
    if (camera == 0)
    {
	mat4.translate(cameraMatrix, cameraLocation);
	mat4.rotateX(cameraMatrix, cameraRotation[0]);
	mat4.rotateY(cameraMatrix, cameraRotation[1]);
	mat4.rotateZ(cameraMatrix, cameraRotation[2]);

    }
    else
	mat4.multiply(cameraMatrix, lightMatrix[camera-1]);

    mat4.inverse(cameraMatrix);


    mat4.multiplyVec3(cameraMatrix, lightPos);
    mat4.multiplyVec3(cameraMatrix, lightPos2);
    
    mat4.identity(mvMatrix);
    mat4.multiply(mvMatrix, cameraMatrix);
    //mat4.translate(mvMatrix, [0.0, -1.0, -7.0]);
    mat4.rotateY(mvMatrix, rotY);
    mat4.multiply(mvMatrix, currentTransform);
    
    drawObject(2, [0, -2, 0], [0, 0, 0], [arenaSize/2, 1, arenaSize/2], cameraMatrix, lightPerspective, 0, defaultColor);

    //drawAreaBoundaries();
    drawObject(2, [arenaSize/2, 90, 0], [0, 0, 0], [1, arenaSize/2, arenaSize/2], cameraMatrix, lightPerspective, 0, defaultColor);
    drawObject(2, [-arenaSize/2, (arenaSize/2)-10, 0], [0, 0, 0], [1, arenaSize/2, arenaSize/2], cameraMatrix, lightPerspective, 0, defaultColor);
    drawObject(2, [0, (arenaSize/2)-10, arenaSize/2], [0, 0, 0], [arenaSize/2, arenaSize/2, 1], cameraMatrix, lightPerspective, 0, defaultColor);
    drawObject(2, [0, (arenaSize/2)-10, -arenaSize/2], [0, 0, 0], [arenaSize/2, arenaSize/2, 1], cameraMatrix, lightPerspective, 0, defaultColor);

    for (var i=0; i<maxPillars; ++i)
	drawObject(2, pillars[i][0], [0, 0, 0], pillars[i][1], cameraMatrix, lightPerspective, 0, defaultColor);

    for (var i=0; i<currentZombieCount; ++i)
	drawObject(2, zombies[i][0], [0, 0, 0], zombies[i][1], cameraMatrix, lightPerspective, 0, enemyColor);

    drawObject(2, lightLocation, [0, 0, 0], [.2, .2, .2], cameraMatrix, lightPerspective, 1, lightColors[0]);

    for (var i=0; i<bulletCount; ++i)
    {
	drawObject(2, bullets[i][0], bullets[i][1], [0.1, 0.1, 0.1], cameraMatrix, lightPerspective, 0, bulletColor);
    }
}

function drawObject(obj, trans, rot, scale, cameraMatrix, lightPerspective, ambient, color)
{
    
    currentTransform = meshTransforms[obj];
    currentMesh = meshes[obj];
    
    gl.useProgram(currentProgram);
    var w = mat4.create();
    mat4.identity(w);
    mat4.translate(w, trans);
    mat4.rotateX(w, rot[0]);
    mat4.rotateY(w, rot[1]);
    mat4.rotateZ(w, rot[2]);
    mat4.scale(w, scale);
    mat4.identity(mvMatrix);
    mat4.multiply(mvMatrix, cameraMatrix);
    mat4.multiply(mvMatrix, w);
    setUniforms(currentProgram, w, cameraMatrix, lightPerspective, ambient, color);   

    gl.bindBuffer(gl.ARRAY_BUFFER, currentMesh.vertexBuffer);
    gl.vertexAttribPointer(currentProgram.vertexPositionAttribute, currentMesh.vertexBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, currentMesh.normalBuffer);
    gl.vertexAttribPointer(currentProgram.vertexNormalAttribute, currentMesh.normalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, currentMesh.indexBuffer);
    gl.drawElements(gl.TRIANGLES, currentMesh.indexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

}

var lastTime = 0;
var rotSpeed = 60, rotSpeed_light = 60;
var animated = false, animated_light = false;
function tick() {
    requestAnimationFrame(tick);

    var timeNow = new Date().getTime();
    if ( lastTime != 0 ) {
	var elapsed = timeNow - lastTime;
	gameSim(elapsed);
	if ( animated )
            rotY += rotSpeed*0.0175*elapsed/1000.0;
	if ( animated_light )
            rotY_light += rotSpeed_light*0.0175*elapsed/1000.0;
    }
    lastTime = timeNow;        

    var oldWidth = gl.viewportWidth;
    var oldHeight = gl.viewportHeight;

    var lastShader = currentProgram;

    for (var i=0; i<12; ++i)
    {
	currentProgram = shaderPrograms[8];
	gl.bindFramebuffer(gl.FRAMEBUFFER, depthFramebuffers[i]);
	drawScene(i+1, 0, 0, shadowResolution, shadowResolution);
    }
    
    currentProgram = lastShader;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    drawScene(mainCamera, 0, 0, oldWidth, oldHeight);
}

var canvas;
function webGLStart() {

    canvas = $("#canvas0")[0];
    initGL(canvas);
    initMesh();
    initShaders();
    initBuffers();
    initTextures();

    canvas.requestPointerLock = canvas.requestPointerLock ||
                            canvas.mozRequestPointerLock;

    canvas.requestPointerLock()
    
    generatePillars();
    spawnPlayer();    
    
    gl.clearColor(0.3, 0.3, 0.3, 1.0);
    gl.enable(gl.DEPTH_TEST);

    currentProgram = shaderPrograms[7];
    tick();
}
