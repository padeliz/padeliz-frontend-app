# Screen tests

Tests for `app/` screens live here instead of in `app/**/__tests__/`. Expo Router's
`require.context` over the app directory has no test-file exclusion, so any `.tsx`
under `app/` — including `__tests__` files — is registered as a route and bundled into
the app. Everything outside `app/` (services, context, components) keeps its tests
co-located in a sibling `__tests__/` directory.
