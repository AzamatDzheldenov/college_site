import { Image, LogOut, Paperclip, Plus, Save, Trash2, Video } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContent } from '../context/ContentContext'
import axiosInstance from '../utils/axiosInstance'

const tabs = ['Новости', 'Документы', 'Галерея', 'Состав ПЦК']

const emptyBi = { ru: '', ky: '' }

function Admin() {
  const navigate = useNavigate()
  const { content, setContent, isLoading } = useContent()
  const [draft, setDraft] = useState(null)
  const [activeTab, setActiveTab] = useState(tabs[0])
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    axiosInstance.get('/auth/me').catch(() => navigate('/admin-login', { replace: true }))
  }, [navigate])

  useEffect(() => {
    if (content) {
      setDraft(structuredClone(content))
    }
  }, [content])

  const updateField = (path, value) => {
    setDraft((current) => {
      const next = structuredClone(current)
      let target = next

      for (let index = 0; index < path.length - 1; index += 1) {
        target = target[path[index]]
      }

      target[path.at(-1)] = value
      return next
    })
  }

  const addItem = (path, item, position = 'end') => {
    setDraft((current) => {
      const next = structuredClone(current)
      const list = getByPath(next, path)

      if (position === 'start') {
        list.unshift(item)
      } else {
        list.push(item)
      }

      return next
    })
  }

  const removeItem = (path, indexToRemove) => {
    setDraft((current) => {
      const next = structuredClone(current)
      const list = getByPath(next, path)
      list.splice(indexToRemove, 1)
      return next
    })
  }

  const uploadFile = async (file, type) => {
    setStatus('')
    setError('')

    const formData = new FormData()
    formData.append('type', type)
    formData.append('file', file)

    try {
      const response = await axiosInstance.post('/admin/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setStatus('Файл загружен.')
      return response.data
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Не удалось загрузить файл.')
      return null
    }
  }

  const saveContent = async () => {
    setIsSaving(true)
    setStatus('')
    setError('')

    try {
      const response = await axiosInstance.put('/admin/content', draft)
      setContent(response.data)
      setDraft(structuredClone(response.data))
      setStatus('Контент сохранен.')
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Не удалось сохранить контент.')
    } finally {
      setIsSaving(false)
    }
  }

  const logout = async () => {
    await axiosInstance.post('/auth/logout')
    navigate('/admin-login', { replace: true })
  }

  if (isLoading || !draft) {
    return (
      <section className="section-pad pt-36">
        <div className="page-shell">
          <div className="glass-panel rounded-[25px] p-8 text-muted">Загрузка админ-панели...</div>
        </div>
      </section>
    )
  }

  return (
    <section className="section-pad pt-36">
      <div className="page-shell">
        <div className="glass-panel rounded-[25px] p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="eyebrow">Закрытая зона</p>
              <h1 className="mt-3 text-3xl font-semibold text-text sm:text-4xl">
                Публикации и медиа колледжа
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">
                Админка скрыта из меню и работает через защищенный серверный API.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={saveContent}
                disabled={isSaving}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5 disabled:opacity-60"
              >
                <Save size={17} /> {isSaving ? 'Сохраняем...' : 'Сохранить'}
              </button>
              <button
                type="button"
                onClick={logout}
                className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-line/70 bg-panel/60 px-5 py-3 text-sm font-semibold text-text transition hover:border-coral/40 hover:text-coral"
              >
                <LogOut size={17} /> Выйти
              </button>
            </div>
          </div>

          {(status || error) && (
            <p
              className={[
                'mt-5 rounded-lg px-4 py-3 text-sm font-medium',
                error ? 'bg-coral/12 text-coral' : 'bg-accent/12 text-accent',
              ].join(' ')}
            >
              {error || status}
            </p>
          )}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[240px_1fr]">
          <div className="glass-panel-strong rounded-[20px] p-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={[
                  'w-full rounded-lg px-4 py-3 text-left text-sm font-semibold transition',
                  activeTab === tab
                    ? 'bg-accent text-white'
                    : 'text-muted hover:bg-accent/10 hover:text-accent',
                ].join(' ')}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="glass-panel rounded-[25px] p-5 sm:p-7">
            {activeTab === 'Новости' && (
              <NewsEditor
                draft={draft}
                updateField={updateField}
                addItem={addItem}
                removeItem={removeItem}
                uploadFile={uploadFile}
              />
            )}
            {activeTab === 'Документы' && (
              <DocumentsEditor
                draft={draft}
                updateField={updateField}
                addItem={addItem}
                removeItem={removeItem}
                uploadFile={uploadFile}
              />
            )}
            {activeTab === 'Галерея' && (
              <GalleryEditor
                draft={draft}
                updateField={updateField}
                addItem={addItem}
                removeItem={removeItem}
                uploadFile={uploadFile}
              />
            )}
            {activeTab === 'Состав ПЦК' && (
              <PckEditor
                draft={draft}
                updateField={updateField}
                addItem={addItem}
                removeItem={removeItem}
                uploadFile={uploadFile}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

function NewsEditor({ draft, updateField, addItem, removeItem, uploadFile }) {
  const sortedIndexes = useMemo(
    () =>
      draft.news
        .map((item, index) => ({ item, index }))
        .sort((a, b) => new Date(b.item.publishedAt) - new Date(a.item.publishedAt)),
    [draft.news],
  )

  const addNews = () => {
    addItem(
      ['news'],
      {
        id: `news-${crypto.randomUUID()}`,
        title: structuredClone(emptyBi),
        text: structuredClone(emptyBi),
        publishedAt: new Date().toISOString().slice(0, 10),
        photos: [],
        videos: [],
        createdAt: new Date().toISOString(),
      },
      'start',
    )
  }

  return (
    <div className="grid gap-5">
      <PanelHeader
        title="Новости"
        text="Публикуйте новости как пост: дата, заголовок, большой текст, фото и видео."
        action={<AddButton onClick={addNews} label="Новая новость" />}
      />

      {sortedIndexes.map(({ item, index }) => (
        <article key={item.id} className="rounded-[20px] border border-line/60 bg-panel/45 p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="grid gap-4">
              <TextInput
                label="Заголовок RU"
                value={item.title.ru}
                onChange={(value) => updateField(['news', index, 'title', 'ru'], value)}
              />
              <TextInput
                label="Заголовок KG"
                value={item.title.ky}
                onChange={(value) => updateField(['news', index, 'title', 'ky'], value)}
              />
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-text">Дата публикации</span>
                <input
                  type="date"
                  className="field-input"
                  value={item.publishedAt}
                  onChange={(event) => updateField(['news', index, 'publishedAt'], event.target.value)}
                />
              </label>
              <TextArea
                label="Текст RU"
                value={item.text.ru}
                tall
                onChange={(value) => updateField(['news', index, 'text', 'ru'], value)}
              />
              <TextArea
                label="Текст KG"
                value={item.text.ky}
                tall
                onChange={(value) => updateField(['news', index, 'text', 'ky'], value)}
              />
              <div className="flex flex-wrap gap-3">
                <UploadButton
                  label="Фото"
                  icon={<Image size={17} />}
                  accept="image/*"
                  onFile={async (file) => {
                    const uploaded = await uploadFile(file, 'image')
                    if (uploaded) {
                      updateField(['news', index, 'photos'], [...item.photos, uploaded])
                    }
                  }}
                />
                <UploadButton
                  label="Видео"
                  icon={<Video size={17} />}
                  accept="video/mp4,video/webm,video/quicktime"
                  onFile={async (file) => {
                    const uploaded = await uploadFile(file, 'video')
                    if (uploaded) {
                      updateField(['news', index, 'videos'], [...item.videos, uploaded])
                    }
                  }}
                />
                <button
                  type="button"
                  className="focus-ring rounded-lg border border-line/70 px-4 py-2 text-sm font-semibold text-text transition hover:text-accent"
                  onClick={() => {
                    const url = window.prompt('Ссылка на видео')
                    if (url) {
                      updateField(['news', index, 'videos'], [
                        ...item.videos,
                        { url, name: url, type: 'external', mimeType: '', size: null },
                      ])
                    }
                  }}
                >
                  Видео-ссылка
                </button>
                <RemoveIconButton onClick={() => removeItem(['news'], index)} />
              </div>
              <MediaList
                photos={item.photos}
                videos={item.videos}
                onRemovePhoto={(mediaIndex) =>
                  updateField(
                    ['news', index, 'photos'],
                    item.photos.filter((_, photoIndex) => photoIndex !== mediaIndex),
                  )
                }
                onRemoveVideo={(mediaIndex) =>
                  updateField(
                    ['news', index, 'videos'],
                    item.videos.filter((_, videoIndex) => videoIndex !== mediaIndex),
                  )
                }
              />
            </div>

            <div className="rounded-[20px] bg-white p-4 text-[#1d1d1f] shadow-soft dark:bg-slate-950 dark:text-white">
              <p className="text-xs font-semibold uppercase text-accent">Preview</p>
              <h3 className="mt-3 text-xl font-semibold">{item.title.ru || 'Заголовок новости'}</h3>
              <p className="mt-2 text-xs text-slate-500">{item.publishedAt}</p>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600 dark:text-slate-300">
                {item.text.ru || 'Текст новости будет выглядеть как публикация.'}
              </p>
              {item.photos[0] && (
                <img src={item.photos[0].url} alt="" className="mt-4 h-44 w-full rounded-lg object-cover" />
              )}
            </div>
          </div>
        </article>
      ))}
    </div>
  )
}

function DocumentsEditor({ draft, updateField, addItem, removeItem, uploadFile }) {
  return (
    <div className="grid gap-5">
      <PanelHeader
        title="Документы"
        text="Загружайте сами файлы документов и задавайте названия на двух языках."
        action={
          <AddButton
            label="Новый документ"
            onClick={() =>
              addItem(['documents'], {
                id: `doc-${crypto.randomUUID()}`,
                title: structuredClone(emptyBi),
                description: structuredClone(emptyBi),
                file: null,
              })
            }
          />
        }
      />
      {draft.documents.map((document, index) => (
        <article key={document.id} className="rounded-[20px] border border-line/60 bg-panel/45 p-4">
          <div className="grid gap-4 md:grid-cols-2">
            <TextInput
              label="Название RU"
              value={document.title.ru}
              onChange={(value) => updateField(['documents', index, 'title', 'ru'], value)}
            />
            <TextInput
              label="Название KG"
              value={document.title.ky}
              onChange={(value) => updateField(['documents', index, 'title', 'ky'], value)}
            />
            <TextArea
              label="Описание RU"
              value={document.description.ru}
              onChange={(value) => updateField(['documents', index, 'description', 'ru'], value)}
            />
            <TextArea
              label="Описание KG"
              value={document.description.ky}
              onChange={(value) => updateField(['documents', index, 'description', 'ky'], value)}
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <UploadButton
              label="Приложить документ"
              icon={<Paperclip size={17} />}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
              onFile={async (file) => {
                const uploaded = await uploadFile(file, 'document')
                if (uploaded) {
                  updateField(['documents', index, 'file'], uploaded)
                }
              }}
            />
            {document.file && <span className="text-sm text-muted">{document.file.name}</span>}
            <RemoveIconButton onClick={() => removeItem(['documents'], index)} />
          </div>
        </article>
      ))}
    </div>
  )
}

function GalleryEditor({ draft, updateField, addItem, removeItem, uploadFile }) {
  return (
    <div className="grid gap-5">
      <PanelHeader
        title="Галерея"
        text="Публикуйте фотографии жизни колледжа."
        action={
          <AddButton
            label="Новое фото"
            onClick={() =>
              addItem(
                ['gallery'],
                {
                  id: `gallery-${crypto.randomUUID()}`,
                  caption: structuredClone(emptyBi),
                  photo: null,
                  createdAt: new Date().toISOString(),
                },
                'start',
              )
            }
          />
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        {draft.gallery.map((item, index) => (
          <article key={item.id} className="rounded-[20px] border border-line/60 bg-panel/45 p-4">
            {item.photo && <img src={item.photo.url} alt="" className="mb-4 h-52 w-full rounded-lg object-cover" />}
            <TextInput
              label="Подпись RU"
              value={item.caption.ru}
              onChange={(value) => updateField(['gallery', index, 'caption', 'ru'], value)}
            />
            <TextInput
              label="Подпись KG"
              value={item.caption.ky}
              onChange={(value) => updateField(['gallery', index, 'caption', 'ky'], value)}
            />
            <div className="mt-4 flex flex-wrap gap-3">
              <UploadButton
                label="Загрузить фото"
                icon={<Image size={17} />}
                accept="image/*"
                onFile={async (file) => {
                  const uploaded = await uploadFile(file, 'image')
                  if (uploaded) {
                    updateField(['gallery', index, 'photo'], uploaded)
                  }
                }}
              />
              <RemoveIconButton onClick={() => removeItem(['gallery'], index)} />
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}

function PckEditor({ draft, updateField, addItem, removeItem, uploadFile }) {
  const [activeSlug, setActiveSlug] = useState(draft.pckDirections[0]?.slug || '')
  const direction = draft.pckDirections.find((item) => item.slug === activeSlug)
  const pckIndex = draft.pckTeachers.findIndex((item) => item.slug === activeSlug)
  const pck = draft.pckTeachers[pckIndex]

  return (
    <div className="grid gap-5">
      <PanelHeader
        title="Состав ПЦК"
        text="Направления зафиксированы. Выберите ПЦК и редактируйте только преподавателей."
        action={null}
      />
      <label className="block">
        <span className="mb-2 block text-sm font-semibold text-text">Направление ПЦК</span>
        <select className="field-input" value={activeSlug} onChange={(event) => setActiveSlug(event.target.value)}>
          {draft.pckDirections.map((item) => (
            <option key={item.slug} value={item.slug}>
              {item.title.ru}
            </option>
          ))}
        </select>
      </label>

      {direction && (
        <div className="rounded-[20px] border border-line/60 bg-panel/45 p-4">
          <h2 className="text-xl font-semibold text-text">{direction.title.ru}</h2>
          <p className="mt-2 text-sm text-muted">{direction.description.ru}</p>
          <div className="mt-5 flex justify-end">
            <AddButton
              label="Добавить преподавателя"
              onClick={() =>
                addItem(['pckTeachers', pckIndex, 'teachers'], {
                  photo: null,
                  fullName: structuredClone(emptyBi),
                  position: structuredClone(emptyBi),
                })
              }
            />
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {(pck?.teachers || []).map((teacher, teacherIndex) => (
              <article key={teacherIndex} className="rounded-[20px] border border-line/60 bg-panel/60 p-4">
                {teacher.photo && (
                  <img src={teacher.photo.url} alt="" className="mb-4 h-52 w-full rounded-lg object-cover" />
                )}
                <TextInput
                  label="ФИО RU"
                  value={teacher.fullName.ru}
                  onChange={(value) =>
                    updateField(['pckTeachers', pckIndex, 'teachers', teacherIndex, 'fullName', 'ru'], value)
                  }
                />
                <TextInput
                  label="ФИО KG"
                  value={teacher.fullName.ky}
                  onChange={(value) =>
                    updateField(['pckTeachers', pckIndex, 'teachers', teacherIndex, 'fullName', 'ky'], value)
                  }
                />
                <TextInput
                  label="Должность RU"
                  value={teacher.position.ru}
                  onChange={(value) =>
                    updateField(['pckTeachers', pckIndex, 'teachers', teacherIndex, 'position', 'ru'], value)
                  }
                />
                <TextInput
                  label="Должность KG"
                  value={teacher.position.ky}
                  onChange={(value) =>
                    updateField(['pckTeachers', pckIndex, 'teachers', teacherIndex, 'position', 'ky'], value)
                  }
                />
                <div className="mt-4 flex flex-wrap gap-3">
                  <UploadButton
                    label="Фото"
                    icon={<Image size={17} />}
                    accept="image/*"
                    onFile={async (file) => {
                      const uploaded = await uploadFile(file, 'image')
                      if (uploaded) {
                        updateField(['pckTeachers', pckIndex, 'teachers', teacherIndex, 'photo'], uploaded)
                      }
                    }}
                  />
                  <RemoveIconButton onClick={() => removeItem(['pckTeachers', pckIndex, 'teachers'], teacherIndex)} />
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function PanelHeader({ title, text, action }) {
  return (
    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
      <div>
        <h2 className="text-2xl font-semibold text-text">{title}</h2>
        <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
      </div>
      {action}
    </div>
  )
}

function TextInput({ label, value, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text">{label}</span>
      <input className="field-input" value={value || ''} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function TextArea({ label, value, onChange, tall = false }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-text">{label}</span>
      <textarea
        className={['field-input resize-y', tall ? 'min-h-44' : 'min-h-28'].join(' ')}
        value={value || ''}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}

function AddButton({ onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white shadow-soft transition hover:-translate-y-0.5"
    >
      <Plus size={17} /> {label}
    </button>
  )
}

function RemoveIconButton({ onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="focus-ring inline-flex items-center justify-center gap-2 rounded-lg border border-coral/30 px-4 py-2 text-sm font-semibold text-coral transition hover:bg-coral hover:text-white"
    >
      <Trash2 size={17} /> Удалить
    </button>
  )
}

function UploadButton({ label, icon, accept, onFile }) {
  return (
    <label className="focus-ring inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-line/70 bg-panel/60 px-4 py-2 text-sm font-semibold text-text transition hover:border-accent/40 hover:text-accent">
      {icon} {label}
      <input
        type="file"
        accept={accept}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''

          if (file) {
            onFile(file)
          }
        }}
      />
    </label>
  )
}

function MediaList({ photos, videos, onRemovePhoto, onRemoveVideo }) {
  return (
    <div className="grid gap-3">
      {photos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {photos.map((photo, index) => (
            <button
              key={`${photo.url}-${index}`}
              type="button"
              onClick={() => onRemovePhoto(index)}
              className="rounded-lg bg-accent/10 px-3 py-2 text-xs font-semibold text-accent"
            >
              {photo.name} ×
            </button>
          ))}
        </div>
      )}
      {videos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {videos.map((video, index) => (
            <button
              key={`${video.url}-${index}`}
              type="button"
              onClick={() => onRemoveVideo(index)}
              className="rounded-lg bg-coral/10 px-3 py-2 text-xs font-semibold text-coral"
            >
              {video.name} ×
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function getByPath(target, path) {
  return path.reduce((value, key) => value[key], target)
}

export default Admin
