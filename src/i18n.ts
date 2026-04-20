import i18next from "i18next";
import Backend from "i18next-fs-backend";
import path from "path";

export const i18nInit = async () => {
  await i18next.use(Backend).init({
    fallbackLng: "ru",
    ns: ["translation"],
    defaultNS: "translation",
    backend: {
      loadPath: path.join(process.cwd(), "locales/{{lng}}.json"),
    },
    interpolation: { escapeValue: false },
    debug: false,
    preload: ["ru", "en"],
  });
};