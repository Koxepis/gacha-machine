"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { cn } from "@/lib/utils"

interface Ball {
  id: number
  x: number
  y: number
  rotate: number
  hue: number
  size: number
}

interface Prize {
  image: string
  title: string
}

interface Particle {
  id: number
  x: number
  y: number
  speedX: number
  speedY: number
  size: number
  color: string
  rotation: { rx: number; ry: number; rz: number; rs: number }
}

const prizes: Prize[] = [
  {
    image: "https://assets.codepen.io/2509128/prize1.png",
    title: "Bunny",
  },
  {
    image: "https://assets.codepen.io/2509128/prize2.png",
    title: "Teddy Bear",
  },
  {
    image: "https://assets.codepen.io/2509128/prize3.png",
    title: "Polar Bear",
  },
  {
    image: "https://assets.codepen.io/2509128/prize4.png",
    title: "Polar Bear Bride",
  },
]

export default function GachaMachine() {
  const [gameState, setGameState] = useState<"preparing" | "ready" | "playing" | "dropping" | "revealing">("preparing")
  const [showHint, setShowHint] = useState(false)
  const [showHint2, setShowHint2] = useState(false)
  const [prize, setPrize] = useState<Prize | null>(null)
  const [balls, setBalls] = useState<Ball[]>([])
  const [prizeBallId, setPrizeBallId] = useState<number>(8)
  const [isJittering, setIsJittering] = useState(false)
  const [confetti, setConfetti] = useState<Particle[]>([])
  const [showPrize, setShowPrize] = useState(false)
  const [dimBackground, setDimBackground] = useState(false)

  // Floating prize ball overlay (for center + open animation)
  const [floatingBall, setFloatingBall] = useState<
    | null
    | {
        left: number
        top: number
        size: number
        hue: number
        borderHue: number
        dx: number
        dy: number
        atCenter: boolean
        opening: boolean
        fade: boolean
      }
  >(null)

  const machineRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLImageElement>(null)
  const prizeBallRef = useRef<HTMLDivElement>(null)
  const confettiIntervalRef = useRef<NodeJS.Timeout>()

  // Initialize balls
  useEffect(() => {
    const ballPositions = [
      { x: 0.5, y: 0.6 },
      { x: 0, y: 0.68 },
      { x: 0.22, y: 0.65 },
      { x: 0.7, y: 0.63 },
      { x: 0.96, y: 0.66 },
      { x: 0.75, y: 0.79 },
      { x: 0.5, y: 0.8 },
      { x: 0.9, y: 0.81 }, // Prize ball
      { x: 0, y: 0.82 },
      { x: 1, y: 0.9 },
      { x: 0.25, y: 0.85 },
      { x: 0.9, y: 1 },
      { x: 0.4, y: 1 },
      { x: 0.65, y: 1 },
      { x: 0.09, y: 1 },
    ]

    const newBalls = ballPositions.map((pos, index) => ({
      id: index + 1,
      x: pos.x,
      y: pos.y,
      rotate: Math.floor(Math.random() * 360),
      hue: Math.floor(Math.random() * 360),
      size: 8,
    }))

    setBalls(newBalls)
    setPrize(prizes[Math.floor(Math.random() * prizes.length)])
  }, [])

  // Game initialization sequence
  useEffect(() => {
    if (balls.length > 0) {
      setTimeout(() => {
        setGameState("ready")
        setTimeout(() => {
          setShowHint(true)
        }, 2000)
      }, 1000)
    }
  }, [balls])

  const startGame = useCallback(() => {
    if (gameState !== "ready") return

    setGameState("playing")
    setShowHint(false)
    setIsJittering(true)

    setTimeout(() => {
      setIsJittering(false)
      setGameState("dropping")

      setTimeout(() => {
        setShowHint2(true)
      }, 2000)
    }, 2000)
  }, [gameState])

  const createConfetti = useCallback(() => {
    const particles: Particle[] = []

    for (let i = 0; i < 128; i++) {
      particles.push({
        id: i,
        x: 50 + (Math.random() * 12 - 6),
        y: 50 + (Math.random() * 12 - 6),
        speedX: Math.random() * 1.5 - 0.75,
        speedY: -0.5 + (Math.random() * 1 - 0.5),
        size: 8 + (Math.random() * 8 - 4),
        color: `hsl(${Math.random() * 360}deg, 80%, 60%)`,
        rotation: {
          rx: Math.random() * 2 - 1,
          ry: Math.random() * 2 - 1,
          rz: Math.random() * 2 - 1,
          rs: Math.random() * 2 + 0.5,
        },
      })
    }

    setConfetti(particles)

    // Animate confetti
    confettiIntervalRef.current = setInterval(() => {
      setConfetti((prev) => {
        const updated = prev
          .map((particle) => ({
            ...particle,
            x: particle.x + particle.speedX,
            y: particle.y + particle.speedY,
            speedY: particle.speedY + 0.02,
          }))
          .filter((particle) => particle.y < 100)

        if (updated.length === 0) {
          clearInterval(confettiIntervalRef.current)
        }

        return updated
      })
    }, 16)
  }, [])

  const pickupBall = useCallback(() => {
    if (gameState !== "dropping") return

    setShowHint2(false)

    // Prepare a floating ball overlay from the current prize ball position
    const el = prizeBallRef.current
    const sourceBall = balls.find((b) => b.id === prizeBallId)
    if (!el || !sourceBall) return

    const rect = el.getBoundingClientRect()
    const size = rect.width
    const left = rect.left
    const top = rect.top

    const centerLeft = window.innerWidth / 2 - size / 2
    const centerTop = window.innerHeight / 2 - size / 2

    const dx = centerLeft - left
    const dy = centerTop - top

    setFloatingBall({
      left,
      top,
      size,
      hue: sourceBall.hue,
      borderHue: sourceBall.hue,
      dx,
      dy,
      atCenter: false,
      opening: false,
      fade: false,
    })

    // Move to center (next frame to trigger transition)
    setTimeout(() => {
      setFloatingBall((prev) => (prev ? { ...prev, atCenter: true } : prev))
    }, 30)

    // After move completes, open the ball and reveal
    setTimeout(() => {
      setFloatingBall((prev) => (prev ? { ...prev, opening: true } : prev))
      setDimBackground(true)
      setGameState("revealing")
      createConfetti()

      // Show prize shortly after opening starts
      setTimeout(() => {
        setShowPrize(true)
        setFloatingBall((prev) => (prev ? { ...prev, fade: true } : prev))
      }, 700)
    }, 750)
  }, [gameState, balls, prizeBallId])

  // (moved above)

  useEffect(() => {
    return () => {
      if (confettiIntervalRef.current) {
        clearInterval(confettiIntervalRef.current)
      }
    }
  }, [])

  // Cleanup floating overlay once faded
  useEffect(() => {
    if (floatingBall?.fade) {
      const t = setTimeout(() => setFloatingBall(null), 800)
      return () => clearTimeout(t)
    }
  }, [floatingBall?.fade])

  const prizeBall = balls.find((ball) => ball.id === prizeBallId)

  return (
    <div className="gacha-game w-full h-full relative bg-gray-600 overflow-hidden">
      {/* Background */}
      <div
        className={cn(
          "absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500",
          dimBackground && "brightness-60 saturate-75",
        )}
        style={{ backgroundImage: "url(https://assets.codepen.io/2509128/bg.jpg)" }}
      />

      {/* Confetti */}
      {confetti.length > 0 && (
        <div className="confetti-container absolute inset-0 overflow-hidden pointer-events-none z-10 perspective-[100vmin]">
          {confetti.map((particle) => (
            <span
              key={particle.id}
              className="confetti-particle absolute block animate-rotate"
              style={
                {
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  backgroundColor: particle.color,
                  "--rx": particle.rotation.rx,
                  "--ry": particle.rotation.ry,
                  "--rz": particle.rotation.rz,
                  "--rs": `${particle.rotation.rs}s`,
                  animationDuration: `${particle.rotation.rs}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      )}

      {/* Game Layer */}
      <div className="game-layer w-full h-full flex items-center justify-center relative">
        <div
          ref={machineRef}
          className={cn(
            "machine-container relative whitespace-nowrap transition-transform duration-600 ease-out",
            gameState === "preparing" && "translate-y-[100vh]",
            gameState === "revealing" && "translate-y-[100vh] delay-1000",
          )}
        >
          {/* Backboard */}
          <div className="backboard absolute z-0 w-[15vh] h-[13vh] top-[65%] left-[48%] bg-pink-300" />

          {/* Balls Container */}
          <div className="balls absolute top-[22%] left-[2%] w-[96%] h-[34.5%]">
            {balls.map((ball) => (
              <div
                key={ball.id}
                ref={ball.id === prizeBallId ? prizeBallRef : undefined}
                className={cn(
                  "ball absolute rounded-full border-[0.8vh] overflow-hidden transition-all duration-500",
                  isJittering && "animate-jitter",
                  gameState === "dropping" && ball.id === prizeBallId && "animate-ball-drop cursor-pointer",
                  // Hide the original prize ball when the floating overlay is active or during reveal
                  ((gameState === "revealing" && ball.id === prizeBallId) ||
                    (floatingBall && ball.id === prizeBallId)) &&
                    "opacity-0",
                )}
                style={{
                  width: `${ball.size}vh`,
                  height: `${ball.size}vh`,
                  left: `calc(${ball.x} * (100% - ${ball.size}vh))`,
                  top: `calc(${ball.y} * (100% - ${ball.size}vh))`,
                  transform: `rotate(${ball.rotate}deg)`,
                  backgroundColor: `hsl(${ball.hue}deg, 80%, 70%)`,
                  borderColor: `hsl(${ball.hue}deg, 50%, 55%)`,
                }}
                onClick={ball.id === prizeBallId ? pickupBall : undefined}
              >
                <div
                  className="absolute top-1/2 h-[200%] w-[200%] rounded-full border-inherit"
                  style={{
                    backgroundColor: `hsl(${ball.hue + 20}deg, 50%, 90%)`,
                    transform: "translate(-25%, -5%)",
                  }}
                />
              </div>
            ))}
          </div>

          {/* Machine Image */}
          <img
            className="machine relative z-[1] max-h-[80vh] pointer-events-none"
            src="https://assets.codepen.io/2509128/gotcha.svg"
            alt="Gacha Machine"
          />

          {/* Title */}
          <div className="title absolute top-[10%] w-full text-center z-[3] text-[5vh] font-bold text-stroke-purple">
            {"がんばれ!".split("").map((char, index) => (
              <span key={index} className="animate-blink" style={{ animationDelay: `${index * 0.12}s` }}>
                {char}
              </span>
            ))}
          </div>

          {/* Price */}
          <div className="price absolute z-[3] text-pink-400 text-[2.5vh] top-[80%] left-[15%]">100円</div>

          {/* Handle */}
          <img
            ref={handleRef}
            className={cn(
              "handle absolute z-[3] h-[3.9vh] left-[13%] top-[69%] transition-transform duration-300 cursor-pointer",
              gameState === "playing" && "rotate-90",
              (gameState === "dropping" || gameState === "revealing") && "cursor-default",
            )}
            src="https://assets.codepen.io/2509128/handle.svg"
            alt="Handle"
            onClick={startGame}
          />

          {/* Pointer */}
          <div
            className={cn(
              "pointer absolute h-[15vh] top-[75%] left-[15%] z-[5] pointer-events-none transition-opacity duration-1000",
              showHint && "opacity-100 animate-click",
              showHint2 && "opacity-100 animate-click translate-x-[16vh] translate-y-[3vh]",
              !showHint && !showHint2 && "opacity-0",
            )}
          >
            <img
              className="h-full block transform rotate-[-30deg] origin-[0%_0%]"
              src="https://assets.codepen.io/2509128/point.png"
              alt="Pointer"
            />
          </div>
        </div>
      </div>

      {/* UI Layer */}
      <div className="ui-layer absolute inset-0 z-[1] pointer-events-none">
        {/* Floating prize ball overlay (centers, then opens) */}
        {floatingBall && (
          <div
            className="fixed inset-0 z-20"
            aria-hidden
            style={{ pointerEvents: "none" }}
          >
            <div
              className="absolute"
              style={{
                left: floatingBall.left,
                top: floatingBall.top,
                width: floatingBall.size,
                height: floatingBall.size,
              }}
            >
              <div
                className={cn(
                  "relative w-full h-full overflow-visible transition-[transform,opacity] duration-700 ease-out",
                )}
                style={{
                  transform: floatingBall.atCenter
                    ? `translate(${floatingBall.dx}px, ${floatingBall.dy}px)`
                    : "translate(0px, 0px)",
                  opacity: floatingBall.fade ? 0 : 1,
                }}
              >
                {/* Two halves composing the ball */}
                <div
                  className={cn(
                    "absolute left-0 top-0 w-full h-1/2 relative",
                    floatingBall.opening ? "overflow-visible" : "overflow-hidden",
                  )}
                >
                  {/* animated circular gloss behind top half */}
                  <div
                    className={cn(
                      "absolute left-1/2 top-1/2 z-0 pointer-events-none rounded-full",
                      "transition-[transform,opacity] duration-500 ease-out",
                    )}
                    style={{
                      width: "220%",
                      height: "220%",
                      transform: floatingBall.opening
                        ? "translate(-50%, -50%) scale(1)"
                        : "translate(-50%, -50%) scale(0.7)",
                      opacity: floatingBall.opening ? 0.6 : 0.3,
                      background: `radial-gradient(circle at 35% 30%, hsla(${floatingBall.hue + 20}, 50%, 96%, 0.9) 0%, hsla(${floatingBall.hue + 20}, 50%, 92%, 0.55) 22%, transparent 55%)`,
                      filter: "blur(0.5px)",
                    }}
                  />
                  <div
                    className={cn(
                      "relative z-10 w-full h-full rounded-t-full border-[0.8vh] transition-transform duration-500 ease-out",
                    )}
                    style={{
                      backgroundColor: `hsl(${floatingBall.hue}deg, 80%, 70%)`,
                      borderColor: `hsl(${floatingBall.borderHue}deg, 50%, 55%)`,
                      transform: floatingBall.opening
                        ? "translateY(-60%) rotate(-10deg)"
                        : "translateY(0px)",
                    }}
                  />
                </div>
                <div
                  className={cn(
                    "absolute left-0 bottom-0 w-full h-1/2 relative",
                    floatingBall.opening ? "overflow-visible" : "overflow-hidden",
                  )}
                >
                  {/* animated circular gloss behind bottom half */}
                  <div
                    className={cn(
                      "absolute left-1/2 top-1/2 z-0 pointer-events-none rounded-full",
                      "transition-[transform,opacity] duration-500 ease-out",
                    )}
                    style={{
                      width: "220%",
                      height: "220%",
                      transform: floatingBall.opening
                        ? "translate(-50%, -50%) scale(1)"
                        : "translate(-50%, -50%) scale(0.7)",
                      opacity: floatingBall.opening ? 0.55 : 0.25,
                      background: `radial-gradient(circle at 65% 70%, hsla(${floatingBall.hue + 20}, 50%, 96%, 0.85) 0%, hsla(${floatingBall.hue + 20}, 50%, 92%, 0.45) 22%, transparent 55%)`,
                      filter: "blur(0.5px)",
                    }}
                  />
                  <div
                    className={cn(
                      "relative z-10 w-full h-full rounded-b-full border-[0.8vh] transition-transform duration-500 ease-out",
                    )}
                    style={{
                      backgroundColor: `hsl(${floatingBall.hue}deg, 80%, 70%)`,
                      borderColor: `hsl(${floatingBall.borderHue}deg, 50%, 55%)`,
                      transform: floatingBall.opening
                        ? "translateY(60%) rotate(10deg)"
                        : "translateY(0px)",
                    }}
                  />
                </div>
                {/* Removed gloss highlight to avoid white trailing circle */}
              </div>
            </div>
          </div>
        )}
        {/* Title Container */}
        <div className="title-container absolute inset-0 z-10">
          <div
            className={cn(
              "title transition-transform duration-1000 ease-out",
              showHint && "translate-y-[80vh]",
              showHint2 && "translate-y-[80vh]",
              gameState === "revealing" && "translate-y-[5vh] delay-1000",
              !showHint && !showHint2 && gameState !== "revealing" && "translate-y-[120vh]",
            )}
          >
            <h2 className="text-center text-[5vh] font-bold text-stroke-orange animate-wiggle text-balance">
              {gameState === "revealing" && prize ? (
                <>
                  You got a<br />
                  {prize.title}
                </>
              ) : showHint2 ? (
                "Tap to claim it!"
              ) : (
                "Tap to get a prize!"
              )}
            </h2>
          </div>
        </div>

        {/* Prize Container */}
        <div className="prize-container absolute inset-0">
          <div className="prize-ball-container absolute inset-0" />
          <div
            className={cn(
              "prize-reward-container absolute inset-0 z-[1] transition-opacity duration-300",
              showPrize ? "opacity-100" : "opacity-0",
            )}
          >
            <div className="shine absolute inset-0 flex items-center justify-center">
              <img
                className="h-[100vh] animate-spin-slow"
                src="https://assets.codepen.io/2509128/shine.png"
                alt="Shine effect"
              />
            </div>
            <div className="prize absolute inset-0 flex items-center justify-center">
              {prize && (
                <img
                  className={cn(
                    "h-[50vh] animate-wiggle transition-transform duration-500 ease-back-out",
                    showPrize ? "scale-100" : "scale-0",
                  )}
                  src={prize.image || "/placeholder.svg"}
                  alt={prize.title}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
