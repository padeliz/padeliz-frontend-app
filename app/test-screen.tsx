import { View, Text, Image, StyleSheet, SafeAreaView, ScrollView, Pressable, useWindowDimensions } from 'react-native';
import { useState } from 'react';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import * as Colors from '@/constants/Colors';
import * as Fonts from '@/constants/Fonts';
import Button from '@/components/Buttons/Button';
import Input from '@/components/Misc/Input';
import Card from '@/components/Visuals/Card';
import ScreenHeader from '@/components/Navigation/ScreenHeader';
import StatusBanner from '@/components/Feedback/StatusBanner';
import Toggle from '@/components/Feedback/Toggle';
import Steps from '@/components/Visuals/Steps';
import FilterBar from '@/components/Navigation/FilterBar';
import ILLUS_NO_MESSAGES from '@/assets/images/illustrations/illus-no-messages.png';
import ILLUS_WELCOME from '@/assets/images/illustrations/illus-welcome.png';


// ── Local spacing / color constants ────────────────────────────────────────
const SECTION_GAP    = 32;
const ITEM_GAP       = 12;
const H_PAD          = 16;
const SUB_CARD_BG    = 'rgba(88,101,242,0.1)';
const SUB_LABEL_CLR  = 'rgba(220,221,222,0.6)';
const BODY_DIM_80    = 'rgba(220,221,222,0.8)';
const DARK_DIM_80    = 'rgba(47,49,54,0.8)';

// ── Local helper components ────────────────────────────────────────────────

function SectionTitle({ title }: { title: string }) {
  return <Text style={sectionStyles.title}>{title}</Text>;
}

function SubCard({ children }: { children: React.ReactNode }) {
  return <View style={sectionStyles.subCard}>{children}</View>;
}

function DarkSubCard({ children }: { children: React.ReactNode }) {
  return <View style={sectionStyles.darkSubCard}>{children}</View>;
}

// ── Screen ─────────────────────────────────────────────────────────────────

export default function TestScreen() {
  const [inputValue, setInputValue]   = useState('');
  const [toggleOn,      setToggleOn]      = useState(false);
  const [activeFilter,  setActiveFilter]  = useState(0);
  const { width }                     = useWindowDimensions();
  const swatchWidth                   = (width - H_PAD * 2 - ITEM_GAP) / 2;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* ── 1. Typography ── */}
        <View style={styles.section}>
          <SectionTitle title="Typography" />

          {/* Font Family */}
          <SubCard>
            <Text style={typoStyles.cardLabel}>Font Family</Text>
            <Text style={typoStyles.body}>Inter - Clean, modern sans-serif font family</Text>
          </SubCard>

          {/* Headings */}
          <SubCard>
            <Text style={typoStyles.subLabel}>Heading 1 - Large Bold (24-28px)</Text>
            <Text style={[typoStyles.h1, { marginBottom: ITEM_GAP }]}>Welcome to Padeliz</Text>
            <Text style={typoStyles.subLabel}>Heading 2 - Medium (20-22px)</Text>
            <Text style={[typoStyles.h2, { marginBottom: ITEM_GAP }]}>Upcoming Events</Text>
            <Text style={typoStyles.subLabel}>Heading 3 - Small (18px)</Text>
            <Text style={typoStyles.h3}>Section Title</Text>
          </SubCard>

          {/* Body Text */}
          <SubCard>
            <Text style={typoStyles.cardLabel}>Body Text</Text>
            <Text style={typoStyles.subLabel}>Regular (16px)</Text>
            <Text style={[typoStyles.bodyRegular, { marginBottom: ITEM_GAP }]}>
              This is the main body text used for content and descriptions. It should be easily readable and have good contrast.
            </Text>
            <Text style={typoStyles.subLabel}>Small (14px)</Text>
            <Text style={[typoStyles.bodySmall, { marginBottom: ITEM_GAP }]}>
              This smaller text is used for secondary information, captions, and supporting content.
            </Text>
            <Text style={typoStyles.subLabel}>Extra Small (12px)</Text>
            <Text style={typoStyles.bodyXS}>
              Used for timestamps, metadata, and other minor details.
            </Text>
          </SubCard>

          {/* Font Weights */}
          <SubCard>
            <Text style={typoStyles.cardLabel}>Font Weights</Text>
            <View style={{ marginBottom: ITEM_GAP }}>
              <Text style={typoStyles.subLabel}>Bold (700)</Text>
              <Text style={[typoStyles.body, { fontFamily: Fonts.FONT_BOLD, color: Colors.WHITE }]}>Used for headings and emphasis</Text>
            </View>
            <View style={{ marginBottom: ITEM_GAP }}>
              <Text style={typoStyles.subLabel}>Medium (500)</Text>
              <Text style={[typoStyles.body, { fontFamily: Fonts.FONT_MEDIUM, color: Colors.WHITE }]}>Used for buttons and sub-headings</Text>
            </View>
            <View>
              <Text style={typoStyles.subLabel}>Regular (400)</Text>
              <Text style={[typoStyles.body, { fontFamily: Fonts.FONT_REGULAR, color: Colors.WHITE }]}>Used for body text and general content</Text>
            </View>
          </SubCard>

          {/* Text Colors */}
          <SubCard>
            <Text style={typoStyles.cardLabel}>Text Colors</Text>
            <Text style={[typoStyles.colorSample, { color: Colors.WHITE,  marginBottom: ITEM_GAP }]}>Primary Text (#FFFFFF)</Text>
            <Text style={[typoStyles.colorSample, { color: Colors.CREAM,  marginBottom: ITEM_GAP }]}>Secondary Text (#DCDDDE)</Text>
            <Text style={[typoStyles.colorSample, { color: SUB_LABEL_CLR, marginBottom: ITEM_GAP }]}>Disabled Text (60% opacity)</Text>
            <Text style={[typoStyles.colorSample, { color: Colors.BLUE }]}>Brand Text (#5865F2)</Text>
          </SubCard>
        </View>

        {/* ── 2. Color Palette ── */}
        <View style={styles.section}>
          <SectionTitle title="Color Palette" />
          <View style={paletteStyles.grid}>
            {[
              { hex: Colors.BLUE,      label: '#5865F2', textColor: Colors.WHITE,     border: undefined },
              { hex: Colors.WHITE,     label: '#FFFFFF',  textColor: Colors.DARK_GRAY, border: undefined },
              { hex: Colors.CREAM,     label: '#DCDDDE',  textColor: Colors.DARK_GRAY, border: undefined },
              { hex: Colors.DARK_GRAY, label: '#2F3136',  textColor: Colors.WHITE,     border: Colors.CREAM_10 },
              { hex: Colors.GREEN,     label: '#3BA55C',  textColor: Colors.WHITE,     border: undefined },
              { hex: Colors.RED,       label: '#ED4245',  textColor: Colors.WHITE,     border: undefined },
            ].map(({ hex, label, textColor, border }) => (
              <View
                key={label}
                style={[
                  paletteStyles.swatch,
                  { backgroundColor: hex, width: swatchWidth },
                  border ? { borderWidth: 1, borderColor: border } : undefined,
                ]}
              >
                <Text style={[paletteStyles.swatchLabel, { color: textColor }]}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 3. Buttons ── */}
        <View style={styles.section}>
          <SectionTitle title="Buttons" />
          <Button label="Primary Button"   variant="primary"   style={{ marginBottom: ITEM_GAP }} />
          <Button label="Secondary Button" variant="secondary" style={{ marginBottom: ITEM_GAP }} />
          <Button label="Disabled Button"  variant="disabled" />
        </View>

        {/* ── 4. Input Fields ── */}
        <View style={styles.section}>
          <SectionTitle title="Input Fields" />
          <Input
            placeholder="Regular input"
            value={inputValue}
            onChangeText={setInputValue}
            style={{ marginBottom: ITEM_GAP }}
          />
          <Input
            placeholder="Input with icon"
            value={inputValue}
            onChangeText={setInputValue}
            icon="magnify"
          />
        </View>

        {/* ── 5. Cards ── */}
        <View style={styles.section}>
          <SectionTitle title="Cards" />
          <Card variant="light" style={{ marginBottom: ITEM_GAP }}>
            <Text style={cardStyles.lightTitle}>Light Card</Text>
            <Text style={[cardStyles.desc, { color: DARK_DIM_80, marginBottom: 16 }]}>
              This is a sample card with light background.
            </Text>
            <Button label="Action" style={{ width: 82, height: 40 }} />
          </Card>
          <Card variant="dark">
            <Text style={cardStyles.darkTitle}>Dark Card</Text>
            <Text style={[cardStyles.desc, { color: BODY_DIM_80, marginBottom: 16 }]}>
              This is a sample card with dark background.
            </Text>
            <Button label="Action" style={{ width: 82, height: 40 }} />
          </Card>
        </View>

        {/* ── 6. Icons ── */}
        <View style={styles.section}>
          <SectionTitle title="Icons" />
          <View style={iconStyles.row}>
            {[
              { name: 'home'     as const, label: 'Home',          color: Colors.CREAM },
              { name: 'calendar' as const, label: 'Calendar',      color: Colors.CREAM },
              { name: 'bell'     as const, label: 'Notifications', color: Colors.CREAM },
              { name: 'account'  as const, label: 'Profile',       color: Colors.CREAM },
            ].map(({ name, label, color }) => (
              <View key={name} style={iconStyles.item}>
                <MaterialCommunityIcons name={name} size={24} color={color} />
                <Text style={[iconStyles.label, { color }]}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ── 7. Navigation ── */}
        <View style={styles.section}>
          <SectionTitle title="Navigation" />
          <ScreenHeader
            title="Root Title"
            variant="root"
            style={{ marginBottom: ITEM_GAP }}
          />
          <ScreenHeader
            title="Stack Title"
            variant="stack"
            onBack={() => {}}
            style={{ marginBottom: ITEM_GAP }}
          />
          <ScreenHeader
            title="With Actions"
            variant="stack"
            onBack={() => {}}
            rightAction={<MaterialCommunityIcons name="dots-vertical" size={18} color={Colors.WHITE} />}
            style={{ marginBottom: ITEM_GAP }}
          />
          {/* Bottom tab bar preview */}
          <DarkSubCard>
            <View style={navStyles.tabRow}>
              {[
                { name: 'home'   as const, label: 'Home',    active: true  },
                { name: 'magnify' as const, label: 'Search',  active: false },
                { name: 'bell'   as const, label: 'Alerts',  active: false, dot: true },
                { name: 'account' as const, label: 'Profile', active: false },
              ].map(({ name, label, active, dot }) => {
                const color = active ? Colors.BLUE : Colors.CREAM;
                return (
                  <View key={name} style={navStyles.tabItem}>
                    <View>
                      <MaterialCommunityIcons name={name} size={16} color={color} />
                      {dot && <View style={navStyles.redDot} />}
                    </View>
                    <Text style={[navStyles.tabItemLabel, { color }]}>{label}</Text>
                  </View>
                );
              })}
            </View>
          </DarkSubCard>
        </View>

        {/* ── 8. Illustrations ── */}
        <View style={styles.section}>
          <SectionTitle title="Illustrations" />
          <Card variant="dark" style={{ marginBottom: ITEM_GAP }}>
            <Image source={ILLUS_NO_MESSAGES} style={illusStyles.image} />
            <Text style={illusStyles.title}>No Messages Yet</Text>
            <Text style={illusStyles.desc}>Start a conversation or join a game to connect with other players</Text>
            <Button label="Find Players" style={illusStyles.cta} />
          </Card>
          <Card variant="dark">
            <Image source={ILLUS_WELCOME} style={illusStyles.image} />
            <Text style={illusStyles.title}>Welcome to Padeliz!</Text>
            <Text style={illusStyles.desc}>Find players, book courts, and join the padel community</Text>
            <Button label="Get Started" style={illusStyles.cta} />
          </Card>
        </View>

        {/* ── 9. Spacing System ── */}
        <View style={styles.section}>
          <SectionTitle title="Spacing System" />
          <DarkSubCard>
            <Text style={spacingStyles.cardLabel}>Spacing Scale</Text>
            {[
              { w: 32,  label: '8px - Base Unit' },
              { w: 64,  label: '16px - Standard' },
              { w: 96,  label: '24px - Medium' },
              { w: 128, label: '32px - Large' },
            ].map(({ w, label }, i) => (
              <View key={label} style={[spacingStyles.row, i < 3 ? { marginBottom: 8 } : undefined]}>
                <View style={[spacingStyles.block, { width: w }]} />
                <Text style={spacingStyles.rowLabel}>{label}</Text>
              </View>
            ))}
          </DarkSubCard>
        </View>

        {/* ── 10. Interactive Elements ── */}
        <View style={styles.section}>
          <SectionTitle title="Interactive Elements" />
          <Button label="Hover & Active States" style={{ marginBottom: ITEM_GAP }} />
          <Toggle label="Toggle Feature" value={toggleOn} onValueChange={setToggleOn} style={{ marginBottom: ITEM_GAP }} />
          <StatusBanner variant="success" message="Action completed successfully" style={{ marginBottom: ITEM_GAP }} />
          <StatusBanner variant="warning" message="Please pay attention"          style={{ marginBottom: ITEM_GAP }} />
          <StatusBanner variant="error"   message="Something went wrong"          style={{ marginBottom: ITEM_GAP }} />
          <StatusBanner variant="loading" message="Loading..." />
        </View>

        {/* ── 11. Steps ── */}
        <View style={styles.section}>
          <SectionTitle title="Steps" />
          <DarkSubCard>
            <Steps labels={['Source', 'Sports', 'Details', 'Photo', 'Status']} currentStep={5} />
          </DarkSubCard>
          <DarkSubCard>
            <Steps labels={['Source', 'Sports', 'Details', 'Photo', 'Status']} currentStep={3} />
          </DarkSubCard>
        </View>

        {/* ── 12. Filters ── */}
        <View style={styles.section}>
          <SectionTitle title="Filters" />
          <FilterBar
            options={[
              { label: 'Upcoming' },
              { label: 'Ongoing', count: 2 },
              { label: 'Past' },
            ]}
            selectedIndex={activeFilter}
            onSelect={setActiveFilter}
          />
        </View>

        {/* ── 13. Accessibility ── */}
        <View style={[styles.section, { marginBottom: SECTION_GAP }]}>
          <SectionTitle title="Accessibility" />

          {/* Touch Targets */}
          <DarkSubCard>
            <Text style={a11yStyles.cardLabel}>Touch Targets</Text>
            <View style={a11yStyles.touchRow}>
              {(['plus', 'heart', 'share-variant'] as const).map((icon) => (
                <Pressable key={icon} style={a11yStyles.touchBtn}>
                  <MaterialCommunityIcons name={icon} size={20} color={Colors.WHITE} />
                </Pressable>
              ))}
            </View>
          </DarkSubCard>

          {/* Contrast Examples */}
          <DarkSubCard>
            <Text style={a11yStyles.cardLabel}>Contrast Examples</Text>
            <View style={[a11yStyles.contrastBlock, { backgroundColor: Colors.BLUE, marginBottom: 16 }]}>
              <Text style={[a11yStyles.contrastText, { color: Colors.WHITE }]}>
                High contrast text on brand color
              </Text>
            </View>
            <View style={[a11yStyles.contrastBlock, { backgroundColor: Colors.WHITE }]}>
              <Text style={[a11yStyles.contrastText, { color: Colors.DARK_GRAY }]}>
                High contrast text on white
              </Text>
            </View>
          </DarkSubCard>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.DARK_GRAY },
  scroll: { paddingHorizontal: H_PAD, paddingTop: 24 },
  section: { marginBottom: SECTION_GAP },
});

const sectionStyles = StyleSheet.create({
  title: {
    fontFamily: Fonts.FONT_BOLD,
    fontSize: Fonts.HEADING_1,
    color: Colors.WHITE,
    marginBottom: 16,
  },
  subCard: {
    backgroundColor: SUB_CARD_BG,
    borderRadius: 12,
    padding: 16,
    marginBottom: ITEM_GAP,
  },
  darkSubCard: {
    backgroundColor: Colors.DARK_GRAY,
    borderWidth: 1,
    borderColor: Colors.CREAM_10,
    borderRadius: 12,
    padding: 16,
    marginBottom: ITEM_GAP,
  },
});

const typoStyles = StyleSheet.create({
  cardLabel: {
    fontFamily: Fonts.FONT_BOLD,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
    marginBottom: 12,
  },
  body: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.CREAM,
  },
  subLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: SUB_LABEL_CLR,
    marginBottom: 4,
  },
  h1: {
    fontFamily: Fonts.FONT_BOLD,
    fontSize: 28,
    color: Colors.WHITE,
  },
  h2: {
    fontFamily: Fonts.FONT_BOLD,
    fontSize: 22,
    color: Colors.WHITE,
  },
  h3: {
    fontFamily: Fonts.FONT_BOLD,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
  },
  bodyRegular: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.WHITE,
  },
  bodySmall: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: BODY_DIM_80,
  },
  bodyXS: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    color: SUB_LABEL_CLR,
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  weightLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: SUB_LABEL_CLR,
    width: 100,
  },
  weightValue: {
    flex: 1,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM,
    textAlign: 'right',
  },
  colorSample: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
  },
});

const paletteStyles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: ITEM_GAP,
  },
  swatch: {
    height: 96,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatchLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
  },
});

const cardStyles = StyleSheet.create({
  lightTitle: {
    fontFamily: Fonts.FONT_BOLD,
    fontSize: Fonts.HEADING_3,
    color: Colors.DARK_GRAY,
    marginBottom: 8,
  },
  darkTitle: {
    fontFamily: Fonts.FONT_BOLD,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
    marginBottom: 8,
  },
  desc: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
  },
});

const iconStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  item: {
    width: '25%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    marginTop: 8,
  },
});

const navStyles = StyleSheet.create({
  tabLabel: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY_S,
    color: Colors.WHITE,
    marginBottom: 16,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    gap: 4,
  },
  tabItemLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_XS,
    marginTop: 4,
  },
  redDot: {
    position: 'absolute',
    top: -2,
    right: -4,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.RED,
  },
});

const illusStyles = StyleSheet.create({
  image: {
    width: 192,
    height: 192,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontFamily: Fonts.FONT_BOLD,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
    textAlign: 'center',
    marginBottom: 8,
  },
  desc: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY,
    color: Colors.CREAM,
    textAlign: 'center',
    marginBottom: 16,
  },
  cta: {
    alignSelf: 'center',
    width: 160,
  },
});

const spacingStyles = StyleSheet.create({
  cardLabel: {
    fontFamily: Fonts.FONT_BOLD,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  block: {
    height: 32,
    backgroundColor: Colors.BLUE_T,
    borderRadius: 4,
    marginRight: 8,
  },
  rowLabel: {
    fontFamily: Fonts.FONT_REGULAR,
    fontSize: Fonts.BODY_S,
    color: Colors.CREAM,
  },
});

const a11yStyles = StyleSheet.create({
  cardLabel: {
    fontFamily: Fonts.FONT_BOLD,
    fontSize: Fonts.HEADING_3,
    color: Colors.WHITE,
    marginBottom: 12,
  },
  touchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  touchBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contrastBlock: {
    height: 56,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  contrastText: {
    fontFamily: Fonts.FONT_MEDIUM,
    fontSize: Fonts.BODY,
  },
});
