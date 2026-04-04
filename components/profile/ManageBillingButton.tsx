"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export function ManageBillingButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const openPortal = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast({
          title: "Could not open billing",
          description: data.error || "Try again or contact support.",
          variant: "destructive",
        });
        return;
      }
      if (data.url) window.location.href = data.url;
    } catch {
      toast({ title: "Error", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "w-full rounded-full min-h-10 border-border bg-transparent hover:bg-muted",
        className
      )}
      disabled={loading}
      onClick={openPortal}
    >
      {loading ? (
        <Loader2 className="size-4 mr-2 animate-spin" />
      ) : (
        <CreditCard className="size-4 mr-2" strokeWidth={1.25} />
      )}
      Manage billing
    </Button>
  );
}
