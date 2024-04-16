import styles from "./Checkbox.module.scss";
import clsx from "clsx";
import CheckImage from "../assets/images/check.svg";

interface Props {
  text: string;
  checked: boolean;
  onClick: () => void;
}

export default function Checkbox({ text, checked, onClick }: Props) {
  return (
    <div className={styles["checkbox"]}>
      <button
        className={clsx(
          styles["checkbox__button"],
          !checked && styles["checkbox__button--unchecked"],
        )}
        onClick={onClick}
      >
        {checked && <img src={CheckImage} width={16} height={16} />}
      </button>
      <span className={styles["checkbox__text"]}>{text}</span>
    </div>
  );
}
