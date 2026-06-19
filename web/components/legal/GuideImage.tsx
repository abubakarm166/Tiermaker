type GuideImageProps = {
  src: string;
  alt: string;
  featured?: boolean;
};

export default function GuideImage({ src, alt, featured = false }: GuideImageProps) {
  return (
    <figure className={featured ? "legal-featured-image" : "legal-inline-image"}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading={featured ? "eager" : "lazy"} />
    </figure>
  );
}
