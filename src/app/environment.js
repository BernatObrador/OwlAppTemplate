import { createRouter } from "@/router/router.js";
import { routes } from "@/router/routes.js";
import { ApiService } from "@/services/api.js";
import { AuthService } from "@/services/auth.js";
import { LoadingService } from "@/services/loading.js";
import { NotificationService } from "@/services/notification.js";
import { StorageService } from "@/services/storage.js";
import { createMockTransport } from "@/mocks/mockTransport.js";
import { MainLayout } from "@/layouts/MainLayout/MainLayout.js";
import { navigation } from "@/router/navigation.js";

export async function buildEnvironment() {
  const loading = new LoadingService();
  const notifications = new NotificationService();
  const storage = new StorageService(
    import.meta.env.VITE_STORAGE_PREFIX || "owl-app",
  );
  const useMock =
    String(import.meta.env.VITE_USE_MOCK_API ?? "true") === "true";
  const transport = useMock ? createMockTransport({ storage }) : null;

  const api = new ApiService({
    baseUrl: import.meta.env.VITE_API_URL || "/api",
    loading,
    transport,
  });
  const auth = new AuthService({ api, storage });
  await auth.restore();

  const router = createRouter({ routes, auth, layouts: { main: MainLayout } });
  api.onUnauthorized = () => {
    if (!auth.isAuthenticated) return;
    auth.clear();
    notifications.add("Your session has expired. Please sign in again.", {
      type: "warning",
    });
    void router.resolve();
  };

  return {
    appName: import.meta.env.VITE_APP_NAME || "OWL Business App",
    useMock,
    navigation,
    api,
    auth,
    loading,
    notifications,
    router,
    storage,
  };
}
