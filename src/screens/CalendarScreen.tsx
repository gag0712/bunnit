import React, { useState, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

interface DayData {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

const WEEK_DAYS = ['일', '월', '화', '수', '목', '금', '토'];

const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const ANIMATION_CONFIG = {
  duration: 200,
  slideDistance: 300,
  threshold: 50,
} as const;

export function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  const calendarOpacity = useSharedValue(1);
  const calendarTranslateY = useSharedValue(0);
  const calendarTranslateX = useSharedValue(0);
  const weekViewOpacity = useSharedValue(0);
  const weekViewTranslateY = useSharedValue(50);
  const weekViewTranslateX = useSharedValue(0);

  const getDaysInMonth = useCallback((date: Date): DayData[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        today.getDate() === day &&
        today.getMonth() === month &&
        today.getFullYear() === year;

      days.push({
        day,
        isCurrentMonth: true,
        isToday,
      });
    }

    const lastDayOfMonth = new Date(year, month, daysInMonth);
    const lastDayOfWeek = lastDayOfMonth.getDay();
    const remainingDaysInWeek = 6 - lastDayOfWeek;

    for (let day = 1; day <= remainingDaysInWeek; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, []);

  const updateCurrentDate = useCallback(
    (direction: 'prev' | 'next') => {
      setCurrentDate(prevDate => {
        if (!prevDate) return new Date();

        const newDate = new Date(prevDate);
        if (viewMode === 'week') {
          if (direction === 'prev') {
            newDate.setDate(prevDate.getDate() - 7);
          } else {
            newDate.setDate(prevDate.getDate() + 7);
          }
        } else {
          if (direction === 'prev') {
            newDate.setMonth(prevDate.getMonth() - 1);
          } else {
            newDate.setMonth(prevDate.getMonth() + 1);
          }
        }
        return newDate;
      });
    },
    [viewMode],
  );

  const navigateDate = useCallback(
    (direction: 'prev' | 'next') => {
      const slideDistance = ANIMATION_CONFIG.slideDistance;
      const slideOutDirection =
        direction === 'prev' ? slideDistance : -slideDistance;
      const slideInDirection =
        direction === 'prev' ? -slideDistance : slideDistance;

      if (viewMode === 'week') {
        weekViewTranslateX.value = withTiming(
          slideOutDirection,
          { duration: ANIMATION_CONFIG.duration },
          () => {
            scheduleOnRN(updateCurrentDate, direction);
            weekViewTranslateX.value = slideInDirection;
            weekViewTranslateX.value = withTiming(0, {
              duration: ANIMATION_CONFIG.duration,
            });
          },
        );
      } else {
        calendarTranslateX.value = withTiming(
          slideOutDirection,
          { duration: ANIMATION_CONFIG.duration },
          () => {
            scheduleOnRN(updateCurrentDate, direction);
            calendarTranslateX.value = slideInDirection;
            calendarTranslateX.value = withTiming(0, {
              duration: ANIMATION_CONFIG.duration,
            });
          },
        );
      }
    },
    [viewMode, updateCurrentDate, weekViewTranslateX, calendarTranslateX],
  );

  const formatMonthYear = useCallback((date: Date) => {
    const year = date.getFullYear();
    const month = MONTH_NAMES[date.getMonth()];
    return `${month} ${year}`;
  }, []);

  const handleDatePress = useCallback(
    (dayData: DayData, _dayIndex: number) => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      if (dayData.isCurrentMonth) {
        const selectedDay = new Date(year, month, dayData.day);

        if (
          selectedDate &&
          selectedDate.getDate() === selectedDay.getDate() &&
          selectedDate.getMonth() === selectedDay.getMonth() &&
          selectedDate.getFullYear() === selectedDay.getFullYear()
        ) {
          setSelectedDate(null);
        } else {
          setSelectedDate(selectedDay);
        }
      }
    },
    [currentDate, selectedDate],
  );

  const isDateSelected = useCallback(
    (dayData: DayData) => {
      if (!selectedDate || !dayData.isCurrentMonth) return false;

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const selectedYear = selectedDate.getFullYear();
      const selectedMonth = selectedDate.getMonth();
      const selectedDay = selectedDate.getDate();

      return (
        year === selectedYear &&
        month === selectedMonth &&
        dayData.day === selectedDay
      );
    },
    [currentDate, selectedDate],
  );

  const switchToWeekView = () => {
    if (selectedDate) {
      const selectedYear = selectedDate.getFullYear();
      const selectedMonth = selectedDate.getMonth();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();

      if (selectedYear === currentYear && selectedMonth === currentMonth) {
        setCurrentDate(selectedDate);
      }
    }

    calendarOpacity.value = withTiming(0, {
      duration: ANIMATION_CONFIG.duration,
    });
    calendarTranslateY.value = withTiming(
      -20,
      { duration: ANIMATION_CONFIG.duration },
      () => {
        scheduleOnRN(setViewMode, 'week');
        weekViewOpacity.value = withTiming(1, {
          duration: ANIMATION_CONFIG.duration,
        });
        weekViewTranslateY.value = withTiming(0, {
          duration: ANIMATION_CONFIG.duration,
        });
        weekViewTranslateX.value = 0;
      },
    );
  };

  const switchToMonthView = () => {
    weekViewOpacity.value = withTiming(0, {
      duration: ANIMATION_CONFIG.duration,
    });
    weekViewTranslateY.value = withTiming(
      50,
      { duration: ANIMATION_CONFIG.duration },
      () => {
        scheduleOnRN(setViewMode, 'month');
        calendarOpacity.value = withTiming(1, {
          duration: ANIMATION_CONFIG.duration,
        });
        calendarTranslateY.value = withTiming(0, {
          duration: ANIMATION_CONFIG.duration,
        });
        calendarTranslateX.value = 0;
      },
    );
  };

  const panGesture = Gesture.Pan().onEnd(event => {
    const { translationY, translationX } = event;
    const verticalThreshold = ANIMATION_CONFIG.threshold;
    const horizontalThreshold = ANIMATION_CONFIG.threshold;

    if (Math.abs(translationY) > Math.abs(translationX)) {
      if (translationY > verticalThreshold) {
        scheduleOnRN(switchToMonthView);
      } else if (translationY < -verticalThreshold) {
        scheduleOnRN(switchToWeekView);
      }
    } else if (Math.abs(translationX) > Math.abs(translationY)) {
      if (translationX > horizontalThreshold) {
        scheduleOnRN(navigateDate, 'prev');
      } else if (translationX < -horizontalThreshold) {
        scheduleOnRN(navigateDate, 'next');
      }
    }
  });

  const getWeekDays = useCallback((date: Date): DayData[] => {
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day;
    startOfWeek.setDate(diff);

    const today = new Date();
    const weekDaysData = [];

    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(startOfWeek);
      currentDay.setDate(startOfWeek.getDate() + i);

      const isToday =
        currentDay.getDate() === today.getDate() &&
        currentDay.getMonth() === today.getMonth() &&
        currentDay.getFullYear() === today.getFullYear();

      weekDaysData.push({
        day: currentDay.getDate(),
        isCurrentMonth: currentDay.getMonth() === date.getMonth(),
        isToday,
      });
    }
    return weekDaysData;
  }, []);

  const monthViewAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: calendarOpacity.value,
      transform: [
        { translateY: calendarTranslateY.value },
        { translateX: calendarTranslateX.value },
      ],
    };
  });

  const weekViewAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: weekViewOpacity.value,
      transform: [
        { translateY: weekViewTranslateY.value },
        { translateX: weekViewTranslateX.value },
      ],
    };
  });

  const weekDaysData = useMemo(() => {
    return viewMode === 'week' ? getWeekDays(currentDate) : null;
  }, [viewMode, currentDate, getWeekDays]);

  const monthDaysData = useMemo(() => {
    return viewMode === 'month' ? getDaysInMonth(currentDate) : null;
  }, [viewMode, currentDate, getDaysInMonth]);

  const renderCalendarContent = useCallback(() => {
    if (viewMode === 'week') {
      return (
        <Animated.View style={[styles.weekView, weekViewAnimatedStyle]}>
          {weekDaysData?.map((dayData, dayIndex) => (
            <TouchableOpacity
              key={dayIndex}
              style={[
                styles.weekDayCell,
                dayData.isToday && styles.todayCell,
                isDateSelected(dayData) && styles.selectedCell,
              ]}
              onPress={() => handleDatePress(dayData, dayIndex)}
            >
              <Text
                style={[
                  styles.weekDayText,
                  !dayData.isCurrentMonth && styles.inactiveDayText,
                  dayData.isToday && styles.todayText,
                  isDateSelected(dayData) && styles.selectedText,
                ]}
              >
                {dayData.day}
              </Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      );
    }

    return (
      <Animated.View style={[styles.calendarGrid, monthViewAnimatedStyle]}>
        {Array.from(
          { length: Math.ceil((monthDaysData?.length || 0) / 7) },
          (_, weekIndex) => (
            <View key={weekIndex} style={styles.weekRow}>
              {monthDaysData
                ?.slice(weekIndex * 7, (weekIndex + 1) * 7)
                .map((dayData, dayIndex) => (
                  <TouchableOpacity
                    key={weekIndex * 7 + dayIndex}
                    style={[
                      styles.dayCell,
                      dayData.isToday && styles.todayCell,
                      isDateSelected(dayData) && styles.selectedCell,
                    ]}
                    onPress={() =>
                      handleDatePress(dayData, weekIndex * 7 + dayIndex)
                    }
                  >
                    <Text
                      style={[
                        styles.dayText,
                        !dayData.isCurrentMonth && styles.inactiveDayText,
                        dayData.isToday && styles.todayText,
                        isDateSelected(dayData) && styles.selectedText,
                      ]}
                    >
                      {dayData.day}
                    </Text>
                  </TouchableOpacity>
                ))}
            </View>
          ),
        )}
      </Animated.View>
    );
  }, [
    viewMode,
    weekDaysData,
    monthDaysData,
    weekViewAnimatedStyle,
    monthViewAnimatedStyle,
    isDateSelected,
    handleDatePress,
  ]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigateDate('prev')}
          style={styles.navButton}
        >
          <Text style={styles.navButtonText}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={styles.monthYearText}>{formatMonthYear(currentDate)}</Text>

        <TouchableOpacity
          onPress={() => navigateDate('next')}
          style={styles.navButton}
        >
          <Text style={styles.navButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.weekdayHeader}>
        {WEEK_DAYS.map((day, index) => (
          <Text
            key={index}
            style={[
              styles.weekdayText,
              index === 0 && styles.sundayText,
              index === 6 && styles.saturdayText,
            ]}
          >
            {day}
          </Text>
        ))}
      </View>

      <GestureDetector gesture={panGesture}>
        <View style={styles.gestureContainer}>{renderCalendarContent()}</View>
      </GestureDetector>

      <View style={styles.viewModeIndicator}>
        <Text style={styles.viewModeText}>
          {viewMode === 'month' ? '월간 달력' : '주간 달력'} - 위아래: 전환,
          좌우: 이동
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  navButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  navButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  monthYearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  weekdayHeader: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  weekdayText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    paddingVertical: 8,
  },
  sundayText: {
    color: '#FF3B30',
  },
  saturdayText: {
    color: '#007AFF',
  },
  calendarGrid: {
    flex: 1,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    borderRadius: 25,
  },
  todayCell: {
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 25,
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    lineHeight: 20,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  inactiveDayText: {
    color: '#C7C7CC',
  },
  todayText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: 'bold',
    lineHeight: 20,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  selectedCell: {
    borderWidth: 1,
    borderColor: '#FF3B30',
    borderRadius: 25,
    backgroundColor: 'transparent',
  },
  selectedText: {
    color: '#FF3B30',
    fontWeight: 'bold',
    lineHeight: 20,
    textAlignVertical: 'center',
    includeFontPadding: false,
  },
  gestureContainer: {
    flex: 1,
  },
  weekView: {
    flexDirection: 'row',
    flex: 1,
    justifyContent: 'space-around',
    alignItems: 'flex-start',
    paddingTop: 20,
    paddingBottom: 20,
  },
  weekDayCell: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    borderRadius: 25,
  },
  weekDayText: {
    fontSize: 18,
    color: '#000000',
    fontWeight: '500',
  },
  viewModeIndicator: {
    paddingVertical: 10,
    alignItems: 'center',
  },
  viewModeText: {
    fontSize: 12,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
});
