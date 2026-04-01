"use client";

import { useEffect, useRef, useState } from "react"
import Konva from 'konva'
import 'konva/lib/filters/Brighten'
import 'konva/lib/filters/Contrast'
import 'konva/lib/filters/HSL'
import 'konva/lib/filters/Blur'
import { Stage, Layer, Image as KonvaImage, Rect, Text as KonvaText, Transformer } from 'react-konva'

type MemeImage = {
  id: string
  src: string
  x: number
  y: number
  width: number
  height: number
  rotation: number
  opacity: number
  brightness: number
  contrast: number
  saturation: number
  blur: number
  visible: boolean
  locked: boolean
}

type MemeText = {
  id: string
  text: string
  x: number
  y: number
  fontSize: number
  fontFamily: string
  fill: string
  stroke: string
  strokeWidth: number
  align: 'left' | 'center' | 'right'
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  shadowColor: string
  shadowBlur: number
  shadowOffsetX: number
  shadowOffsetY: number
  letterSpacing: number
  lineHeight: number
  rotation: number
  visible: boolean
  locked: boolean
}

type EditorSnapshot = {
  images: MemeImage[]
  texts: MemeText[]
  layerOrder: string[]
  backgroundColor: string
  maintainAspect: boolean
  zoom: number
}

type LayerItem =
  | { type: 'text'; node: MemeText }
  | { type: 'image'; node: MemeImage }

type MemeImageNodeProps = {
  img: MemeImage
  maintainAspect: boolean
  onSelect: () => void
  onChange: (next: MemeImage) => void
}

function MemeImageNode({ img, maintainAspect, onSelect, onChange }: MemeImageNodeProps) {
  const [htmlImage, setHtmlImage] = useState<HTMLImageElement | null>(null)
  const imageRef = useRef<Konva.Image | null>(null)

  // Load the underlying HTMLImageElement when src changes
  useEffect(() => {
    const el = new window.Image()
    el.crossOrigin = 'anonymous'
    el.onload = () => setHtmlImage(el)
    el.src = img.src
  }, [img.src])

  const hasFilters =
    img.brightness !== 0 ||
    img.contrast !== 0 ||
    img.saturation !== 0 ||
    img.blur !== 0

  // Re-cache / clear cache when filter-related props change so Konva re-renders pixels
  useEffect(() => {
    const node = imageRef.current
    if (!node) return

    if (hasFilters && node.cache) {
      node.cache()
    } else if (!hasFilters && "clearCache" in node && typeof (node as Konva.Node & { clearCache: () => void }).clearCache === "function") {
      (node as Konva.Node & { clearCache: () => void }).clearCache()
    }
    node.getLayer()?.batchDraw()
  }, [hasFilters, img.brightness, img.contrast, img.saturation, img.blur])

  const filters: Array<(imageData: ImageData) => void> = []
  if (img.brightness !== 0) filters.push(Konva.Filters.Brighten as (imageData: ImageData) => void)
  if (img.contrast !== 0) filters.push(Konva.Filters.Contrast as (imageData: ImageData) => void)
  if (img.saturation !== 0) filters.push(Konva.Filters.HSL as (imageData: ImageData) => void)
  if (img.blur !== 0) filters.push(Konva.Filters.Blur as (imageData: ImageData) => void)

  return (
    <KonvaImage
      ref={imageRef}
      id={img.id}
      image={htmlImage || undefined}
      x={img.x}
      y={img.y}
      width={img.width}
      height={img.height}
      visible={img.visible}
      rotation={img.rotation}
      opacity={img.opacity}
      filters={filters}
      brightness={img.brightness}
      contrast={img.contrast}
      saturation={img.saturation}
      blurRadius={img.blur}
      draggable={!img.locked}
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) =>
        onChange({
          ...img,
          x: e.target.x(),
          y: e.target.y(),
        })
      }
      onTransformEnd={(e) => {
        const node = e.target
        const scaleX = node.scaleX()
        const scaleY = node.scaleY()
        node.scaleX(1)
        node.scaleY(1)
        let newWidth = img.width * scaleX
        let newHeight = img.height * scaleY
        if (maintainAspect) {
          const scale = Math.max(scaleX, scaleY)
          newWidth = img.width * scale
          newHeight = img.height * scale
        }
        onChange({
          ...img,
          x: node.x(),
          y: node.y(),
          width: newWidth,
          height: newHeight,
          rotation: node.rotation(),
        })
      }}
    />
  )
}

export default function MemeEditor() {
  const stageRef = useRef<Konva.Stage | null>(null)
  const transformerRef = useRef<Konva.Transformer | null>(null)
  const [containerWidth, setContainerWidth] = useState(900)
  const [containerHeight, setContainerHeight] = useState(600)
  const [images, setImages] = useState<MemeImage[]>([])
  const [texts, setTexts] = useState<MemeText[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [layerOrder, setLayerOrder] = useState<string[]>([])
  const [backgroundColor, setBackgroundColor] = useState('#050816')
  const [maintainAspect, setMaintainAspect] = useState(true)
  const [zoom, setZoom] = useState(1)

  const [history, setHistory] = useState<EditorSnapshot[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const isRestoringRef = useRef(false)

  const selectedImage = images.find((img) => img.id === selectedId) || null

  useEffect(() => {
    const handleResize = () => {
      // On small screens, let the canvas use almost full width.
      const viewportW = window.innerWidth
      const viewportH = window.innerHeight

      const isMobile = viewportW < 768
      const horizontalPadding = isMobile ? 32 : 400

      const w = Math.min(viewportW - horizontalPadding, 1000)
      const h = Math.min(viewportH - (isMobile ? 260 : 220), 700)

      setContainerWidth(Math.max(isMobile ? 280 : 400, w))
      setContainerHeight(Math.max(isMobile ? 260 : 300, h))
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Record history whenever core editor state changes (unless we're restoring a snapshot)
  useEffect(() => {
    if (isRestoringRef.current) {
      isRestoringRef.current = false
      return
    }
    const raw: EditorSnapshot = {
      images,
      texts,
      layerOrder,
      backgroundColor,
      maintainAspect,
      zoom,
    }
    const snapshot: EditorSnapshot = JSON.parse(JSON.stringify(raw))
    setHistory((prev) => {
      const trimmed = prev.slice(0, historyIndex + 1)
      trimmed.push(snapshot)
      return trimmed
    })
    setHistoryIndex((idx) => idx + 1)
  }, [images, texts, layerOrder, backgroundColor, maintainAspect, zoom])

  const canUndo = historyIndex > 0
  const canRedo = historyIndex >= 0 && historyIndex < history.length - 1

  const restoreSnapshot = (snap: EditorSnapshot) => {
    isRestoringRef.current = true
    setImages(snap.images)
    setTexts(snap.texts)
    setLayerOrder(snap.layerOrder)
    setBackgroundColor(snap.backgroundColor)
    setMaintainAspect(snap.maintainAspect)
    setZoom(snap.zoom)
  }

  const handleUndo = () => {
    if (!canUndo) return
    const nextIndex = historyIndex - 1
    const snap = history[nextIndex]
    setHistoryIndex(nextIndex)
    restoreSnapshot(snap)
  }

  const handleRedo = () => {
    if (!canRedo) return
    const nextIndex = historyIndex + 1
    const snap = history[nextIndex]
    setHistoryIndex(nextIndex)
    restoreSnapshot(snap)
  }

  // Attach transformer to selected node
  useEffect(() => {
    const stage = stageRef.current
    const tr = transformerRef.current
    if (!stage || !tr) return
    if (!selectedId) {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
      return
    }
    const node = stage.findOne(`#${selectedId}`)
    if (node) {
      tr.nodes([node])
      tr.getLayer()?.batchDraw()
    }
  }, [selectedId, images, texts])

  const handleImageUpload = (file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      const id = `img-${Date.now()}`
      const img = new window.Image()
      img.onload = () => {
        const maxW = containerWidth * 0.4
        const scale = Math.min(1, maxW / img.width)
        setImages((prev) => [
          ...prev,
          {
            id,
            src,
            x: containerWidth / 2 - (img.width * scale) / 2,
            y: containerHeight / 2 - (img.height * scale) / 2,
            width: img.width * scale,
            height: img.height * scale,
            rotation: 0,
            opacity: 1,
            brightness: 0,
            contrast: 0,
            saturation: 0,
            blur: 0,
            visible: true,
            locked: false,
          },
        ])
        setLayerOrder((prev) => [...prev, id])
        setSelectedId(id)
      }
      img.src = src
    }
    reader.readAsDataURL(file)
  }

  const handleAddText = () => {
    const id = `txt-${Date.now()}`
    const maxWidth = containerWidth - 80
    const startX = (containerWidth - maxWidth) / 2
    setTexts((prev) => [
      ...prev,
      {
        id,
        text: 'New caption',
        x: startX,
        y: 40,
        fontSize: 40,
        fontFamily: 'Impact, system-ui, sans-serif',
        fill: '#ffffff',
        stroke: '#000000',
        strokeWidth: 4,
        align: 'center',
        bold: true,
        italic: false,
        underline: false,
        strike: false,
        shadowColor: '#000000',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        letterSpacing: 0,
        lineHeight: 1.2,
        rotation: 0,
        visible: true,
        locked: false,
      },
    ])
    setLayerOrder((prev) => [...prev, id])
    setSelectedId(id)
  }

  const updateSelectedImage = (patch: Partial<MemeImage>) => {
    if (!selectedImage) return
    setImages((prev) => prev.map((img) => (img.id === selectedImage.id ? { ...img, ...patch } : img)))
  }

  const updateSelectedText = (patch: Partial<MemeText>) => {
    const selectedText = texts.find((t) => t.id === selectedId)
    if (!selectedText) return
    setTexts((prev) => prev.map((t) => (t.id === selectedText.id ? { ...t, ...patch } : t)))
  }

  const handleDownload = () => {
    const stage = stageRef.current
    if (!stage) return
    const dataURL = stage.toDataURL({ pixelRatio: 2 })
    const link = document.createElement('a')
    link.download = 'meme.png'
    link.href = dataURL
    link.click()
  }

  const handleCanvasClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
    if (e.target === e.target.getStage()) {
      setSelectedId(null)
    }
  }

  const renderImageNode = (img: MemeImage) => (
    <MemeImageNode
      key={img.id}
      img={img}
      maintainAspect={maintainAspect}
      onSelect={() => setSelectedId(img.id)}
      onChange={(next) =>
        setImages((prev) => prev.map((m) => (m.id === img.id ? next : m)))
      }
    />
  )

  const renderTextNode = (t: MemeText) => {
    const maxWidth = containerWidth - 80
    // Estimate a natural width based on text length and font size,
    // so short captions get a tight box and long ones wrap.
    const estimated = t.text.length * t.fontSize * 0.6 + 40
    const textWidth = Math.min(maxWidth, Math.max(120, estimated))
    return (
      <KonvaText
        key={t.id}
        id={t.id}
        text={t.text}
        x={t.x}
        y={t.y}
        fontSize={t.fontSize}
        fontFamily={t.fontFamily}
        fontStyle={`${t.bold ? 'bold' : 'normal'}${t.italic ? ' italic' : ''}`.trim()}
        textDecoration={`${t.underline ? 'underline' : ''}${
          t.strike ? ' line-through' : ''
        }`.trim()}
        fill={t.fill}
        stroke={t.stroke}
        strokeWidth={t.strokeWidth}
        align={t.align}
        shadowColor={t.shadowColor}
        shadowBlur={t.shadowBlur}
        shadowOffsetX={t.shadowOffsetX}
        shadowOffsetY={t.shadowOffsetY}
        letterSpacing={t.letterSpacing}
        lineHeight={t.lineHeight}
        rotation={t.rotation}
        visible={t.visible}
        draggable={!t.locked}
        // Constrain to a dynamic width that grows with text but never exceeds the canvas
        width={textWidth}
        wrap="word"
        onClick={() => setSelectedId(t.id)}
        onDblClick={() => {
          const next = window.prompt('Edit text', t.text)
          if (next != null) {
            setTexts((prev) =>
              prev.map((txt) => (txt.id === t.id ? { ...txt, text: next } : txt))
            )
          }
        }}
        onDragEnd={(e) => {
          const node = e.target
          const textWidth = node.width()
          const textHeight = node.height()
          const minX = 0
          const minY = 0
          const maxX = containerWidth - textWidth
          const maxY = containerHeight - textHeight
          const clampedX = Math.min(Math.max(node.x(), minX), Math.max(maxX, minX))
          const clampedY = Math.min(Math.max(node.y(), minY), Math.max(maxY, minY))
          setTexts((prev) =>
            prev.map((txt) =>
              txt.id === t.id ? { ...txt, x: clampedX, y: clampedY } : txt
            )
          )
        }}
      />
    )
  }

  const selectedIsImage = selectedId ? images.some((i) => i.id === selectedId) : false
  const selectedText = selectedId ? texts.find((t) => t.id === selectedId) ?? null : null

  const applyTextPreset = (preset: 'meme' | 'elegant' | 'neon' | 'shadow') => {
    const t = selectedText
    if (!t) return
    if (preset === 'meme') {
      updateSelectedText({
        fontFamily: 'Impact, system-ui, sans-serif',
        bold: true,
        italic: false,
        stroke: '#000000',
        strokeWidth: 4,
        fill: '#ffffff',
        shadowColor: '#000000',
        shadowBlur: 0,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        letterSpacing: 0,
        lineHeight: 1.2,
      })
    } else if (preset === 'elegant') {
      updateSelectedText({
        fontFamily: 'Georgia, serif',
        bold: false,
        italic: true,
        stroke: '#000000',
        strokeWidth: 1,
        fill: '#ffffff',
        shadowColor: '#000000',
        shadowBlur: 4,
        shadowOffsetX: 0,
        shadowOffsetY: 2,
        letterSpacing: 1,
        lineHeight: 1.3,
      })
    } else if (preset === 'neon') {
      const neon = '#39FF14'
      updateSelectedText({
        fontFamily: 'Arial, sans-serif',
        bold: true,
        italic: false,
        stroke: neon,
        strokeWidth: 2,
        fill: neon,
        shadowColor: neon,
        shadowBlur: 15,
        shadowOffsetX: 0,
        shadowOffsetY: 0,
        letterSpacing: 2,
        lineHeight: 1.1,
      })
    } else if (preset === 'shadow') {
      updateSelectedText({
        fontFamily: 'Arial, sans-serif',
        bold: true,
        italic: false,
        stroke: '#000000',
        strokeWidth: 2,
        fill: '#ffffff',
        shadowColor: '#000000',
        shadowBlur: 15,
        shadowOffsetX: 0,
        shadowOffsetY: 8,
        letterSpacing: 0,
        lineHeight: 1.2,
      })
    }
  }

  // Build ordered layers based on layerOrder; fall back to creation order for any missing ids
  const idToLayer: Record<string, LayerItem> = {}
  texts.forEach((t) => {
    idToLayer[t.id] = { type: 'text', node: t }
  })
  images.forEach((img) => {
    idToLayer[img.id] = { type: 'image', node: img }
  })

  const layers: LayerItem[] = []
  layerOrder.forEach((id) => {
    const entry = idToLayer[id]
    if (entry) {
      layers.push(entry)
      delete idToLayer[id]
    }
  })
  // Append any layers not yet in layerOrder (e.g. when loading existing state)
  Object.values(idToLayer).forEach((entry) => layers.push(entry))

  const toggleVisibility = (id: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, visible: !img.visible } : img)))
    setTexts((prev) => prev.map((t) => (t.id === id ? { ...t, visible: !t.visible } : t)))
  }

  const toggleLocked = (id: string) => {
    setImages((prev) => prev.map((img) => (img.id === id ? { ...img, locked: !img.locked } : img)))
    setTexts((prev) => prev.map((t) => (t.id === id ? { ...t, locked: !t.locked } : t)))
  }

  const duplicateLayer = (id: string) => {
    const img = images.find((i) => i.id === id)
    if (img) {
      const copyId = `img-${Date.now()}`
      setImages((prev) => [
        ...prev,
        { ...img, id: copyId, x: img.x + 20, y: img.y + 20 },
      ])
      setLayerOrder((prev) => [...prev, copyId])
      setSelectedId(copyId)
      return
    }
    const txt = texts.find((t) => t.id === id)
    if (txt) {
      const copyId = `txt-${Date.now()}`
      setTexts((prev) => [
        ...prev,
        { ...txt, id: copyId, x: txt.x + 20, y: txt.y + 20 },
      ])
      setLayerOrder((prev) => [...prev, copyId])
      setSelectedId(copyId)
    }
  }

  const deleteLayer = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
    setTexts((prev) => prev.filter((t) => t.id !== id))
    setLayerOrder((prev) => prev.filter((key) => key !== id))
    if (selectedId === id) setSelectedId(null)
  }

  const moveLayer = (id: string, direction: 'up' | 'down') => {
    setLayerOrder((prev) => {
      const idx = prev.indexOf(id)
      if (idx === -1) return prev
      const target =
        direction === 'up' ? Math.max(0, idx - 1) : Math.min(prev.length - 1, idx + 1)
      if (idx === target) return prev
      const next = [...prev]
      const tmp = next[idx]
      next[idx] = next[target]
      next[target] = tmp
      return next
    })
  }

  return (
    <div className="flex flex-col md:flex-row gap-4 min-h-[calc(100vh-5rem)]">
      {/* Left sidebar */}
      <aside className="w-full md:w-80 flex flex-col rounded-2xl bg-surface border border-app p-4 overflow-hidden max-h-[40vh] md:max-h-none">
        <h2 className="font-display text-sm font-semibold text-white mb-2 tracking-wide">
          Tools &amp; Assets
        </h2>

        <div className="space-y-4 overflow-y-auto pr-1">
          {/* Layers list */}
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase mb-1">
              Layers
            </p>
            <div className="rounded-lg bg-surface-elevated border border-app divide-y divide-[#202020]">
              {layers.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-strong">
                  No layers yet. Upload an image or add text.
                </div>
              ) : (
                layers.map((layer) => {
                  const isActive = selectedId === layer.node.id
                  const base =
                    layer.type === 'text'
                      ? (layer.node as MemeText).text || 'Text'
                      : 'Image'
                  const label =
                    base.length > 10 ? `${base.slice(0, 9)}…` : base
                  const visible = layer.type === 'text'
                    ? (layer.node as MemeText).visible
                    : (layer.node as MemeImage).visible
                  const locked = layer.type === 'text'
                    ? (layer.node as MemeText).locked
                    : (layer.node as MemeImage).locked
                  return (
                    <div
                      key={layer.node.id}
                      className={`group flex items-center px-2 py-1.5 text-xs cursor-pointer ${
                        isActive
                          ? 'bg-[#FF9F1C]/20 border-l-2 border-[#FF9F1C] text-[#ffb84d]'
                          : 'text-white hover:bg-white/5'
                      }`}
                      onClick={() => setSelectedId(layer.node.id)}
                    >
                      <span className="mr-2 text-muted-strong">⋮⋮</span>
                      <span
                        className={`mr-2 inline-flex h-4 w-4 items-center justify-center rounded-sm ${
                          layer.type === 'text'
                            ? 'bg-[#FF9F1C]/20 text-[#ffb84d]'
                            : 'bg-sky-500/20 text-sky-300'
                        }`}
                      >
                        {layer.type === 'text' ? (
                          /* Text layer icon */
                          <svg
                            viewBox="0 0 20 20"
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <path d="M4 5.5h12M8.5 5.5v9M11.5 5.5v9M5 14.5h4M11 14.5h4" strokeLinecap="round" />
                          </svg>
                        ) : (
                          /* Image layer icon */
                          <svg
                            viewBox="0 0 20 20"
                            className="h-3 w-3"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <rect x="3.5" y="4.5" width="13" height="11" rx="2" />
                            <path d="M6 12.5l2.5-2.5 2.5 2.5 2.5-2.5 2 2.5" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="7" cy="8" r="1" />
                          </svg>
                        )}
                      </span>
                      <span className="flex-1 truncate">{label}</span>
                      <div className="ml-2 flex items-center gap-1">
                        <button
                          type="button"
                          className="text-muted hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveLayer(layer.node.id, 'up')
                          }}
                          title="Move up"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <path d="M5 12.5L10 7.5L15 12.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="text-muted hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            moveLayer(layer.node.id, 'down')
                          }}
                          title="Move down"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <path d="M5 7.5L10 12.5L15 7.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="text-muted hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleVisibility(layer.node.id)
                          }}
                          title={visible ? 'Hide' : 'Show'}
                        >
                          {visible ? (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            >
                              <path
                                d="M2.5 12C4 8.5 7 6 12 6c5 0 8 2.5 9.5 6-1.5 3.5-4.5 6-9.5 6-5 0-8-2.5-9.5-6Z"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <circle cx="12" cy="12" r="2.5" />
                            </svg>
                          ) : (
                            <svg
                              viewBox="0 0 24 24"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            >
                              <path
                                d="M4 4l16 16"
                                strokeLinecap="round"
                              />
                              <path
                                d="M5 9C6.5 6.5 9 5 12 5c3 0 5.5 1.5 7 4M19 15c-1.5 2.5-4 4-7 4-3 0-5.5-1.5-7-4"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          className="text-muted hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            toggleLocked(layer.node.id)
                          }}
                          title={locked ? 'Unlock' : 'Lock'}
                        >
                          {locked ? (
                            <svg
                              viewBox="0 0 20 20"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            >
                              <rect x="4.5" y="8.5" width="11" height="7" rx="1.8" />
                              <path d="M7 8.5V6.8C7 4.7 8.4 3.5 10 3.5c1.6 0 3 1.2 3 3.3v1.7" />
                            </svg>
                          ) : (
                            <svg
                              viewBox="0 0 20 20"
                              className="h-4 w-4"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="1.6"
                            >
                              <rect x="4.5" y="8.5" width="11" height="7" rx="1.8" />
                              <path d="M7 8.5V6.2C7 4.4 8.3 3.1 10 3.1c1.1 0 2 .4 2.6 1.2" />
                            </svg>
                          )}
                        </button>
                        <button
                          type="button"
                          className="text-muted hover:text-white"
                          onClick={(e) => {
                            e.stopPropagation()
                            duplicateLayer(layer.node.id)
                          }}
                          title="Duplicate"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            className="h-4 w-4"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <rect x="5" y="5" width="9" height="9" rx="1.6" />
                            <path d="M7 3.5h6.5A1.5 1.5 0 0 1 15 5v6.5" strokeLinecap="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="text-[#ff4b4b] hover:text-[#ff8080]"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteLayer(layer.node.id)
                          }}
                          title="Delete"
                        >
                          <svg
                            viewBox="0 0 20 20"
                            className="h-5 w-5"
                            style={{ minWidth: "1.1rem", minHeight: "1.1rem" }}
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.6"
                          >
                            <path d="M4.5 6.5h11" strokeLinecap="round" />
                            <path d="M8 4.5h4a1 1 0 0 1 1 1v1H7v-1a1 1 0 0 1 1-1Z" />
                            <path d="M6.5 6.5V14a1.5 1.5 0 0 0 1.5 1.5h4a1.5 1.5 0 0 0 1.5-1.5v-7.5" strokeLinecap="round" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleAddText}
                className="btn-secondary flex-1 text-xs"
              >
                Add text
              </button>
              <label className="btn-secondary flex-1 text-xs cursor-pointer text-center">
                Upload
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    e.target.value = ''
                    if (file) handleImageUpload(file)
                  }}
                />
              </label>
            </div>
          </div>

          {/* Properties */}
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase mb-1">
              Properties
            </p>
            {!selectedId && (
              <p className="text-xs text-muted-strong">
                Select a layer above to edit its properties.
              </p>
            )}

            {selectedIsImage && selectedImage && (
              <div className="space-y-1.5 text-xs text-white mt-1">
                {[
                  { label: 'Rotation', min: -180, max: 180, step: 1, key: 'rotation' as const },
                  { label: 'Opacity', min: 0, max: 1, step: 0.05, key: 'opacity' as const },
                  { label: 'Brightness', min: -1, max: 1, step: 0.05, key: 'brightness' as const },
                  // Konva contrast filter expects a larger range; use -100..100 for visible effect
                  { label: 'Contrast', min: -100, max: 100, step: 1, key: 'contrast' as const },
                  { label: 'Saturation', min: -1, max: 1, step: 0.05, key: 'saturation' as const },
                  { label: 'Blur', min: 0, max: 20, step: 1, key: 'blur' as const },
                ].map(({ label, min, max, step, key }) => (
                  <label key={key} className="flex flex-col gap-0.5">
                    <span className="flex justify-between text-[11px] text-muted">
                      <span>{label}</span>
                      <span className="tabular-nums text-muted-strong">
                        {typeof selectedImage[key] === "number"
                          ? (selectedImage[key] as number).toFixed(2)
                          : String(selectedImage[key])}
                      </span>
                    </span>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={selectedImage[key]}
                      onChange={(e) =>
                        updateSelectedImage({
                          [key]: Number(e.target.value),
                        } as Partial<MemeImage>)
                      }
                    />
                  </label>
                ))}
              </div>
            )}

            {selectedText && (
              <div className="space-y-3 text-xs text-white mt-1">
                {/* Caption */}
                <label className="block">
                  <span className="text-[11px] text-muted">Caption</span>
                  <input
                    type="text"
                    className="input mt-1 text-xs"
                    value={selectedText.text}
                    onChange={(e) => updateSelectedText({ text: e.target.value })}
                  />
                </label>

                {/* Text style */}
                <div>
                  <p className="text-[11px] text-muted mb-1">Text Style</p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      className={`px-2 py-1 rounded-md border text-[11px] ${
                        selectedText.bold
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                          : 'border-app bg-surface-elevated text-white'
                      }`}
                      onClick={() => updateSelectedText({ bold: !selectedText.bold })}
                    >
                      B
                    </button>
                    <button
                      type="button"
                      className={`px-2 py-1 rounded-md border text-[11px] italic ${
                        selectedText.italic
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                          : 'border-app bg-surface-elevated text-white'
                      }`}
                      onClick={() => updateSelectedText({ italic: !selectedText.italic })}
                    >
                      I
                    </button>
                    <button
                      type="button"
                      className={`px-2 py-1 rounded-md border text-[11px] underline ${
                        selectedText.underline
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                          : 'border-app bg-surface-elevated text-white'
                      }`}
                      onClick={() =>
                        updateSelectedText({ underline: !selectedText.underline })
                      }
                    >
                      U
                    </button>
                    <button
                      type="button"
                      className={`px-2 py-1 rounded-md border text-[11px] line-through ${
                        selectedText.strike
                          ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                          : 'border-app bg-surface-elevated text-white'
                      }`}
                      onClick={() => updateSelectedText({ strike: !selectedText.strike })}
                    >
                      S
                    </button>
                  </div>
                </div>

                {/* Style presets & font family */}
                <div className="space-y-2">
                  <div>
                    <p className="text-[11px] text-muted mb-1">Style Presets</p>
                    <div className="flex flex-wrap gap-1">
                      {[
                        { id: 'meme', label: 'Meme' },
                        { id: 'elegant', label: 'Elegant' },
                        { id: 'neon', label: 'Neon' },
                        { id: 'shadow', label: 'Shadow' },
                      ].map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="px-2 py-1 rounded-full border border-app bg-surface-elevated text-[11px] text-white hover:border-[#FF9F1C] hover:text-[#ffb84d]"
                          onClick={() => applyTextPreset(p.id as "meme" | "elegant" | "neon" | "shadow")}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[11px] text-muted mb-1">Font Family</p>
                    <select
                      className="input !h-7 !py-0 text-[11px]"
                      value={selectedText.fontFamily}
                      onChange={(e) => updateSelectedText({ fontFamily: e.target.value })}
                    >
                      <option value="Impact, system-ui, sans-serif">Impact</option>
                      <option value="Arial, sans-serif">Arial</option>
                      <option value="'Roboto', system-ui, sans-serif">Roboto</option>
                      <option value="Georgia, serif">Georgia</option>
                      <option value="'Comic Sans MS', cursive, sans-serif">Comic Sans</option>
                    </select>
                  </div>
                </div>

                {/* Alignment */}
                <div>
                  <p className="text-[11px] text-muted mb-1">Alignment</p>
                  <div className="flex gap-1">
                    {[
                      { key: 'left', label: '⟸' },
                      { key: 'center', label: '≡' },
                      { key: 'right', label: '⟹' },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        className={`px-2 py-1 rounded-md border text-[11px] ${
                          selectedText.align === opt.key
                            ? 'border-emerald-400 bg-emerald-500/10 text-emerald-200'
                            : 'border-app bg-surface-elevated text-white'
                        }`}
                        onClick={() =>
                          updateSelectedText({ align: opt.key as MemeText['align'] })
                        }
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stroke / outline */}
                <div>
                  <p className="text-[11px] text-muted mb-1">Stroke / Outline</p>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <label className="flex items-center gap-1">
                      <span className="text-[11px] text-muted">Fill</span>
                      <input
                        type="color"
                        value={selectedText.fill}
                        onChange={(e) => updateSelectedText({ fill: e.target.value })}
                      />
                    </label>
                    <label className="flex items-center gap-1">
                      <span className="text-[11px] text-muted">Outline</span>
                      <input
                        type="color"
                        value={selectedText.stroke}
                        onChange={(e) => updateSelectedText({ stroke: e.target.value })}
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-0.5">
                    <span className="flex justify-between text-[11px] text-muted">
                      <span>Width</span>
                      <span className="tabular-nums text-muted-strong">
                        {selectedText.strokeWidth.toFixed(1)}px
                      </span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={10}
                      step={0.5}
                      value={selectedText.strokeWidth}
                      onChange={(e) =>
                        updateSelectedText({ strokeWidth: Number(e.target.value) })
                      }
                    />
                  </label>
                </div>

                {/* Text shadow */}
                <div>
                  <p className="text-[11px] text-muted mb-1">Text Shadow</p>
                  <div className="flex items-center gap-2 mb-1">
                    <label className="flex items-center gap-1">
                      <span className="text-[11px] text-muted">Color</span>
                      <input
                        type="color"
                        value={selectedText.shadowColor}
                        onChange={(e) =>
                          updateSelectedText({ shadowColor: e.target.value })
                        }
                      />
                    </label>
                  </div>
                  <label className="flex flex-col gap-0.5 mb-1">
                    <span className="flex justify-between text-[11px] text-muted">
                      <span>Blur</span>
                      <span className="tabular-nums text-muted-strong">
                        {selectedText.shadowBlur.toFixed(0)}px
                      </span>
                    </span>
                    <input
                      type="range"
                      min={0}
                      max={20}
                      step={1}
                      value={selectedText.shadowBlur}
                      onChange={(e) =>
                        updateSelectedText({ shadowBlur: Number(e.target.value) })
                      }
                    />
                  </label>
                  <div className="flex gap-2">
                    {[
                      { key: 'shadowOffsetX' as const, label: 'Offset X', min: -50, max: 50 },
                      { key: 'shadowOffsetY' as const, label: 'Offset Y', min: -50, max: 50 },
                    ].map(({ key, label, min, max }) => (
                      <label key={key} className="flex-1 flex flex-col gap-0.5">
                        <span className="flex justify-between text-[11px] text-muted">
                          <span>{label}</span>
                          <span className="tabular-nums text-muted-strong">
                            {selectedText[key].toFixed(0)}px
                          </span>
                        </span>
                        <input
                          type="range"
                          min={min}
                          max={max}
                          step={1}
                          value={selectedText[key]}
                          onChange={(e) =>
                            updateSelectedText({
                              [key]: Number(e.target.value),
                            } as Partial<MemeText>)
                          }
                        />
                      </label>
                    ))}
                  </div>
                </div>

                {/* Letter spacing, line height, rotation */}
                <div className="space-y-1.5">
                  {[
                    {
                      key: 'letterSpacing' as const,
                      label: 'Letter Spacing',
                      min: -5,
                      max: 20,
                      step: 1,
                      suffix: 'px',
                    },
                    {
                      key: 'lineHeight' as const,
                      label: 'Line Height',
                      min: 0.5,
                      max: 3,
                      step: 0.1,
                      suffix: '',
                    },
                    {
                      key: 'rotation' as const,
                      label: 'Rotation',
                      min: -180,
                      max: 180,
                      step: 1,
                      suffix: '°',
                    },
                  ].map(({ key, label, min, max, step, suffix }) => (
                    <label key={key} className="flex flex-col gap-0.5">
                      <span className="flex justify-between text-[11px] text-muted">
                        <span>{label}</span>
                        <span className="tabular-nums text-muted-strong">
                          {typeof selectedText[key] === "number"
                            ? (selectedText[key] as number).toFixed(key === "lineHeight" ? 2 : 0)
                            : String(selectedText[key])}
                          {suffix}
                        </span>
                      </span>
                      <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={selectedText[key]}
                        onChange={(e) =>
                          updateSelectedText({
                            [key]: Number(e.target.value),
                          } as Partial<MemeText>)
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Image bank */}
          <div>
            <p className="text-[11px] font-semibold text-muted uppercase mb-1">
              Image Bank
            </p>
            {images.length === 0 ? (
              <p className="text-xs text-muted-strong">No images yet. Upload to start.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {images.map((img) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setSelectedId(img.id)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border ${
                      selectedId === img.id ? 'border-[#FF9F1C]' : 'border-app'
                    }`}
                  >
                    <img src={img.src} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex-1 flex flex-col rounded-2xl bg-surface-elevated/80 border border-app overflow-hidden min-h-[50vh]">
        {/* Top toolbar */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 px-3 md:px-4 py-2 border-b border-app bg-surface">
          <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm">
            <button
              type="button"
              className="btn-ghost text-muted disabled:opacity-40"
              onClick={handleUndo}
              disabled={!canUndo}
            >
              Undo
            </button>
            <button
              type="button"
              className="btn-ghost text-muted disabled:opacity-40"
              onClick={handleRedo}
              disabled={!canRedo}
            >
              Redo
            </button>
            <span className="hidden md:inline-block h-5 w-px bg-[#202020] mx-1" />
            <button type="button" onClick={handleAddText} className="btn-secondary text-xs">
              Add text
            </button>
            <label className="flex items-center gap-1 text-xs text-white ml-3">
              Background
              <input
                type="color"
                value={backgroundColor}
                onChange={(e) => setBackgroundColor(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-1 text-xs text-white ml-3">
              <input
                type="checkbox"
                checked={maintainAspect}
                onChange={(e) => setMaintainAspect(e.target.checked)}
              />
              Maintain aspect
            </label>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-2">
            <div className="flex items-center gap-1 text-xs text-white">
              <button
                type="button"
                className="btn-ghost px-2"
                onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
              >
                -
              </button>
              <span>{Math.round(zoom * 100)}%</span>
              <button
                type="button"
                className="btn-ghost px-2"
                onClick={() => setZoom((z) => Math.min(2, z + 0.1))}
              >
                +
              </button>
            </div>
            <button type="button" onClick={handleDownload} className="btn-primary">
              Download
            </button>
          </div>
        </header>

        {/* Canvas */}
        <div className="flex-1 flex items-center justify-center bg-black/80">
          <div
            className="relative rounded-xl overflow-hidden border border-app bg-surface-elevated"
            style={{ width: containerWidth, height: containerHeight }}
          >
            <Stage
              ref={stageRef}
              width={containerWidth}
              height={containerHeight}
              scaleX={zoom}
              scaleY={zoom}
              onMouseDown={handleCanvasClick}
            >
              <Layer>
                <Rect
                  x={0}
                  y={0}
                  width={containerWidth}
                  height={containerHeight}
                  fill={backgroundColor}
                />
                {layers.map((layer) =>
                  layer.type === 'image'
                    ? renderImageNode(layer.node as MemeImage)
                    : renderTextNode(layer.node as MemeText)
                )}
                <Transformer
                  ref={transformerRef}
                  rotateEnabled
                  anchorSize={8}
                  anchorFill="lime"
                  anchorStroke="white"
                  borderStroke="lime"
                  borderDash={[4, 2]}
                />
              </Layer>
            </Stage>
          </div>
        </div>

        {/* Bottom bar */}
        <footer className="flex items-center justify-between px-4 py-3 border-t border-app bg-surface">
          <div className="flex items-center gap-2">
            <label className="btn-secondary text-xs cursor-pointer">
              Upload
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  e.target.value = ''
                  if (file) handleImageUpload(file)
                }}
              />
            </label>
            <button type="button" className="btn-secondary text-xs">
              Import
            </button>
            <button type="button" className="btn-ghost text-xs text-white">
              Crop: Off
            </button>
          </div>
          <button type="button" onClick={handleDownload} className="btn-primary px-6">
            Download Meme
          </button>
        </footer>
      </div>
    </div>
  )
}

