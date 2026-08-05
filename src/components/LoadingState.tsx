export default function LoadingState() {
  return (
    <div className="px-4 py-8 animate-fade-in-up">
      {/* Song card skeleton */}
      <div className="p-4 rounded-2xl bg-cream-200/60 dark:bg-dark-50/60 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-xl skeleton" />
          <div className="flex-1 space-y-2">
            <div className="h-2 w-14 skeleton" />
            <div className="h-5 w-40 skeleton" />
            <div className="h-2 w-12 skeleton mt-3" />
            <div className="h-4 w-32 skeleton" />
          </div>
        </div>
      </div>

      {/* Confidence badge skeleton */}
      <div className="h-6 w-28 skeleton mb-4" />

      {/* Section: Contexto Histórico */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg skeleton" />
        <div className="h-5 w-40 skeleton" />
      </div>
      <div className="space-y-2 mb-8 ml-9">
        <div className="h-3 w-full skeleton" />
        <div className="h-3 w-5/6 skeleton" />
        <div className="h-3 w-4/5 skeleton" />
      </div>

      {/* Section: Inspiração */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg skeleton" />
        <div className="h-5 w-32 skeleton" />
      </div>
      <div className="space-y-2 mb-8 ml-9">
        <div className="h-3 w-full skeleton" />
        <div className="h-3 w-3/4 skeleton" />
      </div>

      {/* Section: História principal */}
      <div className="h-7 w-56 skeleton mb-4" />
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-[1px] bg-cream-300 dark:bg-brown-500/30" />
        <div className="h-6 w-16 skeleton" />
        <div className="flex-1 h-[1px] bg-cream-300 dark:bg-brown-500/30" />
      </div>
      <div className="space-y-3 mb-8">
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-4/5 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-3/4 skeleton" />
        <div className="h-4 w-full skeleton" />
        <div className="h-4 w-5/6 skeleton" />
      </div>

      {/* Curiosidades skeleton */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg skeleton" />
        <div className="h-5 w-28 skeleton" />
      </div>
      <div className="space-y-2 mb-6 ml-4">
        <div className="h-3 w-full skeleton" />
        <div className="h-3 w-5/6 skeleton" />
        <div className="h-3 w-4/5 skeleton" />
      </div>

      {/* Loading message */}
      <div className="flex items-center justify-center gap-2 mt-6">
        <div className="flex gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-copper-400 dark:bg-copper-400 animate-pulse-dot" />
          <div className="w-1.5 h-1.5 rounded-full bg-copper-400 dark:bg-copper-400 animate-pulse-dot" style={{ animationDelay: '0.2s' }} />
          <div className="w-1.5 h-1.5 rounded-full bg-copper-400 dark:bg-copper-400 animate-pulse-dot" style={{ animationDelay: '0.4s' }} />
        </div>
        <p className="font-inter text-sm text-brown-300 dark:text-cream-300/50 italic">
          Descobrindo a origem dessa canção...
        </p>
      </div>
    </div>
  );
}
