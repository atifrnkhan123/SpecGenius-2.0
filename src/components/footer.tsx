import { Separator } from "@/components/ui/separator";

export function Footer() {
    return (
        <footer className="fixed bottom-0 left-0 w-full border-t bg-background/95 py-3 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
            <div className="text-center text-sm text-muted-foreground">
                SpecGenius | All data is processed locally on your browser.
            </div>
             <div className="text-center text-sm text-muted-foreground mt-1">
                Developed by <a href="https://void.studio" target="_blank" rel="noopener noreferrer" className="text-primary/80 hover:underline hover:text-primary">Void Studio</a>
            </div>
        </footer>
    );
}
