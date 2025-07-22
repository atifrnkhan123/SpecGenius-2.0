import { Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="fixed bottom-0 left-0 w-full border-t bg-background/95 py-3 px-4 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-50">
            <div className="text-center text-sm text-muted-foreground">
                SpecGenius | All data is processed locally on your browser.
            </div>
             <div className="flex items-center justify-center text-sm text-muted-foreground mt-1">
                <span>Developed by </span>
                <a href="https://www.linkedin.com/in/mohammad-atif-khan/" target="_blank" rel="noopener noreferrer" className="text-primary/80 hover:underline hover:text-primary ml-1">
                    Mohammad Atif Khan
                </a>
                <a href="https://www.linkedin.com/in/mohammad-atif-khan/" target="_blank" rel="noopener noreferrer" className="text-primary/80 hover:text-primary ml-2">
                    <Linkedin className="h-4 w-4" />
                </a>
            </div>
        </footer>
    );
}
