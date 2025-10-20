'use client';

import React, { useState, useMemo } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { DashboardData } from '@/types';

interface CustomCalendarProps {
  bookings: DashboardData[];
}

const ChevronLeftIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const CustomCalendar = ({ bookings }: CustomCalendarProps) => {
  const [currentDate, setCurrentDate] = useState(dayjs());

  const { dailyLayouts, maxSlots } = useMemo(() => {
    // Create a map of all bookings grouped by date for efficient lookup
    const bookingsByDate = new Map<string, DashboardData[]>();
    bookings.forEach(booking => {
      let current = dayjs(booking.Booking_Start_Date_Time);
      const end = dayjs(booking.Booking_End_Date_Time);
      while (current.isBefore(end) || current.isSame(end, 'day')) {
        const dateStr = current.format('YYYY-MM-DD');
        const bookingsForDate = bookingsByDate.get(dateStr) || [];
        bookingsByDate.set(dateStr, [...bookingsForDate, booking]);
        current = current.add(1, 'day');
      }
    });

    // Globally assign a consistent vertical slot to each booking ID
    const bookingSlotMap = new Map<string, number>();
    const allSortedDates = Array.from(bookingsByDate.keys()).sort();

    allSortedDates.forEach(dateStr => {
        const bookingsOnDay = (bookingsByDate.get(dateStr) || []).sort((a,b) => dayjs(a.Booking_Start_Date_Time).diff(dayjs(b.Booking_Start_Date_Time)));
        const usedSlots = new Set<number>();

        bookingsOnDay.forEach(booking => {
            if (bookingSlotMap.has(booking.Booking_ID)) {
                usedSlots.add(bookingSlotMap.get(booking.Booking_ID)!);
            }
        });

        bookingsOnDay.forEach(booking => {
            if (!bookingSlotMap.has(booking.Booking_ID)) {
                let slot = 0;
                while (usedSlots.has(slot)) {
                    slot++;
                }
                bookingSlotMap.set(booking.Booking_ID, slot);
                usedSlots.add(slot);
            }
        });
    });

    // Determine the global maximum number of slots required on any day
    let globalMaxSlots = 0;
    for (const slot of bookingSlotMap.values()) {
        if (slot + 1 > globalMaxSlots) {
            globalMaxSlots = slot + 1;
        }
    }
    globalMaxSlots = Math.max(1, globalMaxSlots);

    // Determine the currently visible days
    const startOfMonth = currentDate.startOf('month');
    const endOfMonth = currentDate.endOf('month');
    const startDate = startOfMonth.startOf('week');
    const endDate = endOfMonth.endOf('week');
    const visibleDays = [];
    let dayIterator = startDate;
    while (dayIterator.isBefore(endDate) || dayIterator.isSame(endDate, 'day')) {
        visibleDays.push(dayIterator);
        dayIterator = dayIterator.add(1, 'day');
    }

    // Create the layout for only the visible days using the global slot map
    const layouts = new Map<string, {
        booking: DashboardData;
        slot: number;
        connectsToPrev: boolean;
        connectsToNext: boolean;
    }[]>();

    visibleDays.forEach(day => {
        const dateStr = day.format('YYYY-MM-DD');
        const bookingsOnDay = bookingsByDate.get(dateStr) || [];
        const prevDayBookings = bookingsByDate.get(day.subtract(1, 'day').format('YYYY-MM-DD')) || [];
        const nextDayBookings = bookingsByDate.get(day.add(1, 'day').format('YYYY-MM-DD')) || [];

        const dayLayout = bookingsOnDay.map(booking => ({
            booking,
            slot: bookingSlotMap.get(booking.Booking_ID)!,
            connectsToPrev: prevDayBookings.some(pb => pb.Booking_ID === booking.Booking_ID),
            connectsToNext: nextDayBookings.some(nb => nb.Booking_ID === booking.Booking_ID),
        }));
        layouts.set(dateStr, dayLayout);
    });

    return { dailyLayouts: layouts, maxSlots: globalMaxSlots };
  }, [bookings, currentDate]);

  const startOfMonth = currentDate.startOf('month');
  const endOfMonth = currentDate.endOf('month');
  const startDate = startOfMonth.startOf('week');
  const endDate = endOfMonth.endOf('week');

  const days = [];
  let day = startDate;
  while (day.isBefore(endDate) || day.isSame(endDate, 'day')) {
    days.push(day);
    day = day.add(1, 'day');
  }

  const handlePrevMonth = () => {
    setCurrentDate(currentDate.subtract(1, 'month'));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, 'month'));
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-4 rounded-lg flex flex-col h-full">
        <h1 className="font-bold text-2xl">Calendar</h1>
      <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
              {currentDate.format('MMMM YYYY')}
          </h2>
        <div className="flex items-center gap-2">
            <button onClick={handlePrevMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronLeftIcon /></button>
            <button onClick={handleNextMonth} className="p-2 rounded-full hover:bg-gray-100"><ChevronRightIcon /></button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-0 text-center font-semibold text-gray-600">
        {weekDays.map(wd => <div key={wd}>{wd}</div>)}
      </div>
      <div className="grid grid-cols-7 grid-rows-6 gap-0 flex-grow">
        {days.map((d, i) => {
          const dateStr = d.format('YYYY-MM-DD');
          const dayLayout = dailyLayouts.get(dateStr) || [];
          const isToday = d.isSame(dayjs(), 'day');
          const isCurrentMonth = d.isSame(currentDate, 'month');

          const dayContainerClasses = [
            'relative', 'flex', 'flex-col', 'items-center', 'justify-center', 'h-full',
            'transition-colors',
            isCurrentMonth ? 'text-gray-800' : 'text-gray-300',
          ].join(' ');

          return (
            <div key={i} className={dayContainerClasses}>
                {dayLayout.length > 0 && (
                    <div className="absolute inset-0 flex flex-col justify-start p-px gap-px">
                        {Array.from({ length: maxSlots }).map((_, slotIndex) => {
                            const layoutItem = dayLayout.find(item => item.slot === slotIndex);

                            if (!layoutItem) {
                                return <div key={slotIndex} className="grow basis-0" />;
                            }

                            const { booking, connectsToPrev, connectsToNext } = layoutItem;
                            
                            const style: React.CSSProperties = {
                                backgroundColor: `${booking.color_code}80`,
                                position: 'relative',
                            };
                            const classList = ['grow', 'basis-0'];

                            if (!connectsToPrev && !connectsToNext) classList.push('rounded-full');
                            else if (!connectsToPrev) classList.push('rounded-l-full');
                            else if (!connectsToNext) classList.push('rounded-r-full');

                            let width = '100%';
                            let left = '0';
                            // Add a 1-2px bleed to cover hairline gaps from the zero-gap grid
                            if (connectsToPrev && connectsToNext) {
                                width = 'calc(100% + 2px)';
                                left = '-1px';
                            } else if (connectsToPrev) {
                                width = 'calc(100% + 1px)';
                                left = '-1px';
                            } else if (connectsToNext) {
                                width = 'calc(100% + 1px)';
                            }
                            style.width = width;
                            style.left = left;

                            return (
                                <div
                                    key={slotIndex}
                                    className={classList.join(' ')}
                                    style={style}
                                />
                            );
                        })}
                    </div>
                )}
              <span className={`relative z-10 font-medium w-8 h-8 flex items-center justify-center ${isToday ? 'text-white bg-blue-500 rounded-full' : ''}`}>
                {d.format('D')}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CustomCalendar;
