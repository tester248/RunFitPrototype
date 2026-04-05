import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFitness } from '@/context/FitnessContext';
import { useTheme } from '@/context/ThemeContext';
import { Clock, MapPin, Heart, FileText } from 'lucide-react-native';
import { calculatePace } from '@/utils/helpers';

export default function AddTestScreen() {
  const { students, addTest } = useFitness();
  const { colors } = useTheme();
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [distance, setDistance] = useState('5');
  const [minutes, setMinutes] = useState('');
  const [seconds, setSeconds] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedStudentId) {
      Alert.alert('Error', 'Please select a student');
      return;
    }

    const mins = parseInt(minutes) || 0;
    const secs = parseInt(seconds) || 0;
    const dist = parseFloat(distance) || 0;

    if (dist <= 0) {
      Alert.alert('Error', 'Please enter a valid distance');
      return;
    }

    if (mins === 0 && secs === 0) {
      Alert.alert('Error', 'Please enter a valid time');
      return;
    }

    const totalSeconds = mins * 60 + secs;
    const pace = calculatePace(dist, totalSeconds);

    setIsSubmitting(true);

    try {
      await addTest({
        studentId: selectedStudentId,
        date: new Date().toISOString(),
        distance: dist,
        timeInSeconds: totalSeconds,
        pace: pace,
        heartRate: heartRate ? parseInt(heartRate) : undefined,
        notes: notes || undefined,
      });

      Alert.alert('Success', 'Performance test recorded successfully!');
      
      setSelectedStudentId('');
      setDistance('5');
      setMinutes('');
      setSeconds('');
      setHeartRate('');
      setNotes('');
    } catch (error) {
      Alert.alert('Error', 'Failed to record test. Please try again.');
      console.error('Error adding test:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>New Performance Test</Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>Record a student&apos;s running performance</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Student</Text>
          <View style={styles.studentGrid}>
            {students.map((student) => (
              <TouchableOpacity
                key={student.id}
                style={[
                  styles.studentChip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  selectedStudentId === student.id && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => setSelectedStudentId(student.id)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.studentChipText,
                    { color: colors.text },
                    selectedStudentId === student.id && styles.studentChipTextSelected,
                  ]}
                >
                  {student.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Distance</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <MapPin color={colors.primary} size={20} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter distance"
              placeholderTextColor={colors.textSecondary}
              value={distance}
              onChangeText={setDistance}
              keyboardType="decimal-pad"
            />
            <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>km</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Time</Text>
          <View style={styles.timeRow}>
            <View style={[styles.inputGroup, styles.timeInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Clock color={colors.primary} size={20} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="MM"
                placeholderTextColor={colors.textSecondary}
                value={minutes}
                onChangeText={setMinutes}
                keyboardType="number-pad"
                maxLength={3}
              />
              <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>min</Text>
            </View>

            <Text style={[styles.timeSeparator, { color: colors.text }]}>:</Text>

            <View style={[styles.inputGroup, styles.timeInput, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, styles.inputWithoutIcon, { color: colors.text }]}
                placeholder="SS"
                placeholderTextColor={colors.textSecondary}
                value={seconds}
                onChangeText={setSeconds}
                keyboardType="number-pad"
                maxLength={2}
              />
              <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>sec</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Heart Rate (Optional)</Text>
          <View style={[styles.inputGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Heart color={colors.error} size={20} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Enter heart rate"
              placeholderTextColor={colors.textSecondary}
              value={heartRate}
              onChangeText={setHeartRate}
              keyboardType="number-pad"
            />
            <Text style={[styles.inputUnit, { color: colors.textSecondary }]}>bpm</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Notes (Optional)</Text>
          <View style={[styles.inputGroup, styles.textAreaGroup, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <FileText color={colors.primary} size={20} style={styles.inputIconTop} />
            <TextInput
              style={[styles.input, styles.textArea, { color: colors.text }]}
              placeholder="Add notes about the test..."
              placeholderTextColor={colors.textSecondary}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, { backgroundColor: colors.primary, shadowColor: colors.primary }, isSubmitting && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.8}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitButtonText}>Record Test</Text>
          )}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '700' as const,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    fontWeight: '500' as const,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    marginBottom: 12,
  },
  studentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  studentChip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 2,
  },
  studentChipText: {
    fontSize: 14,
    fontWeight: '600' as const,
  },
  studentChipTextSelected: {
    color: '#FFFFFF',
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 56,
  },
  textAreaGroup: {
    height: 120,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  inputIconTop: {
    marginRight: 12,
    marginTop: 2,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500' as const,
  },
  inputWithoutIcon: {
    marginLeft: 12,
  },
  textArea: {
    height: 96,
    textAlignVertical: 'top',
  },
  inputUnit: {
    fontSize: 14,
    fontWeight: '600' as const,
    marginLeft: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeSeparator: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  submitButton: {
    marginHorizontal: 20,
    marginTop: 32,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700' as const,
  },
});
