'use client';

import { useState, useEffect } from 'react';
import { format, formatDistanceToNow, type Options } from 'date-fns';
import { Timestamp } from 'firebase/firestore';

type ClientOnlyDateProps = {
  date: Date | Timestamp | string | number;
  formatString?: string;
  formatType?: 'format' | 'formatDistanceToNow';
  distanceOptions?: Options;
  fallback?: React.ReactNode;
};

export default function ClientOnlyDate({
  date,
  formatString = 'MMM d, yyyy',
  formatType = 'format',
  distanceOptions,
  fallback = null,
}: ClientOnlyDateProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <>{fallback}</>;
  }

  const dateObject = date instanceof Timestamp ? date.toDate() : new Date(date);

  let formattedDate;
  if (formatType === 'formatDistanceToNow') {
    formattedDate = formatDistanceToNow(dateObject, { ...distanceOptions, addSuffix: true });
  } else {
    formattedDate = format(dateObject, formatString);
  }

  return <span>{formattedDate}</span>;
}
