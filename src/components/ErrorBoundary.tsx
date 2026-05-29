import { Component, type ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import { captureException } from "@/lib/sentry";

type Props = { children: ReactNode };
type State = { hasError: boolean; error?: Error };

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    captureException(error, { componentStack: info.componentStack });
  }

  reset = () => this.setState({ hasError: false, error: undefined });

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0F172A",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          gap: 16,
        }}
      >
        <Text style={{ fontSize: 56 }}>😵</Text>
        <Text
          style={{
            color: "#FFFFFF",
            fontSize: 22,
            fontWeight: "800",
            textAlign: "center",
          }}
        >
          Qualcosa è andato storto
        </Text>
        <Text
          style={{
            color: "#CBD5E1",
            fontSize: 14,
            textAlign: "center",
            lineHeight: 20,
            maxWidth: 320,
          }}
        >
          Abbiamo riscontrato un errore inaspettato. Riprova tra un momento.
          Se persiste, scrivici a support@nvmcars.it.
        </Text>
        <Pressable
          onPress={this.reset}
          accessibilityRole="button"
          accessibilityLabel="Riprova"
          style={{
            marginTop: 8,
            paddingHorizontal: 24,
            paddingVertical: 14,
            backgroundColor: "#06B6D4",
            borderRadius: 14,
          }}
        >
          <Text style={{ color: "#FFFFFF", fontWeight: "800", fontSize: 16 }}>
            Riprova
          </Text>
        </Pressable>
      </View>
    );
  }
}
