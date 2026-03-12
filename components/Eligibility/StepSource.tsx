import { View, Text, TextInput, StyleSheet } from 'react-native';
import OptionCard from './OptionCard';
import { InstagramIcon, TikTokIcon, FacebookIcon, FriendsIcon } from './SocialIcons';
import Button from '@/components/Buttons/Button';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import { EligibilityFormState, FormAction } from '@/app/event/eligibility-check';

type Props = {
  state: EligibilityFormState;
  dispatch: React.Dispatch<FormAction>;
};

const SOURCE_OPTIONS = [
  { id: 'instagram', label: 'Instagram', icon: <InstagramIcon size={20} color={Colors.WHITE} /> },
  { id: 'tiktok', label: 'TikTok', icon: <TikTokIcon size={20} color={Colors.WHITE} /> },
  { id: 'facebook', label: 'Facebook', icon: <FacebookIcon size={20} color={Colors.WHITE} /> },
  { id: 'friends', label: 'Friends', icon: <FriendsIcon size={20} color={Colors.WHITE} /> },
];

export default function StepSource({ state, dispatch }: Props) {
  const showFriends = state.discoverySources.includes('friends');
  const maxFriends = 3;
  const remaining = maxFriends - state.friendEmails.length;

  return (
    <View style={styles.container}>
      {/* Question */}
      <Text style={styles.heading}>How did you discover us?</Text>
      <Text style={styles.subtitle}>Select where you first heard about Padeliz</Text>

      {/* Source options */}
      <View style={styles.options}>
        {SOURCE_OPTIONS.map((option) => (
          <OptionCard
            key={option.id}
            label={option.label}
            checked={state.discoverySources.includes(option.id)}
            onToggle={() => dispatch({ type: 'TOGGLE_SOURCE', source: option.id })}
            icon={option.icon}
          />
        ))}
      </View>

      {/* Friends referral section */}
      {showFriends && (
        <View style={styles.friendsSection}>
          <Text style={styles.friendsHeading}>Who told you about this event?</Text>

          {state.friendEmails.map((email, index) => (
            <View key={index} style={styles.emailField}>
              <TextInput
                style={styles.emailInput}
                value={email}
                onChangeText={(text) =>
                  dispatch({ type: 'UPDATE_FRIEND_EMAIL', index, value: text })
                }
                placeholder="Enter friend's email"
                placeholderTextColor={Colors.INACTIVE}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          ))}

          {remaining > 0 && (
            <Button
              label={`Add Another Friend (${remaining} remaining)`}
              onPress={() => dispatch({ type: 'ADD_FRIEND_EMAIL' })}
              style={styles.addButton}
            />
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 15,
  },
  heading: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_2,
    lineHeight: 20,
    color: Colors.WHITE,
  },
  subtitle: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    lineHeight: 14,
    color: Colors.CREAM,
    marginTop: 12,
  },
  options: {
    marginTop: 24,
    gap: 12,
  },
  friendsSection: {
    marginTop: 32,
  },
  friendsHeading: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.HEADING_3,
    lineHeight: 18,
    color: Colors.WHITE,
    marginBottom: 16,
  },
  emailField: {
    height: 56,
    backgroundColor: Colors.WHITE_05,
    borderRadius: 8,
    justifyContent: 'center',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  emailInput: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
    padding: 0,
  },
  addButton: {
    backgroundColor: Colors.ORANGE,
    height: 48,
  },
});
