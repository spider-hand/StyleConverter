import styles from "./App.module.scss";
import "./global.scss";
import ButtonGroup from "./components/ButtonGroup";
import Result from "./components/Result";
import Checkbox from "./components/Checkbox";
import { useEffect, useState } from "react";
import { COLOR_FORMAT_MAP, LANGUAGE_MAP } from "./constants";
import {
  ColorFormatType,
  IPluginMessage,
  IResult,
  LanguageType,
} from "../typings";

export default function App() {
  const [language, setLanguage] = useState<LanguageType>("sass");
  const [colorFormat, setColorFormat] = useState<ColorFormatType>("hsl");
  const [excludeFolderName, setExcludeFolderName] = useState(true);
  const [useVariables, setUseVariables] = useState(true);
  const [rootClass, setRootClass] = useState("");
  const [variables, setVariables] = useState("");

  useEffect(() => {
    window.onmessage = (event) => {
      const { rootClass, variables } = event.data.pluginMessage as IResult;
      setRootClass(rootClass);
      setVariables(variables);
    };
  }, []);

  const generateResult = () => {
    parent.postMessage(
      {
        pluginMessage: {
          language: language,
          colorFormat: colorFormat,
          excludeFolderName: excludeFolderName,
          useVariables: useVariables,
        } as IPluginMessage,
      },
      "*",
    );
  };

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
                text={"Use variables"}
                checked={useVariables}
                onClick={() => setUseVariables(!useVariables)}
              />
            )}
          </div>
        </section>
      </section>
      <footer className={styles["app__footer"]}>
        <button className={styles["app__button"]} onClick={generateResult}>
          Generate
        </button>
        <Result value={rootClass} />
        {variables !== "" && <Result value={variables} />}
      </footer>
    </main>
  );
}
