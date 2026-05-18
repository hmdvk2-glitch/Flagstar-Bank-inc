/**
 * Reusable premium canvas particle confetti generator.
 * Fills the screen with fluid, gravity-bound particle trails
 * styled after Flagstar signature palette (#F15A24, #FFB81C, etc).
 */
export const triggerConfetti = () => {
  // Check if document is available
  if (typeof document === 'undefined') return;

  const canvas = document.createElement('canvas');
  canvas.style.position = 'fixed';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.pointerEvents = 'none';
  canvas.style.zIndex = '999999';
  document.body.appendChild(canvas);

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    document.body.removeChild(canvas);
    return;
  }

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const colors = ['#F15A24', '#FFB81C', '#004B5C', '#84BD00', '#002D38'];
  const particles: any[] = [];

  // Generate 180 fluid particles radiating upwards from bottom-center
  for (let i = 0; i < 180; i++) {
    particles.push({
      x: canvas.width / 2,
      y: canvas.height * 0.8,
      vx: (Math.random() - 0.5) * 18,
      vy: -Math.random() * 22 - 6,
      radius: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 12
    });
  }

  const animate = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let active = false;

    particles.forEach(p => {
      if (p.alpha <= 0) return;
      active = true;

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.45; // gravity pull
      p.vx *= 0.975; // air drag resistance
      p.alpha -= 0.009; // smooth fade
      p.rotation += p.rotationSpeed;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      
      // Draw premium rounded confetti particles
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.roundRect(-p.radius, -p.radius, p.radius * 2, p.radius * 2, p.radius / 2);
      ctx.fill();
      ctx.restore();
    });

    if (active) {
      requestAnimationFrame(animate);
    } else {
      window.removeEventListener('resize', resize);
      if (canvas.parentNode) {
        document.body.removeChild(canvas);
      }
    }
  };

  animate();
};
