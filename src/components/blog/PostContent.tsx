import {
  documentToReactComponents,
  type Options,
} from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import type { Document } from "@contentful/rich-text-types";
import Image from "next/image";

const renderOptions: Options = {
  renderNode: {
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const { file, title } = node.data.target.fields;
      const url = `https:${file.url}`;
      const { width, height } = file.details.image;
      return (
        <figure className="my-8">
          <Image
            src={url}
            alt={title || ""}
            width={width}
            height={height}
            className="rounded-sm"
            sizes="(max-width: 768px) 100vw, 700px"
          />
          {title && (
            <figcaption className="mt-2 text-center text-sm text-[var(--color-gray-500)]">
              {title}
            </figcaption>
          )}
        </figure>
      );
    },
    [INLINES.HYPERLINK]: (node, children) => (
      <a
        href={node.data.uri}
        target="_blank"
        rel="noopener noreferrer"
        className="border-b border-transparent text-[var(--color-black)] transition-colors hover:border-[var(--color-gray-700)]"
      >
        {children}
      </a>
    ),
  },
};

export default function PostContent({ body }: { body: Document }) {
  return (
    <div className="prose mx-auto max-w-none">
      {documentToReactComponents(body, renderOptions)}
    </div>
  );
}
