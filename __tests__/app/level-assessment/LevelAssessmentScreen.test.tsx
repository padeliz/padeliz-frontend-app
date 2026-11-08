import React from 'react';
import { Alert } from 'react-native';
import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { renderWithQueryClient } from '@/testing/renderWithQueryClient';
import { disposeTestQueryClient } from '@/testing/createTestQueryClient';
import LevelAssessmentScreen from '@/app/level-assessment';
import { makeAssessment, makePlayer } from '@/testing/fixtures';
import { mapPlayerToUser } from '@/services/authUser';
import { confirmAsync } from '@/services/confirm';
import type { Level, PlayerLevelAssessment } from '@/types/api';

const mockReplace = jest.fn();
const mockBack = jest.fn();
const mockDispatch = jest.fn();
const mockCanGoBack = jest.fn(() => true);
const beforeRemoveListeners: Array<(e: { preventDefault: () => void; data: { action: { type: string } } }) => void> = [];
let mockParams: Record<string, string> = {};

jest.mock('expo-router', () =>
  require('@/testing/expoRouterMock').createExpoRouterMock({
    useRouter: () => ({ push: jest.fn(), replace: mockReplace, back: mockBack }),
    useNavigation: () => ({
      canGoBack: mockCanGoBack,
      dispatch: mockDispatch,
      addListener: (event: string, cb: (e: unknown) => void) => {
        if (event === 'beforeRemove') {
          beforeRemoveListeners.push(cb as (typeof beforeRemoveListeners)[number]);
        }
        return () => undefined;
      },
    }),
    useLocalSearchParams: () => mockParams,
  })
);

jest.mock('@/context/auth', () => ({
  useAuth: () => ({ user: mockUser }),
}));
let mockUser: ReturnType<typeof mapPlayerToUser> | null = mapPlayerToUser(makePlayer());

const mockLoad = jest.fn();
const mockCreate = jest.fn();
const mockSave = jest.fn();
const mockReady = jest.fn();
const mockReopen = jest.fn();
const mockDiscard = jest.fn();
const mockUpload = jest.fn();
const mockDelete = jest.fn();
let mockUploadPending = false;
let mockDeletePending = false;
let mockDeleteVariables: { id: number } | undefined;
let mockLoadPending = false;

jest.mock('@/services/hooks/useLevelAssessment', () => ({
  useLoadAssessmentMutation: () => ({
    mutateAsync: mockLoad,
    get isPending() {
      return mockLoadPending;
    },
  }),
  useCreatePendingAssessmentMutation: () => ({ mutateAsync: mockCreate, isPending: false }),
  useSaveAssessmentMutation: () => ({
    mutateAsync: mockSave,
    isPending: false,
  }),
  useMarkAssessmentReadyMutation: () => ({ mutateAsync: mockReady, isPending: false }),
  useReopenAssessmentMutation: () => ({ mutateAsync: mockReopen, isPending: false }),
  useDiscardAssessmentMutation: () => ({ mutateAsync: mockDiscard, isPending: false }),
  useUploadAssessmentImageMutation: () => ({
    mutateAsync: mockUpload,
    get isPending() {
      return mockUploadPending;
    },
  }),
  useDeleteAssessmentImageMutation: () => ({
    mutateAsync: mockDelete,
    get isPending() {
      return mockDeletePending;
    },
    get variables() {
      return mockDeleteVariables;
    },
  }),
}));

const mockLevels: Level[] = [
  { id_level: 12, name: 'Division 2 Mid', level_min: '2.66', level_max: '2.34' },
];
jest.mock('@/services/hooks/useLevels', () => ({
  useLevels: () => ({ data: mockLevels, loading: false, error: null, refetch: jest.fn() }),
}));

jest.mock('@/services/confirm', () => ({
  confirmAsync: jest.fn(async () => true),
  confirmDirtyLeaveAsync: jest.requireActual('@/services/confirm').confirmDirtyLeaveAsync,
}));

jest.mock('expo-image-picker', () => ({
  launchImageLibraryAsync: jest.fn(async () => ({
    canceled: false,
    assets: [{ uri: 'file:///tmp/avatar.jpg' }],
  })),
}));

function renderScreen() {
  return (() => {
    const r = renderWithQueryClient(<LevelAssessmentScreen />);
    testClient = r.client;
    return r;
  })();
}

async function renderDraft(assessment: PlayerLevelAssessment = makeAssessment()) {
  mockLoad.mockResolvedValue(assessment);
  renderScreen();
  await waitFor(() => {
    expect(mockLoad).toHaveBeenCalled();
    expect(screen.getByTestId('step-racket-experience')).toBeTruthy();
  });
}

function fillValidPadel(matches = '40') {
  fireEvent.press(screen.getByText('Padel'));
  fireEvent.press(screen.getByTestId('racket-padel-level'));
  fireEvent.press(screen.getByTestId('racket-padel-level-option-advanced'));
  fireEvent.changeText(screen.getByTestId('racket-padel-matches_played'), matches);
}

function chooseAlert(label: string) {
  (Alert.alert as jest.Mock).mockImplementation((_t, _m, buttons) => {
    const btn = buttons.find((b: { text: string }) => b.text === label);
    btn?.onPress?.();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  beforeRemoveListeners.length = 0;
  mockParams = {};
  mockUser = mapPlayerToUser(makePlayer());
  mockCanGoBack.mockReturnValue(true);
  mockUploadPending = false;
  mockDeletePending = false;
  mockDeleteVariables = undefined;
  mockLoadPending = false;
  mockLoad.mockResolvedValue(makeAssessment());
  mockSave.mockImplementation(async ({ customFields }: { customFields: unknown }) =>
    makeAssessment()
  );
  mockReady.mockImplementation(async () => makeAssessment({ ready_for_review: true }));
  mockCreate.mockImplementation(async () => makeAssessment());
  mockReopen.mockImplementation(async () => makeAssessment());
  mockDiscard.mockImplementation(async () => undefined);
  mockUpload.mockImplementation(async () =>
    makeAssessment({
      profile_images: [{ id: 1, url: 'https://cdn.example/a.png' }],
    })
  );
  mockDelete.mockImplementation(async () => makeAssessment({ profile_images: [] }));
  (confirmAsync as jest.Mock).mockResolvedValue(true);
  jest.spyOn(Alert, 'alert').mockImplementation(jest.fn());
});
let testClient: ReturnType<typeof renderWithQueryClient>['client'] | null = null;
afterEach(async () => {
  if (testClient) await disposeTestQueryClient(testClient);
  testClient = null;
  jest.restoreAllMocks();
});

describe('Level assessment screen', () => {
  it('loads latest (or creates) exactly once', async () => {
    await renderDraft();
    expect(mockLoad).toHaveBeenCalledTimes(1);
  });

  it('opens editable drafts on Sports', async () => {
    await renderDraft();
    expect(screen.getByTestId('step-racket-experience')).toBeTruthy();
    expect(screen.getByTestId('step-forward')).toBeTruthy();
  });

  it('opens ready-for-review on Status without bottom StepNavButtons', async () => {
    mockLoad.mockResolvedValue(makeAssessment({ ready_for_review: true }));
    renderScreen();

    await screen.findByTestId('assessment-status');
    expect(screen.queryByTestId('step-forward')).toBeNull();
    expect(screen.getByTestId('assessment-reopen')).toBeTruthy();
  });

  it('reopens a ready assessment into an editable Sports step after confirm', async () => {
    mockLoad.mockResolvedValue(makeAssessment({ ready_for_review: true }));
    mockReopen.mockResolvedValue(makeAssessment());
    renderScreen();

    fireEvent.press(await screen.findByTestId('assessment-reopen'));

    await screen.findByTestId('step-racket-experience');
    expect(confirmAsync).toHaveBeenCalled();
    expect(mockReopen).toHaveBeenCalledTimes(1);
  });

  it('shows review_message for approved assessments and offers Create new', async () => {
    mockLoad.mockResolvedValue(
      makeAssessment({
        review_status: 'approved',
        ready_for_review: false,
        review_message: 'Welcome to Division 3',
      })
    );
    renderScreen();

    await screen.findByTestId('assessment-review-message');
    expect(screen.getByText('Welcome to Division 3')).toBeTruthy();
    expect(screen.getByTestId('assessment-create-new')).toBeTruthy();
    expect(screen.queryByTestId('assessment-reopen')).toBeNull();
  });

  it('hides review_message when pending/ready/discarded or empty', async () => {
    mockLoad.mockResolvedValue(
      makeAssessment({
        review_status: 'discarded',
        ready_for_review: false,
        review_message: 'Should stay hidden',
      })
    );
    renderScreen();
    await screen.findByTestId('assessment-status');
    expect(screen.queryByTestId('assessment-review-message')).toBeNull();
  });

  it('Create new assessment posts pending and opens Sports', async () => {
    mockLoad.mockResolvedValue(
      makeAssessment({ review_status: 'rejected', ready_for_review: false })
    );
    mockCreate.mockResolvedValue(makeAssessment());
    renderScreen();

    fireEvent.press(await screen.findByTestId('assessment-create-new'));
    await screen.findByTestId('step-racket-experience');
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it('submits for review from Status after confirm (not bottom nav)', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-4'));
    await screen.findByTestId('assessment-submit-for-review');
    expect(screen.queryByTestId('step-forward')).toBeNull();

    fireEvent.press(screen.getByTestId('assessment-submit-for-review'));
    await waitFor(() => expect(mockReady).toHaveBeenCalledTimes(1));
    expect(confirmAsync).toHaveBeenCalled();
  });

  it('cancelling submit confirm does not call the API', async () => {
    (confirmAsync as jest.Mock).mockResolvedValueOnce(false);
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-4'));
    fireEvent.press(await screen.findByTestId('assessment-submit-for-review'));
    await waitFor(() => expect(confirmAsync).toHaveBeenCalled());
    expect(mockReady).not.toHaveBeenCalled();
  });

  it('discards via the discard endpoint after confirm and leaves', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-4'));
    fireEvent.press(await screen.findByTestId('assessment-discard'));
    await waitFor(() => expect(mockDiscard).toHaveBeenCalledTimes(1));
    expect(mockBack).toHaveBeenCalled();
  });

  it('idle clean Finish later leaves immediately without discarding', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-4'));
    expect(screen.getByText('Finish it later')).toBeTruthy();
    fireEvent.press(await screen.findByTestId('assessment-finish-later'));
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockDiscard).not.toHaveBeenCalled();
    expect(mockBack).toHaveBeenCalled();
  });

  it('shows Close on Status for locked ready-for-review assessments', async () => {
    mockLoad.mockResolvedValue(makeAssessment({ ready_for_review: true }));
    renderScreen();
    await screen.findByTestId('assessment-status');
    expect(screen.getByText('Close')).toBeTruthy();
    expect(screen.queryByText('Finish it later')).toBeNull();
  });

  it('shows Close on Status for terminal assessments', async () => {
    mockLoad.mockResolvedValue(
      makeAssessment({ review_status: 'approved', ready_for_review: false })
    );
    renderScreen();
    await screen.findByTestId('assessment-status');
    expect(screen.getByText('Close')).toBeTruthy();
    expect(screen.queryByText('Finish it later')).toBeNull();
  });

  it('empty-stack leave with eventId replaces event detail', async () => {
    mockParams = { eventId: '42' };
    mockCanGoBack.mockReturnValue(false);
    mockLoad.mockResolvedValue(makeAssessment({ ready_for_review: true }));
    renderScreen();
    await screen.findByTestId('assessment-status');
    fireEvent.press(screen.getByTestId('assessment-finish-later'));
    expect(mockReplace).toHaveBeenCalledWith('/event/42');
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('empty-stack leave without eventId replaces Account', async () => {
    mockParams = {};
    mockCanGoBack.mockReturnValue(false);
    mockLoad.mockResolvedValue(makeAssessment({ ready_for_review: true }));
    renderScreen();
    await screen.findByTestId('assessment-status');
    fireEvent.press(screen.getByTestId('assessment-finish-later'));
    expect(mockReplace).toHaveBeenCalledWith('/(tabs)/account');
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('navigates clean top steps without saving', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-2'));
    await screen.findByTestId('step-about-you');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('dirty valid leave shows stepper loader and navigates before PATCH resolves', async () => {
    let resolveSave!: (value: unknown) => void;
    mockSave.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveSave = resolve;
        })
    );
    await renderDraft();
    fillValidPadel();
    fireEvent.press(screen.getByTestId('wizard-step-2'));

    expect(await screen.findByTestId('wizard-step-1-loading')).toBeTruthy();
    expect(await screen.findByTestId('step-about-you')).toBeTruthy();
    expect(screen.queryByTestId('step-forward-loading')).toBeNull();
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        customFields: {
          racket_experience: [{ sport: 'padel', level: 'advanced', matches_played: 40 }],
        },
        signal: expect.any(AbortSignal),
      })
    );

    await act(async () => {
      resolveSave(makeAssessment());
    });
    await waitFor(() => expect(screen.queryByTestId('wizard-step-1-loading')).toBeNull());
  });

  it('keeps Continue pressable while a background save is in flight', async () => {
    mockSave.mockImplementation(() => new Promise(() => undefined));
    await renderDraft();
    fillValidPadel();
    fireEvent.press(screen.getByTestId('step-forward'));
    await screen.findByTestId('step-about-you');
    expect(screen.getByTestId('step-forward')).toBeTruthy();
    expect(screen.queryByTestId('step-forward-loading')).toBeNull();
  });

  it('continues from Photo to Status', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-3'));
    await screen.findByTestId('step-profile-images');
    fireEvent.press(screen.getByTestId('step-forward'));
    await screen.findByTestId('assessment-status');
  });

  it('saves big_tournament_division as an integer level id', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-2'));
    await screen.findByTestId('step-about-you');
    fireEvent.press(screen.getByTestId('field-big-tournament-division'));
    fireEvent.press(screen.getByTestId('field-big-tournament-division-option-12'));
    fireEvent.press(screen.getByTestId('wizard-step-3'));
    await waitFor(() => expect(mockSave).toHaveBeenCalled());
    expect(mockSave).toHaveBeenCalledWith(
      expect.objectContaining({
        customFields: { big_tournament_division: 12 },
      })
    );
  });

  it('does not checkmark empty previous Sports when navigating to Details', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-2'));
    await screen.findByTestId('step-about-you');
    expect(
      screen.UNSAFE_root.findAll(
        (node) =>
          (node.type as unknown) === 'MaterialCommunityIcons' &&
          node.props.name === 'check'
      )
    ).toHaveLength(0);
  });

  it('checkmarks Sports when hydrated with valid racket content', async () => {
    await renderDraft(
      makeAssessment({
        submission: {
          id_player_custom_field_submission: 77,
          values: [
            {
              id_player_custom_field_value: 1,
              player_custom_field_id: 1,
              field: { id_player_custom_field: 1, code: 'racket_experience' },
              value: [{ sport: 'padel', level: 'advanced', matches_played: 40 }],
            },
          ],
        },
      })
    );
    fireEvent.press(screen.getByTestId('wizard-step-2'));
    await screen.findByTestId('step-about-you');
    expect(
      screen.UNSAFE_root.findAll(
        (node) =>
          (node.type as unknown) === 'MaterialCommunityIcons' &&
          node.props.name === 'check'
      ).length
    ).toBeGreaterThanOrEqual(1);
  });

  it('idle clean top-left back leaves the wizard immediately', async () => {
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-2'));
    await screen.findByTestId('step-about-you');
    fireEvent.press(screen.getByTestId('screen-header-back'));
    expect(Alert.alert).not.toHaveBeenCalled();
    expect(mockBack).toHaveBeenCalled();
  });

  it('dirty top-left back offers Leave without saving / Save & leave / Continue editing', async () => {
    await renderDraft();
    fireEvent.press(screen.getByText('Padel'));
    chooseAlert('Continue editing');
    fireEvent.press(screen.getByTestId('screen-header-back'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
    const buttons = (Alert.alert as jest.Mock).mock.calls[0][2] as { text: string }[];
    expect(buttons.map((b) => b.text)).toEqual([
      'Leave without saving',
      'Save & leave',
      'Continue editing',
    ]);
    expect(mockBack).not.toHaveBeenCalled();
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('dirty Save & leave PATCHes then leaves', async () => {
    await renderDraft();
    fillValidPadel('10');
    chooseAlert('Save & leave');
    fireEvent.press(screen.getByTestId('screen-header-back'));
    await waitFor(() => expect(mockSave).toHaveBeenCalled());
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
  });

  it('Leave without saving leaves while a PATCH is still pending without aborting leave path', async () => {
    mockSave.mockImplementation(() => new Promise(() => undefined));
    await renderDraft();
    fillValidPadel();
    fireEvent.press(screen.getByTestId('step-forward'));
    await screen.findByTestId('wizard-step-1-loading');
    chooseAlert('Leave without saving');
    fireEvent.press(screen.getByTestId('screen-header-back'));
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
    const signal = mockSave.mock.calls[0][0].signal as AbortSignal;
    expect(signal.aborted).toBe(false);
  });

  it('busy clean leave alert uses pending-saves copy', async () => {
    mockUpload.mockImplementation(() => new Promise(() => undefined));
    await renderDraft();
    fireEvent.press(screen.getByTestId('wizard-step-3'));
    await screen.findByTestId('step-profile-images');
    fireEvent.press(screen.getByTestId('add-profile-image'));
    await screen.findByTestId('wizard-step-3-loading');
    fireEvent.press(screen.getByTestId('wizard-step-2'));
    await screen.findByTestId('step-about-you');
    chooseAlert('Continue editing');
    fireEvent.press(screen.getByTestId('screen-header-back'));
    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
    expect((Alert.alert as jest.Mock).mock.calls[0][0]).toBe('Saves in progress');
    expect((Alert.alert as jest.Mock).mock.calls[0][1]).toMatch(/still saving/i);
  });

  it('blocks invalid dirty sports before navigating', async () => {
    await renderDraft();
    fireEvent.press(screen.getByText('Padel'));
    fireEvent.press(screen.getByTestId('wizard-step-2'));
    await screen.findByTestId('racket-padel-error');
    expect(mockSave).not.toHaveBeenCalled();
  });

  it('failed PATCH shows X and banner only on the failed step', async () => {
    mockSave.mockRejectedValueOnce(new Error('save failed'));
    await renderDraft();
    fillValidPadel();
    fireEvent.press(screen.getByTestId('step-forward'));
    await screen.findByTestId('step-about-you');
    await waitFor(() => expect(screen.getByTestId('wizard-step-1-error')).toBeTruthy());
    expect(screen.queryByTestId('step-1-error-banner')).toBeNull();

    fireEvent.press(screen.getByTestId('wizard-step-1'));
    await screen.findByTestId('step-racket-experience');
    expect(await screen.findByTestId('step-1-error-banner')).toBeTruthy();
    expect(screen.getByText('Something went wrong. Please try again.')).toBeTruthy();
  });

  it('superseding save aborts the prior request without showing X', async () => {
    const signals: AbortSignal[] = [];
    mockSave.mockImplementation(
      ({ signal }: { signal: AbortSignal }) =>
        new Promise((_resolve, reject) => {
          signals.push(signal);
          signal.addEventListener('abort', () => {
            const err = new Error('aborted');
            err.name = 'AbortError';
            reject(err);
          });
        })
    );
    await renderDraft();
    fillValidPadel('10');
    fireEvent.press(screen.getByTestId('step-forward'));
    await screen.findByTestId('step-about-you');
    fireEvent.press(screen.getByTestId('wizard-step-1'));
    await screen.findByTestId('step-racket-experience');
    fireEvent.changeText(screen.getByTestId('racket-padel-matches_played'), '99');
    fireEvent.press(screen.getByTestId('step-forward'));
    await waitFor(() => expect(signals.length).toBeGreaterThanOrEqual(2));
    expect(signals[0].aborted).toBe(true);
    expect(screen.queryByTestId('wizard-step-1-error')).toBeNull();
  });

  it('disables Submit while a step spinner is active and allows it when only X remains', async () => {
    let rejectSave!: (e: Error) => void;
    mockSave.mockImplementation(
      () =>
        new Promise((_resolve, reject) => {
          rejectSave = reject;
        })
    );
    await renderDraft();
    fillValidPadel();
    fireEvent.press(screen.getByTestId('step-forward'));
    await screen.findByTestId('wizard-step-1-loading');
    fireEvent.press(screen.getByTestId('wizard-step-4'));
    await screen.findByTestId('assessment-submit-for-review');
    expect(screen.getByTestId('assessment-submit-for-review').props.accessibilityState.disabled).toBe(
      true
    );

    await act(async () => {
      rejectSave(new Error('nope'));
    });
    await waitFor(() => expect(screen.getByTestId('wizard-step-1-error')).toBeTruthy());
    expect(screen.getByTestId('assessment-submit-for-review').props.accessibilityState.disabled).toBe(
      false
    );
  });

  it('OS beforeRemove uses the same leave policy when dirty', async () => {
    await renderDraft();
    fillValidPadel();
    expect(beforeRemoveListeners.length).toBeGreaterThan(0);
    chooseAlert('Continue editing');
    const preventDefault = jest.fn();
    beforeRemoveListeners[0]({
      preventDefault,
      data: { action: { type: 'GO_BACK' } },
    });
    await waitFor(() => expect(Alert.alert).toHaveBeenCalled());
    expect(preventDefault).toHaveBeenCalled();
    expect(mockBack).not.toHaveBeenCalled();
  });

  it('Save & leave flushes a dirty non-current step before leaving', async () => {
    mockSave
      .mockRejectedValueOnce(new Error('sports failed'))
      .mockResolvedValue(makeAssessment());
    await renderDraft();
    fillValidPadel();
    fireEvent.press(screen.getByTestId('step-forward'));
    await screen.findByTestId('step-about-you');
    await waitFor(() => expect(screen.getByTestId('wizard-step-1-error')).toBeTruthy());

    fireEvent.press(screen.getByTestId('wizard-step-4'));
    await screen.findByTestId('assessment-status');
    chooseAlert('Save & leave');
    fireEvent.press(screen.getByTestId('assessment-finish-later'));
    await waitFor(() => expect(mockSave.mock.calls.length).toBeGreaterThanOrEqual(2));
    await waitFor(() => expect(mockBack).toHaveBeenCalled());
  });

  it('does not ask for names or phone (Account-only)', async () => {
    await renderDraft();
    expect(screen.queryByText(/phone/i)).toBeNull();
    expect(screen.queryByText(/first name/i)).toBeNull();
  });

  it('offers a retry when the assessment cannot be loaded', async () => {
    mockLoad.mockRejectedValueOnce(new Error('boom'));
    mockLoad.mockResolvedValueOnce(makeAssessment());
    renderScreen();

    fireEvent.press(await screen.findByTestId('assessment-retry'));
    await screen.findByTestId('assessment-wizard');
    expect(mockLoad).toHaveBeenCalledTimes(2);
  });
});
