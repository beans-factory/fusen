interface Props {
  title:    string
  message:  string
  confirm:  string
  cancel?:  string
  onOk:     () => void
  onCancel: () => void
}

export function ConfirmModal({ title, message, confirm, cancel = 'キャンセル', onOk, onCancel }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      onClick={onCancel}
    >
      <div
        className="rounded-lg shadow-2xl p-6 flex flex-col gap-4"
        style={{ minWidth: 320, background: 'var(--c-sidebar)', border: '1px solid var(--c-border)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <p className="text-sm font-medium u-text-1 mb-1">{title}</p>
          <p className="text-xs u-text-3">{message}</p>
        </div>
        <div className="flex justify-end gap-2">
          <button className="u-btn px-3 py-1 text-xs" onClick={onCancel}>
            {cancel}
          </button>
          <button
            className="px-3 py-1 text-xs rounded font-medium"
            style={{ background: '#ef4444', color: '#fff', cursor: 'pointer', border: 'none' }}
            onClick={onOk}
          >
            {confirm}
          </button>
        </div>
      </div>
    </div>
  )
}
