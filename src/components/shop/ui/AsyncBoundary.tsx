import { Brand } from "@/constants/theme";
import { ReactNode } from "react";
import { Text, View } from "react-native";

interface AsyncBoundaryProps {
  loading: boolean;
  error?: Error | null;
  /** What to render while loading — pass a skeleton matching the real content's shape. */
  skeleton: ReactNode;
  /** The real content, shown once loading is false and there's no error. */
  children: ReactNode;
  /** Optional custom error UI — otherwise a minimal default message is shown. */
  errorFallback?: ReactNode;
}

/**
 * Centralizes the loading/error/success decision so individual screens and
 * components don't each reimplement `if (loading) return <Skeleton/>`.
 * Pass a skeleton shaped like the real content to avoid layout shift when
 * data arrives.
 */
const AsyncBoundary = ({
  loading,
  error,
  skeleton,
  children,
  errorFallback,
}: AsyncBoundaryProps) => {
  if (error) {
    return (
      <>
        {errorFallback ?? (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ color: Brand.text, opacity: 0.6 }}>
              Something went wrong loading this.
            </Text>
          </View>
        )}
      </>
    );
  }

  if (loading) return <>{skeleton}</>;

  return <>{children}</>;
};

export default AsyncBoundary;
