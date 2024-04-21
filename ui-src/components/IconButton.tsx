import styles from "./IconButton.module.scss";

interface Props {
  icon: string;
  onClick: () => void;
}

export default function IconButton({ icon, onClick }: Props) {
  return (
    <button className={styles["icon-button"]} onClick={onClick}>
      <img
        className={styles["icon-button__image"]}
        src={icon}
        width={16}
        height={16}
      />
    </button>
  );
}
