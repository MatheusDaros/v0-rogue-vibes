"use client"

import type React from "react"

import { useState } from "react"
import type { GameState } from "@/types/game-types"
import { getToneAudioManager } from "@/utils/tone-audio-manager"
import ShopTradeModal from "@/components/shop-trade-modal"

interface SectorMapProps {
  gameState: GameState
  onSelectNode: (nodeIndex: number, nodeType: string) => void
  onUnlockNode: (nodeIndex: number) => void
}

import { useEffect } from "react"

export default function SectorMap({ gameState, onSelectNode, onUnlockNode }: SectorMapProps) {
  // Track which node is currently unlocked (only one at a time)
  const [unlockedNode, setUnlockedNode] = useState<number>(gameState.currentRun.node || 0)

  // Keep local unlockedNode in sync with prop
  useEffect(() => {
    setUnlockedNode(gameState.currentRun.node || 0)
  }, [gameState.currentRun.node])
  const [showShopModal, setShowShopModal] = useState(false)
  const [resources, setResources] = useState(gameState.currentRun.resources)

  // When a node is completed, unlock the next one
  const unlockNextNode = (nodeIndex: number) => {
    if (nodeIndex === unlockedNode && unlockedNode < 4) {
      setUnlockedNode(unlockedNode + 1)
      onUnlockNode(unlockedNode + 1)
    }
  }

  const { character, sector, health } = gameState.currentRun
  const [hoveredNode, setHoveredNode] = useState<number | null>(null)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipContent, setTooltipContent] = useState("")
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  if (!character) {
    return <div className="p-6 text-center text-white">No character selected</div>
  }

  // Generate nodes
  const nodeCount = 5
  const nodes = Array.from({ length: nodeCount }, (_, i) => {
    const nodeType = i === nodeCount - 1 ? "boss" : i === 1 ? "shop" : "combat"
    return { index: i, type: nodeType }
  })

  const handleNodeHover = (index: number, type: string, event: React.MouseEvent) => {
    setHoveredNode(index)

    // Set tooltip content based on node type
    let content = ""
    switch (type) {
      case "combat":
        content = "Matrix Combat: Test your calculation skills"
        break
      case "shop":
        content = "Shop: Spend resources for upgrades"
        break
      case "boss":
        content = "Boss Node: Difficult challenge with great rewards"
        break
    }

    setTooltipContent(content)

    // Position tooltip near the cursor
    const rect = (event.target as HTMLElement).getBoundingClientRect()
    setTooltipPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    })

    setShowTooltip(true)
  }

  const handleNodeClick = (index: number, type: string) => {
    if (index > unlockedNode) return // Prevent clicking locked nodes
    const audioManager = getToneAudioManager()
    if (audioManager) {
      audioManager.playSound("node-select")
    }
    if (type === "shop") {
      setShowShopModal(true)
      return
    }
    onSelectNode(index, type)
    unlockNextNode(index)
  }

  // Handle shop trade
  const handleShopTrade = (cost: number, tokens: number) => {
    setResources((prev) => ({
      ...prev,
      money: prev.money - cost,
      tokens: prev.tokens + tokens,
    }))
    setShowShopModal(false)
    unlockNextNode(1) // Shop is always node 1
  }

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-center mb-6">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-red-600">
          Sector {sector}
        </span>
      </h2>

      <div className="flex justify-between mb-8 bg-gray-800/50 rounded-lg p-4">
        <div className="flex items-center text-yellow-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          ${resources.money}
        </div>
        <div className="flex items-center text-blue-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          {resources.tokens} tokens
        </div>
        <div className="flex items-center text-red-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 mr-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          {health}%
        </div>
      </div>

      <div className="relative h-64 mb-8 bg-gray-800/30 rounded-lg p-4">
        {/* Lines connecting nodes */}
        <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
          {nodes.slice(1).map((node, i) => (
            <line
              key={`line-${i}`}
              x1={`${i * 25 + 12.5}%`}
              y1="50%"
              x2={`${(i + 1) * 25 + 12.5}%`}
              y2="50%"
              stroke="rgba(255, 255, 255, 0.2)"
              strokeWidth="3"
              strokeDasharray="5,5"
            />
          ))}
        </svg>

        {/* Nodes */}
        <div className="flex justify-between relative z-10 h-full items-center">
          {nodes.map((node) => {
            const isHovered = hoveredNode === node.index

            let nodeColor = ""
            let nodeIcon = ""
            let pulseColor = ""

            switch (node.type) {
              case "boss":
                nodeColor = "bg-gradient-to-br from-red-500 to-red-700"
                nodeIcon = "!"
                pulseColor = "bg-red-500"
                break
              case "shop":
                nodeColor = "bg-gradient-to-br from-green-500 to-green-700"
                nodeIcon = "$"
                pulseColor = "bg-green-500"
                break
              case "combat":
                nodeColor = "bg-gradient-to-br from-blue-500 to-blue-700"
                nodeIcon = "?"
                pulseColor = "bg-blue-500"
                break
            }

            return (
              <div key={node.index} className="flex flex-col items-center">
                <div className={`relative ${isHovered ? "animate-pulse" : ""}`}>
                  {isHovered && (
                    <div className={`absolute inset-0 ${pulseColor} rounded-full opacity-30 animate-ping`}></div>
                  )}
                  <button
                    className={`w-16 h-16 ${nodeColor} rounded-full transition-all duration-300 flex items-center justify-center mb-2 text-xl font-bold text-white transform 
              ${isHovered && node.index === unlockedNode ? "scale-110" : ""}
              ${node.index === unlockedNode ? "hover:shadow-lg hover:shadow-" + pulseColor + "/50" : ""}
              ${node.index !== unlockedNode ? "opacity-30 cursor-not-allowed" : ""}`}
                    onClick={() => handleNodeClick(node.index, node.type)}
                    onMouseEnter={(e) => handleNodeHover(node.index, node.type, e)}
                    onMouseLeave={() => setShowTooltip(false)}
                    disabled={node.index !== unlockedNode}
                  >
                    {nodeIcon}
                  </button>
                </div>
                <span className="text-white text-xs uppercase font-semibold tracking-wider">{node.type}</span>
              </div>
            )
          })}
        </div>

        {/* Tooltip */}
        {showTooltip && (
          <div
            className="absolute bg-gray-900 text-white px-3 py-1 rounded text-sm z-20 transform -translate-x-1/2 -translate-y-full pointer-events-none"
            style={{
              left: `${tooltipPosition.x}px`,
              top: `${tooltipPosition.y}px`,
              marginTop: "-20px",
            }}
          >
            {tooltipContent}
            <div className="absolute left-1/2 bottom-0 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
          </div>
        )}
      </div>

      <div className={`bg-gradient-to-br ${character.color} p-4 rounded-lg shadow-lg`}>
        <div className="flex items-center">
          <div className="w-16 h-16 bg-gray-800/30 rounded-full flex items-center justify-center p-2 mr-4">
            <img
              src={character.image || "/placeholder.svg"}
              alt={character.name}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Agent: {character.name}</h3>
            <p className="text-sm text-gray-100">{character.description}</p>
          </div>
        </div>
      </div>
    {/* Shop Trade Modal */}
    <ShopTradeModal
      open={showShopModal}
      onClose={() => setShowShopModal(false)}
      money={resources.money}
      onTrade={handleShopTrade}
    />
    </div>
  )
}
