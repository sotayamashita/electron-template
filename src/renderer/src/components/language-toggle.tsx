import { LANGUAGE_OPTIONS } from "#shared/constants";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { IconLanguage } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

/**
 * Language Toggle Component
 * Allows the user to switch between supported languages
 */
export function LanguageToggle(): React.JSX.Element {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = async (language: string): Promise<void> => {
    if (language === i18n.language) return;

    // Update UI immediately for user feedback
    i18n.changeLanguage(language);

    // Persist language setting using tRPC
    await trpc.lang.set.mutate(language as "en" | "ja");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <IconLanguage className="h-[1.2rem] w-[1.2rem]" />
          <span className="sr-only">{t("language.title")}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {LANGUAGE_OPTIONS.map((language) => (
          <DropdownMenuItem
            key={language}
            onClick={() => handleLanguageChange(language)}
            className={i18n.language === language ? "bg-muted" : ""}
          >
            {t(`language.${language}`)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
