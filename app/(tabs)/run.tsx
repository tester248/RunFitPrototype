import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import * as Location from 'expo-location';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Play, Square, Save, LocateFixed, Route } from 'lucide-react-native';

import { useFitness } from '@/context/FitnessContext';
import { useTheme } from '@/context/ThemeContext';
import { formatPace, formatTime, haversineDistanceKm, getInitials, formatDate } from '@/utils/helpers';
import { RunPoint } from '@/types';

const DEFAULT_REGION = {
  latitude: 37.78825,
  longitude: -122.4324,
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

export default function LiveRunScreen() {
  const { colors } = useTheme();
  const { students, runs, addRun } = useFitness();

  const mapRef = useRef<MapView | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>(students[0]?.id);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [points, setPoints] = useState<RunPoint[]>([]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [distanceKm, setDistanceKm] = useState(0);
  const [currentSpeedKmh, setCurrentSpeedKmh] = useState(0);
  const [currentRegion, setCurrentRegion] = useState(DEFAULT_REGION);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!selectedStudentId && students.length > 0) {
      setSelectedStudentId(students[0].id);
    }
  }, [students, selectedStudentId]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isTracking) {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTracking]);

  useEffect(() => {
    return () => {
      locationSubscription.current?.remove();
    };
  }, []);

  const averagePace = useMemo(() => {
    if (distanceKm <= 0 || elapsedSeconds <= 0) return 0;
    return elapsedSeconds / 60 / distanceKm;
  }, [distanceKm, elapsedSeconds]);

  const selectedStudentRuns = useMemo(
    () => runs.filter((run) => run.studentId === selectedStudentId),
    [runs, selectedStudentId],
  );

  const historicalRouteColors = ['#6EA8FF', '#8CF0B4', '#FFC46B', '#FF8E8E'];

  useEffect(() => {
    if (isTracking || points.length > 0 || selectedStudentRuns.length === 0) return;

    const firstPoint = selectedStudentRuns[0].points[0];
    if (!firstPoint) return;

    const nextRegion = {
      latitude: firstPoint.latitude,
      longitude: firstPoint.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    };
    setCurrentRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 500);
  }, [isTracking, points.length, selectedStudentRuns]);

  const requestPermission = async () => {
    const result = await Location.requestForegroundPermissionsAsync();
    if (result.status !== 'granted') {
      setHasPermission(false);
      Alert.alert('Location Permission Required', 'Please allow location access to track live runs.');
      return false;
    }

    setHasPermission(true);
    return true;
  };

  const centerOnCurrentPosition = async () => {
    const ok = await requestPermission();
    if (!ok) return;

    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Highest });
    const nextRegion = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    setCurrentRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 500);
  };

  const startTracking = async () => {
    if (isTracking) return;

    const ok = await requestPermission();
    if (!ok) return;

    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.BestForNavigation });
    const startPoint: RunPoint = {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
      timestamp: new Date().toISOString(),
      speed: position.coords.speed,
    };

    setPoints([startPoint]);
    setDistanceKm(0);
    setElapsedSeconds(0);
    setCurrentSpeedKmh(Math.max((position.coords.speed ?? 0) * 3.6, 0));

    const nextRegion = {
      latitude: startPoint.latitude,
      longitude: startPoint.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setCurrentRegion(nextRegion);
    mapRef.current?.animateToRegion(nextRegion, 500);

    locationSubscription.current?.remove();
    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        timeInterval: 2000,
        distanceInterval: 3,
      },
      (update) => {
        const nextPoint: RunPoint = {
          latitude: update.coords.latitude,
          longitude: update.coords.longitude,
          timestamp: new Date().toISOString(),
          speed: update.coords.speed,
        };

        setPoints((prev) => {
          if (prev.length === 0) return [nextPoint];

          const last = prev[prev.length - 1];
          const segment = haversineDistanceKm(last.latitude, last.longitude, nextPoint.latitude, nextPoint.longitude);
          setDistanceKm((prevDistance) => prevDistance + segment);
          return [...prev, nextPoint];
        });

        setCurrentSpeedKmh(Math.max((update.coords.speed ?? 0) * 3.6, 0));
        mapRef.current?.animateCamera(
          {
            center: {
              latitude: nextPoint.latitude,
              longitude: nextPoint.longitude,
            },
          },
          { duration: 450 },
        );
      },
    );

    setIsTracking(true);
  };

  const stopTracking = () => {
    setIsTracking(false);
    locationSubscription.current?.remove();
    locationSubscription.current = null;
  };

  const resetRun = () => {
    setPoints([]);
    setElapsedSeconds(0);
    setDistanceKm(0);
    setCurrentSpeedKmh(0);
  };

  const saveRun = async () => {
    if (isTracking) {
      Alert.alert('Stop Run First', 'Please stop tracking before saving this run.');
      return;
    }

    if (points.length < 2 || elapsedSeconds < 20 || distanceKm <= 0.05) {
      Alert.alert('Run Too Short', 'Track a longer run before saving.');
      return;
    }

    setIsSaving(true);
    try {
      await addRun({
        studentId: selectedStudentId,
        durationSeconds: elapsedSeconds,
        distanceKm,
        averagePace,
        points,
      });
      Alert.alert('Run Saved', 'GPS route, pace, and distance are now saved in local history.');
      resetRun();
    } catch (error) {
      console.error(error);
      Alert.alert('Save Failed', 'Could not save this run session.');
    } finally {
      setIsSaving(false);
    }
  };

  const recentRuns = runs.slice(0, 5);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}> 
      <View style={[styles.header, { borderBottomColor: colors.border }]}> 
        <View>
          <Text style={[styles.title, { color: colors.text }]}>Live GPS Run</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Native route tracking and pace analytics</Text>
        </View>
        <TouchableOpacity onPress={centerOnCurrentPosition} style={[styles.circleButton, { backgroundColor: colors.card, borderColor: colors.border }]}> 
          <LocateFixed size={18} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.studentRow, { borderBottomColor: colors.border }]}> 
        <FlatList
          horizontal
          data={students}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.studentListContent}
          renderItem={({ item }) => {
            const active = selectedStudentId === item.id;
            return (
              <TouchableOpacity
                onPress={() => setSelectedStudentId(item.id)}
                style={[
                  styles.studentChip,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  active && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
              >
                <Text style={[styles.studentChipText, { color: active ? '#FFFFFF' : colors.text }]}>{getInitials(item.name)} {item.name.split(' ')[0]}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      <View style={[styles.mapWrap, { borderColor: colors.border, backgroundColor: colors.card }]}> 
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={currentRegion}
          showsUserLocation={hasPermission ?? false}
          showsMyLocationButton={false}
          followsUserLocation={isTracking}
        >
          {selectedStudentRuns.slice(0, 4).map((run, index) => {
            if (run.points.length < 2) return null;
            const color = historicalRouteColors[index % historicalRouteColors.length];
            const startPoint = run.points[0];
            return (
              <React.Fragment key={run.id}>
                <Polyline
                  coordinates={run.points.map((point) => ({ latitude: point.latitude, longitude: point.longitude }))}
                  strokeColor={color}
                  strokeWidth={3}
                />
                <Marker
                  coordinate={{ latitude: startPoint.latitude, longitude: startPoint.longitude }}
                  title={`Route ${index + 1}`}
                  description={`Saved run • ${run.distanceKm.toFixed(2)} km`}
                  pinColor={color}
                />
              </React.Fragment>
            );
          })}

          {points.length > 1 && (
            <Polyline
              coordinates={points.map((point) => ({ latitude: point.latitude, longitude: point.longitude }))}
              strokeColor={colors.secondary}
              strokeWidth={5}
            />
          )}
          {points[0] && (
            <Marker coordinate={{ latitude: points[0].latitude, longitude: points[0].longitude }} title="Start" />
          )}
          {points.length > 1 && (
            <Marker
              coordinate={{ latitude: points[points.length - 1].latitude, longitude: points[points.length - 1].longitude }}
              title="Current"
            />
          )}
        </MapView>
      </View>

      <View style={styles.metricsGrid}>
        <MetricCard label="Time" value={formatTime(elapsedSeconds)} colors={colors} />
        <MetricCard label="Distance" value={`${distanceKm.toFixed(2)} km`} colors={colors} />
        <MetricCard label="Pace" value={averagePace > 0 ? `${formatPace(averagePace)}/km` : '--'} colors={colors} />
        <MetricCard label="Speed" value={`${currentSpeedKmh.toFixed(1)} km/h`} colors={colors} />
      </View>

      <View style={styles.actionsRow}>
        {!isTracking ? (
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.success }]} onPress={startTracking}>
            <Play color="#FFFFFF" size={18} />
            <Text style={styles.actionText}>Start</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.error }]} onPress={stopTracking}>
            <Square color="#FFFFFF" size={18} />
            <Text style={styles.actionText}>Stop</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }, isSaving && { opacity: 0.6 }]}
          onPress={saveRun}
          disabled={isSaving}
        >
          {isSaving ? <ActivityIndicator color="#FFFFFF" /> : <Save color="#FFFFFF" size={18} />}
          <Text style={styles.actionText}>Save</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.accent }]} onPress={resetRun}>
          <Route color="#FFFFFF" size={18} />
          <Text style={styles.actionText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.history, { borderTopColor: colors.border }]}> 
        <Text style={[styles.historyTitle, { color: colors.text }]}>Recent GPS Runs</Text>
        {selectedStudentRuns.length > 0 && (
          <Text style={[styles.emptyText, { color: colors.textSecondary, marginBottom: 8 }]}> 
            Showing {Math.min(selectedStudentRuns.length, 4)} saved routes on map for this student.
          </Text>
        )}
        {recentRuns.length === 0 ? (
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No saved GPS sessions yet.</Text>
        ) : (
          recentRuns.map((run) => {
            const student = students.find((item) => item.id === run.studentId);
            return (
              <View key={run.id} style={[styles.historyRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.historyName, { color: colors.text }]}>{student?.name ?? 'Unassigned run'}</Text>
                <Text style={[styles.historyMeta, { color: colors.textSecondary }]}>
                  {formatDate(run.date)} • {run.distanceKm.toFixed(2)} km • {formatTime(run.durationSeconds)}
                </Text>
              </View>
            );
          })
        )}
      </View>
    </SafeAreaView>
  );
}

function MetricCard({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { card: string; text: string; textSecondary: string; border: string };
}) {
  return (
    <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.border }]}> 
      <Text style={[styles.metricLabel, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 98,
  },
  header: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700' as const,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 13,
    fontWeight: '500' as const,
  },
  circleButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  studentRow: {
    borderBottomWidth: 1,
    paddingVertical: 10,
  },
  studentListContent: {
    paddingHorizontal: 14,
    gap: 8,
  },
  studentChip: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  studentChipText: {
    fontSize: 13,
    fontWeight: '600' as const,
  },
  mapWrap: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    height: 250,
  },
  map: {
    flex: 1,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  metricCard: {
    width: '48.5%',
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
  },
  metricLabel: {
    fontSize: 12,
    fontWeight: '600' as const,
  },
  metricValue: {
    marginTop: 3,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700' as const,
  },
  history: {
    marginTop: 14,
    borderTopWidth: 1,
    paddingTop: 10,
    paddingHorizontal: 16,
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    fontWeight: '500' as const,
  },
  historyRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
  },
  historyName: {
    fontSize: 14,
    fontWeight: '700' as const,
  },
  historyMeta: {
    marginTop: 3,
    fontSize: 12,
    fontWeight: '500' as const,
  },
});
