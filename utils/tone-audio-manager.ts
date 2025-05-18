"use client"

import * as Tone from "tone"

class ToneAudioManager {
  private static instance: ToneAudioManager
  private isMuted = false
  private isInitialized = false
  private currentScreen = "title"

  // Tone.js instruments and effects
  private synths: Map<string, Tone.Synth | Tone.PolySynth | Tone.MembraneSynth> = new Map()
  private loops: Map<string, Tone.Loop> = new Map()
  private effects: Map<string, Tone.Reverb | Tone.FeedbackDelay | Tone.Chorus> = new Map()
  private patterns: Map<string, Tone.Pattern<string>> = new Map()
  private sequences: Map<string, Tone.Sequence> = new Map()

  // Volume controls
  private masterVolume: Tone.Volume | null = null

  // Track current chord index for bass loop
  private currentChordIndex = 0

  private constructor() {
    console.log("ToneAudioManager constructed")
  }

  public static getInstance(): ToneAudioManager {
    if (!ToneAudioManager.instance) {
      ToneAudioManager.instance = new ToneAudioManager()
    }
    return ToneAudioManager.instance
  }

  // This method must be called after a user interaction
  public async initialize() {
    if (this.isInitialized || typeof window === "undefined") return

    try {
      // Start Tone.js audio context
      await Tone.start()
      console.log("Tone.js audio context started")

      // Set up master volume
      this.masterVolume = new Tone.Volume(-10).toDestination()

      // Set up effects
      this.setupEffects()

      // Set up instruments
      this.setupInstruments()

      this.isInitialized = true
      console.log("ToneAudioManager initialized")

      // Start background music for current screen
      this.playMusic(this.currentScreen)
    } catch (error) {
      console.error("Failed to initialize ToneAudioManager:", error)
    }
  }

  private setupEffects() {
    try {
      // Reverb effect
      const reverb = new Tone.Reverb({
        decay: 2,
        wet: 0.3,
      }).connect(this.masterVolume!)
      this.effects.set("reverb", reverb)

      // Delay effect
      const delay = new Tone.FeedbackDelay({
        delayTime: "8n",
        feedback: 0.2,
        wet: 0.2,
      }).connect(this.masterVolume!)
      this.effects.set("delay", delay)

      // Chorus effect
      const chorus = new Tone.Chorus({
        frequency: 0.5,
        delayTime: 3.5,
        depth: 0.7,
        wet: 0.3,
      }).connect(this.masterVolume!)
      this.effects.set("chorus", chorus)

      console.log("Effects set up successfully")
    } catch (error) {
      console.error("Error setting up effects:", error)
    }
  }

  private setupInstruments() {
    try {
      // Main melody synth
      const melodySynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "triangle",
        },
        envelope: {
          attack: 0.1,
          decay: 0.2,
          sustain: 0.5,
          release: 1,
        },
      }).connect(this.effects.get("reverb")!)
      this.synths.set("melody", melodySynth)

      // Bass synth
      const bassSynth = new Tone.Synth({
        oscillator: {
          type: "sine",
        },
        envelope: {
          attack: 0.05,
          decay: 0.2,
          sustain: 0.8,
          release: 1.5,
        },
      }).connect(this.masterVolume!)
      this.synths.set("bass", bassSynth)

      // Pad synth
      const padSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: {
          type: "sine",
        },
        envelope: {
          attack: 1,
          decay: 1,
          sustain: 0.8,
          release: 3,
        },
      }).connect(this.effects.get("chorus")!)
      this.synths.set("pad", padSynth)

      // Percussion synth
      const percSynth = new Tone.MembraneSynth({
        pitchDecay: 0.05,
        octaves: 4,
        envelope: {
          attack: 0.001,
          decay: 0.2,
          sustain: 0.01,
          release: 0.4,
        },
      }).connect(this.masterVolume!)
      this.synths.set("perc", percSynth)

      console.log("Instruments set up successfully")
    } catch (error) {
      console.error("Error setting up instruments:", error)
    }
  }

  public playMusic(screenId: string) {
    this.currentScreen = screenId
    console.log(`Attempting to play music for screen: ${screenId}`)

    if (!this.isInitialized) {
      console.log("Audio not initialized yet")
      return
    }

    if (this.isMuted) {
      console.log("Audio is muted")
      return
    }

    // Stop any currently playing music
    this.stopAllMusic()

    // Create new music based on the screen
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
      console.log(`Music for ${screenId} started`)
    } catch (error) {
      console.error(`Error creating music for ${screenId}:`, error)
    }
  }

  private createTitleMusic() {
    try {
      // Reset chord index
      this.currentChordIndex = 0

      // Set the BPM for title screen
      Tone.Transport.bpm.value = 80

      // Create a chord progression
      const titleChords = [
        ["C3", "E3", "G3", "B3"],
        ["A2", "C3", "E3", "G3"],
        ["F2", "A2", "C3", "E3"],
        ["G2", "B2", "D3", "F3"],
      ]

      // Create a pad sequence that also updates the chord index
      const padSequence = new Tone.Sequence(
        (time: any, chord: any) => {
          this.synths.get("pad")?.triggerAttackRelease(chord, "2n", time)
          
        },
        titleChords,
        "1m",
      )
      this.sequences.set("title-pad", padSequence)

      // Create a melody pattern
      const melodyNotes = ["C4", "E4", "G4", "B4", "C5", "B4", "G4", "E4"]
      const melodyPattern = new Tone.Pattern(
        (time, note) => {
          this.synths.get("melody")?.triggerAttackRelease(note, "8n", time)
        },
        melodyNotes,
        "upDown",
      )
      melodyPattern.interval = "8n"
      this.patterns.set("title-melody", melodyPattern)

      // Create a bass loop with a fixed pattern instead of relying on chord index
      const bassNotes = ["C2", "A1", "F1", "G1"]
      let bassIndex = 0

      const bassLoop = new Tone.Loop((time) => {
        // Use a simple counter for the bass notes
        const bassNote = bassNotes[bassIndex]
        this.synths.get("bass")?.triggerAttackRelease(bassNote, "2n", time)

        // Increment and wrap the index
        bassIndex = (bassIndex + 1) % bassNotes.length
      }, "2n")

      this.loops.set("title-bass", bassLoop)

      // Start all sequences and patterns
      padSequence.start(0)
      melodyPattern.start(0)
      bassLoop.start(0)

      // Start the transport
      Tone.Transport.start()
    } catch (error) {
      console.error("Error creating title music:", error)
    }
  }

  private createMapMusic() {
    try {
      // Set the BPM for map screen
      Tone.Transport.bpm.value = 70

      // Create ambient pad chords
      const padChords = [
        ["D3", "F#3", "A3"],
        ["B2", "D3", "F#3"],
        ["G2", "B2", "D3"],
        ["A2", "C#3", "E3"],
      ]

      // Create a pad sequence
      const padSequence = new Tone.Sequence(
        (time, chord) => {
          this.synths.get("pad")?.triggerAttackRelease(chord, "4n", time, 0.5)
        },
        padChords,
        "2m",
      )
      this.sequences.set("map-pad", padSequence)

      // Create a sparse melody
      const melodyNotes = ["D4", "F#4", "A4", "B4", null, "A4", null, "F#4"]
      const melodyPattern = new Tone.Sequence(
        (time, note) => {
          if (note) {
            this.synths.get("melody")?.triggerAttackRelease(note, "4n", time, 0.7)
          }
        },
        melodyNotes,
        "4n",
      )
      this.sequences.set("map-melody", melodyPattern)

      // Create a slow bass line
      const bassNotes = ["D2", null, "A2", null, "G2", null, "A2", null]
      const bassSequence = new Tone.Sequence(
        (time, note) => {
          if (note) {
            this.synths.get("bass")?.triggerAttackRelease(note, "2n", time)
          }
        },
        bassNotes,
        "2n",
      )
      this.sequences.set("map-bass", bassSequence)

      // Start all sequences
      padSequence.start(0)
      melodyPattern.start(0)
      bassSequence.start(0)

      // Start the transport
      Tone.Transport.start()
    } catch (error) {
      console.error("Error creating map music:", error)
    }
  }

  private createCombatMusic() {
    try {
      // Set the BPM for combat - faster, more intense
      Tone.Transport.bpm.value = 110

      // Create tense chord progression
      const combatChords = [
        ["E3", "G3", "B3"],
        ["C3", "E3", "G3"],
        ["A2", "C3", "E3"],
        ["B2", "D3", "F#3"],
      ]

      // Create a tense pad sequence
      const padSequence = new Tone.Sequence(
        (time, chord) => {
          this.synths.get("pad")?.triggerAttackRelease(chord, "2n", time, 0.4)
        },
        combatChords,
        "2m",
      )
      this.sequences.set("combat-pad", padSequence)

      // Create a driving percussion pattern
      const percPattern = new Tone.Loop((time) => {
        this.synths.get("perc")?.triggerAttackRelease("C2", "16n", time)
      }, "4n")
      this.loops.set("combat-perc", percPattern)

      // Create an urgent melody
      const melodyNotes = ["E4", "G4", "E4", "B4", "E4", "G4", "D4", "E4"]
      const melodySequence = new Tone.Sequence(
        (time, note) => {
          this.synths.get("melody")?.triggerAttackRelease(note, "8n", time, 0.8)
        },
        melodyNotes,
        "8n",
      )
      this.sequences.set("combat-melody", melodySequence)

      // Create a driving bass line
      const bassNotes = ["E2", "E2", "C2", "C2", "A1", "A1", "B1", "B1"]
      const bassSequence = new Tone.Sequence(
        (time, note) => {
          this.synths.get("bass")?.triggerAttackRelease(note, "8n", time, 0.9)
        },
        bassNotes,
        "4n",
      )
      this.sequences.set("combat-bass", bassSequence)

      // Start all sequences and patterns
      padSequence.start(0)
      percPattern.start(0)
      melodySequence.start(0)
      bassSequence.start(0)

      // Start the transport
      Tone.Transport.start()
    } catch (error) {
      console.error("Error creating combat music:", error)
    }
  }

  private createGameOverMusic() {
    try {
      // Set the BPM for game over - slow, somber
      Tone.Transport.bpm.value = 60

      // Create sad chord progression
      const gameOverChords = [
        ["G2", "B2", "D3"],
        ["E2", "G2", "B2"],
        ["A2", "C3", "E3"],
        ["F#2", "A2", "C3"],
      ]

      // Create a sad pad sequence
      const padSequence = new Tone.Sequence(
        (time, chord) => {
          this.synths.get("pad")?.triggerAttackRelease(chord, "4m", time, 0.6)
        },
        gameOverChords,
        "4m",
      )
      this.sequences.set("gameover-pad", padSequence)

      // Create a melancholy melody
      const melodyNotes = ["G4", "D4", "B3", "G3", "A3", null, "B3", null]
      const melodySequence = new Tone.Sequence(
        (time, note) => {
          if (note) {
            this.synths.get("melody")?.triggerAttackRelease(note, "2n", time, 0.5)
          }
        },
        melodyNotes,
        "2n",
      )
      this.sequences.set("gameover-melody", melodySequence)

      // Start all sequences
      padSequence.start(0)
      melodySequence.start(0)

      // Start the transport
      Tone.Transport.start()
    } catch (error) {
      console.error("Error creating game over music:", error)
    }
  }

  private stopAllMusic() {
    try {
      // Stop all sequences, patterns, and loops
      this.sequences.forEach((seq) => seq.stop())
      this.patterns.forEach((pattern) => pattern.stop())
      this.loops.forEach((loop) => loop.stop())

      // Stop the transport
      Tone.Transport.stop()

      console.log("All music stopped")
    } catch (error) {
      if (error instanceof Error) {
        console.error("Error stopping music:", error.message, error.stack)
      } else {
        console.error("Error stopping music:", error)
      }
    }
  }

  public playSound(id: string) {
    if (!this.isInitialized || this.isMuted) return

    try {
      const melodySynth = this.synths.get("melody")

      // Different sounds for different actions
      switch (id) {
        case "click":
          if (!melodySynth) {
            console.warn("[Audio] 'melody' synth not initialized. Click sound will not play.")
          } else {
            melodySynth.triggerAttackRelease("C5", "32n", Tone.now(), 0.5)
          }
          break
        case "success": {
          if (!melodySynth) {
            console.warn("[Audio] 'melody' synth not initialized. Success sound will not play.")
          } else {
            // Play a happy arpeggio
            const now = Tone.now()
            melodySynth.triggerAttackRelease("C5", "16n", now, 0.5)
            melodySynth.triggerAttackRelease("E5", "16n", now + 0.1, 0.5)
            melodySynth.triggerAttackRelease("G5", "16n", now + 0.2, 0.5)
            melodySynth.triggerAttackRelease("C6", "8n", now + 0.3, 0.5)
          }
          break
        }
        case "failure": {
          if (!melodySynth) {
            console.warn("[Audio] 'melody' synth not initialized. Failure sound will not play.")
          } else {
            // Play a sad chord
            const failTime = Tone.now()
            melodySynth.triggerAttackRelease("C4", "8n", failTime, 0.5)
            melodySynth.triggerAttackRelease("Eb4", "8n", failTime, 0.5)
            melodySynth.triggerAttackRelease("G4", "8n", failTime, 0.5)
          }
          break
        }
        case "timer": {
          const percSynth = this.synths.get("perc")
          if (!percSynth) {
            console.warn("[Audio] 'perc' synth not initialized. Timer sound will not play.")
          } else {
            percSynth.triggerAttackRelease("C2", "32n", Tone.now(), 0.3)
          }
          break
        }
        case "node-select":
          if (!melodySynth) {
            console.warn("[Audio] 'melody' synth not initialized. Node-select sound will not play.")
          } else {
            melodySynth.triggerAttackRelease("G4", "16n", Tone.now(), 0.5)
          }
          break
        default:
          if (!melodySynth) {
            console.warn("[Audio] 'melody' synth not initialized. Default sound will not play.")
          } else {
            melodySynth.triggerAttackRelease("C5", "16n", Tone.now(), 0.5)
          }
      }

      console.log(`Played sound: ${id}`)
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[Audio] Error playing sound '${id}':`, error.message, error.stack)
      } else {
        console.error(`[Audio] Unknown error playing sound '${id}':`, error)
      }
    }
  }

  public toggleMute() {
    this.isMuted = !this.isMuted
    console.log(`Audio ${this.isMuted ? "muted" : "unmuted"}`)

    if (this.isMuted) {
      // Mute all sounds by stopping the transport
      this.stopAllMusic()
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
let toneAudioManagerInstance: ToneAudioManager | null = null

export function getToneAudioManager(): ToneAudioManager | null {
  if (typeof window === "undefined") return null

  if (!toneAudioManagerInstance) {
    toneAudioManagerInstance = ToneAudioManager.getInstance()
  }

  return toneAudioManagerInstance
}
