import { useEffect, useMemo, useState, type FormEvent } from 'react'
import {
  ArrowUpRight, BadgeCheck, BusFront, Check, ChevronRight, CircleHelp, Clock3,
  MapPin, MessageCircle, PackageCheck, Plane, Search, ShieldCheck, Star, X,
} from 'lucide-react'
import { onValue, ref } from 'firebase/database'
import { database } from './lib/firebase'
import { getCurrentStatusIndex, shipmentStatuses, type PublicShipment, type Review } from './lib/shipping'
import './ClientApp.css'

const telegramUrl = 'https://t.me/Cargo_managerr_blr'
const pageOpenedAt = Date.now()

function App() {
  const [trackingInput, setTrackingInput] = useState('')
  const [requestedCode, setRequestedCode] = useState('')
  const [trackingAttempt, setTrackingAttempt] = useState(0)
  const [shipment, setShipment] = useState<PublicShipment | null>(null)
  const [trackingMessage, setTrackingMessage] = useState('')
  const [reviewsOpen, setReviewsOpen] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [now, setNow] = useState(pageOpenedAt)

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60_000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    if (!database || !requestedCode) return
    return onValue(ref(database, `publicTracking/${requestedCode}`), (snapshot) => {
      const value = snapshot.val() as PublicShipment | null
      setShipment(value)
      setTrackingMessage(value ? '' : 'Посылка с таким кодом не найдена. Проверьте код и попробуйте ещё раз.')
    }, () => setTrackingMessage('Не удалось загрузить посылку. Попробуйте немного позже.'))
  }, [requestedCode, trackingAttempt])

  useEffect(() => {
    if (!reviewsOpen || !database) return
    return onValue(ref(database, 'publicReviews'), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<Review, 'id'>> | null
      setReviews(Object.entries(value ?? {}).map(([id, review]) => ({ id, ...review })).filter((review) => review.isPublished))
    })
  }, [reviewsOpen])

  const currentStatus = useMemo(() => shipment ? getCurrentStatusIndex(shipment, now) : -1, [shipment, now])

  function trackShipment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const code = trackingInput.trim().toUpperCase()
    if (!code) {
      setTrackingMessage('Введите трек-код посылки.')
      return
    }
    if (!/^CN7-[A-F0-9]{20}$/.test(code)) {
      setTrackingMessage('Проверьте формат трек-кода и попробуйте ещё раз.')
      return
    }
    if (!database) {
      setTrackingMessage('Подключите Firebase в файле .env, чтобы включить отслеживание.')
      return
    }
    setShipment(null)
    setTrackingMessage('')
    setRequestedCode(code)
    setTrackingAttempt((attempt) => attempt + 1)
  }

  return (
    <div className="app-shell">
      <div className="topline">
        <span>Доставка покупок из Китая</span>
        <span className="topline-right"><ShieldCheck size={14} /> Надёжно на каждом этапе</span>
      </div>
      <header className="site-header">
        <a className="brand" href="#top" aria-label="Cargo домой"><span className="brand-seal">货</span><span className="brand-name">cargo<span>7</span><small>CHINA · BELARUS</small></span></a>
        <nav className="desktop-nav" aria-label="Основная навигация">
          <a href="#tracking">Отследить</a><a href="#services">Как заказать</a>
          <button className="nav-link" onClick={() => setReviewsOpen(true)}>Отзывы</button>
        </nav>
        <a className="header-contact" href={telegramUrl} target="_blank" rel="noreferrer"><MessageCircle size={17} /><span>Написать менеджеру</span><ArrowUpRight size={14} /></a>
      </header>

      <main id="top">
        <section className="hero-wrap">
          <div className="hero-copy">
            <p className="eyebrow"><span className="eyebrow-dot" /> ВАШ МОСТ МЕЖДУ КИТАЕМ И БЕЛАРУСЬЮ</p>
            <h1>Покупки из Китая.<br /><em>Доставка без хлопот.</em></h1>
            <p className="hero-description">Выкупаем, бережно упаковываем и привозим ваши заказы. Следите за посылкой на каждом этапе пути.</p>
            <div className="service-chips"><span><Plane size={15} /> Авиа · 5–12 дней</span><span><BusFront size={15} /> Автобус · 10–18 дней</span></div>
          </div>
          <div className="hero-stamp" aria-hidden="true"><span className="stamp-top">一路平安</span><div className="stamp-mark">龙</div><span className="stamp-bottom">CARGO · 7</span></div>
        </section>

        <section className="tracking-panel" id="tracking" aria-labelledby="tracking-title">
          <div className="tracking-panel-top"><div className="panel-icon"><PackageCheck size={21} /></div><div><p className="section-kicker">ЛИЧНЫЙ КАБИНЕТ ПОСЫЛКИ</p><h2 id="tracking-title">Где мой заказ?</h2></div><span className="private-note"><ShieldCheck size={15} /> Доступ по трек-коду</span></div>
          <form className="tracking-form" onSubmit={trackShipment}>
            <label className="sr-only" htmlFor="tracking-code">Трек-код</label><MapPin className="input-pin" size={19} />
            <input id="tracking-code" value={trackingInput} onChange={(event) => setTrackingInput(event.target.value)} placeholder="Например, CN7-4B21C3D9A82F6071E4B3" autoComplete="off" spellCheck={false} />
            <button type="submit" className="track-button"><Search size={17} /> Отследить</button>
          </form>
          {trackingMessage && <p className="inline-message" role="status">{trackingMessage}</p>}
          {shipment && <div className="shipment-result" aria-live="polite">
            <div className="shipment-meta">
              <div><span className="meta-label">ТРЕК-КОД</span><strong>{requestedCode}</strong></div>
              <div className="current-location"><span className="meta-label">ТЕКУЩИЙ СТАТУС</span><strong><span className="live-dot" />{shipmentStatuses[currentStatus]}</strong></div>
              <div className="eta"><span className="meta-label">СРОК ДОСТАВКИ</span><strong>{shipment.deliveryDays} дней</strong></div>
            </div>
            <div className="progress-track" aria-label={`Этап ${currentStatus + 1} из ${shipmentStatuses.length}`}>
              {shipmentStatuses.map((status, index) => <div className={`progress-step ${index < currentStatus ? 'is-done' : ''} ${index === currentStatus ? 'is-current' : ''}`} key={status}>
                <span className="step-node">{index < currentStatus ? <Check size={13} /> : index + 1}</span><span className="step-label">{status}</span>
              </div>)}
            </div>
            {shipment.isPaused && <p className="notice pause-notice"><Clock3 size={16} /> Обновление статуса временно приостановлено.</p>}
            {shipment.surcharge && <div className="notice surcharge-notice"><div><strong>Нужно доплатить €{Number(shipment.surcharge.amount).toFixed(2)}</strong><span>{shipment.surcharge.message || 'Свяжитесь с менеджером для уточнения деталей.'}</span></div><a href={telegramUrl} target="_blank" rel="noreferrer">Связаться <ChevronRight size={15} /></a></div>}
          </div>}
          {!requestedCode && !trackingMessage && <p className="tracking-hint"><CircleHelp size={15} /> Трек-код выдаёт менеджер после оформления заказа</p>}
        </section>

        <section className="actions-section" id="services" aria-label="Сервисы cargo7">
          <div className="section-heading"><div><p className="section-kicker">БЫСТРО И ПОНЯТНО</p><h2>Что хотите сделать?</h2></div><span className="heading-aside">选择服务 · Выберите сервис</span></div>
          <div className="action-grid">
            <a className="action-card order-card" href={telegramUrl} target="_blank" rel="noreferrer"><span className="action-icon"><MessageCircle size={22} /></span><span className="action-copy"><strong>Оформить заказ</strong><small>Менеджер поможет выкупить товар и рассчитать доставку</small></span><span className="action-arrow"><ArrowUpRight size={18} /></span><span className="action-index">01</span></a>
            <button className="action-card reviews-card" onClick={() => setReviewsOpen(true)}><span className="action-icon"><Star size={22} /></span><span className="action-copy"><strong>Отзывы клиентов</strong><small>Истории заказов и впечатления о доставке</small></span><span className="action-arrow"><ChevronRight size={18} /></span><span className="action-index">02</span></button>
          </div>
        </section>

        <section className="route-strip" aria-label="Маршрут доставки"><div className="route-label"><span className="route-flag">中</span><div><strong>Путь вашей посылки</strong><small>От склада в Китае до вашего города</small></div></div><div className="route-line"><span>Китай</span><i /><i /><i /><span>Беларусь</span></div><div className="route-promise"><BadgeCheck size={18} /><span>На связи<br /><strong>на каждом этапе</strong></span></div></section>
      </main>

      <footer className="site-footer"><a className="footer-brand" href="#top"><span className="brand-seal small-seal">货</span> cargo7</a><span>Доставка с заботой. 中国直达.</span><a href={telegramUrl} target="_blank" rel="noreferrer">@Cargo_managerr_blr <ArrowUpRight size={13} /></a></footer>

      {reviewsOpen && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setReviewsOpen(false) }}>
        <section className="reviews-modal" role="dialog" aria-modal="true" aria-labelledby="reviews-title">
          <div className="modal-heading"><div><p className="section-kicker">ОПЫТ НАШИХ КЛИЕНТОВ</p><h2 id="reviews-title">Отзывы</h2></div><button className="icon-button" onClick={() => setReviewsOpen(false)} aria-label="Закрыть"><X size={20} /></button></div>
          <div className="reviews-list">
            {!database && <p className="empty-reviews">Подключите Firebase, чтобы загрузить отзывы.</p>}
            {database && reviews.length === 0 && <p className="empty-reviews">Пока нет опубликованных отзывов.</p>}
            {reviews.map((review) => <article className="review-item" key={review.id}><div className="review-top"><strong>{review.author}</strong><span className="review-rating">{Array.from({ length: 5 }, (_, index) => <Star key={index} size={13} fill={index < review.rating ? 'currentColor' : 'none'} />)}</span></div><p>{review.text}</p>{review.createdAt && <time>{new Date(review.createdAt).toLocaleDateString('ru-RU')}</time>}</article>)}
          </div>
          <a className="modal-contact" href={telegramUrl} target="_blank" rel="noreferrer">Хотите поделиться отзывом? Напишите нам <ArrowUpRight size={15} /></a>
        </section>
      </div>}
    </div>
  )
}

export default App