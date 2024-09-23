import { Header } from "@/components/sections/Header";
import { Sidebar } from "@/components/sections/Sidebar";
import { Badge } from "@/components/ui/badge";

import { IconController } from "@/components/sections/IconController";
import { BackgroundController } from "./components/sections/BackgroundController";
import { useState } from "react";

function App() {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  return (
    <div className="grid h-screen w-full pl-[56px] antialiased">
      <Sidebar selectedSidebarItem={(value) => setSelectedIndex(value)} />
      <div className="flex flex-col">
        <Header />
        <main className="grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3">
          <section className="relative hidden flex-col items-start gap-8 md:flex">
            {selectedIndex === 0 ? (
              <IconController />
            ) : (
              <BackgroundController />
            )}
          </section>
          <section className="relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2">
            <Badge variant="outline" className="absolute right-3 top-3">
              Output
            </Badge>
            <div className="flex-1"></div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default App;
