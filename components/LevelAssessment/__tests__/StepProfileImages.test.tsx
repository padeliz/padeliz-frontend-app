import React from 'react';
import { render, screen } from '@testing-library/react-native';
import StepProfileImages, {
  MAX_PROFILE_IMAGES,
} from '@/components/LevelAssessment/StepProfileImages';

describe('StepProfileImages', () => {
  it('renders Figma copy, example asset, and existing thumbs', () => {
    render(
      <StepProfileImages
        images={[
          {
            id: 9,
            url: 'https://cdn.example.test/storage/player-profile-images/1/a.png',
          },
        ]}
        onAdd={jest.fn()}
        onRemove={jest.fn()}
      />
    );

    expect(screen.getByText('We need clear picture with you')).toBeTruthy();
    expect(screen.getByTestId('profile-images-example')).toBeTruthy();
    expect(screen.getByText(`Upload ${MAX_PROFILE_IMAGES} avatar photos`)).toBeTruthy();
    expect(screen.queryByText(/Optional/i)).toBeNull();
    expect(screen.getByTestId('profile-image-9')).toBeTruthy();
    expect(screen.getByTestId('add-profile-image')).toBeTruthy();
  });

  it('keeps the upload slot visible with an in-slot loader while uploading', () => {
    render(
      <StepProfileImages
        images={[]}
        busy
        uploading
        onAdd={jest.fn()}
        onRemove={jest.fn()}
      />
    );

    expect(screen.getByTestId('add-profile-image')).toBeTruthy();
    expect(screen.getByTestId('add-profile-image-loading')).toBeTruthy();
  });

  it('hides the upload slot at the assessment max of 3', () => {
    render(
      <StepProfileImages
        images={[
          { id: 1, url: 'https://cdn.example/a.png' },
          { id: 2, url: 'https://cdn.example/b.png' },
          { id: 3, url: 'https://cdn.example/c.png' },
        ]}
        onAdd={jest.fn()}
        onRemove={jest.fn()}
      />
    );

    expect(screen.queryByTestId('add-profile-image')).toBeNull();
    expect(screen.getByTestId('profile-image-1')).toBeTruthy();
    expect(screen.getByTestId('profile-image-2')).toBeTruthy();
    expect(screen.getByTestId('profile-image-3')).toBeTruthy();
  });

  it('shows a busy spinner on the delete control while that image is deleting', () => {
    render(
      <StepProfileImages
        images={[{ id: 9, url: 'https://cdn.example/a.png' }]}
        busy
        deletingId={9}
        onAdd={jest.fn()}
        onRemove={jest.fn()}
      />
    );

    expect(screen.getByTestId('remove-profile-image-9')).toBeTruthy();
    const root = screen.UNSAFE_root;
    const spinners = root.findAll(
      (node) => (node.type as unknown) === 'ActivityIndicator'
    );
    expect(spinners.length).toBeGreaterThan(0);
  });
});
