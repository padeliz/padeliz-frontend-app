import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import StudentStatusModal from '@/components/Account/StudentStatusModal';
import { makeStudentProof } from '@/testing/fixtures';
import type { StudentProofsIndex } from '@/types/api';

function renderModal(
  data: StudentProofsIndex,
  overrides: Partial<React.ComponentProps<typeof StudentStatusModal>> = {}
) {
  const props: React.ComponentProps<typeof StudentStatusModal> = {
    visible: true,
    data,
    onClose: jest.fn(),
    onCta: jest.fn(),
    ...overrides,
  };
  return { ...render(<StudentStatusModal {...props} />), props };
}

describe('StudentStatusModal', () => {
  it('shows My Student Status / History tabs', () => {
    renderModal({ has_active: false, pending: null, items: [] });
    expect(screen.getByText('My Student Status')).toBeTruthy();
    expect(screen.getByText('History')).toBeTruthy();
  });

  it('uses See your pending proof when in review (including active + pending)', () => {
    const active = makeStudentProof({
      review_status: 'approved',
      student_until: '2027-08-20',
      submitted_at: 10,
    });
    const pending = makeStudentProof({
      id_player_student_proof: 4,
      ready_for_review: true,
      review_status: 'pending',
      submitted_at: 20,
    });
    const { props } = renderModal({
      has_active: true,
      pending,
      items: [pending, active],
    });

    fireEvent.press(screen.getByText('See your pending proof'));
    expect(props.onCta).toHaveBeenCalled();
  });

  it('uses Submit New Student Proof when there is prior submitted history', () => {
    const item = makeStudentProof({
      review_status: 'rejected',
      submitted_at: 10,
      student_until: null,
    });
    renderModal({ has_active: false, pending: null, items: [item] });
    expect(screen.getByText('Submit New Student Proof')).toBeTruthy();
  });

  it('uses Submit Student Proof for first-time', () => {
    renderModal({ has_active: false, pending: null, items: [] });
    expect(screen.getByText('Submit Student Proof')).toBeTruthy();
  });

  it('shows 3 history rows then Show more adds up to 2 and hides when exhausted', () => {
    const items = Array.from({ length: 6 }, (_, i) =>
      makeStudentProof({
        id_player_student_proof: i + 1,
        review_status: 'rejected',
        submitted_at: 10 + i,
        student_until: null,
      })
    );
    renderModal({ has_active: false, pending: null, items });
    fireEvent.press(screen.getByTestId('student-status-tab-history'));

    expect(screen.getByTestId('student-history-row-0')).toBeTruthy();
    expect(screen.getByTestId('student-history-row-2')).toBeTruthy();
    expect(screen.queryByTestId('student-history-row-3')).toBeNull();

    fireEvent.press(screen.getByTestId('student-history-show-more'));
    expect(screen.getByTestId('student-history-row-4')).toBeTruthy();
    expect(screen.queryByTestId('student-history-row-5')).toBeNull();

    fireEvent.press(screen.getByTestId('student-history-show-more'));
    expect(screen.getByTestId('student-history-row-5')).toBeTruthy();
    expect(screen.queryByTestId('student-history-show-more')).toBeNull();
  });
});
