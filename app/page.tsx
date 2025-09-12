"use client";

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { RoughEase } from 'gsap/EasePack';

// Ensure RoughEase is registered (GSAP 3)
gsap.registerPlugin(RoughEase);

export default function Page() {
  useEffect(() => {
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    const confetti = (
      $parent: HTMLElement,
      {
        count = 100,
        x = 50,
        y = 50,
        randX = 10,
        randY = 10,
        speedX = 0,
        speedY = -2,
        speedRandX = 0.5,
        speedRandY = 0.5,
        gravity = 0.01,
        size = 10,
        sizeRand = 5
      } = {}
    ) => {
      const $container = document.createElement('div');
      $container.classList.add('confetti');

      const particles: Array<{
        dom: HTMLSpanElement;
        x: number; y: number; speedX: number; speedY: number; size: number;
      }> = [];

      for (let i = 0; i < count; i++) {
        const $particle = document.createElement('span');
        const settings = {
          dom: $particle,
          x: x + Math.random() * randX * 2 - randX,
          y: y + Math.random() * randY * 2 - randY,
          speedX: speedX + Math.random() * speedRandX * 2 - speedRandX,
          speedY: speedY + Math.random() * speedRandY * 2 - speedRandY,
          size: size + Math.random() * sizeRand * 2 - sizeRand
        };
        $particle.style.backgroundColor = `hsl(${Math.random() * 360}deg, 80%, 60%)`;
        $particle.style.setProperty('--rx', String(Math.random() * 2 - 1));
        $particle.style.setProperty('--ry', String(Math.random() * 2 - 1));
        $particle.style.setProperty('--rz', String(Math.random() * 2 - 1));
        $particle.style.setProperty('--rs', String(Math.random() * 2 + 0.5));
        particles.push(settings);
        $container.appendChild($particle);
      }

      const update = () => {
        particles.forEach((config, i) => {
          if (config.y > 100) {
            particles.splice(i, 1);
            config.dom.remove();
          }
          config.dom.style.setProperty('--size', String(config.size));
          config.dom.style.left = config.x + '%';
          config.dom.style.top = config.y + '%';
          config.x += config.speedX;
          config.y += config.speedY;
          config.speedY += gravity;
        });
        if (particles.length) requestAnimationFrame(update);
        else $container.remove();
      };

      update();
      $parent.insertAdjacentElement('beforeend', $container);
    };

    let balls: Array<any> = [], started = false, prizeBall: any;
    let $app: HTMLElement, $machine: HTMLElement, $handle: HTMLImageElement, $balls: HTMLElement, $title: HTMLElement, $pointer: HTMLElement;
    let $$jitters: any[] = [];
    let prize: { image: string; title: string } | undefined;
    const SPEED = 1;

    const getPrize = async () => {
      const prizes = [
        { image: 'https://assets.codepen.io/2509128/prize1.png', title: 'Bunny' },
        { image: 'https://assets.codepen.io/2509128/prize2.png', title: 'Teddy Bear' },
        { image: 'https://assets.codepen.io/2509128/prize3.png', title: 'Polar Bear' },
        { image: 'https://assets.codepen.io/2509128/prize4.png', title: 'Polar Bear Bride' }
      ];
      return prizes[~~(prizes.length * Math.random())];
    }

    const init = async () => {
      $app = document.querySelector('#app') as HTMLElement;
      $app.classList.add('gotcha');
      getPrize().then(e => {
        prize = e;
        const pimg = document.querySelector('.prize-container .prize img') as HTMLImageElement;
        if (pimg) pimg.src = e.image;
      });

      const TITLE = 'がんばれ!';
      const PRICE = '100円';

      $machine = document.querySelector('.machine-container') as HTMLElement;
      $handle = document.querySelector('.machine-container .handle') as HTMLImageElement;
      $balls = document.querySelector('.machine-container .balls') as HTMLElement;
      $title = document.querySelector('.title-container .title') as HTMLElement;
      $pointer = document.querySelector('.machine-container .pointer') as HTMLElement;

      ($machine.querySelector('.title') as HTMLElement).innerHTML = [...TITLE].map(e => `<span>${e}</span>`).join('');
      ($machine.querySelector('.price') as HTMLElement).innerText = PRICE;

      createBalls();

      gsap.set($machine, { y: '100vh' });
      gsap.set($title, { y: '120vh' });
      gsap.set($pointer, { opacity: 0 });
      gsap.set('.prize-reward-container', { opacity: 0 });
      setTimeout(prepare, 500 * SPEED);
    }

    const prepare = () => {
      const tl = gsap.timeline();
      tl.to($machine, {
        y: '0vh', ease: 'none', duration: 0.6,
        onComplete() {
          $handle.style.cursor = 'pointer';
          $handle.addEventListener('click', start, { once: true });
          balls.forEach((ball: any) => {
            const tl = gsap.timeline();
            const duration = 0.05 + Math.random() * 0.1;
            tl.to(ball.dom, { y: -(10 + Math.random() * 10), ease: 'power1.out', duration })
              .to(ball.dom, { y: 0, duration, ease: 'power1.in' });
            setTimeout(() => { if (!started) { showHint(); } }, 2000 * SPEED);
          })
        }
      });
    }

    const start = async () => {
      $handle.style.cursor = 'default';
      started = true;
      hideHint();
      await (() => new Promise<void>(resolve => {
        const tl = gsap.timeline();
        tl.to($handle, {
          rotate: 90, duration: 0.3, ease: 'power1.in',
          onComplete: () => {
            (async () => {
              jitter();
              await delay(2000 * SPEED);
              await stopJittering();
              resolve();
            })();
          }
        }).to($handle, { rotate: 0, duration: 1 });
      }))();

      await (() => new Promise<void>(resolve => {
        const tl = gsap.timeline();
        gsap.to(prizeBall.dom, { x: '-3vh', ease: 'none', duration: 0.5, rotate: prizeBall.rotate + 10 });
        gsap.to(balls[3].dom, { x: '1vh', y: '1vh', ease: 'none', duration: 0.5, rotate: balls[3].rotate - 5 });
        gsap.to(balls[4].dom, { x: '-1vh', y: '1vh', ease: 'none', duration: 0.5, rotate: balls[4].rotate - 5 });
        gsap.to(balls[5].dom, { x: '1vh', y: '1vh', ease: 'none', duration: 0.5, rotate: balls[5].rotate - 5 });
        tl.to(prizeBall.dom, { y: '12vh', ease: 'power1.in', duration: 0.5 })
          .to(prizeBall.dom, { y: '23vh', ease: 'power1.in', duration: 0.5 })
          .to(prizeBall.dom, { y: '22vh', ease: 'power1.out', duration: 0.2 })
          .to(prizeBall.dom, { y: '23vh', ease: 'power1.in', duration: 0.2 })
          .to(prizeBall.dom, { y: '22.5vh', ease: 'power1.out', duration: 0.1 })
          .to(prizeBall.dom, { y: '23vh', ease: 'power1.in', duration: 0.1, onComplete: resolve });
      }))();

      prizeBall.dom.style.cursor = 'pointer';
      let shouldShowHint = true;
      prizeBall.dom.addEventListener('click', () => {
        prizeBall.dom.style.cursor = 'default';
        shouldShowHint = false;
        hideHint();
        pickup();
      }, { once: true });

      await delay(2000);
      if (shouldShowHint) showHint2();
    }

    const pickup = () => {
      let rect = (prizeBall.dom as HTMLElement).getBoundingClientRect();
      let x = rect.x / window.innerHeight * 100;
      let y = rect.y / window.innerHeight * 100;
      const container = document.querySelector('.prize-container .prize-ball-container') as HTMLElement;
      container.appendChild(prizeBall.dom);
      const rotate = prizeBall.rotate;
      prizeBall.x = 0; prizeBall.y = 0; prizeBall.rotate = 0;
      addAnimClass('.game-layer', 'dim');
      (prizeBall.dom as HTMLElement).style.left = '0';
      (prizeBall.dom as HTMLElement).style.top = '0';
      gsap.set(prizeBall.dom, { x: `${x}vh`, y: `${y}vh`, rotate, duration: 1 });
      gsap.to('.prize-container .prize-ball-container', { x: `-4vh`, y: `-4vh`, duration: 1 });
      const tl = gsap.timeline();
      tl.to(prizeBall.dom, { x: '50vw', y: '50vh', scale: 2, rotate: -180, duration: 1 })
        .to(prizeBall.dom, { duration: 0.1, scaleX: 2.1, ease: 'power1.inOut', scaleY: 1.9 })
        .to(prizeBall.dom, { duration: 0.1, ease: 'power1.inOut', scaleX: 1.9, scaleY: 2.1 })
        .to(prizeBall.dom, { duration: 0.1, ease: 'power1.inOut', scaleX: 2.1, scaleY: 1.9 })
        .to(prizeBall.dom, { duration: 0.1, ease: 'power1.inOut', scaleX: 1.9, scaleY: 2.1 })
        .to(prizeBall.dom, { duration: 0.1, ease: 'power1.inOut', scaleX: 2.1, scaleY: 1.9 })
        .to(prizeBall.dom, { duration: 0.1, ease: 'power1.inOut', scaleX: 1.9, scaleY: 2.1 })
        .to(prizeBall.dom, { duration: 0.5, ease: 'power1.out', scaleX: 2.6, scaleY: 1.6 })
        .to(prizeBall.dom, { duration: 0.1, ease: 'power1.out', scaleX: 1.6, scaleY: 2.4, onComplete: pop });

      function pop() {
        confetti(document.body, { count: 120, x: 50, y: 45, speedY: -1.5, gravity: 0.02 });
        gsap.to('.prize-reward-container', { opacity: 1, duration: 0.5 });
      }
    }

    const addAnimClass = ($e: string | Element, clazz: string) => {
      const _func = ($e: Element) => {
        $e.classList.add(clazz);
        $e.setAttribute('data-animate', '');
      }
      if (typeof $e === 'string') [...document.querySelectorAll($e)].forEach(_func);
      else _func($e);
    }

    const showHint = () => {
      gsap.set($pointer, { opacity: 0 });
      gsap.to($title, { y: '80vh', duration: 1, ease: 'back.out' });
      gsap.to($pointer, { opacity: 1, duration: 1, ease: 'none' });
    }
    const hideHint = () => {
      gsap.to($title, { y: '120vh', duration: 0.6 });
      gsap.to($pointer, { opacity: 0, duration: 1 });
    }
    const showHint2 = () => {
      ($title.children[0] as HTMLElement).innerHTML = 'Tap to claim it!';
      gsap.set($pointer, { x: '16vh', y: '3vh' });
      gsap.to($title, { y: '80vh', duration: 1, ease: 'back.out' });
      gsap.to($pointer, { opacity: 1, duration: 1, ease: 'none' });
    }

    const createBalls = () => {
      let id = 0;
      const createBall = (x: number, y: number, rotate = ~~(Math.random() * 360), hue = ~~(Math.random() * 360)) => {
        const size = 8;
        const $ball = document.createElement('figure');
        $ball.classList.add('ball');
        $ball.setAttribute('data-id', String(++id));
        $ball.style.setProperty('--size', `${size}vh`);
        $ball.style.setProperty('--color1', `hsl(${hue}deg, 80%, 70%)`);
        $ball.style.setProperty('--color2', `hsl(${hue + 20}deg, 50%, 90%)`);
        $ball.style.setProperty('--outline', `hsl(${hue}deg, 50%, 55%)`);
        $balls.appendChild($ball);

        const update = () => {
          gsap.set($ball, {
            css: {
              left: `calc(${x} * (100% - ${size}vh))`,
              top: `calc(${y} * (100% - ${size}vh))`,
              transform: `rotate(${rotate}deg)`
            },
          });
        }

        const ball = {
          dom: $ball,
          get x() { return x },
          get y() { return y },
          get rotate() { return rotate },
          set x(value: number) { x = value; update(); },
          set y(value: number) { y = value; update(); },
          set rotate(value: number) { rotate = value; update(); },
          get size() { return size }
        };

        balls.push(ball);
        update();
        return ball;
      }

      createBall(0.5, 0.6);
      createBall(0, 0.68);
      createBall(0.22, 0.65);
      createBall(0.7, 0.63);
      createBall(0.96, 0.66);
      createBall(0.75, 0.79);
      createBall(0.5, 0.8);
      prizeBall = createBall(0.9, 0.81);
      createBall(0, 0.82);
      createBall(1, 0.9);
      createBall(0.25, 0.85);
      createBall(0.9, 1);
      createBall(0.4, 1);
      createBall(0.65, 1);
      createBall(0.09, 1);
    }

    const jitter = () => {
      balls.forEach(({ dom, rotate }: any, i: number) => {
        const tl = gsap.timeline({ repeat: -1, delay: -i * 0.0613 });
        gsap.set(dom, { y: 0, rotateZ: rotate });
        const duration = Math.random() * 0.1 + 0.05;
        tl.to(dom, {
          y: -(Math.random() * 6 + 2),
          rotateZ: rotate,
          duration,
          ease: "rough({ template: none, strength: 1, points: 20, taper: 'none', randomize: true, clamp: false })"
        }).to(dom, { y: 0, rotateZ: rotate - Math.random() * 10 - 5, duration });
        $$jitters.push(tl);
      });

      const tl = gsap.timeline({ repeat: -1 });
      tl.to('.machine-container', { x: 2, duration: 0.1 })
        .to('.machine-container', { x: 0, duration: 0.1 });
      $$jitters.push(tl);
    }

    const stopJittering = async () => {
      $$jitters.forEach(($$jitter: any) => $$jitter.pause());
      balls.forEach(({ dom, rotate }: any) => { gsap.to(dom, { y: 0, rotate, duration: 0.1 }) });
      gsap.to('.machine-container', { x: 0, duration: 0.1 });
      await delay(200);
    }

    init();
  }, []);

  return (
    <div id="app" className="gotcha">
      <div className="container">
        <div className="game-layer">
          <div className="machine-container">
            <div className="backboard"></div>
            <div className="balls"></div>
            <img className="machine" src="https://assets.codepen.io/2509128/gotcha.svg" alt="Gacha machine" />
            <div className="title"></div>
            <div className="price"></div>
            <img className="handle" src="https://assets.codepen.io/2509128/handle.svg" alt="Handle" />
            <div className="pointer">
              <img src="https://assets.codepen.io/2509128/point.png" alt="Pointer" />
            </div>
          </div>
        </div>
        <div className="ui-layer">
          <div className="title-container">
            <div className="title">
              <h2 className="wiggle">Tap to get a prize!</h2>
            </div>
          </div>
          <div className="prize-container">
            <div className="prize-ball-container"></div>
            <div className="prize-reward-container">
              <div className="shine">
                <img src="https://assets.codepen.io/2509128/shine.png" alt="Shine" />
              </div>
              <div className="prize">
                <img className="wiggle" src="" alt="Prize" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
