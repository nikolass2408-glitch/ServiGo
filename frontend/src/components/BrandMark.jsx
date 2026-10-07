export default function BrandMark({ size = 40, style }) {
  return (
    <img
      src="/servigo-mark.svg"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      style={{ display: 'block', width: size, height: size, flexShrink: 0, ...style }}
    />
  );
}