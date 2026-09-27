export function Loading({
  size = "md",
}: {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  return (
    <>
      <span className={`"loading loading-ball loading-${size}`}></span>
    </>
  );
}
