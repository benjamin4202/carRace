import Settings from './data/canvas-settings';
import './App.css';
import drawMountain from './drawings/drawMountain';
import { useEffect } from 'react';

function App() {

  const drawBg = () => {
    Settings.ctx.fillStyle = Settings.colors.sky;
    Settings.ctx.fillRect(0, 0, Settings.ctx.canvas.width, Settings.settings.skySize);
    drawMountain(Settings.ctx, 0, 60, 200);
    drawMountain(Settings.ctx, 280, 40, 200);
    drawMountain(Settings.ctx, 400, 80, 200);
    drawMountain(Settings.ctx, 550, 60, 200);
    Settings.storage.bg = Settings.ctx.getImageData(0, 0, Settings.ctx.canvas.width, Settings.ctx.canvas.height);
  }

  const randomRange = (min, max) => {
    return min + Math.random() * (max - min);
  }
  
  const norm = (value, min, max) => {
    return (value - min) / (max - min);
  }
  
  const lerp = (norm, min, max) => {
    return (max - min) * norm + min;
  }
  
  const map = (value, sourceMin, sourceMax, destMin, destMax) => {
    return lerp(norm(value, sourceMin, sourceMax), destMin, destMax);
  }
  
  const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  }

  const calcMovement = () => {
    var move = Settings.state.speed * 0.01,
        newCurve = 0;
    
    if(Settings.state.keypress.up) {
      Settings.state.speed += Settings.state.car.acc - (Settings.state.speed * 0.015);
    } else if (Settings.state.speed > 0) {
      Settings.state.speed -= Settings.state.car.friction;
    }
    
    if(Settings.state.keypress.down && Settings.state.speed > 0) {
      Settings.state.speed -= 1;
    }
    
    // Left and right
    Settings.state.xpos -= (Settings.state.currentCurve * Settings.state.speed) * 0.005;
    
    if(Settings.state.speed) {
      if(Settings.state.keypress.left) {
        Settings.state.xpos += (Math.abs(Settings.state.turn) + 7 + (Settings.state.speed > Settings.state.car.maxSpeed / 4 ? (Settings.state.car.maxSpeed - (Settings.state.speed / 2)) : Settings.state.speed)) * 0.2;
        Settings.state.turn -= 1;
      }
    
      if(Settings.state.keypress.right) {
        Settings.state.xpos -= (Math.abs(Settings.state.turn) + 7 + (Settings.state.speed > Settings.state.car.maxSpeed / 4 ? (Settings.state.car.maxSpeed - (Settings.state.speed / 2)) : Settings.state.speed)) * 0.2;
        Settings.state.turn += 1;
      }
      
      if(Settings.state.turn !== 0 && !Settings.state.keypress.left && !Settings.state.keypress.right) {
        Settings.state.turn += Settings.state.turn > 0 ? -0.25 : 0.25;
      }
    }
    
    Settings.state.turn = clamp(Settings.state.turn, -5, 5);
    Settings.state.speed = clamp(Settings.state.speed, 0, Settings.state.car.maxSpeed);
    
    // section
    Settings.state.section -= Settings.state.speed;
    
    if(Settings.state.section < 0) {
      Settings.state.section = randomRange(1000, 9000);
      
      newCurve = randomRange(-50, 50);
      
      if(Math.abs(Settings.state.curve - newCurve) < 20) {
        newCurve = randomRange(-50, 50);
      }
      
      Settings.state.curve = newCurve;
    }
    
    if(Settings.state.currentCurve < Settings.state.curve && move < Math.abs(Settings.state.currentCurve - Settings.state.curve)) {
      Settings.state.currentCurve += move;
    } else if(Settings.state.currentCurve > Settings.state.curve && move < Math.abs(Settings.state.currentCurve - Settings.state.curve)) {
      Settings.state.currentCurve -= move;
    }
    
    if(Math.abs(Settings.state.xpos) > 550) {
      Settings.state.speed *= 0.96;
    }
    
    Settings.state.xpos = clamp(Settings.state.xpos, -650, 650);
  }

  const keyUp = (e) => {
    move(e, false);
}

const keyDown = (e) =>{
    move(e, true);
}

const move = (e, isKeyDown) => {
  if(e.keyCode >= 37 && e.keyCode <= 40) {
    e.preventDefault();
  }

  if(e.keyCode === 37) {
    Settings.state.keypress.left = isKeyDown;
  } 

  if(e.keyCode === 38) {
    Settings.state.keypress.up = isKeyDown;
  } 

  if(e.keyCode === 39) {
    Settings.state.keypress.right = isKeyDown;
  } 

  if(e.keyCode === 40) {
    Settings.state.keypress.down = isKeyDown;
  }
}

  const drawGround = (ctx, offset, lightColor, darkColor, width) => {
    var pos = (Settings.settings.skySize - Settings.settings.ground.min) + offset, stepSize = 1, drawDark = Settings.state.startDark, firstRow = true;
    ctx.fillStyle = lightColor;
    ctx.fillRect(0, Settings.settings.skySize, width, Settings.settings.ground.size);
  
    ctx.fillStyle =  darkColor;
    while(pos <= ctx.canvas.height) {
      stepSize = norm(pos, Settings.settings.skySize, ctx.canvas.height) * Settings.settings.ground.max;
      if(stepSize < Settings.settings.ground.min) {
        stepSize = Settings.settings.ground.min;
      }
    
      if(drawDark) {
        if(firstRow) {
          ctx.fillRect(0, Settings.settings.skySize, width, stepSize - (offset > Settings.settings.ground.min ? Settings.settings.ground.min : Settings.settings.ground.min - offset));
        } else {
          ctx.fillRect(0, pos < Settings.settings.skySize ? Settings.settings.skySize : pos, width, stepSize);
        }
      }
      
      firstRow = false;
      pos += stepSize;
      drawDark = !drawDark;
    }
  }

  const drawRoad = (min, max, squishFactor, color) => {
    let basePos = Settings.ctx.canvas.width + Settings.state.xpos;
    
    Settings.ctx.fillStyle = color;
    Settings.ctx.beginPath();
    Settings.ctx.moveTo(((basePos + min) / 2) - (Settings.state.currentCurve * 3), Settings.settings.skySize);
    Settings.ctx.quadraticCurveTo((((basePos / 2) + min)) + (Settings.state.currentCurve / 3) + squishFactor, Settings.settings.skySize + 52, (basePos + max) / 2, Settings.ctx.canvas.height);
    Settings.ctx.lineTo((basePos - max) / 2, Settings.ctx.canvas.height);
    Settings.ctx.quadraticCurveTo((((basePos / 2) - min)) + (Settings.state.currentCurve / 3) - squishFactor, Settings.settings.skySize + 52, ((basePos - min) / 2) - (Settings.state.currentCurve * 3), Settings.settings.skySize);
    Settings.ctx.closePath();
    Settings.ctx.fill();
  }

  const drawCar = () => {
    const carWidth = 160,
        carHeight = 50,
        carX = (Settings.canvas.width / 2) - (carWidth / 2),
        carY = 320;
    
    // shadow
    roundedRect(Settings.ctx, "rgba(0, 0, 0, 0.35)", carX - 1 + Settings.state.turn, carY + (carHeight - 35), carWidth + 10, carHeight, 9);
    
    // tires
    roundedRect(Settings.ctx, "#111", carX, carY + (carHeight - 30), 30, 40, 6);
    roundedRect(Settings.ctx, "#111", (carX - 22) + carWidth, carY + (carHeight - 30), 30, 40, 6);
    
    drawCarBody(Settings.ctx);
  }

  const drawCarBody = (ctx) => {
    var startX = 299, startY = 311,
        lights = [10, 26, 134, 152],
        lightsY = 0;
    
    /* Front */
    roundedRect(Settings.ctx, "#C2C2C2", startX + 6 + (Settings.state.turn * 1.1), startY - 18, 146, 40, 18);
    
    ctx.beginPath(); 
    ctx.lineWidth="12";
    ctx.fillStyle="#FFFFFF";
    ctx.strokeStyle="#FFFFFF";
    ctx.moveTo(startX + 30, startY);
    ctx.lineTo(startX + 46 + Settings.state.turn, startY - 25);
    ctx.lineTo(startX + 114 + Settings.state.turn, startY - 25);
    ctx.lineTo(startX + 130, startY);
    ctx.fill();
    ctx.stroke();
    /* END: Front */
    
    ctx.lineWidth="12";
    ctx.lineCap = 'round';
    ctx.beginPath(); 
    ctx.fillStyle="#DEE0E2";
    ctx.strokeStyle="#DEE0E2";
    ctx.moveTo(startX + 2, startY + 12 + (Settings.state.turn * 0.2));
    ctx.lineTo(startX + 159, startY + 12 + (Settings.state.turn * 0.2));
    ctx.quadraticCurveTo(startX + 166, startY + 35, startX + 159, startY + 55 + (Settings.state.turn * 0.2));
    ctx.lineTo(startX + 2, startY + 55 - (Settings.state.turn * 0.2));
    ctx.quadraticCurveTo(startX - 5, startY + 32, startX + 2, startY + 12 - (Settings.state.turn * 0.2));
    ctx.fill();
    ctx.stroke();
  
    ctx.beginPath(); 
    ctx.lineWidth="12";
    ctx.fillStyle="#DEE0E2";
    ctx.strokeStyle="#DEE0E2";
    ctx.moveTo(startX + 30, startY);
    ctx.lineTo(startX + 40 + (Settings.state.turn * 0.7), startY - 15);
    ctx.lineTo(startX + 120 + (Settings.state.turn * 0.7), startY - 15);
    ctx.lineTo(startX + 130, startY);
    ctx.fill();
    ctx.stroke();
    
    roundedRect(ctx, "#474747", startX - 4, startY, 169, 10, 3, true, 0.2);
    roundedRect(ctx, "#474747", startX + 40, startY + 5, 80, 10, 5, true, 0.1);
    
    ctx.fillStyle = "#FF9166";
    
    lights.forEach(function(xPos) {
      ctx.beginPath();
      ctx.arc(startX + xPos, startY + 20 + lightsY, 6, 0, Math.PI*2, true); 
      ctx.closePath();
      ctx.fill();
      lightsY += Settings.state.turn * 0.05;
    });
    
    ctx.lineWidth="9";
    ctx.fillStyle="#222222";
    ctx.strokeStyle="#444";
    
    roundedRect(Settings.ctx, "#FFF", startX + 60, startY + 25, 40, 18, 3, true, 0.05);
  }

  const roundedRect = (ctx, color, x, y, width, height, radius, turn, turneffect) => {
    const skew = turn === true ? Settings.state.turn * turneffect : 0;
    
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + radius, y - skew);
    
    // top right
    ctx.lineTo(x + width - radius, y + skew);
    ctx.arcTo(x + width, y + skew, x + width, y + radius + skew, radius);
    ctx.lineTo(x + width, y + radius + skew);
    
    // down right
    ctx.lineTo(x + width, (y + height + skew) - radius);
    ctx.arcTo(x + width, y + height + skew, (x + width) - radius, y + height + skew, radius);
    ctx.lineTo((x + width) - radius, y + height + skew);
    
    // down left
    ctx.lineTo(x + radius, y + height - skew);
    ctx.arcTo(x, y + height - skew, x, (y + height - skew) - radius, radius);
    ctx.lineTo(x, (y + height - skew) - radius);
    
    // top left
    ctx.lineTo(x, y + radius - skew);
    ctx.arcTo(x, y - skew, x + radius, y - skew, radius);
    ctx.lineTo(x + radius, y - skew);
    ctx.fill();
  }

  const drawHUD = (ctx, centerX, centerY, color) => {
    const radius = 50, tigs = [0, 90, 135, 180, 225, 270, 315];
    let angle = 90;
  
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.lineWidth = 7;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fill();
    ctx.strokeStyle = color;
    ctx.stroke();
    
    for (var i = 0; i < tigs.length; i++) {
      drawTig(ctx, centerX, centerY, radius, tigs[i], 7);
    }
    
    // draw pointer
    angle = map(Settings.state.speed, 0, Settings.state.car.maxSpeed, 90, 360);
    drawPointer(ctx, color, 50, centerX, centerY, angle);
  }

  const drawPointer = (ctx, color, radius, centerX, centerY, angle) => {
    var point = getCirclePoint(centerX, centerY, radius - 20, angle),
        point2 = getCirclePoint(centerX, centerY, 2, angle + 90),
        point3 = getCirclePoint(centerX, centerY, 2, angle - 90);
    
    ctx.beginPath();
    ctx.strokeStyle = "#FF9166";
    ctx.lineCap = 'round';
    ctx.lineWidth = 4;
    ctx.moveTo(point2.x, point2.y);
    ctx.lineTo(point.x, point.y);
    ctx.lineTo(point3.x, point3.y);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, 9, 0, 2 * Math.PI, false);
    ctx.fillStyle = color;
    ctx.fill();
  }
  
  const drawTig = (ctx, x, y, radius, angle, size) => {
    const startPoint = getCirclePoint(x, y, radius - 4, angle),
        endPoint = getCirclePoint(x, y, radius - size, angle)
    
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.moveTo(startPoint.x, startPoint.y);
    ctx.lineTo(endPoint.x, endPoint.y);
    ctx.stroke();
  }

  const getCirclePoint = (x, y, radius, angle) => {
    const radian = (angle / 180) * Math.PI;
  
    return {
      x: x + radius * Math.cos(radian),
      y: y + radius * Math.sin(radian)
    }
}

  const draw = () => {
    setTimeout(function() {
    calcMovement();
      
      if(Settings.state.speed > 0) {
        Settings.state.bgpos += (Settings.state.currentCurve * 0.02) * (Settings.state.speed * 0.2);
        Settings.state.bgpos = Settings.state.bgpos % Settings.ctx.canvas.width;
        
        Settings.ctx.putImageData(Settings.storage.bg, Settings.state.bgpos, 5);
        Settings.ctx.putImageData(Settings.storage.bg, Settings.state.bgpos > 0 ? Settings.state.bgpos - Settings.canvas.width : Settings.state.bgpos + Settings.canvas.width, 5);
      }
      
      Settings.state.offset += Settings.state.speed * 0.05;
      if(Settings.state.offset > Settings.settings.ground.min) {
        Settings.state.offset = Settings.settings.ground.min - Settings.state.offset;
        Settings.state.startDark = !Settings.state.startDark;
      }
      drawGround(Settings.ctx, Settings.state.offset, Settings.colors.ground, Settings.colors.groundDark, Settings.ctx.canvas.width);  
      drawRoad(Settings.settings.road.min + 6, Settings.settings.road.max + 36, 10, Settings.colors.roadLine);
      drawGround(Settings.ctx2, Settings.state.offset, Settings.colors.roadLine, Settings.colors.road, Settings.canvas.width);
      drawRoad(Settings.settings.road.min, Settings.settings.road.max, 10, Settings.colors.road);
      drawRoad(3, 24, 0, Settings.ctx.createPattern(Settings.canvas2, 'repeat'));
      drawCar();
      drawHUD(Settings.ctx, 630, 340, Settings.colors.hud);
      
      requestAnimationFrame(draw);
    }, 1000 / Settings.settings.fps);
  }

  useEffect(() => {
    Settings.canvas = document.getElementsByTagName('canvas')[0];
    Settings.ctx = Settings.canvas.getContext('2d');
    Settings.canvas2 = document.createElement('canvas');
    Settings.canvas2.width = Settings.canvas.width;
    Settings.canvas2.height = Settings.canvas.height;
    Settings.ctx2 = Settings.canvas2.getContext('2d');
    drawBg();
    draw();
    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);
  },[])
  
  return (
    <div className="App">
      {/* <Canvas draw={draw} /> */}
      <canvas height="450" width="750"></canvas>
    </div>
  );
}

export default App;

