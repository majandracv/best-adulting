"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FeedbackDialog } from "./feedback-dialog"
import { MessageSquare, Bug, Lightbulb, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function FeedbackWidget() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isExpanded ? (
        <Card className="w-80 shadow-lg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-sm">How can we help?</h3>
              <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="h-6 w-6 p-0">
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2">
              <FeedbackDialog
                defaultType="bug"
                trigger={
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Bug className="w-4 h-4 mr-2" />
                    Report a Bug
                  </Button>
                }
              />

              <FeedbackDialog
                defaultType="feature"
                trigger={
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Request Feature
                  </Button>
                }
              />

              <FeedbackDialog
                defaultType="general"
                trigger={
                  <Button variant="outline" size="sm" className="w-full justify-start bg-transparent">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    General Feedback
                  </Button>
                }
              />
            </div>

            <div className="mt-4 pt-3 border-t">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsVisible(false)}
                className="w-full text-xs text-muted-foreground"
              >
                Hide feedback widget
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button
          onClick={() => setIsExpanded(true)}
          className={cn(
            "rounded-full shadow-lg h-12 w-12 p-0",
            "bg-primary hover:bg-primary/90 text-primary-foreground",
          )}
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
      )}
    </div>
  )
}
