"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { RoughEase } from "gsap/EasePack";

// Ensure RoughEase is registered (GSAP 3)
gsap.registerPlugin(RoughEase);

export default function Page() {
  useEffect(() => {
    const delay = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

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
        sizeRand = 5,
      } = {},
    ) => {
      const $container = document.createElement("div");
      $container.className =
        "absolute inset-0 overflow-hidden w-full h-full z-[40] pointer-events-none [perspective:100vmin]";

      const particles: Array<{
        dom: HTMLSpanElement;
        x: number;
        y: number;
        speedX: number;
        speedY: number;
        size: number;
      }> = [];

      for (let i = 0; i < count; i++) {
        const $particle = document.createElement("span");
        $particle.className = "block absolute";
        const settings = {
          dom: $particle,
          x: x + Math.random() * randX * 2 - randX,
          y: y + Math.random() * randY * 2 - randY,
          speedX: speedX + Math.random() * speedRandX * 2 - speedRandX,
          speedY: speedY + Math.random() * speedRandY * 2 - speedRandY,
          size: size + Math.random() * sizeRand * 2 - sizeRand,
        };
        $particle.style.backgroundColor = `hsl(${Math.random() * 360}deg, 80%, 60%)`;
        $particle.style.setProperty("--rx", String(Math.random() * 2 - 1));
        $particle.style.setProperty("--ry", String(Math.random() * 2 - 1));
        $particle.style.setProperty("--rz", String(Math.random() * 2 - 1));
        $particle.style.setProperty("--rs", String(Math.random() * 2 + 0.5));
        $particle.style.setProperty("--size", String(settings.size));
        $particle.style.width = "calc(var(--size) * 1px)";
        $particle.style.height = "calc(var(--size) * 1px)";
        $particle.style.animationName = "rotate3d";
        $particle.style.animationDuration = "calc(var(--rs) * 1s)";
        $particle.style.animationTimingFunction = "linear";
        $particle.style.animationIterationCount = "infinite";
        $particle.style.animationFillMode = "both";
        particles.push(settings);
        $container.appendChild($particle);
      }

      const update = () => {
        particles.forEach((config, i) => {
          if (config.y > 100) {
            particles.splice(i, 1);
            config.dom.remove();
          }
          config.dom.style.left = config.x + "%";
          config.dom.style.top = config.y + "%";
          config.x += config.speedX;
          config.y += config.speedY;
          config.speedY += gravity;
        });
        if (particles.length) requestAnimationFrame(update);
        else $container.remove();
      };

      update();
      $parent.insertAdjacentElement("beforeend", $container);
    };

    let balls: Array<any> = [],
      started = false,
      prizeBall: any;
    let $app: HTMLElement,
      $machine: HTMLElement,
      $handle: HTMLImageElement,
      $balls: HTMLElement,
      $title: HTMLElement,
      $pointer: HTMLElement;
    let $$jitters: any[] = [];
    let prize: { image: string; title: string } | undefined;
    const SPEED = 1;

    const getPrize = async () => {
      const prizes = [
        {
          image: "/assets/prize1.png",
          title: "Bunny",
        },
        {
          image: "/assets/prize2.png",
          title: "Teddy Bear",
        },
        {
          image: "/assets/prize3.png",
          title: "Polar Bear",
        },
        {
          image: "/assets/prize4.png",
          title: "Polar Bear Bride",
        },
      ];
      return prizes[~~(prizes.length * Math.random())];
    };

    const init = async () => {
      $app = document.querySelector("#app") as HTMLElement;
      $app.classList.add("gacha");
      getPrize().then((e) => {
        prize = e;
        const pimg = document.querySelector(
          ".prize-container .prize img",
        ) as HTMLImageElement;
        if (pimg) pimg.src = e.image;
      });

      const TITLE = "がんばれ!";
      const PRICE = "100円";

      $machine = document.querySelector(".machine-container") as HTMLElement;
      $handle = document.querySelector(
        ".machine-container .handle",
      ) as HTMLImageElement;
      $balls = document.querySelector(
        ".machine-container .balls",
      ) as HTMLElement;
      $title = document.querySelector(".title-container .title") as HTMLElement;
      $pointer = document.querySelector(
        ".machine-container .pointer",
      ) as HTMLElement;

      ($machine.querySelector(".title") as HTMLElement).innerHTML = [...TITLE]
        .map(
          (ch, i) =>
            `<span class=\"animate-[blink_0.8s_linear_infinite] inline-block\" style=\"animation-delay:${(i + 1) * 0.12}s\">${ch}</span>`,
        )
        .join("");
      ($machine.querySelector(".price") as HTMLElement).innerText = PRICE;

      createBalls();

      gsap.set($machine, { y: "100vh" });
      gsap.set($title, { y: "120vh" });
      gsap.set($pointer, { opacity: 0 });
      gsap.set(".prize-reward-container", { opacity: 0 });
      setTimeout(prepare, 500 * SPEED);
    };

    const prepare = () => {
      const tl = gsap.timeline();
      tl.to($machine, {
        y: "0vh",
        ease: "none",
        duration: 0.6,
        onComplete() {
          $handle.style.cursor = "pointer";
          $handle.addEventListener("click", start, { once: true });
          balls.forEach((ball: any) => {
            const tl = gsap.timeline();
            const duration = 0.05 + Math.random() * 0.1;
            tl.to(ball.dom, {
              y: -(10 + Math.random() * 10),
              ease: "power1.out",
              duration,
            }).to(ball.dom, { y: 0, duration, ease: "power1.in" });
            setTimeout(() => {
              if (!started) {
                showHint();
              }
            }, 2000 * SPEED);
          });
        },
      });
    };

    const start = async () => {
      $handle.style.cursor = "default";
      started = true;
      hideHint();
      await (() =>
        new Promise<void>((resolve) => {
          const tl = gsap.timeline();
          tl.to($handle, {
            rotate: 90,
            duration: 0.3,
            ease: "power1.in",
            onComplete: () => {
              (async () => {
                jitter();
                await delay(2000 * SPEED);
                await stopJittering();
                resolve();
              })();
            },
          }).to($handle, { rotate: 0, duration: 1 });
        }))();

      await (() =>
        new Promise<void>((resolve) => {
          const tl = gsap.timeline();
          gsap.to(prizeBall.dom, {
            x: "-3vh",
            ease: "none",
            duration: 0.5,
            rotate: prizeBall.rotate + 10,
          });
          gsap.to(balls[3].dom, {
            x: "1vh",
            y: "1vh",
            ease: "none",
            duration: 0.5,
            rotate: balls[3].rotate - 5,
          });
          gsap.to(balls[4].dom, {
            x: "-1vh",
            y: "1vh",
            ease: "none",
            duration: 0.5,
            rotate: balls[4].rotate - 5,
          });
          gsap.to(balls[5].dom, {
            x: "1vh",
            y: "1vh",
            ease: "none",
            duration: 0.5,
            rotate: balls[5].rotate - 5,
          });
          tl.to(prizeBall.dom, { y: "12vh", ease: "power1.in", duration: 0.5 })
            .to(prizeBall.dom, { y: "23vh", ease: "power1.in", duration: 0.5 })
            .to(prizeBall.dom, { y: "22vh", ease: "power1.out", duration: 0.2 })
            .to(prizeBall.dom, { y: "23vh", ease: "power1.in", duration: 0.2 })
            .to(prizeBall.dom, {
              y: "22.5vh",
              ease: "power1.out",
              duration: 0.1,
            })
            .to(prizeBall.dom, {
              y: "23vh",
              ease: "power1.in",
              duration: 0.1,
              onComplete: resolve,
            });
        }))();

      prizeBall.dom.style.cursor = "pointer";
      let shouldShowHint = true;
      prizeBall.dom.addEventListener(
        "click",
        () => {
          prizeBall.dom.style.cursor = "default";
          shouldShowHint = false;
          hideHint();
          pickup();
        },
        { once: true },
      );

      // Shorten hint delay so it appears sooner after the ball settles
      await delay(800);
      if (shouldShowHint) showHint2();
    };

    const pickup = () => {
      // Ensure all hint UI is fully hidden above the reveal animation
      gsap.set(".title-container", { opacity: 0, pointerEvents: "none" });
      gsap.set($pointer, { opacity: 0, pointerEvents: "none" });

      // Also fade the background balls so it doesn't look like another ball remains
      if ($balls) gsap.to($balls, { opacity: 0, duration: 0.2 });

      let rect = (prizeBall.dom as HTMLElement).getBoundingClientRect();
      // Use correct axis for viewport units so the ball starts from the exact click position
      let x = (rect.x / window.innerWidth) * 100; // -> vw
      let y = (rect.y / window.innerHeight) * 100; // -> vh
      const container = document.querySelector(
        ".prize-container .prize-ball-container",
      ) as HTMLElement;
      container.appendChild(prizeBall.dom);
      const rotate = prizeBall.rotate;
      prizeBall.x = 0;
      prizeBall.y = 0;
      prizeBall.rotate = 0;
      addAnimClass(
        ".game-layer",
        "filter brightness-[.6] saturate-[.8] transition duration-500",
      );
      (prizeBall.dom as HTMLElement).style.left = "0";
      (prizeBall.dom as HTMLElement).style.top = "0";
      // place the ball where it currently is, then animate it to screen center
      gsap.set(prizeBall.dom, {
        x: `${x}vw`,
        y: `${y}vh`,
        rotate,
        duration: 1,
        xPercent: 0,
        yPercent: 0,
      });
      // ensure prize overlay can receive clicks when shown
      gsap.set(".prize-reward-container", { pointerEvents: "none" });
      const tl = gsap.timeline();
      tl.to(prizeBall.dom, {
        x: "50vw",
        y: "50vh",
        xPercent: -50,
        yPercent: -50,
        scale: 2,
        rotate: -180,
        duration: 1,
      })
        .to(prizeBall.dom, {
          duration: 0.1,
          scaleX: 2.1,
          ease: "power1.inOut",
          scaleY: 1.9,
        })
        .to(prizeBall.dom, {
          duration: 0.1,
          ease: "power1.inOut",
          scaleX: 1.9,
          scaleY: 2.1,
        })
        .to(prizeBall.dom, {
          duration: 0.1,
          ease: "power1.inOut",
          scaleX: 2.1,
          scaleY: 1.9,
        })
        .to(prizeBall.dom, {
          duration: 0.1,
          ease: "power1.inOut",
          scaleX: 1.9,
          scaleY: 2.1,
        })
        .to(prizeBall.dom, {
          duration: 0.1,
          ease: "power1.inOut",
          scaleX: 2.1,
          scaleY: 1.9,
        })
        .to(prizeBall.dom, {
          duration: 0.1,
          ease: "power1.inOut",
          scaleX: 1.9,
          scaleY: 2.1,
        })
        .to(prizeBall.dom, {
          duration: 0.5,
          ease: "power1.out",
          scaleX: 2.6,
          scaleY: 1.6,
        })
        .to(prizeBall.dom, {
          duration: 0.1,
          ease: "power1.out",
          scaleX: 1.6,
          scaleY: 2.4,
          onComplete: pop,
        });

      function pop() {
        confetti(document.body, {
          count: 120,
          x: 50,
          y: 45,
          speedY: -1.5,
          gravity: 0.02,
        });
        gsap.to(".prize-reward-container", {
          opacity: 1,
          duration: 0.5,
          onStart: () => {
            gsap.set(".prize-reward-container", { pointerEvents: "auto" });
          },
        });
        // Lazy-load the shine image at reveal time to avoid initial request
        const shine = document.getElementById("shine-img") as HTMLImageElement | null;
        if (shine && !shine.getAttribute("src")) {
          const ds = shine.getAttribute("data-src");
          if (ds) shine.setAttribute("src", ds);
        }
        // Remove prize-ball overlay container so it doesn't block the UI
        const prizeBallContainer = document.querySelector(
          ".prize-container .prize-ball-container",
        ) as HTMLElement | null;
        if (prizeBallContainer) {
          prizeBallContainer.innerHTML = "";
          gsap.set(prizeBallContainer, { display: "none" });
        }
        // reveal claim button
        const btn = document.getElementById("claim-btn");
        if (btn) {
          gsap.set(btn, { opacity: 0, y: 8, pointerEvents: "none" });
          gsap.to(btn, {
            opacity: 1,
            y: 0,
            duration: 0.4,
            delay: 0.3,
            onComplete: () => {
              btn.style.pointerEvents = "auto";
            },
          });
        }
      }
    };

    const addAnimClass = ($e: string | Element, clazz: string) => {
      const _func = ($e: Element) => {
        $e.classList.add(...clazz.split(" "));
        $e.setAttribute("data-animate", "");
      };
      if (typeof $e === "string")
        [...document.querySelectorAll($e)].forEach(_func);
      else _func($e);
    };

    const showHint = () => {
      gsap.set($pointer, { opacity: 0 });
      gsap.to($title, { y: "80vh", duration: 1, ease: "back.out" });
      gsap.to($pointer, { opacity: 1, duration: 1, ease: "none" });
    };
    const hideHint = () => {
      gsap.to($title, { y: "120vh", duration: 0.6 });
      gsap.to($pointer, { opacity: 0, duration: 1 });
    };
    const showHint2 = () => {
      ($title.children[0] as HTMLElement).innerHTML = "Tap to claim it!";
      gsap.set($pointer, { x: "16vh", y: "3vh" });
      gsap.to($title, { y: "80vh", duration: 1, ease: "back.out" });
      gsap.to($pointer, { opacity: 1, duration: 1, ease: "none" });
    };

    const createBalls = () => {
      let id = 0;
      const createBall = (
        x: number,
        y: number,
        rotate = ~~(Math.random() * 360),
        hue = ~~(Math.random() * 360),
      ) => {
        const size = 8;
        const $ball = document.createElement("figure");
        $ball.className =
          'absolute overflow-hidden rounded-full [border:solid_0.8vh_var(--outline)] [background-color:var(--color1)] w-[var(--size)] h-[var(--size)] after:content-["" ] after:absolute after:top-1/2 after:h-[200%] after:w-[200%] after:rounded-full after:[background-color:var(--color2)] after:[border:inherit] after:translate-x-[-25%] after:translate-y-[-5%]';
        $ball.setAttribute("data-id", String(++id));
        $ball.style.setProperty("--size", `${size}vh`);
        $ball.style.setProperty("--color1", `hsl(${hue}deg, 80%, 70%)`);
        $ball.style.setProperty("--color2", `hsl(${hue + 20}deg, 50%, 90%)`);
        $ball.style.setProperty("--outline", `hsl(${hue}deg, 50%, 55%)`);
        $balls.appendChild($ball);

        const update = () => {
          gsap.set($ball, {
            css: {
              left: `calc(${x} * (100% - ${size}vh))`,
              top: `calc(${y} * (100% - ${size}vh))`,
              transform: `rotate(${rotate}deg)`,
            },
          });
        };

        const ball = {
          dom: $ball,
          get x() {
            return x;
          },
          get y() {
            return y;
          },
          get rotate() {
            return rotate;
          },
          set x(value: number) {
            x = value;
            update();
          },
          set y(value: number) {
            y = value;
            update();
          },
          set rotate(value: number) {
            rotate = value;
            update();
          },
          get size() {
            return size;
          },
        };

        balls.push(ball);
        update();
        return ball;
      };

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
    };

    const jitter = () => {
      balls.forEach(({ dom, rotate }: any, i: number) => {
        const tl = gsap.timeline({ repeat: -1, delay: -i * 0.0613 });
        gsap.set(dom, { y: 0, rotateZ: rotate });
        const duration = Math.random() * 0.1 + 0.05;
        tl.to(dom, {
          y: -(Math.random() * 6 + 2),
          rotateZ: rotate,
          duration,
          ease: "rough({ template: none, strength: 1, points: 20, taper: 'none', randomize: true, clamp: false })",
        }).to(dom, {
          y: 0,
          rotateZ: rotate - Math.random() * 10 - 5,
          duration,
        });
        $$jitters.push(tl);
      });

      const tl = gsap.timeline({ repeat: -1 });
      tl.to(".machine-container", { x: 2, duration: 0.1 }).to(
        ".machine-container",
        { x: 0, duration: 0.1 },
      );
      $$jitters.push(tl);
    };

    const stopJittering = async () => {
      $$jitters.forEach(($$jitter: any) => $$jitter.pause());
      balls.forEach(({ dom, rotate }: any) => {
        gsap.to(dom, { y: 0, rotate, duration: 0.1 });
      });
      gsap.to(".machine-container", { x: 0, duration: 0.1 });
      await delay(200);
    };

    const resetGame = () => {
      // simplest reliable reset
      window.location.reload();
    };

    // attach claim listener if present later
    document.addEventListener("click", (e) => {
      const target = e.target as HTMLElement;
      if (target && target.id === "claim-btn") {
        resetGame();
      }
    });

    init();
  }, []);

  return (
    <div id="app" className="w-full h-full min-h-screen relative bg-[#666]">
      <div className="w-full h-full min-h-screen overflow-hidden relative">
        <div className="w-full h-full min-h-screen overflow-hidden flex items-center justify-center relative bg-[url(/assets/bg.jpg)] bg-cover bg-center bg-no-repeat game-layer">
          <div className="relative whitespace-nowrap machine-container">
            <div className="absolute z-0 top-[65%] left-[48%] w-[15vh] h-[13vh] bg-[#e288bb]"></div>
            <div className="absolute top-[22%] left-[2%] w-[96%] h-[34.5%] balls"></div>
            <img
              className="relative z-[10] max-h-[80vh] pointer-events-none"
              src="/assets/gacha.svg"
              alt="Gacha machine"
            />
            <div className="absolute top-[10%] w-full text-center text-[5vh] z-[15] drop-shadow title"></div>
            <div className="absolute z-[15] text-[2.5vh] top-[80%] left-[15%] text-[#fb91c9] price"></div>
            <img
              className="absolute z-[20] h-[3.9vh] left-[13%] top-[69%] handle"
              src="/assets/handle.svg"
              alt="Handle"
            />
            <div className="absolute h-[15vh] top-[75%] left-[15%] z-[30] pointer-events-none pointer">
              <img
                className="h-full block origin-[0%_0%] -rotate-[30deg] animate-[click_1s_ease-in-out_infinite_both]"
                src="/assets/point.png"
                alt="Pointer"
              />
            </div>
          </div>
        </div>
        <div className="absolute inset-0 z-[50] pointer-events-none overflow-hidden ui-layer">
          <div className="absolute inset-0 z-10 title-container">
            <div className="title text-center">
              <h2 className="text-center text-[5vh] drop-shadow animate-[wiggle_2s_ease-in-out_infinite_both]">
                Tap to get a prize!
              </h2>
            </div>
          </div>
          <div className="absolute inset-0 prize-container">
            <div className="absolute inset-0 z-[20] prize-ball-container"></div>
            <div className="absolute inset-0 z-[1] prize-reward-container">
              <div className="absolute inset-0 flex items-center justify-center shine">
                <img
                  id="shine-img"
                  className="h-[100vh] animate-[spin_5s_linear_infinite_forwards]"
                  alt="Shine"
                  data-src="/assets/shine.png"
                />
              </div>
              <div className="absolute inset-0 flex items-center justify-center prize">
                <img
                  className="h-[50vh] animate-[wiggle_2s_ease-in-out_infinite_both]"
                  src=""
                  alt="Prize"
                />
              </div>
              <div className="absolute bottom-[10vh] w-full flex justify-center actions">
                <button
                  id="claim-btn"
                  className="px-6 py-3 rounded-xl bg-pink-500 text-white font-semibold shadow-md hover:bg-pink-600 active:scale-95 transition"
                  type="button"
                >
                  Claim Prize
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
