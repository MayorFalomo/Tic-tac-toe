import { useEffect } from 'react';

interface UseOnClickOutsideProps {
    ref: React.RefObject<HTMLElement>;
    handler: (event: MouseEvent | TouchEvent) => void;
}

const useOnClickOutside = ({ ref, handler }: UseOnClickOutsideProps): void => {
    useEffect(() => {
        const listener = (event: MouseEvent | TouchEvent): void => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ref, handler]);
};

export default useOnClickOutside;