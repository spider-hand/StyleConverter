import styles from "./Result.module.scss";
import CopyImage from "../assets/images/copy.svg";
import { useRef } from "react";
import IconButton from "./IconButton";

interface Props {
  value: string;
}

export default function Result({ value }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const copyToClipboard = () => {
    textareaRef.current?.select();
    document.execCommand("copy");
  };

  return (
    <section className={styles["result"]}>
      <div className={styles["result__header"]}>
        <IconButton icon={CopyImage} onClick={copyToClipboard} />
      </div>
      <textarea
        className={styles["result__body"]}
        rows={10}
        value={value}
        ref={textareaRef}
      />
    </section>
  );
}
