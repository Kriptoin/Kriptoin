import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

interface ExampleAlertProps {
  colors: {
    primary: string;
    secondary: string;
    background: string;
  };
}

export const ExampleAlert = ({ colors }: ExampleAlertProps) => {
  return (
    <Card
      className="w-full text-center"
      style={{ backgroundColor: colors.background }}
      id="example-alert"
    >
      <CardHeader className="p-4">
        <CardTitle className="font-normal flex flex-col gap-2">
          <span className="font-normal" style={{ color: colors.primary }}>
            Kriptoin
          </span>
          <span className="font-medium" style={{ color: colors.secondary }}>
            5.000 IDRX
          </span>
        </CardTitle>
      </CardHeader>
      <CardFooter className="text-sm p-4 pt-0 flex-grow items-end" style={{ color: colors.primary }}>
        Lorem ipsum dolor sit amet consectetur, adipisicing elit. Atque possimus
        dignissimos repudiandae unde autem eius inventore cumque.
      </CardFooter>
    </Card>
  );
};
