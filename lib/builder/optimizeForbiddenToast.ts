import { toast } from "@/hooks/use-toast";

export type Optimize403Payload = {
  error?: unknown;
  message?: unknown;
};

type RouterPush = (path: string) => void;

/**
 * Maps optimize-resume 403 payloads to toasts. Returns true if handled (caller should return).
 */
export function showOptimizeForbiddenToast(routerPush: RouterPush, data: Optimize403Payload): boolean {
  const err = typeof data.error === "string" ? data.error : "";
  const msg = typeof data.message === "string" ? data.message : undefined;

  if (err === "subscription_required") {
    toast({
      title: "Subscription required",
      description:
        msg ?? "Start your trial or subscribe on the plans page (card required).",
      variant: "destructive",
    });
    routerPush("/pricing");
    return true;
  }

  if (err === "trial_daily_limit") {
    toast({
      title: "Trial daily limit",
      description:
        msg ?? "Trial includes one optimization per UTC day. Try again tomorrow or upgrade for unlimited runs.",
      variant: "destructive",
    });
    return true;
  }

  if (err === "trial_ended") {
    toast({
      title: "Trial ended",
      description: msg ?? "Update your subscription in billing to continue.",
      variant: "destructive",
    });
    routerPush("/pricing");
    return true;
  }

  if (err === "free_daily_limit" || err === "welcome_daily_limit") {
    toast({
      title: "Daily free limit",
      description:
        msg ?? "One free optimization per UTC day. Try again tomorrow or upgrade.",
      variant: "destructive",
    });
    return true;
  }

  if (err === "free_cap_exceeded") {
    toast({
      title: "Free plan finished",
      description: msg ?? "Upgrade to continue optimizing resumes.",
      variant: "destructive",
    });
    routerPush("/pricing");
    return true;
  }

  if (err === "free_trial_ended") {
    toast({
      title: "Free period ended",
      description: msg ?? "Upgrade to continue optimizing resumes.",
      variant: "destructive",
    });
    routerPush("/pricing");
    return true;
  }

  if (msg) {
    toast({
      title: "Can't run optimization",
      description: msg,
      variant: "destructive",
    });
    return true;
  }

  toast({
    title: "Can't run optimization",
    description: "Your plan doesn't allow this run right now. See Plans or try again later.",
    variant: "destructive",
  });
  return true;
}
