import { cn } from "@/lib/utils";

/**
 * Card — the core surface container: white, rounded-xl, hairline border,
 * soft shadow. Compose with the sub-components for consistent spacing:
 *
 *   <Card>
 *     <CardHeader>
 *       <CardTitle>Active incidents</CardTitle>
 *       <CardDescription>Last 24 hours</CardDescription>
 *     </CardHeader>
 *     <CardBody> ... </CardBody>
 *     <CardFooter> ... </CardFooter>
 *   </Card>
 *
 * Props:
 *  - interactive : adds hover lift + pointer cursor (for clickable cards)
 *  - padded      : apply default padding directly on Card when not using
 *                  the header/body/footer sub-parts (default false)
 */
export function Card({ interactive = false, padded = false, className, children, ...props }) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface shadow-sm",
        interactive &&
          "cursor-pointer transition-shadow duration-150 hover:shadow-md",
        padded && "p-5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }) {
  return (
    <div
      className={cn("flex flex-col gap-1 p-5 pb-3", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }) {
  return (
    <h3
      className={cn("text-lg font-semibold tracking-tight text-text", className)}
      {...props}
    >
      {children}
    </h3>
  );
}

export function CardDescription({ className, children, ...props }) {
  return (
    <p className={cn("text-sm text-text-secondary", className)} {...props}>
      {children}
    </p>
  );
}

export function CardBody({ className, children, ...props }) {
  return (
    <div className={cn("p-5 pt-2", className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children, ...props }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 border-t border-border p-5 pt-4",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
