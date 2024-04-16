import styles from "./ButtonGroup.module.scss";
import clsx from "clsx";

interface Props<T extends string | number | boolean> {
  label: string;
  options: Map<T, string>;
  selected: T;
  onClick: (key: T) => void;
}

export default function ButtonGroup<T extends string | number | boolean>({
  label,
  options,
  selected,
  onClick,
}: Props<T>) {
  return (
    <section className={styles["button-group"]}>
      <label className={styles["button-group__label"]}>{label}</label>
      <div className={styles["button-group__body"]}>
        {[...options.entries()].map(([key, text], index) => (
          <button
            className={clsx(
              styles["button-group__button"],
              selected !== key && styles["button-group__button--inactive"],
            )}
            key={index}
            onClick={() => onClick(key as T)}
          >
            {text}
          </button>
        ))}
      </div>
    </section>
  );
}
