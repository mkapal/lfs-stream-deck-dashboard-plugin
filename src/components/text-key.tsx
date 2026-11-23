import { Text } from "@fcannizzaro/streamdeck-react";

type TextKeyProps = {
  label: string;
  value: string;
  valueSize?: number;
};

export function TextKey({ label, value, valueSize = 30 }: TextKeyProps) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center bg-black"
      style={{ fontFamily: "Roboto" }}
    >
      <Text size={16} color="#9ca3af" align="center">
        {label}
      </Text>
      <Text size={valueSize} color="white" weight={700} align="center">
        {value}
      </Text>
    </div>
  );
}
