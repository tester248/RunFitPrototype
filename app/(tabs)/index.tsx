import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  SafeAreaView
} from 'react-native';
import { router } from 'expo-router';
import { Search, Clock, Zap, TrendingUp, ChevronRight, Moon, Sun } from 'lucide-react-native';
import { useFitness } from '@/context/FitnessContext';
import { useTheme } from '@/context/ThemeContext';
import { formatDate, formatTime, formatPace, getInitials, getDaysSince } from '@/utils/helpers';
import { StudentWithLatestTest } from '@/types';

export default function StudentsScreen() {
  const { getStudentsWithLatestTest, isLoading } = useFitness();
  const { colors, isDark, theme, setTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const studentsWithTests = getStudentsWithLatestTest();
  const filteredStudents = studentsWithTests.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleTheme = () => {
    if (theme === 'system') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('light');
    } else {
      setTheme('system');
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Running Tracker</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{studentsWithTests.length} Active Students</Text>
        </View>
        <TouchableOpacity onPress={toggleTheme} style={styles.themeButton}>
          {isDark ? <Sun color={colors.primary} size={24} /> : <Moon color={colors.primary} size={24} />}
        </TouchableOpacity>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Search color={colors.textSecondary} size={20} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search students..."
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <FlatList
        data={filteredStudents}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => <StudentCard student={item} />}
      />
    </SafeAreaView>
  );
}

function StudentCard({ student }: { student: StudentWithLatestTest }) {
  const { colors, isDark } = useTheme();
  const daysSinceTest = student.latestTest ? getDaysSince(student.latestTest.date) : null;
  const needsTest = daysSinceTest !== null && daysSinceTest >= 15;

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card }]}
      onPress={() => router.push(`/student/${student.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardContent}>
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: needsTest ? colors.warning : colors.primary }]}>
            <Text style={styles.avatarText}>{getInitials(student.name)}</Text>
          </View>
        </View>

        <View style={styles.cardInfo}>
          <View style={styles.cardHeader}>
            <Text style={[styles.studentName, { color: colors.text }]}>{student.name}</Text>
            <ChevronRight color={colors.textSecondary} size={20} />
          </View>

          <View style={styles.metaRow}>
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>Age {student.age}</Text>
            <View style={[styles.dot, { backgroundColor: colors.textSecondary }]} />
            <Text style={[styles.metaText, { color: colors.textSecondary }]}>{student.totalTests} tests</Text>
          </View>

          {student.latestTest ? (
            <>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Clock color={colors.primary} size={16} />
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Time</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {formatTime(student.latestTest.timeInSeconds)}
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <Zap color={colors.secondary} size={16} />
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Pace</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    {formatPace(student.latestTest.pace)}/km
                  </Text>
                </View>

                <View style={styles.statItem}>
                  <TrendingUp color={colors.success} size={16} />
                  <Text style={[styles.statLabel, { color: colors.textSecondary }]}>Distance</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>{student.latestTest.distance}km</Text>
                </View>
              </View>

              {needsTest ? (
                <View style={[styles.warningBanner, { backgroundColor: isDark ? '#3A2C1F' : '#FFF3E0' }]}>
                  <Text style={[styles.warningText, { color: colors.warning }]}>
                    ⚠️ Test due - Last tested {daysSinceTest} days ago
                  </Text>
                </View>
              ) : (
                <Text style={[styles.lastTestDate, { color: colors.textSecondary }]}>
                  Last test: {formatDate(student.latestTest.date)}
                </Text>
              )}
            </>
          ) : (
            <View style={[styles.noTestBanner, { backgroundColor: colors.background }]}>
              <Text style={[styles.noTestText, { color: colors.textSecondary }]}>No performance tests yet</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  themeButton: {
    padding: 8,
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    height: 50,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardContent: {
    padding: 16,
  },
  avatarContainer: {
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700' as const,
  },
  cardInfo: {
    flex: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  studentName: {
    fontSize: 20,
    fontWeight: '700' as const,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    marginHorizontal: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500' as const,
    marginTop: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '700' as const,
  },
  lastTestDate: {
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500' as const,
  },
  warningBanner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  warningText: {
    fontSize: 13,
    fontWeight: '600' as const,
    textAlign: 'center',
  },
  noTestBanner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 4,
  },
  noTestText: {
    fontSize: 13,
    fontWeight: '500' as const,
    textAlign: 'center',
  },
});
