import { useEffect, useRef } from 'react';
import { useFocusable as useNoriginFocusable } from '@noriginmedia/norigin-spatial-navigation';

interface UseFocusableOptions {
    focusKey?: string;
    onEnterPress?: () => void;
    onArrowPress?: (direction: string) => boolean;
    extraProps?: any;
}

export const useFocusable = (options: UseFocusableOptions = {}) => {
    const { ref, focused, focusSelf } = useNoriginFocusable({
        focusKey: options.focusKey,
        onEnterPress: options.onEnterPress,
        onArrowPress: options.onArrowPress,
        extraProps: options.extraProps,
    });

    const elementRef = useRef<HTMLElement | null>(null);

    // Auto-scroll focused element into view
    useEffect(() => {
        if (focused && elementRef.current) {
            elementRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center',
            });
        }
    }, [focused]);

    // Combine refs
    const combinedRef = (element: HTMLElement | null) => {
        elementRef.current = element;
        if (ref) {
            if (typeof ref === 'function') {
                ref(element);
            } else {
                (ref as React.MutableRefObject<HTMLElement | null>).current = element;
            }
        }
    };

    return {
        ref: combinedRef,
        focused,
        focusSelf,
    };
};
