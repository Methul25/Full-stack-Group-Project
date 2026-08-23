export default function Button({ variant = 'primary', size = 'md', className = '', children, ...rest }) {
  return <button className={`button button--${variant} button--${size} ${className}`} {...rest}>{children}</button>
}
