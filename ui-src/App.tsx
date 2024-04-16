import styles from "./App.module.scss";
import "./global.scss";
import ButtonGroup from "./components/ButtonGroup";
import Result from "./components/Result";
import Checkbox from "./components/Checkbox";
import { useState } from "react";
import { COLOR_FORMAT_MAP, LANGUAGE_MAP } from "./constants";
import { ColorFormatType, LanguageType } from "./typings";

export default function App() {
  const [language, setLanguage] = useState<LanguageType>("sass");
  const [colorFormat, setColorFormat] = useState<ColorFormatType>("hsl");
  const [excludeFolderName, setExcludeFolderName] = useState(true);
  const [useVarFunc, setUseVarFunc] = useState(true);

  return (
    <main className={styles["app"]}>
      <header className={styles["app__header"]}>
        Convert your styles into CSS
      </header>
      <section className={styles["app__body"]}>
        <ButtonGroup
          label={"Language"}
          options={LANGUAGE_MAP}
          selected={language}
          onClick={(val) => setLanguage(val)}
        />
        <ButtonGroup
          label={"Color Format"}
          options={COLOR_FORMAT_MAP}
          selected={colorFormat}
          onClick={(val) => setColorFormat(val)}
        />
        <section className={styles["app__section"]}>
          <label className={styles["app__section-label"]}>Other Options</label>
          <div className={styles["app__section-body"]}>
            <Checkbox
              text={"Exclude folder name"}
              checked={excludeFolderName}
              onClick={() => setExcludeFolderName(!excludeFolderName)}
            />
            {language === "sass" && (
              <Checkbox
                text={"Apply the styles using var() function"}
                checked={useVarFunc}
                onClick={() => setUseVarFunc(!useVarFunc)}
              />
            )}
          </div>
        </section>
      </section>
      <footer className={styles["app__footer"]}>
        <button className={styles["app__button"]}>Generate</button>
        <Result />
      </footer>
    </main>
  );
}
