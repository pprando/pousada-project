import { DayPicker } from "react-day-picker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar as CalendarIcon } from "lucide-react";

type CalendarProps = {
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  className?: string;
  disabled?: Date | Date[] | { from: Date; to?: Date } | ((date: Date) => boolean);
  disabledDates?: Date[];
  reservedDates?: Date[];
  footer?: React.ReactNode;
  showOutsideDays?: boolean;
}

export default function Calendar({
  selected,
  onSelect,
  className,
  disabled,
  disabledDates = [],
  reservedDates = [],
  footer,
  showOutsideDays = true,
}: CalendarProps) {
  const handleDisabled = (date: Date): boolean => {
    if (disabled === undefined && disabledDates.length === 0) {
      return false;
    }

    if (typeof disabled === 'function') {
      return disabled(date);
    }

    if (disabled instanceof Date) {
      return (
        date.getFullYear() === disabled.getFullYear() &&
        date.getMonth() === disabled.getMonth() &&
        date.getDate() === disabled.getDate()
      );
    }

    if (Array.isArray(disabled)) {
      return disabled.some(
        (disabledDate) =>
          date.getFullYear() === disabledDate.getFullYear() &&
          date.getMonth() === disabledDate.getMonth() &&
          date.getDate() === disabledDate.getDate()
      );
    }

    if (disabled && typeof disabled === 'object' && 'from' in disabled) {
      const start = disabled.from;
      const end = disabled.to || new Date();
      return date >= start && date <= end;
    }

    return disabledDates.some(
      (disabledDate) =>
        date.getFullYear() === disabledDate.getFullYear() &&
        date.getMonth() === disabledDate.getMonth() &&
        date.getDate() === disabledDate.getDate()
    );
  };

  const modifiers = {
    reserved: reservedDates,
  };

  const modifiersStyles = {
    reserved: {
      backgroundColor: 'rgb(254, 249, 195)', // Yellow background
      color: 'rgb(161, 98, 7)', // Amber text
      fontWeight: 'bold',
    },
  };

  return (
    <div className={cn("p-4", className)}>
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-primary/10 rounded-xl">
          <CalendarIcon className="h-5 w-5 text-primary" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900">
          {selected instanceof Date
            ? format(selected, "d 'de' MMMM 'de' yyyy", { locale: ptBR })
            : 'Selecione uma data'}
        </h2>
      </div>

      <DayPicker
        mode="single"
        selected={selected}
        onSelect={onSelect}
        disabled={handleDisabled}
        modifiers={modifiers}
        modifiersStyles={modifiersStyles}
        showOutsideDays={showOutsideDays}
        locale={ptBR}
        className={cn(
          'p-4 bg-white rounded-xl border border-gray-100 shadow-sm',
          'rdp-day_selected:bg-primary rdp-day_selected:text-primary-foreground',
          'rdp-day_today:bg-accent rdp-day_today:text-accent-foreground',
          'rdp-day_disabled:opacity-50 rdp-day_disabled:cursor-not-allowed',
          'rdp-day:hover:bg-primary/10 rdp-day:hover:text-primary',
          'rdp-day:focus:bg-primary/10 rdp-day:focus:text-primary',
          'rdp-button:hover:bg-primary/10 rdp-button:hover:text-primary',
          'rdp-nav_button:hover:bg-primary/10 rdp-nav_button:hover:text-primary'
        )}
      />

      {footer && <div className="mt-4">{footer}</div>}
    </div>
  );
}