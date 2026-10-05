/**
 * Shared expo-router Jest mock. Always include the search-param hooks so screens
 * never see undefined exports.
 */

function createExpoRouterMock(overrides = {}) {
  return {
    usePathname: () => '/',
    useGlobalSearchParams: () => ({}),
    useLocalSearchParams: () => ({}),
    useNavigation: () => ({ canGoBack: () => true }),
    useRouter: () => ({
      push: jest.fn(),
      replace: jest.fn(),
      back: jest.fn(),
    }),
    Link: ({ children }) => children,
    Slot: () => null,
    Stack: () => null,
    Redirect: () => null,
    ...overrides,
  };
}

module.exports = {
  createExpoRouterMock,
};
