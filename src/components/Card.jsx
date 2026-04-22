function Card({ children, className = '' }) {
  return (
    <article
      className={[
        'glass-panel-strong rounded-lg p-5 transition duration-300',
        'hover:-translate-y-1 hover:border-accent/35 hover:shadow-glass',
        className,
      ].join(' ')}
    >
      {children}
    </article>
  )
}

export default Card
