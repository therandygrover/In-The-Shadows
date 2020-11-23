/*
 * Changing active object and shader
 */
function changeActiveMesh(sel) {
    var id = parseInt(sel.value, 10);
    currentMesh = meshes[id];
    currentTransform = meshTransforms[id];
}

function changeActiveShader(sel) {
    var id = parseInt(sel.value, 10);
    currentProgram = shaderPrograms[id];

    $("[class$='-panel']").css("display", "none");

    switch ( id ) {
        case 5: // Phong
            $(".phong-panel").css("display", "");
            break;

        case 6: // Blinn-Phong
            $(".blinn-phong-panel").css("display", "");
            break;

        case 7: // Microfacet
            $(".microfacet-panel").css("display", "");
            break;
    }
}

function changeResolution(sel) {
    var id = parseInt(sel.value, 10);

    var width = 0, height = 0;
    switch ( id ) {
        case 0:
            width = 640; height = 360; break;

        case 1:
            width = 800; height = 450; break;

        case 2:
            width = 960; height = 540; break;

        default:
            alert("Unknown resolution!");
    }

    if ( width > 0 ) {
        var canvas = $("#canvas0")[0];
        
        canvas.width = width; 
        canvas.height = height;

        gl.viewportWidth = width;
        gl.viewportHeight = height;
    }
}


/*
 * Slider bar handlers
 */
function changeAnimatedState(ifAnimated) {
    animated = ifAnimated;
    $("#sliderBar").prop("disabled", !animated);
}

function updateSlider(sliderAmount) {
    $("#sliderAmount").html(sliderAmount*10);
    rotSpeed = sliderAmount*10.0;
}

function changeShowLightState(ifShow) {
    draw_light = ifShow;
}

function changeShadows(ifShow) {
    draw_shadows = !ifShow;
}    

function changeAnimatedLightState(ifAnimated) {
    animated_light = ifAnimated;
    $("#sliderBarLight").prop("disabled", !animated_light);
}

function updateSliderLight(sliderAmount) {
    var value = sliderAmount*10.0;
    $("#sliderAmountLight").html(value);
    rotSpeed_light = value;
}

function updateSlider_LightPower(sliderAmount) {
    var value = sliderAmount/2.0;
    $("#sliderAmount_LightPower").html(value);
    lightPower = value;
}

function updateSlider_Ambient(sliderAmount) {
    var value = sliderAmount/100.0;
    $("#sliderAmount_Ambient").html(value);
    ambientIntensity = value;
}

function updateSlider_PhongExp(sliderAmount) {
    var value = sliderAmount*5;
    $("#sliderAmount_PhongExp").html(value);

    gl.useProgram(shaderPrograms[5]);
    gl.uniform1f(shaderPrograms[5].exponentUniform, value);
}

function updateSlider_BlinnPhongExp(sliderAmount) {
    var value = sliderAmount*5;
    $("#sliderAmount_BlinnPhongExp").html(value);

    gl.useProgram(shaderPrograms[6]);
    gl.uniform1f(shaderPrograms[6].exponentUniform, value);
}

function updateSlider_MicrofacetIOR(sliderAmount) {
    var value = sliderAmount/10.0;
    $("#sliderAmount_MicrofacetIOR").html(value);

    gl.useProgram(shaderPrograms[7]);
    gl.uniform1f(shaderPrograms[7].iorUniform, value);
}

function updateSlider_MicrofacetBeta(sliderAmount) {
    var value = sliderAmount/100.0;
    $("#sliderAmount_MicrofacetBeta").html(value);

    gl.useProgram(shaderPrograms[7]);
    gl.uniform1f(shaderPrograms[7].betaUniform, value);
}

/*
 * Page-load handler
 */
$(function() {
    var colorPalette = [
        ["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],
        ["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],
        ["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],
        ["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],
        ["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],
        ["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],
        ["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],
        ["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]
    ];

    $("#colorPicker").spectrum({
        color: "#3d85c6",
        showPaletteOnly: true,
        togglePaletteOnly: true,
        hideAfterPaletteSelect: true,
        palette: colorPalette,
        change: function(color) {
            var color_ = color.toRgb();
            $("#colorText").html(color.toHexString());
            diffuseColor = [color_.r/255.0, color_.g/255.0, color_.b/255.0];
        }        
    });

    $("#colorPicker2").spectrum({
        color: "#ffffff",
        showPaletteOnly: true,
        togglePaletteOnly: true,
        hideAfterPaletteSelect: true,
        palette: colorPalette,
        change: function(color) {
            var color_ = color.toRgb();
            $("#colorText2").html(color.toHexString());
            specularColor = [color_.r/255.0, color_.g/255.0, color_.b/255.0];
        }        
    });

    webGLStart();
});

var arenaSize = 200;
var maxPillars = 64;
var pillars = [];
function generatePillars()
{
    var perRow = Math.sqrt(maxPillars);
    var maxSize = ((arenaSize/2)/(perRow))-3;
    
    for (var i=0; i<maxPillars; ++i)
    {
	pillars[i] = [];

	var x = i%perRow;
	var y = Math.floor(i/perRow);

	//pillars[i][0] = [(Math.random()*200)-100, 0,(Math.random()*200)-100];
	pillars[i][0] = [((x/perRow)*arenaSize)-arenaSize/2, 0,((y/perRow)*arenaSize)-arenaSize/2];
	pillars[i][1] = [(maxSize*Math.random())+1, (30*Math.random())+1, (maxSize*Math.random())+1];
	//pillars[i][1] = [(maxSize*1)+1, (30*1)+1, (maxSize*1)+1];
    }
}

var gridLength;
var lightTarget = [];
function spawnPlayer()
{
    var perRow = Math.sqrt(maxPillars);
    var maxSize = (arenaSize/(perRow*2))-3;

    gridLength = arenaSize/perRow;
    
    cameraLocation[0] = -arenaSize/2 + (maxPillars/2) + maxSize/2;
    cameraLocation[1] = 0;
    cameraLocation[2] = 0;
    
    lightLocation[0] = -arenaSize/2 + (maxPillars/2) + maxSize/2;
    lightLocation[1] = -.75;
    lightLocation[2] = -2;

    lightTarget[0] = lightLocation[0];
    lightTarget[1] = lightLocation[1];
    lightTarget[2] = lightLocation[2] - gridLength/2;
    
}

var maxZombies = 7;
var currentZombieCount = 0;
var zombies = [];
function spawnZombies()
{
    while(currentZombieCount < maxZombies)
    {
	zombies[currentZombieCount] = [];
	var good = false;
	var loc = [];
	while (!good)
	{
	    var loc = vec3.create();
	    loc = [(Math.random()*arenaSize)-arenaSize/2, 0, (Math.random()*arenaSize)-arenaSize/2];
	    if (!collisionWithPillar(loc))
		good = true;
	}

	zombies[currentZombieCount][0] = loc;
	zombies[currentZombieCount][1] = [0.5,1,0.5];
	currentZombieCount += 1;
    }
}

var zombieSpeed = 3;
function updateZombies(seconds)
{
    for (var i=0; i<currentZombieCount; ++i)
    {
	var zombie = zombies[i];
	//Light update
	var distToTarget = vec3.create();
	vec3.subtract(cameraLocation, zombie[0], distToTarget);

	if (vec3.length(distToTarget) > zombieSpeed*seconds)
	{
	    var newLoc = vec3.create();
	    vec3.set(zombie[0], newLoc);
	    var direction = vec3.create();
	    vec3.normalize(distToTarget, direction);
	    vec3.scale(direction, zombieSpeed*seconds);
	    vec3.add(newLoc, direction);

	    if (!collisionWithPillar(newLoc))
		zombie[0] = newLoc;
	    else if (!collisionWithPillar([zombie[0][0], newLoc[1], newLoc[2]]))
	    {
		newLoc[0] = zombie[0][0];
		zombie[0] = newLoc;
	    }
	    else if (!collisionWithPillar([newLoc[0], newLoc[1], zombie[0][2]]))
	    {
		newLoc[2] = zombie[0][2];
		zombie[0] = newLoc;
	    }
	}
	else
	{
	    gameEnd = true;
	}
    }
}

function collisionWithPillar(loc)
{
    var margin = 0.5;
    
    for (var i=0; i<maxPillars; ++i)
    {
	pillar = pillars[i];
	if (loc[0]+margin >= pillar[0][0]-pillar[1][0] &&
	    loc[0]-margin <= pillar[0][0]+pillar[1][0] &&
	    loc[1]+margin >= pillar[0][1]-pillar[1][1] &&
	    loc[1]-margin <= pillar[0][1]+pillar[1][1] &&
	    loc[2]+margin >= pillar[0][2]-pillar[1][2] &&
	    loc[2]-margin <= pillar[0][2]+pillar[1][2])
	    return true;	    
    }
    return false;
}

function collisionWithZombie(last, loc)
{
    var half = vec3.create();
    vec3.subtract(loc, last, half);
    for (var i=0; i<currentZombieCount; ++i)
    {
	zombie = zombies[i];
	
	if (loc[0] >= zombie[0][0]-zombie[1][0] &&
	    loc[0] <= zombie[0][0]+zombie[1][0] &&
	    loc[1] >= zombie[0][1]-zombie[1][1] &&
	    loc[1] <= zombie[0][1]+zombie[1][1] &&
	    loc[2] >= zombie[0][2]-zombie[1][2] &&
	    loc[2] <= zombie[0][2]+zombie[1][2])
	    return i;
	if (half[0] >= zombie[0][0]-zombie[1][0] &&
	    half[0] <= zombie[0][0]+zombie[1][0] &&
	    half[1] >= zombie[0][1]-zombie[1][1] &&
	    half[1] <= zombie[0][1]+zombie[1][1] &&
	    half[2] >= zombie[0][2]-zombie[1][2] &&
	    half[2] <= zombie[0][2]+zombie[1][2])
	    return i;
	
    }
    return -1;
}

function canSeePlayer(lightLoc, playerLoc)
{
    var granularity = 100;
    
    var ray = vec3.create();
    var dir = vec3.create();
    vec3.subtract(playerLoc, lightLoc, dir);

    var dist = vec3.create();
    vec3.set(dir, dist);
    vec3.scale(dist, 1/granularity);
    vec3.normalize(dir);

    vec3.set(lightLoc, ray);
    for (var i=0; i<granularity; ++i)
    {
	vec3.add(ray, dist);
	if (collisionWithPillar(ray))
	    return false;
    }

    return true;
}

var defaultColor = [0.2392, 0.5216, 0.7765];
var enemyColor = [1, 0, 0];
var lightColor = [1,1,1];
var bulletColor = [0.75,0.75,1];
var lightColors = [];
lightColors[0] = defaultColor;
lightColors[1] = defaultColor;

var input = {up:false, down:false, left:false, right:false, space:false, ctrl:false,
	     a:false, s:false, d:false, w:false, q:false, e:false, mouse1:false, mouse2:false}
document.addEventListener('keydown', function(event) {
    if(event.keyCode == 37) {
        input.right = true;
    }
    else if(event.keyCode == 39) {
        input.left = true;
    }
    else if(event.keyCode == 38) {
        input.up = true;
    }
    else if(event.keyCode == 40) {
        input.down = true;
    }
    else if(event.keyCode == 32) {
        input.space = true;
    }
    else if(event.keyCode == 17) {
        input.ctrl = true;
    }
    else if(event.keyCode == 87) {
        input.w = true;
    }
    else if(event.keyCode == 65) {
        input.a = true;
    }
    else if(event.keyCode == 83) {
        input.s = true;
    }
    else if(event.keyCode == 68) {
        input.d = true;
    }
    else if(event.keyCode == 81) {
        input.q = true;
    }
    else if(event.keyCode == 69) {
        input.e = true;
    }
});

document.addEventListener('keyup', function(event) {
    if(event.keyCode == 37) {
        input.right = false;
    }
    else if(event.keyCode == 39) {
        input.left = false;
    }
    else if(event.keyCode == 38) {
        input.up = false;
    }
    else if(event.keyCode == 40) {
        input.down = false;
    }
    else if(event.keyCode == 32) {
        input.space = false;
    }
    else if(event.keyCode == 17) {
        input.ctrl = false;
    }
    else if(event.keyCode == 87) {
        input.w = false;
    }
    else if(event.keyCode == 65) {
        input.a = false;
    }
    else if(event.keyCode == 83) {
        input.s = false;
    }
    else if(event.keyCode == 68) {
        input.d = false;
    }
    else if(event.keyCode == 81) {
        input.q = false;
    }
    else if(event.keyCode == 69) {
        input.e = false;
    }
});

document.addEventListener('mousemove', mouseMove, false);
document.addEventListener('mousedown', mouseClick, false);
document.addEventListener('mouseup', mouseUp, false);

function mouseMove(e)
{
    cameraRotation[1] -= e.movementX/Math.PI/300;
}

function mouseClick(e)
{
    if (e.clientX >= 0 && e.clientX <= canvas.width &&
	e.clientY-140 >= 0 && e.clientY-140 <= canvas.height)
    {
	canvas.requestPointerLock();
    }
    if (e.button == 0)
	input.mouse1 = true;
    else if (e.button == 2)
	input.mouse2 = true;
}

function mouseUp(e)
{
    if (e.button == 0)
	input.mouse1 = false;
    else if (e.button == 2)
	input.mouse2 = false;
}

var mainCamera = 0;
var lightLocation = vec3.create();
var light2Location = vec3.create();

var cameraLocation = vec3.create();
vec3.set(cameraLocation, lightLocation);

var cameraRotation = vec3.create();
cameraRotation = [0,0,0]

var lightSpeed = 4;

var bullets = [];
var bulletCount = 0;

var bulletSpeed = 20.0;

var rotato = 0.0;
var score = 0;
var gameEnd = false;
var lightSeenAmount = 0; //From 0 to 1
var secondsInLightForGameOver = 5;
var gracePeriod = 10;
var flashLightPower = 2;
var flashLightDrainSpeed = 0.25;
var flashLightRegenSpeed = 0.1;
var maxFlashLightPower = 2;

function gameSim(elapsed)
{
    var seconds = elapsed/1000.0 ;

    if (!gameEnd)
    {
	var moveSpeed = 5;
	var rotationSpeed = Math.PI/2;

	var nextLocation = vec3.create();
	vec3.set(cameraLocation, nextLocation);
	
	if (input.w)
	{
	    rotato += elapsed/1000.0*Math.PI;

	    var translation = mat4.create();
	    mat4.identity(translation);
	    mat4.rotateY(translation, cameraRotation[1]);
	    mat4.rotateZ(translation, cameraRotation[2]);
	    mat4.translate(translation, [0, 0, -seconds*moveSpeed]);
	    
	    nextLocation[0] += translation[12];
	    nextLocation[1] += translation[13];
	    nextLocation[2] += translation[14];
	    
	}
	if (input.s)
	{
	    rotato += elapsed/1000.0*Math.PI/2;

	    var translation = mat4.create();
	    mat4.identity(translation);
	    mat4.rotateY(translation, cameraRotation[1]);
	    mat4.rotateZ(translation, cameraRotation[2]);
	    mat4.translate(translation, [0, 0, seconds*moveSpeed]);
	    
	    nextLocation[0] += translation[12];
	    nextLocation[1] += translation[13];
	    nextLocation[2] += translation[14];
	    
	}
	if (input.a)
	{
	    rotato += elapsed/1000.0*Math.PI/2;

	    var translation = mat4.create();
	    mat4.identity(translation);
	    mat4.rotateY(translation, cameraRotation[1]);
	    mat4.rotateZ(translation, cameraRotation[2]);
	    mat4.translate(translation, [-seconds*moveSpeed, 0, 0]);
	    
	    nextLocation[0] += translation[12];
	    nextLocation[1] += translation[13];
	    nextLocation[2] += translation[14];
	    
	}
	if (input.d)
	{
	    rotato += elapsed/1000.0*Math.PI/2;

	    var translation = mat4.create();
	    mat4.identity(translation);
	    mat4.rotateY(translation, cameraRotation[1]);
	    mat4.rotateZ(translation, cameraRotation[2]);
	    mat4.translate(translation, [seconds*moveSpeed, 0, 0]);
	    
	    nextLocation[0] += translation[12];
	    nextLocation[1] += translation[13];
	    nextLocation[2] += translation[14];
	    
	}
	if (input.space || input.mouse1)
	{
	    var bullet = bullets[bulletCount];
	    bullet = [];
	    bullet[0] = vec3.create();
	    bullet[1] = vec3.create();
	    
	    vec3.set(cameraLocation, bullet[0]);
	    vec3.set(cameraRotation, bullet[1]);
	    var translation = mat4.create();
	    mat4.identity(translation);
	    mat4.rotateY(translation, bullet[1][1]);
	    mat4.rotateZ(translation, bullet[1][2]);
	    
	    mat4.translate(translation, [0,-0.3,bulletSpeed*seconds]);

	    bullet[0][0] += translation[12];
	    bullet[0][1] += translation[13];
	    bullet[0][2] += translation[14];

	    input.space = false;
	    input.mouse1 = false;

	    bullets[bulletCount] = bullet;
	    
	    bulletCount++;
	}

	if (nextLocation[0] > 98.0)
	    nextLocation[0] = 98.0;
	if (nextLocation[0] < -98.0)
	    nextLocation[0] = -98.0;
	if (nextLocation[2] > 98.0)
	    nextLocation[2] = 98.0;
	if (nextLocation[2] < -98.0)
	    nextLocation[2] = -98.0;
	
	if (!collisionWithPillar(nextLocation))
	    cameraLocation = nextLocation;
	else if (!collisionWithPillar([cameraLocation[0], nextLocation[1], nextLocation[2]]))
	{
	    nextLocation[0] = cameraLocation[0];
	    cameraLocation = nextLocation;
	}
	else if (!collisionWithPillar([nextLocation[0], nextLocation[1], cameraLocation[2]]))
	{
	    nextLocation[2] = cameraLocation[2];
	    cameraLocation = nextLocation;
	}
	
	if (input.right || input.q)
	    cameraRotation[1] += seconds*rotationSpeed;
	if (input.left || input.e)
	    cameraRotation[1] -= seconds*rotationSpeed;

	if (input.mouse2)
	{
	    lightPower[1] = flashLightPower;
	    flashLightPower -= flashLightDrainSpeed*seconds;
	    if (flashLightPower <= 0)
		flashLightPower = 0;
	}
	else
	{
	    lightPower[1] = 0;
	    flashLightPower += flashLightRegenSpeed*seconds;
	    if (flashLightPower >= maxFlashLightPower)
		flashLightPower = maxFlashLightPower;
	}

	//Bullet update
	for (var i=0; i<bulletCount; ++i)
	{

	    var bullet = bullets[i];

	    var lastPos = bullet[0];
	    
	    var translation = mat4.create();
	    mat4.identity(translation);
	    mat4.rotateY(translation, bullet[1][1]);
	    mat4.rotateZ(translation, bullet[1][2]);
	    mat4.translate(translation, [0,0,-seconds*bulletSpeed]);

	    bullet[0][0] += translation[12];
	    bullet[0][1] += translation[13];
	    bullet[0][2] += translation[14];

	    var l = vec3.create();
	    vec3.subtract(bullet[0], cameraLocation, l);

	    hit = collisionWithZombie(lastPos, bullet[0]);
	    if (hit != -1)
	    {
		zombies[hit] = zombies[currentZombieCount-1];
		currentZombieCount -= 1;
		score += 1;
	    }

	    if (Math.abs(vec3.length(l)) > 50.0 ||
		bullet[0][0] > 99.0 ||
		bullet[0][0] < -99.0 ||
		bullet[0][2] > 99.0 ||
		bullet[0][2] < -99.0 ||
		collisionWithPillar(bullet[0]))
	    {
		bullets[i] = bullets[bulletCount-1];
		bulletCount-=1;
	    }
	}

	vec3.set(cameraLocation, light2Location);
	light2Location[1] += 0.3*Math.sin(rotato);
	light2Location[0] += -0.3*Math.cos(rotato);
	
	//Light update
	var distToTarget = vec3.create();
	vec3.subtract(lightTarget, lightLocation, distToTarget);

	if (vec3.length(distToTarget) > lightSpeed*seconds)
	{
	    var direction = vec3.create();
	    vec3.normalize(distToTarget, direction);
	    vec3.scale(direction, lightSpeed*seconds);
	    vec3.add(lightLocation, direction);
	}
	else
	{
	    var good = false;
	    var nextTarget = [];

	    while(!good)
	    {	    
		nextTarget[0] = lightTarget[0];
		nextTarget[1] = lightTarget[1];
		nextTarget[2] = lightTarget[2];
		
		var dir = Math.random();
		var sign;
		if (Math.random() > 0.5)
		    sign = -1;
		else
		    sign = 1;
		if (dir <= 0.5)
		{
		    nextTarget[0] += gridLength*sign;
		}
		else
		{
		    nextTarget[2] += gridLength*sign;
		}

		if (!collisionWithPillar(lightTarget) &&
		    nextTarget[0] < arenaSize/2 && nextTarget[0] > -arenaSize/2 &&
		    nextTarget[2] < arenaSize/2 && nextTarget[2] > -arenaSize/2)
		    good = true;
	    }

	    lightTarget = nextTarget;
	}

	if (gracePeriod <= 0)
	{
	    if (canSeePlayer(lightLocation, cameraLocation))
	    {
		lightSeenAmount += seconds/secondsInLightForGameOver;
		if (lightSeenAmount > 1)
		    gameEnd = true;
	    }
	    else
	    {
		lightSeenAmount -= seconds/secondsInLightForGameOver;
		if (lightSeenAmount < 0)
		    lightSeenAmount = 0;
	    }
	    
	    if (lightSeenAmount == 0)
		lightColors[0] = [0.2392, 0.5216, 0.7765];
	    else
	    {
		lightColors[0] = [0.3+(1-0.2392)*lightSeenAmount, 0.1-(0.1*lightSeenAmount), 0.1-(0.1*lightSeenAmount)];
	    }

	}
	else
	{
	    lightColors[0] = [0.1,0.9,0.1];
	}

	gracePeriod -= seconds;
	
	spawnZombies();
	updateZombies(seconds);
	zombieSpeed += 0.025*seconds;
	lightSpeed += 0.01*seconds;
	secondsInLightForGameOver -= 0.01*seconds;
	if (secondsInLightForGameOver < 0.3)
	    secondsInLightForGameOver = 0.3;
    }
    else
    {
	//Game over screen
	if (lightSeenAmount >= 1)
	    alert("Game over!\nYou got seen by the watcher!\n" + score + " kills!\nClick OK to restart");
	else
	    alert("Game over!\nYou got eaten by a zombie!\n" + score + " kills!\nClick OK to restart");
	
	bullets = [];
	zombies = [];
	currentZombieCount = 0;
	bulletCount = 0;
	zombieSpeed = 2;
	lightSpeed = 4;
	score = 0;
	gracePeriod = 10;
	generatePillars();
	lightSeenAmount = 0;
	secondsInLightForGameOver = 5;
	spawnPlayer();
	gameEnd = false;
    }
}
