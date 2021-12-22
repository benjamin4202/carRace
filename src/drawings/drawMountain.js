import Settings from "../data/canvas-settings";

const drawMountain = (ctx, pos, height, width) => {
    ctx.fillStyle = Settings.colors.mountains;
    ctx.strokeStyle = Settings.colors.mountains;
    ctx.lineJoin = "round";
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.moveTo(pos, Settings.settings.skySize);
    ctx.lineTo(pos + (width / 2), Settings.settings.skySize - height);
    ctx.lineTo(pos + width, Settings.settings.skySize);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
  }

  export default drawMountain;
  