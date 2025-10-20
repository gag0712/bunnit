import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

interface DayData {
  day: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

export function CalendarScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

  const getDaysInMonth = (date: Date): DayData[] => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 = 일요일

    const days = [];

    // 이전 달의 날짜들 (옅게 표시)
    const prevMonth = new Date(year, month - 1, 0);
    const daysInPrevMonth = prevMonth.getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      days.push({
        day: daysInPrevMonth - i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    // 현재 달의 날짜들
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

    // 다음 달의 날짜들 (옅게 표시) - 이번 달 마지막 날짜가 있는 주까지만
    const lastDayOfMonth = new Date(year, month, daysInMonth);
    const lastDayOfWeek = lastDayOfMonth.getDay(); // 이번 달 마지막 날의 요일
    const remainingDaysInWeek = 6 - lastDayOfWeek; // 마지막 주에 남은 일수

    for (let day = 1; day <= remainingDaysInWeek; day++) {
      days.push({
        day,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      if (direction === 'prev') {
        newDate.setMonth(prevDate.getMonth() - 1);
      } else {
        newDate.setMonth(prevDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const formatMonthYear = (date: Date) => {
    const year = date.getFullYear();
    const monthNames = [
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
    const month = monthNames[date.getMonth()];
    return `${month} ${year}`;
  };

  const days = getDaysInMonth(currentDate);

  const handleDatePress = (dayData: DayData, _dayIndex: number) => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    if (dayData.isCurrentMonth) {
      const selectedDay = new Date(year, month, dayData.day);
      setSelectedDate(selectedDay);
    }
  };

  const isDateSelected = (dayData: DayData) => {
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
  };

  return (
    <View style={styles.container}>
      {/* 월 네비게이션 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigateMonth('prev')}
          style={styles.navButton}
        >
          <Text style={styles.navButtonText}>{'<'}</Text>
        </TouchableOpacity>

        <Text style={styles.monthYearText}>{formatMonthYear(currentDate)}</Text>

        <TouchableOpacity
          onPress={() => navigateMonth('next')}
          style={styles.navButton}
        >
          <Text style={styles.navButtonText}>{'>'}</Text>
        </TouchableOpacity>
      </View>

      {/* 요일 헤더 */}
      <View style={styles.weekdayHeader}>
        {weekDays.map((day, index) => (
          <Text
            key={index}
            style={[
              styles.weekdayText,
              index === 0 && styles.sundayText, // 일요일
              index === 6 && styles.saturdayText, // 토요일
            ]}
          >
            {day}
          </Text>
        ))}
      </View>

      {/* 달력 그리드 */}
      <View style={styles.calendarGrid}>
        {Array.from({ length: Math.ceil(days.length / 7) }, (_, weekIndex) => (
          <View key={weekIndex} style={styles.weekRow}>
            {days
              .slice(weekIndex * 7, (weekIndex + 1) * 7)
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
        ))}
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
    color: '#FF3B30', // 빨간색
  },
  saturdayText: {
    color: '#007AFF', // 파란색
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
    marginHorizontal: 1,
  },
  todayCell: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 25,
    backgroundColor: 'transparent',
  },
  dayText: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
  },
  inactiveDayText: {
    color: '#C7C7CC',
  },
  todayText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  selectedCell: {
    borderWidth: 2,
    borderColor: '#FF3B30',
    borderRadius: 25,
    backgroundColor: 'transparent',
  },
  selectedText: {
    color: '#FF3B30',
    fontWeight: 'bold',
  },
});
