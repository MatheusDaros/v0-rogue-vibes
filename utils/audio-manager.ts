"use client"

// Simple audio manager that doesn't rely on external audio files
class AudioManager {
  private static instance: AudioManager
  private isMuted = false
  private isInitialized = false
  private currentScreen = "title"
  private audioContext: AudioContext | null = null
  private oscillators: Map<string, OscillatorNode> = new Map()
  private gainNodes: Map<string, GainNode> = new Map()

  private constructor() {
    console.log("AudioManager constructed")
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager()
    }
    return AudioManager.instance
  }

  // This method must be called after a user interaction
  public initialize() {
    if (this.isInitialized || typeof window === "undefined") return

    try {
      // Create AudioContext on user interaction to comply with browser policies
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      this.isInitialized = true
      console.log("AudioManager initialized with synthetic audio")

      // Start background music for current screen
      this.playMusic(this.currentScreen)
    } catch (error) {
      console.error("Failed to initialize AudioManager:", error)
    }
  }

  public playMusic(screenId: string) {
    this.currentScreen = screenId
    console.log(`Attempting to play synthetic music for screen: ${screenId}`)

    if (!this.isInitialized || !this.audioContext) {
      console.log("Audio not initialized yet")
      return
    }

    if (this.isMuted) {
      console.log("Audio is muted")
      return
    }

    // Stop any currently playing music
    this.stopAllOscillators()

    // Create new oscillators based on the screen
    try {
      switch (screenId) {
        case "title":
          this.createTitleMusic()
          break
        case "map":
          this.createMapMusic()
          break
        case "combat":
          this.createCombatMusic()
          break
        case "gameover":
          this.createGameOverMusic()
          break
        default:
          this.createTitleMusic()
      }
      console.log(`Synthetic music for ${screenId} started`)
    } catch (error) {
      console.error(`Error creating synthetic music for ${screenId}:`, error)
    }
  }

  private createTitleMusic() {
    if (!this.audioContext) return

    // Create a simple melody using oscillators
    const osc1 = this.audioContext.createOscillator()
    const gain1 = this.audioContext.createGain()

    osc1.type = "sine"
    osc1.frequency.value = 440 // A4
    gain1.gain.value = 0.1 // Very quiet

    osc1.connect(gain1)
    gain1.connect(this.audioContext.destination)

    osc1.start()

    this.oscillators.set("title-1", osc1)
    this.gainNodes.set("title-1", gain1)
  }

  private createMapMusic() {
    if (!this.audioContext) return

    // Create a simple background hum
    const osc1 = this.audioContext.createOscillator()
    const gain1 = this.audioContext.createGain()

    osc1.type = "triangle"
    osc1.frequency.value = 220 // A3
    gain1.gain.value = 0.05 // Very quiet

    osc1.connect(gain1)
    gain1.connect(this.audioContext.destination)

    osc1.start()

    this.oscillators.set("map-1", osc1)
    this.gainNodes.set("map-1", gain1)
  }

  private createCombatMusic() {
    if (!this.audioContext) return

    // Create a tense combat sound
    const osc1 = this.audioContext.createOscillator()
    const gain1 = this.audioContext.createGain()

    osc1.type = "sawtooth"
    osc1.frequency.value = 330 // E4
    gain1.gain.value = 0.05 // Very quiet

    osc1.connect(gain1)
    gain1.connect(this.audioContext.destination)

    osc1.start()

    this.oscillators.set("combat-1", osc1)
    this.gainNodes.set("combat-1", gain1)
  }

  private createGameOverMusic() {
    if (!this.audioContext) return

    // Create a sad game over sound
    const osc1 = this.audioContext.createOscillator()
    const gain1 = this.audioContext.createGain()

    osc1.type = "sine"
    osc1.frequency.value = 196 // G3
    gain1.gain.value = 0.05 // Very quiet

    osc1.connect(gain1)
    gain1.connect(this.audioContext.destination)

    osc1.start()

    this.oscillators.set("gameover-1", osc1)
    this.gainNodes.set("gameover-1", gain1)
  }

  private stopAllOscillators() {
    // Stop all currently playing oscillators
    this.oscillators.forEach((osc, key) => {
      try {
        osc.stop()
        this.oscillators.delete(key)
      } catch (error) {
        console.error(`Error stopping oscillator ${key}:`, error)
      }
    })
  }

  public playSound(id: string) {
    if (!this.isInitialized || !this.audioContext || this.isMuted) return

    try {
      // Create a short beep sound
      const osc = this.audioContext.createOscillator()
      const gain = this.audioContext.createGain()

      // Different sounds for different actions
      switch (id) {
        case "click":
          osc.type = "sine"
          osc.frequency.value = 880 // A5
          break
        case "success":
          osc.type = "sine"
          osc.frequency.value = 660 // E5
          break
        case "failure":
          osc.type = "sawtooth"
          osc.frequency.value = 220 // A3
          break
        case "timer":
          osc.type = "square"
          osc.frequency.value = 440 // A4
          break
        case "node-select":
          osc.type = "triangle"
          osc.frequency.value = 550 // C#5
          break
        default:
          osc.type = "sine"
          osc.frequency.value = 440 // A4
      }

      gain.gain.value = 0.1 // Quiet

      // Set up a quick fade out
      gain.gain.setValueAtTime(0.1, this.audioContext.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.3)

      osc.connect(gain)
      gain.connect(this.audioContext.destination)

      osc.start()
      osc.stop(this.audioContext.currentTime + 0.3)

      console.log(`Played synthetic sound: ${id}`)
    } catch (error) {
      console.error(`Error playing synthetic sound ${id}:`, error)
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted
    console.log(`Audio ${this.isMuted ? "muted" : "unmuted"}`)

    if (this.isMuted) {
      // Mute all sounds by stopping oscillators
      this.stopAllOscillators()
    } else {
      // Restart music for current screen
      this.playMusic(this.currentScreen)
    }

    return this.isMuted
  }

  public isMutedState() {
    return this.isMuted
  }
}

// For Next.js, we need to ensure this is only used on the client
let audioManagerInstance: AudioManager | null = null

export function getAudioManager(): AudioManager | null {
  if (typeof window === "undefined") return null

  if (!audioManagerInstance) {
    audioManagerInstance = AudioManager.getInstance()
  }

  return audioManagerInstance
}
