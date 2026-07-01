interface Props {
  color: string
  onMouseDown: (e: React.MouseEvent) => void
}

export function ResizeHandle({ color, onMouseDown }: Props) {
  return (
    <div
      className="flex-shrink-0 group relative"
      style={{ width: 4, cursor: 'col-resize', zIndex: 10 }}
      onMouseDown={onMouseDown}
    >
      <div
        className="absolute inset-y-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
        style={{ left: 1, width: 2, background: color }}
      />
    </div>
  )
}
