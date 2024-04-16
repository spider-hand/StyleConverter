import styles from "./Result.module.scss";
import CopyImage from "../assets/images/copy.svg";

export default function Result() {
  return (
    <section className={styles["result"]}>
      <div className={styles["result__header"]}>
        <img src={CopyImage} alt="Copy to clipboard" width={16} height={16} />
      </div>
      <textarea className={styles["result__body"]} rows={10} />
    </section>
  );
}
