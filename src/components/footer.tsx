import { Separator } from "@/components/ui/separator";

export function Footer() {
    return (
        <footer className="w-full mt-auto py-8 px-4 md:px-6 shrink-0">
            <Separator className="mb-4" />
            <div className="text-center text-sm text-muted-foreground">
                SpectacleAPI | All data is processed locally on your browser.
            </div>
             <div className="text-center text-sm text-muted-foreground mt-1">
                Developed by <a href="https://void.studio" target="_blank" rel="noopener noreferrer" className="text-primary/80 hover:underline hover:text-primary">Void Studio</a>
            </div>
        </footer>
    );
}