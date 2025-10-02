"use client";

import { Bounded } from "@/components/shared/Bounded";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { HelpAccordion } from "@/components/modules/help/HelpAccordion";

export default function HelpPage() {
  return (
    <Bounded center={false}>
      <div className="flex flex-col gap-6 w-full max-w-4xl mx-auto">
        <div className="flex-1 flex flex-col gap-6">
          <Card className={cn("overflow-hidden")} id="faqs">
            <CardContent className="p-6">
              <h1 className="text-4xl font-bold mb-2">
                Frequently Asked Questions
              </h1>
              <h2 className="my-4 text-muted-foreground">
                Find answers to the most common questions about ACTA.{" "}
                <Link
                  href="https://docs.acta.build"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground text-sm underline hover:text-primary"
                >
                  Have more questions? Check our complete documentation.
                </Link>
              </h2>

              <HelpAccordion />
            </CardContent>
          </Card>

          <Card className={cn("overflow-hidden")}>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-4">Need more help?</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Documentation</h3>
                  <p className="text-muted-foreground mb-2">
                    Check our complete documentation for detailed guides and API
                    references.
                  </p>
                  <Link
                    href="https://docs.acta.build"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Go to documentation →
                  </Link>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Website</h3>
                  <p className="text-muted-foreground mb-2">
                    Visit our official website to learn more about ACTA.
                  </p>
                  <Link
                    href="https://acta.build"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Visit website →
                  </Link>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Contact</h3>
                  <p className="text-muted-foreground mb-2">
                    Have a specific question? Contact us directly.
                  </p>
                  <Link
                    href="mailto:acta.xyz@gmail.com"
                    className="text-primary hover:underline"
                  >
                    acta.xyz@gmail.com →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Bounded>
  );
}
