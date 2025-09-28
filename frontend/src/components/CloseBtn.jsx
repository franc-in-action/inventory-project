import { Button, useStyleConfig } from "@chakra-ui/react";

export default function CloseBtn({ onClick, ...props }) {
  // Pull the CloseBtn styles from the theme
  const styles = useStyleConfig("CloseBtn");

  return <Button onClick={onClick} __css={styles} {...props} />;
}
