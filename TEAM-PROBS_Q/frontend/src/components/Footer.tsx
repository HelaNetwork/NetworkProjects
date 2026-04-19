export function Footer() {
    return (
        <footer className="border-t border-[var(--border-default)] mt-20 py-8">
            <div className="max-w-7xl mx-auto px-6 text-center text-sm text-[var(--text-muted)]">
                <p className="mb-8">
                    Built for the <span className="text-[var(--text-primary)] font-semibold">HeLa Hackathon</span>
                </p>
                <div className="bg-[var(--bg-secondary)] border border-[var(--border-default)] rounded-xl p-6 max-w-2xl mx-auto">
                    <p className="font-bold text-[var(--accent-light)] text-lg mb-4 uppercase tracking-wide">Team PROBS-Q</p>
                    <div className="flex flex-col sm:flex-row justify-center items-center gap-8 sm:gap-16">
                        <div className="text-center group">
                            <p className="text-[var(--text-primary)] font-bold mb-1 group-hover:text-[var(--accent)] transition-colors">RAVIKANT</p>
                            <p className="text-xs text-[var(--text-secondary)] font-mono bg-[var(--bg-card)] px-2 py-1 rounded inline-block">24f2100137@es.study.iitm.ac.in</p>
                        </div>
                        <div className="text-center group">
                            <p className="text-[var(--text-primary)] font-bold mb-1 group-hover:text-[var(--accent)] transition-colors">MADHUKAR VAIBHAV</p>
                            <p className="text-xs text-[var(--text-secondary)] font-mono bg-[var(--bg-card)] px-2 py-1 rounded inline-block">246301111@gkv.ac.in</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
