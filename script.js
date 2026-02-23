/* ============================================================
   PearlDev — Interactions & Effects
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ---------- Navbar scroll effect ---------- */
  const navbar = document.getElementById('navbar');

  const handleScroll = () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });

  /* ---------- Mobile hamburger menu ---------- */
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  // Close menu when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });

  /* ---------- Scroll-triggered reveal animations ---------- */
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  /* ---------- Particle canvas background ---------- */
  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    let animId;

    const resize = () => {
      canvas.width = canvas.parentElement.offsetWidth;
      canvas.height = canvas.parentElement.offsetHeight;
    };

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.4;
        this.speedY = (Math.random() - 0.5) * 0.4;
        this.opacity = Math.random() * 0.5 + 0.15;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // wrap around edges
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 180, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    const initParticles = () => {
      const count = Math.min(Math.floor((canvas.width * canvas.height) / 8000), 120);
      particles = Array.from({ length: count }, () => new Particle());
    };

    const drawLines = () => {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(0, 180, 255, ${0.08 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(); });
      drawLines();
      animId = requestAnimationFrame(animate);
    };

    resize();
    initParticles();
    animate();

    window.addEventListener('resize', () => {
      resize();
      initParticles();
    });
  }

});

/* ---------- Form handler (EmailJS + reCAPTCHA) ---------- */
function handleSubmit(e) {
  e.preventDefault();

  // Verificar reCAPTCHA
  const captchaResponse = grecaptcha.getResponse();
  if (!captchaResponse) {
    alert('Por favor, verifica que no eres un robot.');
    return;
  }

  const nombre = document.getElementById('nombre').value;
  const correo = document.getElementById('correo').value;
  const mensaje = document.getElementById('mensaje').value;

  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.textContent;

  // Disable button & show loading
  btn.textContent = '⏳ Enviando...';
  btn.disabled = true;
  btn.style.opacity = '0.7';

  emailjs.send('service_cvwoeeq', 'template_20tkicd', {
    name: nombre,
    email: correo,
    message: mensaje,
    'g-recaptcha-response': captchaResponse
  })
    .then(() => {
      btn.textContent = '✅ ¡Mensaje enviado correctamente!';
      e.target.reset();
      grecaptcha.reset();

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.opacity = '';
      }, 3000);
    })
    .catch(() => {
      btn.textContent = '❌ Ocurrió un error. Intenta nuevamente.';
      grecaptcha.reset();

      setTimeout(() => {
        btn.textContent = originalText;
        btn.disabled = false;
        btn.style.opacity = '';
      }, 3000);
    });
}
