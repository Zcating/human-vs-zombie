import React from 'react';

type ResultBox<T> = { v: T };

export function useConstant<T>(createValue: () => T): T {
  const ref = React.useRef<ResultBox<T> | null>(null);

  if (!ref.current) {
    ref.current = { v: createValue() };
  }

  return ref.current.v;
}
