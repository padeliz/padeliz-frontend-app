import { View, StyleSheet } from 'react-native';
import { List, Button, Divider } from 'react-native-paper';
import { GoogleUser } from '@/services/auth/google';
import { spacing } from '@/theme/spacing';

interface LinkedAccountsProps {
  accounts: GoogleUser[];
  onUnlink: (accountId: string) => void;
  onLinkNew: () => void;
}

export function LinkedAccounts({ accounts, onUnlink, onLinkNew }: LinkedAccountsProps) {
  return (
    <View style={styles.container}>
      <List.Section>
        <List.Subheader>Linked Google Accounts</List.Subheader>
        {accounts.map((account) => (
          <View key={account.id}>
            <List.Item
              title={account.email}
              description={account.id === accounts[0].id ? 'Primary Account' : 'Secondary Account'}
              left={(props) => <List.Icon {...props} icon="google" />}
              right={(props) =>
                account.id !== accounts[0].id && (
                  <Button
                    {...props}
                    onPress={() => onUnlink(account.id)}
                    mode="text"
                    compact
                  >
                    Unlink
                  </Button>
                )
              }
            />
            <Divider />
          </View>
        ))}
      </List.Section>
      <Button
        mode="outlined"
        onPress={onLinkNew}
        icon="plus"
        style={styles.addButton}
      >
        Link Another Account
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    marginTop: spacing.md,
  },
  addButton: {
    margin: spacing.md,
  },
});
