interface TimelineProps {
  ano: string;
}

export default function Timeline({ ano }: TimelineProps) {
  return (
    <div className="flex items-center gap-3 my-6 animate-fade-in-up-delay">
      <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-copper-400/60 to-copper-400/60 dark:via-copper-500/40 dark:to-copper-500/40" />
      <div className="relative flex items-center">
        <div className="w-3 h-3 rounded-full bg-copper-500 dark:bg-copper-400 shadow-sm shadow-copper-500/40" />
        <div className="absolute w-6 h-6 rounded-full bg-copper-500/20 animate-ping" style={{ animationDuration: '2s' }} />
        <span className="ml-3 font-playfair text-lg font-semibold text-copper-500 dark:text-copper-400 whitespace-nowrap">
          {ano}
        </span>
      </div>
      <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-copper-400/60 to-copper-400/60 dark:via-copper-500/40 dark:to-copper-500/40" />
    </div>
  );
}
