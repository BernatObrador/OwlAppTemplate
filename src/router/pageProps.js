import { useComponent } from "@odoo/owl";

/** Shared OWL validation schema. Extend it with { ...pageProps, custom: Type }. */
export const pageProps = Object.freeze({
  params: Object.freeze({ type: Object, optional: true }),
  query: Object.freeze({ type: Object, optional: true }),
  route: Object.freeze({ type: Object, optional: true }),
});

const empty = Object.freeze({});

/**
 * Project hook, called in setup(). Getters read the component's current props
 * after navigation; destructuring the result would capture an old reference.
 * In onWillUpdateProps, use nextProps for the pending update instead.
 */
export function usePageProps() {
  const component = useComponent();
  return Object.freeze({
    get params() { return component.props.params ?? empty; },
    get query() { return component.props.query ?? empty; },
    get route() { return component.props.route ?? null; },
  });
}
