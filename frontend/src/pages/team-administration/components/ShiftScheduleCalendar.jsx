import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ShiftScheduleCalendar = ({ schedules, onEditShift, onAddShift }) => {
  const [currentWeek, setCurrentWeek] = useState(0);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const getWeekDates = (weekOffset) => {
    const today = new Date(2025, 11, 23);
    const startOfWeek = new Date(today);
    startOfWeek?.setDate(today?.getDate() - today?.getDay() + 1 + (weekOffset * 7));
    
    return daysOfWeek?.map((_, index) => {
      const date = new Date(startOfWeek);
      date?.setDate(startOfWeek?.getDate() + index);
      return date;
    });
  };

  const weekDates = getWeekDates(currentWeek);

  const getShiftColor = (shiftType) => {
    switch (shiftType) {
      case 'morning':
        return 'bg-success/10 border-success text-success';
      case 'afternoon':
        return 'bg-warning/10 border-warning text-warning';
      case 'night':
        return 'bg-primary/10 border-primary text-primary';
      default:
        return 'bg-muted border-border text-muted-foreground';
    }
  };

  const formatDate = (date) => {
    return date?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isToday = (date) => {
    const today = new Date(2025, 11, 23);
    return date?.toDateString() === today?.toDateString();
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 md:p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg md:text-xl font-semibold text-foreground mb-1">
            Shift Schedule
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage team shifts and coverage
          </p>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronLeft"
            onClick={() => setCurrentWeek(currentWeek - 1)}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentWeek(0)}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="sm"
            iconName="ChevronRight"
            iconPosition="right"
            onClick={() => setCurrentWeek(currentWeek + 1)}
          />
          <Button
            variant="default"
            size="sm"
            iconName="Plus"
            iconPosition="left"
            onClick={onAddShift}
            className="ml-2"
          >
            Add Shift
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-full inline-block align-middle">
          <div className="grid grid-cols-7 gap-2 md:gap-3 min-w-[800px]">
            {weekDates?.map((date, dayIndex) => (
              <div key={dayIndex} className="min-w-0">
                <div className={`text-center p-2 md:p-3 rounded-t-lg ${isToday(date) ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  <div className="text-xs font-medium mb-1">
                    {daysOfWeek?.[dayIndex]?.substring(0, 3)}
                  </div>
                  <div className="text-sm md:text-base font-semibold">
                    {formatDate(date)}
                  </div>
                </div>
                <div className="space-y-2 mt-2 min-h-[200px]">
                  {schedules?.filter(schedule => schedule?.dayIndex === dayIndex)?.map((schedule, index) => (
                      <div
                        key={index}
                        className={`p-2 rounded-lg border ${getShiftColor(schedule?.shiftType)} cursor-pointer hover:shadow-md transition-all duration-200`}
                        onClick={() => onEditShift(schedule)}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Image
                            src={schedule?.avatar}
                            alt={schedule?.avatarAlt}
                            className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                          />
                          <span className="text-xs font-medium truncate">
                            {schedule?.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs">
                          <Icon name="Clock" size={12} />
                          <span className="whitespace-nowrap">{schedule?.time}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-success/10 border border-success" />
          <span className="text-xs md:text-sm text-muted-foreground">Morning (6AM - 2PM)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-warning/10 border border-warning" />
          <span className="text-xs md:text-sm text-muted-foreground">Afternoon (2PM - 10PM)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary/10 border border-primary" />
          <span className="text-xs md:text-sm text-muted-foreground">Night (10PM - 6AM)</span>
        </div>
      </div>
    </div>
  );
};

export default ShiftScheduleCalendar;