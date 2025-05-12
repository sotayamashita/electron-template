import type { Todo } from "#shared/domain/todo";
import { LanguageToggle } from "@/components/language-toggle";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import {
  IconBrandReact,
  IconBrandTypescript,
  IconBrandVite,
  IconPlus,
  IconTrash,
} from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

function Versions(): React.JSX.Element {
  const [versions] = useState(window.electron.process.versions);
  return (
    <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-600 dark:text-slate-400">
      <div className="flex items-center gap-1.5">
        <span className="font-medium">Electron</span>
        <span>v{versions.electron}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-medium">Chromium</span>
        <span>v{versions.chrome}</span>
      </div>
      <div className="flex items-center gap-1.5">
        <span className="font-medium">Node</span>
        <span>v{versions.node}</span>
      </div>
    </div>
  );
}

function App(): React.JSX.Element {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const pingHandle = async (): Promise<void> => {
    const res = await trpc.ping.query();
    console.log("[renderer] ", res);
  };
  const handleToggle = async (id: string): Promise<void> => {
    try {
      const updated = await trpc.task.toggle.mutate({ id });
      setTasks(updated);
    } catch (err) {
      console.error("toggle error", err);
    }
  };

  const handleAdd = async (): Promise<void> => {
    const title = newTitle.trim();
    if (!title) return;
    try {
      const updated = await trpc.task.add.mutate({ title });
      setTasks(updated);
      setNewTitle("");
    } catch (err) {
      console.error("add error", err);
    }
  };

  const handleDelete = useCallback(async (id: string) => {
    try {
      const updated = await trpc.task.remove.mutate({ id });
      setTasks(updated);
    } catch (err) {
      console.error("remove error", err);
    }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const list = await trpc.task.list.query();
        setTasks(list);
      } catch (err) {
        console.error("initial fetch error", err);
      }
    })();
  }, []);

  return (
    <div className="bg-background flex min-h-screen flex-col transition-colors duration-300">
      {/* Header */}
      <header className="bg-background/80 sticky top-0 z-10 border-b backdrop-blur-sm">
        <div className="flex h-16 items-center justify-between px-4">
          <div className="ml-auto flex items-center gap-2">
            <LanguageToggle />
            <ModeToggle />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto flex-1 px-4 py-8">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="mb-6 w-full justify-start">
            <TabsTrigger value="about">{t("common.about")}</TabsTrigger>
            <TabsTrigger value="todos">{t("todo.title")}</TabsTrigger>
          </TabsList>

          <TabsContent value="todos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("todo.title")}</CardTitle>
                <CardDescription>{t("todo.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder={t("todo.placeholder")}
                    onKeyDown={(e) => e.key === "Enter" && handleAdd()}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={handleAdd}
                    className="cursor-pointer"
                  >
                    <IconPlus /> {t("todo.add")}
                  </Button>
                </div>

                {tasks.length > 0 ? (
                  <div className="rounded-md border">
                    {tasks.map((task, index) => (
                      <div key={task.id}>
                        {index > 0 && <Separator />}
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={`task-${task.id}`}
                              checked={task.completed}
                              onCheckedChange={() => handleToggle(task.id)}
                            />
                            <label
                              htmlFor={`task-${task.id}`}
                              className={`text-sm leading-none font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
                                task.completed
                                  ? "text-muted-foreground line-through"
                                  : "text-foreground"
                              }`}
                            >
                              {task.title}
                            </label>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(task.id)}
                            className="text-muted-foreground hover:text-destructive h-8 w-8 cursor-pointer"
                          >
                            <IconTrash className="h-4 w-4" />
                            <span className="sr-only">{t("todo.delete")}</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-muted rounded-md p-4 text-center">
                    <p className="text-muted-foreground text-sm">
                      {t("todo.empty")}
                    </p>
                  </div>
                )}
              </CardContent>
              <CardFooter className="text-muted-foreground text-xs">
                {t("todo.task_count", { count: tasks.length })}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("common.about")}</CardTitle>
                <CardDescription>{t("app.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 py-2">
                  <div className="flex items-center">
                    <IconBrandReact className="mr-1.5 h-5 w-5 text-blue-500" />
                    <span className="font-medium">React</span>
                  </div>
                  <span className="text-muted-foreground">+</span>
                  <div className="flex items-center">
                    <IconBrandTypescript className="mr-1.5 h-5 w-5 text-blue-700" />
                    <span className="font-medium">TypeScript</span>
                  </div>
                  <span className="text-muted-foreground">+</span>
                  <div className="flex items-center">
                    <IconBrandVite className="mr-1.5 h-5 w-5 text-blue-500" />
                    <span className="font-medium">Vite</span>
                  </div>
                </div>

                <div className="bg-muted text-muted-foreground rounded-md p-3 text-xs">
                  Press{" "}
                  <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                    F12
                  </kbd>{" "}
                  or{" "}
                  <kbd className="bg-muted text-muted-foreground pointer-events-none inline-flex h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium opacity-100 select-none">
                    Ctrl+Shift+I
                  </kbd>{" "}
                  to open the dev&nbsp;tools
                </div>

                <Separator />

                <Versions />
              </CardContent>
              <CardFooter className="flex flex-col gap-2 sm:flex-row">
                <Button
                  asChild
                  variant="outline"
                  className="flex-1 justify-center"
                >
                  <a
                    href="https://electron-vite.org/"
                    target="_blank"
                    rel="noreferrer"
                  >
                    {t("common.documentation")}
                  </a>
                </Button>

                <Button
                  type="button"
                  onClick={pingHandle}
                  className="flex-1 justify-center"
                >
                  {t("common.send_ipc")}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

export default App;
