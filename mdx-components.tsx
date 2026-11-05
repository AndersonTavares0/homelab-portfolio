import type { MDXComponents } from 'mdx/types';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    h2: (props) => <h2 className="case-heading" {...props} />,
    h3: (props) => <h3 className="case-subheading" {...props} />,
    a: (props) => <a className="case-link" {...props} />
  };
}
