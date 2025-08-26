import EventCard from '@/components/BigComponents/EventCard';
import { DARK_GRAY } from '@/constants/Colors';
import { Text, View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';

const source = require("../../../assets/images/estilo-cochino.png");

export default function AllUpcomingEventsScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollableContainer} contentContainerStyle={styles.scrollContent}>
                <EventCard name="ARSH Padel Mini Tour" location="Padel ONE" date="24 August 2025" image={source} registered={false} tag="Estilo Cochino"/>
                <EventCard name="ARSH Padel Mini Tour" location="Padel ONE" date="24 August 2025" image={source} registered={false} tag="Estilo Cochino"/>
                <EventCard name="ARSH Padel Mini Tour" location="Padel ONE" date="24 August 2025" image={source} registered={false} tag="Estilo Cochino"/>
                <EventCard name="ARSH Padel Mini Tour" location="Padel ONE" date="24 August 2025" image={source} registered={false} tag="Estilo Cochino"/>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: DARK_GRAY,
    },
    scrollableContainer: {
        flex: 1,
    },
    scrollContent: {
        padding: 16,
        alignItems: "center",
        gap: 16,
    },
});