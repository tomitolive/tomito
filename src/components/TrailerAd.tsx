import { useEffect, useRef } from 'react';

/**
 * TrailerAd — يتم تحميله فقط في صفحات التريلر (MovieTrailer / TVTrailer).
 * كل مرة تتغير الـ key (slug) يُعاد حقن إعلان جديد.
 */
interface TrailerAdProps {
  /** يجب تمرير slug أو id التريلر كـ key حتى يُعاد الإعلان عند كل تريلر جديد */
  adKey: string;
}

export default function TrailerAd({ adKey }: TrailerAdProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // تنظيف المحتوى القديم عند تغيير التريلر
    container.innerHTML = '';

    // إنشاء عنصر الإعلان
    const ins = document.createElement('ins');
    ins.className = 'eas6a97888e37';
    ins.setAttribute('data-zoneid', '5979350');
    container.appendChild(ins);

    // حقن سكريبت push الإعلان
    const pushScript = document.createElement('script');
    pushScript.textContent = '(window.AdProvider = window.AdProvider || []).push({"serve": {}});';
    container.appendChild(pushScript);

    // محاولة مباشرة لو الـ provider محمّل
    try {
      (window as any).AdProvider = (window as any).AdProvider || [];
      (window as any).AdProvider.push({ serve: {} });
    } catch (e) {
      // silent
    }

    return () => {
      container.innerHTML = '';
    };
  }, [adKey]);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-[100px] my-4"
      aria-label="إعلان"
    />
  );
}
